export default function createStringifier({ quotes = false, none = "()", suffix = ";" } = {}) {
  function objectToRhai(value, indent = 0, seen = new WeakSet()) {
    const pad = "  ".repeat(indent);

    if (value === null) return none;
    if (typeof value === "string") return JSON.stringify(value);
    if (typeof value === "number" || typeof value === "boolean")
      return String(value);
    if (typeof value === "undefined") return none; // mimic JSON.stringify

    if (typeof value === "symbol") return JSON.stringify(value.toString());
    if (typeof value === "function") return '"[Function]"';
    if (typeof value === "bigint") return value.toString();

    if (seen.has(value)) throw new TypeError("Circular reference detected");
    if (typeof value === "object") seen.add(value);

    if (Array.isArray(value)) {
      const items = value.map((v) => objectToRhai(v, indent + 1, seen));
      const joined = items.length
        ? "\n" +
        "  ".repeat(indent + 1) +
        items.join(",\n" + "  ".repeat(indent + 1)) +
        "\n" +
        pad
        : "";
      seen.delete(value);
      return `[${joined}]`;
    }

    // plain object
    const entries = Object.keys(value)
      .sort()
      .map((key) => {
        const k = quotes ? JSON.stringify(key) : key;
        return `${"  ".repeat(indent + 1)}${k}: ${objectToRhai(
          value[key],
          indent + 1,
          seen
        )}`;
      })
      .join(",\n");

    seen.delete(value);
    return `#{\n${entries}\n${pad}}`;
  }
  // return the stringifier function
  return (value) => `${objectToRhai(value)}${suffix}`;
}
