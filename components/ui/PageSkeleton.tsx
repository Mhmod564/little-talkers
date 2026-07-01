/**
 * Instant loading placeholder shown (via a route `loading.tsx`) while a section's
 * server component fetches data. The layout/sidebar stays put, so navigation
 * feels immediate instead of frozen. Pure presentational, no data.
 */
export function PageSkeleton() {
  return (
    <div className="skel-wrap" aria-busy="true" aria-live="polite">
      {Array.from({ length: 4 }).map((_, i) => (
        <div className="card skel-card" key={i}>
          <div className="skel skel-line w40" />
          <div className="skel skel-line" />
          <div className="skel skel-line w70" />
        </div>
      ))}
    </div>
  );
}
