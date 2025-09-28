
// Optional Gemini AI integration for work log summarization
// This service works without an API key by providing fallback functionality

import { WorkLogEntry } from '../types';

// Check if API key is available
const hasApiKey = typeof process !== 'undefined' && 
                  process.env && 
                  process.env.GEMINI_API_KEY && 
                  process.env.GEMINI_API_KEY.trim() !== '';

// Lazy loading for Gemini API to prevent build failures
let GoogleGenAI: any = null;
let ai: any = null;

const initializeGemini = async () => {
  if (!hasApiKey) {
    return false;
  }

  try {
    // Dynamically import only when needed and API key is available
    const { GoogleGenAI: GenAI } = await import("@google/genai");
    GoogleGenAI = GenAI;
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    return true;
  } catch (error) {
    console.warn('Failed to initialize Gemini API:', error);
    return false;
  }
};

// Fallback summarization function
const generateFallbackSummary = (logs: WorkLogEntry[]): string => {
  if (logs.length === 0) {
    return "No work logs to summarize for the selected period.";
  }

  const tasksByPriority: { [key: string]: string[] } = {
    'Critical': [],
    'High': [],
    'Medium': [],
    'Low': []
  };

  const categories: { [key: string]: number } = {};
  let totalEstimatedHours = 0;
  let completedTasks = 0;

  logs.forEach(log => {
    // Group by priority
    const priority = log.priority || 'Medium';
    if (tasksByPriority[priority]) {
      tasksByPriority[priority].push(log.task);
    }

    // Count categories
    const category = log.category || 'General';
    categories[category] = (categories[category] || 0) + 1;

    // Sum estimated hours
    if (log.estimatedHours) {
      totalEstimatedHours += log.estimatedHours;
    }

    // Count completed tasks
    if (log.isCompleted) {
      completedTasks++;
    }
  });

  const totalTasks = logs.length;
  const completionRate = Math.round((completedTasks / totalTasks) * 100);
  const dateRange = logs.length > 0 ? 
    `${new Date(logs[logs.length - 1].createdAt).toLocaleDateString()} to ${new Date(logs[0].createdAt).toLocaleDateString()}` :
    'N/A';

  let summary = `📊 **Work Summary for ${dateRange}**\n\n`;
  summary += `📈 **Overview**: ${totalTasks} tasks logged with ${completionRate}% completion rate.\n`;
  
  if (totalEstimatedHours > 0) {
    summary += `⏱️ **Time Investment**: ${totalEstimatedHours} estimated hours of work.\n`;
  }

  // Priority breakdown
  const priorityOrder = ['Critical', 'High', 'Medium', 'Low'];
  const activePriorities = priorityOrder.filter(p => tasksByPriority[p].length > 0);
  
  if (activePriorities.length > 0) {
    summary += `\n🎯 **Priority Breakdown**:\n`;
    activePriorities.forEach(priority => {
      const tasks = tasksByPriority[priority];
      summary += `• **${priority}**: ${tasks.length} task${tasks.length > 1 ? 's' : ''}\n`;
    });
  }

  // Category breakdown
  const topCategories = Object.entries(categories)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);
  
  if (topCategories.length > 0) {
    summary += `\n📁 **Top Categories**: ${topCategories.map(([cat, count]) => `${cat} (${count})`).join(', ')}\n`;
  }

  // Recent high-priority tasks
  const highPriorityTasks = [...tasksByPriority['Critical'], ...tasksByPriority['High']].slice(0, 3);
  if (highPriorityTasks.length > 0) {
    summary += `\n🔥 **Key Highlights**:\n`;
    highPriorityTasks.forEach(task => {
      summary += `• ${task}\n`;
    });
  }

  summary += `\n💡 *Note: This summary was generated using built-in analytics. For AI-powered insights, configure the Gemini API key.*`;

  return summary;
};

export const summarizeWorkLogs = async (logs: WorkLogEntry[]): Promise<string> => {
  if (logs.length === 0) {
    return "No work logs to summarize for the selected period.";
  }

  // Try to initialize and use Gemini API if available
  const geminiInitialized = await initializeGemini();
  
  if (geminiInitialized && ai) {
    try {
      const logTasks = logs.map(log => `- [${new Date(log.createdAt || log.id).toLocaleDateString()}] ${log.task}${
        log.description ? ` (${log.description})` : ''
      }`).join('\n');

      const prompt = `
        Based on the following list of tasks, provide a concise summary of the work.
        The summary should be professional, in a single paragraph, and highlight the key accomplishments for the period.

        Tasks:
        ${logTasks}

        Summary:
      `;

      const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return text || generateFallbackSummary(logs);
    } catch (error) {
      console.warn('Gemini API error, using fallback:', error);
      return generateFallbackSummary(logs);
    }
  }

  // Use fallback summary when API is not available
  return generateFallbackSummary(logs);
};