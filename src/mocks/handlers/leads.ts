// src/mocks/handlers/leads.ts
import { http, HttpResponse } from 'msw'
import { leadsStore, toLeadSummary } from '@/mocks/data/leads'
import { logger } from '@/lib/logger'

const MOCK_DELAY_MS = 60

export const leadHandlers = [
  http.get('*/api/leads', async ({ request }) => {
    await delay(MOCK_DELAY_MS)
    const url = new URL(request.url)
    const page = Math.max(1, Number(url.searchParams.get('page') ?? 1))
    const limit = Math.max(1, Number(url.searchParams.get('limit') ?? 10))
    const status = url.searchParams.get('status')
    const source = url.searchParams.get('source')

    let filtered = leadsStore
    if (status) filtered = filtered.filter(l => l.status === status)
    if (source) filtered = filtered.filter(l => l.source === source)

    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const data = filtered.slice((page - 1) * limit, page * limit).map(toLeadSummary)

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
