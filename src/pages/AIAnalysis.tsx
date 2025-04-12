
import React, { useState } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/UI/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/UI/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/UI/tabs";
import { Progress } from "@/components/UI/progress";
import { Mic, Upload, BarChart3, BrainCircuit, MessageSquare, AlarmClock, Activity } from "lucide-react";
import { toast } from "sonner";
import { analyzeText, analyzeAudio, GeminiAnalysisResult } from "@/services/geminiService";

interface AnalysisResult {
  overall: string;
  indicators: {
    depression: number;
    anxiety: number;
    ptsd: number;
  };
  recommendations: string[];
}

const AIAnalysis: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("text");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [textInput, setTextInput] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<GeminiAnalysisResult | null>(null);
  
  const handleStartRecording = () => {
    toast.info("Starting voice recording...");
    setIsRecording(true);
    setRecordingSeconds(0);
    
    // Start a timer to track recording duration
    const interval = setInterval(() => {
      setRecordingSeconds(prev => {
        if (prev >= 60) {
          clearInterval(interval);
          handleStopRecording();
          return 60;
        }
        return prev + 1;
      });
    }, 1000);
    
    // Store the interval ID so we can clear it later
    (window as any).recordingInterval = interval;
  };
  
  const handleStopRecording = async () => {
    clearInterval((window as any).recordingInterval);
    setIsRecording(false);
    toast.success("Recording stopped");
    
    // In a real app, we would process the audio recording here
    setIsAnalyzing(true);
    try {
      // Create a mock audio file for demonstration
      const mockAudioFile = new File([""], "recording.wav", { type: "audio/wav" });
      const result = await analyzeAudio(mockAudioFile);
      setAnalysisResult(result);
    } catch (error) {
      toast.error("Error analyzing audio");
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) {
      toast.error("Please upload an audio or video file");
      return;
    }
    
    toast.info(`Processing ${file.name}...`);
    setIsAnalyzing(true);
    
    try {
      const result = await analyzeAudio(file);
      setAnalysisResult(result);
      toast.success("Analysis complete");
    } catch (error) {
      toast.error("Error analyzing file");
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleAnalyzeText = async () => {
    if (!textInput.trim()) {
      toast.error("Please enter some text to analyze");
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      const result = await analyzeText(textInput);
      setAnalysisResult(result);
      toast.success("Analysis complete");
    } catch (error) {
      toast.error("Error analyzing text");
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const getScoreColor = (score: number) => {
    if (score < 0.3) return "bg-green-500";
    if (score < 0.6) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  const getRiskBadgeColor = (risk: "low" | "moderate" | "high") => {
    switch (risk) {
      case "low":
        return "bg-green-500/20 text-green-500 border-green-500/30";
      case "moderate":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
      case "high":
        return "bg-red-500/20 text-red-500 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-500 border-gray-500/30";
    }
  };
  
  return (
    <Container>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-primary bg-clip-text text-transparent">
            Mental Health Analysis
          </h1>
          <p className="text-gray-400 mt-2">
            Analyze speech patterns and language to detect early signs of mental health conditions
          </p>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Input Section */}
          <div className="xl:col-span-2">
            <Card className="glass-card border-white/10 backdrop-blur-sm h-full">
              <CardHeader>
                <CardTitle className="text-white">Input</CardTitle>
                <CardDescription className="text-gray-400">
                  Upload audio or enter text to analyze patient interactions
                </CardDescription>
                
                <Tabs defaultValue="text" value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="text" className="flex items-center gap-1">
                      <MessageSquare size={16} />
                      <span>Text</span>
                    </TabsTrigger>
                    <TabsTrigger value="record" className="flex items-center gap-1">
                      <Mic size={16} />
                      <span>Record</span>
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="flex items-center gap-1">
                      <Upload size={16} />
                      <span>Upload</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="text" className="mt-0">
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Enter patient conversation or notes here..."
                        className="min-h-[200px] bg-black/20 border-white/10 text-white"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                      />
                      <Button 
                        onClick={handleAnalyzeText} 
                        className="w-full bg-gradient-to-r from-blue-600 to-primary hover:opacity-90"
                        disabled={isAnalyzing || !textInput.trim()}
                      >
                        {isAnalyzing ? "Analyzing..." : "Analyze Text"}
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="record" className="mt-0">
                    <div className="space-y-6 flex flex-col items-center text-center">
                      <div className="w-24 h-24 bg-black/20 rounded-full flex items-center justify-center">
                        <Mic className="h-10 w-10 text-white" />
                      </div>
                      
                      {isRecording && (
                        <div className="w-full flex justify-center mb-4">
                          <Activity className="h-12 w-full text-primary animate-pulse" />
                        </div>
                      )}
                      
                      {isRecording && (
                        <div className="flex items-center gap-2">
                          <AlarmClock className="h-5 w-5 text-red-500" />
                          <span className="text-white font-mono">{recordingSeconds}s</span>
                        </div>
                      )}
                      
                      <Button 
                        onClick={isRecording ? handleStopRecording : handleStartRecording}
                        className={`w-full ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-gradient-to-r from-blue-600 to-primary hover:opacity-90'}`}
                        disabled={isAnalyzing}
                      >
                        {isRecording ? "Stop Recording" : "Start Recording"}
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="upload" className="mt-0">
                    <div className="space-y-4">
                      <div 
                        className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                        onClick={() => document.getElementById('audio-upload')?.click()}
                      >
                        <input
                          id="audio-upload"
                          type="file"
                          accept="audio/*,video/*"
                          className="hidden"
                          onChange={handleFileUpload}
                          disabled={isAnalyzing}
                        />
                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold mb-2 text-white">Upload Audio File</h3>
                        <p className="text-gray-400 text-sm mb-4">
                          Upload audio recordings of patient interactions
                        </p>
                        <Button disabled={isAnalyzing} className="w-full bg-gradient-to-r from-blue-600 to-primary hover:opacity-90">
                          {isAnalyzing ? "Processing..." : "Select File"}
                        </Button>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        <p>Supported formats: MP3, WAV, M4A, MP4</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* CardContent is now empty as TabsContent moved inside Tabs component */}
              </CardContent>
            </Card>
          </div>
          
          {/* Analysis Section */}
          <div className="xl:col-span-3">
            <Card className="glass-card border-white/10 backdrop-blur-sm h-full">
              <CardHeader>
                <CardTitle className="text-white">Analysis Results</CardTitle>
                <CardDescription className="text-gray-400">
                  AI-powered detection of mental health indicators
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-6">
                    <BrainCircuit className="h-16 w-16 text-primary animate-pulse" />
                    <div className="text-center">
                      <h3 className="text-xl font-semibold mb-2 text-white">Analyzing Patterns</h3>
                      <p className="text-gray-400 max-w-md">
                        Our AI is analyzing speech patterns, tone, and word choices to detect potential mental health indicators...
                      </p>
                    </div>
                    <div className="w-full max-w-md">
                      <Progress value={Math.random() * 100} className="h-1" />
                    </div>
                  </div>
                ) : analysisResult ? (
                  <div className="space-y-8">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-1 text-white">Overall Assessment</h3>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskBadgeColor(analysisResult.overallRisk)}`}>
                          {analysisResult.overallRisk.charAt(0).toUpperCase() + analysisResult.overallRisk.slice(1)} Risk
                        </div>
                      </div>
                      <div className="text-right">
                        <Button variant="outline" size="sm" className="text-gray-400 hover:text-white" onClick={() => setAnalysisResult(null)}>
                          Clear Results
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4 text-white">Mental Health Indicators</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Depression */}
                          <Card className="bg-black/20 border-white/10">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base text-white">Depression</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-400 text-sm">Score</span>
                                  <span className="text-white font-bold">
                                    {Math.round(analysisResult.mentalHealthMarkers.depression.score * 100)}%
                                  </span>
                                </div>
                                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${getScoreColor(analysisResult.mentalHealthMarkers.depression.score)}`}
                                    style={{ width: `${analysisResult.mentalHealthMarkers.depression.score * 100}%` }}
                                  ></div>
                                </div>
                                <div className="mt-3">
                                  <span className="text-gray-400 text-sm">Indicators:</span>
                                  <ul className="mt-1 space-y-1 list-disc list-inside text-sm text-white">
                                    {analysisResult.mentalHealthMarkers.depression.indicators.map((indicator, index) => (
                                      <li key={index}>{indicator}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          {/* Anxiety */}
                          <Card className="bg-black/20 border-white/10">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base text-white">Anxiety</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-400 text-sm">Score</span>
                                  <span className="text-white font-bold">
                                    {Math.round(analysisResult.mentalHealthMarkers.anxiety.score * 100)}%
                                  </span>
                                </div>
                                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${getScoreColor(analysisResult.mentalHealthMarkers.anxiety.score)}`}
                                    style={{ width: `${analysisResult.mentalHealthMarkers.anxiety.score * 100}%` }}
                                  ></div>
                                </div>
                                <div className="mt-3">
                                  <span className="text-gray-400 text-sm">Indicators:</span>
                                  <ul className="mt-1 space-y-1 list-disc list-inside text-sm text-white">
                                    {analysisResult.mentalHealthMarkers.anxiety.indicators.map((indicator, index) => (
                                      <li key={index}>{indicator}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          {/* PTSD */}
                          <Card className="bg-black/20 border-white/10">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base text-white">PTSD</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-400 text-sm">Score</span>
                                  <span className="text-white font-bold">
                                    {Math.round(analysisResult.mentalHealthMarkers.ptsd.score * 100)}%
                                  </span>
                                </div>
                                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${getScoreColor(analysisResult.mentalHealthMarkers.ptsd.score)}`}
                                    style={{ width: `${analysisResult.mentalHealthMarkers.ptsd.score * 100}%` }}
                                  ></div>
                                </div>
                                <div className="mt-3">
                                  <span className="text-gray-400 text-sm">Indicators:</span>
                                  <ul className="mt-1 space-y-1 list-disc list-inside text-sm text-white">
                                    {analysisResult.mentalHealthMarkers.ptsd.indicators.map((indicator, index) => (
                                      <li key={index}>{indicator}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-3 text-white">Summary</h3>
                          <div className="p-4 bg-black/20 rounded-lg border border-white/10">
                            <p className="text-gray-300">{analysisResult.summary}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold mb-3 text-white">Recommended Actions</h3>
                          <div className="p-4 bg-black/20 rounded-lg border border-white/10">
                            <ul className="space-y-2">
                              {analysisResult.recommendedActions.map((action, index) => (
                                <li key={index} className="flex items-start">
                                  <BarChart3 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                                  <span className="text-gray-300">{action}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <BrainCircuit className="h-16 w-16 text-gray-600 mb-4" />
                    <h3 className="text-xl font-semibold mb-2 text-white">No Analysis Yet</h3>
                    <p className="text-gray-400 max-w-lg">
                      Use the input options on the left to provide patient interaction data for analysis. Our AI will detect patterns that may indicate mental health concerns.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default AIAnalysis;
