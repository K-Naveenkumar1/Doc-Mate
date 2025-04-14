
import React, { useState, useEffect } from "react";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/UI/button";
import { getSavedWorkouts } from "@/services/aiService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/UI/tabs";
import { Plus, Activity, Dumbbell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import WorkoutPlanComponent, { WorkoutPlan } from "@/components/Workout/WorkoutPlan";

const WorkoutsPage = () => {
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Example workout plan with required id and intensity properties
  const exampleWorkout: WorkoutPlan = {
    id: "1", 
    title: "Upper Respiratory Tract Infection Recovery",
    description: "Gentle exercises to aid in recovery from respiratory infection",
    condition: "Upper respiratory tract infection",
    goal: "Improve lung capacity and promote recovery",
    duration: "2 weeks",
    frequency: "3-4 times per week",
    intensity: "Low",
    exercises: [
      {
        name: "Deep Breathing",
        sets: 3,
        reps: 10,
        description: "Sit comfortably, inhale deeply through nose for 4 counts, hold for 2, exhale slowly for 6 counts"
      },
      {
        name: "Gentle Walking",
        sets: 1,
        reps: 1,
        description: "10-15 minutes of gentle walking outdoors (weather permitting) or indoors"
      },
      {
        name: "Shoulder Rolls",
        sets: 2,
        reps: 10,
        description: "Roll shoulders forward and backward to release tension"
      }
    ],
    recommendations: "Follow all exercises carefully and stop if feeling lightheaded",
    precautions: [
      "Stop if you feel dizzy or short of breath",
      "Avoid exercise during active fever",
      "Gradually increase intensity as you recover"
    ]
  };
  
  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setLoading(true);
        // In a real app, we would fetch from the backend
        const savedWorkouts = await getSavedWorkouts();
        
        // If no saved workouts, use example workout
        if (savedWorkouts.length === 0) {
          setWorkouts([exampleWorkout]);
          setActiveWorkout(exampleWorkout);
        } else {
          // Ensure all workouts have id and intensity
          const compatibleWorkouts = savedWorkouts.map(workout => ({
            ...workout,
            id: workout.id || `workout-${Date.now()}`,
            intensity: workout.intensity || "Medium" as "Low" | "Medium" | "High"
          }));
          setWorkouts(compatibleWorkouts);
          setActiveWorkout(compatibleWorkouts[0]);
        }
      } catch (error) {
        console.error("Error fetching workouts:", error);
        toast({
          title: "Error",
          description: "Could not load workout plans",
          variant: "destructive"
        });
        setWorkouts([exampleWorkout]);
        setActiveWorkout(exampleWorkout);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkouts();
  }, [toast]);
  
  const handleAddWorkout = () => {
    // In a real app, this would open a form to create a new workout
    toast({
      title: "Feature Coming Soon",
      description: "The ability to create custom workouts will be available soon!",
    });
  };
  
  return (
    <Container>
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-3xl font-bold text-gradient mb-4 sm:mb-0">Health Workouts</h1>
          <Button onClick={handleAddWorkout} className="self-start sm:self-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Workout
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="h-full bg-sidebar-accent/30 border-border">
              <CardHeader>
                <CardTitle>Your Workout Plans</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <Activity className="h-8 w-8 mx-auto animate-pulse text-primary" />
                    <p className="mt-2">Loading your workouts...</p>
                  </div>
                ) : workouts.length === 0 ? (
                  <div className="text-center py-8">
                    <Dumbbell className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">No workout plans found</p>
                    <Button onClick={handleAddWorkout} variant="outline" className="mt-4">
                      Create Your First Workout
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {workouts.map((workout, index) => (
                      <div 
                        key={index}
                        className={`p-3 rounded-md cursor-pointer transition-colors ${
                          activeWorkout?.title === workout.title 
                            ? 'bg-primary text-primary-foreground' 
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => setActiveWorkout(workout)}
                      >
                        <h3 className="font-medium">{workout.title}</h3>
                        <p className="text-sm opacity-80">{workout.condition}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            {activeWorkout ? (
              <WorkoutPlanComponent workout={activeWorkout} />
            ) : (
              <Card className="h-full bg-sidebar-accent/30 border-border">
                <CardContent className="flex items-center justify-center min-h-[400px]">
                  <div className="text-center">
                    <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">No Workout Selected</h3>
                    <p className="text-muted-foreground mb-4">Select a workout plan from the list or create a new one</p>
                    <Button onClick={handleAddWorkout}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Workout
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default WorkoutsPage;
