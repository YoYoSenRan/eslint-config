import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

export default [
	{
		// 主构建：输出 CJS 版本 JS
		input: 'src/index.ts',
		output: {
			file: 'dist/index.js',
			format: 'cjs'
		},
		plugins: [typescript()]
	},
	{
		// 声明构建：Rollup 专门生成 dist/index.d.ts
		input: 'src/index.ts',
		output: {
			file: 'dist/index.d.ts',
			format: 'es'
		},
		plugins: [dts()]
	}
];
