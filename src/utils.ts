import type { Awaitable, TypedFlatConfigItem } from './types';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { isPackageExists } from 'local-pkg';

// 将当前模块的 URL 转成文件系统路径，便于在不同运行环境中定位包
const scopeUrl = fileURLToPath(new URL('.', import.meta.url));
// 判断当前工作目录所处的 Node 模块查找范围内是否存在本包
const isCwdInScope = isPackageExists('@senran/eslint-config');

/**
 * 伪造的“空解析器”，在不需要 AST 的场景用于绕过 ESLint 的解析逻辑。
 * 通过返回空的 AST 结构和标记 `services.isPlain = true`，告知调用方这是一个占位解析结果。
 */
export const parserPlain = {
  meta: { name: 'parser-plain' },
  parseForESLint: (code: string) => ({
    ast: {
      body: [],
      comments: [],
      loc: { end: code.length, start: 0 },
      range: [0, code.length],
      tokens: [],
      type: 'Program',
    },
    scopeManager: null,
    services: { isPlain: true },
    visitorKeys: { Program: [] },
  }),
};

/**
 * 将可能为单个配置或配置数组的参数统一展平为一个数组，便于批量处理。
 */
export async function combine(...configs: Awaitable<TypedFlatConfigItem | TypedFlatConfigItem[]>[]): Promise<TypedFlatConfigItem[]> {
  const resolved = await Promise.all(configs);
  return resolved.flat();
}

/**
 * 根据映射表替换规则名称中的插件前缀，用于兼容不同命名空间。
 *
 * @example
 * ```ts
 * import { renameRules } from '@kirklin/eslint-config'
 *
 * export default [{
 *   rules: renameRules(
 *     {
 *       '@typescript-eslint/indent': 'error'
 *     },
 *     { '@typescript-eslint': 'ts' }
 *   )
 * }]
 * ```
 */
export function renameRules(rules: Record<string, any>, map: Record<string, string>): Record<string, any> {
  return Object.fromEntries(
    Object.entries(rules).map(([key, value]) => {
      for (const [from, to] of Object.entries(map)) {
        if (key.startsWith(`${from}/`)) {
          return [to + key.slice(from.length), value];
        }
      }
      return [key, value];
    })
  );
}

/**
 * 批量重命名 Flat Config 中的插件名，保证规则与插件引用保持一致。
 *
 * @example
 * ```ts
 * import { renamePluginInConfigs } from '@kirklin/eslint-config'
 * import someConfigs from './some-configs'
 *
 * export default renamePluginInConfigs(someConfigs, {
 *   '@typescript-eslint': 'ts',
 *   '@stylistic': 'style',
 * })
 * ```
 */
export function renamePluginInConfigs(configs: TypedFlatConfigItem[], map: Record<string, string>): TypedFlatConfigItem[] {
  return configs.map(i => {
    const clone = { ...i };
    if (clone.rules) {
      clone.rules = renameRules(clone.rules, map);
    }
    if (clone.plugins) {
      clone.plugins = Object.fromEntries(
        Object.entries(clone.plugins).map(([key, value]) => {
          if (key in map) {
            return [map[key], value];
          }
          return [key, value];
        })
      );
    }
    return clone;
  });
}

/**
 * 将输入统一包装为数组，便于对外部传参提供灵活写法。
 */
export function toArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

/**
 * 兼容 CommonJS 与 ESM 的默认导出，优先返回 `default` 字段，否则回退到模块本身。
 */
export async function interopDefault<T>(m: Awaitable<T>): Promise<T extends { default: infer U } ? U : T> {
  const resolved = await m;
  return (resolved as any).default || resolved;
}

/**
 * 判断指定包名是否在当前模块范围内可解析，底层依赖 `local-pkg` 的路径解析。
 */
export function isPackageInScope(name: string): boolean {
  return isPackageExists(name, { paths: [scopeUrl] });
}

/**
 * 确认给定依赖是否已安装；在本地交互环境中可提示用户安装缺失依赖。
 * - CI 环境或非交互终端直接跳过，避免阻塞流水线。
 * - 仅在缺失依赖时通过 @clack/prompts 提示安装，提升开发体验。
 */
export async function ensurePackages(packages: (string | undefined)[]): Promise<void> {
  if (process.env.CI || process.stdout.isTTY === false || isCwdInScope === false) {
    return;
  }

  const nonExistingPackages = packages.filter(i => i && !isPackageInScope(i)) as string[];
  if (nonExistingPackages.length === 0) {
    return;
  }

  const p = await import('@clack/prompts');
  // 通过交互式确认，统一处理单个和多个依赖的提示语句
  const result = await p.confirm({
    message: `${nonExistingPackages.length === 1 ? 'Package is' : 'Packages are'} required for this config: ${nonExistingPackages.join(', ')}. Do you want to install them?`,
  });
  if (result) {
    // 动态引入安装工具，避免在无需安装时增加启动开销
    await import('@antfu/install-pkg').then(i => i.installPackage(nonExistingPackages, { dev: true }));
  }
}

/**
 * 判断当前是否处于编辑器触发的 ESLint 运行环境，用于决定是否启用一些特定优化。
 */
export function isInEditorEnv(): boolean {
  if (process.env.CI) {
    return false;
  }
  if (isInGitHooksOrLintStaged()) {
    return false;
  }
  return !!(false || process.env.VSCODE_PID || process.env.VSCODE_CWD || process.env.JETBRAINS_IDE || process.env.VIM || process.env.NVIM);
}

/**
 * 判断当前执行是否源自 Git Hooks 或 lint-staged，避免与编辑器环境混淆。
 */
export function isInGitHooksOrLintStaged(): boolean {
  return !!(false || process.env.GIT_PARAMS || process.env.VSCODE_GIT_COMMAND || process.env.npm_lifecycle_script?.startsWith('lint-staged'));
}
