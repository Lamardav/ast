import React, { useState } from "react";
import { css } from "@emotion/react";
import { Todo } from "./types";

const containerStyles = css`
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff7ed;
  border-radius: 8px;
`;

const titleStyles = css`
  text-align: center;
  color: #c2410c;
  margin-bottom: 20px;
`;

const inputGroupStyles = css`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const inputStyles = css`
  flex: 1;
  padding: 10px;
  border: 1px solid #ffedd5;
  border-radius: 4px;
  font-size: 16px;
`;

const buttonStyles = (variant?: string) => css`
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  color: white;
  background-color: ${variant === "add" ? "#f97316" : "#ea580c"};
  transition: background-color 0.3s;

  &:hover {
    background-color: ${variant === "add" ? "#ea580c" : "#c2410c"};
  }
`;

const todoListStyles = css`
  list-style: none;
  padding: 0;
`;

const todoItemStyles = (completed: boolean) => css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin: 5px 0;
  background-color: #fff;
  border-radius: 4px;
  text-decoration: ${completed ? "line-through" : "none"};
  background-color: ${completed ? "#ffedd5" : "#fff"};
`;

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: "Прочитать книгу", completed: false },
    { id: 2, text: "Сходить в спортзал", completed: false },
  ]);
  const [newTodo, setNewTodo] = useState("");

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([
        ...todos,
        { id: todos.length + 1, text: newTodo, completed: false },
      ]);
      setNewTodo("");
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <div css={containerStyles}>
      <h2 css={titleStyles}>Список задач</h2>
      <div css={inputGroupStyles}>
        <input
          type='text'
          css={inputStyles}
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder='Новая задача'
        />
        <button css={buttonStyles("add")} onClick={addTodo}>
          Добавить
        </button>
      </div>
      <ul css={todoListStyles}>
        {todos.map((todo) => (
          <li key={todo.id} css={todoItemStyles(todo.completed)}>
            <span onClick={() => toggleTodo(todo.id)}>{todo.text}</span>
            <button css={buttonStyles()} onClick={() => deleteTodo(todo.id)}>
              Удалить
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
