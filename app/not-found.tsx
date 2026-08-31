import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h2 className="text-3xl font-bold font-display text-primary mb-2">404 - Page Not Found</h2>
      <p className="text-sm text-muted-foreground mb-6">The page or resource you are looking for does not exist.</p>
      <Link
        href="/"
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
      >
        Return Home
      </Link>
    </div>
  );
}
