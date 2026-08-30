import EbookDetailClient from './ebook-detail-client';

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <EbookDetailClient slug={slug} />;
}
