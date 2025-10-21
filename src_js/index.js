import init, { run_rhai } from "../dist/rhai_wasm.js";
export { get_version as getVersion } from "../dist/rhai_wasm.js";

let initialized = false;
let initPromise = null;

/**
 * Ensure the WASM module is initialized
 * @private
 */
async function ensureInit() {
  if (!initialized) {
    if (!initPromise) {
      initPromise = init();
    }
    await initPromise;
    initialized = true;
  }
}

/**
 * Run Rhai script code with auto-initialization
 * @param {string} code - The Rhai script code to evaluate
 * @param {string} [json_input] - Optional JSON string to be made available as `request` variable in the script
 * @returns {Promise<string>} The result as a string, or error message if evaluation fails
 */
export async function runRhai(code, json_input) {
  await ensureInit();
  const result = run_rhai(code, JSON.stringify(json_input));
  return JSON.parse(result);
}

// Export the original WASM functions for advanced usage
import dictToRhai from "./object_to_rhai.js";
export default {
  run: runRhai,
  dict: dictToRhai
};
