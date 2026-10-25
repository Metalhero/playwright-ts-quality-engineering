import { TodoData, TodoStatus } from "../types/todo.types";

export function createTodo(
  title: string,
  status: TodoStatus = "active"
): TodoData {
  const normalizedTitle = title.trim();

  if (!normalizedTitle) {
    throw new Error("Todo title cannot be empty or whitespace.");
  }

  return {
    title: normalizedTitle,
    status
  };
}

export function createTodoSet(): readonly TodoData[] {
  return [
    createTodo("Apple"),
    createTodo("Banana"),
    createTodo("Melon"),
    createTodo("Pear"),
  ];
}