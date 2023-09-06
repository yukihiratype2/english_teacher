import OpenAI from 'openai';
import { ChatMessage } from './types';

const openai = new OpenAI({
  apiKey: 'nk-OnlyBysd@41707', // defaults to process.env["OPENAI_API_KEY"]
  baseURL: 'https://chat.taos7.top/api/openai/v1', // defaults to https://api.openai.com/v1
});


const systemPrompt = "As an AI, I want you to act an enthusiastic and encouraging English mentor. As we converse in English, You will refining my language skills. Please correct any grammatical errors, typos, or inaccuracies in my statements. Feel free to challenge me with thought-provoking questions that stimulate my learning and deepen my understanding. Your role is not just to teach, but to inspire a love for the English language in me."


async function teacher(response: string, history: ChatMessage[]) {
  const completion = await openai.chat.completions.create({
    messages: [{ role: 'system', content: systemPrompt }, ...history.map(
      (message) => ({ role: message.role, content: message.text })
    ), {
      role: 'user',
      content: response,
    }],
    temperature: 0.8,
    model: 'gpt-3.5-turbo',
  });
  return completion.choices[0].message;
}


// const res = await api.sendMessage(message, {
//   systemMessage: `Your job is act as a professional react developer and you follow instructions very well. `,
// })
// return res.text



export default teacher