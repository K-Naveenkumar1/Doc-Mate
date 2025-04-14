
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/UI/badge";
import { Button } from "@/components/UI/button";
import { Clock, Calendar, Dumbbell, CheckCircle, AlertTriangle, Save, Share2 } from "lucide-react";

export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  duration?: string;
  description?: string;
}

export interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  exercises: Exercise[];
  frequency: string;
  duration: string;
  intensity: "Low" | "Medium" | "High";
  condition?: string;
  goal?: string;
  recommendations?: string;
  precautions?: string[];
}

export interface WorkoutPlanProps {
  workout?: WorkoutPlan;
  plan?: WorkoutPlan;
  onSave?: () => void;
  onShare?: () => void;
}

const WorkoutPlan: React.FC<WorkoutPlanProps> = ({ workout, plan, onSave, onShare }) => {
  // Use either workout or plan
  const workoutData = workout || plan;
  
  if (!workoutData) {
    return <div>No workout plan available</div>;
  }

  return (
    <Card className="bg-sidebar-accent/30 border-border">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-gradient">{workoutData.title}</CardTitle>
            <p className="text-muted-foreground mt-1">{workoutData.description}</p>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
            {workoutData.intensity || "Medium"} Intensity
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{workoutData.duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{workoutData.frequency}</span>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-3">Exercises</h3>
          <div className="space-y-3">
            {workoutData.exercises.map((exercise, index) => (
              <div key={index} className="bg-black/20 p-4 rounded-lg border border-white/10">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{exercise.name}</h4>
                    {exercise.description && (
                      <p className="text-muted-foreground text-sm mt-1">{exercise.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {exercise.sets} sets × {exercise.reps} reps
                    </Badge>
                    {exercise.duration && (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                        {exercise.duration}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {workoutData.recommendations && (
          <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/30">
            <h3 className="text-blue-500 font-medium mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" /> Recommendations
            </h3>
            <p className="text-muted-foreground">{workoutData.recommendations}</p>
          </div>
        )}
        
        {workoutData.precautions && workoutData.precautions.length > 0 && (
          <div className="bg-amber-500/10 p-4 rounded-lg border border-amber-500/30">
            <h3 className="text-amber-500 font-medium mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Precautions
            </h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              {workoutData.precautions.map((precaution, index) => (
                <li key={index}>{precaution}</li>
              ))}
            </ul>
          </div>
        )}
        
        {(onSave || onShare) && (
          <div className="flex gap-2 justify-end">
            {onSave && (
              <Button 
                className="flex items-center gap-1"
                onClick={onSave}
              >
                <Save className="h-4 w-4" /> Save Plan
              </Button>
            )}
            {onShare && (
              <Button 
                variant="outline"
                className="flex items-center gap-1"
                onClick={onShare}
              >
                <Share2 className="h-4 w-4" /> Share
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkoutPlan;
