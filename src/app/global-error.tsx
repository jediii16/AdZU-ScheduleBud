"use client";

export default function GlobalError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <head>
        <title>Something went wrong — ScheduleBud</title>
      </head>
      <body
        style={{
          margin: 0,
          background: "#f7f9fc",
          color: "#182335",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <style>{`a,button{display:inline-flex;align-items:center;justify-content:center;min-height:44px;border:1px solid #bcc8d6;border-radius:8px;padding:0 20px;background:white;color:#182335;font:inherit;text-decoration:none;cursor:pointer}a:focus-visible,button:focus-visible{outline:3px solid #007cff;outline-offset:4px}`}</style>
        <main
          style={{
            minHeight: "100vh",
            boxSizing: "border-box",
            display: "grid",
            placeItems: "center",
            padding: "32px 24px",
          }}
        >
          <div style={{ maxWidth: 480, textAlign: "center" }}>
            <p style={{ fontSize: 24, fontWeight: 800 }}>
              Schedule<span style={{ color: "#007cff" }}>Bud</span>
            </p>
            <h1>Something went wrong</h1>
            <p>
              ScheduleBud couldn&apos;t load this page. Try again, or return to
              Home.
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: 12,
                marginTop: 28,
              }}
            >
              <button type="button" onClick={retry}>
                Try again
              </button>
              {/* Reload the document rather than reusing a failed root/router. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/">Back to Home</a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
