import { describe, expect, it } from "vitest";
import { estimateYears, jobFromDoc, skillOverlap, splitSkills } from "@/lib/career";

describe("splitSkills", () => {
  it("splits comma, semicolon and newline lists and trims blanks", () => {
    expect(splitSkills("React, TypeScript;Node.js\n\n SQL ")).toEqual(["React", "TypeScript", "Node.js", "SQL"]);
    expect(splitSkills(["Go", " Kafka "])).toEqual(["Go", "Kafka"]);
    expect(splitSkills(undefined)).toEqual([]);
  });
});

describe("estimateYears", () => {
  it("measures from the earliest year to the latest (or today)", () => {
    expect(estimateYears("Acme (2015–2019)\nBeta (2019–2021)")).toBe(6);
    expect(estimateYears("Acme (2020–present)")).toBe(new Date().getFullYear() - 2020);
    expect(estimateYears("no dates here")).toBe(0);
  });
});

describe("skillOverlap", () => {
  it("matches case- and punctuation-insensitively, including prefixes", () => {
    const r = skillOverlap("react.js, TypeScript, node", "React, TypeScript, Node.js, GraphQL");
    expect(r.matched).toEqual(["React", "TypeScript", "Node.js"]);
    expect(r.missing).toEqual(["GraphQL"]);
    expect(r.pct).toBe(75);
  });

  it("does not let tiny tokens match everything", () => {
    const r = skillOverlap("C", "C#, Go");
    expect(r.matched).toEqual([]);
  });

  it("returns 0% when the job lists no skills", () => {
    expect(skillOverlap("React", "").pct).toBe(0);
  });
});

describe("jobFromDoc", () => {
  it("normalises an opportunity document", () => {
    const job = jobFromDoc("j1", {
      title: "Frontend Engineer",
      employerName: "Northwind",
      description: "Build UIs",
      rolesAndResponsibilities: "Ship features",
      skills: "React, CSS",
      location: "Remote",
    });
    expect(job).toMatchObject({ id: "j1", company: "Northwind", skills: ["React", "CSS"], location: "Remote" });
    expect(job.description).toContain("Ship features");
  });
});
