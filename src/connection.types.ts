import { z } from 'zod';

export const zString = z.string();

export const Message = z.object({
  type: z.string(),
  message: z.string(),
});

export const PlayerFiredMessage = z.object({
  type: z.string(),
  position: z.object({
    y: z.number(),
    x: z.number(),
  }),
});

export type MessageType = z.infer<typeof Message>;
export type PlayerFiredMessageType = z.infer<typeof PlayerFiredMessage>;