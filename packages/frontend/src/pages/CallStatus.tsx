import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, Call } from '../services/api';

export function CallStatus() {
  const { callId } = useParams<{ callId: string }>();
  const [call, setCall] = useState<Call | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!callId) return;

    loadCall();

    // Poll for updates if call is in progress
    const interval = setInterval(() => {
      if (call?.status === 'PENDING' || call?.status === 'QUEUED' || call?.status === 'IN_PROGRESS') {
        loadCall();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [callId, call?.status]);

  async function loadCall() {
    if (!callId) return;

    try {
      const data = await api.getCall(callId);
      setCall(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading call details...</div>
      </div>
    );
  }

  if (error || !call) {
    return (
      <div className="container">
        <div className="error-message">
          {error || 'Call not found'}
        </div>
        <Link to="/" className="button button-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  const statusClass = `status-${call.status.toLowerCase().replace('_', '-')}`;

  return (
    <div className="container">
      <div className="header">
        <h1>Call Status</h1>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>Call to {call.representative.name}</h2>
          <span className={`status-badge ${statusClass}`}>
            {call.status.replace('_', ' ')}
          </span>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Details</h3>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <div>
              <strong>Representative:</strong> {call.representative.title} {call.representative.name}
            </div>
            <div>
              <strong>State:</strong> {call.representative.state}
              {call.representative.district && ` - District ${call.representative.district}`}
            </div>
            <div>
              <strong>Script:</strong> {call.script.title}
            </div>
            <div>
              <strong>Tone:</strong> {call.persona.name}
            </div>
            <div>
              <strong>Created:</strong> {new Date(call.createdAt).toLocaleString()}
            </div>
            {call.completedAt && (
              <div>
                <strong>Completed:</strong> {new Date(call.completedAt).toLocaleString()}
              </div>
            )}
            {call.duration && (
              <div>
                <strong>Duration:</strong> {call.duration} seconds
              </div>
            )}
          </div>
        </div>

        {call.status === 'PENDING' || call.status === 'QUEUED' && (
          <div style={{ padding: '1rem', background: 'var(--gray-100)', borderRadius: '0.375rem', marginBottom: '1.5rem' }}>
            Your call is queued and will be made shortly...
          </div>
        )}

        {call.status === 'IN_PROGRESS' && (
          <div style={{ padding: '1rem', background: '#dbeafe', borderRadius: '0.375rem', marginBottom: '1.5rem' }}>
            Your call is currently in progress...
          </div>
        )}

        {call.status === 'COMPLETED' && (
          <div style={{ padding: '1rem', background: '#d1fae5', borderRadius: '0.375rem', marginBottom: '1.5rem' }}>
            Your call was completed successfully!
          </div>
        )}

        {call.status === 'FAILED' && (
          <div style={{ padding: '1rem', background: '#fee2e2', borderRadius: '0.375rem', marginBottom: '1.5rem' }}>
            <strong>Call Failed:</strong> {call.errorMessage || 'Unknown error'}
          </div>
        )}

        {call.modifiedScript && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Script Used</h3>
            <div style={{
              padding: '1rem',
              background: 'var(--gray-50)',
              borderRadius: '0.375rem',
              whiteSpace: 'pre-wrap',
              fontSize: '0.875rem',
              lineHeight: '1.6'
            }}>
              {call.modifiedScript}
            </div>
          </div>
        )}

        {call.transcript && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Transcript</h3>
            <div style={{
              padding: '1rem',
              background: 'var(--gray-50)',
              borderRadius: '0.375rem',
              whiteSpace: 'pre-wrap',
              fontSize: '0.875rem',
              lineHeight: '1.6'
            }}>
              {call.transcript}
            </div>
          </div>
        )}

        {call.recording && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Recording</h3>
            <audio controls style={{ width: '100%' }}>
              <source src={call.recording} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        <div className="button-group">
          <Link to="/" className="button button-secondary">
            Back to Home
          </Link>
          <Link to="/call/new?start=issue" className="button button-primary">
            Make Another Call
          </Link>
        </div>
      </div>
    </div>
  );
}
