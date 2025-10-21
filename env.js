// Mock env module for Node.js compatibility
// This provides the required functions that the WASM module expects

module.exports = {
  // Provide a mock 'now' function for timestamps
  now: () => Date.now()
};