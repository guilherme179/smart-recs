import { z } from 'zod';

export const DeleteUserSchema = z.object({
  id: z.string().uuid('O ID deve ser um UUID válido!'),
});

export type DeleteUserDto = z.infer<typeof DeleteUserSchema>;
