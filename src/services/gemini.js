import { GoogleGenAI } from "@google/genai";

const MAX_ATTEMPTS = 3;
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

let client;
const getClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw Object.assign(new Error("GEMINI_API_KEY is not configured"), { status: 500 });
  }
  if (!client) client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return client;
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Improve post content with Gemini.
 * @param {{title:string, description?:string, content:string}} post
 * @param {{buffer:Buffer, mimetype:string}=} file optional reference document (PDF/TXT)
 */
export const improveContent = async (post, file) => {
  const ai = getClient();

  const instruction = `You are an expert editor. Improve the blog post content below:
- fix grammar, spelling and punctuation
- improve clarity, flow and structure
- keep the original meaning, facts and the author's voice
- do not add information that is not supported by the original
${file ? "- use the attached document only as reference material\n" : ""}
Return ONLY the improved content as plain text/markdown, with no preface or explanation.

Title: ${post.title}
Description: ${post.description || "N/A"}

Content:
${post.content}`;

  const parts = [{ text: instruction }];
  if (file) {
    parts.push({
      inlineData: { mimeType: file.mimetype, data: file.buffer.toString("base64") },
    });
  }

  let response;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
        contents: [{ role: "user", parts }],
      });
      break;
    } catch (err) {
      if (!RETRYABLE_STATUS_CODES.has(err.status) || attempt === MAX_ATTEMPTS) {
        throw err;
      }
      await delay(500 * 2 ** (attempt - 1));
    }
  }

  const text = (response.text || "").trim();
  if (!text) throw Object.assign(new Error("AI returned an empty response"), { status: 502 });
  return text;
};
