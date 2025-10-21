// @ts-ignore
//import { runRhai } from "https://unpkg.com/rhai-wasm@0.1.0/dist/rhai-wasm.js?url";

import rhai from "../../dist/rhai-wasm.js";

import rhai_script from "./rhai/resolve_model.rhai?raw";

const result = await rhai.run(rhai_script, {
  name: "alice",
  last: "doe",
  age: 30,
  meta: {
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  },
  error: null,
});

document.body.innerHTML = `<pre>${rhai.dict({ quotes: false })(result)}</pre>`;
