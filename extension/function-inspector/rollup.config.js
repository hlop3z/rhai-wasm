import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
    input: 'src/main.js',
    output: {
        file: 'dist/inspect.js',
        format: 'iife', // Immediately-invoked for browser
        name: 'inspect', // global variable name in browser
    },
    plugins: [resolve(), commonjs()],
};
