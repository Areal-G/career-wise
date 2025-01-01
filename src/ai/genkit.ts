import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {DEMO_MODEL_NAME, registerDemoModel} from './demo-model';

const hasGoogleAiKey = Boolean(
  process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
);

/** True when AI features run on the offline demo model (no API key set). */
export const isAiDemoMode = !hasGoogleAiKey;

export const ai = genkit({
  plugins: hasGoogleAiKey ? [googleAI()] : [],
  model: hasGoogleAiKey ? 'googleai/gemini-2.5-flash' : DEMO_MODEL_NAME,
});

if (!hasGoogleAiKey) {
  registerDemoModel(ai);
}
