
import { GoogleGenAI } from "@google/genai";
import { WorkLogEntry } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const summarizeWorkLogs = async (logs: WorkLogEntry[]): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Error: API key is not configured. Please set the API_KEY environment variable.";
  }
  
  if (logs.length === 0) {
    return "No work logs to summarize for the selected period.";
  }

  const logTasks = logs.map(log => `- [${new Date(log.id).toLocaleDateString()}] ${log.task}`).join('\n');

  const prompt = `
    Based on the following list of tasks, provide a concise summary of the work.
    The summary should be professional, in a single paragraph, and highlight the key accomplishments for the period.

    Tasks:
    ${logTasks}

    Summary:
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        return `An error occurred while generating the summary: ${error.message}`;
    }
    return "An unknown error occurred while generating the summary.";
  }
};