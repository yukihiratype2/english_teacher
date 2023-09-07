import OpenAI from 'openai';
import { ChatMessage } from './types';

const openai = new OpenAI({
  apiKey: 'nk-OnlyBysd@41707', // defaults to process.env["OPENAI_API_KEY"]
  baseURL: 'https://chat.taos7.top/api/openai/v1', // defaults to https://api.openai.com/v1
});




export async function teacher(response: string, history: ChatMessage[]) {
  const systemPrompt = "As an AI, be my English mentor and friend. Correct my language errors, ask stimulating questions, and share brief jokes or stories. Your task is to foster my love for English through concise, engaging, and friendly interactions. Let's keep it short, sweet, and fun."
  const completion = await openai.chat.completions.create({
    messages: [{ role: 'system', content: systemPrompt }, ...history.map(
      (message) => ({ role: message.role, content: message.text })
    ), {
      role: 'user',
      content: response,
    }],
    temperature: 0.9,
    model: 'gpt-3.5-turbo-0613',
  });
  return completion.choices[0].message;
}

export async function corrector(text: string) {
  const systemPrompt = 'As an AI, please embody the role of a professional English teacher. Review the provided content and diligently correct any grammatical errors, typos, or factual inaccuracies you encounter, ensuring the highest standard of language use.'
  const completion = await openai.chat.completions.create({
    messages: [{ role: 'system', content: systemPrompt }, {
      role: 'user',
      content: 'Your are an English teacher and you will correct any mistakes and errors in following content:\n'  + text,
    }],
    temperature: 0.5,
    model: 'gpt-3.5-turbo',
  });
  return completion.choices[0].message;
}


// const res = await api.sendMessage(message, {
//   systemMessage: `Your job is act as a professional react developer and you follow instructions very well. `,
// })
// return res.text


