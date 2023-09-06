import { Bot, Context, session, SessionFlavor } from "grammy";
import { ChatMessage } from "./types";


interface SessionData {
  messages: ChatMessage[],
  token?: string,
}

export type TeacherContext = Context & SessionFlavor<SessionData>;


export function initial(): SessionData {
  return {
    messages: [],
  };
}