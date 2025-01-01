'use server';

/**
 * Skill Gap Analyzer - AI Flow
 * Compares user skills to job requirements and suggests improvements
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { requireServerAuthenticatedUser } from '@/lib/server-auth';
import { enforceAiRateLimit } from '@/lib/ai-rate-limit';
import { withRetry } from '@/ai/retry';

const AnalyzeSkillGapInputSchema = z.object({
  userSkills: z.array(z.string()).describe('Skills the user currently has'),
  userExperience: z.string().optional().describe('User work experience summary'),
  jobTitle: z.string().describe('Target job title'),
  jobDescription: z.string().describe('Job description to analyze'),
  jobRequirements: z.array(z.string()).optional().describe('Parsed job requirements'),
});

export type AnalyzeSkillGapInput = z.infer<typeof AnalyzeSkillGapInputSchema>;

const AnalyzeSkillGapOutputSchema = z.object({
  overallMatch: z.number().min(0).max(100).describe('Overall match percentage'),
  matchedSkills: z.array(z.object({
    skill: z.string(),
    strength: z.enum(['strong', 'moderate', 'basic']),
    notes: z.string().optional(),
  })).describe('Skills that match the job'),
  missingSkills: z.array(z.object({
    skill: z.string(),
    priority: z.enum(['critical', 'important', 'nice-to-have']),
    learningTime: z.string().describe('Estimated time to learn'),
    resources: z.array(z.object({
      name: z.string(),
      type: z.enum(['course', 'book', 'tutorial', 'certification', 'project']),
      url: z.string().optional(),
      provider: z.string().optional(),
    })),
  })).describe('Skills to develop'),
  experienceGaps: z.array(z.string()).describe('Experience gaps identified'),
  recommendations: z.array(z.object({
    action: z.string(),
    priority: z.enum(['high', 'medium', 'low']),
    timeframe: z.string(),
  })).describe('Recommended actions'),
  careerPath: z.object({
    currentLevel: z.string(),
    targetLevel: z.string(),
    stepsToTarget: z.array(z.string()),
  }).optional(),
});

export type AnalyzeSkillGapOutput = z.infer<typeof AnalyzeSkillGapOutputSchema>;

const analyzeSkillGapPrompt = ai.definePrompt({
  name: 'analyzeSkillGapPrompt',
  input: { schema: AnalyzeSkillGapInputSchema },
  output: { schema: AnalyzeSkillGapOutputSchema },
  system: `You are an expert career advisor and technical recruiter with deep knowledge of industry skill requirements. You help candidates understand exactly what they need to learn to land their dream job.

Your analysis should be:
- Specific and actionable
- Realistic about learning timelines
- Prioritized by importance
- Includes real learning resources (Coursera, Udemy, official docs, etc.)

When recommending resources, suggest specific courses and certifications by name when possible.`,
  prompt: `Analyze the skill gap for this candidate:

Target Role: {{jobTitle}}

Job Description:
{{jobDescription}}

{{#if jobRequirements}}
Key Requirements:
{{#each jobRequirements}}
- {{this}}
{{/each}}
{{/if}}

Candidate's Current Skills:
{{#each userSkills}}
- {{this}}
{{/each}}

{{#if userExperience}}
Experience:
{{userExperience}}
{{/if}}

Provide:
1. Overall match percentage
2. Which of their skills match (and strength level)
3. Missing skills with priority, learning time, and specific resources
4. Experience gaps
5. Prioritized recommendations with timeframes`,
});

const analyzeSkillGapFlow = ai.defineFlow(
  {
    name: 'analyzeSkillGapFlow',
    inputSchema: AnalyzeSkillGapInputSchema,
    outputSchema: AnalyzeSkillGapOutputSchema,
  },
  async (input) => {
    const { output } = await withRetry(() => analyzeSkillGapPrompt(input));
    return output!;
  }
);

export async function analyzeSkillGap(
  input: AnalyzeSkillGapInput
): Promise<AnalyzeSkillGapOutput> {
  const user = await requireServerAuthenticatedUser();
  await enforceAiRateLimit({
    userId: user.uid,
    plan: user.profile?.plan as string | undefined,
    tool: 'skillGap',
  });
  return analyzeSkillGapFlow(input);
}
