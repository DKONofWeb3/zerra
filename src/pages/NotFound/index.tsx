import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="max-w-2xl py-24">
      <div className="text-label-xs uppercase tracking-wider text-fg-muted">
        404
      </div>
      <h1 className="mt-3 font-display text-display-lg font-medium tracking-tight">
        This page doesn't exist
      </h1>
      <p className="mt-4 text-fg-secondary text-[15px]">
        The page you're looking for has been moved, deleted, or never existed.
      </p>
      <Link
        to="/"
        className="inline-block mt-8 pill-surface px-5 h-11 grid place-items-center text-[14px] hover:border-stroke-strong transition-colors"
      >
        ← Back to Dashboard
      </Link>
    </div>
  );
}
