import React, { useState } from "react";
import { Todo } from "./types";
import "./styles.pcss";

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: "Отправить письмо", completed: false },
    { id: 2, text: "Провести собрание", completed: false },
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
    <div className='container'>
      <h2 className='title'>Список задач</h2>
      <div className='input-group'>
        <input
          type='text'
          className='input'
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder='Новая задача'
        />
        <button className='btn add' onClick={addTodo}>
          Добавить
        </button>
      </div>
      <ul className='todo-list'>
        {todos.map((todo) => (
          <li
            key={todo.id}
            className={`todo-item ${todo.completed ? "completed" : ""}`}
          >
            <span onClick={() => toggleTodo(todo.id)}>{todo.text}</span>
            <button className='btn delete' onClick={() => deleteTodo(todo.id)}>
              Удалить
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
