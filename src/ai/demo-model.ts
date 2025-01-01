/**
 * Offline demo model.
 *
 * Used when no GOOGLE_GENAI_API_KEY is configured so every AI tool still
 * works end-to-end in local/demo environments. Responses are realistic,
 * hand-written templates that pick up a few values (role, company, skills)
 * from the rendered prompt. The response shape is chosen from the prompt's
 * output schema, so new flows fall back to a generic schema-driven sample.
 */
import type { Genkit } from 'genkit';

type JsonSchema = {
  type?: string | string[];
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  enum?: unknown[];
  description?: string;
  minimum?: number;
  maximum?: number;
  anyOf?: JsonSchema[];
};

export const DEMO_MODEL_NAME = 'demo/career-coach';

function pick(text: string, labels: string[], fallback: string): string {
  for (const label of labels) {
    const m = text.match(new RegExp(`(?:^|\\n)[ \\t]*${label}\\s*:[ \\t]*([^\\n]+)`, 'i'));
    const value = m?.[1]?.trim();
    if (value && !value.startsWith('{{') && !value.includes('<<<')) return value.slice(0, 80);
  }
  return fallback;
}

/** Multi-line block that follows "Label:" on its own line, up to a blank line. */
function pickBlock(text: string, label: string): string {
  const m = text.match(new RegExp(`(?:^|\\n)[ \\t]*${label}\\s*:[ \\t]*\\n([\\s\\S]*?)(?:\\n[ \\t]*\\n|$)`, 'i'));
  return m?.[1]?.trim() ?? '';
}

function skillsFrom(text: string, fallback: string[]): string[] {
  const labels = ['Key Skills', 'Current Skills', 'Skills', 'Required skills', 'Focus on these skills'];
  let raw = pick(text, labels, '');
  if (!raw) raw = labels.map((l) => pickBlock(text, l)).find(Boolean) ?? '';
  const list = raw
    .split(/[,;|\n]/)
    .map((s) => s.replace(/^[\s\-*•]+/, '').trim())
    .filter((s) => s.length > 1 && s.length < 40);
  return list.length ? list.slice(0, 20) : fallback;
}

const DEFAULT_SKILLS = ['TypeScript', 'React', 'Node.js', 'SQL', 'System Design', 'Communication'];

function salaryFixture(text: string) {
  const role = pick(text, ['Role'], 'Software Engineer');
  const location = pick(text, ['Location'], 'Remote (US)');
  const years = Number(pick(text, ['Experience'], '4').replace(/[^0-9.]/g, '')) || 4;
  const mid = Math.round((95000 + years * 9000) / 1000) * 1000;
  const offered = Number(pick(text, ['Offered Salary'], '0').replace(/[^0-9.]/g, '')) || 0;
  return {
    marketData: {
      lowRange: Math.round(mid * 0.82),
      midRange: mid,
      highRange: Math.round(mid * 1.24),
      currency: 'USD',
      confidence: 'medium',
      factors: [
        `${role} demand in ${location} remains above the national average`,
        `${years} years of experience places you in the mid-to-upper band`,
        'Cloud and AI-adjacent skills command a 6–12% premium',
        'Company size and funding stage shift base vs. equity mix',
      ],
    },
    analysis: {
      offerVsMarket: offered
        ? `The offer of $${offered.toLocaleString()} sits ${offered >= mid ? 'at or above' : 'below'} the market midpoint of $${mid.toLocaleString()}.`
        : undefined,
      recommendation: `Anchor your ask near the upper-middle of the range and lead with measurable impact. For a ${role} with ${years} years of experience, a target around $${Math.round(mid * 1.1).toLocaleString()} is well supported.`,
      targetSalary: Math.round(mid * 1.1),
      minimumAcceptable: Math.round(mid * 0.95),
    },
    negotiationScript: {
      opening: `Thank you for the offer — I'm genuinely excited about this ${role} role and the team. Before I accept, I'd like to talk through the compensation so it reflects the scope of the position.`,
      keyPoints: [
        'Reference two or three shipped projects with concrete metrics (revenue, latency, adoption).',
        `Cite market data for ${role} roles in ${location}.`,
        'Emphasise skills that shorten your ramp-up time.',
        'Express commitment — you want to say yes.',
      ],
      responses: [
        {
          objection: "This is the top of our band for this level.",
          response: "I understand. Could we look at the level itself, or close the gap with a sign-on bonus and an early compensation review at six months?",
        },
        {
          objection: "We need an answer by Friday.",
          response: "That works. If we can align on base salary by Thursday, I'm ready to sign.",
        },
        {
          objection: "Other candidates accepted this number.",
          response: "I appreciate that. My ask is based on the impact I'll bring in the first two quarters — here's how I'd approach the roadmap you described.",
        },
      ],
      closing: `If we can get to $${Math.round(mid * 1.1).toLocaleString()} base, I'm ready to accept today and get started.`,
    },
    alternativeCompensation: [
      { item: 'Sign-on bonus', typicalValue: '$5k–$20k', negotiability: 'high' },
      { item: 'Equity / RSU refresh', typicalValue: '10–25% of base annually', negotiability: 'medium' },
      { item: 'Learning budget', typicalValue: '$1.5k–$3k / year', negotiability: 'high' },
      { item: 'Extra PTO', typicalValue: '5 days', negotiability: 'medium' },
      { item: 'Remote / hybrid flexibility', typicalValue: '2–5 days remote', negotiability: 'high' },
    ],
    tips: [
      'Never give the first number if you can avoid it — ask for their band first.',
      'Negotiate over a call, then confirm everything in writing.',
      'Silence is a tool: pause after stating your number.',
      'Bundle requests instead of trickling them one by one.',
    ],
  };
}

function careerPathFixture(text: string) {
  const current = pick(text, ['Current Role', 'Current Position'], 'Junior Developer');
  const target = pick(text, ['Target Role', 'Dream Role', 'Goal'], 'Engineering Manager');
  return {
    summary: `Moving from ${current} to ${target} is a well-trodden path. Expect three stages: deepen technical ownership, lead cross-team projects, then formally take on people leadership.`,
    estimatedTimeYears: 4,
    steps: [
      {
        order: 1,
        title: `Senior ${current.replace(/^(junior|associate)\s+/i, '')}`,
        description: 'Own a product area end-to-end, mentor newer teammates, and drive technical decisions.',
        durationMonths: 18,
        skills: [
          { name: 'System Design', level: 'strengthen' },
          { name: 'Code Review & Mentoring', level: 'learn' },
          { name: 'Observability', level: 'strengthen' },
        ],
        milestones: ['Lead a multi-sprint feature launch', 'Write and defend a design doc', 'Mentor two engineers'],
        salaryRange: '$120k–$155k',
      },
      {
        order: 2,
        title: 'Tech Lead',
        description: 'Coordinate a squad of 4–6 engineers, set technical direction and partner with product.',
        durationMonths: 18,
        skills: [
          { name: 'Roadmap Planning', level: 'learn' },
          { name: 'Stakeholder Communication', level: 'strengthen' },
          { name: 'Architecture', level: 'master' },
        ],
        milestones: ['Run sprint planning for a squad', 'Cut cycle time by 20%', 'Own quarterly OKRs'],
        salaryRange: '$150k–$185k',
      },
      {
        order: 3,
        title: target,
        description: 'Hire, grow and retain a team while staying accountable for delivery and quality.',
        durationMonths: 12,
        skills: [
          { name: 'Hiring & Interviewing', level: 'learn' },
          { name: 'Performance Coaching', level: 'learn' },
          { name: 'Budget & Headcount Planning', level: 'learn' },
        ],
        milestones: ['Hire two engineers', 'Run 1:1s and growth plans', 'Deliver a cross-team initiative'],
        salaryRange: '$175k–$220k',
      },
    ],
    quickWins: [
      { action: 'Volunteer to own the next incident retrospective', impact: 'Visibility with senior leadership', timeframe: 'This month' },
      { action: 'Start a weekly mentoring session with a new hire', impact: 'Builds leadership track record', timeframe: '2 weeks' },
      { action: 'Write one design doc per quarter', impact: 'Demonstrates technical judgement', timeframe: 'Next quarter' },
    ],
    alternativePaths: [
      { path: 'Staff Engineer', description: 'Stay on the IC track, owning architecture across multiple teams.' },
      { path: 'Product Manager', description: 'Leverage technical depth to own product strategy and outcomes.' },
    ],
  };
}

function interviewQuestionsFixture(text: string) {
  const intro = text.match(/-level (.+?) position(?: at (.+?))?\./);
  const role = intro?.[1]?.trim() || pick(text, ['Role', 'Job Role'], 'Software Engineer');
  const company = intro?.[2]?.trim() || pick(text, ['Company', 'Target Company'], 'the company');
  const skills = skillsFrom(text, DEFAULT_SKILLS);
  const qs = [
    ['behavioral', 'medium', `Tell me about a time you disagreed with a teammate on a technical decision. How did you resolve it?`],
    ['technical', 'hard', `How would you design a rate limiter for an API used by ${company}?`],
    ['situational', 'medium', `A critical bug hits production an hour before a major demo. Walk me through what you do.`],
    ['technical', 'medium', `Explain how you would structure state management in a large ${skills[0] ?? 'React'} application.`],
    ['behavioral', 'easy', `Why are you interested in this ${role} role at ${company}?`],
    ['technical', 'hard', `How would you find and fix a memory leak in a long-running ${skills[2] ?? 'Node.js'} service?`],
    ['situational', 'hard', `Your team is asked to deliver a feature in half the estimated time. How do you respond?`],
    ['behavioral', 'medium', `Describe a project you're proud of. What was your specific impact?`],
  ] as const;
  return {
    questions: qs.map(([type, difficulty, question], i) => ({
      id: `q${i + 1}`,
      question,
      type,
      difficulty,
      tips:
        type === 'behavioral'
          ? 'Use the STAR method and finish with a measurable result.'
          : type === 'technical'
            ? 'Clarify requirements first, state trade-offs out loud, then go deeper.'
            : 'Show prioritisation and communication, not just the fix.',
      sampleAnswer:
        type === 'behavioral'
          ? 'In my last role we had two competing approaches for a caching layer. I set up a short spike for both, defined success metrics up front, and we picked the option that cut p95 latency by 38%. The teammate who proposed the other design co-owned the rollout.'
          : type === 'technical'
            ? 'I would start with requirements — limits per user or per key, burst tolerance, and consistency needs. A token bucket in Redis with atomic Lua scripts handles most cases; for global limits I would shard buckets and accept slight over-admission.'
            : 'First I would stabilise: roll back or feature-flag the change, communicate a clear status to stakeholders, then do a blameless follow-up so it does not repeat.',
      followUps: ['What would you do differently next time?', 'How did you measure success?'],
    })),
    generalTips: [
      `Research ${company}'s recent product launches and mention one.`,
      'Prepare three stories that each show impact, conflict and learning.',
      'Ask thoughtful questions about team rituals and how success is measured.',
      'Send a short thank-you note within 24 hours.',
    ],
  };
}

function evaluateAnswerFixture(text: string) {
  const answer = pickBlock(text, "Candidate's Answer") || pick(text, ['Answer', 'User Answer'], '');
  const len = answer.length;
  const score = Math.min(92, 58 + Math.round(len / 12));
  return {
    score,
    strengths: ['Clear structure and confident tone', 'Relevant example tied to the question', 'Shows ownership of the outcome'],
    improvements: ['Quantify the result (%, time saved, revenue)', 'Spend less time on context and more on your actions', 'Close with what you learned'],
    revisedAnswer:
      'In my previous role, our checkout API was timing out during peak traffic (Situation). I was responsible for stabilising it before Black Friday (Task). I profiled the service, added a read-through cache and moved slow writes to a queue (Action). Error rates dropped from 4% to 0.2% and conversion rose 6% that weekend (Result).',
    starAnalysis: { situation: true, task: true, action: len > 80, result: /\d/.test(answer) },
    tips: ['Practise this answer aloud in under two minutes', 'Prepare a follow-up on trade-offs you considered'],
  };
}

function coverLetterFixture(text: string) {
  const name = pick(text, ['Name', 'Candidate Name'], 'Alex Morgan');
  const role = pick(text, ['Position', 'Job Title', 'Role'], 'Product Engineer');
  const company = pick(text, ['Company', 'Company Name'], 'your team');
  const skills = skillsFrom(text, DEFAULT_SKILLS);
  return {
    coverLetter: `Dear Hiring Manager,

I'm excited to apply for the ${role} position at ${company}. Over the past five years I've built and shipped customer-facing products used by hundreds of thousands of people, and the problems your team is tackling are exactly the kind I love to work on.

At my current company I led the rebuild of our onboarding flow in ${skills[0] ?? 'React'} and ${skills[1] ?? 'TypeScript'}, which lifted activation by 23% in one quarter. I partner closely with design and product, write clear design docs, and care about the details that make software feel fast and trustworthy.

What draws me to ${company} is your focus on craft and on measurable outcomes for customers. I'd bring a bias for shipping, strong ${skills[2] ?? 'Node.js'} experience, and a habit of leaving systems better documented than I found them.

I'd love the chance to talk about how I can help the team hit its next milestones. Thank you for your time and consideration.

Best regards,
${name}`,
    keyPoints: ['Quantified impact on activation', 'Cross-functional collaboration', 'Genuine motivation for the company mission'],
    matchedSkills: skills.slice(0, 5),
    suggestions: [
      `Mention a specific ${company} product or blog post to show research.`,
      'Swap in one metric from your most recent role.',
      'Keep it under 350 words for easy scanning.',
    ],
  };
}

function linkedinFixture(text: string) {
  const role = pick(text, ['Target Role', 'Current Role', 'Role', 'Headline'], 'Full-Stack Engineer');
  const skills = skillsFrom(text, DEFAULT_SKILLS);
  return {
    headline: {
      recommended: `${role} | ${skills.slice(0, 3).join(' · ')} | Building fast, reliable products people love`,
      alternatives: [
        `${role} helping startups ship faster with ${skills[0] ?? 'React'} & ${skills[1] ?? 'TypeScript'}`,
        `${role} · Product-minded · Open to new opportunities`,
      ],
      keywords: skills.slice(0, 5),
    },
    about: {
      content: `I'm a ${role} who turns ambiguous ideas into shipped, measurable product. Over the last few years I've led launches that grew activation by 23%, cut page load times in half, and reduced on-call pages by 40%.\n\nI work best at the intersection of engineering and product: writing design docs, pairing with designers, and keeping a close eye on metrics after launch.\n\nCore strengths: ${skills.join(', ')}.\n\nCurrently open to roles where I can own a product area end-to-end. Let's connect!`,
      structure: ['Hook', 'Quantified achievements', 'Working style', 'Core skills', 'Call to action'],
      callToAction: "Open to new opportunities — send me a message and let's talk.",
    },
    profileTips: [
      { section: 'Photo & banner', tip: 'Use a clear headshot and a banner that shows your work or stack.', priority: 'high' },
      { section: 'Featured', tip: 'Pin your best project, a talk, or a case study.', priority: 'high' },
      { section: 'Experience', tip: 'Lead each role with 2–3 metric-driven bullets.', priority: 'medium' },
      { section: 'Recommendations', tip: 'Ask two recent managers or peers for recommendations.', priority: 'low' },
    ],
    keywords: skills.slice(0, 5).map((keyword, i) => ({
      keyword,
      importance: i < 2 ? 'critical' : i < 4 ? 'important' : 'helpful',
      placement: ['Headline', 'About', 'Skills'],
    })),
    completenessScore: 78,
    improvements: ['Add a custom profile URL', 'List 5 more skills and get endorsements', 'Add certifications'],
  };
}

/** Skill vocabulary used to spot requirements in free-text job descriptions. */
const KNOWN_SKILLS = [
  'React', 'TypeScript', 'JavaScript', 'Next.js', 'Node.js', 'GraphQL', 'REST APIs', 'PostgreSQL', 'SQL', 'Python',
  'Go', 'Java', 'Kafka', 'Kubernetes', 'Docker', 'Terraform', 'AWS', 'GCP', 'ClickHouse', 'Redis', 'Tailwind CSS',
  'Accessibility', 'Testing', 'Jest', 'Figma', 'Design Systems', 'Prototyping', 'User Research', 'Interaction Design',
  'React Native', 'Offline Sync', 'Machine Learning', 'PyTorch', 'Time Series', 'MLOps', 'Statistics', 'Looker',
  'Data Visualization', 'Technical Writing', 'Public Speaking', 'Product Strategy', 'Stakeholder Management',
  'Distributed Systems', 'Prometheus', 'Linux', 'Animation', 'Curriculum Design', 'Communication', 'Leadership',
];

const LEARNING: Record<string, { name: string; type: 'course' | 'book' | 'tutorial' | 'certification' | 'project'; provider?: string; time: string }> = {
  kubernetes: { name: 'Kubernetes for Developers (LFD259)', type: 'course', provider: 'Linux Foundation', time: '6–8 weeks' },
  graphql: { name: 'Full-Stack GraphQL', type: 'tutorial', provider: 'Apollo Odyssey', time: '2–3 weeks' },
  aws: { name: 'AWS Certified Developer – Associate', type: 'certification', provider: 'AWS', time: '2–3 months' },
  accessibility: { name: 'Web Accessibility (WCAG 2.2)', type: 'course', provider: 'W3C WAI', time: '3–4 weeks' },
  testing: { name: 'Testing JavaScript Applications', type: 'course', provider: 'Frontend Masters', time: '3 weeks' },
  go: { name: 'Learn Go with Tests', type: 'tutorial', provider: 'quii.gitbook.io', time: '4–6 weeks' },
  kafka: { name: 'Apache Kafka Fundamentals', type: 'course', provider: 'Confluent', time: '3 weeks' },
  python: { name: 'Python for Everybody', type: 'course', provider: 'Coursera', time: '6 weeks' },
  figma: { name: 'Figma for Developers', type: 'tutorial', provider: 'Figma Learn', time: '1–2 weeks' },
  terraform: { name: 'HashiCorp Terraform Associate', type: 'certification', provider: 'HashiCorp', time: '6 weeks' },
  datavisualization: { name: 'Fullstack D3 and Data Visualization', type: 'book', provider: 'Newline', time: '4–6 weeks' },
  designsystems: { name: 'Design Systems with Figma and React', type: 'course', provider: 'Frontend Masters', time: '3–4 weeks' },
  technicalwriting: { name: 'Technical Writing One & Two', type: 'course', provider: 'Google', time: '1–2 weeks' },
};

/** Growth areas for senior roles, shown when the candidate already covers every listed requirement. */
const STRETCH_SKILLS = ['Data Visualization', 'Design Systems', 'Technical Writing'];

function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9+#.]/g, '');
}

/** Related skills a resume often lists under a different name than the posting. */
const RELATED: Record<string, string[]> = {
  testing: ['jest', 'cypress', 'playwright', 'vitest', 'testing library'],
  accessibility: ['wcag', 'a11y', 'aria'],
  graphql: ['apollo', 'relay'],
  'ci/cd': ['github actions', 'circleci', 'jenkins'],
};

/** The resume skill that covers `want` under another name (Testing ← Jest), if any. */
function relatedSkill(have: string[], want: string) {
  const names = RELATED[want.toLowerCase()] ?? [];
  return have.find((h) => names.includes(h.toLowerCase()));
}

function hasSkill(have: string[], want: string) {
  const w = norm(want);
  return (
    have.some((h) => {
      const n = norm(h);
      // Prefix match ("react" ~ "reactjs"), but never for 1–2 letter names like "Go".
      return n && (n === w || (n.length > 2 && w.length > 2 && (n.startsWith(w) || w.startsWith(n))));
    }) || !!relatedSkill(have, want)
  );
}

/** Whole-word mention, so "Go" doesn't match "good", "going" or "Google". */
function mentions(text: string, skill: string) {
  const escaped = skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^a-z0-9])${escaped}($|[^a-z0-9])`).test(text.toLowerCase());
}

/** Requirements from a bullet block, or by scanning the description for known skills. */
function requirementsFrom(text: string, blockLabels: string[]): string[] {
  for (const label of blockLabels) {
    const block = pickBlock(text, label);
    if (block) {
      const items = block
        .split('\n')
        .map((l) => l.replace(/^[\s\-*•]+/, '').trim())
        .filter((l) => l && l.length < 40);
      if (items.length) return items.slice(0, 10);
    }
  }
  return KNOWN_SKILLS.filter((k) => mentions(text, k)).slice(0, 10);
}

export function compareSkills(userSkills: string[], required: string[]) {
  const matched = required.filter((r) => hasSkill(userSkills, r));
  const missing = required.filter((r) => !hasSkill(userSkills, r));
  const pct = required.length ? Math.round((matched.length / required.length) * 100) : 70;
  return { matched, missing, pct };
}

function skillGapFixture(text: string) {
  const userSkills = skillsFrom(pickBlock(text, "Candidate's Current Skills") ? `Skills:\n${pickBlock(text, "Candidate's Current Skills")}\n\n` : text, DEFAULT_SKILLS);
  const role = pick(text, ['Target Role'], 'this role');
  const required = requirementsFrom(text.split(/Candidate's Current Skills/i)[0], ['Key Requirements']);
  const { matched, missing, pct } = compareSkills(userSkills, required.length ? required : ['Kubernetes', 'GraphQL']);
  const overallMatch = Math.max(35, Math.min(96, Math.round(pct * 0.85 + 12)));
  return {
    overallMatch,
    matchedSkills: (matched.length ? matched : userSkills.slice(0, 2)).map((skill, i) => ({
      skill,
      strength: i < 2 ? 'strong' : i < 4 ? 'moderate' : 'basic',
      notes: i === 0 ? 'Demonstrated across shipped projects on your profile' : undefined,
    })),
    missingSkills: (missing.length ? missing : STRETCH_SKILLS.filter((s) => !hasSkill(userSkills, s)))
      .slice(0, 4)
      .map((skill, i) => {
      const r = LEARNING[norm(skill).replace(/\.js$/, '')] ?? {
        name: `${skill} fundamentals + a small portfolio project`,
        type: 'project' as const,
        time: '3–5 weeks',
      };
      return {
        skill,
        priority: !missing.length ? (i === 0 ? 'important' : 'nice-to-have') : i === 0 ? 'critical' : i < 3 ? 'important' : 'nice-to-have',
        learningTime: r.time,
        resources: [
          { name: r.name, type: r.type, provider: r.provider },
          { name: `Ship a mini project using ${skill}`, type: 'project' },
        ],
      };
    }),
    experienceGaps: missing.length
      ? [`No visible production experience with ${missing.slice(0, 2).join(' or ')}`, 'Few public write-ups showing system-level decisions']
      : ['Consider adding measurable outcomes to each role on your profile'],
    recommendations: [
      missing[0]
        ? { action: `Build and deploy a small project that uses ${missing[0]}`, priority: 'high', timeframe: 'Next 4–6 weeks' }
        : { action: 'Tailor your resume headline to this role', priority: 'high', timeframe: 'Today' },
      { action: `Rewrite two resume bullets to mirror the ${role} posting's language`, priority: 'medium', timeframe: 'This week' },
      { action: 'Ask a peer for a mock interview focused on the gaps above', priority: 'medium', timeframe: 'Next 2 weeks' },
    ],
    careerPath: {
      currentLevel: 'Mid-level',
      targetLevel: role,
      stepsToTarget: missing.length
        ? [`Close the ${missing[0]} gap`, 'Lead one cross-team project', 'Publish a case study of your work']
        : ['Apply now — you meet the core requirements', 'Prepare impact stories for interviews'],
    },
  };
}

type EmailCopy = { subject: (role: string, company: string) => string; opener: (role: string, company: string) => string; ask: string };

const EMAIL_COPY: Record<string, EmailCopy> = {
  'follow-up': {
    subject: (r) => `Following up on the ${r} role`,
    opener: (r, c) => `I wanted to follow up on my application for the ${r} position at ${c}. I'm still very excited about the opportunity and the team's plans for the year ahead.`,
    ask: "Is there anything else I can share to help with your decision? I'd be glad to talk whenever suits you.",
  },
  'thank-you': {
    subject: (r) => `Thank you — ${r} conversation`,
    opener: (r, c) => `Thank you for taking the time to speak with me about the ${r} role at ${c}. I really enjoyed learning how the team approaches its roadmap.`,
    ask: 'Our conversation made me even more excited about the role. Please let me know if you need anything else from me.',
  },
  networking: {
    subject: (_r, c) => `Quick question about working at ${c}`,
    opener: (_r, c) => `I've been following ${c}'s recent work and would love to hear about your experience on the team.`,
    ask: 'Would you be open to a 15-minute call in the next couple of weeks?',
  },
  application: {
    subject: (r) => `Application: ${r}`,
    opener: (r, c) => `I'm writing to apply for the ${r} position at ${c}. My background building customer-facing products lines up closely with what the team is looking for.`,
    ask: "I've attached my resume and would welcome the chance to discuss how I can contribute.",
  },
  'negotiate-salary': {
    subject: (r) => `${r} offer — next steps`,
    opener: (r, c) => `Thank you for the offer for the ${r} role at ${c}. I'm excited about joining and want to make sure the package reflects the scope of the role.`,
    ask: 'Based on market data and my experience, I would like to discuss a base salary closer to the upper end of the range. Could we find time to talk this week?',
  },
  'accept-offer': {
    subject: (r) => `Accepting the ${r} offer`,
    opener: (r, c) => `I'm delighted to formally accept the offer for the ${r} position at ${c}.`,
    ask: 'Please let me know what you need from me before my start date. I am looking forward to getting started.',
  },
  'decline-offer': {
    subject: (r) => `${r} offer`,
    opener: (r, c) => `Thank you so much for offering me the ${r} role at ${c}. After careful thought, I've decided to pursue another opportunity that is a closer fit for my goals right now.`,
    ask: 'I truly appreciated getting to know the team and hope our paths cross again.',
  },
  withdraw: {
    subject: (r) => `Withdrawing my application — ${r}`,
    opener: (r, c) => `I'd like to withdraw my application for the ${r} position at ${c}.`,
    ask: 'Thank you for your time and consideration throughout the process.',
  },
  'referral-request': {
    subject: (_r, c) => `Referral for a role at ${c}?`,
    opener: (r, c) => `I noticed ${c} is hiring for a ${r} and I think it's a strong fit for my background.`,
    ask: "Would you be comfortable referring me? I'm happy to send my resume and a short blurb to make it easy.",
  },
};

function emailFixture(text: string) {
  const intro = text.match(/Generate an? ([a-z-]+) email for (.+?)\./i);
  const kind = intro?.[1]?.toLowerCase() ?? 'follow-up';
  const userName = intro?.[2]?.trim() || 'Alex';
  const company = pick(text, ['Company', 'Company Name'], 'Northwind Labs');
  const role = pick(text, ['Position', 'Job Title', 'Role'], 'open');
  const recipient = pick(text, ['Recipient'], 'Hiring Team').split(',')[0];
  const copy = EMAIL_COPY[kind] ?? EMAIL_COPY['follow-up'];
  return {
    subject: copy.subject(role, company),
    body: `Hi ${recipient},\n\n${copy.opener(role, company)}\n\n${copy.ask}\n\nBest regards,\n${userName}`,
    tips: ['Keep it under 150 words', 'Reference something specific from your conversation or research', 'Send from the same thread if one exists'],
    timing: 'Tuesday–Thursday, 9–11am in the recipient’s time zone',
    alternatives: [
      { subject: `${company} — ${role === 'open' ? 'quick note' : role}`, reason: 'Short and scannable in a busy inbox' },
      { subject: `A quick note from ${userName}`, reason: 'Personal and warm, good for a second touch' },
    ],
  };
}

/** Value after "- Label:" in a bulleted prompt block, up to the next "- Label:" line. */
function bulletField(text: string, label: string): string {
  const m = text.match(new RegExp(String.raw`(?:^|\n)\s*-\s*${label}\s*:\s*([\s\S]*?)(?=\n\s*-\s*[A-Z][a-z ]+:|\n\s*\n|$)`, 'i'));
  return m?.[1]?.trim() ?? '';
}

const list = (s: string) => s.split(/[,\n]/).map((x) => x.trim()).filter(Boolean);

function resumeMatchFixture(text: string) {
  const role = pick(text, ['Target role'], 'this role');
  const matched = list(pick(text, ['Matched skills'], ''));
  const missing = list(pick(text, ['Missing skills'], ''));
  const resumeSkills = list(bulletField(text, 'Skills'));
  const history = bulletField(text, 'Employment history');
  const jobs = history.split('\n').map((l) => l.trim()).filter(Boolean);

  // Most recent role: "Title — Company (2022–present): what they did"
  const latest = jobs[0]?.match(/^(.*?)\s+[—–-]\s+(.*?)\s*\(([^)]*)\)\s*:?\s*(.*)$/);
  const latestTitle = latest?.[1] ?? 'Engineer';
  const latestCompany = latest?.[2] ?? 'your current company';
  const latestText = (latest?.[4] ?? jobs[0] ?? '').replace(/\.$/, '');
  const years = (() => {
    const starts = jobs.map((j) => Number(j.match(/\((\d{4})/)?.[1])).filter(Boolean);
    return starts.length ? new Date().getFullYear() - Math.min(...starts) : 0;
  })();
  const stack = matched.slice(0, 3).join(', ') || resumeSkills.slice(0, 3).join(', ');

  // A skill counts as matched through a related tool (Testing ← Jest), but the resume should
  // still use the posting's word, so suggest relabelling it.
  const relabel = [...matched, ...missing]
    .filter((skill) => !resumeSkills.some((s) => s.toLowerCase() === skill.toLowerCase()))
    .map((skill) => ({ skill, related: relatedSkill(resumeSkills, skill) }))
    .find((n) => n.related);
  const notClaimable = missing.filter((skill) => !relatedSkill(resumeSkills, skill));

  const sectionSuggestions = [
    {
      section: 'summary',
      priority: 'high',
      currentFocus: 'Add a short summary at the top of your resume',
      originalText: '',
      suggestion: `${latestTitle}${years ? ` with ${years}+ years` : ''} building ${stack} products. ${latestText ? latestText.charAt(0).toUpperCase() + latestText.slice(1) + '.' : ''} Looking to bring that to a ${role} role.`.replace(/\s+/g, ' ').trim(),
      rationale: `Your resume starts straight with experience. Recruiters read the first lines first, so this puts the ${role} title and your strongest result there.`,
    },
    latestText && {
      section: 'experience',
      priority: 'high',
      currentFocus: `${latestCompany}, most recent role`,
      originalText: latestText,
      suggestion: `Rebuilt ${latestText.match(/rebuilt (.*?) in /i)?.[1] ?? 'the core product'} with ${stack}, ${latestText.replace(/^.*?,\s*/, '')}`,
      rationale: `Same result, but now it names ${stack}, which the posting asks for, so applicant tracking systems and recruiters both pick it up.`,
    },
    relabel && {
      section: 'skills',
      priority: 'medium',
      currentFocus: `Use the posting's word "${relabel.skill}"`,
      originalText: relabel.related,
      suggestion: `${relabel.skill} (${relabel.related})`,
      rationale: `The job asks for "${relabel.skill}". You already list ${relabel.related}, so label it with the posting's word.${notClaimable.length ? ` Only add ${notClaimable.join(', ')} if you have really used it; otherwise mention it in your cover letter.` : ''}`,
    },
  ].filter(Boolean);

  return {
    summary: missing.length
      ? `You cover ${matched.length} of the ${matched.length + missing.length} skills listed for ${role}. Your experience already shows clear, measurable results; the gaps are ${missing.join(', ')}.`
      : `You cover every skill listed for ${role}. The main win now is making your results easier to spot.`,
    keywordTargets: [...matched, ...missing].slice(0, 8),
    quickWins: [
      `Add a 2-line summary that names the ${role} title`,
      stack && `Name ${stack} in your ${latestCompany} bullets`,
      relabel && `Label ${relabel.related} as "${relabel.skill}" in your skills`,
      notClaimable[0] && `Mention ${notClaimable[0]} in your cover letter if it's not on your resume yet`,
    ].filter(Boolean),
    sectionSuggestions,
  };
}

function jobMatchFixture(text: string) {
  const [candidatePart, jobPart = ''] = text.split(/\*\*Job:\*\*/i);
  const userSkills = skillsFrom(candidatePart, DEFAULT_SKILLS);
  const required = requirementsFrom(jobPart, ['Requirements']);
  const { matched, missing, pct } = compareSkills(userSkills, required.length ? required : ['Kubernetes', 'GraphQL']);
  const skillsScore = Math.max(30, Math.min(98, pct));
  const userLoc = pick(candidatePart, ['Location'], '').toLowerCase();
  const jobLoc = pick(jobPart, ['Location'], '').toLowerCase();
  const locationScore = /remote/.test(jobLoc) ? 95 : userLoc && jobLoc && jobLoc.includes(userLoc.split(',')[0]) ? 100 : 65;
  const overallScore = Math.round(skillsScore * 0.55 + 80 * 0.25 + 88 * 0.1 + locationScore * 0.1);
  const recommendation =
    overallScore >= 82 ? 'strong-match' : overallScore >= 70 ? 'good-match' : overallScore >= 55 ? 'potential-match' : 'not-recommended';
  return {
    overallScore,
    breakdown: {
      skills: { score: skillsScore, matched, missing },
      experience: { score: 80, notes: 'Your years of experience fit the level of this role; highlight ownership of end-to-end projects.' },
      education: { score: 88, notes: 'Education meets the stated requirement.' },
      location: {
        score: locationScore,
        notes: /remote/.test(jobLoc) ? 'Remote-friendly role.' : locationScore === 100 ? 'You are based in the same area.' : 'Relocation or hybrid commute may be needed.',
      },
    },
    recommendation,
    tips: [
      missing[0] ? `Mention any exposure to ${missing[0]} — even side projects count.` : 'You cover the core stack — lead with impact metrics.',
      `Put ${matched.slice(0, 3).join(', ') || 'your strongest skills'} in your resume headline.`,
      'Quantify two recent achievements (%, $, time saved).',
    ],
    coverLetterFocus: [
      `Hands-on experience with ${matched.slice(0, 2).join(' and ') || 'the core stack'}`,
      'A shipped project with measurable results',
      missing[0] ? `How you are building up your ${missing[0]} experience` : 'Why this team and product excite you',
    ],
  };
}

function fullResumeFixture(text: string) {
  const title = pick(text, ['Current/Target Title', 'Title', 'Current Title'], 'Senior Frontend Engineer');
  const skills = skillsFrom(text, DEFAULT_SKILLS);
  return {
    summary: `${title} with 6+ years building fast, accessible web products. Led teams that shipped features used by 250k+ users, improved Core Web Vitals by 45%, and introduced design-system practices adopted company-wide.`,
    experience: [
      {
        title,
        company: 'Brightline Health',
        duration: 'Mar 2022 – Present',
        bullets: [
          'Led a 5-engineer squad rebuilding the patient portal in React and TypeScript; NPS rose from 31 to 52.',
          'Cut LCP from 3.8s to 1.6s through code-splitting and image optimisation.',
          'Introduced visual regression testing, reducing UI bugs in production by 60%.',
        ],
      },
      {
        title: 'Frontend Engineer',
        company: 'Parcel & Pine',
        duration: 'Jun 2019 – Feb 2022',
        bullets: [
          'Built the merchant dashboard used by 4,000+ stores, handling 2M orders a month.',
          'Created a shared component library that halved new-feature build time.',
        ],
      },
    ],
    skills: { technical: skills.slice(0, 6), soft: ['Mentoring', 'Stakeholder communication', 'Product thinking'] },
    education: [{ degree: 'B.Sc. Computer Science', institution: 'University of Washington', year: '2019' }],
    atsScore: 87,
    improvements: ['Add a projects section with links', 'Tailor the summary to each posting'],
  };
}

function resumeSectionFixture(text: string) {
  const section = pick(text, ['Section Type', 'Section'], 'summary').toLowerCase();
  const skills = skillsFrom(text, DEFAULT_SKILLS);
  const content: Record<string, string> = {
    summary: 'Product-focused software engineer with 5+ years of experience shipping reliable, user-centred web applications. Known for turning ambiguous requirements into measurable outcomes and mentoring teammates along the way.',
    experience: '• Led migration of a legacy monolith to modular services, reducing deploy time from 45 to 8 minutes.\n• Built an analytics dashboard adopted by 1,200 internal users within two months.\n• Mentored three junior engineers, two of whom were promoted within a year.',
    skills: skills.join(' • '),
    education: 'B.Sc. Computer Science — University of Washington (2019)\nRelevant coursework: Distributed Systems, HCI, Databases',
    projects: '• OpenShelf — open-source reading tracker with 2k GitHub stars (Next.js, Postgres).\n• Tidewatch — real-time tide alerts app with 15k monthly users.',
    achievements: '• Company Hackathon winner (2023)\n• Speaker at local JS meetup on performance budgets',
  };
  const key = Object.keys(content).find((k) => section.includes(k)) ?? 'summary';
  return {
    content: content[key],
    keywords: skills.slice(0, 5),
    suggestions: ['Quantify outcomes wherever possible', 'Mirror keywords from the target job description'],
  };
}

function rankCandidatesFixture(text: string) {
  const required = pick(text, ['The employer requires the following skills'], '')
    .toLowerCase()
    .split(/[,\s]+/)
    .filter(Boolean);
  const reqLine = text.match(/requires the following skills:\s*\n\s*([^\n]+)/i)?.[1]?.toLowerCase() ?? required.join(',');
  const requiredSkills = reqLine.split(',').map((s) => s.trim()).filter(Boolean);
  const blocks = text.split(/-\s*Candidate UID:\s*/).slice(1);
  const candidates = blocks
    .map((block) => {
      const uid = block.split('\n')[0].trim();
      const get = (label: string) => block.match(new RegExp(`${label}:\\s*([^\\n]*)`))?.[1]?.trim() ?? '';
      const skills = get('Skills');
      const have = skills.toLowerCase().split(',').map((s) => s.trim());
      const matched = requiredSkills.filter((r) => have.some((h) => h && (h.includes(r) || r.includes(h))));
      const pct = requiredSkills.length ? Math.round((matched.length / requiredSkills.length) * 70 + 25) : 60;
      return {
        uid,
        displayName: get('Name'),
        email: get('Email'),
        photoURL: get('Photo URL') || undefined,
        skills,
        matchPercentage: Math.min(98, pct),
        justification: matched.length
          ? `Strong overlap on ${matched.slice(0, 3).join(', ')} with relevant hands-on experience.`
          : 'Transferable experience in adjacent technologies.',
        applicationStatus: 'not_applied',
        _matched: matched.length,
      };
    })
    .filter((c) => c.uid && c._matched > 0)
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
    .map(({ _matched, ...c }) => c);
  return { candidates };
}

function opportunityAnalysisFixture(text: string) {
  const desc = text.toLowerCase();
  const known = ['React', 'TypeScript', 'Node.js', 'Python', 'SQL', 'AWS', 'Figma', 'Docker', 'Kubernetes', 'GraphQL', 'Go', 'Java', 'Machine Learning', 'Communication', 'Leadership', 'Excel', 'Marketing', 'SEO', 'Data Analysis'];
  const found = known.filter((k) => mentions(desc, k));
  const skills = found.length ? found.slice(0, 8) : ['Communication', 'Problem Solving', 'Teamwork', 'Attention to Detail'];
  return {
    skills,
    fitAnalysis: `This role emphasises ${skills.slice(0, 3).join(', ')}. Candidates with hands-on experience in these areas and a track record of shipping will be a strong fit.`,
  };
}

function enhanceTextFixture(text: string) {
  const original = (text.match(/(?:Text|Original text|Input)\s*:\s*([\s\S]{10,800}?)(?:\n\n|$)/i)?.[1] ?? '').trim();
  const base = original || 'Experienced professional passionate about building great products.';
  const polished = base
    .replace(/\s+/g, ' ')
    .replace(/\bi\b/g, 'I')
    .replace(/(^|[.!?]\s+)([a-z])/g, (_, p, c) => p + c.toUpperCase());
  return {
    enhancedText: `${polished.replace(/[.\s]*$/, '.')} I focus on clear communication, measurable outcomes, and continuously raising the quality bar for the teams I work with.`,
  };
}

function profileSummaryFixture() {
  return {
    summary:
      'A product-minded engineer who blends strong front-end craft with a pragmatic approach to backend systems. Has shipped features used by hundreds of thousands of people, mentors newer teammates, and is now looking for a role with end-to-end ownership of a product area.',
  };
}

function parseResumeFixture(text: string) {
  const block = (name: string) => text.match(new RegExp(String.raw`(?:^|\n)${name}\s*\n([\s\S]*?)(?:\n\s*\n|$)`))?.[1]?.trim() ?? '';
  const skills = block('SKILLS');
  if (skills) {
    return {
      education: block('EDUCATION'),
      skills,
      interests: '',
      careerGoals: block('GOALS') || 'Grow into a senior role with end-to-end ownership of a product area.',
      employmentHistory: block('EXPERIENCE'),
    };
  }
  return {
    education: 'B.Sc. Computer Science, University of Washington (2015–2019)',
    skills: 'TypeScript, React, Next.js, Node.js, PostgreSQL, AWS, Docker, Figma',
    interests: 'Open source, rock climbing, photography, mentoring',
    careerGoals: 'Grow into a staff-level engineer owning product architecture at a mission-driven company.',
    employmentHistory:
      'Senior Frontend Engineer, Brightline Health (2022–present): led patient portal rebuild.\nFrontend Engineer, Parcel & Pine (2019–2022): built merchant dashboard for 4,000+ stores.',
  };
}

function extractDocumentFixture(text: string) {
  const name = pick(text, ['Original filename'], 'Document');
  return {
    title: name.replace(/\.[a-z0-9]+$/i, ''),
    text: 'Senior Frontend Engineer — Brightline Health (2022–present)\nLed a five-person squad rebuilding the patient portal in React and TypeScript.\n\nSkills: TypeScript, React, Next.js, Node.js, PostgreSQL, AWS\nEducation: B.Sc. Computer Science, University of Washington',
  };
}

const FIXTURES: Array<{ keys: string[]; build: (text: string) => unknown }> = [
  { keys: ['marketData', 'negotiationScript'], build: salaryFixture },
  { keys: ['estimatedTimeYears', 'steps'], build: careerPathFixture },
  { keys: ['questions', 'generalTips'], build: interviewQuestionsFixture },
  { keys: ['revisedAnswer', 'strengths'], build: evaluateAnswerFixture },
  { keys: ['coverLetter'], build: coverLetterFixture },
  { keys: ['headline', 'about'], build: linkedinFixture },
  { keys: ['overallMatch', 'missingSkills'], build: skillGapFixture },
  { keys: ['subject', 'body', 'timing'], build: emailFixture },
  { keys: ['keywordTargets', 'sectionSuggestions'], build: resumeMatchFixture },
  { keys: ['overallScore', 'breakdown'], build: jobMatchFixture },
  { keys: ['atsScore', 'experience'], build: fullResumeFixture },
  { keys: ['content', 'keywords', 'suggestions'], build: resumeSectionFixture },
  { keys: ['candidates'], build: rankCandidatesFixture },
  { keys: ['fitAnalysis'], build: opportunityAnalysisFixture },
  { keys: ['enhancedText'], build: enhanceTextFixture },
  { keys: ['employmentHistory', 'careerGoals'], build: parseResumeFixture },
  { keys: ['title', 'text'], build: extractDocumentFixture },
  { keys: ['summary'], build: profileSummaryFixture },
];

/** Generic fallback: produce a plausible value for any JSON schema. */
function sampleFromSchema(schema: JsonSchema | undefined, key = ''): unknown {
  if (!schema) return 'Sample output generated in demo mode.';
  if (schema.anyOf?.length) return sampleFromSchema(schema.anyOf.find((s) => s.type !== 'null') ?? schema.anyOf[0], key);
  if (schema.enum?.length) return schema.enum[0];
  const type = Array.isArray(schema.type) ? schema.type.find((t) => t !== 'null') : schema.type;
  switch (type) {
    case 'object': {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(schema.properties ?? {})) out[k] = sampleFromSchema(v, k);
      return out;
    }
    case 'array':
      return [0, 1, 2].map(() => sampleFromSchema(schema.items, key));
    case 'number':
    case 'integer':
      return schema.maximum !== undefined ? Math.round((schema.maximum + (schema.minimum ?? 0)) * 0.75) : 75;
    case 'boolean':
      return true;
    default:
      return schema.description ? `${schema.description.replace(/\.$/, '')} (demo).` : `Demo ${key || 'value'}`;
  }
}

export function buildDemoResponse(promptText: string, schema?: JsonSchema): unknown {
  const props = Object.keys(schema?.properties ?? {});
  const fixture = FIXTURES.find((f) => f.keys.every((k) => props.includes(k)));
  if (fixture) return fixture.build(promptText);
  if (!schema) return null;
  return sampleFromSchema(schema);
}

/** Genkit may inline the output schema into the prompt instead of passing it. */
function schemaFromPrompt(text: string): JsonSchema | undefined {
  const m = text.match(/schema:\s*```(?:json)?\s*([\s\S]*?)```/i);
  if (!m) return undefined;
  try {
    return JSON.parse(m[1]) as JsonSchema;
  } catch {
    return undefined;
  }
}

/** Text uploads (data:text/plain;base64,…) are readable offline, so use their content. */
function decodeTextMedia(url?: string): string {
  const m = url?.match(/^data:text\/plain[^,]*;base64,(.*)$/);
  return m ? Buffer.from(m[1], 'base64').toString('utf8') : '';
}

export function registerDemoModel(ai: Genkit) {
  return ai.defineModel(
    {
      name: DEMO_MODEL_NAME,
      label: 'Offline demo model',
      supports: { multiturn: true, systemRole: true, media: true, tools: false, output: ['text', 'json'], constrained: 'all' },
    },
    async (request) => {
      const promptText = request.messages
        .flatMap((m) => m.content.map((part) => part.text ?? decodeTextMedia(part.media?.url)))
        .join('\n');
      const schema =
        (request.output?.schema as JsonSchema | undefined) ?? schemaFromPrompt(promptText);
      const data = buildDemoResponse(promptText, schema);      const text =
        data === null
          ? 'This is a demo response. Connect a Google AI API key to get live AI output.'
          : JSON.stringify(data);
      return {
        message: { role: 'model', content: [{ text }] },
        finishReason: 'stop',
      };
    }
  );
}
