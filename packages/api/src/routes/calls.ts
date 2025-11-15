import { Router, Request, Response, NextFunction } from 'express';
import { CreateCallRequest, CreateCallResponse, GetCallResponse, CallStatus } from '@aidvocacy/shared';
import { createCallSchema } from '../utils/validation';
import { CallService } from '../services/callService';

export const callsRouter = Router();

/**
 * POST /api/calls
 * Create a new call
 */
callsRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body: CreateCallRequest = createCallSchema.parse(req.body);

    const call = await CallService.createCall(
      body.representativeId,
      body.scriptId,
      body.personaId
    );

    const response: CreateCallResponse = {
      callId: call.id,
      status: call.status as CallStatus,
      message: 'Call queued successfully'
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/calls/:id
 * Get call status and details
 */
callsRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const call = await CallService.getCall(req.params.id);

    const response: GetCallResponse = {
      id: call.id,
      representativeId: call.representativeId,
      scriptId: call.scriptId,
      personaId: call.personaId,
      status: call.status as CallStatus,
      modifiedScript: call.modifiedScript,
      phoneNumber: call.phoneNumber,
      duration: call.duration || undefined,
      transcript: call.transcript || undefined,
      recording: call.recording || undefined,
      errorMessage: call.errorMessage || undefined,
      createdAt: call.createdAt.toISOString(),
      completedAt: call.completedAt?.toISOString(),
      representative: {
        id: call.representative.id,
        name: call.representative.name,
        title: call.representative.title,
        state: call.representative.state,
        district: call.representative.district || undefined
      },
      script: {
        id: call.script.id,
        title: call.script.title,
        description: call.script.description || undefined
      },
      persona: {
        id: call.persona.id,
        name: call.persona.name,
        description: call.persona.description
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/calls/:id/status
 * Update call status (called by agent service)
 */
callsRouter.post('/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, duration, transcript, recording, errorMessage, twilioCallSid } = req.body;

    const call = await CallService.updateCallStatus(
      req.params.id,
      status,
      { duration, transcript, recording, errorMessage, twilioCallSid }
    );

    res.json({
      id: call.id,
      status: call.status,
      message: 'Call status updated'
    });
  } catch (error) {
    next(error);
  }
});
