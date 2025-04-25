const fs = require("fs").promises;
const path = require("path");
const { parse } = require("@babel/parser");

const countReactHooks = require("./countReactHooks");
const countVariables = require("./countVariables");

const analyzeFunctions = require("./analyzeFunctions");
async function getAstFromFile(filePath) {
  try {
    // Проверяем, существует ли файл
    const absolutePath = path.resolve(filePath);
    await fs.access(absolutePath);

    // Читаем содержимое файла
    const code = await fs.readFile(absolutePath, "utf-8");

    // Определяем плагины на основе расширения файла
    const ext = path.extname(filePath).toLowerCase();
    const plugins = [];

    if (ext === ".ts" || ext === ".tsx") {
      plugins.push("typescript");
    }
    if (ext === ".jsx" || ext === ".tsx") {
      plugins.push("jsx");
    }

    // Парсим код в AST
    const ast = parse(code, {
      sourceType: "module", // Поддержка ESM и CommonJS
      plugins: plugins,
      allowImportExportEverywhere: true, // Разрешить import/export в любом месте
      sourceFilename: absolutePath, // Для лучшей отладки
    });

    return {
      ast,
      ext,
    };
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(`Файл не найден: ${filePath}`);
    } else if (error instanceof SyntaxError) {
      throw new Error(`Ошибка синтаксиса в файле ${filePath}: ${error.message}`);
    } else {
      throw new Error(`Ошибка при обработке файла ${filePath}: ${error.message}`);
    }
  }
}

// Пример использования
async function getDataFromAstTree() {
  const filePath = path.resolve(__dirname, "13.jsx");
  try {
    const { ast } = await getAstFromFile(filePath);
    const hooks = countReactHooks(ast);
    const variables = countVariables(ast);
    const funkInfo = analyzeFunctions(ast);

    console.log(hooks);
    console.log(variables);
    console.log(funkInfo);

    // console.log(JSON.stringify(ast, null, 2));
  } catch (error) {
    console.error(error.message);
  }
}

getDataFromAstTree();
