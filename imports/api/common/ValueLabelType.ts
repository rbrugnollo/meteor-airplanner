import { z } from 'zod';

export interface ValueLabelType {
  readonly value: string;
  readonly label: string;
}

export const ValueLabelTypeSchema = z.object({
  value: z.string(),
  label: z.string(),
});
