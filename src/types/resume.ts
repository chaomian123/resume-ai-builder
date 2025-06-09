export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  summary: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  major: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

export interface OpenSourceProject {
  id: string;
  name: string;
  description: string;
  role: string;
  technologies: string[];
  githubUrl: string;
  liveUrl?: string;
  highlights: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  workExperience: WorkExperience[];
  education: Education[];
  openSourceProjects: OpenSourceProject[];
  skills: string[];
  jobIntention: string;
  mainTechStack: string[];
}

export interface AIConfig {
  apiUrl: string;
  apiKey: string;
  model: string;
}

export interface AppState {
  resumeData: ResumeData;
  aiConfig: AIConfig;
  isOptimizing: boolean;
  error: string | null;
}