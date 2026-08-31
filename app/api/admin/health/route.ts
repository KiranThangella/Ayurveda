import { NextRequest, NextResponse } from 'next/server';
import { getProvidersHealthSummary, testProviderHealth, PROVIDER_ORDER } from '@/lib/ai/providers';

function getEnv(key: string): string | undefined {
  return process.env[key];
}

export async function GET() {
  try {
    const summary = getProvidersHealthSummary(getEnv);
    return NextResponse.json({
      success: true,
      providers: summary,
      timestamp: new Date().toISOString(),
      summaryCounts: {
        total: summary.length,
        configured: summary.filter((p) => p.isConfigured).length,
        healthy: summary.filter((p) => p.lastStatus === 'healthy').length,
        error: summary.filter((p) => p.lastStatus === 'error').length,
        untested: summary.filter((p) => p.isConfigured && p.lastStatus === 'untested').length,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action = 'test-all', providerName, testPrompt } = body;

    if (action === 'test-one' && providerName) {
      const result = await testProviderHealth(providerName, getEnv, testPrompt);
      const summary = getProvidersHealthSummary(getEnv);
      return NextResponse.json({
        success: true,
        testResult: result,
        providers: summary,
      });
    }

    // test-all: test all configured providers in parallel
    const configured = PROVIDER_ORDER.filter((p) => {
      const key = getEnv(p.apiKeyEnv);
      return Boolean(key && key.trim().length > 0);
    });

    if (configured.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No AI providers have API keys configured in the environment.',
        providers: getProvidersHealthSummary(getEnv),
      });
    }

    const results = await Promise.allSettled(
      configured.map((p) => testProviderHealth(p.name, getEnv, testPrompt))
    );

    const testResults = results.map((r, i) => {
      if (r.status === 'fulfilled') return r.value;
      return {
        success: false,
        latencyMs: 0,
        error: r.reason instanceof Error ? r.reason.message : String(r.reason),
        provider: configured[i].name,
      };
    });

    const summary = getProvidersHealthSummary(getEnv);

    return NextResponse.json({
      success: true,
      testResults,
      providers: summary,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
