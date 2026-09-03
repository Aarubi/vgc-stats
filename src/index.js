import 'dotenv/config';
import { getBotConfig } from './config/env.js';
import { createClient } from './discord/create-client.js';

try {
  const { token } = getBotConfig();
  const client = createClient();
  await client.login(token);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
