import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ActivityFeed } from '@/components/leads/ActivityFeed'
import type { Activity } from '@/types'

const makeActivity = (overrides: Partial<Activity> = {}): Activity => ({
  id: 'act-1',
  leadId: 'lead-001',
  type: 'call',
  subject: 'Initial call',
  note: 'Spoke about budget',
  createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
  createdBy: 'rep-1',
  ...overrides,
})

describe('ActivityFeed (timeline)', () => {
  it('renders empty state when no activities', () => {
    render(<ActivityFeed activities={[]} isLoading={false} />)
    expect(screen.getByText(/no activity recorded yet/i)).toBeInTheDocument()
  })

  it('renders activity subject and note', () => {
    render(<ActivityFeed activities={[makeActivity()]} isLoading={false} />)
    expect(screen.getByText('Initial call')).toBeInTheDocument()
    expect(screen.getByText('Spoke about budget')).toBeInTheDocument()
  })

  it('renders loading skeletons when isLoading=true', () => {
    const { container } = render(<ActivityFeed activities={[]} isLoading={true} />)
    // 3 skeleton rows
    expect(container.querySelectorAll('[data-testid="activity-skeleton"]').length).toBe(3)
  })

  it('renders all 6 activity types without crashing', () => {
    const types: Activity['type'][] = ['call', 'email', 'text', 'appointment', 'note', 'walk-in']
    const activities = types.map((type, i) =>
      makeActivity({ id: `act-${i}`, type, subject: `${type} subject` })
    )
    render(<ActivityFeed activities={activities} isLoading={false} />)
    types.forEach(type => {
      expect(screen.getByText(`${type} subject`)).toBeInTheDocument()
    })
  })
})
