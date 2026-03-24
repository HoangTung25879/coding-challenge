// src/lib/api.ts
import type { CollectionResponse, Lead, LeadStatus, LeadSource, LeadType, Activity, PaginationMeta } from '@/types'

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
  search?: string
  status?: string
  source?: string
  budgetMin?: number
  budgetMax?: number
  currency?: string
  timeline?: string
  financing?: string
  leadType?: string
  sort?: string
  order?: 'asc' | 'desc'
}

export type LeadsResponse = CollectionResponse<Lead> & {
  pagination: PaginationMeta
}

export function fetchLeads(params: LeadsParams = {}): Promise<LeadsResponse> {
  const qs = new URLSearchParams()
  if (params.page) qs.set('page', String(params.page))
  if (params.limit) qs.set('limit', String(params.limit))
  if (params.search) qs.set('search', params.search)
  if (params.status) qs.set('status', params.status)
  if (params.source) qs.set('source', params.source)
  if (params.budgetMin != null) qs.set('budgetMin', String(params.budgetMin))
  if (params.budgetMax != null) qs.set('budgetMax', String(params.budgetMax))
  if (params.currency) qs.set('currency', params.currency)
  if (params.timeline) qs.set('timeline', params.timeline)
  if (params.financing) qs.set('financing', params.financing)
  if (params.leadType) qs.set('leadType', params.leadType)
  if (params.sort) qs.set('sort', params.sort)
  if (params.order) qs.set('order', params.order)
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

export type CreateLeadBody = {
  fullName: string
  email: string
  phone?: string
  status: LeadStatus
  source: LeadSource
  leadType: LeadType
}

export function createLead(body: CreateLeadBody): Promise<Lead> {
  return fetchJSON('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export function updateLead(id: string, patch: Partial<Lead>): Promise<Lead> {
  return fetchJSON(`/api/leads/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
}

export function deleteLead(id: string): Promise<void> {
  return fetch(`${BASE_URL}/api/leads/${id}`, { method: 'DELETE' }).then(async res => {
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as Record<string, unknown>
      throw new Error((body.error as string) ?? `HTTP ${res.status}`)
    }
  })
}

export function updateActivity(leadId: string, activityId: string, patch: Partial<Activity>): Promise<Activity> {
  return fetchJSON(`/api/leads/${leadId}/activities/${activityId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
}
