import type { TypedFlatConfigItem } from '../types';
import { GLOB_EXCLUDE } from '../globs';

/**
 * 聚合默认忽略目录（构建产物、缓存等）并允许用户补充自定义忽略项。
 */
export async function ignores(userIgnores: string[] = []): Promise<TypedFlatConfigItem[]> {
  return [
    {
      name: 'senran/ignores',
      ignores: [...GLOB_EXCLUDE, ...userIgnores],
    },
  ];
}
