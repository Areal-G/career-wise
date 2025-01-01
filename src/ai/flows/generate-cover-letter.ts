'use server';

/**
 * @fileOverview Generates personalized cover letters using AI.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { requireServerAuthenticatedUser } from '@/lib/server-auth';
import { enforceAiRateLimit } from '@/lib/ai-rate-limit';
import { withRetry } from '@/ai/retry';

const GenerateCoverLetterInputSchema = z.object({
  userInfo: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string().optional(),
    currentTitle: z.string(),
    experience: z.string(),
    skills: z.string(),
    achievements: z.string().optional(),
  }),
  jobInfo: z.object({
    title: z.string(),
    company: z.string(),
    description: z.string(),
    hiringManager: z.string().optional(),
  }),
  tone: z.enum(['professional', 'enthusiastic', 'confident', 'conversational']).default('professional'),
  length: z.enum(['short', 'medium', 'long']).default('medium'),
});

export type GenerateCoverLetterInput = z.infer<typeof GenerateCoverLetterInputSchema>;

const GenerateCoverLetterOutputSchema = z.object({
  coverLetter: z.string().describe('The complete cover letter.'),
  keyPoints: z.array(z.string()).describe('Key points highlighted in the letter.'),
  matchedSkills: z.array(z.string()).describe('Skills from the job description addressed.'),
  suggestions: z.array(z.string()).describe('Ways to improve or personalize the letter.'),
});

export type GenerateCoverLetterOutput = z.infer<typeof GenerateCoverLetterOutputSchema>;

export async function generateCoverLetter(
  input: GenerateCoverLetterInput
): Promise<GenerateCoverLetterOutput> {
  const user = await requireServerAuthenticatedUser();
  await enforceAiRateLimit({
    userId: user.uid,
    plan: user.profile?.plan as string | undefined,
    tool: 'coverLetter',
  });
  return generateCoverLetterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCoverLetterPrompt',
  input: { schema: GenerateCoverLetterInputSchema },
  output: { schema: GenerateCoverLetterOutputSchema },
  system: `You are an expert career coach who has helped thousands of candidates land their dream jobs with compelling cover letters. Your cover letters are known for:

- Opening with a hook that grabs attention
- Connecting the candidate's experience to specific job requirements
- Showing genuine enthusiasm for the company
- Using concrete examples and achievements
- Ending with a clear call to action

Never use generic phrases. Every sentence should add value and be specific to this candidate and role.`,
  prompt: `Generate a {{tone}} cover letter for this application:

CANDIDATE INFORMATION:
Name: {{userInfo.name}}
Email: {{userInfo.email}}
{{#if userInfo.phone}}Phone: {{userInfo.phone}}{{/if}}
Current Title: {{userInfo.currentTitle}}

Experience:
{{userInfo.experience}}

Skills:
{{userInfo.skills}}

{{#if userInfo.achievements}}Key Achievements:
{{userInfo.achievements}}{{/if}}

JOB DETAILS:
Position: {{jobInfo.title}}
Company: {{jobInfo.company}}
{{#if jobInfo.hiringManager}}Hiring Manager: {{jobInfo.hiringManager}}{{/if}}

Job Description:
{{jobInfo.description}}

Create a {{length}} cover letter that:
1. Opens with a compelling hook
2. Connects their experience to the role requirements
3. Shows genuine interest in {{jobInfo.company}}
4. Highlights 2-3 specific achievements
5. Ends with a confident call to action

Do not include "[Your Address]" or placeholder text. Use the actual information provided.`,
});

const generateCoverLetterFlow = ai.defineFlow(
  {
    name: 'generateCoverLetterFlow',
    inputSchema: GenerateCoverLetterInputSchema,
    outputSchema: GenerateCoverLetterOutputSchema,
  },
  async (input) => {
    const { output } = await withRetry(() => prompt(input));
    return output!;
  }
);
