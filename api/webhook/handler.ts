import bot from '@/bot/bot';
import { webhookCallback } from 'grammy';
import { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  runtime: 'edge',
};

const hook = webhookCallback(bot, 'https');
 
export default function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  return hook(request, response);
}