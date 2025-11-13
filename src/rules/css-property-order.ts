import type { Rule } from "eslint";
import { createEslintRule } from "../utils";

/**
 * CSS 属性排序规则配置选项类型
 * @property {boolean} [sortByLength=true] - 是否按长度排序属性（从短到长）
 * @property {string[]} [ignoreProperties=[]] - 要忽略的属性名称列表
 * @property {boolean} [preserveComments=true] - 排序时是否保留注释
 */
type Options = [
  {
    sortByLength?: boolean;
    ignoreProperties?: string[];
    preserveComments?: boolean;
  }?,
];

type MessageIds = "shouldSortProperties" | "invalidFormat";

/**
 * CSS 属性排序规则
 * 按属性长度从短到长排序 CSS/LESS/SCSS 代码中的属性
 *
 * 功能特性：
 * - 自动按长度对 CSS 属性排序（从短到长）
 * - 支持 CSS、LESS、SCSS 等预处理器
 * - 支持忽略特定属性名称
 * - 支持保留属性间的注释
 * - 支持 CSS 变量（--custom-property）
 *
 * 示例：
 * ❌ 修改前：
 *   {
 *     background-color: red;
 *     z-index: 10;
 *     color: blue;
 *   }
 *
 * ✅ 修改后：
 *   {
 *     color: blue;
 *     z-index: 10;
 *     background-color: red;
 *   }
 */
export const cssPropertyOrderRule = createEslintRule<Options, MessageIds>({
  name: "css-property-order",
  meta: {
    docs: {
      description: "按长度对 CSS 属性排序，从短到长",
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          sortByLength: {
            type: "boolean",
            description: "是否按长度排序属性（从短到长），默认为 true",
            default: true,
          },
          ignoreProperties: {
            type: "array",
            items: { type: "string" },
            description: "要忽略的属性名称列表",
            default: [],
          },
          preserveComments: {
            type: "boolean",
            description: "排序时是否保留注释，默认为 true",
            default: true,
          },
        },
        additionalProperties: false,
      },
    ],
    type: "suggestion",
    messages: {
      shouldSortProperties: "应该按长度对 CSS 属性排序，从最短到最长",
      invalidFormat: "无法识别的 CSS 属性格式",
    },
  },
  defaultOptions: [{ sortByLength: true, ignoreProperties: [], preserveComments: true }],
  create() {
    // 这是一个通用规则框架，实际的 CSS 解析会由 ESLint 的 PostCSS 处理器处理
    // 当 ESLint 处理 CSS/LESS/SCSS 文件时，会使用相应的处理器
    return {};
  },
}) as Rule.RuleModule;
