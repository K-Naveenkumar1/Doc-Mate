
import React, { useState } from "react";
import { FileText, Upload, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/UI/button";
import LoadingSpinner from "@/components/UI/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import { analyzePrescription, PrescriptionAnalysis } from "@/services/aiService";

interface PrescriptionUploadProps {
  onAnalysisComplete: (analysis: PrescriptionAnalysis) => void;
}

const PrescriptionUpload: React.FC<PrescriptionUploadProps> = ({ onAnalysisComplete }) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) return;
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG or PDF file",
        variant: "destructive"
      });
      return;
    }
    
    // Check file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB",
        variant: "destructive"
      });
      return;
    }
    
    setFile(selectedFile);
    
    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      // For PDFs, just show an icon
      setPreviewUrl(null);
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files?.length) {
      const droppedFile = e.dataTransfer.files[0];
      
      // Use the same validation as in handleFileChange
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(droppedFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPG, PNG or PDF file",
          variant: "destructive"
        });
        return;
      }
      
      if (droppedFile.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 5MB",
          variant: "destructive"
        });
        return;
      }
      
      setFile(droppedFile);
      
      if (droppedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(droppedFile);
      } else {
        setPreviewUrl(null);
      }
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleAnalysis = async () => {
    if (!file) return;
    
    try {
      setIsAnalyzing(true);
      
      // Analyze prescription using the enhanced AI service
      const analysis = await analyzePrescription(file);
      
      toast({
        title: "Analysis Complete",
        description: "Your prescription has been successfully analyzed."
      });
      
      onAnalysisComplete(analysis);
    } catch (error) {
      console.error("Error analyzing prescription:", error);
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your prescription. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const resetUpload = () => {
    setFile(null);
    setPreviewUrl(null);
  };
  
  return (
    <div className="healthcare-card">
      <h2 className="text-xl font-semibold mb-4">Upload Prescription</h2>
      
      {!file ? (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => document.getElementById('prescription-file')?.click()}
        >
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-healthcare-100 flex items-center justify-center mb-4">
              <Upload className="h-8 w-8 text-healthcare-500" />
            </div>
            <h3 className="text-lg font-medium mb-1 text-gray-500">Upload Prescription</h3>
            <p className="text-gray-500 mb-4">Drag and drop your file here or click to browse</p>
            <p className="text-xs text-gray-400">Supported formats: JPG, PNG, PDF (Max 5MB)</p>
          </div>
          
          <input
            id="prescription-file"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              {previewUrl ? (
                <img src={previewUrl} alt="Prescription preview" className="w-20 h-20 object-cover rounded-md" />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                  <FileText className="h-8 w-8 text-gray-500" />
                </div>
              )}
              <div className="ml-4">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-gray-500">{Math.round(file.size / 1024)} KB</p>
              </div>
            </div>
            <button 
              onClick={resetUpload}
              className="text-gray-400 hover:text-black"
            >
              <X size={20} />
            </button>
          </div>
          
          <div>
            <Button
              onClick={handleAnalysis}
              className="healthcare-button-primary w-full"
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" color="text-white" />
                  <span className="ml-2">Analyzing Prescription...</span>
                </div>
              ) : (
                "Analyze with AI"
              )}
            </Button>
          </div>
        </div>
      )}
      
      <div className="mt-6 bg-blue-50 p-4 rounded-md flex items-start">
        <div className="text-blue-500 mr-3 mt-0.5">
          <AlertCircle size={18} />
        </div>
        <div>
          <p className="text-sm text-blue-800">
            Our AI analyzes your prescription to help you understand your medications and 
            treatment plan. No account required to use this feature.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionUpload;
