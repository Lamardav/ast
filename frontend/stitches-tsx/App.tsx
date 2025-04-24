import React, { useState } from "react";
import { styled } from "@stitches/react";
import { Todo } from "./types";

const Container = styled("div", {
  maxWidth: "600px",
  margin: "20px auto",
  padding: "20px",
  backgroundColor: "#f5f3ff",
  borderRadius: "8px",
});

const Title = styled("h2", {
  textAlign: "center",
  color: "#86198f",
  marginBottom: "20px",
});

const InputGroup = styled("div", {
  display: "flex",
  gap: "10px",
  marginBottom: "20px",
});

const Input = styled("input", {
  flex: 1,
  padding: "10px",
  border: "1px solid #f3e8ff",
  borderRadius: "4px",
  fontSize: "16px",
});

const Button = styled("button", {
  padding: "10px 20px",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "16px",
  color: "white",
  transition: "background-color 0.3s",

  variants: {
    variant: {
      add: {
        backgroundColor: "#d946ef",
        "&:hover": { backgroundColor: "#c026d3" },
      },
      delete: {
        backgroundColor: "#a21caf",
        "&:hover": { backgroundColor: "#86198f" },
      },
    },
  },
});

const TodoList = styled("ul", {
  listStyle: "none",
  padding: 0,
});

const TodoItem = styled("li", {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px",
  margin: "5px 0",
  backgroundColor: "#fff",
  borderRadius: "4px",

  variants: {
    completed: {
      true: {
        backgroundColor: "#fae8ff",
        textDecoration: "line-through",
      },
    },
  },
});

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: "Запланировать отпуск", completed: false },
    { id: 2, text: "Починить велосипед", completed: false },
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
            <Button variant='delete' onClick={() => deleteTodo(todo.id)}>
              Удалить
            </Button>
          </TodoItem>
        ))}
      </TodoList>
    </Container>
  );
};

export default App;
