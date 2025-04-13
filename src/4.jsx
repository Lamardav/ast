// ComplexLogicComponent.jsx
import React, { useReducer, useEffect, useCallback } from 'react';

// Начальное состояние
const initialState = { count: 0 };

// Редьюсер с "сложной" логикой:
// - При инкременте: если счётчик достиг 5, сбрасывается в 0.
// - При декременте: если новое значение меньше 0, приводится к 0.
// - Дополнительно, эффект следит за чётным значением и при соблюдении условия уменьшается значение на 1.
function reducer(state, action) {
  switch (action.type) {
    case 'increment': {
      const newCount = state.count + 1;
      // Если счётчик достигает 5 или больше, то сбрасываем значение в 0
      return { count: newCount >= 5 ? 0 : newCount };
    }
    case 'decrement': {
      const newCount = state.count - 1;
      // Если новое значение меньше 0, возвращаем 0
      return { count: newCount < 0 ? 0 : newCount };
    }
    case 'reset': {
      return initialState;
    }
    default:
      return state;
  }
}

const ComplexLogicComponent = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Инкремент с использованием useCallback для мемоизации функции
  const handleIncrement = useCallback(() => {
    dispatch({ type: 'increment' });
  }, []);

  // Эффект реагирует на изменение счетчика:
  // Если значение чётное и не равно нулю, автоматически уменьшаем его на 1.
  useEffect(() => {
    if (state.count !== 0 && state.count % 2 === 0) {
      dispatch({ type: 'decrement' });
    }
  }, [state.count]);

  return (
    <div style={{ textAlign: 'center', marginTop: '40px' }}>
      <h2>Счётчик: {state.count}</h2>
      <div>
        <button onClick={handleIncrement} style={{ marginRight: '10px' }}>
          Инкремент
        </button>
        <button
          onClick={() => dispatch({ type: 'decrement' })}
          style={{ marginRight: '10px' }}
        >
          Декремент
        </button>
        <button onClick={() => dispatch({ type: 'reset' })}>Сброс</button>
      </div>
    </div>
  );
};

export default ComplexLogicComponent;
