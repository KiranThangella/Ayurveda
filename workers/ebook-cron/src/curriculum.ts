// Re-exports the single source of truth (project/lib/data/curriculum.ts) so this
// Worker and the Next.js admin UI can never drift apart on topics/mustCover lists.
// It's pure data/types with zero Next.js-specific imports, so esbuild/Wrangler
// bundles it cleanly.
export * from '../../../lib/data/curriculum';
