import { BrandLockup } from "./brand-lockup";

export function AppLoading({
  message = "Loading ScheduleBud…",
}: {
  message?: string;
}) {
  return (
    <main className="sb-app-loading flex min-h-svh flex-col items-center justify-center gap-6 bg-background px-6 py-10 text-center">
      <div className="sb-loader-scene">
        <div aria-hidden="true" className="sb-loader-art">
          <div className="sb-loader-glow" />
          {["blue", "mint", "lilac"].map((palette) => (
            <div
              key={palette}
              className={`sb-loader-wallpaper sb-loader-${palette}`}
            >
              <div className="sb-loader-sheet">
                <div className="sb-loader-heading" />
                <div className="sb-loader-grid">
                  {Array.from({ length: 9 }, (_, cell) => (
                    <span key={cell} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="sb-loader-brand">
          <span aria-hidden="true" className="sb-loader-sheen" />
          <BrandLockup descriptor />
        </div>
      </div>
      <div
        role="status"
        className="flex items-center justify-center gap-3 text-sm font-medium text-text-secondary"
      >
        <span>{message}</span>
        <span aria-hidden="true" className="sb-loader-dots">
          <span />
          <span />
          <span />
        </span>
      </div>
    </main>
  );
}
