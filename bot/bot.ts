import assert from 'assert';
import { Bot, InputFile, session, webhookCallback } from "grammy";
import { SocksProxyAgent } from "socks-proxy-agent";
import teacher from './teacher';
import { TeacherContext, initial } from './session';
import { ChatRole } from './types';
import { textToSpeech } from './speech';

const socksAgent = new SocksProxyAgent('socks://127.0.0.1:7890');

const token = process.env.TELEGRAM_TOKEN;

const client = process.env.ENV === 'developent' ? {
  baseFetchConfig: {
    agent: socksAgent,
  }
} : undefined;

assert(token, 'Missing TELEGRAM_TOKEN');

const bot = new Bot<TeacherContext>(token, {
  client
});

bot.use(session({ initial }))

bot.command("reset", async (ctx) => {
  ctx.session.messages = [];
  ctx.reply("Conversation reset successfully, teacher is ready to talk again.");
});

bot.command("login", async (ctx) => {
  const token = ctx.match;
  if (token === process.env.TOKEN) {
    ctx.session.token = token;
    return ctx.reply("Login successfully.");
  } else {
    return ctx.reply("Login failed. Enter /login <token> to login.");
  }
});

bot.on("message", async (ctx) => {
  if (ctx.session.token !== process.env.TOKEN) {
    return ctx.reply("Please login first.");
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

      const speechStream = await textToSpeech(res.content ?? '');

      ctx.reply(res.content ?? '', {});

      if (speechStream) {
        ctx.replyWithVoice(
          new InputFile(speechStream),
        );
      }


    } catch (error) {
      console.error(error);
      return ctx.reply('Error', {});
    }
  }
});

await bot.api.setMyCommands([
  { command: "reset", description: "Reset conversation" },
  { command: "login", description: "Login" },
]);

export default bot;
