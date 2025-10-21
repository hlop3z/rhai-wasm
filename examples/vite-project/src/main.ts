// @ts-ignore
//import { runRhai } from "https://unpkg.com/rhai-wasm@0.1.0/dist/rhai-wasm.js?url";

import { runRhai } from "./dist/rhai-wasm.js";

import rhai_script from "./rhai/resolve_model.rhai?raw";

const result = await runRhai(rhai_script);

console.log(result);
