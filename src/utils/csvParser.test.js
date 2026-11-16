import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  detectDelimiter,
  parseCSVLines,
  normalizeProductType,
  normalizeLeadStatus,
  parseAndNormalizeLeadsCSV,
} from './csvParser.js';

test('detectDelimiter correctly identifies comma, semicolon, and tab', () => {
  assert.equal(detectDelimiter('ID;Naam;Telefoon;Email'), ';');
  assert.equal(detectDelimiter('ID,Name,Phone,Email'), ',');
  assert.equal(detectDelimiter('ID\tName\tPhone\tEmail'), '\t');
});

test('parseCSVLines handles quotes with inner delimiters and escaped quotes', () => {
  const csv = 'John Doe;"Street 1, 1000";"He said ""Hello""";Outdoor Kitchen';
  const rows = parseCSVLines(csv, ';');
  assert.equal(rows.length, 1);
  assert.equal(rows[0][0], 'John Doe');
  assert.equal(rows[0][1], 'Street 1, 1000');
  assert.equal(rows[0][2], 'He said "Hello"');
  assert.equal(rows[0][3], 'Outdoor Kitchen');
});

test('normalizeProductType correctly maps Dutch & English variants', () => {
  assert.equal(normalizeProductType('Buitenkeuken'), 'outdoor_kitchen');
  assert.equal(normalizeProductType('Luxe Buitenverblijf'), 'garden_room');
  assert.equal(normalizeProductType('Overkapping met lamellen'), 'canopy');
  assert.equal(normalizeProductType('Kliko ombouw'), 'bin_storage');
  assert.equal(normalizeProductType('Tuinkamer'), 'garden_room');
  assert.equal(normalizeProductType(null), 'outdoor_kitchen');
});

test('normalizeLeadStatus correctly maps Dutch & English status strings', () => {
  assert.equal(normalizeLeadStatus('Nieuw'), 'new');
  assert.equal(normalizeLeadStatus('In gesprek'), 'in_conversation');
  assert.equal(normalizeLeadStatus('Prijsaanvraag'), 'price_requested');
  assert.equal(normalizeLeadStatus('Offerte verstuurd'), 'quote_sent');
  assert.equal(normalizeLeadStatus('Gewonnen'), 'won');
  assert.equal(normalizeLeadStatus('Verloren'), 'lost');
  assert.equal(normalizeLeadStatus('Unknown'), 'new');
});

test('parseAndNormalizeLeadsCSV parses exported CSV format cleanly', () => {
  const exportedCSV = `\uFEFFID;Naam;Telefoon;Email;Product Type;Gewenste Maat;Bron;Status;Laatste Contact;Verloren Reden
101;Tim Tester;+31612345678;tim@example.nl;buitenkeuken;300x100;Direct;Nieuw;;
102;Bram Klant;-;invalid-email;buitenverblijf;400x300;Website;In gesprek;;`;

  const result = parseAndNormalizeLeadsCSV(exportedCSV);
  assert.equal(result.leads.length, 2);
  assert.equal(result.leads[0].name, 'Tim Tester');
  assert.equal(result.leads[0].phone, '+31612345678');
  assert.equal(result.leads[0].email, 'tim@example.nl');
  assert.equal(result.leads[0].productType, 'outdoor_kitchen');
  assert.equal(result.leads[0].status, 'new');

  // Test row 2: dash phone converted to null, invalid email converted to null
  assert.equal(result.leads[1].name, 'Bram Klant');
  assert.equal(result.leads[1].phone, null);
  assert.equal(result.leads[1].email, null);
  assert.equal(result.leads[1].productType, 'garden_room');
  assert.equal(result.leads[1].status, 'in_conversation');
});

test('parseAndNormalizeLeadsCSV parses comma-separated CSV with quotes', () => {
  const commaCSV = `Name,Email,Phone,Product,Size
"Dominique van Dijk",dominique@ambacht.nl,"+31 6 98765432",Garden Building,"500 x 350 cm"
"Jan Modaal",jan@test.nl,,Canopy,`;

  const result = parseAndNormalizeLeadsCSV(commaCSV);
  assert.equal(result.leads.length, 2);
  assert.equal(result.leads[0].name, 'Dominique van Dijk');
  assert.equal(result.leads[0].email, 'dominique@ambacht.nl');
  assert.equal(result.leads[0].phone, '+31 6 98765432');
  assert.equal(result.leads[0].productType, 'garden_room');
  assert.equal(result.leads[0].dimensionsInquiry, '500 x 350 cm');

  assert.equal(result.leads[1].name, 'Jan Modaal');
  assert.equal(result.leads[1].email, 'jan@test.nl');
  assert.equal(result.leads[1].phone, null);
  assert.equal(result.leads[1].productType, 'canopy');
});
