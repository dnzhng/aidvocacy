// API Request/Response types

export interface CreateCallRequest {
  representativeId: string;
  scriptId: string;
  personaId: string;
}

export interface CreateCallResponse {
  callId: string;
  status: CallStatus;
  message: string;
}

export interface GetCallResponse {
  id: string;
  representativeId: string;
  scriptId: string;
  personaId: string;
  status: CallStatus;
  modifiedScript: string;
  phoneNumber: string;
  duration?: number;
  transcript?: string;
  recording?: string;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
  representative: {
    id: string;
    name: string;
    title: string;
    state: string;
    district?: string;
  };
  script: {
    id: string;
    title: string;
    description?: string;
  };
  persona: {
    id: string;
    name: string;
    description: string;
  };
}

export interface ListRepresentativesResponse {
  representatives: {
    id: string;
    name: string;
    title: string;
    state: string;
    district?: string;
    party?: string;
    photoUrl?: string;
    issues: {
      id: string;
      name: string;
      category: string;
    }[];
  }[];
}

export interface ListIssuesResponse {
  issues: {
    id: string;
    name: string;
    description: string;
    category: string;
    scripts: {
      id: string;
      title: string;
      description?: string;
    }[];
    representatives: {
      id: string;
      name: string;
      title: string;
      state: string;
    }[];
  }[];
}

export interface ListScriptsResponse {
  scripts: {
    id: string;
    title: string;
    description?: string;
    content: string;
    issue: {
      id: string;
      name: string;
      category: string;
    };
  }[];
}

export interface ListPersonasResponse {
  personas: {
    id: string;
    name: string;
    description: string;
    tone: string;
  }[];
}

export enum CallStatus {
  PENDING = 'PENDING',
  QUEUED = 'QUEUED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

// Agent Service types

export interface MakeCallRequest {
  callId: string;
  phoneNumber: string;
  script: string;
  menuSteps?: MenuStep[];
}

export interface MenuStep {
  waitFor: string;
  action: string;
}

export interface MakeCallResponse {
  success: boolean;
  callSid?: string;
  error?: string;
}

export interface CallStatusUpdate {
  callId: string;
  status: CallStatus;
  duration?: number;
  transcript?: string;
  recording?: string;
  errorMessage?: string;
}

// Error types

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ServiceError';
  }
}
