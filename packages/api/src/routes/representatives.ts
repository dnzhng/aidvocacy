import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '@aidvocacy/database';
import { ListRepresentativesResponse } from '@aidvocacy/shared';
import { listRepresentativesSchema } from '../utils/validation';

export const representativesRouter = Router();

/**
 * GET /api/representatives
 * List all representatives, optionally filtered by state or issue
 */
representativesRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = listRepresentativesSchema.parse(req.query);

    const where: any = {};
    if (query.state) {
      where.state = query.state;
    }
    if (query.issueId) {
      where.issues = {
        some: {
          issueId: query.issueId
        }
      };
    }

    const representatives = await prisma.representative.findMany({
      where,
      include: {
        issues: {
          include: {
            issue: true
          }
        }
      },
      orderBy: [
        { state: 'asc' },
        { name: 'asc' }
      ]
    });

    const response: ListRepresentativesResponse = {
      representatives: representatives.map(rep => ({
        id: rep.id,
        name: rep.name,
        title: rep.title,
        state: rep.state,
        district: rep.district || undefined,
        party: rep.party || undefined,
        photoUrl: rep.photoUrl || undefined,
        issues: rep.issues.map(ri => ({
          id: ri.issue.id,
          name: ri.issue.name,
          category: ri.issue.category
        }))
      }))
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/representatives/:id
 * Get a specific representative by ID
 */
representativesRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const representative = await prisma.representative.findUnique({
      where: { id: req.params.id },
      include: {
        issues: {
          include: {
            issue: true
          }
        }
      }
    });

    if (!representative) {
      return res.status(404).json({ error: 'Representative not found' });
    }

    res.json({
      id: representative.id,
      name: representative.name,
      title: representative.title,
      state: representative.state,
      district: representative.district,
      party: representative.party,
      photoUrl: representative.photoUrl,
      email: representative.email,
      issues: representative.issues.map(ri => ({
        id: ri.issue.id,
        name: ri.issue.name,
        category: ri.issue.category,
        description: ri.issue.description
      }))
    });
  } catch (error) {
    next(error);
  }
});
