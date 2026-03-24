// src/mocks/browser.ts
import { setupWorker } from 'msw/browser';
import { leadHandlers } from './handlers/leads';
import { activityHandlers } from './handlers/activities';

export const worker = setupWorker(...leadHandlers, ...activityHandlers);
