import { TwilioService } from './twilioService';

describe('TwilioService', () => {
  let service: TwilioService;

  beforeEach(() => {
    service = new TwilioService();
  });

  describe('generateTwiML', () => {
    it('should generate TwiML for menu navigation', () => {
      const callId = 'test-call-1';
      const script = 'Hello, this is a test script.';
      const menuSteps = [
        { waitFor: 'main menu', action: 'press 1' },
        { waitFor: 'leave message', action: 'press 2' }
      ];

      // Store call data
      (service as any).storeCallData(callId, { script, menuSteps });

      const twiml = service.generateTwiML(callId, 0);

      expect(twiml).toContain('<Response>');
      expect(twiml).toContain('<Gather');
      expect(twiml).toContain('Navigating menu');
      expect(twiml).toContain('</Response>');
    });

    it('should generate TwiML for script delivery after menu navigation', () => {
      const callId = 'test-call-2';
      const script = 'Hello, this is a test script.';
      const menuSteps = [
        { waitFor: 'main menu', action: 'press 1' }
      ];

      // Store call data
      (service as any).storeCallData(callId, { script, menuSteps });

      // Generate TwiML for step after all menus
      const twiml = service.generateTwiML(callId, 1);

      expect(twiml).toContain('<Response>');
      expect(twiml).toContain('<Say');
      expect(twiml).toContain(script);
      expect(twiml).toContain('<Hangup');
    });

    it('should handle missing call data gracefully', () => {
      const callId = 'non-existent-call';

      const twiml = service.generateTwiML(callId, 0);

      expect(twiml).toContain('Error');
      expect(twiml).toContain('<Hangup');
    });
  });

  describe('handleMenuInput', () => {
    it('should generate TwiML to press menu digit', () => {
      const callId = 'test-call-3';
      const script = 'Test script';
      const menuSteps = [
        { waitFor: 'main menu', action: 'press 1' }
      ];

      (service as any).storeCallData(callId, { script, menuSteps });

      const twiml = service.handleMenuInput(callId, 0, '1');

      expect(twiml).toContain('<Play');
      expect(twiml).toContain('digits="1"');
      expect(twiml).toContain('<Redirect');
    });
  });

  describe('clearCallData', () => {
    it('should remove call data from store', () => {
      const callId = 'test-call-4';
      const script = 'Test script';

      (service as any).storeCallData(callId, { script, menuSteps: [] });

      // Verify data exists
      let twiml = service.generateTwiML(callId, 0);
      expect(twiml).toContain(script);

      // Clear data
      service.clearCallData(callId);

      // Verify data is gone
      twiml = service.generateTwiML(callId, 0);
      expect(twiml).toContain('Error');
    });
  });
});
