export type ReplyTo = {
  messageId: string;
  text: string;
  senderUsername: string;
};

export type SendMessageData = {
  text: string;
  replyTo?: ReplyTo | null;
};
