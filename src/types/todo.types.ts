export type TodoStatus = 'active' | 'completed';

export interface TodoData {
  readonly value: string;
  readonly status: TodoStatus;
}