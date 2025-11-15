import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '@callrep/database';
import { ListScriptsResponse } from '@callrep/shared';
import { listScriptsSchema } from '../utils/validation';

export const scriptsRouter = Router();

/**
 * GET /api/scripts
 * List all scripts, optionally filtered by issue
 */
scriptsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = listScriptsSchema.parse(req.query);

    const where: any = { active: true };
    if (query.issueId) {
      where.issueId = query.issueId;
    }

    const scripts = await prisma.script.findMany({
      where,
      include: {
        issue: true
      },
      orderBy: { title: 'asc' }
    });

    const response: ListScriptsResponse = {
      scripts: scripts.map(script => ({
        id: script.id,
        title: script.title,
        description: script.description || undefined,
        content: script.content,
        issue: {
          id: script.issue.id,
          name: script.issue.name,
          category: script.issue.category
        }
      }))
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/scripts/:id
 * Get a specific script by ID
 */
scriptsRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const script = await prisma.script.findUnique({
      where: { id: req.params.id },
      include: {
        issue: true
      }
    });

    if (!script) {
      return res.status(404).json({ error: 'Script not found' });
    }

    res.json({
      id: script.id,
      title: script.title,
      description: script.description,
      content: script.content,
      issue: {
        id: script.issue.id,
        name: script.issue.name,
        description: script.issue.description,
        category: script.issue.category
      }
    });
  } catch (error) {
    next(error);
  }
});
