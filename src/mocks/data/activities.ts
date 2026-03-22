import type { Activity } from '@/types'

export const activitiesStore: Activity[] = [
  // lead-001 (3 activities)
  { id: 'act-001', leadId: 'lead-001', type: 'call', subject: 'Initial outreach', note: 'Called Alice, she is very interested in the Model 3. Will send brochure.', createdAt: '2026-03-01T10:00:00.000Z', createdBy: 'salesperson-1' },
  { id: 'act-002', leadId: 'lead-001', type: 'email', subject: 'Sent EV brochure', note: 'Sent full EV lineup brochure and financing options.', createdAt: '2026-03-02T09:00:00.000Z', createdBy: 'salesperson-1' },
  { id: 'act-003', leadId: 'lead-001', type: 'appointment', subject: 'Test drive scheduled', note: 'Alice confirmed test drive for March 22 at 10am.', createdAt: '2026-03-10T14:00:00.000Z', createdBy: 'salesperson-1' },

  // lead-002 (2 activities)
  { id: 'act-004', leadId: 'lead-002', type: 'call', subject: 'Fleet requirements call', note: 'Ben needs 5 Transit vans by Q2. Discussed fleet pricing.', createdAt: '2026-03-02T11:00:00.000Z', createdBy: 'salesperson-1' },
  { id: 'act-005', leadId: 'lead-002', type: 'note', subject: 'Internal note', note: 'Ben mentioned their CFO needs to approve over $150k. Follow up in 2 weeks.', createdAt: '2026-03-05T08:30:00.000Z', createdBy: 'salesperson-1' },

  // lead-003 (2 activities)
  { id: 'act-006', leadId: 'lead-003', type: 'walk-in', subject: 'Walked in to browse', note: 'Carla came in to look at used options. Showed her the Corolla and Civic.', createdAt: '2026-03-05T09:00:00.000Z', createdBy: 'salesperson-1' },
  { id: 'act-007', leadId: 'lead-003', type: 'text', subject: 'Followed up via text', note: 'Sent financing calculator link. No reply yet.', createdAt: '2026-03-07T16:00:00.000Z', createdBy: 'salesperson-1' },

  // lead-004 (2 activities)
  { id: 'act-008', leadId: 'lead-004', type: 'appointment', subject: 'Signing appointment', note: 'David signed the purchase agreement. Delivery in 2 weeks.', createdAt: '2026-03-10T11:00:00.000Z', createdBy: 'salesperson-1' },
  { id: 'act-009', leadId: 'lead-004', type: 'call', subject: 'Delivery confirmation call', note: 'Confirmed delivery date and time with David. He is excited.', createdAt: '2026-03-15T10:00:00.000Z', createdBy: 'salesperson-1' },

  // lead-005 (2 activities)
  { id: 'act-010', leadId: 'lead-005', type: 'call', subject: 'Trade-in enquiry', note: 'Elena called about trading in her 2019 Civic. Evaluated at approx $12,000.', createdAt: '2026-02-20T14:00:00.000Z', createdBy: 'salesperson-1' },
  { id: 'act-011', leadId: 'lead-005', type: 'email', subject: 'Trade-in offer sent', note: 'Sent formal trade-in offer. Elena did not accept — went with another dealer.', createdAt: '2026-02-25T09:00:00.000Z', createdBy: 'salesperson-1' },

  // lead-006 (2 activities)
  { id: 'act-012', leadId: 'lead-006', type: 'email', subject: 'Post-event follow-up', note: 'Sent Frank our fleet EV pricing sheet following the dealer event.', createdAt: '2026-03-08T11:00:00.000Z', createdBy: 'salesperson-2' },
  { id: 'act-013', leadId: 'lead-006', type: 'call', subject: 'Fleet pricing call', note: 'Discussed volume discount for 10 ID.4 units. Frank is reviewing internally.', createdAt: '2026-03-12T14:00:00.000Z', createdBy: 'salesperson-2' },

  // lead-007 (2 activities)
  { id: 'act-014', leadId: 'lead-007', type: 'call', subject: 'Initial contact', note: 'Grace called in. Very motivated buyer, mentioned she can close within 2 weeks.', createdAt: '2026-03-06T10:00:00.000Z', createdBy: 'salesperson-2' },
  { id: 'act-015', leadId: 'lead-007', type: 'text', subject: 'Sent vehicle specs', note: 'Texted Land Cruiser full spec sheet and availability. Awaiting reply.', createdAt: '2026-03-09T15:00:00.000Z', createdBy: 'salesperson-2' },

  // lead-008 (3 activities)
  { id: 'act-016', leadId: 'lead-008', type: 'email', subject: 'Initial inquiry response', note: 'Responded to GreenFleet website enquiry with fleet EV brochure.', createdAt: '2026-02-28T09:00:00.000Z', createdBy: 'salesperson-2' },
  { id: 'act-017', leadId: 'lead-008', type: 'appointment', subject: 'Fleet demo day', note: 'Henry and his team attended our fleet demo. Very positive feedback.', createdAt: '2026-03-07T10:00:00.000Z', createdBy: 'salesperson-2' },
  { id: 'act-018', leadId: 'lead-008', type: 'note', subject: 'Post-demo notes', note: 'Henry wants customized fleet management software integration. Escalated to solutions team.', createdAt: '2026-03-10T16:00:00.000Z', createdBy: 'salesperson-2' },

  // lead-009 (2 activities)
  { id: 'act-019', leadId: 'lead-009', type: 'email', subject: 'Initial follow-up', note: 'Sent Isabella pricing for the 718 Boxster with current promotions.', createdAt: '2026-02-10T15:00:00.000Z', createdBy: 'salesperson-2' },
  { id: 'act-020', leadId: 'lead-009', type: 'call', subject: 'Budget mismatch call', note: 'Isabella confirmed the Boxster is over budget. Could not negotiate further discount.', createdAt: '2026-02-18T11:00:00.000Z', createdBy: 'salesperson-2' },

  // lead-010 (3 activities)
  { id: 'act-021', leadId: 'lead-010', type: 'call', subject: 'Initial interest call', note: 'James inquired about the Taycan via Instagram DM, followed up by phone.', createdAt: '2026-02-05T11:00:00.000Z', createdBy: 'salesperson-1' },
  { id: 'act-022', leadId: 'lead-010', type: 'appointment', subject: 'Test drive', note: 'James test drove the Taycan Sport Turismo. Loved it.', createdAt: '2026-02-15T10:00:00.000Z', createdBy: 'salesperson-1' },
  { id: 'act-023', leadId: 'lead-010', type: 'note', subject: 'Deal closed', note: 'Signed purchase agreement for Taycan Sport Turismo in Frozen Blue. Full cash payment.', createdAt: '2026-03-05T12:00:00.000Z', createdBy: 'salesperson-1' },

  // lead-011 (2 activities)
  { id: 'act-024', leadId: 'lead-011', type: 'walk-in', subject: 'Showroom visit', note: 'Keiko walked in and expressed interest in the CX-5. Took a brochure.', createdAt: '2026-03-10T12:00:00.000Z', createdBy: 'salesperson-2' },
  { id: 'act-025', leadId: 'lead-011', type: 'email', subject: 'Brochure and pricing follow-up', note: 'Emailed Keiko detailed pricing and sunroof upgrade options.', createdAt: '2026-03-13T09:00:00.000Z', createdBy: 'salesperson-2' },

  // lead-012 (2 activities)
  { id: 'act-026', leadId: 'lead-012', type: 'call', subject: 'Post-event call', note: 'Called Liam to follow up after the dealer event. Confirmed urgent need for 3 vans.', createdAt: '2026-03-09T10:00:00.000Z', createdBy: 'salesperson-2' },
  { id: 'act-027', leadId: 'lead-012', type: 'appointment', subject: 'Site visit', note: 'Visited Build Ireland office to discuss specs and shelving requirements.', createdAt: '2026-03-14T14:00:00.000Z', createdBy: 'salesperson-2' },

  // lead-013 (2 activities)
  { id: 'act-028', leadId: 'lead-013', type: 'call', subject: 'Initial phone enquiry', note: 'Maria called in asking about family SUVs. Recommended the Volvo XC90.', createdAt: '2026-03-07T14:00:00.000Z', createdBy: 'salesperson-1' },
  { id: 'act-029', leadId: 'lead-013', type: 'email', subject: 'XC90 comparison sent', note: 'Sent detailed comparison of XC90 trims and safety ratings.', createdAt: '2026-03-11T08:00:00.000Z', createdBy: 'salesperson-1' },

  // lead-014 (2 activities)
  { id: 'act-030', leadId: 'lead-014', type: 'call', subject: 'Fleet proposal call', note: 'Nathan requested a luxury fleet proposal for the hotel concierge program.', createdAt: '2026-01-20T10:00:00.000Z', createdBy: 'salesperson-1' },
  { id: 'act-031', leadId: 'lead-014', type: 'appointment', subject: 'Contract signing', note: 'Signed lease agreement for 5 Escalades. Delivery arranged over 3 months.', createdAt: '2026-02-28T15:00:00.000Z', createdBy: 'salesperson-1' },

  // lead-015 (2 activities)
  { id: 'act-032', leadId: 'lead-015', type: 'email', subject: 'Website enquiry response', note: 'Responded to Olivia\'s online form with Ioniq 5 availability and pricing.', createdAt: '2026-02-12T09:00:00.000Z', createdBy: 'salesperson-2' },
  { id: 'act-033', leadId: 'lead-015', type: 'text', subject: 'Follow-up text', note: 'Sent a follow-up text after no email reply. No response received.', createdAt: '2026-02-19T11:00:00.000Z', createdBy: 'salesperson-2' },

  // lead-016 (2 activities)
  { id: 'act-034', leadId: 'lead-016', type: 'call', subject: 'Initial consultation', note: 'Patrick reached out via referral from David Kim. Discussed premium sedan preferences.', createdAt: '2026-03-15T11:00:00.000Z', createdBy: 'salesperson-1' },
  { id: 'act-035', leadId: 'lead-016', type: 'email', subject: 'E-Class options emailed', note: 'Sent E-Class AMG Line brochure, pricing, and availability details.', createdAt: '2026-03-18T09:00:00.000Z', createdBy: 'salesperson-1' },

  // lead-017 (2 activities)
  { id: 'act-036', leadId: 'lead-017', type: 'walk-in', subject: 'Office visit', note: 'Rachel visited our showroom with her HR manager to discuss EV benefit program options.', createdAt: '2026-03-11T15:00:00.000Z', createdBy: 'salesperson-1' },
  { id: 'act-037', leadId: 'lead-017', type: 'note', subject: 'Program requirements noted', note: 'Tech Startup needs 5 Model Y units with corporate billing. Tax benefits angle.', createdAt: '2026-03-13T10:00:00.000Z', createdBy: 'salesperson-1' },

  // lead-018 (2 activities)
  { id: 'act-038', leadId: 'lead-018', type: 'text', subject: 'Social media DM follow-up', note: 'Reached out to Sam after he liked our Range Rover Sport Instagram post.', createdAt: '2026-03-12T12:00:00.000Z', createdBy: 'salesperson-2' },
  { id: 'act-039', leadId: 'lead-018', type: 'appointment', subject: 'Showroom appointment', note: 'Sam came in for a test drive. Confirmed interest in Dynamic SE trim. Moving to close.', createdAt: '2026-03-18T10:00:00.000Z', createdBy: 'salesperson-2' },

  // lead-019 (2 activities)
  { id: 'act-040', leadId: 'lead-019', type: 'appointment', subject: 'Dealer event demo', note: 'Thomas and his team attended the Frankfurt dealer event eSprinter demonstration.', createdAt: '2026-01-15T10:00:00.000Z', createdBy: 'salesperson-2' },
  { id: 'act-041', leadId: 'lead-019', type: 'note', subject: 'Deal closed notes', note: 'Contract signed for 8 eSprinters. Largest single fleet deal this quarter.', createdAt: '2026-02-20T16:00:00.000Z', createdBy: 'salesperson-2' },

  // lead-020 (2 activities)
  { id: 'act-042', leadId: 'lead-020', type: 'call', subject: 'Availability enquiry', note: 'Uma called to ask if the Wrangler is available in India. Confirmed it is not.', createdAt: '2026-02-18T08:00:00.000Z', createdBy: 'salesperson-2' },
  { id: 'act-043', leadId: 'lead-020', type: 'email', subject: 'Alternative options email', note: 'Emailed Uma with local market alternatives. No interest expressed.', createdAt: '2026-02-21T10:00:00.000Z', createdBy: 'salesperson-2' },

  // lead-021 (1 activity)
  { id: 'act-044', leadId: 'lead-021', type: 'call', subject: 'Forum referral call', note: 'Victor reached out after seeing a recommendation on an automotive forum. Interested in the Silverado.', createdAt: '2026-03-13T21:00:00.000Z', createdBy: 'salesperson-2' },

  // lead-022: ZERO activities (required by test)
]
