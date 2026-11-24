import {
  CATEGORIES,
  MYSTERIES,
  RECENT_DISCOVERIES,
  RESEARCH_SOURCES,
  generateGroundedAssistantReply,
} from '../data';
import type {
  AssistantResponse,
  CategoryInfo,
  MysteryInvestigation,
  RecentDiscovery,
  ResearchSource,
} from '../types/archive';

const API_BASE = '/api';

async function tryFetchJson<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export interface ApiStatus {
  backendOnline: boolean;
  databaseMode: string;
  indexedMysteries: number;
  indexedSources: number;
}

export async function fetchApiStatus(): Promise<ApiStatus> {
  const data = await tryFetchJson<ApiStatus>('/health');
  if (data) return data;
  return {
    backendOnline: false,
    databaseMode: 'Local Verified Archive Bundle',
    indexedMysteries: MYSTERIES.length,
    indexedSources: RESEARCH_SOURCES.length,
  };
}

export async function fetchMysteries(): Promise<MysteryInvestigation[]> {
  const data = await tryFetchJson<{ items: MysteryInvestigation[] }>('/mysteries');
  return data?.items ?? MYSTERIES;
}

export async function fetchMysteryBySlug(slug: string): Promise<MysteryInvestigation | undefined> {
  const data = await tryFetchJson<MysteryInvestigation>(`/mysteries/${encodeURIComponent(slug)}`);
  return data ?? MYSTERIES.find((m) => m.slug === slug);
}

export async function fetchCategories(): Promise<CategoryInfo[]> {
  const data = await tryFetchJson<{ items: CategoryInfo[] }>('/categories');
  return data?.items ?? CATEGORIES;
}

export async function fetchSources(): Promise<ResearchSource[]> {
  const data = await tryFetchJson<{ items: ResearchSource[] }>('/sources');
  return data?.items ?? RESEARCH_SOURCES;
}

export async function fetchDiscoveries(): Promise<RecentDiscovery[]> {
  const data = await tryFetchJson<{ items: RecentDiscovery[] }>('/discoveries');
  return data?.items ?? RECENT_DISCOVERIES;
}

export async function queryAssistant(
  question: string,
  mysterySlug?: string
): Promise<AssistantResponse> {
  const data = await tryFetchJson<AssistantResponse>('/assistant/query', {
    method: 'POST',
    body: JSON.stringify({ question, mystery_slug: mysterySlug }),
  });
  return data ?? generateGroundedAssistantReply(question, mysterySlug);
}
