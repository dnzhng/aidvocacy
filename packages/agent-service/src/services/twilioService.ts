import twilio from 'twilio';
import { MenuStep } from '@aidvocacy/shared';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const publicUrl = process.env.PUBLIC_URL;

if (!accountSid || !authToken || !twilioPhoneNumber) {
  console.warn('Twilio credentials not configured. Agent service will not be able to make calls.');
}

export class TwilioService {
  private client: twilio.Twilio | null;

  constructor() {
    this.client = accountSid && authToken ? twilio(accountSid, authToken) : null;
  }

  /**
   * Initiate an outbound call
   */
  async makeCall(
    callId: string,
    phoneNumber: string,
    script: string,
    menuSteps?: MenuStep[]
  ): Promise<{ success: boolean; callSid?: string; error?: string }> {
    if (!this.client) {
      return {
        success: false,
        error: 'Twilio client not initialized. Check credentials.'
      };
    }

    if (!publicUrl) {
      return {
        success: false,
        error: 'PUBLIC_URL not configured. Required for Twilio webhooks.'
      };
    }

    try {
      // Store call data in memory (in production, use Redis or similar)
      this.storeCallData(callId, { script, menuSteps: menuSteps || [] });

      // Make the call
      const call = await this.client.calls.create({
        to: phoneNumber,
        from: twilioPhoneNumber!,
        url: `${publicUrl}/api/voice/${callId}`,
        statusCallback: `${publicUrl}/api/status/${callId}`,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        record: true,
        recordingStatusCallback: `${publicUrl}/api/recording/${callId}`,
        transcribe: true,
        transcribeCallback: `${publicUrl}/api/transcription/${callId}`
      });

      return {
        success: true,
        callSid: call.sid
      };
    } catch (error: any) {
      console.error('Error making call:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate TwiML for call flow
   */
  generateTwiML(callId: string, step: number = 0): string {
    const callData = this.getCallData(callId);
    if (!callData) {
      return this.generateErrorTwiML('Call data not found');
    }

    const { script, menuSteps } = callData;
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();

    // If we have menu steps to navigate
    if (step < menuSteps.length) {
      const menuStep = menuSteps[step];

      // Gather input for menu navigation
      const gather = response.gather({
        input: ['dtmf', 'speech'],
        timeout: 5,
        numDigits: 1,
        action: `${publicUrl}/api/voice/${callId}?step=${step + 1}`,
        method: 'POST'
      });

      gather.say({
        voice: 'Polly.Joanna'
      }, `Navigating menu: ${menuStep.waitFor}`);

      // If timeout, try the action
      if (menuStep.action.startsWith('press')) {
        const digit = menuStep.action.replace('press ', '');
        response.redirect(`${publicUrl}/api/voice/${callId}?step=${step + 1}&digit=${digit}`);
      }
    } else {
      // We've navigated menus, now deliver the script
      response.say({
        voice: 'Polly.Joanna'
      }, script);

      // Pause to allow for response
      response.pause({ length: 2 });

      // Thank you and hang up
      response.say({
        voice: 'Polly.Joanna'
      }, 'Thank you for your time. Goodbye.');

      response.hangup();
    }

    return response.toString();
  }

  /**
   * Handle menu navigation input
   */
  handleMenuInput(callId: string, step: number, digit?: string): string {
    const callData = this.getCallData(callId);
    if (!callData) {
      return this.generateErrorTwiML('Call data not found');
    }

    const { menuSteps } = callData;
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();

    if (step < menuSteps.length) {
      const menuStep = menuSteps[step];

      // Press the menu option
      if (menuStep.action.startsWith('press') && digit) {
        response.play({ digits: digit });
      }

      response.pause({ length: 1 });
    }

    // Continue to next step
    response.redirect(`${publicUrl}/api/voice/${callId}?step=${step}`);

    return response.toString();
  }

  private generateErrorTwiML(message: string): string {
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();
    response.say({
      voice: 'Polly.Joanna'
    }, `Error: ${message}`);
    response.hangup();
    return response.toString();
  }

  // Simple in-memory storage (use Redis in production)
  private callDataStore = new Map<string, { script: string; menuSteps: MenuStep[] }>();

  private storeCallData(callId: string, data: { script: string; menuSteps: MenuStep[] }) {
    this.callDataStore.set(callId, data);
  }

  private getCallData(callId: string) {
    return this.callDataStore.get(callId);
  }

  clearCallData(callId: string) {
    this.callDataStore.delete(callId);
  }
}

export const twilioService = new TwilioService();
