const ASYNC_LOGIC = 0.5;
const RECURSIVE_LOGIC = 1;
const HOOK_WRAPPING = 0.2;
const FUNC_COUT_COEF = 0.1;

const LOCAL_VARIABLES_COEF = 0.1;
const ARGUMENTS_COUNT_COEF = 0.2;

const calcCountFactor = (count = 0, coef = 1) => {
  return count * coef;
};

function calculateTotalCognitiveComplexity(functions) {
  let totalComplexity = 0;

  functions.forEach((fn, index) => {
    let base = fn.cyclomaticComplexity;
    let positionFactor = 1 + index * FUNC_COUT_COEF;
    let bonusFactor = 0;
    let argmentsFactor = calcCountFactor(fn.argumentCount, ARGUMENTS_COUNT_COEF);
    let localVariablesFactor = calcCountFactor(fn.localVariableCount, LOCAL_VARIABLES_COEF);
    bonusFactor += argmentsFactor;
    bonusFactor += localVariablesFactor;
    if (fn.isWrappedInHook) {
      bonusFactor += HOOK_WRAPPING;
    }

    if (fn.isAsync) {
      bonusFactor += ASYNC_LOGIC;
    }

    if (fn.hasRecursiveCall) {
      bonusFactor += RECURSIVE_LOGIC;
    }

    const effectiveComplexity = base * (positionFactor + bonusFactor);
    // console.table({
    //   base,
    //   positionFactor,
    //   argsCount: fn.argumentCount,
    //   argmentsFactor,
    //   localVarCount: fn.localVariableCount,
    //   localVariablesFactor,
    // });
    totalComplexity += effectiveComplexity;
  });

  return totalComplexity.toFixed(1);
}

module.exports = calculateTotalCognitiveComplexity;
