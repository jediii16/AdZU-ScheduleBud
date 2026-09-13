import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import ErrorPage from "@/app/error";
import NotFound from "@/app/not-found";

describe("launch route fallbacks", () => {
  it("offers recovery without displaying technical error details", () => {
    function Recovery() {
      const [recovered, setRecovered] = useState(false);
      return recovered ? (
        <p>Recovered page</p>
      ) : (
        <ErrorPage
          error={new Error("private technical detail")}
          retry={() => setRecovered(true)}
        />
      );
    }
    render(<Recovery />);
    expect(screen.queryByText(/private technical detail/)).toBeNull();
    expect(screen.getByRole("link", { name: "Back to Home" })).toHaveAttribute(
      "href",
      "/",
    );
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(screen.getByText("Recovered page")).toBeVisible();
  });

  it("offers Home on unknown routes without a nonfunctional retry action", () => {
    render(<NotFound />);
    expect(screen.getByRole("link", { name: "Back to Home" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
  });
});
