import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ActionsCell } from '@/pages/lead-columns'

describe('ActionsCell', () => {
  it('renders Edit and Delete buttons', () => {
    render(<ActionsCell leadId="lead-001" onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByRole('button', { name: /edit lead/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete lead/i })).toBeInTheDocument()
  })

  it('calls onEdit with leadId when Edit is clicked', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    render(<ActionsCell leadId="lead-001" onEdit={onEdit} onDelete={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /edit lead/i }))
    expect(onEdit).toHaveBeenCalledWith('lead-001')
  })

  it('shows confirmation buttons after Delete is clicked', async () => {
    const user = userEvent.setup()
    render(<ActionsCell leadId="lead-001" onEdit={vi.fn()} onDelete={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /delete lead/i }))
    expect(screen.getByRole('button', { name: /^delete$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('calls onDelete with leadId on confirm', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    render(<ActionsCell leadId="lead-001" onEdit={vi.fn()} onDelete={onDelete} />)
    await user.click(screen.getByRole('button', { name: /delete lead/i }))
    await user.click(screen.getByRole('button', { name: /^delete$/i }))
    expect(onDelete).toHaveBeenCalledWith('lead-001')
  })

  it('cancels confirmation when Cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<ActionsCell leadId="lead-001" onEdit={vi.fn()} onDelete={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /delete lead/i }))
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    // Back to original state
    expect(screen.getByRole('button', { name: /delete lead/i })).toBeInTheDocument()
  })
})
