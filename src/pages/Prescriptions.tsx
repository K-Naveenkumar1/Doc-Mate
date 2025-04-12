
import React, { useState } from "react";
import PrescriptionUpload from "@/components/Prescription/PrescriptionUpload";
import PrescriptionAnalysis from "@/components/Prescription/PrescriptionAnalysis";
import { PrescriptionAnalysis as AnalysisType, getUserPrescriptions } from "@/services/aiService";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/UI/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/UI/tabs";
import { Calendar, Clock, FileText } from "lucide-react";

interface PrescriptionItem {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  condition: string;
  created_at: string;
}

const PrescriptionHistory: React.FC<{
  onSelect: (id: string) => void;
}> = ({ onSelect }) => {
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const data = await getUserPrescriptions();
        setPrescriptions(data);
      } catch (error) {
        console.error("Error fetching prescriptions:", error);
        toast({
          title: "Error",
          description: "Failed to load prescription history",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (prescriptions.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
        <h3 className="text-lg font-medium mb-2">No Prescriptions Yet</h3>
        <p className="text-muted-foreground">
          Upload a prescription to get started with AI analysis
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {prescriptions.map((prescription) => (
        <Card
          key={prescription.id}
          className="hover:bg-accent/5 cursor-pointer transition-colors"
          onClick={() => onSelect(prescription.id)}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{prescription.medication_name}</h3>
                <p className="text-sm text-muted-foreground">{prescription.condition}</p>
                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  <span>{prescription.dosage} · {prescription.frequency}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  <span>{new Date(prescription.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const Prescriptions: React.FC = () => {
  const [analysis, setAnalysis] = useState<AnalysisType | null>(null);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("upload");
  const { toast } = useToast();
  
  const handleAnalysisComplete = (result: AnalysisType) => {
    setAnalysis(result);
    setActiveTab("analysis");
  };
  
  const handleReset = () => {
    setAnalysis(null);
    setSelectedPrescriptionId(null);
    setActiveTab("upload");
  };
  
  const handlePrescriptionSelect = async (id: string) => {
    setSelectedPrescriptionId(id);
    
    try {
      // In a real implementation, we would fetch the prescription details from Supabase
      // For now, we'll set a mock analysis
      const mockAnalysis: AnalysisType = {
        medicationList: [
          { name: "Selected Medication", dosage: "500mg", frequency: "3 times daily", duration: "7 days" }
        ],
        condition: "Previously Analyzed Condition",
        summary: "This is a previously analyzed prescription loaded from your history.",
        recommendations: [
          "Follow the prescribed dosage and frequency",
          "Complete the full course of medication"
        ],
        needsWorkout: false
      };
      
      setAnalysis(mockAnalysis);
      setActiveTab("analysis");
    } catch (error) {
      console.error("Error loading prescription:", error);
      toast({
        title: "Error",
        description: "Failed to load prescription details",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Container>
      <div className="py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gradient">Prescription Management</h1>
          <p className="text-muted-foreground">
            Upload prescriptions for AI analysis and management
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-3xl mx-auto">
          <TabsList className="mb-6">
            <TabsTrigger value="upload">New Analysis</TabsTrigger>
            <TabsTrigger value="history">Prescription History</TabsTrigger>
            {analysis && <TabsTrigger value="analysis">Current Analysis</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="upload">
            <PrescriptionUpload onAnalysisComplete={handleAnalysisComplete} />
          </TabsContent>
          
          <TabsContent value="history">
            <PrescriptionHistory onSelect={handlePrescriptionSelect} />
          </TabsContent>
          
          <TabsContent value="analysis">
            {analysis && (
              <PrescriptionAnalysis analysis={analysis} onReset={handleReset} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Container>
  );
};

export default Prescriptions;
