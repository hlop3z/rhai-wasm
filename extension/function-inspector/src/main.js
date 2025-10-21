import parser from '@babel/parser';

/**
 * Convert MemberExpression to dotted string
 */
function memberExpressionToString(node) {
  if (node.type === 'Identifier') return node.name;
  if (node.type === 'MemberExpression') {
    const objectStr = memberExpressionToString(node.object);
    if (!objectStr) return null;
    const propertyStr = node.property.type === 'Identifier' ? node.property.name : null;
    return propertyStr ? `${objectStr}.${propertyStr}` : null;
  }
  return null;
}

/**
 * Convert AST node to JS value or $ref
 */
function astToValue(node) {
  switch (node.type) {
    case 'StringLiteral':
    case 'NumericLiteral':
    case 'BooleanLiteral':
      return node.value;

    case 'ArrayExpression':
      return node.elements.map(el => astToValue(el));

    case 'ObjectExpression':
      const obj = {};
      node.properties.forEach(prop => {
        const key = prop.key.name || prop.key.value;
        obj[key] = astToValue(prop.value);
      });
      return obj;

    case 'MemberExpression':
      const ref = memberExpressionToString(node);
      return ref ? { $ref: ref } : null;

    case 'Identifier':
      return node.name;

    default:
      return null;
  }
}

/**
 * Recursively process function parameters
 */
function processParam(param, result) {
  switch (param.type) {
    case 'Identifier':
      result[param.name] = null;
      break;

    case 'AssignmentPattern':
      if (param.left.type === 'Identifier') {
        result[param.left.name] = astToValue(param.right);
      } else {
        processParam(param.left, result);
      }
      break;

    case 'ObjectPattern':
      param.properties.forEach(p => {
        if (p.type === 'RestElement') {
          result['...' + p.argument.name] = null;
        } else if (p.type === 'ObjectProperty' || p.type === 'Property') {
          const keyName = p.key.name || p.key.value;
          if (p.value.type === 'Identifier') {
            result[keyName] = null;
          } else {
            processParam(p.value, result);
          }
        }
      });
      break;

    case 'ArrayPattern':
      param.elements.forEach(el => {
        if (!el) return;
        if (el.type === 'Identifier') result[el.name] = null;
        else processParam(el, result);
      });
      break;

    case 'RestElement':
      result['...' + param.argument.name] = null;
      break;

    default:
      result['[unknown]'] = null;
  }
}

/**
 * Main reusable extractor
 * Accepts function or object literal code
 */
function extractSignatureOrObject(code) {
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });

  const node = ast.program.body[0];

  // Function handling
  if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression') {
    const result = {};
    node.params.forEach(param => processParam(param, result));
    return result;
  }

  // VariableDeclaration with arrow function
  if (node.type === 'VariableDeclaration') {
    const decl = node.declarations[0].init;

    if (
      decl.type === 'ArrowFunctionExpression' ||
      decl.type === 'FunctionExpression'
    ) {
      const result = {};
      decl.params.forEach(param => processParam(param, result));
      return result;
    }

    if (decl.type === 'ObjectExpression') {
      return astToValue(decl);
    }
  }

  // ExpressionStatement (for standalone arrow function)
  if (node.type === 'ExpressionStatement') {
    const expr = node.expression;
    if (expr.type === 'ArrowFunctionExpression' || expr.type === 'FunctionExpression') {
      const result = {};
      expr.params.forEach(param => processParam(param, result));
      return result;
    }
    if (expr.type === 'ObjectExpression') {
      return astToValue(expr);
    }
  }

  return null;
}

function example(code) {
  // ------------------- Examples -------------------

  const funcCode = `(name, last="doe", age=20, list=[1,2,3], dict={root:{key:"value"}}, flag=true, nothing=null, dotted=app.plugin.method) => { return; }`;
  const objCode = `let obj = {name:null, last:"doe", age:20, list:[1,2,3], dict:{root:{key:"value"}}, flag:true, nothing:null, dotted:app.plugin.method};`;

  const funcResult = extractSignatureOrObject(funcCode);
  const objResult = extractSignatureOrObject(objCode);

  console.log('Function:', funcResult);
  console.log('Object:', objResult);
  console.log('Equal:', JSON.stringify(funcResult) === JSON.stringify(objResult));
}

export default {
  signature: extractSignatureOrObject,
};