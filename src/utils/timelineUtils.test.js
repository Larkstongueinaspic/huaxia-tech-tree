import {
  computeEraTimelinePositions,
  getActiveEraIndex,
  mergeEraBackgrounds,
} from "./timelineUtils";

const timelineConfig = [
  { name: "甲", start: 0, end: 100, scale: 1, color: "#111", lightColor: "#eee" },
  { name: "乙", start: 100, end: 200, scale: 1, color: "#222", lightColor: "#ddd" },
  { name: "丙", start: 200, end: 300, scale: 2, color: "#333", lightColor: "#ccc" },
];

describe("timelineUtils", () => {
  test("computes stable weighted era positions", () => {
    const positions = computeEraTimelinePositions(timelineConfig);

    expect(positions).toHaveLength(3);
    expect(positions[0].x1).toBe(60);
    expect(positions[0].x2).toBeGreaterThan(positions[0].x1);
    expect(positions[1].x1).toBe(positions[0].x2);
    expect(positions[2].width).toBeGreaterThan(positions[1].width);
  });

  test("switches when an era left edge reaches the configured trigger", () => {
    const positions = computeEraTimelinePositions(timelineConfig);
    const secondEraPanX = 600 - positions[1].x1;

    expect(getActiveEraIndex(positions, secondEraPanX + 1, 1, 600)).toBe(0);
    expect(getActiveEraIndex(positions, secondEraPanX, 1, 600)).toBe(1);
  });

  test("merges frontend fallback backgrounds without mutating timeline data", () => {
    const merged = mergeEraBackgrounds(timelineConfig, {
      "甲": {
        image: "/custom-a.jpg",
        position: "left top",
      },
    });

    expect(merged[0].background.image).toBe("/custom-a.jpg");
    expect(merged[0].background.position).toBe("left top");
    expect(merged[1].background.image).toBeTruthy();
    expect(timelineConfig[0].background).toBeUndefined();
  });
});
