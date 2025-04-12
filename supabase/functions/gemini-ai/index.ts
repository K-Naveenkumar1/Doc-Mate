
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.3.0/mod.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set");
    }

    const { prompt, type, image } = await req.json();

    if (!prompt && !image) {
      throw new Error("Request must include either a prompt or an image");
    }

    let apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/";
    let requestBody: any = {};

    // Determine which Gemini model to use based on the request type
    if (type === "vision" && image) {
      apiUrl += "gemini-pro-vision:generateContent";
      // Parse the base64 image for the Gemini API
      const base64Data = image.split(",")[1] || image;
      
      requestBody = {
        contents: [
          {
            parts: [
              { text: prompt || "Analyze this image" },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: base64Data
                }
              }
            ]
          }
        ]
      };
    } else {
      apiUrl += "gemini-pro:generateContent";
      requestBody = {
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ]
      };
    }

    // Add API key to URL
    apiUrl += `?key=${GEMINI_API_KEY}`;

    // Make request to Gemini API
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", data);
      throw new Error(data.error?.message || "Error calling Gemini API");
    }

    // Extract the generated text from the response
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated";

    return new Response(
      JSON.stringify({ result }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  } catch (error) {
    console.error("Error in gemini-ai function:", error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});
