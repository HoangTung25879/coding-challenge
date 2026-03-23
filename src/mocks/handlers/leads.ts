// src/mocks/handlers/leads.ts
import { http, HttpResponse } from 'msw'
import { get } from 'lodash-es'
import { leadsStore } from '@/mocks/data/leads'
import { logger } from '@/lib/logger'
import type { Lead } from '@/types'

const MOCK_DELAY_MS = 60

export const leadHandlers = [
  http.get('*/api/leads', async ({ request }) => {
    await delay(MOCK_DELAY_MS)
    const url = new URL(request.url)
    const page = Math.max(1, Number(url.searchParams.get('page') ?? 1))
    const limit = Math.max(1, Number(url.searchParams.get('limit') ?? 10))
    const search = url.searchParams.get('search')
    const status = url.searchParams.get('status')
    const source = url.searchParams.get('source')
    const budgetMin = url.searchParams.get('budgetMin')
    const budgetMax = url.searchParams.get('budgetMax')
    const timeline = url.searchParams.get('timeline')
    const financing = url.searchParams.get('financing')
    const leadType = url.searchParams.get('leadType')
    const sort = url.searchParams.get('sort') ?? 'createdAt'
    const order = url.searchParams.get('order') ?? 'desc'

    let filtered: Lead[] = leadsStore

    // Text search across multiple fields
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(l =>
        l.fullName.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.phone.toLowerCase().includes(q) ||
        l.notes.toLowerCase().includes(q),
      )
    }

    if (status) filtered = filtered.filter(l => l.status === status)
    if (source) filtered = filtered.filter(l => l.source === source)

    // Budget range
    if (budgetMin) {
      const min = Number(budgetMin)
      filtered = filtered.filter(l => l.budget.max >= min)
    }
    if (budgetMax) {
      const max = Number(budgetMax)
      filtered = filtered.filter(l => l.budget.max <= max)
    }

    if (timeline) filtered = filtered.filter(l => l.purchaseTimeline === timeline)
    if (financing) filtered = filtered.filter(l => l.financingPreference === financing)
    if (leadType) filtered = filtered.filter(l => l.leadType === leadType)

    // Sort
    filtered = [...filtered].sort((a, b) => {
      const aVal = get(a, sort)
      const bVal = get(b, sort)
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return order === 'asc' ? aVal - bVal : bVal - aVal
      }
      const aStr = String(aVal)
      const bStr = String(bVal)
      return order === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
    })

    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const data = filtered.slice((page - 1) * limit, page * limit)

    logger.info({ method: 'GET', path: '/api/leads', page, status: 200, resultCount: data.length }, 'leads fetched')

    return HttpResponse.json({
      data,
      pagination: { page, limit, total, totalPages },
    })
  }),

  http.get('*/api/leads/:id', async ({ params }) => {
    await delay(MOCK_DELAY_MS)
    const lead = leadsStore.find(l => l.id === params.id)
    if (!lead) {
      logger.warn({ method: 'GET', path: '/api/leads/:id', id: params.id, status: 404 }, 'lead not found')
      return HttpResponse.json({ error: 'Lead not found' }, { status: 404 })
    }
    logger.info({ method: 'GET', path: '/api/leads/:id', id: params.id, status: 200 }, 'lead fetched')
    return HttpResponse.json(lead)
  }),
]

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
