import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '@callrep/database';
import { ListIssuesResponse } from '@callrep/shared';
import { listIssuesSchema } from '../utils/validation';

export const issuesRouter = Router();

/**
 * GET /api/issues
 * List all issues, optionally filtered by category or representative
 */
issuesRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = listIssuesSchema.parse(req.query);

    const where: any = { active: true };
    if (query.category) {
      where.category = query.category;
    }
    if (query.representativeId) {
      where.representatives = {
        some: {
          representativeId: query.representativeId
        }
      };
    }

    const issues = await prisma.issue.findMany({
      where,
      include: {
        scripts: {
          where: { active: true },
          select: {
            id: true,
            title: true,
            description: true
          }
        },
        representatives: {
          include: {
            representative: {
              select: {
                id: true,
                name: true,
                title: true,
                state: true
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    const response: ListIssuesResponse = {
      issues: issues.map(issue => ({
        id: issue.id,
        name: issue.name,
        description: issue.description,
        category: issue.category,
        scripts: issue.scripts.map(script => ({
          id: script.id,
          title: script.title,
          description: script.description || undefined
        })),
        representatives: issue.representatives.map(ri => ({
          id: ri.representative.id,
          name: ri.representative.name,
          title: ri.representative.title,
          state: ri.representative.state
        }))
      }))
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/issues/:id
 * Get a specific issue by ID
 */
issuesRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const issue = await prisma.issue.findUnique({
      where: { id: req.params.id },
      include: {
        scripts: {
          where: { active: true }
        },
        representatives: {
          include: {
            representative: true
          }
        }
      }
    });

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    res.json({
      id: issue.id,
      name: issue.name,
      description: issue.description,
      category: issue.category,
      scripts: issue.scripts.map(script => ({
        id: script.id,
        title: script.title,
        description: script.description,
        content: script.content
      })),
      representatives: issue.representatives.map(ri => ({
        id: ri.representative.id,
        name: ri.representative.name,
        title: ri.representative.title,
        state: ri.representative.state,
        district: ri.representative.district
      }))
    });
  } catch (error) {
    next(error);
  }
});
