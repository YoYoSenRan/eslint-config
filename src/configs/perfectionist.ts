import type { TypedFlatConfigItem } from "../types";

import { pluginPerfectionist } from "../plugin";

/**
 * 使用 `eslint-plugin-perfectionist` 统一排序导入导出、命名符号，避免因顺序差异造成噪声。
 *
 * @see https://github.com/azat-io/eslint-plugin-perfectionist
 */
export async function perfectionist(): Promise<TypedFlatConfigItem[]> {
  return [
    {
      name: "senran/perfectionist/setup",
      plugins: {
        perfectionist: pluginPerfectionist,
      },
      rules: {
        // --- 统一导出/导入/命名符号的排序，减少 diff 噪声 ---
        "perfectionist/sort-exports": ["error", { order: "asc", type: "natural" }], // 导出对象自然排序
        "perfectionist/sort-imports": [
          "error",
          {
            groups: ["type", ["parent-type", "sibling-type", "index-type", "internal-type"], "builtin", "external", "internal", ["parent", "sibling", "index"], "side-effect", "object", "unknown"],
            newlinesBetween: "ignore",
            order: "asc",
            type: "natural",
          },
        ], // import 分组排序
        "perfectionist/sort-named-exports": ["error", { order: "asc", type: "natural" }], // 命名导出排序
        "perfectionist/sort-named-imports": ["error", { order: "asc", type: "natural" }], // 命名导入排序
      },
    },
  ];
}
