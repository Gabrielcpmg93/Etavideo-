
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GeminiApiKeyError } from "../types"; // Import the custom error

// This function needs to be outside to avoid re-creation issues and state capture
async function createGeminiClient(): Promise<GoogleGenAI> {
  // CRITICAL: Create a new instance right before making an API call
  // to ensure it always uses the most up-to-date API key.
  // The API key is injected automatically via process.env.API_KEY
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
}

/**
 * Generates a video title based on an image thumbnail using the Gemini API.
 * @param base64ThumbnailData The base64 encoded data string (without "data:image/jpeg;base64,") of the video thumbnail.
 * @param prompt The prompt to use for generating the title.
 * @returns A suggested title string or null if an error occurs.
 * @throws {GeminiApiKeyError} if an API key-related error occurs.
 */
export const generateVideoTitle = async (base64ThumbnailData: string, prompt: string): Promise<string | null> => {
  try {
    const ai = await createGeminiClient();
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64ThumbnailData,
      },
    };
    const textPart = { text: prompt };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview', // High-quality image model for better analysis
      contents: { parts: [imagePart, textPart] },
      config: {
        maxOutputTokens: 50,
        temperature: 0.7,
        topP: 0.95,
        topK: 64,
      },
    });

    const title = response.text?.trim();
    if (title) {
      return title;
    }
    return null;
  } catch (error: any) {
    console.error("Error generating video title:", error);
    if (error.message?.includes("Requested entity was not found.") || error.message?.includes("API key not valid")) {
      throw new GeminiApiKeyError("É necessário selecionar uma API Key paga para usar este recurso avançado (gemini-3-pro-image-preview).");
    }
    throw error; // Re-throw other errors
  }
};

/**
 * Generates a video caption based on an image thumbnail using the Gemini API.
 * @param base64ThumbnailData The base64 encoded data string (without "data:image/jpeg;base66,") of the video thumbnail.
 * @param prompt The prompt to use for generating the caption.
 * @returns A suggested caption string or null if an error occurs.
 * @throws {GeminiApiKeyError} if an API key-related error occurs.
 */
export const generateVideoCaption = async (base64ThumbnailData: string, prompt: string): Promise<string | null> => {
  try {
    const ai = await createGeminiClient();
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64ThumbnailData,
      },
    };
    const textPart = { text: prompt };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview', // High-quality image model for better analysis
      contents: { parts: [imagePart, textPart] },
      config: {
        maxOutputTokens: 150,
        temperature: 0.8,
        topP: 0.95,
        topK: 64,
      },
    });

    const caption = response.text?.trim();
    if (caption) {
      return caption;
    }
    return null;
  } catch (error: any) {
    console.error("Error generating video caption:", error);
    if (error.message?.includes("Requested entity was not found.") || error.message?.includes("API key not valid")) {
      throw new GeminiApiKeyError("É necessário selecionar uma API Key paga para usar este recurso avançado (gemini-3-pro-image-preview).");
    }
    throw error; // Re-throw other errors
  }
};

/**
 * Generates a concise summary for a video based on its thumbnail using the Gemini API.
 * @param base64ThumbnailData The base64 encoded data string (without "data:image/jpeg;base64,") of the video thumbnail.
 * @param prompt The prompt to use for generating the summary.
 * @returns A suggested summary string or null if an error occurs.
 * @throws {GeminiApiKeyError} if an API key-related error occurs.
 */
export const generateVideoSummary = async (base64ThumbnailData: string, prompt: string): Promise<string | null> => {
  try {
    const ai = await createGeminiClient();
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64ThumbnailData,
      },
    };
    const textPart = { text: prompt };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Using gemini-2.5-flash for faster, cost-effective text summary
      contents: { parts: [imagePart, textPart] },
      config: {
        maxOutputTokens: 80,
        temperature: 0.6,
      },
    });

    const summary = response.text?.trim();
    if (summary) {
      return summary;
    }
    return null;
  } catch (error: any) {
    console.error("Error generating video summary:", error);
    if (error.message?.includes("Requested entity was not found.") || error.message?.includes("API key not valid")) {
      throw new GeminiApiKeyError("É necessário selecionar uma API Key paga para usar este recurso avançado (gemini-2.5-flash).");
    }
    throw error; // Re-throw other errors
  }
};