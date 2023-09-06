export enum ChatRole {
  TEACHER = 'assistant',
  STUDENT = 'user'
}

export type ChatMessage = {
  role: ChatRole,
  text: string,
}