import { prisma } from '@aidvocacy/database';
import { NotFoundError, ValidationError, MakeCallRequest } from '@aidvocacy/shared';
import { ScriptModifier } from './scriptModifier';
import axios from 'axios';

const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL || 'http://localhost:3002';

export class CallService {
  /**
   * Create a new call
   * Validates inputs, modifies script, creates DB record, and triggers agent
   */
  static async createCall(
    representativeId: string,
    scriptId: string,
    personaId: string
  ) {
    // Validate representative exists
    const representative = await prisma.representative.findUnique({
      where: { id: representativeId }
    });

    if (!representative) {
      throw new NotFoundError('Representative not found');
    }

    // Validate script exists and get it with issue
    const script = await prisma.script.findUnique({
      where: { id: scriptId },
      include: { issue: true }
    });

    if (!script) {
      throw new NotFoundError('Script not found');
    }

    if (!script.active) {
      throw new ValidationError('Script is not active');
    }

    // Validate persona exists
    const persona = await prisma.persona.findUnique({
      where: { id: personaId }
    });

    if (!persona) {
      throw new NotFoundError('Persona not found');
    }

    if (!persona.active) {
      throw new ValidationError('Persona is not active');
    }

    // Verify representative handles this issue
    const repIssue = await prisma.representativeIssue.findUnique({
      where: {
        representativeId_issueId: {
          representativeId,
          issueId: script.issueId
        }
      }
    });

    if (!repIssue) {
      throw new ValidationError(
        `Representative ${representative.name} does not handle issue: ${script.issue.name}`
      );
    }

    // Modify script based on persona
    let modifiedScript = ScriptModifier.modifyScript(
      script.content,
      persona.name,
      persona.modifiers as any
    );

    // Replace placeholders
    modifiedScript = ScriptModifier.replacePlaceholders(modifiedScript, {
      REPRESENTATIVE_NAME: representative.name,
      REPRESENTATIVE_TITLE: representative.title,
      LOCATION: `${representative.state}${representative.district ? ` District ${representative.district}` : ''}`,
      CALLER_NAME: 'a constituent' // In future, this could be user's name
    });

    // Create call record
    const call = await prisma.call.create({
      data: {
        representativeId,
        scriptId,
        personaId,
        modifiedScript,
        phoneNumber: representative.phoneNumber,
        status: 'QUEUED'
      }
    });

    // Trigger agent service to make the call
    try {
      const agentRequest: MakeCallRequest = {
        callId: call.id,
        phoneNumber: representative.phoneNumber,
        script: modifiedScript,
        menuSteps: script.menuSteps as any
      };

      // Fire and forget - agent will update call status via callback
      axios.post(`${AGENT_SERVICE_URL}/api/make-call`, agentRequest).catch(err => {
        console.error('Failed to trigger agent service:', err.message);
        // Update call status to failed
        prisma.call.update({
          where: { id: call.id },
          data: {
            status: 'FAILED',
            errorMessage: `Failed to trigger agent service: ${err.message}`
          }
        }).catch(console.error);
      });
    } catch (error) {
      // If we can't reach agent service, mark call as failed
      await prisma.call.update({
        where: { id: call.id },
        data: {
          status: 'FAILED',
          errorMessage: 'Failed to connect to agent service'
        }
      });
      throw error;
    }

    return call;
  }

  /**
   * Get call by ID
   */
  static async getCall(callId: string) {
    const call = await prisma.call.findUnique({
      where: { id: callId },
      include: {
        representative: true,
        script: {
          include: {
            issue: true
          }
        },
        persona: true
      }
    });

    if (!call) {
      throw new NotFoundError('Call not found');
    }

    return call;
  }

  /**
   * Update call status (called by agent service)
   */
  static async updateCallStatus(
    callId: string,
    status: string,
    updates: {
      duration?: number;
      transcript?: string;
      recording?: string;
      errorMessage?: string;
      twilioCallSid?: string;
    }
  ) {
    const call = await prisma.call.findUnique({
      where: { id: callId }
    });

    if (!call) {
      throw new NotFoundError('Call not found');
    }

    return await prisma.call.update({
      where: { id: callId },
      data: {
        status: status as any,
        ...updates,
        completedAt: status === 'COMPLETED' || status === 'FAILED'
          ? new Date()
          : undefined
      }
    });
  }
}
