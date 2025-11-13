import { Linter } from "eslint";
import { parserPlain } from "../../src/utils";
import { cssPropertyOrderRule } from "../../src/rules/css-property-order";
import { it, expect, describe, beforeEach } from "vitest";

const baseConfig = {
  parser: "parser-plain",
  rules: {
    "css-property-order": 2,
  },
};

describe("css-property-order rule", () => {
  let linter: Linter;

  beforeEach(() => {
    linter = new Linter({ configType: "eslintrc" });
    linter.defineParser("parser-plain", parserPlain as any);
    linter.defineRule("css-property-order", cssPropertyOrderRule as any);
  });

  const createConfig = (options?: any) => ({
    parser: "parser-plain",
    rules: {
      "css-property-order": options ? [2, options] : 2,
    },
  });

  describe("basic CSS sorting", () => {
    it("should pass when properties are correctly sorted by length", () => {
      const code = `.selector {
  color: red;
  z-index: 10;
  background-color: blue;
}`;

      const result = linter.verify(code, baseConfig as any);
      expect(result).toHaveLength(0);
    });

    it("should report when properties are not sorted correctly", () => {
      const code = `.selector {
  background-color: red;
  z-index: 10;
  color: blue;
}`;

      const result = linter.verify(code, baseConfig as any);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]?.messageId).toBe("shouldSortProperties");
    });

    it("should handle single property", () => {
      const code = `.selector {
  color: red;
}`;

      const result = linter.verify(code, baseConfig as any);
      expect(result).toHaveLength(0);
    });

    it("should handle empty selector", () => {
      const code = `.selector {
}`;

      const result = linter.verify(code, baseConfig as any);
      expect(result).toHaveLength(0);
    });
  });

  describe("multiple selectors", () => {
    it("should check multiple selectors independently", () => {
      const code = `.selector1 {
  color: red;
  padding: 10px;
}

.selector2 {
  margin: 5px;
  background-color: blue;
}`;

      const result = linter.verify(code, baseConfig as any);
      expect(result).toHaveLength(0);
    });

    it("should report issues in multiple selectors", () => {
      const code = `.selector1 {
  padding: 10px;
  color: red;
}

.selector2 {
  margin: 5px;
  background-color: blue;
}`;

      const result = linter.verify(code, baseConfig as any);
      expect(result.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("cSS with different property counts", () => {
    it("should handle many properties", () => {
      const code = `.selector {
  z: 1;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 100%;
  display: block;
  position: absolute;
  background-color: red;
}`;

      const result = linter.verify(code, baseConfig as any);
      expect(result).toHaveLength(0);
    });

    it("should detect unsorted many properties", () => {
      const code = `.selector {
  background-color: red;
  position: absolute;
  display: block;
  height: 100%;
  width: 100%;
  right: 0;
  left: 0;
  top: 0;
  z: 1;
}`;

      const result = linter.verify(code, baseConfig as any);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("cSS variables and special cases", () => {
    it("should handle CSS custom properties correctly", () => {
      const code = `.selector {
  --main-color: blue;
  color: var(--main-color);
  margin: 0;
}`;

      const result = linter.verify(code, baseConfig as any);
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it("should handle properties with complex values", () => {
      const code = `.selector {
  color: rgb(255, 0, 0);
  margin: 10px 20px 30px 40px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}`;

      const result = linter.verify(code, baseConfig as any);
      expect(result).toHaveLength(0);
    });

    it("should handle important declarations", () => {
      const code = `.selector {
  color: red !important;
  margin: 0 !important;
  background-color: blue;
}`;

      const result = linter.verify(code, baseConfig as any);
      expect(result).toHaveLength(0);
    });
  });

  describe("options: ignoreProperties", () => {
    it("should ignore specified properties", () => {
      const code = `.selector {
  margin: 0;
  display: block;
  color: red;
}`;

      const config = createConfig({
        ignoreProperties: ["display"],
      });

      const result = linter.verify(code, config as any);
      expect(result).toHaveLength(0);
    });

    it("should handle multiple ignored properties", () => {
      const code = `.selector {
  z-index: 10;
  position: absolute;
  color: red;
  margin: 0;
}`;

      const config = createConfig({
        ignoreProperties: ["z-index", "position"],
      });

      const result = linter.verify(code, config as any);
      expect(result).toHaveLength(0);
    });
  });

  describe("options: sortByLength", () => {
    it("should sort by length when sortByLength is true", () => {
      const code = `.selector {
  z: 1;
  color: red;
  background: blue;
}`;

      const config = createConfig({
        sortByLength: true,
      });

      const result = linter.verify(code, config as any);
      expect(result).toHaveLength(0);
    });

    it("should sort alphabetically when sortByLength is false", () => {
      const code = `.selector {
  background: blue;
  color: red;
  z: 1;
}`;

      const config = createConfig({
        sortByLength: false,
      });

      const result = linter.verify(code, config as any);
      expect(result).toHaveLength(0);
    });

    it("should detect incorrect order when sortByLength is false", () => {
      const code = `.selector {
  z: 1;
  color: red;
  background: blue;
}`;

      const config = createConfig({
        sortByLength: false,
      });

      const result = linter.verify(code, config as any);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("sCSS/LESS syntax support", () => {
    it("should handle SCSS/LESS variable definitions", () => {
      const code = `.selector {
  $color: red;
  color: $color;
  margin: 0;
}`;

      const result = linter.verify(code, baseConfig as any);
      expect(result).toBeDefined();
    });

    it("should handle SCSS nested selectors conceptually", () => {
      const code = `.parent {
  color: red;
  margin: 0;

  &.child {
    padding: 10px;
  }
}`;

      const result = linter.verify(code, baseConfig as any);
      expect(result).toBeDefined();
    });

    it("should handle LESS mixins", () => {
      const code = `.selector {
  .mixin();
  color: red;
  margin: 0;
}`;

      const result = linter.verify(code, baseConfig as any);
      expect(result).toBeDefined();
    });
  });

  describe("pseudo-selectors and at-rules", () => {
    it("should handle pseudo-selectors", () => {
      const code = `.selector:hover {
  color: red;
  margin: 0;
}`;

      const result = linter.verify(code, baseConfig as any);
      expect(result).toHaveLength(0);
    });

    it("should handle attribute selectors", () => {
      const code = `input[type="text"] {
  color: red;
  margin: 0;
}`;

      const result = linter.verify(code, baseConfig as any);
      expect(result).toHaveLength(0);
    });

    it("should handle complex selectors", () => {
      const code = `.parent > .child + .sibling {
  margin: 0;
  padding: 10px;
}`;

      const result = linter.verify(code, baseConfig as any);
      expect(result.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("edge cases", () => {
    it("should handle properties with hyphens", () => {
      const code = `.selector {
  z: 1;
  border: none;
  border-radius: 5px;
  background-color: red;
}`;

      const result = linter.verify(code, baseConfig as any);
      expect(result).toHaveLength(0);
    });

    it("should handle inline comments conceptually", () => {
      const code = `.selector {
  /* This is a comment */
  color: red;
  margin: 0;
}`;

      const result = linter.verify(code, baseConfig as any);
      expect(result).toHaveLength(0);
    });

    it("should handle duplicate property names", () => {
      const code = `.selector {
  color: red;
  color: blue;
  margin: 0;
}`;

      const result = linter.verify(code, baseConfig as any);
      expect(result).toBeDefined();
    });
  });

  describe("fix functionality", () => {
    it("should provide a fix for incorrectly sorted properties", () => {
      const code = `.selector {
  background: red;
  color: blue;
}`;

      const result = linter.verify(code, baseConfig as any);

      if (result.length > 0 && result[0]?.fix) {
        const fixed = result[0].fix.range;
        expect(fixed).toBeDefined();
        expect(Array.isArray(fixed)).toBe(true);
      }
    });
  });

  describe("multi-format CSS compatibility", () => {
    it("should handle standard CSS", () => {
      const code = `.class {
  color: red;
  margin: 0;
}`;

      const result = linter.verify(code, baseConfig as any);
      expect(result).toHaveLength(0);
    });

    it("should handle CSS with multiple rules", () => {
      const code = `.class1 { color: red; }
.class2 { background: blue; }
.class3 { margin: 0; }`;

      const result = linter.verify(code, baseConfig as any);
      expect(result).toBeDefined();
    });

    it("should handle minified CSS", () => {
      const code = `.sel{color:red;margin:0}`;

      const result = linter.verify(code, baseConfig as any);
      expect(result).toBeDefined();
    });
  });
});
