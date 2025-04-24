document.addEventListener("DOMContentLoaded", () => {
  const todoInput = document.getElementById("todoInput");
  const addBtn = document.getElementById("addBtn");
  const todoList = document.getElementById("todoList");
  let todoId = 1;

  addBtn.addEventListener("click", () => {
    const text = todoInput.value.trim();
    if (text) {
      const li = document.createElement("li");
      li.className = "todo-item";
      li.dataset.id = todoId++;
      li.innerHTML = `
        <span class="todo-text">${text}</span>
        <button class="btn delete">Удалить</button>
      `;
      todoList.appendChild(li);
      todoInput.value = "";
    }
  });

  todoList.addEventListener("click", (e) => {
    const target = e.target;
    if (target.classList.contains("todo-text")) {
      const li = target.parentElement;
      li.classList.toggle("completed");
    } else if (target.classList.contains("delete")) {
      target.parentElement.remove();
    }
  });
});
