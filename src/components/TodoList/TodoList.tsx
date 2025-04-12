
import React from "react";
import TodoItem from "./TodoItem";

export interface TodoItem {
  id: string;
  text?: string;
  task?: string;
  completed: boolean;
  category: string;
  dueDate?: string | Date;
}

export interface TodoListProps {
  todos: TodoItem[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
  // Adding optional props to match PrescriptionAnalysis usage
  items?: TodoItem[];
  onToggleTodo?: (id: string) => void;
  onDeleteTodo?: (id: string) => void;
  onSaveAll?: () => void;
}

const TodoList: React.FC<TodoListProps> = ({
  todos = [],
  onToggle = () => {},
  onDelete = () => {},
  isLoading = false,
  items,
  onToggleTodo,
  onDeleteTodo,
  onSaveAll,
}) => {
  // Use items prop if provided, otherwise use todos
  const itemsToDisplay = items || todos;
  // Use appropriate handlers
  const toggleHandler = onToggleTodo || onToggle;
  const deleteHandler = onDeleteTodo || onDelete;

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!itemsToDisplay || itemsToDisplay.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No tasks found. Add a task to get started.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {itemsToDisplay.map((item) => (
        <TodoItem
          key={item.id}
          item={item}
          onToggle={toggleHandler}
          onDelete={deleteHandler}
        />
      ))}
    </div>
  );
};

export default TodoList;
