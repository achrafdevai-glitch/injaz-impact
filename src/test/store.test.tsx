import { describe, expect, it } from "vitest";
import { applyRedeem, applyReview, INITIAL } from "@/lib/store";

describe("rewards & moderation rules", () => {
  it("approving a pending proof credits the challenge XP, points and hours once", () => {
    // s3 is the pending proof for c4 (350 XP, 180 points, 2 hours)
    const a = applyReview(INITIAL, "s3", true);
    expect(a.xp).toBe(INITIAL.xp + 350);
    expect(a.points).toBe(INITIAL.points + 180);
    expect(a.hours).toBe(INITIAL.hours + 2);
    expect(applyReview(a, "s3", true).xp).toBe(a.xp);
  });

  it("rejecting a proof credits nothing", () => {
    expect(applyReview(INITIAL, "s3", false).points).toBe(INITIAL.points);
  });

  it("redeeming is refused when points are insufficient", () => {
    expect(applyRedeem({ ...INITIAL, points: 100 }, "r1", 400)).toBeNull();
    expect(applyRedeem(INITIAL, "r1", 400)?.points).toBe(INITIAL.points - 400);
  });
});
