/**
 * Sample dataset for local development and staging.
 * Plain data only — written to Firestore by ./seed.ts with the Admin SDK.
 */

export const SAMPLE_SEEKER = {
  uid: "sample-seeker",
  email: "maya@example.com",
  firstName: "Maya",
  lastName: "Okafor",
  headline: "Frontend Engineer · React & TypeScript",
  location: "Austin, TX",
  education:
    "B.S. Computer Science, University of Texas at Austin (2019)\nGoogle UX Design Certificate (2022)",
  skills:
    "React, TypeScript, Next.js, Node.js, Tailwind CSS, GraphQL, PostgreSQL, Figma, Jest, Accessibility",
  interests: "Design systems, developer experience, climbing, film photography",
  careerGoals:
    "Grow into a senior product engineer role where I own a product area end-to-end and mentor newer engineers.",
  employmentHistory:
    "Frontend Engineer — Parcel & Pine (2022–present): rebuilt the merchant dashboard in Next.js, cutting load time 52% and lifting weekly active merchants 18%.\nJunior Web Developer — Brightwave Studio (2019–2022): shipped 30+ marketing sites and an internal component library used across 12 client projects.",
  bio: "Frontend engineer who loves fast, accessible interfaces and the teams that build them. Currently exploring my next role on a product-minded team.",
  references: "Available on request",
  portfolioLink: "https://maya-okafor.dev",
  linkedinLink: "https://www.linkedin.com/in/example-maya",
  githubLink: "https://github.com/example-maya",
  contactNumber: "+1 (512) 555-0148",
  portfolioProjects: [
    {
      title: "Shelfie",
      description: "Open-source reading tracker with offline sync — 1.8k GitHub stars.",
      url: "https://maya-okafor.dev/shelfie",
    },
    {
      title: "Tidewatch",
      description: "Real-time tide alert PWA used by 12k surfers each month.",
      url: "https://maya-okafor.dev/tidewatch",
    },
  ],
};

export const SAMPLE_EMPLOYER = {
  uid: "sample-employer",
  email: "talent@example.com",
  firstName: "Northwind",
  lastName: "Labs",
  companyName: "Northwind Labs",
  headline: "Hiring engineers, designers and data folks",
  location: "Remote · HQ in Denver, CO",
  industry: "Developer Tools",
  companySize: "51-200",
  founded: "2018",
  companyOverview:
    "Northwind Labs builds observability tools that help 4,000+ engineering teams find and fix production issues in minutes instead of hours. We're a remote-first team of 140 people across 11 countries, backed by Series B funding.",
  culture:
    "Remote-first, written-first culture. We ship small, measure everything, and keep meetings to a minimum.",
  benefits: [
    "Fully remote",
    "Equity for every employee",
    "$2,000 learning budget",
    "Home office stipend",
    "16 weeks parental leave",
    "4-day work week in August",
  ],
  supportEmail: "talent@northwind.example.com",
  contactNumber: "+1 (720) 555-0192",
  websiteLink: "https://northwind.example.com",
};

/** Other companies that post jobs. */
export const COMPANIES = [
  {
    uid: "sample-co-lumen",
    companyName: "Lumen Health",
    industry: "Healthcare",
    location: "Boston, MA",
    companySize: "201-500",
    founded: "2015",
    companyOverview:
      "Lumen Health builds patient-first software for 600 clinics across North America, from scheduling to remote care. Our mission is to give clinicians back two hours every day.",
    benefits: ["Hybrid", "Health, dental & vision", "401(k) match", "Wellness stipend"],
    color: "#0ea5e9",
  },
  {
    uid: "sample-co-fernwood",
    companyName: "Fernwood Finance",
    industry: "Fintech",
    location: "New York, NY",
    companySize: "501-1000",
    founded: "2012",
    companyOverview:
      "Fernwood Finance makes small-business banking simple: accounts, cards and cash-flow forecasting in one app trusted by 90,000 businesses.",
    benefits: ["Hybrid", "Annual bonus", "Commuter benefits", "Free lunch"],
    color: "#16a34a",
  },
  {
    uid: "sample-co-orbit",
    companyName: "Orbit Logistics",
    industry: "Logistics",
    location: "Chicago, IL",
    companySize: "1000+",
    founded: "2009",
    companyOverview:
      "Orbit Logistics moves 2 million packages a day with routing software that cuts fuel use by 14%. We're modernising freight one API at a time.",
    benefits: ["On-site gym", "Tuition reimbursement", "Pension plan"],
    color: "#f97316",
  },
  {
    uid: "sample-co-canvas",
    companyName: "Canvas & Code",
    industry: "Design Agency",
    location: "Remote",
    companySize: "11-50",
    founded: "2020",
    companyOverview:
      "Canvas & Code is a small product studio designing and building digital products for climate and education startups.",
    benefits: ["Fully remote", "Flexible hours", "Profit sharing"],
    color: "#a855f7",
  },
  {
    uid: "sample-co-greenleaf",
    companyName: "Greenleaf Energy",
    industry: "Clean Energy",
    location: "San Diego, CA",
    companySize: "201-500",
    founded: "2016",
    companyOverview:
      "Greenleaf Energy designs software that balances solar and battery storage for 40,000 homes and helps utilities flatten peak demand.",
    benefits: ["Hybrid", "EV charging", "Equity", "Volunteer days"],
    color: "#22c55e",
  },
  {
    uid: "sample-co-atlas",
    companyName: "Atlas Learning",
    industry: "EdTech",
    location: "Seattle, WA",
    companySize: "51-200",
    founded: "2017",
    companyOverview:
      "Atlas Learning builds adaptive learning tools used by 1.2 million students. We believe every learner deserves a great tutor.",
    benefits: ["Remote-friendly", "Learning budget", "Sabbatical after 4 years"],
    color: "#eab308",
  },
];

type Job = {
  id: string;
  employerId: string;
  title: string;
  type: "Internship" | "Volunteer" | "Full-time" | "Part-time" | "Contract";
  location: string;
  skills: string;
  experience: string;
  education: string;
  compensationAndBenefits: string;
  description: string;
  rolesAndResponsibilities: string;
  preferredQualifications?: string;
  workingHours?: string;
  daysAgo: number;
  status?: string;
};

const EEO =
  "We are an equal opportunity employer and value diversity. All qualified applicants will receive consideration for employment without regard to race, colour, religion, sex, sexual orientation, gender identity, national origin, disability or veteran status.";

export const JOBS: Job[] = [
  // Northwind Labs (sample employer)
  {
    id: "job-nw-senior-fe",
    employerId: SAMPLE_EMPLOYER.uid,
    title: "Senior Frontend Engineer",
    type: "Full-time",
    location: "Remote (US / Canada)",
    skills: "React, TypeScript, Next.js, GraphQL, Accessibility, Testing",
    experience: "5+ years building production web applications",
    education: "Bachelor's degree in CS or equivalent experience",
    compensationAndBenefits: "$150,000 – $180,000 + equity, fully remote, $2k learning budget",
    description:
      "Join the Insights team to build the dashboards thousands of engineers open first thing during an incident. You'll own complex, data-dense interfaces and make them feel instant.",
    rolesAndResponsibilities:
      "• Lead frontend architecture for the Insights product\n• Build fast, accessible data visualisations\n• Partner with design on our component library\n• Mentor mid-level engineers through code review and pairing",
    preferredQualifications: "Experience with charting libraries, WebSockets, or observability tools",
    workingHours: "Flexible, with 4 hours overlap with US Central",
    daysAgo: 3,
  },
  {
    id: "job-nw-product-designer",
    employerId: SAMPLE_EMPLOYER.uid,
    title: "Product Designer",
    type: "Full-time",
    location: "Remote (Americas)",
    skills: "Figma, Prototyping, Design Systems, User Research, Interaction Design",
    experience: "3+ years designing B2B SaaS products",
    education: "Degree in design, HCI, or equivalent portfolio",
    compensationAndBenefits: "$120,000 – $145,000 + equity",
    description:
      "Design the workflows engineers use to debug production. You'll take problems from discovery to shipped, working closely with PMs and engineers.",
    rolesAndResponsibilities:
      "• Run discovery interviews with customers\n• Own end-to-end design for 1–2 product areas\n• Contribute to and evolve our design system\n• Prototype and test ideas quickly",
    daysAgo: 6,
  },
  {
    id: "job-nw-backend",
    employerId: SAMPLE_EMPLOYER.uid,
    title: "Backend Engineer, Data Pipeline",
    type: "Full-time",
    location: "Remote (US)",
    skills: "Go, Kafka, PostgreSQL, Kubernetes, ClickHouse, Distributed Systems",
    experience: "4+ years in backend or data infrastructure",
    education: "Bachelor's degree in CS or related field",
    compensationAndBenefits: "$145,000 – $175,000 + equity",
    description:
      "Scale the pipeline that ingests 3 billion events a day. You'll design for reliability, cost and sub-second query latency.",
    rolesAndResponsibilities:
      "• Design and operate high-throughput ingestion services\n• Improve query performance on ClickHouse\n• Participate in a humane on-call rotation\n• Write clear design docs",
    daysAgo: 12,
  },
  {
    id: "job-nw-devrel-intern",
    employerId: SAMPLE_EMPLOYER.uid,
    title: "Developer Relations Intern",
    type: "Internship",
    location: "Remote",
    skills: "Technical Writing, JavaScript, Public Speaking, Video",
    experience: "Students or recent graduates",
    education: "Currently pursuing a degree in CS, communications or similar",
    compensationAndBenefits: "$35/hour, 12 weeks, summer 2027",
    description:
      "Help developers get value from Northwind in their first 10 minutes. Write tutorials, record short videos and talk with our community.",
    rolesAndResponsibilities:
      "• Write and test tutorials and sample apps\n• Help run our monthly community livestream\n• Collect feedback from developers",
    daysAgo: 20,
  },
  // Filled / closed roles, so the employer's status chart shows history
  {
    id: "job-nw-qa-engineer",
    employerId: SAMPLE_EMPLOYER.uid,
    title: "QA Automation Engineer",
    type: "Full-time",
    location: "Remote (US)",
    skills: "Playwright, TypeScript, CI/CD, Testing",
    experience: "3+ years in test automation",
    education: "Bachelor's degree or equivalent experience",
    compensationAndBenefits: "$115,000 – $135,000 + equity",
    description: "Own end-to-end test coverage for the Insights product. This role has been filled.",
    rolesAndResponsibilities: "• Build and maintain Playwright suites\n• Keep CI fast and reliable",
    daysAgo: 48,
    status: "Archived",
  },
  {
    id: "job-nw-support-eng",
    employerId: SAMPLE_EMPLOYER.uid,
    title: "Support Engineer",
    type: "Contract",
    location: "Remote (EU)",
    skills: "Customer Support, SQL, Debugging, Technical Writing",
    experience: "2+ years supporting developer tools",
    education: "Any",
    compensationAndBenefits: "€45/hour, 6-month contract",
    description: "Help customers debug their observability setups. Contract ended.",
    rolesAndResponsibilities: "• Triage and resolve support tickets\n• Write help-centre articles",
    daysAgo: 75,
    status: "Archived",
  },
  // Other companies
  {
    id: "job-lumen-fe",
    employerId: "sample-co-lumen",
    title: "Frontend Engineer, Patient Experience",
    type: "Full-time",
    location: "Boston, MA (Hybrid)",
    skills: "React, TypeScript, Accessibility, Jest, REST APIs",
    experience: "3+ years of frontend experience",
    education: "Bachelor's degree or equivalent",
    compensationAndBenefits: "$125,000 – $150,000, health/dental/vision, 401(k) match",
    description:
      "Build the patient portal used by 3 million patients to book visits, message clinicians and view results. Accessibility is a first-class requirement.",
    rolesAndResponsibilities:
      "• Ship patient-facing features in React\n• Meet WCAG 2.2 AA on everything we build\n• Collaborate with clinicians on workflows",
    daysAgo: 2,
  },
  {
    id: "job-lumen-data",
    employerId: "sample-co-lumen",
    title: "Data Analyst",
    type: "Full-time",
    location: "Remote (US)",
    skills: "SQL, Python, Looker, Statistics, Data Visualization",
    experience: "2+ years in analytics",
    education: "Degree in a quantitative field",
    compensationAndBenefits: "$95,000 – $115,000",
    description: "Turn clinic and patient data into insights that shape our roadmap and improve care outcomes.",
    rolesAndResponsibilities:
      "• Build dashboards for product and ops teams\n• Run experiment analysis\n• Partner with engineering on data quality",
    daysAgo: 9,
  },
  {
    id: "job-fernwood-fullstack",
    employerId: "sample-co-fernwood",
    title: "Full-Stack Engineer, Payments",
    type: "Full-time",
    location: "New York, NY (Hybrid)",
    skills: "TypeScript, Node.js, React, PostgreSQL, AWS",
    experience: "4+ years building web products",
    education: "Bachelor's degree or equivalent",
    compensationAndBenefits: "$160,000 – $190,000 + annual bonus",
    description:
      "Own features across the stack for our payments product — from ledger APIs to the UI small-business owners use every day.",
    rolesAndResponsibilities:
      "• Design reliable payment APIs\n• Build polished React interfaces\n• Improve observability and on-call tooling",
    daysAgo: 4,
  },
  {
    id: "job-fernwood-pm",
    employerId: "sample-co-fernwood",
    title: "Product Manager, Lending",
    type: "Full-time",
    location: "New York, NY",
    skills: "Product Strategy, SQL, Fintech, Stakeholder Management",
    experience: "4+ years in product management",
    education: "Bachelor's degree",
    compensationAndBenefits: "$165,000 – $195,000 + bonus",
    description: "Lead the roadmap for our small-business lending product, from underwriting UX to repayment experience.",
    rolesAndResponsibilities: "• Own the lending roadmap\n• Define success metrics and run experiments\n• Work with risk and compliance partners",
    daysAgo: 15,
  },
  {
    id: "job-orbit-mobile",
    employerId: "sample-co-orbit",
    title: "React Native Engineer",
    type: "Contract",
    location: "Chicago, IL (Remote OK)",
    skills: "React Native, TypeScript, Offline Sync, Maps",
    experience: "3+ years of mobile development",
    education: "Any",
    compensationAndBenefits: "$85 – $105/hour, 6-month contract with extension",
    description: "Build the driver app used by 18,000 drivers to plan routes and confirm deliveries, even with spotty connectivity.",
    rolesAndResponsibilities: "• Build offline-first features\n• Improve map performance\n• Work closely with driver-ops",
    daysAgo: 7,
  },
  {
    id: "job-orbit-sre",
    employerId: "sample-co-orbit",
    title: "Site Reliability Engineer",
    type: "Full-time",
    location: "Chicago, IL",
    skills: "Kubernetes, Terraform, AWS, Prometheus, Linux",
    experience: "4+ years in SRE or DevOps",
    education: "Bachelor's degree or equivalent",
    compensationAndBenefits: "$140,000 – $165,000, pension plan",
    description: "Keep our routing platform at 99.99% uptime during peak season.",
    rolesAndResponsibilities: "• Own SLOs for core services\n• Automate infrastructure with Terraform\n• Lead incident reviews",
    daysAgo: 18,
  },
  {
    id: "job-canvas-ux",
    employerId: "sample-co-canvas",
    title: "UX/UI Designer",
    type: "Part-time",
    location: "Remote",
    skills: "Figma, UX Research, Prototyping, Webflow",
    experience: "2+ years of product design",
    education: "Portfolio required",
    compensationAndBenefits: "$60 – $75/hour, 20–25 hours/week",
    description: "Design products for climate and education startups with a small, senior team.",
    rolesAndResponsibilities: "• Lead design sprints with clients\n• Produce high-fidelity prototypes\n• Hand off to engineers",
    daysAgo: 5,
  },
  {
    id: "job-canvas-intern",
    employerId: "sample-co-canvas",
    title: "Frontend Developer Intern",
    type: "Internship",
    location: "Remote",
    skills: "HTML, CSS, JavaScript, React",
    experience: "Students welcome",
    education: "Pursuing a degree or bootcamp",
    compensationAndBenefits: "$28/hour, 10 weeks",
    description: "Pair with senior engineers to ship real client work.",
    rolesAndResponsibilities: "• Build responsive pages and components\n• Write tests\n• Join client demos",
    daysAgo: 11,
  },
  {
    id: "job-greenleaf-ml",
    employerId: "sample-co-greenleaf",
    title: "Machine Learning Engineer, Forecasting",
    type: "Full-time",
    location: "San Diego, CA (Hybrid)",
    skills: "Python, PyTorch, Time Series, SQL, MLOps",
    experience: "3+ years in applied ML",
    education: "MS or PhD in a quantitative field preferred",
    compensationAndBenefits: "$155,000 – $185,000 + equity",
    description: "Forecast solar generation and household demand to optimise battery dispatch across 40,000 homes.",
    rolesAndResponsibilities: "• Build and deploy forecasting models\n• Own model monitoring\n• Collaborate with grid partners",
    daysAgo: 1,
  },
  {
    id: "job-greenleaf-volunteer",
    employerId: "sample-co-greenleaf",
    title: "Community Solar Volunteer Coordinator",
    type: "Volunteer",
    location: "San Diego, CA",
    skills: "Community Outreach, Event Planning, Communication",
    experience: "None required",
    education: "None required",
    compensationAndBenefits: "Volunteer role · flexible hours",
    description: "Help neighbourhoods understand and join community solar programmes.",
    rolesAndResponsibilities: "• Organise info sessions\n• Coordinate volunteers\n• Collect community feedback",
    daysAgo: 22,
  },
  {
    id: "job-atlas-fe",
    employerId: "sample-co-atlas",
    title: "Frontend Engineer, Learning Experience",
    type: "Full-time",
    location: "Seattle, WA (Remote-friendly)",
    skills: "React, TypeScript, Next.js, Animation, Accessibility",
    experience: "3+ years building consumer web apps",
    education: "Bachelor's degree or equivalent",
    compensationAndBenefits: "$135,000 – $160,000 + equity",
    description: "Build delightful, accessible learning experiences used by over a million students.",
    rolesAndResponsibilities: "• Ship interactive lesson components\n• Improve performance on low-end devices\n• Partner with learning scientists",
    daysAgo: 8,
  },
  {
    id: "job-orbit-web",
    employerId: "sample-co-orbit",
    title: "Senior Web Engineer, Shipper Portal",
    type: "Full-time",
    location: "Remote (US)",
    skills: "React, TypeScript, Next.js, Node.js, GraphQL",
    experience: "5+ years building production web apps",
    education: "Bachelor's degree or equivalent",
    compensationAndBenefits: "$150,000 – $175,000 + equity",
    description: "Own the web portal shippers use to book, track and pay for 40,000 deliveries a day.",
    rolesAndResponsibilities: "• Lead the portal's Next.js migration\n• Design GraphQL APIs with the platform team\n• Mentor two mid-level engineers",
    daysAgo: 1,
  },
  {
    id: "job-greenleaf-fe",
    employerId: "sample-co-greenleaf",
    title: "Frontend Engineer, Energy Dashboards",
    type: "Full-time",
    location: "San Diego, CA (Hybrid)",
    skills: "React, TypeScript, Tailwind CSS, Jest, Data Visualization",
    experience: "3+ years of frontend development",
    education: "Bachelor's degree or equivalent",
    compensationAndBenefits: "$130,000 – $150,000 + solar stipend",
    description: "Turn live grid data into dashboards that help 40,000 households shift their energy use.",
    rolesAndResponsibilities: "• Build real-time charts\n• Own the design-system components\n• Work with ML engineers on forecasting UX",
    daysAgo: 2,
  },
  {
    id: "job-atlas-content",
    employerId: "sample-co-atlas",
    title: "Curriculum Designer (Math)",
    type: "Contract",
    location: "Remote",
    skills: "Curriculum Design, Mathematics, Writing, Instructional Design",
    experience: "3+ years teaching or curriculum writing",
    education: "Degree in education or mathematics",
    compensationAndBenefits: "$55/hour, 4-month project",
    description: "Design adaptive math lessons for grades 6–8.",
    rolesAndResponsibilities: "• Write lesson sequences\n• Design practice problems\n• Review content with teachers",
    daysAgo: 14,
  },
];

export function jobDoc(job: Job, employerName: string) {
  const company = COMPANIES.find((c) => c.uid === job.employerId);
  const overview = company?.companyOverview ?? SAMPLE_EMPLOYER.companyOverview;
  const { id, daysAgo, ...rest } = job;
  return {
    ...rest,
    companyOverview: overview,
    applicationInstructions: "Apply through this page with a short cover letter. We reply to every applicant within 7 days.",
    legalStatement: EEO,
    travelRequirements: "Up to 10% for team offsites",
    workingHours: job.workingHours ?? "Standard business hours, flexible",
    preferredQualifications: job.preferredQualifications ?? "",
    employerName,
    status: job.status ?? "Active",
  };
}

/** Candidates in the talent pool (also post on the feed). */
export const CANDIDATES = [
  { uid: "sample-cand-01", firstName: "Daniel", lastName: "Reyes", headline: "Senior Frontend Engineer", location: "Denver, CO", skills: "React, TypeScript, Next.js, GraphQL, Testing, Accessibility", education: "B.S. Software Engineering, Colorado State", careerGoals: "Lead frontend architecture at a developer-tools company.", employmentHistory: "Senior Frontend Engineer — Ledgerly (2020–present)\nFrontend Engineer — Paperplane (2017–2020)" },
  { uid: "sample-cand-02", firstName: "Priya", lastName: "Natarajan", headline: "Product Designer · Design Systems", location: "Toronto, ON", skills: "Figma, Design Systems, Prototyping, User Research, Interaction Design", education: "B.Des. Interaction Design, OCAD University", careerGoals: "Shape design systems for complex B2B tools.", employmentHistory: "Product Designer — Shopwave (2021–present)\nUX Designer — Northlight Agency (2018–2021)" },
  { uid: "sample-cand-03", firstName: "Marcus", lastName: "Bell", headline: "Backend Engineer · Go & Kafka", location: "Atlanta, GA", skills: "Go, Kafka, PostgreSQL, Kubernetes, Distributed Systems", education: "B.S. Computer Engineering, Georgia Tech", careerGoals: "Build reliable data infrastructure at scale.", employmentHistory: "Backend Engineer — Streamline (2019–present)" },
  { uid: "sample-cand-04", firstName: "Sofia", lastName: "Lindqvist", headline: "Frontend Engineer", location: "Remote · Stockholm", skills: "React, TypeScript, Next.js, Tailwind CSS, Jest", education: "M.Sc. Media Technology, KTH", careerGoals: "Work on fast, beautiful dashboards.", employmentHistory: "Frontend Engineer — Klarvy (2021–present)" },
  { uid: "sample-cand-05", firstName: "Jamal", lastName: "Carter", headline: "Developer Advocate in training", location: "Philadelphia, PA", skills: "JavaScript, Technical Writing, Public Speaking, Video", education: "B.A. Communications, Temple University (2026)", careerGoals: "Break into developer relations.", employmentHistory: "Student Tech Blogger (2023–present)" },
  { uid: "sample-cand-06", firstName: "Elena", lastName: "Petrova", headline: "Data Engineer", location: "Austin, TX", skills: "Python, Kafka, ClickHouse, SQL, Airflow, Go", education: "M.S. Data Science, UT Austin", careerGoals: "Design real-time analytics platforms.", employmentHistory: "Data Engineer — Fieldnote (2020–present)" },
  { uid: "sample-cand-07", firstName: "Kenji", lastName: "Watanabe", headline: "Full-Stack Engineer", location: "San Francisco, CA", skills: "TypeScript, React, Node.js, PostgreSQL, GraphQL", education: "B.S. EECS, UC Berkeley", careerGoals: "Own product areas end-to-end.", employmentHistory: "Full-Stack Engineer — Quillpad (2018–present)" },
  { uid: "sample-cand-08", firstName: "Amara", lastName: "Nwosu", headline: "UX Researcher & Designer", location: "London, UK", skills: "User Research, Figma, Prototyping, Usability Testing", education: "M.A. HCI, UCL", careerGoals: "Lead research for developer tools.", employmentHistory: "UX Researcher — Brightpath (2020–present)" },
  { uid: "sample-cand-09", firstName: "Lucas", lastName: "Moreau", headline: "Platform Engineer", location: "Montréal, QC", skills: "Kubernetes, Go, Terraform, AWS, Observability", education: "B.Eng. Software, Polytechnique Montréal", careerGoals: "Build developer platforms that teams love.", employmentHistory: "Platform Engineer — Cloudnine (2019–present)" },
  { uid: "sample-cand-10", firstName: "Hannah", lastName: "Kim", headline: "Frontend Developer · Accessibility", location: "Portland, OR", skills: "React, Accessibility, TypeScript, CSS, Testing", education: "B.S. Computer Science, Oregon State", careerGoals: "Make the web usable for everyone.", employmentHistory: "Frontend Developer — Evergreen Gov Digital (2021–present)" },
  { uid: "sample-cand-11", firstName: "Omar", lastName: "Haddad", headline: "CS Student · Aspiring DevRel", location: "Detroit, MI", skills: "JavaScript, Python, Technical Writing, Community", education: "B.S. Computer Science, Wayne State (2027)", careerGoals: "Help developers learn new tools.", employmentHistory: "Teaching Assistant — Wayne State (2024–present)" },
  { uid: "sample-cand-12", firstName: "Grace", lastName: "Liu", headline: "Senior Product Designer", location: "Remote · Vancouver", skills: "Figma, Design Systems, Interaction Design, Prototyping", education: "BFA Design, Emily Carr University", careerGoals: "Design calm, powerful professional tools.", employmentHistory: "Senior Product Designer — Tandem (2019–present)" },
];

/** Applications to the sample employer's jobs: [candidateIndex, jobId, status, daysAgo]. */
export const EMPLOYER_APPLICATIONS: Array<[number, string, string, number]> = [
  [0, "job-nw-senior-fe", "Interview", 2],
  [3, "job-nw-senior-fe", "Screening", 2],
  [6, "job-nw-senior-fe", "Submitted", 1],
  [9, "job-nw-senior-fe", "Offer", 3],
  [1, "job-nw-product-designer", "Interview", 5],
  [7, "job-nw-product-designer", "Submitted", 4],
  [11, "job-nw-product-designer", "Hired", 24],
  [2, "job-nw-backend", "Screening", 9],
  [5, "job-nw-backend", "Interview", 10],
  [8, "job-nw-backend", "Rejected", 11],
  [4, "job-nw-devrel-intern", "Submitted", 15],
  [10, "job-nw-devrel-intern", "Screening", 14],
];

/** Sample seeker's applications: [jobId, status, daysAgo, coverLetter]. */
export const SEEKER_APPLICATIONS: Array<[string, string, number]> = [
  ["job-nw-senior-fe", "Interview", 2],
  ["job-lumen-fe", "Submitted", 1],
  ["job-fernwood-fullstack", "Interview", 3],
  ["job-atlas-fe", "Screening", 9],
  ["job-orbit-mobile", "Rejected", 7],
  ["job-canvas-ux", "Hired", 5],
  // Older history so Insights shows a few weeks of activity.
  ["job-greenleaf-fe", "Screening", 13],
  ["job-orbit-web", "Offer", 19],
  ["job-greenleaf-ml", "Rejected", 27],
  ["job-lumen-data", "Rejected", 34],
];

/** Manual job-tracker cards for the sample seeker (users/{uid}/applications). */
export const SEEKER_TRACKER = [
  { id: "trk-1", title: "Senior UI Engineer", company: "Pinecone Studio", location: "Remote", salary: "$140k – $160k", column: "saved", jobUrl: "https://jobs.example.com/pinecone/ui" },
  { id: "trk-2", title: "Frontend Engineer II", company: "Harbor Bank", location: "Austin, TX", salary: "$130k", column: "applied", jobUrl: "https://jobs.example.com/harbor/fe2" },
  { id: "trk-3", title: "Design Engineer", company: "Juniper AI", location: "San Francisco, CA", salary: "$155k – $175k", column: "interview", jobUrl: "https://jobs.example.com/juniper/design-eng" },
  { id: "trk-4", title: "Product Engineer", company: "Kitebird", location: "Remote", salary: "$135k + equity", column: "saved", jobUrl: "https://jobs.example.com/kitebird/pe" },
  { id: "trk-5", title: "Frontend Platform Engineer", company: "Quarry", location: "Remote (US)", salary: "$150k", column: "offer", jobUrl: "https://jobs.example.com/quarry/platform" },
];

export const SEEKER_SAVED = ["job-greenleaf-ml", "job-lumen-data", "job-nw-product-designer", "job-atlas-fe"];

export const COVER_LETTERS = [
  "I've spent the last four years building fast, accessible React interfaces for data-heavy products, and your team's focus on performance really resonates with me. At my current role I cut dashboard load time in half and introduced a component library now used across three teams.",
  "I'm excited about this role because it sits exactly where I do my best work — complex workflows that need to feel simple. I'd love to bring my design-systems experience to your team.",
  "Reliability and clear communication are what I care about most. I've operated services handling billions of events a day and enjoy writing design docs that make hard trade-offs explicit.",
  "As a recent graduate who has written over 40 tutorials, I'd love to help developers succeed with your product from day one.",
];

/** Feed posts: [authorUid, content, hoursAgo, likerIndexes, comments[[authorUid, text]]] */
export const POSTS: Array<{ author: string; content: string; hoursAgo: number; likes: string[]; comments: Array<[string, string]> }> = [
  {
    author: SAMPLE_EMPLOYER.uid,
    content: "We're hiring! 🚀 Northwind Labs is looking for a Senior Frontend Engineer and a Product Designer to help engineers debug production faster. Fully remote, equity for everyone, and a 4-day week every August. Check out our open roles.",
    hoursAgo: 5,
    likes: ["sample-seeker", "sample-cand-01", "sample-cand-02", "sample-cand-04", "sample-cand-12"],
    comments: [["sample-cand-04", "Applied! Love the written-first culture."], ["sample-seeker", "The 4-day August week is such a great perk 🙌"]],
  },
  {
    author: "sample-cand-02",
    content: "Shipped a full design-system refresh this week: 140 components, dark mode, and AA contrast everywhere. Biggest lesson — audit your tokens before you touch a single component.",
    hoursAgo: 9,
    likes: ["sample-cand-12", "sample-cand-08", "sample-seeker", SAMPLE_EMPLOYER.uid],
    comments: [["sample-cand-12", "Token audit first is so true. Great work, Priya!"]],
  },
  {
    author: "sample-seeker",
    content: "Wrote up how we cut our merchant dashboard load time by 52% — code-splitting, image budgets, and moving three heavy charts to server components. Happy to share the checklist if it's useful to anyone!",
    hoursAgo: 20,
    likes: ["sample-cand-01", "sample-cand-04", "sample-cand-07", "sample-cand-10", SAMPLE_EMPLOYER.uid, "sample-co-atlas"],
    comments: [["sample-cand-10", "Would love the checklist!"], [SAMPLE_EMPLOYER.uid, "This is exactly the kind of work our Insights team does — would love to chat."]],
  },
  {
    author: "sample-co-greenleaf",
    content: "☀️ Our forecasting models helped 40,000 homes shift 18 MWh of demand off-peak during last week's heatwave. We're growing the ML team in San Diego — come build climate tech with us.",
    hoursAgo: 30,
    likes: ["sample-cand-06", "sample-cand-09", "sample-seeker"],
    comments: [],
  },
  {
    author: "sample-cand-05",
    content: "Gave my first ever conference lightning talk today on making docs searchable. Nervous for the first 30 seconds, then it was the most fun I've had all year. 🎤",
    hoursAgo: 44,
    likes: ["sample-cand-11", "sample-cand-02", "sample-seeker", SAMPLE_EMPLOYER.uid],
    comments: [["sample-cand-11", "Congrats Jamal! Was it recorded?"]],
  },
  {
    author: "sample-cand-03",
    content: "Hot take: most Kafka problems are actually schema problems. Invest in a schema registry and contract tests early — future you will thank you.",
    hoursAgo: 60,
    likes: ["sample-cand-06", "sample-cand-09"],
    comments: [["sample-cand-06", "Agree 100%. Schema drift cost us a whole sprint last year."]],
  },
  {
    author: "sample-co-lumen",
    content: "Lumen Health just passed 3 million patients on our portal 💙 Huge thanks to our clinicians and engineers. We're hiring frontend engineers who care about accessibility.",
    hoursAgo: 75,
    likes: ["sample-cand-10", "sample-seeker"],
    comments: [],
  },
  {
    author: "sample-cand-12",
    content: "Three things I look for in a portfolio review: a clear problem statement, evidence of iteration, and the outcome — even if it's 'we learned this didn't work'.",
    hoursAgo: 96,
    likes: ["sample-cand-02", "sample-cand-08", "sample-seeker"],
    comments: [["sample-cand-08", "The 'didn't work' stories are often the most interesting!"]],
  },
  {
    author: "sample-cand-07",
    content: "Six months into using server components in production. Net result: 30% less client JS, simpler data fetching, and a few new footguns around caching. Worth it.",
    hoursAgo: 130,
    likes: ["sample-cand-04", "sample-seeker", "sample-cand-01"],
    comments: [],
  },
];

/** Chats: participants + messages [senderUid, text, minutesAgo]. */
export const CHATS = [
  {
    id: "chat-seeker-northwind",
    participants: [SAMPLE_SEEKER.uid, SAMPLE_EMPLOYER.uid],
    opportunityId: "job-nw-senior-fe",
    opportunityTitle: "Senior Frontend Engineer",
    applicationId: "app-seeker-job-nw-senior-fe",
    messages: [
      [SAMPLE_EMPLOYER.uid, "Hi Maya! Thanks for applying to the Senior Frontend Engineer role. Your dashboard performance write-up caught our eye.", 2900],
      [SAMPLE_SEEKER.uid, "Thank you! I'm really excited about the Insights team — I've been a Northwind user for a while.", 2880],
      [SAMPLE_EMPLOYER.uid, "Great to hear. Would you be free for a 45-minute technical conversation next Tuesday or Wednesday?", 1500],
      [SAMPLE_SEEKER.uid, "Wednesday at 11am CT works perfectly for me.", 1440],
      [SAMPLE_EMPLOYER.uid, "Booked! You'll get a calendar invite shortly. Looking forward to it 🙌", 60],
    ] as Array<[string, string, number]>,
  },
  {
    id: "chat-seeker-fernwood",
    participants: [SAMPLE_SEEKER.uid, "sample-co-fernwood"],
    opportunityId: "job-fernwood-fullstack",
    opportunityTitle: "Full-Stack Engineer, Payments",
    applicationId: "app-seeker-job-fernwood-fullstack",
    messages: [
      ["sample-co-fernwood", "Hi Maya, we'd love to move you to the onsite loop for the Payments role.", 4000],
      [SAMPLE_SEEKER.uid, "That's great news! What should I prepare for?", 3900],
      ["sample-co-fernwood", "A system design session on ledgers, a React pairing exercise, and a chat with the hiring manager.", 3800],
    ] as Array<[string, string, number]>,
  },
  {
    id: "chat-employer-daniel",
    participants: [SAMPLE_EMPLOYER.uid, "sample-cand-01"],
    opportunityId: "job-nw-senior-fe",
    opportunityTitle: "Senior Frontend Engineer",
    applicationId: "app-emp-0-job-nw-senior-fe",
    messages: [
      [SAMPLE_EMPLOYER.uid, "Hi Daniel, thanks for the great conversation yesterday!", 600],
      ["sample-cand-01", "Thanks for having me — I enjoyed the pairing exercise a lot.", 540],
      ["sample-cand-01", "Quick question: is the role open to candidates based in Mexico City?", 30],
    ] as Array<[string, string, number]>,
  },
  {
    id: "chat-employer-grace",
    participants: [SAMPLE_EMPLOYER.uid, "sample-cand-12"],
    opportunityId: "job-nw-product-designer",
    opportunityTitle: "Product Designer",
    applicationId: "app-emp-6-job-nw-product-designer",
    messages: [
      [SAMPLE_EMPLOYER.uid, "Grace, we're thrilled to officially welcome you to Northwind! 🎉", 7000],
      ["sample-cand-12", "I'm so excited! Signed and sent back this morning.", 6900],
    ] as Array<[string, string, number]>,
  },
];

export const SEEKER_NOTIFICATIONS = [
  { type: "application_update", title: "Interview scheduled", message: "Northwind Labs moved your Senior Frontend Engineer application to Interview.", minutesAgo: 55, read: false, link: "/applied" },
  { type: "new_message", title: "New message from Northwind Labs", message: "Booked! You'll get a calendar invite shortly.", minutesAgo: 60, read: false, link: "/inbox" },
  { type: "job_match", title: "New match: ML Engineer, Forecasting", message: "Greenleaf Energy posted a role that matches 4 of your skills.", minutesAgo: 600, read: false, link: "/opportunities/job-greenleaf-ml" },
  { type: "application_update", title: "Congratulations! 🎉", message: "Canvas & Code marked your UX/UI Designer application as Hired.", minutesAgo: 2000, read: true, link: "/applied" },
  { type: "new_follower", title: "Daniel Reyes followed you", message: "Daniel Reyes started following you.", minutesAgo: 3000, read: true, link: "/users/sample-cand-01" },
  { type: "system", title: "Your profile is 90% complete", message: "Add a cover photo to stand out to recruiters.", minutesAgo: 6000, read: true, link: "/profile" },
];

export const EMPLOYER_NOTIFICATIONS = [
  { type: "new_applicant", title: "New applicant: Kenji Watanabe", message: "Kenji applied to Senior Frontend Engineer.", minutesAgo: 90, read: false, link: "/employer/postings/job-nw-senior-fe/applicants" },
  { type: "new_message", title: "New message from Daniel Reyes", message: "Is the role open to candidates based in Mexico City?", minutesAgo: 30, read: false, link: "/inbox" },
  { type: "new_applicant", title: "New applicant: Amara Nwosu", message: "Amara applied to Product Designer.", minutesAgo: 5800, read: true, link: "/employer/postings/job-nw-product-designer/applicants" },
  { type: "system", title: "Your posting is trending", message: "Senior Frontend Engineer got 3× more views than average this week.", minutesAgo: 1400, read: false, link: "/employer/postings" },
];
