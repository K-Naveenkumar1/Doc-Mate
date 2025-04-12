
import React from "react";
import { Button } from "@/components/ui/button";
import { CalendarDays, CheckSquare, ListTodo, Target } from "lucide-react";

export interface TodoFiltersProps {
  currentCategory: string;
  onCategoryChange: (category: string) => void;
}

const TodoFilters: React.FC<TodoFiltersProps> = ({
  currentCategory,
  onCategoryChange,
}) => {
  const categories = [
    { id: "all", label: "All", icon: ListTodo },
    { id: "health", label: "Health", icon: Target },
    { id: "medication", label: "Medication", icon: CheckSquare },
    { id: "appointments", label: "Appointments", icon: CalendarDays },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {categories.map((category) => {
        const Icon = category.icon;
        return (
          <Button
            key={category.id}
            variant={currentCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(category.id)}
            className="flex items-center gap-1"
          >
            <Icon className="h-4 w-4" />
            {category.label}
          </Button>
        );
      })}
    </div>
  );
};

export default TodoFilters;
