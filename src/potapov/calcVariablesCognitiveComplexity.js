// * Вычисляет когнитивную сложность на основе количества переменных.
// * Если количество переменных меньше или равно верхнему пределу (5 - UPPER_LIMIT), возвращается базовая сложность — 1.
// * Для каждой переменной сверх этого лимита сложность увеличивается по формуле:
// *   коэффициент = 1 + (номер переменной - UPPER_LIMIT) / 10
// * Итоговая сложность — сумма этих коэффициентов, начиная с базового значения.
const CONSTANT_COMPLEXITY = 1;
const PRIMITIVE_COEF = 1;
const COMPLEX_COEF = 1.2;

const UPPER_LIMIT = 1;

function calcVariablesCognitiveComplexity(variableCount = 0, isComplex = false) {
  const calcResultComplexity = (coml) => {
    return (isComplex ? coml * COMPLEX_COEF : coml * PRIMITIVE_COEF).toFixed(1);
  };

  if (variableCount <= UPPER_LIMIT) {
    return calcResultComplexity(CONSTANT_COMPLEXITY);
  }

  let complexity = 1;
  for (let i = UPPER_LIMIT; i <= variableCount; i++) {
    const coef = 1 + (i - UPPER_LIMIT);
    complexity += coef;
  }

  return calcResultComplexity(complexity);
}

module.exports = calcVariablesCognitiveComplexity;
