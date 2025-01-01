import { describe, expect, it } from "vitest";
import { compareSkills } from "@/ai/demo-model";

describe("offline demo model: compareSkills", () => {
  it("scores real overlap between a profile and job requirements", () => {
    const r = compareSkills(["React", "TypeScript", "Tailwind CSS"], ["React", "TypeScript", "GraphQL", "Testing"]);
    expect(r.matched).toEqual(["React", "TypeScript"]);
    expect(r.missing).toEqual(["GraphQL", "Testing"]);
    expect(r.pct).toBe(50);
  });

  it("is case-insensitive", () => {
    expect(compareSkills(["react"], ["React"]).matched).toEqual(["React"]);
  });
});
