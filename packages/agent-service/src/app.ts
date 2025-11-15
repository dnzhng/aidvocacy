import express, { Request, Response, NextFunction } from 'express';
import { MakeCallRequest, MakeCallResponse } from '@callrep/shared';
import { twilioService } from './services/twilioService';
import { ApiCallbackService } from './services/apiCallbackService';

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * POST /api/make-call
 * Initiate a new call (called by main API)
 */
app.post('/api/make-call', async (req: Request, res: Response) => {
  try {
    const request: MakeCallRequest = req.body;

    if (!request.callId || !request.phoneNumber || !request.script) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: callId, phoneNumber, script'
      });
    }

    const result = await twilioService.makeCall(
      request.callId,
      request.phoneNumber,
      request.script,
      request.menuSteps
    );

    const response: MakeCallResponse = {
      success: result.success,
      callSid: result.callSid,
      error: result.error
    };

    if (result.success) {
      res.status(200).json(response);
    } else {
      // Notify API of failure
      await ApiCallbackService.markFailed(request.callId, result.error || 'Unknown error');
      res.status(500).json(response);
    }
  } catch (error: any) {
    console.error('Error making call:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/voice/:callId
 * Twilio webhook for call flow (generates TwiML)
 */
app.post('/api/voice/:callId', (req: Request, res: Response) => {
  try {
    const { callId } = req.params;
    const step = parseInt(req.query.step as string) || 0;
    const digit = req.query.digit as string;

    console.log(`Voice webhook for call ${callId}, step ${step}`);

    let twiml: string;

    if (digit) {
      // Handle menu input
      twiml = twilioService.handleMenuInput(callId, step, digit);
    } else {
      // Generate next step
      twiml = twilioService.generateTwiML(callId, step);
    }

    res.type('text/xml');
    res.send(twiml);
  } catch (error: any) {
    console.error('Error generating TwiML:', error);
    res.status(500).send('Error generating call flow');
  }
});

/**
 * POST /api/status/:callId
 * Twilio status callback
 */
app.post('/api/status/:callId', async (req: Request, res: Response) => {
  try {
    const { callId } = req.params;
    const { CallStatus, CallDuration, CallSid } = req.body;

    console.log(`Status callback for call ${callId}: ${CallStatus}`);

    switch (CallStatus) {
      case 'initiated':
      case 'ringing':
        // Call is being set up
        break;

      case 'in-progress':
        // Call answered
        await ApiCallbackService.markInProgress(callId, CallSid);
        break;

      case 'completed':
        // Call completed successfully
        const duration = parseInt(CallDuration) || 0;
        await ApiCallbackService.markCompleted(callId, duration);
        twilioService.clearCallData(callId);
        break;

      case 'busy':
      case 'no-answer':
      case 'failed':
      case 'canceled':
        // Call failed
        await ApiCallbackService.markFailed(callId, `Call ${CallStatus}`);
        twilioService.clearCallData(callId);
        break;
    }

    res.sendStatus(200);
  } catch (error: any) {
    console.error('Error handling status callback:', error);
    res.sendStatus(500);
  }
});

/**
 * POST /api/recording/:callId
 * Twilio recording callback
 */
app.post('/api/recording/:callId', async (req: Request, res: Response) => {
  try {
    const { callId } = req.params;
    const { RecordingUrl, RecordingDuration } = req.body;

    console.log(`Recording callback for call ${callId}: ${RecordingUrl}`);

    // Update call with recording URL
    const duration = parseInt(RecordingDuration) || 0;
    await ApiCallbackService.updateCallStatus(callId, {
      callId,
      status: 'COMPLETED' as any,
      duration,
      recording: RecordingUrl
    });

    res.sendStatus(200);
  } catch (error: any) {
    console.error('Error handling recording callback:', error);
    res.sendStatus(500);
  }
});

/**
 * POST /api/transcription/:callId
 * Twilio transcription callback
 */
app.post('/api/transcription/:callId', async (req: Request, res: Response) => {
  try {
    const { callId } = req.params;
    const { TranscriptionText } = req.body;

    console.log(`Transcription callback for call ${callId}`);

    // Update call with transcript
    await ApiCallbackService.updateCallStatus(callId, {
      callId,
      status: 'COMPLETED' as any,
      transcript: TranscriptionText
    });

    res.sendStatus(200);
  } catch (error: any) {
    console.error('Error handling transcription callback:', error);
    res.sendStatus(500);
  }
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});
