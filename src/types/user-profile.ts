/**
 * The `users/{uid}` document. Seekers and employers share one collection, so most fields are
 * optional and only filled for the matching role.
 */
export interface UserProfile {
  role: string;
  uid?: string;
  email?: string;
  displayName?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  photoURL?: string;
  coverPhoto?: string;
  plan?: string;
  location?: string;
  contactNumber?: string;

  // Job seeker
  headline?: string;
  about?: string;
  skills?: string;
  education?: string;
  employmentHistory?: string;
  careerGoals?: string;
  interests?: string;
  references?: string;
  employability?: string;
  portfolioLink?: string;
  linkedinLink?: string;
  githubLink?: string;
  twitterLink?: string;

  // Employer
  companyName?: string;
  company?: string;
  companyOverview?: string;
  companySize?: string;
  industry?: string;
  founded?: string;
  websiteLink?: string;
  supportEmail?: string;

  // Social
  followers?: string[];
  following?: string[];

  /** Structured editors, social counters and anything newer than this type. */
  [key: string]: unknown;
}
