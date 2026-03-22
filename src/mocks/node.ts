// src/mocks/node.ts
import { setupServer } from 'msw/node'
import { leadHandlers } from './handlers/leads'
import { activityHandlers } from './handlers/activities'

export const server = setupServer(...leadHandlers, ...activityHandlers)
