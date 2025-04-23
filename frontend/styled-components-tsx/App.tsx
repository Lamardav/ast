import React, { useState } from "react";
import styled from "styled-components";
import { Todo } from "./types";

const Container = styled.div`
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  background-color: #f5f3ff;
  border-radius: 8px;
`;

const Title = styled.h2`
  text-align: center;
  color: #6d28d9;
  margin-bottom: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd6fe;
  border-radius: 4px;
  font-size: 16px;
`;

const Button = styled.button<{ variant?: string }>`
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  color: white;
  background-color: ${({ variant }) =>
    variant === "add" ? "#8b5cf6" : "#d946ef"};
  transition: background-color 0.3s;

  &:hover {
    background-color: ${({ variant }) =>
      variant === "add" ? "#7c3aed" : "#c026d3"};
  }
`;

const TodoList = styled.ul`
  list-style: none;
  padding: 0;
`;

const TodoItem = styled.li<{ completed: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin: 5px 0;
  background-color: #fff;
  border-radius: 4px;
  text-decoration: ${({ completed }) => (completed ? "line-through" : "none")};
  background-color: ${({ completed }) => (completed ? "#ede9fe" : "#fff")};
`;

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: "Изучить React", completed: false },
    { id: 2, text: "Сделать заметки", completed: false },
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
    <Container>
      <Title>Список задач</Title>
      <InputGroup>
        <Input
          type='text'
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder='Новая задача'
        />
        <Button variant='add' onClick={addTodo}>
          Добавить
        </Button>
      </InputGroup>
      <TodoList>
        {todos.map((todo) => (
          <TodoItem key={todo.id} completed={todo.completed}>
            <span onClick={() => toggleTodo(todo.id)}>{todo.text}</span>
            <Button onClick={() => deleteTodo(todo.id)}>Удалить</Button>
          </TodoItem>
        ))}
      </TodoList>
    </Container>
  );
};

export default App;
