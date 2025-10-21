// ===========================
// Utilities
// ===========================

/**
 * Get all own properties of an object that are functions
 * @param {object} obj
 * @returns {object} { key: function }
 */
const getOwnCallables = (obj) =>
  Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => typeof value === "function")
  );

/**
 * Extract the body of a function as string
 * Works for regular, async, arrow, and concise functions
 * @param {Function|string} fn
 * @returns {string|null}
 */
const extractFunctionBody = (fn) => {
  const code = typeof fn === "function" ? fn.toString() : fn;
  const regex =
    /^(?:async\s*)?(?:function(?:\s*\w*)?|\([\w\s,]*\)|\w+|\([\w\s,]*\)\s*=>|\w+\s*=>)\s*(?:\{([\s\S]*)\}|=>\s*([\s\S]*))$/;
  const match = code.trim().match(regex);
  if (!match) return null;

  let body = match[1] || match[2] || "";
  body = body.replace(/^\s*\{/, "").replace(/\}\s*$/, "").trim();
  return body.endsWith(";") ? body.slice(0, -1) : body;
};

/**
 * Format code using Prettier (browser standalone)
 * @param {string|Function} code
 * @returns {Promise<string>}
 */
const formatCode = async (code) =>
  prettier.format(code.toString(), {
    parser: "babel",
    plugins: prettierPlugins,
    semi: true,
  });

// ===========================
// Constants / Code Templates
// ===========================

const CODE_TYPES = `
const model = {};

const field = {
  Boolean: { value: "boolean" },
  Int: { value: "int" },
  Int64: { value: "int64" },
  Float: { value: "float" },
  String: { value: "string" },
  Text: { value: "text" },
  Decimal: { value: "decimal" },
  Base64: { value: "base64" },
  Binary: { value: "binary" },
  DateTime: { value: "datetime" },
  Date: { value: "date" },
  Time: { value: "time" },
  ID: { value: "id" },
  UUID: { value: "uuid" },
  Many: { value: "many" },
  List: { value: "list" },
  Type: { value: "type" },
};
`;

const CODE = {
  FUNCTION: `
const Model = {
  id: field.ID,
  key: field.Base64,
  name: field.String,
  last: field.String,
  full_name: (self) => self.name + " " + self.last,
};
`.trim(),
};

// ===========================
// Main Processing Function
// ===========================

/**
 * Process model functions: formats and extracts their bodies
 * @param {object} model
 * @returns {Promise<object>} formatted methods
 */
const processModelFunctions = async (model) => {
  const callables = getOwnCallables(model);

  const methods = {};
  for (const [key, fn] of Object.entries(callables)) {
    const formatted = await formatCode(fn);
    const body = extractFunctionBody(formatted);
    methods[`@${key}`] = `|self| { ${body} },`;
  }

  return methods;
};

// ===========================
// Run Example
// ===========================
async function signatureJSON(code) {
  const model = new Function(
    CODE_TYPES + code.replace("const Model = ", "return ")
  )();

  const methods = await processModelFunctions(model);

  return JSON.stringify({ ...model, ...methods }, null, 2);
}



(async () => {
  // Dynamically create model from string templates
  const json = await signatureJSON(CODE.FUNCTION);
  console.log(json);
})();
