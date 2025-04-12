
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/integrations/supabase/client";

// Check if running in browser environment
const isBrowser = typeof window !== 'undefined';

// This is a placeholder - in production, use environment variables
const API_KEY = "USE_EDGE_FUNCTION_INSTEAD";

// Initialize the Gemini API
const genAI = API_KEY !== "USE_EDGE_FUNCTION_INSTEAD" ? new GoogleGenerativeAI(API_KEY) : null;

export interface GeminiAnalysisResult {
  mentalHealthMarkers: {
    depression: {
      score: number;
      indicators: string[];
    };
    anxiety: {
      score: number;
      indicators: string[];
    };
    ptsd: {
      score: number;
      indicators: string[];
    };
  };
  overallRisk: "low" | "moderate" | "high";
  recommendedActions: string[];
  summary: string;
}

export const analyzeText = async (text: string): Promise<GeminiAnalysisResult> => {
  try {
    // For demonstration purposes, we'll return a mock response
    // In a real application with proper API key, we would use the realGeminiAnalysis function
    console.log("Analyzing text with Gemini API (mock):", text.substring(0, 100) + "...");
    
    // Uncomment this when API key is properly set
    // return await realGeminiAnalysis(text);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock response
    return {
      mentalHealthMarkers: {
        depression: {
          score: 0.45,
          indicators: [
            "Expressions of feeling down or hopeless",
            "Mentions of sleep disturbances",
            "Decreased interest in activities"
          ]
        },
        anxiety: {
          score: 0.65,
          indicators: [
            "Expressions of worry or fear",
            "Mentions of physical symptoms (racing heart, shortness of breath)",
            "Avoidance behaviors described"
          ]
        },
        ptsd: {
          score: 0.25,
          indicators: [
            "Some references to past traumatic experiences",
            "Minimal evidence of flashbacks or intrusive thoughts"
          ]
        }
      },
      overallRisk: "moderate",
      recommendedActions: [
        "Schedule follow-up assessment with mental health professional",
        "Introduce stress reduction techniques",
        "Monitor for changes in symptom severity",
        "Consider referral to anxiety management program"
      ],
      summary: "Analysis indicates moderate anxiety symptoms with some depressive features. Patient's language shows persistent worry patterns and some physical manifestations of anxiety. Recommend further professional assessment."
    };
  } catch (error) {
    console.error("Error analyzing text with Gemini:", error);
    throw error;
  }
};

export const analyzeAudio = async (audioFile: File): Promise<GeminiAnalysisResult> => {
  try {
    // For demonstration purposes, we'll return a mock response
    // In a real application, this would convert the audio to text and call the Gemini API
    console.log("Analyzing audio with Gemini API (mock):", audioFile.name);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock response
    return {
      mentalHealthMarkers: {
        depression: {
          score: 0.72,
          indicators: [
            "Flat affect in vocal tone",
            "Expressions of hopelessness",
            "Cognitive distortions present in speech patterns",
            "Mentions of fatigue and low energy"
          ]
        },
        anxiety: {
          score: 0.38,
          indicators: [
            "Some hesitancy in speech",
            "Occasional catastrophizing"
          ]
        },
        ptsd: {
          score: 0.15,
          indicators: [
            "Minimal indicators detected"
          ]
        }
      },
      overallRisk: "high",
      recommendedActions: [
        "Urgent follow-up with mental health professional recommended",
        "Safety assessment advised",
        "Consider screening for suicidal ideation",
        "Evaluate need for medication management"
      ],
      summary: "Voice analysis indicates significant depressive patterns with moderate emotional distress. Speech patterns show cognitive distortions consistent with depression. Recommend prompt professional mental health evaluation."
    };
  } catch (error) {
    console.error("Error analyzing audio with Gemini:", error);
    throw error;
  }
};

export const analyzePrescription = async (
  prescriptionImage: File, 
  userId?: string
): Promise<any> => {
  try {
    // Convert the image to base64
    const base64Image = await fileToBase64(prescriptionImage);
    
    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('analyze-prescription', {
      body: { 
        image: base64Image,
        userId
      }
    });
    
    if (error) {
      console.error("Error calling analyze-prescription function:", error);
      throw new Error(error.message);
    }
    
    return data.analysis;
  } catch (error) {
    console.error("Error analyzing prescription with Gemini:", error);
    throw error;
  }
};

// Helper function to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Real Gemini API implementation that can be used when API key is properly set
const realGeminiAnalysis = async (text: string): Promise<GeminiAnalysisResult> => {
  try {
    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Craft the prompt with specific instructions for mental health analysis
    const prompt = `
      Analyze the following patient interaction for signs of mental health conditions like depression, anxiety, or PTSD. 
      Focus on tone, speech patterns, word choices, and emotional indicators.
      
      Patient interaction: 
      "${text}"
      
      Provide a structured analysis with:
      1. Depression indicators and severity (0-1 scale)
      2. Anxiety indicators and severity (0-1 scale)
      3. PTSD indicators and severity (0-1 scale)
      4. Overall risk assessment (low/moderate/high)
      5. Recommended actions for healthcare providers
      6. Brief summary of findings
      
      Return the response as properly formatted JSON with this structure:
      {
        "mentalHealthMarkers": {
          "depression": {
            "score": number,
            "indicators": string[]
          },
          "anxiety": {
            "score": number,
            "indicators": string[]
          },
          "ptsd": {
            "score": number,
            "indicators": string[]
          }
        },
        "overallRisk": "low" | "moderate" | "high",
        "recommendedActions": string[],
        "summary": string
      }
    `;
    
    // Generate the response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();
    
    try {
      // Parse the JSON response
      return JSON.parse(textResponse);
    } catch (err) {
      console.error("Error parsing Gemini API response:", err);
      throw new Error("Invalid response format from Gemini API");
    }
  } catch (error) {
    console.error("Error using Gemini API:", error);
    throw error;
  }
};

export const generateMedicationInfo = async (medicationName: string): Promise<{
  description: string;
  sideEffects: string[];
  precautions: string[];
  interactions: string[];
}> => {
  // This would call Gemini API in a real application
  // For now, we'll return mock data for the most common medications
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const medicationInfoDatabase: Record<string, {
    description: string;
    sideEffects: string[];
    precautions: string[];
    interactions: string[];
  }> = {
    "Amoxicillin": {
      description: "Amoxicillin is a penicillin antibiotic that fights bacteria. It is used to treat many different types of infection caused by bacteria, such as tonsillitis, bronchitis, pneumonia, and infections of the ear, nose, throat, skin, or urinary tract.",
      sideEffects: [
        "Diarrhea or loose stools",
        "Stomach pain or discomfort",
        "Nausea or vomiting",
        "Headache",
        "Rash, itching, or hives",
        "Oral thrush (white patches in mouth)"
      ],
      precautions: [
        "Tell your doctor if you have a history of allergic reactions to penicillin antibiotics",
        "Complete the full course even if you feel better",
        "Take with or without food but at evenly spaced intervals",
        "May reduce the effectiveness of birth control pills"
      ],
      interactions: [
        "Probenecid (increases amoxicillin levels)",
        "Allopurinol (increased risk of rash)",
        "Blood thinners like warfarin",
        "Methotrexate (increased toxicity)",
        "Certain antibiotics may decrease effectiveness"
      ]
    },
    "Ibuprofen": {
      description: "Ibuprofen is a nonsteroidal anti-inflammatory drug (NSAID) that reduces hormones causing inflammation and pain in the body. It's commonly used to reduce fever and treat pain or inflammation from headaches, toothaches, back pain, arthritis, or minor injury.",
      sideEffects: [
        "Stomach pain, heartburn, or indigestion",
        "Nausea or vomiting",
        "Diarrhea or constipation",
        "Dizziness or headache",
        "Drowsiness or fatigue",
        "Ringing in ears (tinnitus)",
        "Mild rash or itching"
      ],
      precautions: [
        "Take with food or milk to prevent stomach upset",
        "Use the lowest effective dose for the shortest duration",
        "Avoid alcohol while taking this medication",
        "Not recommended for use during pregnancy, especially in the third trimester",
        "May increase risk of heart attack or stroke with long-term use"
      ],
      interactions: [
        "Aspirin or other NSAIDs (increased bleeding risk)",
        "Blood pressure medications (may decrease effectiveness)",
        "Blood thinners like warfarin (increased bleeding risk)",
        "Lithium (increased lithium levels)",
        "Diuretics (reduced effectiveness)",
        "SSRIs (increased bleeding risk)"
      ]
    },
    "Lisinopril": {
      description: "Lisinopril is an ACE inhibitor that helps relax blood vessels, lowering blood pressure and decreasing workload on the heart. It's used to treat high blood pressure, heart failure, and to improve survival after a heart attack.",
      sideEffects: [
        "Dry, persistent cough",
        "Dizziness or lightheadedness",
        "Headache",
        "Fatigue",
        "Nausea or vomiting",
        "Diarrhea",
        "Skin rash",
        "Increased potassium levels"
      ],
      precautions: [
        "Monitor blood pressure regularly",
        "Report swelling of face, lips, tongue, or difficulty breathing immediately (may indicate angioedema)",
        "Avoid pregnancy (can cause serious birth defects)",
        "May cause sudden drops in blood pressure when standing up",
        "Maintain adequate hydration but avoid potassium supplements unless prescribed"
      ],
      interactions: [
        "Potassium supplements or potassium-sparing diuretics",
        "NSAIDs (may reduce effectiveness)",
        "Lithium (increased lithium levels)",
        "Diabetes medications (may cause low blood sugar)",
        "Salt substitutes containing potassium"
      ]
    }
  };
  
  // Return info for the requested medication or generic info if not found
  return medicationInfoDatabase[medicationName] || {
    description: `${medicationName} is a medication prescribed by your doctor. Always follow your doctor's instructions when taking this medication.`,
    sideEffects: ["Consult your healthcare provider about potential side effects"],
    precautions: ["Take as directed by your healthcare provider", "Do not stop taking without consulting your doctor"],
    interactions: ["Consult your healthcare provider about potential drug interactions"]
  };
};

// New functions to interact with Supabase
export const getPrescriptionHistory = async () => {
  try {
    const { data: prescriptions, error } = await supabase
      .from('prescriptions')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching prescription history:", error);
      throw new Error(error.message);
    }
    
    return prescriptions;
  } catch (error) {
    console.error("Error in getPrescriptionHistory:", error);
    return [];
  }
};

export const getPrescriptionDetails = async (prescriptionId: string) => {
  try {
    // Get the prescription basic info
    const { data: prescription, error: prescriptionError } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('id', prescriptionId)
      .single();
      
    if (prescriptionError) {
      console.error("Error fetching prescription details:", prescriptionError);
      throw new Error(prescriptionError.message);
    }
    
    // Get the detailed analysis data
    const { data: analysis, error: analysisError } = await supabase
      .from('prescription_analyses')
      .select('analysis_data')
      .eq('prescription_id', prescriptionId)
      .single();
      
    if (analysisError && analysisError.code !== 'PGRST116') { // PGRST116 is code for "no rows returned"
      console.error("Error fetching prescription analysis:", analysisError);
      throw new Error(analysisError.message);
    }
    
    return {
      ...prescription,
      analysis: analysis?.analysis_data
    };
  } catch (error) {
    console.error("Error in getPrescriptionDetails:", error);
    return null;
  }
};
