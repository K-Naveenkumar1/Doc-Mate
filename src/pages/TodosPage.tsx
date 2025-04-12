
import React, { useState, useEffect } from "react";
import { Container } from "@/components/ui/container";
import TodoList, { TodoItem as TodoListItem } from "@/components/TodoList/TodoList";
import TodoFilters from "@/components/TodoList/TodoFilters";
import { getSavedTodos, TodoItem as AiServiceTodoItem } from "@/services/aiService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TodosPage = () => {
  const [todos, setTodos] = useState<TodoListItem[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<TodoListItem[]>([]);
  const [currentTab, setCurrentTab] = useState<string>("all");
  const [currentCategory, setCurrentCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Example todos with proper type compatibility
  const exampleTodos: TodoListItem[] = [
    {
      id: "1",
      task: "Take Amoxicillin 500mg three times daily",
      category: "medication",
      completed: false,
      text: "Take Amoxicillin 500mg three times daily"
    },
    {
      id: "2",
      task: "Schedule follow-up appointment with Dr. Johnson",
      category: "appointment",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toString(),
      completed: false,
      text: "Schedule follow-up appointment with Dr. Johnson"
    },
    {
      id: "3",
      task: "Drink 8 glasses of water daily",
      category: "lifestyle",
      completed: true,
      text: "Drink 8 glasses of water daily"
    },
    {
      id: "4",
      task: "Get blood pressure checked",
      category: "test",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toString(),
      completed: false,
      text: "Get blood pressure checked"
    }
  ];

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setLoading(true);
        // In a real app, we would fetch from the backend
        const savedTodos = await getSavedTodos();
        
        // If no saved todos, use example todos
        if (savedTodos.length === 0) {
          setTodos(exampleTodos);
          setFilteredTodos(exampleTodos);
        } else {
          // Map service todos to compatible format
          const compatibleTodos: TodoListItem[] = savedTodos.map((todo: AiServiceTodoItem) => ({
            id: todo.id,
            task: todo.task,
            text: todo.task, // Adding text field to match interface
            category: todo.category,
            completed: todo.completed,
            dueDate: todo.dueDate ? todo.dueDate.toString() : undefined
          }));
          setTodos(compatibleTodos);
          setFilteredTodos(compatibleTodos);
        }
      } catch (error) {
        console.error("Error fetching todos:", error);
        toast({
          title: "Error",
          description: "Could not load todos",
          variant: "destructive"
        });
        setTodos(exampleTodos);
        setFilteredTodos(exampleTodos);
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, [toast]);

  useEffect(() => {
    // Filter todos based on current tab and category
    let filtered = [...todos];
    
    // Filter by completion status
    if (currentTab === "active") {
      filtered = filtered.filter(todo => !todo.completed);
    } else if (currentTab === "completed") {
      filtered = filtered.filter(todo => todo.completed);
    }
    
    // Filter by category
    if (currentCategory !== "all") {
      filtered = filtered.filter(todo => todo.category === currentCategory);
    }
    
    setFilteredTodos(filtered);
  }, [todos, currentTab, currentCategory]);

  const handleToggleTodo = (id: string) => {
    const updatedTodos = todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updatedTodos);
  };

  const handleDeleteTodo = (id: string) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    setTodos(updatedTodos);
    
    toast({
      title: "Todo Deleted",
      description: "Your todo has been removed successfully",
    });
  };

  const handleAddTodo = () => {
    const newTodo: TodoListItem = {
      id: `todo-${Date.now()}`,
      task: "New task",
      category: "lifestyle",
      completed: false
    };
    
    setTodos([newTodo, ...todos]);
    
    toast({
      title: "Todo Added",
      description: "A new todo has been added to your list",
    });
  };

  return (
    <Container>
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-3xl font-bold text-gradient mb-4 sm:mb-0">Health Todos</h1>
          <Button onClick={handleAddTodo} className="self-start sm:self-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Todo
          </Button>
        </div>
        
        <Card className="bg-sidebar-accent/30 border-border">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>Your Health Tasks</CardTitle>
              <Tabs defaultValue={currentTab} onValueChange={setCurrentTab}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <TodoFilters currentCategory={currentCategory} onCategoryChange={setCurrentCategory} />
            
            <div className="mt-4">
              <TodoList 
                todos={filteredTodos} 
                onToggle={handleToggleTodo} 
                onDelete={handleDeleteTodo}
                isLoading={loading}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
};

export default TodosPage;
