const traverse = require("@babel/traverse").default;

/**
 * Подсчитывает количество переменных в AST, разделяя их на примитивные и сложные типы.
 * @param {Object} ast - AST, созданное с помощью @babel/parser.
 * @returns {Object} - Объект с полями:
 *   - primitives: количество переменных с примитивными типами,
 *   - complex: количество переменных со сложными типами.
 */
function countVariables(ast) {
  // Объект для хранения количества переменных
  const variableCounts = {
    primitives: 0,
    complex: 0,
  };

  // Обходим AST
  traverse(ast, {
    // Ищем объявления переменных (var, let, const)
    VariableDeclarator(path) {
      const { init } = path.node; // Инициализатор переменной (значение)

      if (!init) {
        // Если нет инициализатора (например, let x;), считаем как примитив (undefined)
        variableCounts.primitives += 1;
        return;
      }

      // Определяем тип инициализатора
      switch (init.type) {
        // Примитивные типы
        case "NumericLiteral": // число
        case "StringLiteral": // строка
        case "BooleanLiteral": // булево
        case "NullLiteral": // null
        case "BigIntLiteral": // bigint
        case "TemplateLiteral": // шаблонная строка
          variableCounts.primitives += 1;
          break;

        // Undefined (например, let x = undefined;)
        case "Identifier":
          if (init.name === "undefined") {
            variableCounts.primitives += 1;
            break;
          }
          // Если идентификатор не undefined, считаем сложным (например, ссылка на объект)
          variableCounts.complex += 1;
          break;

        // Сложные типы
        case "ObjectExpression": // объект
        case "ArrayExpression": // массив
        case "FunctionExpression": // функция
        case "ArrowFunctionExpression": // стрелочная функция
        case "ClassExpression": // класс
        case "NewExpression": // new Something()
        case "CallExpression": // вызов функции (может вернуть объект)
        case "MemberExpression": // obj.prop (может быть объектом)
        case "JSXElement": // JSX-элемент
        case "JSXFragment": // JSX-фрагмент
          variableCounts.complex += 1;
          break;

        // Другие случаи (например, сложные выражения)
        default:
          variableCounts.complex += 1;
          break;
      }
    },
  });

  return variableCounts;
}

module.exports = countVariables;
