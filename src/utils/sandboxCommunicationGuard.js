/**
 * Vanuit Ambacht — Test Environment Communication & Calendar Sandbox Guard
 * 
 * Client Requirement (Item 1.8):
 * Confirm that in the test environment Gmail and Google Calendar (both connected to info@vanuitambacht.nl)
 * cannot send anything to real customers. Testing is strictly restricted to internal test addresses.
 */

export const ALLOWED_INTERNAL_DOMAINS = ['vanuitambacht.nl'];

export const ALLOWED_INTERNAL_EMAILS = [
  'info@vanuitambacht.nl',
  'tim@vanuitambacht.nl',
  'bram@vanuitambacht.nl',
  'admin@vanuitambacht.nl',
];

export const SANDBOX_COMMUNICATION_LOG = [];

/**
 * Validates and safely routes an email dispatch in the test environment.
 * Any real customer or external email is strictly blocked and quarantined/redirected.
 * 
 * @param {string} recipientEmail - Target recipient email address
 * @param {string} subject - Email subject
 * @param {string} body - Email body content
 * @returns {Object} Guard dispatch result
 */
export function guardEmailDispatch(recipientEmail, subject = '', body = '') {
  const normalized = String(recipientEmail || '').trim().toLowerCase();
  const domain = normalized.split('@')[1] || '';

  const isInternal = ALLOWED_INTERNAL_DOMAINS.includes(domain) || ALLOWED_INTERNAL_EMAILS.includes(normalized);

  const timestamp = new Date().toISOString();

  if (isInternal) {
    const entry = {
      timestamp,
      targetEmail: normalized,
      isInternal: true,
      status: 'ALLOWED_INTERNAL_TEST',
      actualRecipient: normalized,
      subject,
      note: 'Internal test recipient permitted.'
    };
    SANDBOX_COMMUNICATION_LOG.push(entry);
    return {
      allowed: true,
      quarantined: false,
      recipient: normalized,
      log: entry
    };
  }

  // Real customer / external email detected -> STRICTLY QUARANTINED & BLOCKED
  const entry = {
    timestamp,
    targetEmail: normalized,
    isInternal: false,
    status: 'BLOCKED_CUSTOMER_SANDBOX_QUARANTINE',
    actualRecipient: 'info@vanuitambacht.nl', // Safely redirected to internal test inbox
    subject: `[TEST SANDBOX - BLOCKED EXTERNAL]: ${subject}`,
    originalBody: body,
    note: `Strict Security Policy: Dispatch to real customer '${normalized}' was blocked. Redirected to internal test mailbox only.`
  };
  SANDBOX_COMMUNICATION_LOG.push(entry);

  console.warn(`[SANDBOX GUARD] External customer email dispatch to '${normalized}' was BLOCKED and safely quarantined to 'info@vanuitambacht.nl'.`);

  return {
    allowed: false,
    quarantined: true,
    originalRecipient: normalized,
    redirectedTo: 'info@vanuitambacht.nl',
    log: entry
  };
}

/**
 * Validates calendar event actions in the test environment.
 * Remote push to real customer calendars is strictly blocked.
 * 
 * @param {Object} eventDetails - Calendar event specification
 * @returns {Object} Calendar action status
 */
export function guardCalendarAction(eventDetails = {}) {
  const customerEmail = String(eventDetails.customerEmail || eventDetails.attendee || '').trim().toLowerCase();
  const domain = customerEmail.split('@')[1] || '';
  const isInternal = ALLOWED_INTERNAL_DOMAINS.includes(domain);

  if (!isInternal && customerEmail) {
    console.warn(`[SANDBOX GUARD] Remote calendar push to customer '${customerEmail}' blocked. Reverted to client-side .ics download only.`);
    return {
      remotePushAllowed: false,
      mode: 'CLIENT_ICS_DOWNLOAD_ONLY',
      customerInvited: false,
      note: 'Zero customer calendar interaction in test environment.'
    };
  }

  return {
    remotePushAllowed: false,
    mode: 'INTERNAL_TEST_ONLY',
    customerInvited: false
  };
}
