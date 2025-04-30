const fs = require("fs").promises;
const path = require("path");
const postcss = require("postcss");

async function parseCssFile(filePath) {
  try {
    // Проверяем, что файл имеет расширение .css
    const ext = path.extname(filePath).toLowerCase();
    if (ext !== ".css") {
      throw new Error("File must have a .css extension");
    }

    // Читаем содержимое файла
    const cssContent = await fs.readFile(filePath, "utf-8");

    // Парсим CSS с помощью PostCSS
    const result = await postcss().process(cssContent, { from: filePath });

    // Возвращаем AST (root)
    return result.root;
  } catch (error) {
    console.error(`Error parsing CSS file: ${error.message}`);
    throw error;
  }
}

// Пример использования
async function example() {
  const filePath = path.resolve(__dirname, "17.css");

  try {
    const ast = await parseCssFile(filePath);
    console.log(JSON.stringify(ast, null, 2));
  } catch (error) {
    console.error("Failed to parse CSS:", error);
  }
}

example();

module.exports = parseCssFile;
