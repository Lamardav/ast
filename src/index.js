const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const PRESENTATION_WEIGHTS = {
  simpleJSX: 0.2,
  jsxWithProps: 0.3,
  jsxSpreadAttribute: 0.2,
  dynamicJSX: 0.6,
  jsxNesting: 0.2,
};

const LOGIC_WEIGHTS = {
  formLogic: 10,
  asyncLogic: 8,
  stateManagement: 6,
  fileUpload: 8,
  businessLogic: 10,
  modalUsage: 6,
};

const REACT_HOOK_WEIGHTS = {
  useEffect: 2,
  useMemoOrCallback: 1.5,
};

const STYLED_WEIGHT = 1.2;
const COGNITIVE_MULTIPLIER = 5;
const CYCL_MULTIPLIER = 4;
const HOOK_VARIABLE_COST = 0.2;
const NON_HOOK_VARIABLE_COST = 0.05;
const NETWORK_LAYER_BONUS = {
  createApi: 12,
  fetchBaseQuery: 10,
  setupListeners: 8,
};
const EXPORT_OBJ_MULTIPLIER = 2; 
const BASE_UI_COST = 3;
const SCALING_FACTOR = 0.1;

function isTypeDeclaration(node) {
  return node.type === 'TSInterfaceDeclaration' || node.type === 'TSTypeAliasDeclaration';
}

const SIMPLE_HTML_TAGS = new Set([
  'div', 'span', 'p', 'img', 'a', 'button', 'ul', 'li', 'ol', 'table',
  'tr', 'td', 'form', 'header', 'footer', 'section', 'article', 'label',
]);

function isSimpleHtmlTag(name) {
  return SIMPLE_HTML_TAGS.has(name);
}

function hasSignificantProps(attributes) {
  return attributes.some(attr => {
    if (!attr.name) return false;
    const propName = attr.name.name;
    return !['key', 'ref', 'className', 'style'].includes(propName);
  });
}

function isFormMethodCall(node) {
  return (
    node.type === 'MemberExpression' &&
    node.object &&
    node.object.name === 'form' &&
    (node.property.name === 'validateFields' ||
     node.property.name === 'getFieldValue' ||
     node.property.name === 'setFieldsValue')
  );
}

function checkAsyncLogic(node) {
  let count = 0;
  if ((node.type === 'FunctionDeclaration' || node.type === 'ArrowFunctionExpression') && node.async)
    count++;
  if (node.type === 'AwaitExpression') count++;
  if (node.type === 'MemberExpression' && (node.property.name === 'then' || node.property.name === 'catch'))
    count++;
  return count;
}

function checkStateManagement(node) {
  if (node.type === 'Identifier') {
    const name = node.name;
    if (name === 'useState' || name === 'setState' || name === 'useReducer' || name === 'useSelector')
      return 1;
  }
  return 0;
}

function checkReactHookCall(node) {
  if (node.type === 'CallExpression' && node.callee.type === 'Identifier') {
    const name = node.callee.name;
    if (name === 'useEffect') return REACT_HOOK_WEIGHTS.useEffect;
    if (name === 'useMemo' || name === 'useCallback') return REACT_HOOK_WEIGHTS.useMemoOrCallback;
  }
  return 0;
}

function checkFileUpload(node) {
  if (node.type === 'Identifier' && (node.name === 'uploadRequest' || node.name === 'FileReader'))
    return 1;
  return 0;
}

function checkBusinessLogic(node) {
  if (node.type === 'Identifier' && (node.name === 'deepMerge' || node.name === 'combineReducers'))
    return 1;
  return 0;
}

function checkModalUsage(nodeName) {
  return ['Modal', 'Drawer', 'Dialog'].includes(nodeName) ? 1 : 0;
}

function analyzeCssComplexity(templateLiteral) {
  const rawCss = templateLiteral.quasis.map(q => q.value.cooked).join('\n');
  let additionalComplexity = 0;
  const pseudoMatches = rawCss.match(/&:[\w-]+/g);
  if (pseudoMatches) additionalComplexity += pseudoMatches.length * 0.6;
  const mediaMatches = rawCss.match(/@media\s+[^{]+\{/g);
  if (mediaMatches) additionalComplexity += mediaMatches.length * 1.2;
  const calcMatches = rawCss.match(/calc\(/g);
  if (calcMatches) additionalComplexity += calcMatches.length * 0.9;
  const importantMatches = rawCss.match(/!important/g);
  if (importantMatches) additionalComplexity += importantMatches.length * 0.8;
  const CSS_PROPERTY_WEIGHTS = {
    animation: 0.9,
    transition: 0.9,
    transform: 0.9,
    'box-shadow': 0.9,
    filter: 0.9,
    'background-image': 0.7,
  };
  const DEFAULT_PROPERTY_WEIGHT = 0.15;
  const declarations = rawCss.split(';');
  for (let decl of declarations) {
    decl = decl.trim();
    if (!decl || decl.startsWith('@media') || decl.startsWith('}') || decl.includes('{')) continue;
    const match = decl.match(/^([\w-]+)\s*:\s*(.+)$/);
    if (match) {
      const property = match[1].toLowerCase();
      const weight = CSS_PROPERTY_WEIGHTS[property] || DEFAULT_PROPERTY_WEIGHT;
      additionalComplexity += weight;
    }
  }
  return additionalComplexity;
}

function isStyledComponentsTaggedTemplate(node) {
  return (
    node.type === 'TaggedTemplateExpression' &&
    node.tag &&
    node.tag.type === 'MemberExpression' &&
    node.tag.object.name === 'styled'
  );
}

function computeCognitiveComplexity(path) {
  let complexity = 0;
  let nestingLevel = 0;
  function incrementComplexity() {
    complexity += 1 + nestingLevel;
  }
  traverse(
    path.node,
    {
      enter(p) {
        if (isTypeDeclaration(p.node)) return;
        switch (p.node.type) {
          case 'IfStatement':
            incrementComplexity(); nestingLevel++; break;
          case 'ForStatement':
          case 'ForInStatement':
          case 'ForOfStatement':
          case 'WhileStatement':
            incrementComplexity(); nestingLevel++; break;
          case 'SwitchCase':
            incrementComplexity(); break;
          case 'ConditionalExpression':
            incrementComplexity(); break;
          case 'LogicalExpression':
            incrementComplexity(); break;
          default: break;
        }
      },
      exit(p) {
        if (p.node.type === 'IfStatement' || p.node.type === 'ForStatement' ||
            p.node.type === 'ForInStatement' || p.node.type === 'ForOfStatement' || p.node.type === 'WhileStatement')
          nestingLevel--;
      },
    },
    path.scope,
    path
  );
  return complexity;
}

function computeCyclomaticComplexity(path) {
  let decisions = 0;
  traverse(
    path.node,
    {
      enter(p) {
        if (isTypeDeclaration(p.node)) return;
        switch (p.node.type) {
          case 'IfStatement':
          case 'ForStatement':
          case 'ForInStatement':
          case 'ForOfStatement':
          case 'WhileStatement':
          case 'ConditionalExpression':
          case 'LogicalExpression':
          case 'SwitchCase':
            decisions++;
            break;
          default: break;
        }
      },
    },
    path.scope,
    path
  );
  return decisions + 1;
}

function getJSXElementName(nodeName) {
  if (nodeName.type === 'JSXIdentifier') return nodeName.name;
  if (nodeName.type === 'JSXMemberExpression')
    return `${getJSXElementName(nodeName.object)}.${getJSXElementName(nodeName.property)}`;
  return '';
}

function getJSXDepth(path) {
  let depth = 0;
  let current = path;
  while (current.parentPath) {
    if (current.parentPath.node.type === 'JSXElement') depth++;
    current = current.parentPath;
  }
  return depth;
}

function computeObjectComplexity(node) {
  let complexity = 0;
  if (node.properties && node.properties.length > 0) {
    complexity += node.properties.length;
    node.properties.forEach(prop => {
      if (prop.value && prop.value.type === 'ObjectExpression')
        complexity += computeObjectComplexity(prop.value) * 0.5;
    });
  }
  return complexity;
}

function computeExportedObjectsComplexity(ast) {
  let exportScore = 0;
  traverse(ast, {
    ExportNamedDeclaration(path) {
      if (path.node.declaration && path.node.declaration.type === 'VariableDeclaration')
        path.node.declaration.declarations.forEach(declarator => {
          if (declarator.init && declarator.init.type === 'ObjectExpression')
            exportScore += computeObjectComplexity(declarator.init);
        });
    }
  });
  return exportScore;
}

function analyzeComplexity(ast) {
  let totalScore = 0;
  let functionComplexities = [];
  let jsxCount = 0;
  let styledCount = 0;
  let externalLibScore = 0;
  traverse(ast, {
    ImportDeclaration(path) {
      const src = path.node.source.value;
      if (src.includes('@reduxjs/toolkit/query')) externalLibScore += NETWORK_LAYER_BONUS.createApi;
      else if (src.includes('@reduxjs/toolkit')) externalLibScore += NETWORK_LAYER_BONUS.fetchBaseQuery;
    },
    TSInterfaceDeclaration(path) {},
    TSTypeAliasDeclaration(path) {},
  });
  traverse(ast, {
    JSXOpeningElement(path) {
      jsxCount++;
      const nodeName = getJSXElementName(path.node.name);
      if (isSimpleHtmlTag(nodeName)) totalScore += PRESENTATION_WEIGHTS.simpleJSX;
      if (path.node.attributes && hasSignificantProps(path.node.attributes))
        totalScore += PRESENTATION_WEIGHTS.jsxWithProps;
      path.node.attributes.forEach(attr => {
        if (attr.type === 'JSXSpreadAttribute') totalScore += PRESENTATION_WEIGHTS.jsxSpreadAttribute;
      });
      totalScore += checkModalUsage(nodeName) * LOGIC_WEIGHTS.modalUsage;
      const depth = getJSXDepth(path);
      if (depth > 1) totalScore += (depth - 1) * PRESENTATION_WEIGHTS.jsxNesting;
    },
    JSXExpressionContainer(path) {
      if (path.node.expression) {
        if (path.node.expression.type === 'ConditionalExpression') totalScore += PRESENTATION_WEIGHTS.dynamicJSX;
        if (path.node.expression.type === 'ArrowFunctionExpression') totalScore += 0.5;
      }
    },
    enter(path) {
      const { node } = path;
      if (node.type === 'CallExpression' && node.callee.type === 'Identifier') {
        const calleeName = node.callee.name;
        if (calleeName === 'createApi') totalScore += NETWORK_LAYER_BONUS.createApi;
        else if (calleeName === 'fetchBaseQuery') totalScore += NETWORK_LAYER_BONUS.fetchBaseQuery;
        else if (calleeName === 'setupListeners') totalScore += NETWORK_LAYER_BONUS.setupListeners;
      }
      if (node.type === 'MemberExpression' && isFormMethodCall(node))
        totalScore += LOGIC_WEIGHTS.formLogic;
      totalScore += checkAsyncLogic(node) * LOGIC_WEIGHTS.asyncLogic;
      if (node.type === 'Identifier')
        totalScore += checkStateManagement(node) * LOGIC_WEIGHTS.stateManagement;
      totalScore += checkFileUpload(node) * LOGIC_WEIGHTS.fileUpload;
      totalScore += checkBusinessLogic(node) * LOGIC_WEIGHTS.businessLogic;
      totalScore += checkReactHookCall(node);
      if (isStyledComponentsTaggedTemplate(node)) {
        styledCount++;
        const cssComplexity = analyzeCssComplexity(node.quasi);
        totalScore += STYLED_WEIGHT + cssComplexity;
      }
    },
    VariableDeclarator(path) {
      if (path.node.id.type === 'Identifier') {
        const varName = path.node.id.name;
        totalScore += varName.startsWith('use') ? HOOK_VARIABLE_COST : NON_HOOK_VARIABLE_COST;
      }
    },
    FunctionDeclaration(path) {
      if (isTypeDeclaration(path.node)) return;
      const funcName = path.node.id ? path.node.id.name : '<anonymous>';
      const cognitive = computeCognitiveComplexity(path);
      const cyclomatic = computeCyclomaticComplexity(path);
      functionComplexities.push({ name: funcName, cognitive, cyclomatic });
      totalScore += (cognitive * COGNITIVE_MULTIPLIER + cyclomatic * CYCL_MULTIPLIER);
    },
    ArrowFunctionExpression(path) {
      const cognitive = computeCognitiveComplexity(path);
      const cyclomatic = computeCyclomaticComplexity(path);
      let funcName = '<arrow>';
      if (path.parent && path.parent.type === 'VariableDeclarator' && path.parent.id && path.parent.id.type === 'Identifier')
        funcName = path.parent.id.name;
      functionComplexities.push({ name: funcName, cognitive, cyclomatic });
      totalScore += (cognitive * COGNITIVE_MULTIPLIER + cyclomatic * CYCL_MULTIPLIER);
    },
  });
  const exportObjScore = computeExportedObjectsComplexity(ast);
  totalScore += exportObjScore * EXPORT_OBJ_MULTIPLIER;
  totalScore += externalLibScore;
  if (jsxCount > 0) totalScore += BASE_UI_COST;
  totalScore *= SCALING_FACTOR;
  return { totalScore, functionComplexities };
}

function main() {
  const filePath = path.resolve(__dirname, '11.js');
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }
  const code = fs.readFileSync(filePath, 'utf8');
  let ast;
  try {
    ast = parser.parse(code, { sourceType: 'module', plugins: ['jsx'] });
  } catch (err) {
    console.error("Parse error:", err);
    return;
  }
  const result = analyzeComplexity(ast);
  console.log('Итоговая вычисленная сложность:', result.totalScore.toFixed(2));
//   console.log('Function Complexity Details:');
//   result.functionComplexities.forEach(fn => {
//     console.log(`${fn.name}: Cognitive = ${fn.cognitive}, Cyclomatic = ${fn.cyclomatic}`);
//   });
  if (result.totalScore < 10) console.log('Результат: Легкий по сложности файл');
  else if (result.totalScore < 30) console.log('Результат: Средний по сложности файл');
  else console.log('Результат: Тяжелый по сложности файл');
}

main();
