import { runRhai } from "./index.js";

// Test utilities
function test(name, testFn) {
  return { name, testFn };
}

function runTest(test) {
  try {
    const result = test.testFn();
    if (result instanceof Promise) {
      return result.then(
        (value) => ({ name: test.name, passed: true, result: value }),
        (error) => ({ name: test.name, passed: false, error: error.message })
      );
    } else {
      return { name: test.name, passed: true, result };
    }
  } catch (error) {
    return { name: test.name, passed: false, error: error.message };
  }
}

async function runAllTests() {
  console.log("🧪 Running rhai-wasm tests...\n");

  const tests = [
    // Basic arithmetic tests
    test("Basic addition", () => runRhai("5 + 3")),
    test("Basic subtraction", () => runRhai("10 - 4")),
    test("Basic multiplication", () => runRhai("6 * 7")),
    test("Basic division", () => runRhai("15 / 3")),
    test("Complex arithmetic", () => runRhai("(2 + 3) * 4 - 1")),

    // Decimal precision tests
    test("Decimal addition", () => runRhai(`
      let x = parse_decimal("1.5");
      let y = parse_decimal("2.3");
      x + y
    `)),
    test("Decimal multiplication", () => runRhai(`
      let x = parse_decimal("0.1");
      let y = parse_decimal("0.2");
      x * y
    `)),
    test("High precision decimal", () => runRhai(`
      let x = parse_decimal("0.123456789");
      let y = parse_decimal("0.987654321");
      x + y
    `)),

    // String operations
    test("String concatenation", () => runRhai('"Hello" + " " + "World"')),
    test("String length", () => runRhai('"Hello World".len')),
    test("String indexing", () => runRhai('"Hello"[0]')),

    // Variable assignments and expressions
    test("Variable assignment", () => runRhai(`
      let x = 42;
      let y = x * 2;
      y
    `)),
    test("Multiple variables", () => runRhai(`
      let a = 10;
      let b = 20;
      let c = a + b;
      c
    `)),

    // Error handling tests
    test("Invalid syntax", () => runRhai("invalid syntax here")),
    test("Undefined variable", () => runRhai("undefined_variable + 1")),
    test("Division by zero", () => runRhai("1 / 0")),

    // Boolean operations
    test("Boolean true", () => runRhai("true")),
    test("Boolean false", () => runRhai("false")),
    test("Boolean comparison", () => runRhai("5 > 3")),
    test("Boolean equality", () => runRhai("5 == 5")),

    // Array operations
    test("Array creation", () => runRhai("[1, 2, 3, 4, 5]")),
    test("Array indexing", () => runRhai("[10, 20, 30][1]")),
    test("Array length", () => runRhai("[1, 2, 3].len")),

    // Conditional expressions
    test("If expression", () => runRhai(`
      if 5 > 3 {
        "greater"
      } else {
        "smaller"
      }
    `)),
    test("Ternary-like expression", () => runRhai(`
      let x = 10;
      if x > 5 { "big" } else { "small" }
    `))
  ];

  const results = [];
  
  for (const test of tests) {
    const result = await runTest(test);
    results.push(result);
    
    const status = result.passed ? "✅" : "❌";
    const output = result.passed ? result.result : result.error;
    console.log(`${status} ${result.name}: ${output}`);
  }

  // Summary
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  console.log(`\n📊 Test Summary: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log("🎉 All tests passed!");
  } else {
    console.log("⚠️  Some tests failed. Check the output above for details.");
  }
}

// Run the tests
runAllTests().catch(console.error);
