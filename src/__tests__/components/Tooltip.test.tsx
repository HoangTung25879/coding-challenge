import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Tooltip } from '@/components/ui/Tooltip'

describe('Tooltip', () => {
  it('renders children', () => {
    render(<Tooltip content="Tip"><button>Hover me</button></Tooltip>)
    expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument()
  })

  it('renders tooltip content element', () => {
    render(<Tooltip content="Tip text"><span>Target</span></Tooltip>)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    expect(screen.getByRole('tooltip')).toHaveTextContent('Tip text')
  })

  it('renders only children when disabled', () => {
    render(<Tooltip content="Tip" disabled><span>Target</span></Tooltip>)
    expect(screen.getByText('Target')).toBeInTheDocument()
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('applies side classes', () => {
    render(<Tooltip content="Tip" side="bottom"><span>Target</span></Tooltip>)
    expect(screen.getByRole('tooltip').className).toContain('top-full')
  })
})
