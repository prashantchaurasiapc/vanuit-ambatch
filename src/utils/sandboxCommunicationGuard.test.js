import assert from 'node:assert';
import {
  guardEmailDispatch,
  guardCalendarAction,
  ALLOWED_INTERNAL_EMAILS,
  ALLOWED_INTERNAL_DOMAINS
} from './sandboxCommunicationGuard.js';

console.log('--- STARTING GMAIL & GOOGLE CALENDAR SECURITY GUARD TESTS ---');

// Test 1: Real customer email is strictly BLOCKED from receiving email
const customerEmail = 'bjorn.valk@gmail.com';
const blockResult = guardEmailDispatch(customerEmail, 'Uw Offerte is gereed', 'Beste Bjorn, hierbij de offerte.');
console.log('1. Real customer dispatch test:', blockResult);

assert.strictEqual(blockResult.allowed, false, 'Dispatch to real customer must be blocked');
assert.strictEqual(blockResult.quarantined, true, 'Real customer email must be quarantined');
assert.strictEqual(blockResult.originalRecipient, 'bjorn.valk@gmail.com');
assert.strictEqual(blockResult.redirectedTo, 'info@vanuitambacht.nl');
console.log('✓ TEST 1 PASSED: Real customer email was 100% blocked and quarantined internally.');

// Test 2: Internal test address is permitted for developer / client testing
const internalEmail = 'info@vanuitambacht.nl';
const allowResult = guardEmailDispatch(internalEmail, 'Interne test', 'Test inhoud');
console.log('2. Internal test dispatch test:', allowResult);

assert.strictEqual(allowResult.allowed, true, 'Internal test address must be allowed');
assert.strictEqual(allowResult.quarantined, false, 'Internal test address must not be quarantined');
assert.strictEqual(allowResult.recipient, 'info@vanuitambacht.nl');
console.log('✓ TEST 2 PASSED: Internal test address info@vanuitambacht.nl is safely permitted.');

// Test 3: Another internal partner/admin address is permitted
const timEmail = 'tim@vanuitambacht.nl';
const timResult = guardEmailDispatch(timEmail, 'Test Tim', 'Test');
assert.strictEqual(timResult.allowed, true);
console.log('✓ TEST 3 PASSED: tim@vanuitambacht.nl internal test dispatch permitted.');

// Test 4: Real customer Google Calendar invite is blocked
const calResult = guardCalendarAction({
  customerEmail: 'klant.echt@hotmail.com',
  title: 'Inmeten Buitenkeuken',
  date: '2026-12-01'
});
console.log('4. Calendar action test:', calResult);

assert.strictEqual(calResult.remotePushAllowed, false, 'Remote calendar push to customer must be blocked');
assert.strictEqual(calResult.customerInvited, false, 'Customer must not be invited to Google Calendar');
assert.strictEqual(calResult.mode, 'CLIENT_ICS_DOWNLOAD_ONLY');
console.log('✓ TEST 4 PASSED: Customer calendar push blocked, restricted to local .ics download only.');

console.log('\n======================================================');
console.log('ALL 4 GMAIL & CALENDAR SECURITY TESTS PASSED (100%)');
console.log('======================================================\n');
