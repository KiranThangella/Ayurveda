import HerbDetailClient from './herb-detail-client';

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <HerbDetailClient slug={slug} />;
}
