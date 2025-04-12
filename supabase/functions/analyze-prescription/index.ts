
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

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
    const { image, userId } = await req.json();
    
    if (!image) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Process image with Gemini API
    const analysisResult = await analyzePrescriptionWithGemini(image);
    
    // Save the result to Supabase if userId is provided
    let prescriptionId = null;
    if (userId && analysisResult) {
      // Save the prescription details
      const { data: prescriptionData, error: prescriptionError } = await supabase
        .from('prescriptions')
        .insert({
          user_id: userId,
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
      } else {
        prescriptionId = prescriptionData.id;
        
        // Save the full analysis data
        const { error: analysisError } = await supabase
          .from('prescription_analyses')
          .insert({
            prescription_id: prescriptionId,
            analysis_data: analysisResult,
          });

        if (analysisError) {
          console.error('Error saving analysis:', analysisError);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        analysis: analysisResult, 
        prescriptionId 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in analyze-prescription function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function analyzePrescriptionWithGemini(imageBase64: string) {
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
    
    const data = await response.json();
    
    // Process Gemini response to structured format
    if (data.candidates && data.candidates.length > 0) {
      const textContent = data.candidates[0].content.parts[0].text;
      
      // Parse the text content into structured data
      // This is a simplified example of parsing logic
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

// Helper functions to extract information from the AI response
function extractMedications(text: string) {
  // Simplified medication extraction - in a real app, this would be more sophisticated
  const medications = [];
  
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

function extractCondition(text: string) {
  // Look for condition mentions
  const conditionMatches = text.match(/(?:condition|diagnosis|treating|for|indicated for):\s*([^,\n.]+)/i);
  return conditionMatches && conditionMatches[1] 
    ? conditionMatches[1].trim() 
    : "Not specified";
}

function extractRecommendations(text: string) {
  // Extract recommendations
  const recommendations = [];
  
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

function summarizeAnalysis(text: string) {
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

function determineWorkoutNeed(condition: string, text: string) {
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
