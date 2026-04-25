import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Heart } from "lucide-react";
import { AreaDot } from "./area-dot";

describe("AreaDot", () => {
  it("applies muted color when area is not present", () => {
    const { container } = render(
      <AreaDot present={false} hasAlert={false} icon={Heart} label="Saúde" />
    );
    expect(container.firstChild).toHaveClass("text-muted-foreground/30");
  });

  it("applies red color when area is present and has alerts", () => {
    const { container } = render(
      <AreaDot present={true} hasAlert={true} icon={Heart} label="Saúde" />
    );
    expect(container.firstChild).toHaveClass("text-red-500");
  });

  it("applies green color when area is present and has no alerts", () => {
    const { container } = render(
      <AreaDot present={true} hasAlert={false} icon={Heart} label="Saúde" />
    );
    expect(container.firstChild).toHaveClass("text-emerald-500");
  });
});
