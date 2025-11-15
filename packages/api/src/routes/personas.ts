import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '@aidvocacy/database';
import { ListPersonasResponse } from '@aidvocacy/shared';

export const personasRouter = Router();

/**
 * GET /api/personas
 * List all active personas
 */
personasRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const personas = await prisma.persona.findMany({
      where: { active: true },
      orderBy: { name: 'asc' }
    });

    const response: ListPersonasResponse = {
      personas: personas.map(persona => ({
        id: persona.id,
        name: persona.name,
        description: persona.description,
        tone: persona.tone
      }))
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/personas/:id
 * Get a specific persona by ID
 */
personasRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const persona = await prisma.persona.findUnique({
      where: { id: req.params.id }
    });

    if (!persona) {
      return res.status(404).json({ error: 'Persona not found' });
    }

    res.json({
      id: persona.id,
      name: persona.name,
      description: persona.description,
      tone: persona.tone
    });
  } catch (error) {
    next(error);
  }
});
