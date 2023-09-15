import { Bot, Context, session, SessionFlavor } from "grammy";
import { ChatMessage } from "./types";


export interface SessionData {
  messages: ChatMessage[],
  token?: string,
  ttsEnabled: boolean,
}

export type TeacherContext = Context & SessionFlavor<SessionData>;


export function initial(): SessionData {
  return {
    messages: [],
    ttsEnabled: true
  };
}