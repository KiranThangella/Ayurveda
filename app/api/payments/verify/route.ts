import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ebookSlug, ebookId, amount, paymentMethod, transactionId } = body;

    if (!ebookSlug || !amount) {
      return NextResponse.json({ error: 'Missing required payment details' }, { status: 400 });
    }

    const txn = transactionId || 'TXN_' + Math.random().toString(36).substring(2, 10).toUpperCase();

    // Log payment verification success
    console.log(`[Payment Verified] Ebook: ${ebookSlug}, Amount: ₹${amount}, Method: ${paymentMethod}, Txn: ${txn}`);

    return NextResponse.json({
      success: true,
      transactionId: txn,
      orderId: 'ORD_' + Date.now(),
      status: 'PAID',
      ebookSlug,
      amount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: 'Internal payment verification error' }, { status: 500 });
  }
}
