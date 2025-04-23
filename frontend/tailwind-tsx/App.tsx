import React, { useState } from "react";
import { Todo } from "./types";

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: "Позвонить клиенту", completed: false },
    { id: 2, text: "Обновить резюме", completed: false },
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
    <div className='max-w-xl mx-auto p-5 bg-teal-100 rounded-lg'>
      <h2 className='text-2xl font-semibold text-teal-800 text-center mb-4'>
        Список задач
      </h2>
      <div className='flex gap-3 mb-5'>
        <input
          type='text'
          className='flex-1 p-2 border border-teal-300 rounded text-base'
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder='Новая задача'
        />
        <button
          className='px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition'
          onClick={addTodo}
        >
          Добавить
        </button>
      </div>
      <ul className='list-none p-0'>
        {todos.map((todo) => (
          <li
            key={todo.id}
            className={`flex justify-between items-center p-2 my-2 bg-white rounded ${
              todo.completed ? "line-through bg-teal-50" : ""
            }`}
          >
            <span onClick={() => toggleTodo(todo.id)}>{todo.text}</span>
            <button
              className='px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition'
              onClick={() => deleteTodo(todo.id)}
            >
              Удалить
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
