import { z } from 'zod';

export const zString = z.string();

export const Message = z.object({
  type: z.string(),
  message: z.string(),
});

export type MessageType = z.infer<typeof Message>;