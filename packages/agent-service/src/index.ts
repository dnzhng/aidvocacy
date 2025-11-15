import dotenv from 'dotenv';
dotenv.config();

import { app } from './app';

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Agent service listening on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Public URL for Twilio webhooks: ${process.env.PUBLIC_URL}`);
});
