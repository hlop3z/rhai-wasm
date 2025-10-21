import init, { run_rhai } from "./dist/rhai_wasm.js";

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
 * @returns {Promise<string>} The result as a string, or error message if evaluation fails
 */
export async function runRhai(code) {
  await ensureInit();
  return run_rhai(code);
}

/**
 * Synchronous version that returns a promise
 * @param {string} code - The Rhai script code to evaluate
 * @returns {Promise<string>} The result as a string, or error message if evaluation fails
 */
export function runRhaiSync(code) {
  return runRhai(code);
}

// Export the original WASM functions for advanced usage
export { run_rhai, init };
