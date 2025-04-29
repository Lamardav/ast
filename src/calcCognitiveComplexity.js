const path = require("path");

const parseFileToAstTree = require("./potapov/parseFileToAstTree");

const countReactHooks = require("./potapov/countReactHooks");
const countVariables = require("./potapov/countVariables");

const analyzeFunctions = require("./potapov/analyzeFunctions");

const calcVariablesCognitiveComplexity = require("./potapov/calcVariablesCognitiveComplexity");
const calcHooksCognitiveComplexity = require("./potapov/calcHooksCognitiveComplexity");
const calcFunctionCognitiveComplexity = require("./potapov/calcFunctionCognitiveComplexity");

// Пример использования
async function calcCognitiveComplexity() {
  const filePath = path.resolve(__dirname, "13.jsx");
  try {
    const { ast } = await parseFileToAstTree(filePath);
    const hooks = countReactHooks(ast);
    const variables = countVariables(ast);
    const funkInfo = analyzeFunctions(ast);

    const funcComplexity = calcFunctionCognitiveComplexity(funkInfo);

    console.log(variables);
    console.log(hooks);
    console.log("fucn", funcComplexity);

    console.log("hooks", calcHooksCognitiveComplexity(hooks));
    console.log(
      `Примитивы - ${calcVariablesCognitiveComplexity(variables.primitives)}`,
      `Сложные - ${calcVariablesCognitiveComplexity(variables.complex, true)}`
    );

    // console.log(JSON.stringify(ast, null, 2));
  } catch (error) {
    console.error(error.message);
  }
}

//primitives - число примитивных переменных
//complex - число ссылочных переменных

calcCognitiveComplexity();
