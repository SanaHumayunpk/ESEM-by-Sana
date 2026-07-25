import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const SYSTEM_PROMPT = `You are a skincare guidance assistant, not a doctor or dermatologist. Given a user's skin type, concerns, sensitivity level, and optionally an image of their face, provide general, safe, non-medical skincare guidance. Always respond in the exact structured JSON format requested by the app (skin_type, top_concerns, morning_routine, night_routine, ingredients_to_look_for, ingredients_to_avoid, disclaimer). Keep advice practical, and prefer ingredient categories widely available in local Pakistani pharmacies/stores over expensive imported brands. Never diagnose a medical skin condition (e.g. eczema, psoriasis, fungal infections) — if the input suggests something beyond routine skincare, say so in the disclaimer and recommend seeing a dermatologist. Never make guarantees about results. Keep tone warm, clear, and encouraging.`;

const skincareAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    skin_type: { type: Type.STRING, description: "Estimated or user's skin type (e.g., Oily, Dry, Combination, Sensitive)" },
    top_concerns: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Top 3 detected or likely skin concerns"
    },
    morning_routine: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          step: { type: Type.INTEGER },
          category: { type: Type.STRING, description: "Cleanser, Treatment, Moisturizer, SPF, etc." },
          title: { type: Type.STRING },
          details: { type: Type.STRING },
          productTip: { type: Type.STRING, description: "Practical tip or affordable Pakistani local brand/category recommendation" }
        },
        required: ["step", "category", "title", "details"]
      }
    },
    night_routine: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          step: { type: Type.INTEGER },
          category: { type: Type.STRING, description: "Cleanser, Treatment, Moisturizer, etc." },
          title: { type: Type.STRING },
          details: { type: Type.STRING },
          productTip: { type: Type.STRING }
        },
        required: ["step", "category", "title", "details"]
      }
    },
    ingredients_to_look_for: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          reason: { type: Type.STRING, description: "1-line reason why this ingredient is helpful" }
        },
        required: ["name", "reason"]
      }
    },
    ingredients_to_avoid: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          reason: { type: Type.STRING, description: "1-line reason why this ingredient should be avoided or used cautiously" }
        },
        required: ["name", "reason"]
      }
    },
    disclaimer: { type: Type.STRING, description: "Must say: General guidance only, not a medical diagnosis." }
  },
  required: [
    "skin_type",
    "top_concerns",
    "morning_routine",
    "night_routine",
    "ingredients_to_look_for",
    "ingredients_to_avoid",
    "disclaimer"
  ]
};

const ingredientCheckSchema = {
  type: Type.OBJECT,
  properties: {
    verdict: { type: Type.STRING, description: "Must strictly be 'Good fit', 'Use with caution', or 'Avoid'" },
    summary: { type: Type.STRING, description: "Clear 2-sentence summary of suitability for user's skin profile" },
    beneficial_ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          reason: { type: Type.STRING }
        },
        required: ["name", "reason"]
      }
    },
    flagged_ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          reason: { type: Type.STRING },
          severity: { type: Type.STRING, description: "mild, moderate, or high" }
        },
        required: ["name", "reason", "severity"]
      }
    },
    recommendation: { type: Type.STRING, description: "Practical advice on how to use or substitute this product" }
  },
  required: ["verdict", "summary", "beneficial_ingredients", "flagged_ingredients", "recommendation"]
};

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "20mb" }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "ESEM Skincare" });
  });

  // 1. Questionnaire Analysis Endpoint
  app.post("/api/gemini/analyze-questionnaire", async (req, res) => {
    try {
      const { skinFeel, mainConcern, sensitivity, currentRoutine } = req.body;
      if (!skinFeel || !mainConcern) {
        return res.status(400).json({ error: "Missing required questionnaire fields." });
      }

      const ai = getGeminiClient();

      const userPrompt = `
User Skincare Questionnaire Details:
- Skin Feel: ${skinFeel}
- Main Skin Concern: ${mainConcern}
- Sensitivity Level: ${sensitivity || 'Medium'}
- Current Routine: ${currentRoutine || 'None / Soap & Water'}

Provide a personalized, practical, safe morning and night routine, ingredients to look for, ingredients to avoid, and disclaimer. Ensure recommendations prefer accessible options available in Pakistani pharmacies (e.g. gentle hydrating cleansers, niacinamide, salicylic acid, gel-based sunscreens, soothing moisturizers).
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: userPrompt,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseSchema: skincareAnalysisSchema,
          temperature: 0.2,
        },
      });

      if (!response.text) {
        throw new Error("No response generated from AI.");
      }

      const parsed = JSON.parse(response.text);
      res.json(parsed);
    } catch (err: any) {
      console.error("Error analyzing questionnaire:", err);
      res.status(500).json({ error: err.message || "Failed to analyze skincare questionnaire." });
    }
  });

  // 2. Photo Analysis Endpoint
  app.post("/api/gemini/analyze-photo", async (req, res) => {
    try {
      const { imageBase64, mimeType } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "Missing image data." });
      }

      const ai = getGeminiClient();

      // Clean up base64 string if data URL prefix exists
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const imageMime = mimeType || "image/jpeg";

      const promptText = `
Analyze the provided selfie for visual skin cues (such as visible shine, dryness, texture, surface redness, dark spots, or enlarged pores).
Important Guidelines:
1. Provide a general visual assessment of skin type and top likely concerns based purely on visual surface indicators.
2. DO NOT make any medical diagnosis or identify medical skin conditions.
3. Formulate a routine tailored to these visual cues with morning/night steps, key ingredients to embrace, and ingredients to avoid.
4. Keep advice encouraging, practical, and aligned with local Pakistani store/pharmacy availability.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: imageMime,
              },
            },
            {
              text: promptText,
            },
          ],
        },
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseSchema: skincareAnalysisSchema,
          temperature: 0.2,
        },
      });

      if (!response.text) {
        throw new Error("No response generated from AI vision model.");
      }

      const parsed = JSON.parse(response.text);
      res.json(parsed);
    } catch (err: any) {
      console.error("Error analyzing selfie photo:", err);
      res.status(500).json({ error: err.message || "Failed to analyze photo." });
    }
  });

  // 3. Ingredient Checker Endpoint
  app.post("/api/gemini/check-ingredients", async (req, res) => {
    try {
      const { ingredientsText, profile } = req.body;
      if (!ingredientsText) {
        return res.status(400).json({ error: "Missing ingredient list." });
      }

      const ai = getGeminiClient();

      const skinContext = profile
        ? `User Skin Profile:
- Skin Type: ${profile.skin_type}
- Top Concerns: ${Array.isArray(profile.top_concerns) ? profile.top_concerns.join(", ") : profile.top_concerns}
- Sensitivity: ${profile.sensitivity || "Medium"}`
        : `User Skin Profile: Standard sensitive/combination skin profile`;

      const userPrompt = `
${skinContext}

Product Ingredient List to evaluate:
"${ingredientsText}"

Task: Analyze this ingredient list specifically for this skin profile. Determine whether this product is a "Good fit", "Use with caution", or "Avoid".
List specific beneficial ingredients present, and flag any ingredients that may irritate, cause breakouts, strip moisture, or trigger sensitivity for this skin type. Provide a short recommendation.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: userPrompt,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseSchema: ingredientCheckSchema,
          temperature: 0.2,
        },
      });

      if (!response.text) {
        throw new Error("No response generated from AI ingredient checker.");
      }

      const parsed = JSON.parse(response.text);
      res.json(parsed);
    } catch (err: any) {
      console.error("Error checking ingredients:", err);
      res.status(500).json({ error: err.message || "Failed to check ingredients." });
    }
  });

  // 4. Routine Check-in Endpoint
  app.post("/api/gemini/routine-checkin", async (req, res) => {
    try {
      const { previousAnalysis, feedbackResponse, note } = req.body;
      if (!previousAnalysis || !feedbackResponse) {
        return res.status(400).json({ error: "Missing previous routine or feedback response." });
      }

      const ai = getGeminiClient();

      const userPrompt = `
Given the user's previous skincare routine and their feedback on how their skin responded, generate an updated routine. Explain in 1-2 sentences what changed and why, referencing their specific feedback. Keep the same structured JSON output format as before, plus a new field 'what_changed' explaining the update.

User's Skin Response Feedback:
- Response status: ${feedbackResponse}
- User's Note: ${note && note.trim() ? note.trim() : 'No additional note provided.'}

Previous Routine JSON:
${JSON.stringify(previousAnalysis, null, 2)}
`;

      const routineCheckinSchema = {
        type: Type.OBJECT,
        properties: {
          ...skincareAnalysisSchema.properties,
          what_changed: {
            type: Type.STRING,
            description: "1-2 sentences explaining what changed in this routine update and why, referencing the user's specific feedback."
          }
        },
        required: [
          "skin_type",
          "top_concerns",
          "morning_routine",
          "night_routine",
          "ingredients_to_look_for",
          "ingredients_to_avoid",
          "disclaimer",
          "what_changed"
        ]
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: userPrompt,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseSchema: routineCheckinSchema,
          temperature: 0.2,
        },
      });

      if (!response.text) {
        throw new Error("No response generated from AI for routine check-in.");
      }

      const parsed = JSON.parse(response.text);
      res.json(parsed);
    } catch (err: any) {
      console.error("Error generating check-in routine update:", err);
      res.status(500).json({ error: err.message || "Failed to generate routine check-in update." });
    }
  });

  // Vite development middleware or production static server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ESEM server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
