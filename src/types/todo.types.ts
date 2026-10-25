export type TodoStatus = 'active' | 'completed';

export interface TodoData {
  readonly title: string;
  readonly status: TodoStatus;
}