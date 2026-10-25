import { TodoData, TodoStatus } from "../types/todo.types";

export function createTodo(
    value: string,
    status: TodoStatus = "active"
): TodoData {
    const normalizedTitle = value.trim();

    if (!normalizedTitle) {
        throw new Error("Todo title cannot be empty or whitespace.");
    }

    return {
        value: normalizedTitle,
        status
    };
}

export function createTodoSet(): readonly TodoData[] {
    return [
        createTodo("Apple"),
        createTodo("Banana"),
        createTodo("Melon"),
        createTodo("Pear", "completed"),
    ];
}