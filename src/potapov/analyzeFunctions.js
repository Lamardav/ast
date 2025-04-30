const traverse = require("@babel/traverse").default;

/**
 * Анализирует функции и колбэки в AST и возвращает информацию о них.
 * @param {Object} ast - AST, созданное с помощью @babel/parser.
 * @returns {Array<Object>} - Массив объектов с информацией о функциях:
 *   - name: string|null - имя функции или переменной, или null для анонимных
 *   - isWrappedInHook: boolean - обернута ли функция хуком или передана как аргумент
 *   - argumentCount: number - количество аргументов
 *   - isAsync: boolean - асинхронная ли функция
 *   - localVariableCount: number - количество локальных переменных
 *   - hasRecursiveCall: boolean - есть ли рекурсивный вызов
 *   - cyclomaticComplexity: number - цикломатическая сложность
 *   - hasReturn: boolean - есть ли оператор return
 *   - returnType: string - предполагаемый тип возвращаемого значения
 */
function analyzeFunctions(ast) {
  const functionInfo = [];

  // Список React-хуков, которые могут содержать колбэки
  const reactHooks = ["useEffect", "useLayoutEffect", "useCallback", "useMemo", "useReducer", "useTransition"];

  // Обходим AST
  traverse(ast, {
    // Ищем функции (FunctionDeclaration, FunctionExpression, ArrowFunctionExpression)
    "FunctionDeclaration|FunctionExpression|ArrowFunctionExpression"(path) {
      const { node, scope } = path;

      // Имя функции: из node.id или из переменной, если функция присвоена
      let name = node.id ? node.id.name : null;
      if (!name && path.parentPath && path.parentPath.node.type === "VariableDeclarator") {
        name = path.parentPath.node.id.name; // Имя переменной (например, fibonacci2)
      }

      // Проверяем, обернута ли функция хуком или передана как аргумент
      let isWrappedInHook = false;
      let parentPath = path.parentPath;
      while (parentPath) {
        if (parentPath.node.type === "CallExpression") {
          const callee = parentPath.node.callee;
          if (
            (callee.type === "Identifier" && (reactHooks.includes(callee.name) || callee.name.startsWith("use"))) ||
            (callee.type === "MemberExpression" &&
              callee.object.type === "Identifier" &&
              (reactHooks.includes(callee.object.name) || callee.object.name.startsWith("use")))
          ) {
            if (parentPath.node.arguments.some((arg) => arg === node)) {
              isWrappedInHook = true;
              break;
            }
          }
        }
        if (
          parentPath.node.type === "CallExpression" &&
          parentPath.node.callee.type === "Identifier" &&
          (reactHooks.includes(parentPath.node.callee.name) || parentPath.node.callee.name.startsWith("use"))
        ) {
          isWrappedInHook = true;
          break;
        }
        parentPath = parentPath.parentPath;
      }

      // Количество аргументов
      const argumentCount = node.params.length;

      // Асинхронная ли функция
      const isAsync = !!node.async;

      // Подсчет локальных переменных
      let localVariableCount = 0;
      const bindings = scope.getAllBindings();
      for (const bindingName in bindings) {
        const binding = bindings[bindingName];
        if (binding.kind === "var" || binding.kind === "let" || binding.kind === "const") {
          if (binding.path.findParent((p) => p === path)) {
            localVariableCount += 1;
          }
        }
      }

      // Проверка рекурсивных вызовов
      let hasRecursiveCall = false;
      if (name) {
        path.traverse({
          CallExpression(innerPath) {
            if (
              innerPath.node.callee.type === "Identifier" &&
              innerPath.node.callee.name === name &&
              innerPath.scope.getBinding(name) === scope.getBinding(name)
            ) {
              hasRecursiveCall = true;
            }
          },
        });
      }

      // Подсчет цикломатической сложности
      let cyclomaticComplexity = 1;
      path.traverse({
        IfStatement() {
          cyclomaticComplexity += 1;
        },
        ForStatement() {
          cyclomaticComplexity += 1;
        },
        WhileStatement() {
          cyclomaticComplexity += 1;
        },
        DoWhileStatement() {
          cyclomaticComplexity += 1;
        },
        SwitchCase() {
          cyclomaticComplexity += 1;
        },
        LogicalExpression() {
          cyclomaticComplexity += 1;
        },
        ConditionalExpression() {
          cyclomaticComplexity += 1;
        },
        TryStatement() {
          cyclomaticComplexity += 1;
        },
      });

      // Анализ возвращаемого значения
      let hasReturn = false;
      let returnType = "unknown";
      path.traverse({
        ReturnStatement(returnPath) {
          hasReturn = true;
          const arg = returnPath.node.argument;
          if (arg) {
            switch (arg.type) {
              case "NumericLiteral":
                returnType = "number";
                break;
              case "StringLiteral":
                returnType = "string";
                break;
              case "BooleanLiteral":
                returnType = "boolean";
                break;
              case "NullLiteral":
                returnType = "null";
                break;
              case "ObjectExpression":
                returnType = "object";
                break;
              case "ArrayExpression":
                returnType = "array";
                break;
              case "FunctionExpression":
              case "ArrowFunctionExpression":
                returnType = "function";
                break;
              case "JSXElement":
              case "JSXFragment":
                returnType = "jsx";
                break;
              case "Identifier":
                if (arg.name === "undefined") {
                  returnType = "undefined";
                } else {
                  returnType = "reference";
                }
                break;
              case "CallExpression":
                returnType = "call";
                break;
              case "BinaryExpression":
                // Для операций вроде + между числами можно предположить number
                if (arg.left.type === "CallExpression" && arg.right.type === "CallExpression") {
                  returnType = "number"; // Для fibonacci2(n - 1) + fibonacci2(n - 2)
                } else {
                  returnType = "complex";
                }
                break;
              default:
                returnType = "complex";
                break;
            }
          } else {
            returnType = "void";
          }
        },
      });

      // Добавляем информацию о функции
      functionInfo.push({
        name,
        isWrappedInHook,
        argumentCount,
        isAsync,
        localVariableCount,
        hasRecursiveCall,
        cyclomaticComplexity,
        hasReturn,
        returnType,
      });
    },
  });

  return functionInfo;
}

module.exports = analyzeFunctions;
