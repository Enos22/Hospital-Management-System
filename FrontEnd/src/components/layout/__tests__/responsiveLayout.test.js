import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const stylesheet = readFileSync(resolve(process.cwd(), "src/styles.css"), "utf8");

describe("responsive portal layout", () => {
  it("hides desktop navigation and shows the mobile menu below the breakpoint", () => {
    expect(stylesheet).toMatch(/\.sidebar\s*\{[^}]*display:\s*none/s);
    expect(stylesheet).toMatch(/\.mobile-navigation\s*\{[^}]*display:\s*none/s);
    expect(stylesheet).toMatch(
      /@media\s*\(max-width:\s*900px\)\s*\{[\s\S]*?\.mobile-navigation\s*\{[^}]*display:\s*flex/s,
    );
    expect(stylesheet).toMatch(
      /@media\s*\(max-width:\s*900px\)\s*\{[\s\S]*?\.sidebar\s*\{[^}]*display:\s*none/s,
    );
  });
});
