import assert from 'assert';
import { Bot, InputFile, session, webhookCallback } from "grammy";
import { TeacherContext, initial, SessionData } from './session';
import { ChatRole } from './types';
import { textToSpeech } from './speech';
import { corrector, teacher } from './teacher';
import { PassThrough } from 'stream';
import { SocksProxyAgent } from "socks-proxy-agent";
import { freeStorage } from '@grammyjs/storage-free';

const socksAgent = new SocksProxyAgent('socks://localhost:7890');

const client = {
  baseFetchConfig: {
    agent: socksAgent,
    compress: true,
  },
}


const token = process.env.TELEGRAM_TOKEN;

assert(token, 'Missing TELEGRAM_TOKEN');

const bot = new Bot<TeacherContext>(token, {
  client: process.env.NODE_ENV !== 'production' ? client : undefined,
});

bot.use(session({
  initial,
  storage: freeStorage<SessionData>(bot.token),
}))

bot.command("reset", async (ctx) => {
  ctx.session.messages = [];
  ctx.reply("Conversation reset successfully, teacher is ready to talk again.");
});

bot.command("correct", async (ctx) => {
  if (ctx.session.token !== process.env.TOKEN) {
    return ctx.reply("Please login first.");
  }
  const message = ctx.message?.reply_to_message;
  if (!message) {
    return ctx.reply("Please quote the message you want to correct.");
  }
  if (!message.text) {
    return ctx.reply("Only text message can be corrected.");
  }
  const text = message.text;
  const corrected = await corrector(text);
  ctx.replyWithChatAction('typing')
  ctx.reply(corrected.content ?? '', {
    reply_to_message_id: message.message_id,
  });
})

bot.command("login", async (ctx) => {
  if (ctx.session.token === process.env.TOKEN) {
    ctx.reply("You have already logged in.");
    return;
  }
  const token = ctx.match;
  if (token === process.env.TOKEN) {
    ctx.session.token = token;
    ctx.reply("Login successfully.");
    return;
  } else {
    ctx.reply("Login failed. Enter /login <token> to login.");
    return;
  }
});

bot.command("toggle_speech", async (ctx) => {
  ctx.session.ttsEnabled = !ctx.session.ttsEnabled;
  ctx.reply(`Speech cognitive is now ${ctx.session.ttsEnabled ? 'enabled' : 'disabled'}.`);
})

bot.on("message", async (ctx) => {
  if (ctx.session.token !== process.env.TOKEN) {
    ctx.reply("Please login first.");
    return;
  }
  const history = ctx.session.messages;

  if (history.length > 15) {
    history.shift();
  }
  if (ctx.message.text) {
    try {
      ctx.replyWithChatAction('typing')
      const res = await teacher(ctx.message?.text || '', history);
      history.push({
        role: ChatRole.STUDENT,
        text: ctx.message.text,
      })
      history.push({
        role: ChatRole.TEACHER,
        text: res.content ?? '',
      })

      if (ctx.session.ttsEnabled) {
        const speechStream = textToSpeech(res.content ?? '');
        if (speechStream) {
          const buffer = Buffer.from(await speechStream);
          const stream = new PassThrough();
          stream.end(buffer);
          await ctx.replyWithVoice(
            new InputFile(stream),
          );
        }
      }

      await ctx.reply(res.content ?? '', {});

    } catch (error) {
      console.error(error);
      return ctx.reply('Error', {});
    }
  }
});

bot.api.setMyCommands([
  { command: "reset", description: "Reset conversation" },
  { command: "login", description: "Login" },
  { command: "correct", description: "Correct quoted message" },
  { command: "toggle_speech", description: "Toggle speech cognitive" },
]).catch(err => {
  console.error('Error occurred setting commands', err)
});

export default bot;