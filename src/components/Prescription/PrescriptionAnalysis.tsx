import React, { useState, useEffect } from "react";
import { FileText, Pill, ArrowRight, CheckCircle2, AlertTriangle, Shield, Info, Save, Utensils } from "lucide-react";
import { Button } from "@/components/UI/button";
import { 
  PrescriptionAnalysis as AnalysisType, 
  TodoItem, 
  WorkoutPlan as WorkoutPlanType, 
  generateTodoList, 
  generateWorkoutPlan,
  saveTodoListToPersonal,
  saveWorkoutToPlan
} from "@/services/aiService";
import { generateMedicationInfo } from "@/services/geminiService";
import TodoList from "../TodoList/TodoList";
import WorkoutPlanComponent from "../Workout/WorkoutPlan";
import LoadingSpinner from "@/components/UI/LoadingSpinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/UI/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface PrescriptionAnalysisProps {
  analysis: AnalysisType;
  onReset: () => void;
}

interface MedicationDetail {
  name: string;
  sideEffects: string[];
  precautions: string[];
  interactions: string[];
  description: string;
}

const PrescriptionAnalysis: React.FC<PrescriptionAnalysisProps> = ({ analysis, onReset }) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [todoItems, setTodoItems] = useState<TodoItem[] | null>(null);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlanType | null>(null);
  const [isLoadingTodos, setIsLoadingTodos] = useState<boolean>(false);
  const [isLoadingWorkout, setIsLoadingWorkout] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [medicationDetails, setMedicationDetails] = useState<Record<string, MedicationDetail>>({});
  const [isLoadingMedInfo, setIsLoadingMedInfo] = useState<boolean>(false);
  
  useEffect(() => {
    if (analysis.medicationList.length > 0) {
      loadMedicationDetails();
    }
  }, [analysis]);
  
  useEffect(() => {
    if (currentStep === 2 && !todoItems) {
      loadTodoList();
    }
    
    if (currentStep === 3 && !workoutPlan) {
      loadWorkoutPlan();
    }
  }, [currentStep]);
  
  const loadMedicationDetails = async () => {
    setIsLoadingMedInfo(true);
    try {
      const details: Record<string, MedicationDetail> = {};
      
      const promises = analysis.medicationList.map(async (med) => {
        const info = await generateMedicationInfo(med.name);
        details[med.name] = {
          name: med.name,
          ...info
        };
      });
      
      await Promise.all(promises);
      setMedicationDetails(details);
    } catch (error) {
      console.error("Error loading medication details:", error);
    } finally {
      setIsLoadingMedInfo(false);
    }
  };
  
  const loadTodoList = async () => {
    setIsLoadingTodos(true);
    try {
      const todos = await generateTodoList(analysis);
      setTodoItems(todos);
    } catch (error) {
      console.error("Error generating todo list:", error);
    } finally {
      setIsLoadingTodos(false);
    }
  };
  
  const loadWorkoutPlan = async () => {
    setIsLoadingWorkout(true);
    try {
      const plan = await generateWorkoutPlan(analysis.condition);
      if (plan) {
        setWorkoutPlan(plan);
      } else {
        setWorkoutPlan(null);
      }
    } catch (error) {
      console.error("Error generating workout plan:", error);
    } finally {
      setIsLoadingWorkout(false);
    }
  };
  
  const handleSaveTodoList = () => {
    if (todoItems) {
      saveTodoListToPersonal(todoItems);
      toast({
        title: "Todo List Saved",
        description: "The todo list has been added to your Personal Tasks.",
      });
    }
  };
  
  const handleSaveWorkout = () => {
    if (workoutPlan) {
      saveWorkoutToPlan(workoutPlan);
      toast({
        title: "Workout Plan Saved",
        description: "The workout plan has been added to your Custom Plans.",
      });
    }
  };
  
  return (
    <div className="healthcare-card glass-card border-white/10 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Prescription Analysis</h2>
        <Button variant="outline" onClick={onReset}>Analyze Another</Button>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-center mb-6">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-healthcare-500 text-white' : 'bg-gray-800 text-gray-500'}`}>
              1
            </div>
            <div className={`w-16 h-1 ${currentStep >= 2 ? 'bg-healthcare-500' : 'bg-gray-800'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-healthcare-500 text-white' : 'bg-gray-800 text-gray-500'}`}>
              2
            </div>
            <div className={`w-16 h-1 ${currentStep >= 3 ? 'bg-healthcare-500' : 'bg-gray-800'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-healthcare-500 text-white' : 'bg-gray-800 text-gray-500'}`}>
              3
            </div>
          </div>
        </div>
      </div>
      
      {currentStep === 1 && (
        <div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Medication Details</TabsTrigger>
              <TabsTrigger value="sideEffects">Side Effects</TabsTrigger>
              <TabsTrigger value="diet">Dietary Advice</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="space-y-6">
                <div className="bg-healthcare-500/10 p-4 rounded-lg">
                  <h3 className="font-medium text-healthcare-500 mb-2">Condition</h3>
                  <p className="text-white">{analysis.condition}</p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3 text-white">Medications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.medicationList.map((med, index) => (
                      <div key={index} className="flex items-start p-4 bg-black/20 border border-white/10 rounded-lg hover:bg-primary/5 transition-colors">
                        <div className="mr-3">
                          <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                            <Pill className="h-5 w-5 text-blue-500" />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{med.name}</h4>
                          <p className="text-sm text-gray-400">
                            {med.dosage} • {med.frequency} • {med.duration}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3 text-white">Summary</h3>
                  <p className="text-gray-300">{analysis.summary}</p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3 text-white">Recommendations</h3>
                  <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                    <ul className="space-y-3">
                      {analysis.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-healthcare-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="details">
              {isLoadingMedInfo ? (
                <div className="py-8 flex justify-center">
                  <div className="text-center">
                    <LoadingSpinner size="md" color="text-healthcare-500" />
                    <p className="mt-4 text-gray-300">Loading medication details...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {analysis.medicationList.map((med, index) => {
                    const details = medicationDetails[med.name] || {
                      name: med.name,
                      description: "Detailed information is being fetched.",
                      sideEffects: ["Information not available yet"],
                      precautions: ["Consult your healthcare provider"],
                      interactions: []
                    };
                    
                    return (
                      <Card key={index} className="bg-black/20 border border-white/10">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-white flex items-center gap-2">
                            <Pill className="h-5 w-5 text-blue-500" />
                            {med.name} ({med.dosage})
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-400 mb-1">Description</h4>
                            <p className="text-gray-300">{details.description}</p>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-gray-400 mb-1">
                              <span className="flex items-center gap-1">
                                <Info className="h-4 w-4 text-blue-500" />
                                Dosage Information
                              </span>
                            </h4>
                            <p className="text-gray-300">
                              {med.dosage} to be taken {med.frequency} for {med.duration}.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="sideEffects">
              <div className="space-y-6">
                {analysis.sideEffects ? (
                  analysis.sideEffects.map((item, index) => (
                    <Card key={index} className="bg-black/20 border border-white/10">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-white flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-amber-500" />
                          {item.medication} Side Effects
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {item.effects.map((effect, i) => (
                            <li key={i} className="text-gray-300 text-sm flex items-start">
                              <AlertTriangle className="h-4 w-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                              {effect}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <h4 className="text-sm font-medium text-gray-400 mb-2">
                            <span className="flex items-center gap-1">
                              <Shield className="h-4 w-4 text-healthcare-500" />
                              Managing Side Effects
                            </span>
                          </h4>
                          <p className="text-sm text-gray-300">
                            If you experience severe side effects, contact your healthcare provider immediately. 
                            Minor side effects often resolve as your body adjusts to the medication.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="py-6 text-center">
                    <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">Side Effects Information</h3>
                    <p className="text-gray-400 max-w-md mx-auto">
                      Please consult your healthcare provider for detailed information 
                      about potential side effects for your medications.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="diet">
              <div className="space-y-6">
                <Card className="bg-black/20 border border-white/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Utensils className="h-5 w-5 text-green-500" />
                      Dietary Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analysis.dietaryRecommendations ? (
                      <ul className="space-y-3">
                        {analysis.dietaryRecommendations.map((rec, i) => (
                          <li key={i} className="text-gray-300 flex items-start">
                            <Utensils className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="py-4 text-center">
                        <p className="text-gray-400">
                          General dietary advice based on your medications:
                        </p>
                        <ul className="mt-4 space-y-2 text-left">
                          <li className="text-gray-300 flex items-start">
                            <Utensils className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            Stay hydrated by drinking plenty of water throughout the day
                          </li>
                          <li className="text-gray-300 flex items-start">
                            <Utensils className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            Maintain a balanced diet rich in fruits, vegetables, and whole grains
                          </li>
                          <li className="text-gray-300 flex items-start">
                            <Utensils className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            Limit alcohol consumption while taking medications
                          </li>
                          <li className="text-gray-300 flex items-start">
                            <Utensils className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            Consider foods rich in probiotics if taking antibiotics
                          </li>
                        </ul>
                      </div>
                    )}
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">
                        <span className="flex items-center gap-1">
                          <Info className="h-4 w-4 text-blue-500" />
                          Important Note
                        </span>
                      </h4>
                      <p className="text-sm text-gray-300">
                        These dietary recommendations are general guidelines based on your medications. 
                        Always consult with your healthcare provider for personalized advice.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-8">
            <Button 
              className="healthcare-button-primary w-full md:w-auto bg-gradient-to-r from-blue-600 to-primary hover:opacity-90"
              onClick={() => setCurrentStep(2)}
            >
              Generate To-Do List <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {currentStep === 2 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-white">Your Health To-Do List</h3>
            
            {todoItems && todoItems.length > 0 && (
              <Button 
                className="flex items-center text-sm gap-1 bg-gradient-to-r from-green-600 to-green-700 hover:opacity-90"
                onClick={handleSaveTodoList}
              >
                <Save className="h-4 w-4" />
                Save to Personal Tasks
              </Button>
            )}
          </div>
          
          {isLoadingTodos ? (
            <div className="py-8 flex justify-center">
              <div className="text-center">
                <LoadingSpinner size="md" color="text-healthcare-500" />
                <p className="mt-4 text-gray-300">Generating your personalized to-do list...</p>
              </div>
            </div>
          ) : (
            <>
              {todoItems && (
                <TodoList 
                  todos={todoItems}
                  onToggle={() => {}} 
                  onDelete={() => {}} 
                  isLoading={false} 
                />
              )}
              
              <div className="mt-8 flex space-x-4">
                <Button 
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                >
                  Back to Analysis
                </Button>
                <Button 
                  className="healthcare-button-primary bg-gradient-to-r from-blue-600 to-primary hover:opacity-90"
                  onClick={() => setCurrentStep(3)}
                >
                  Get Workout Recommendations <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      )}
      
      {currentStep === 3 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-white">Recommended Workout Plan</h3>
            
            {workoutPlan && (
              <Button 
                className="flex items-center text-sm gap-1 bg-gradient-to-r from-green-600 to-green-700 hover:opacity-90"
                onClick={handleSaveWorkout}
              >
                <Save className="h-4 w-4" />
                Save to My Workouts
              </Button>
            )}
          </div>
          
          {isLoadingWorkout ? (
            <div className="py-8 flex justify-center">
              <div className="text-center">
                <LoadingSpinner size="md" color="text-healthcare-500" />
                <p className="mt-4 text-gray-300">Generating workout recommendations...</p>
              </div>
            </div>
          ) : (
            <>
              {workoutPlan ? (
                <WorkoutPlanComponent 
                  plan={workoutPlan}
                />
              ) : (
                <div className="py-8 text-center bg-black/20 rounded-lg border border-white/10">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-white mb-2">No Workout Plan Available</h4>
                  <p className="text-gray-400 max-w-md mx-auto">
                    Based on your current condition, we don't recommend specific exercises at this time.
                    Focus on following your medication schedule and rest as needed.
                  </p>
                </div>
              )}
              
              <div className="mt-8 flex space-x-4">
                <Button 
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                >
                  Back to To-Do List
                </Button>
                <Button 
                  className="healthcare-button-primary bg-gradient-to-r from-blue-600 to-primary hover:opacity-90"
                  onClick={onReset}
                >
                  Analyze Another Prescription
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PrescriptionAnalysis;
