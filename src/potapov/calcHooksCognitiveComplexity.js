// const UPPER_LIMIT = 5;
// const COEF_FREQUENT = 1;
// const COEF_RARE = 1.2;
// const COEF_CUSTOM = 1.5;
// function calcHooksCognitiveComplexity(hooksInfo) {
//   const FREQUENT_STD_HOOKS = new Set([
//     "useState",
//     "useEffect",
//     "useCallback",
//     "useMemo",
//     "useRef",
//     "useId",
//     "useContext",
//   ]);

//   const ALL_STD_HOOKS = new Set([
//     "useReducer",
//     "useImperativeHandle",
//     "useLayoutEffect",
//     "useDebugValue",
//     "useTransition",
//     "useDeferredValue",
//     "useId",
//     "useSyncExternalStore",
//   ]);

//   let totalHooks = 0;
//   let score = 0;

//   for (const [hook, { count }] of Object.entries(hooksInfo)) {
//     totalHooks += count;

//     if (FREQUENT_STD_HOOKS.has(hook)) {
//       score += count * COEF_FREQUENT;
//     } else if (ALL_STD_HOOKS.has(hook)) {
//       score += count * COEF_RARE;
//     } else {
//       score += count * COEF_CUSTOM;
//     }
//   }

//   const globalCoef = totalHooks > UPPER_LIMIT ? 1 + (totalHooks - UPPER_LIMIT) * 0.1 : 1;
//   const complexity = score * globalCoef;

//   return Number(complexity.toFixed(2));
// }

const UPPER_LIMIT = 5;
const COEF_FREQUENT = 1;
const COEF_RARE = 1.2;
const COEF_CUSTOM = 1.5;

function calcHooksCognitiveComplexity(hooksInfo) {
  const FREQUENT_STD_HOOKS = new Set([
    "useState",
    "useEffect",
    "useCallback",
    "useMemo",
    "useRef",
    "useId",
    "useContext",
  ]);

  const ALL_STD_HOOKS = new Set([
    "useReducer",
    "useImperativeHandle",
    "useLayoutEffect",
    "useDebugValue",
    "useTransition",
    "useDeferredValue",
    "useId",
    "useSyncExternalStore",
  ]);

  let totalHooks = 0;
  let score = 0;

  for (const [hook, { count, depsCount }] of Object.entries(hooksInfo)) {
    totalHooks += count;

    const baseCoef = FREQUENT_STD_HOOKS.has(hook) ? COEF_FREQUENT : ALL_STD_HOOKS.has(hook) ? COEF_RARE : COEF_CUSTOM;

    // Сложность по зависимостям
    let depsScore = 0;
    for (const deps of depsCount) {
      if (deps <= 1) {
        depsScore += 1;
      } else {
        depsScore += 1 + (deps - 1) * 0.2; // каждое след. значение после 1 увеличивает сложность
      }
    }

    score += count * baseCoef + depsScore;
  }

  const globalCoef = totalHooks > UPPER_LIMIT ? 1 + (totalHooks - UPPER_LIMIT) * 0.1 : 1;
  const complexity = score * globalCoef;

  return Number(complexity.toFixed(2));
}

module.exports = calcHooksCognitiveComplexity;
