import { config } from 'dotenv';
config();

import '@/ai/flows/generate-profile-summary';
import '@/ai/flows/analyze-opportunity-description';
import '@/ai/flows/find-matching-candidates';
import '@/ai/flows/find-and-rank-candidates';
import '@/ai/flows/send-application-status-email';
import '@/ai/flows/send-welcome-email';
import '@/ai/flows/enhance-text';
import '@/ai/flows/parse-resume';
