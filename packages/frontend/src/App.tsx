import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { CallWizard } from './pages/CallWizard';
import { CallStatus } from './pages/CallStatus';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/call/new" element={<CallWizard />} />
        <Route path="/call/:callId" element={<CallStatus />} />
      </Routes>
    </BrowserRouter>
  );
}
