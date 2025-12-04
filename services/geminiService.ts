import { GoogleGenAI } from "@google/genai";
import { Task, User } from "../types";

// Safety check for process.env to avoid runtime crashes in browser
const apiKey = typeof process !== 'undefined' && process.env ? process.env.API_KEY : '';
const ai = new GoogleGenAI({ apiKey: apiKey });

export const generateTeamSummary = async (tasks: Task[], users: User[]): Promise<string> => {
  try {
    // Prepare data for the prompt
    const today = new Date().setHours(0, 0, 0, 0);
    const recentTasks = tasks.filter(t => t.createdAt >= today || (t.completedAt && t.completedAt >= today));
    
    if (recentTasks.length === 0) {
      return "今天还没有记录任务。";
    }

    const taskData = recentTasks.map(t => {
      const user = users.find(u => u.id === t.userId);
      return {
        user: user ? user.name : '未知用户',
        task: t.content,
        status: t.isCompleted ? '已完成' : '待办'
      };
    });

    const prompt = `
      你是一个得力的项目经理助理。
      请分析团队今天的以下任务列表，并生成一份简明、积极、专业的“每日站会总结报告”。
      
      请重点包含：
      1. 主要成就（已完成的任务）。
      2. 进行中的工作（待办任务）。
      3. 一句简短的鼓励性结语。

      请使用清晰的 Markdown 格式输出。使用要点列表。务必使用中文回答。
      
      任务数据:
      ${JSON.stringify(taskData, null, 2)}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "无法生成总结。";
  } catch (error) {
    console.error("Error generating summary:", error);
    return "生成总结失败。请检查您的 API 密钥并重试。";
  }
};