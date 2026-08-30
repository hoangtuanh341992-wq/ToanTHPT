import { Question } from '../types';

export interface AICloneOptions {
  difficulty?: 'same' | 'easier' | 'harder';
  customPrompt?: string;
}

/**
 * Call server-side Gemini endpoint to generate 1-5 variants of a single question
 */
export async function cloneQuestionWithAI(
  question: Question,
  count: number = 1,
  options?: AICloneOptions
): Promise<Question[]> {
  try {
    const response = await fetch('/api/ai/clone-question', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        count,
        options,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Yêu cầu thất bại (HTTP ${response.status})`);
    }

    const data = await response.json();
    if (!data.success || !Array.isArray(data.variants)) {
      throw new Error('Dữ liệu trả về từ máy chủ không đúng định dạng.');
    }

    return data.variants;
  } catch (err: any) {
    console.error('Error calling cloneQuestionWithAI:', err);
    throw err;
  }
}

/**
 * Call server-side Gemini endpoint to clone an entire set of exam questions
 */
export async function cloneExamWithAI(
  questions: Question[],
  options?: AICloneOptions
): Promise<Question[]> {
  try {
    const response = await fetch('/api/ai/clone-exam', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        questions,
        options,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Yêu cầu thất bại (HTTP ${response.status})`);
    }

    const data = await response.json();
    if (!data.success || !Array.isArray(data.questions)) {
      throw new Error('Dữ liệu trả về từ máy chủ không đúng định dạng.');
    }

    return data.questions;
  } catch (err: any) {
    console.error('Error calling cloneExamWithAI:', err);
    throw err;
  }
}
