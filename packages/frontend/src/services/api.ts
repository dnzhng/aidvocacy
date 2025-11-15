import axios from 'axios';

const API_BASE_URL = '/api';

export interface Representative {
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
}

export interface Issue {
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
}

export interface Script {
  id: string;
  title: string;
  description?: string;
  content: string;
  issue: {
    id: string;
    name: string;
    category: string;
  };
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  tone: string;
}

export interface Call {
  id: string;
  representativeId: string;
  scriptId: string;
  personaId: string;
  status: 'PENDING' | 'QUEUED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
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

export const api = {
  async getRepresentatives(params?: { state?: string; issueId?: string }): Promise<Representative[]> {
    const response = await axios.get(`${API_BASE_URL}/representatives`, { params });
    return response.data.representatives;
  },

  async getIssues(params?: { category?: string; representativeId?: string }): Promise<Issue[]> {
    const response = await axios.get(`${API_BASE_URL}/issues`, { params });
    return response.data.issues;
  },

  async getScripts(params?: { issueId?: string }): Promise<Script[]> {
    const response = await axios.get(`${API_BASE_URL}/scripts`, { params });
    return response.data.scripts;
  },

  async getPersonas(): Promise<Persona[]> {
    const response = await axios.get(`${API_BASE_URL}/personas`);
    return response.data.personas;
  },

  async createCall(data: {
    representativeId: string;
    scriptId: string;
    personaId: string;
  }): Promise<{ callId: string; status: string; message: string }> {
    const response = await axios.post(`${API_BASE_URL}/calls`, data);
    return response.data;
  },

  async getCall(callId: string): Promise<Call> {
    const response = await axios.get(`${API_BASE_URL}/calls/${callId}`);
    return response.data;
  }
};
