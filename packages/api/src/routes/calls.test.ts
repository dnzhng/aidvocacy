import request from 'supertest';
import { app } from '../app';
import { CallService } from '../services/callService';

// Mock the CallService
jest.mock('../services/callService');

describe('Calls API', () => {
  describe('POST /api/calls', () => {
    it('should create a call with valid parameters', async () => {
      const mockCall = {
        id: 'call-123',
        status: 'QUEUED',
        representativeId: 'rep-1',
        scriptId: 'script-1',
        personaId: 'persona-1',
        modifiedScript: 'Modified script content',
        phoneNumber: '+15555550100',
        createdAt: new Date()
      };

      (CallService.createCall as jest.Mock).mockResolvedValue(mockCall);

      const response = await request(app)
        .post('/api/calls')
        .send({
          representativeId: 'rep-1',
          scriptId: 'script-1',
          personaId: 'persona-1'
        })
        .expect(201);

      expect(response.body).toEqual({
        callId: 'call-123',
        status: 'QUEUED',
        message: 'Call queued successfully'
      });

      expect(CallService.createCall).toHaveBeenCalledWith('rep-1', 'script-1', 'persona-1');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/calls')
        .send({
          representativeId: 'rep-1'
          // Missing scriptId and personaId
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for empty string IDs', async () => {
      const response = await request(app)
        .post('/api/calls')
        .send({
          representativeId: '',
          scriptId: 'script-1',
          personaId: 'persona-1'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/calls/:id', () => {
    it('should return call details for valid ID', async () => {
      const mockCall = {
        id: 'call-123',
        representativeId: 'rep-1',
        scriptId: 'script-1',
        personaId: 'persona-1',
        status: 'COMPLETED',
        modifiedScript: 'Modified script',
        phoneNumber: '+15555550100',
        duration: 120,
        transcript: 'Call transcript',
        recording: 'https://example.com/recording.mp3',
        createdAt: new Date('2024-01-01'),
        completedAt: new Date('2024-01-01'),
        representative: {
          id: 'rep-1',
          name: 'Jane Smith',
          title: 'Senator',
          state: 'CA',
          district: null
        },
        script: {
          id: 'script-1',
          title: 'Support Clean Energy',
          description: 'Script description',
          issue: {
            id: 'issue-1',
            name: 'Climate Action',
            category: 'Environment'
          }
        },
        persona: {
          id: 'persona-1',
          name: 'Professional',
          description: 'Professional tone'
        }
      };

      (CallService.getCall as jest.Mock).mockResolvedValue(mockCall);

      const response = await request(app)
        .get('/api/calls/call-123')
        .expect(200);

      expect(response.body).toMatchObject({
        id: 'call-123',
        status: 'COMPLETED',
        duration: 120,
        transcript: 'Call transcript'
      });

      expect(CallService.getCall).toHaveBeenCalledWith('call-123');
    });
  });

  describe('POST /api/calls/:id/status', () => {
    it('should update call status', async () => {
      const mockUpdatedCall = {
        id: 'call-123',
        status: 'COMPLETED'
      };

      (CallService.updateCallStatus as jest.Mock).mockResolvedValue(mockUpdatedCall);

      const response = await request(app)
        .post('/api/calls/call-123/status')
        .send({
          status: 'COMPLETED',
          duration: 120,
          transcript: 'Call transcript'
        })
        .expect(200);

      expect(response.body).toEqual({
        id: 'call-123',
        status: 'COMPLETED',
        message: 'Call status updated'
      });

      expect(CallService.updateCallStatus).toHaveBeenCalledWith(
        'call-123',
        'COMPLETED',
        {
          duration: 120,
          transcript: 'Call transcript',
          recording: undefined,
          errorMessage: undefined,
          twilioCallSid: undefined
        }
      );
    });
  });
});
