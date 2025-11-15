import axios from 'axios';
import { CallStatusUpdate } from '@callrep/shared';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

export class ApiCallbackService {
  /**
   * Update call status in the main API
   */
  static async updateCallStatus(callId: string, update: CallStatusUpdate): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/api/calls/${callId}/status`, update);
      console.log(`Updated call ${callId} status to ${update.status}`);
    } catch (error: any) {
      console.error(`Failed to update call ${callId} status:`, error.message);
      // Don't throw - we don't want to fail the call flow due to callback issues
    }
  }

  /**
   * Mark call as in progress
   */
  static async markInProgress(callId: string, twilioCallSid: string): Promise<void> {
    await this.updateCallStatus(callId, {
      callId,
      status: 'IN_PROGRESS' as any,
      twilioCallSid
    });
  }

  /**
   * Mark call as completed with details
   */
  static async markCompleted(
    callId: string,
    duration: number,
    transcript?: string,
    recording?: string
  ): Promise<void> {
    await this.updateCallStatus(callId, {
      callId,
      status: 'COMPLETED' as any,
      duration,
      transcript,
      recording
    });
  }

  /**
   * Mark call as failed
   */
  static async markFailed(callId: string, errorMessage: string): Promise<void> {
    await this.updateCallStatus(callId, {
      callId,
      status: 'FAILED' as any,
      errorMessage
    });
  }
}
