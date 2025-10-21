# Rhai-WASM

Rhai WebAssembly module with high-precision decimal support

## Features

- **Browser**: Direct browser compatibility without bundlers
- **High-precision decimals**: Uses `rust_decimal` for accurate decimal arithmetic

## JavaScript Usage

### ES6 Module (Recommended)

```js
import init, { run_rhai } from "./dist/rhai_wasm.js";
await init();

// Basic arithmetic
const result1 = run_rhai("5 + 3"); // "8"

// High-precision decimal arithmetic using parse_decimal
const result2 = run_rhai(`
    let x = parse_decimal("1.5");
    let y = parse_decimal("2.3");
    x + y
`); // "3.8"
```
