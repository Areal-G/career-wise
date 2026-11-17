import {genkit} from 'genkit';
import {DEMO_MODEL_NAME, registerDemoModel} from './demo-model';

// Portfolio demo build: every AI feature runs on the offline demo model, so no
// request ever reaches Gemini.
export const ai = genkit({
  model: DEMO_MODEL_NAME,
});

registerDemoModel(ai);
