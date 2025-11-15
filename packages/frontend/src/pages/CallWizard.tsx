import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api, Representative, Issue, Script, Persona } from '../services/api';

type Step = 'issue' | 'representative' | 'script' | 'persona' | 'confirm';

export function CallWizard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const startWith = searchParams.get('start') as 'issue' | 'representative' | null;

  const [currentStep, setCurrentStep] = useState<Step>(startWith || 'issue');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data
  const [issues, setIssues] = useState<Issue[]>([]);
  const [representatives, setRepresentatives] = useState<Representative[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);

  // Selections
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [selectedRepresentative, setSelectedRepresentative] = useState<Representative | null>(null);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);

  // Load initial data
  useEffect(() => {
    if (startWith === 'issue') {
      loadIssues();
    } else if (startWith === 'representative') {
      loadRepresentatives();
    }
  }, [startWith]);

  async function loadIssues() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getIssues();
      setIssues(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadRepresentatives(issueId?: string) {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getRepresentatives(issueId ? { issueId } : undefined);
      setRepresentatives(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadScripts(issueId: string) {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getScripts({ issueId });
      setScripts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadPersonas() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getPersonas();
      setPersonas(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleIssueSelect(issue: Issue) {
    setSelectedIssue(issue);
    setSelectedRepresentative(null);
    setSelectedScript(null);
    loadRepresentatives(issue.id);
    setCurrentStep('representative');
  }

  function handleRepresentativeSelect(rep: Representative) {
    setSelectedRepresentative(rep);
    setSelectedScript(null);
    if (selectedIssue) {
      loadScripts(selectedIssue.id);
      setCurrentStep('script');
    } else {
      // If we started with representative, show their issues
      if (rep.issues.length > 0) {
        setSelectedIssue(issues.find(i => i.id === rep.issues[0].id) || null);
        loadScripts(rep.issues[0].id);
        setCurrentStep('script');
      }
    }
  }

  function handleScriptSelect(script: Script) {
    setSelectedScript(script);
    loadPersonas();
    setCurrentStep('persona');
  }

  function handlePersonaSelect(persona: Persona) {
    setSelectedPersona(persona);
    setCurrentStep('confirm');
  }

  async function handleSubmit() {
    if (!selectedRepresentative || !selectedScript || !selectedPersona) {
      setError('Please complete all selections');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await api.createCall({
        representativeId: selectedRepresentative.id,
        scriptId: selectedScript.id,
        personaId: selectedPersona.id
      });

      navigate(`/call/${result.callId}`);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
      setLoading(false);
    }
  }

  function handleBack() {
    if (currentStep === 'representative') {
      setCurrentStep('issue');
      setSelectedRepresentative(null);
    } else if (currentStep === 'script') {
      setCurrentStep('representative');
      setSelectedScript(null);
    } else if (currentStep === 'persona') {
      setCurrentStep('script');
      setSelectedPersona(null);
    } else if (currentStep === 'confirm') {
      setCurrentStep('persona');
    }
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Make Your Voice Heard</h1>
        <p>Contact your representatives about issues you care about</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="card">
        {/* Progress indicator */}
        <div className="progress-steps">
          <div className={`progress-step ${currentStep === 'issue' ? 'active' : selectedIssue ? 'completed' : ''}`}>
            Issue
          </div>
          <div className={`progress-step ${currentStep === 'representative' ? 'active' : selectedRepresentative ? 'completed' : ''}`}>
            Representative
          </div>
          <div className={`progress-step ${currentStep === 'script' ? 'active' : selectedScript ? 'completed' : ''}`}>
            Script
          </div>
          <div className={`progress-step ${currentStep === 'persona' ? 'active' : selectedPersona ? 'completed' : ''}`}>
            Tone
          </div>
          <div className={`progress-step ${currentStep === 'confirm' ? 'active' : ''}`}>
            Confirm
          </div>
        </div>

        {loading && <div className="loading">Loading...</div>}

        {/* Issue selection */}
        {currentStep === 'issue' && !loading && (
          <div>
            <h2>Select an Issue</h2>
            <p style={{ marginBottom: '1.5rem', color: 'var(--gray-600)' }}>
              What issue do you want to advocate for?
            </p>
            <div className="grid grid-2">
              {issues.map(issue => (
                <div
                  key={issue.id}
                  className={`selectable-card ${selectedIssue?.id === issue.id ? 'selected' : ''}`}
                  onClick={() => handleIssueSelect(issue)}
                >
                  <h3 style={{ marginBottom: '0.5rem' }}>{issue.name}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.5rem' }}>
                    {issue.description}
                  </p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                    {issue.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Representative selection */}
        {currentStep === 'representative' && !loading && (
          <div>
            <h2>Select a Representative</h2>
            <p style={{ marginBottom: '1.5rem', color: 'var(--gray-600)' }}>
              Who do you want to contact about {selectedIssue?.name}?
            </p>
            <div className="grid grid-2">
              {representatives.map(rep => (
                <div
                  key={rep.id}
                  className={`selectable-card ${selectedRepresentative?.id === rep.id ? 'selected' : ''}`}
                  onClick={() => handleRepresentativeSelect(rep)}
                >
                  <h3 style={{ marginBottom: '0.5rem' }}>{rep.name}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                    {rep.title} - {rep.state}{rep.district ? ` District ${rep.district}` : ''}
                  </p>
                  {rep.party && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                      {rep.party}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="button-group">
              <button onClick={handleBack} className="button button-secondary">
                Back
              </button>
            </div>
          </div>
        )}

        {/* Script selection */}
        {currentStep === 'script' && !loading && (
          <div>
            <h2>Choose Your Message</h2>
            <p style={{ marginBottom: '1.5rem', color: 'var(--gray-600)' }}>
              Select a script to use when calling {selectedRepresentative?.name}
            </p>
            <div className="grid">
              {scripts.map(script => (
                <div
                  key={script.id}
                  className={`selectable-card ${selectedScript?.id === script.id ? 'selected' : ''}`}
                  onClick={() => handleScriptSelect(script)}
                >
                  <h3 style={{ marginBottom: '0.5rem' }}>{script.title}</h3>
                  {script.description && (
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.5rem' }}>
                      {script.description}
                    </p>
                  )}
                  <details style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                    <summary style={{ cursor: 'pointer', color: 'var(--primary)' }}>
                      View script
                    </summary>
                    <p style={{ marginTop: '0.5rem', color: 'var(--gray-700)', whiteSpace: 'pre-wrap' }}>
                      {script.content}
                    </p>
                  </details>
                </div>
              ))}
            </div>
            <div className="button-group">
              <button onClick={handleBack} className="button button-secondary">
                Back
              </button>
            </div>
          </div>
        )}

        {/* Persona selection */}
        {currentStep === 'persona' && !loading && (
          <div>
            <h2>Choose Your Tone</h2>
            <p style={{ marginBottom: '1.5rem', color: 'var(--gray-600)' }}>
              How should the AI agent deliver your message?
            </p>
            <div className="grid grid-2">
              {personas.map(persona => (
                <div
                  key={persona.id}
                  className={`selectable-card ${selectedPersona?.id === persona.id ? 'selected' : ''}`}
                  onClick={() => handlePersonaSelect(persona)}
                >
                  <h3 style={{ marginBottom: '0.5rem' }}>{persona.name}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                    {persona.description}
                  </p>
                </div>
              ))}
            </div>
            <div className="button-group">
              <button onClick={handleBack} className="button button-secondary">
                Back
              </button>
            </div>
          </div>
        )}

        {/* Confirmation */}
        {currentStep === 'confirm' && (
          <div>
            <h2>Confirm Your Call</h2>
            <p style={{ marginBottom: '1.5rem', color: 'var(--gray-600)' }}>
              Review your selections before submitting
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <strong>Representative:</strong> {selectedRepresentative?.name}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Issue:</strong> {selectedIssue?.name}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Script:</strong> {selectedScript?.title}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Tone:</strong> {selectedPersona?.name}
            </div>

            <div className="button-group">
              <button onClick={handleBack} className="button button-secondary" disabled={loading}>
                Back
              </button>
              <button onClick={handleSubmit} className="button button-primary" disabled={loading}>
                {loading ? 'Submitting...' : 'Make Call'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
