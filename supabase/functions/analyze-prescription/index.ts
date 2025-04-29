import "xhr";
import { serve } from "http/server";
import { createClient } from '@supabase/supabase-js';
import { authenticateUser, getAuthToken } from './auth.ts';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface AnalysisResult {
  medicationList: Medication[];
  condition: string;
  summary: string;
  recommendations: string[];
  needsWorkout: boolean;
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const geminiApiKey = Deno.env.get('GEMINI_API_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const token = getAuthToken(req);
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { user, error: authError } = await authenticateUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { image } = await req.json();
    
    if (!image) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    // Process image with Gemini API
    const analysisResult = await analyzePrescriptionWithGemini(image);
    
    // Save the result to Supabase
    const { data: prescriptionData, error: prescriptionError } = await supabase
      .from('prescriptions')
      .insert({
        user_id: user.id,
        medication_name: analysisResult.medicationList[0]?.name || 'Unknown',
        dosage: analysisResult.medicationList[0]?.dosage || 'Unknown',
        frequency: analysisResult.medicationList[0]?.frequency || 'Unknown',
        duration: analysisResult.medicationList[0]?.duration || 'Unknown',
        condition: analysisResult.condition,
        summary: analysisResult.summary,
        recommendations: analysisResult.recommendations,
      })
      .select()
      .single();

    if (prescriptionError) {
      console.error('Error saving prescription:', prescriptionError);
      return new Response(
        JSON.stringify({ error: 'Failed to save prescription' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Save the full analysis data
    const { error: analysisError } = await supabase
      .from('prescription_analyses')
      .insert({
        prescription_id: prescriptionData.id,
        analysis_data: analysisResult,
      });

    if (analysisError) {
      console.error('Error saving analysis:', analysisError);
      return new Response(
        JSON.stringify({ error: 'Failed to save analysis' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        analysis: analysisResult, 
        prescriptionId: prescriptionData.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in analyze-prescription function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function analyzePrescriptionWithGemini(imageBase64: string): Promise<AnalysisResult> {
  try {
    // Extract the base64 data from the data URL if necessary
    const base64Data = imageBase64.includes(',') 
      ? imageBase64.split(',')[1]
      : imageBase64;
    
    const url = "https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent";
    
    const payload = {
      contents: [
        {
          parts: [
            {
              text: "Analyze this medical prescription image. Extract all medication details, including name, dosage, frequency, and duration. Identify the medical condition being treated if possible. Provide a structured analysis with recommendations for the patient."
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1024
      }
    };
    
    const response = await fetch(`${url}?key=${geminiApiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Process Gemini response to structured format
    if (data.candidates && data.candidates.length > 0) {
      const textContent = data.candidates[0].content.parts[0].text;
      
      const medications = extractMedications(textContent);
      const condition = extractCondition(textContent);
      const recommendations = extractRecommendations(textContent);
      
      return {
        medicationList: medications,
        condition: condition || "Not specified",
        summary: summarizeAnalysis(textContent),
        recommendations: recommendations,
        needsWorkout: determineWorkoutNeed(condition, textContent)
      };
    }
    
    throw new Error("Failed to get a proper response from Gemini");
  } catch (error) {
    console.error("Error analyzing with Gemini:", error);
    throw error;
  }
}

function extractMedications(text: string): Medication[] {
  const medications: Medication[] = [];
  
  // Look for medication patterns
  const medRegex = /medication:\s*([^,\n]+).*?dosage:\s*([^,\n]+).*?frequency:\s*([^,\n]+).*?duration:\s*([^,\n]+)/gi;
  let match;
  
  while ((match = medRegex.exec(text)) !== null) {
    medications.push({
      name: match[1].trim(),
      dosage: match[2].trim(),
      frequency: match[3].trim(),
      duration: match[4].trim()
    });
  }
  
  // Fallback if the regex doesn't match
  if (medications.length === 0) {
    // Try to extract at least medication names
    const possibleMeds = text.match(/(?:prescribed|medication|drug|tablet|capsule):\s*([^,\n.]+)/gi);
    if (possibleMeds && possibleMeds.length > 0) {
      for (const med of possibleMeds) {
        const name = med.split(':')[1]?.trim() || "Unknown medication";
        medications.push({
          name,
          dosage: "As directed",
          frequency: "As directed",
          duration: "As directed"
        });
      }
    } else {
      // Default fallback if no medications found
      medications.push({
        name: "Could not clearly identify medication",
        dosage: "Please consult healthcare provider",
        frequency: "Please consult healthcare provider",
        duration: "Please consult healthcare provider"
      });
    }
  }
  
  return medications;
}

function extractCondition(text: string): string {
  // Look for condition mentions
  const conditionMatches = text.match(/(?:condition|diagnosis|treating|for|indicated for):\s*([^,\n.]+)/i);
  return conditionMatches && conditionMatches[1] 
    ? conditionMatches[1].trim() 
    : "Not specified";
}

function extractRecommendations(text: string): string[] {
  const recommendations: string[] = [];
  
  // Look for recommendation sections
  const recSection = text.match(/recommendation[s]?:?(.*?)(?:\n\n|$)/is);
  
  if (recSection && recSection[1]) {
    // Extract bullet points or numbered recommendations
    const recList = recSection[1].split(/\n-|\n•|\n\d+\./).filter(item => item.trim().length > 0);
    
    for (const rec of recList) {
      recommendations.push(rec.trim());
    }
  }
  
  // If no structured recommendations found, look for advice patterns
  if (recommendations.length === 0) {
    const advicePatterns = [
      /should\s+([^,.]+)/gi,
      /advised\s+to\s+([^,.]+)/gi,
      /recommended\s+to\s+([^,.]+)/gi
    ];
    
    for (const pattern of advicePatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        if (match[1] && match[1].length > 10) { // Minimum length to avoid fragments
          recommendations.push(`${match[0].trim()}.`);
        }
      }
    }
  }
  
  // Default recommendations if none found
  if (recommendations.length === 0) {
    recommendations.push(
      "Take medication as prescribed",
      "Contact your healthcare provider with any questions or concerns",
      "Complete the full course of medication even if symptoms improve"
    );
  }
  
  return recommendations;
}

function summarizeAnalysis(text: string): string {
  // Try to find a summary section
  const summarySection = text.match(/summary:?(.*?)(?:\n\n|$)/is);
  
  if (summarySection && summarySection[1] && summarySection[1].trim().length > 20) {
    return summarySection[1].trim();
  }
  
  // If no summary section, create a brief summary from the whole text
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length > 2) {
    return sentences.slice(0, 2).join(". ") + ".";
  }
  
  return "Analysis completed. Please review the extracted medication details and recommendations.";
}

function determineWorkoutNeed(condition: string, text: string): boolean {
  // Determine if patient should avoid workouts based on condition or text content
  const avoidWorkoutConditions = [
    "fracture", "broken", "respiratory", "infection", "surgery", "acute", "injury",
    "concussion", "fever", "flu", "covid", "pneumonia"
  ];
  
  const lowerText = text.toLowerCase();
  const lowerCondition = condition.toLowerCase();
  
  for (const term of avoidWorkoutConditions) {
    if (lowerCondition.includes(term) || lowerText.includes(term)) {
      return false;
    }
  }
  
  return true;
}
