import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import { copyFileSync, existsSync, mkdirSync } from 'fs';

// Ensure dist directory exists
if (!existsSync('dist')) {
    mkdirSync('dist');
}

// Copy WASM files manually
try {
    copyFileSync('pkg/rhai_wasm_bg.wasm', 'dist/rhai_wasm_bg.wasm');
    copyFileSync('pkg/rhai_wasm.js', 'dist/rhai_wasm.js');
    copyFileSync('pkg/rhai_wasm.d.ts', 'dist/rhai_wasm.d.ts');
    console.log('✅ Copied WASM files to dist/');
} catch (error) {
    console.error('❌ Failed to copy WASM files:', error.message);
}

export default [
    // ES Module build
    {
        input: 'index.js',
        output: {
            file: 'dist/rhai-wasm.js',
            format: 'es',
            sourcemap: true
        },
        plugins: [
            nodeResolve(),
            terser()
        ],
        external: ['./pkg/rhai_wasm.js']
    },
    // UMD build for browser
    {
        input: 'index.js',
        output: {
            file: 'dist/rhai-wasm.umd.js',
            format: 'umd',
            name: 'RhaiWasm',
            sourcemap: true,
            globals: {
                './pkg/rhai_wasm.js': 'RhaiWasmCore'
            }
        },
        plugins: [
            nodeResolve(),
            terser()
        ],
        external: ['./pkg/rhai_wasm.js']
    }
];
