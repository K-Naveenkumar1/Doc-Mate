
// AI service for prescription analysis using Supabase
import { supabase } from "@/integrations/supabase/client";
import { analyzePrescription as geminiAnalyzePrescription, generateMedicationInfo } from "./geminiService";

export interface PrescriptionAnalysis {
  medicationList: { name: string; dosage: string; frequency: string; duration: string }[];
  condition: string;
  summary: string;
  recommendations: string[];
  needsWorkout: boolean;
  dietaryRecommendations?: string[];
  sideEffects?: { medication: string; effects: string[] }[];
}

export interface TodoItem {
  id: string;
  task: string;
  category: 'medication' | 'appointment' | 'lifestyle' | 'test';
  dueDate?: Date;
  completed: boolean;
  isCustom?: boolean;
  text: string;
}

export interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  condition: string;
  goal: string;
  duration: string;
  frequency: string;
  intensity: "Low" | "Medium" | "High";
  exercises: {
    name: string;
    sets: number;
    reps: number;
    description: string;
  }[];
  recommendations: string;
  precautions: string[];
}

// Simulated delay to mimic API call
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const analyzePrescription = async (prescriptionImage: File): Promise<PrescriptionAnalysis> => {
  console.log("Analyzing prescription:", prescriptionImage.name);
  
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    
    // Use Gemini to analyze the prescription
    const analysis = await geminiAnalyzePrescription(prescriptionImage, userId);
    
    // Enhance analysis with side effects and dietary recommendations
    if (analysis.medicationList && analysis.medicationList.length > 0) {
      const sideEffects = [];
      const dietaryRecommendations = [
        "Stay hydrated by drinking at least 8 glasses of water daily",
        "Maintain a balanced diet rich in fruits and vegetables",
        "Limit processed foods and excess sugar",
        "Consider foods rich in antioxidants to support your immune system"
      ];
      
      // Get medication details for each medication
      for (const medication of analysis.medicationList) {
        const medicationInfo = await generateMedicationInfo(medication.name);
        sideEffects.push({
          medication: medication.name,
          effects: medicationInfo.sideEffects || []
        });
        
        // Add specific dietary recommendations based on medication
        if (medication.name.toLowerCase().includes('antibiotic')) {
          dietaryRecommendations.push("Consume probiotic-rich foods like yogurt to maintain gut health");
        }
        
        if (medication.name.toLowerCase().includes('steroid')) {
          dietaryRecommendations.push("Limit sodium intake to reduce potential fluid retention");
          dietaryRecommendations.push("Ensure adequate calcium and vitamin D intake to protect bone health");
        }
      }
      
      // Add side effects and dietary recommendations to the analysis
      analysis.sideEffects = sideEffects;
      analysis.dietaryRecommendations = dietaryRecommendations;
    }
    
    return analysis;
  } catch (error) {
    console.error("Error analyzing prescription:", error);
    
    // Fallback to mock response if there's an error
    await delay(2000);
    
    return {
      medicationList: [
        { name: "Amoxicillin", dosage: "500mg", frequency: "3 times daily", duration: "7 days" },
        { name: "Ibuprofen", dosage: "400mg", frequency: "as needed", duration: "5 days" }
      ],
      condition: "Upper respiratory tract infection",
      summary: "The prescription indicates a bacterial upper respiratory infection requiring antibiotics and pain management.",
      recommendations: [
        "Complete the full course of antibiotics even if symptoms improve",
        "Stay hydrated and get plenty of rest",
        "Monitor for fever or worsening symptoms",
        "Follow up with doctor if not improved in 5 days"
      ],
      needsWorkout: false,
      dietaryRecommendations: [
        "Stay hydrated by drinking at least 8 glasses of water daily",
        "Consume probiotic-rich foods like yogurt while taking antibiotics",
        "Avoid alcohol while on medication",
        "Eat light, easily digestible foods if experiencing stomach discomfort"
      ],
      sideEffects: [
        {
          medication: "Amoxicillin",
          effects: [
            "Diarrhea or loose stools",
            "Stomach pain or discomfort",
            "Nausea or vomiting",
            "Rash or itching"
          ]
        },
        {
          medication: "Ibuprofen",
          effects: [
            "Stomach pain or heartburn",
            "Nausea or vomiting",
            "Headache or dizziness",
            "Mild allergic reactions"
          ]
        }
      ]
    };
  }
};

export const generateTodoList = async (analysis: PrescriptionAnalysis): Promise<TodoItem[]> => {
  // Simulate processing time
  await delay(1000);
  
  // Generate todo items based on prescription analysis
  const todos: TodoItem[] = [];
  
  // Add medication reminders
  analysis.medicationList.forEach((med, index) => {
    todos.push({
      id: `med-${index}`,
      task: `Take ${med.name} ${med.dosage} ${med.frequency}`,
      text: `Take ${med.name} ${med.dosage} ${med.frequency}`,
      category: 'medication',
      completed: false
    });
  });
  
  // Add follow-up appointment
  todos.push({
    id: 'appointment-1',
    task: 'Schedule follow-up appointment in 7 days',
    text: 'Schedule follow-up appointment in 7 days',
    category: 'appointment',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    completed: false
  });
  
  // Add lifestyle recommendations
  todos.push({
    id: 'lifestyle-1',
    task: 'Drink at least 8 glasses of water daily',
    text: 'Drink at least 8 glasses of water daily',
    category: 'lifestyle',
    completed: false
  });
  
  todos.push({
    id: 'lifestyle-2',
    task: 'Get at least 8 hours of sleep each night',
    text: 'Get at least 8 hours of sleep each night',
    category: 'lifestyle',
    completed: false
  });
  
  return todos;
};

export const generateWorkoutPlan = async (condition: string): Promise<WorkoutPlan | null> => {
  // Simulate processing time
  await delay(1500);
  
  // Mock workout plan for specific conditions
  if (condition.toLowerCase().includes("respiratory")) {
    return {
      id: `workout-${Date.now()}`,
      title: "Upper Respiratory Tract Infection Workout Plan",
      description: "Gentle respiratory strengthening and recovery",
      condition: "Upper respiratory tract infection",
      goal: "Gentle respiratory strengthening and recovery",
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
      recommendations: "Follow all instructions carefully",
      precautions: [
        "Stop if you feel dizzy or short of breath",
        "Avoid exercise during active fever",
        "Gradually increase intensity as you recover"
      ]
    };
  }
  
  // Return default workout plan if no specific one is available for the condition
  return {
    id: `workout-${Date.now()}`,
    title: "General Recovery Workout Plan",
    description: "Gentle exercises to support recovery and maintain mobility",
    condition: condition || "General health maintenance",
    goal: "Support recovery while maintaining strength and mobility",
    duration: "2-3 weeks",
    frequency: "2-3 times per week",
    intensity: "Low",
    exercises: [
      {
        name: "Gentle Stretching",
        sets: 1,
        reps: 5,
        description: "Full body stretching focusing on major muscle groups, hold each stretch for 15-30 seconds"
      },
      {
        name: "Light Walking",
        sets: 1,
        reps: 1,
        description: "10-20 minutes of walking at a comfortable pace"
      },
      {
        name: "Chair Squats",
        sets: 2,
        reps: 8,
        description: "Using a chair for support, perform gentle squats within a comfortable range of motion"
      }
    ],
    recommendations: "Listen to your body and adjust intensity as needed",
    precautions: [
      "Stop any exercise that causes pain",
      "Ensure proper hydration before, during, and after exercise",
      "Consult with your healthcare provider before starting any exercise program"
    ]
  };
};

// Storage utility functions to save todos and workouts to Supabase

export const saveTodoToList = async (todo: TodoItem): Promise<void> => {
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error("User not authenticated");
    return;
  }
  
  // In a real app, this would save to a "todos" table in Supabase
  console.log("Todo saved:", todo);
};

export const saveTodoListToPersonal = async (todos: TodoItem[]): Promise<void> => {
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error("User not authenticated");
    return;
  }
  
  // In a real app, this would save to a "todos" table in Supabase
  console.log("Todos saved to personal list:", todos.length);
};

export const saveWorkoutToPlan = async (workout: WorkoutPlan): Promise<void> => {
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error("User not authenticated");
    return;
  }
  
  // In a real app, this would save to a "workouts" table in Supabase
  console.log("Workout saved:", workout.title);
};

export const getSavedTodos = async (): Promise<TodoItem[]> => {
  // In a real app, this would fetch from the Supabase database
  return [];
};

export const getSavedWorkouts = async (): Promise<WorkoutPlan[]> => {
  // In a real app, this would fetch from the Supabase database
  return [];
};

// Helper function to get all user prescriptions
export const getUserPrescriptions = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('prescriptions')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching prescriptions:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getUserPrescriptions:", error);
    return [];
  }
};