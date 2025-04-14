import React from "react";
import { TodoItem as TodoItemType } from "@/components/TodoList/TodoList";
import { Checkbox } from "@/components/UI/checkbox";
import { Calendar, Clock, Pill, User, Trash2 } from "lucide-react";
import { Button } from "@/components/UI/button";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface TodoItemProps {
  item: TodoItemType;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ item, onToggle, onDelete }) => {
  const getCategoryIcon = () => {
    switch (item.category) {
      case 'medication':
        return <Pill className="h-4 w-4 text-blue-500" />;
      case 'appointment':
        return <Calendar className="h-4 w-4 text-green-500" />;
      case 'lifestyle':
        return <User className="h-4 w-4 text-purple-500" />;
      case 'test':
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryColor = () => {
    switch (item.category) {
      case 'medication':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      case 'appointment':
        return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'lifestyle':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/30';
      case 'test':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
    }
  };

  return (
    <div className={cn(
      "p-4 rounded-lg border transition-all duration-300 glass-card backdrop-blur-sm mb-3",
      item.completed ? "opacity-70" : "opacity-100"
    )}>
      <div className="flex items-start gap-3">
        <Checkbox 
          checked={item.completed}
          onCheckedChange={() => onToggle(item.id)}
          className="mt-1"
        />
        
        <div className="flex-1">
          <p className={cn(
            "text-gray-300 font-medium",
            item.completed && "line-through text-gray-500"
          )}>
            {item.task || item.text}
          </p>
          
          <div className="flex flex-wrap gap-2 mt-2">
            <span className={cn(
              "text-xs px-2 py-1 rounded-full border flex items-center gap-1",
              getCategoryColor()
            )}>
              {getCategoryIcon()}
              {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
            </span>
            
            {item.dueDate && (
              <span className="text-xs px-2 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDistanceToNow(new Date(item.dueDate), { addSuffix: true })}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-white hover:bg-primary/20"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TodoItem;
