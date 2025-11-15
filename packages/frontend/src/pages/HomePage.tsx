import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <div className="container">
      <div className="header">
        <h1>Advocacy Call Agent</h1>
        <p>
          Overcome phone anxiety and make your voice heard.
          <br />
          Let our AI agent call your representatives for you.
        </p>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>How It Works</h2>
        <ol style={{ paddingLeft: '1.5rem', marginBottom: '2rem', lineHeight: '2' }}>
          <li>Choose an issue you care about or a representative you want to contact</li>
          <li>Select a script that represents your views</li>
          <li>Pick the tone you want the AI agent to use</li>
          <li>Submit and let the AI make the call for you</li>
        </ol>

        <h3 style={{ marginBottom: '1rem' }}>Get Started</h3>
        <p style={{ marginBottom: '1.5rem', color: 'var(--gray-600)' }}>
          How would you like to begin?
        </p>

        <div className="grid grid-2">
          <Link to="/call/new?start=issue" className="selectable-card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Start with an Issue</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
              Browse issues you care about and find representatives who handle them
            </p>
          </Link>

          <Link to="/call/new?start=representative" className="selectable-card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Start with a Representative</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
              Choose your representative first, then select an issue they handle
            </p>
          </Link>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>Why Use This Service?</h2>
        <ul style={{ paddingLeft: '1.5rem', lineHeight: '2' }}>
          <li>
            <strong>Overcome Phone Anxiety:</strong> Let AI make the call for you
          </li>
          <li>
            <strong>Save Time:</strong> No need to navigate phone trees or wait on hold
          </li>
          <li>
            <strong>Stay Consistent:</strong> Deliver your message clearly every time
          </li>
          <li>
            <strong>Track Your Impact:</strong> Get transcripts and recordings of your calls
          </li>
        </ul>
      </div>
    </div>
  );
}
