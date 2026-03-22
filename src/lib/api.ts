// src/lib/api.ts
import type { CollectionResponse, Lead, LeadSummary, Activity, PaginationMeta } from '@/types'

const BASE_URL = (import.meta.env?.VITE_API_URL as string) ?? ''

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, init)
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as Record<string, unknown>
    throw new Error((body.error as string) ?? `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

export type LeadsParams = {
  page?: number
  limit?: number
  status?: string
  source?: string
}

export type LeadsResponse = CollectionResponse<LeadSummary> & {
  pagination: PaginationMeta
}

export function fetchLeads(params: LeadsParams = {}): Promise<LeadsResponse> {
  const qs = new URLSearchParams()
  if (params.page) qs.set('page', String(params.page))
  if (params.limit) qs.set('limit', String(params.limit))
  if (params.status) qs.set('status', params.status)
  if (params.source) qs.set('source', params.source)
  const query = qs.toString()
  return fetchJSON(`/api/leads${query ? `?${query}` : ''}`)
}

export function fetchLead(id: string): Promise<Lead> {
  return fetchJSON(`/api/leads/${id}`)
}

export function fetchActivities(leadId: string): Promise<CollectionResponse<Activity>> {
  return fetchJSON(`/api/leads/${leadId}/activities`)
}

export type PostActivityBody = {
  type: string
  subject: string
  note: string
  createdBy: string
}

export function postActivity(leadId: string, body: PostActivityBody): Promise<Activity> {
  return fetchJSON(`/api/leads/${leadId}/activities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
