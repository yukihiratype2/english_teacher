import bot from '@/bot/bot';
import { webhookCallback } from 'grammy';
import { NextApiRequest, NextApiResponse } from 'next';


const hook = webhookCallback(bot, 'next-js');
 
export default function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  return hook(request, response);
}