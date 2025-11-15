import { z } from 'zod';

export const createCallSchema = z.object({
  representativeId: z.string().min(1, 'Representative ID is required'),
  scriptId: z.string().min(1, 'Script ID is required'),
  personaId: z.string().min(1, 'Persona ID is required')
});

export const listRepresentativesSchema = z.object({
  state: z.string().length(2).optional(),
  issueId: z.string().optional()
});

export const listIssuesSchema = z.object({
  category: z.string().optional(),
  representativeId: z.string().optional()
});

export const listScriptsSchema = z.object({
  issueId: z.string().optional()
});
