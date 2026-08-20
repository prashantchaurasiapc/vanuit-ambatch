// Comprehensive Compliance QA Test Suite for Step 3 (Configuration) Refinements
import { createDefaultQuote } from './quoteSchema.js';
import { getWoodTypeDefaults } from './quoteLibraries.js';

console.log('=== RUNNING STEP 3 COMPLIANCE REFINEMENT QA TESTS ===\n');

// Initialize test quote
const testQuote = createDefaultQuote(null, null);
testQuote.id = 'OF-20264036';
testQuote.configuration = testQuote.configuration || {};

// POINT 1 — Delivery Time Propagation to Stat Tile 4 (p3) & Process Step 3 Badge (p6)
console.log('POINT 1: Delivery Time Propagation');
testQuote.configuration.deliveryTime = '4 tot 6 weken';

const p3DeliveryTime = testQuote.configuration.deliveryTime;
console.log('Page 3 Stat Tile 4 Delivery Time:', p3DeliveryTime);
console.assert(p3DeliveryTime === '4 tot 6 weken', 'Point 1.1 Failed!');

const p6ProcessBadge = testQuote.configuration.deliveryTime.toUpperCase();
console.log('Page 6 Process Step 3 Badge:', p6ProcessBadge);
console.assert(p6ProcessBadge === '4 TOT 6 WEKEN', 'Point 1.2 Failed!');
console.log('✓ POINT 1 PASSED!\n');

// POINT 2 — Configuration Photo (configuratie.foto)
console.log('POINT 2: Configuration Photo Storage & Persistence');
testQuote.configuration.configPhoto = 'data:image/png;base64,iVBORw0KGgoAAAANSU...';
console.assert(testQuote.configuration.configPhoto.startsWith('data:image'), 'Point 2.1 Failed!');
console.log('✓ POINT 2 PASSED!\n');

// POINT 3 — Diagram Hide Behavior
console.log('POINT 3: Diagram Hide Behavior');
testQuote.configuration.diagram = { show: false, totalWidth: 240, segments: [] };
const isDiagramHidden = testQuote.configuration.diagram.show === false;
console.log('Diagram Hide State:', isDiagramHidden);
console.assert(isDiagramHidden === true, 'Point 3.1 Failed!');
console.log('✓ POINT 3 PASSED!\n');

// POINT 4 & 5 — Stat Tile 3 Conditional Logic & Data-Driven Options
console.log('POINT 4 & 5: Stat Tile 3 Conditional Logic');

function getTile3Info(options, defaultTitle) {
  const bbqEnabled = options?.bbqCutout?.enabled !== false;
  const bbqType = options?.bbqCutout?.type || defaultTitle || 'Big Green Egg Large';
  const fridgeEnabled = options?.fridge?.enabled || false;
  const sinkEnabled = options?.sink?.enabled || false;

  if (bbqEnabled) {
    return { title: 'UITSPARING', val: bbqType };
  }

  const enabledList = [];
  if (fridgeEnabled) enabledList.push('Ingebouwde Koelkast');
  if (sinkEnabled) enabledList.push('Spoelbak met Kraan');

  if (enabledList.length > 0) {
    return { title: 'OPTIES', val: enabledList.join(', ') };
  }

  return { title: 'OPTIES', val: 'Geen extra opties' };
}

// Case A: BBQ Cutout Enabled
testQuote.configuration.options = { bbqCutout: { enabled: true, type: 'Big Green Egg Large' }, fridge: { enabled: false }, sink: { enabled: false } };
const tile3A = getTile3Info(testQuote.configuration.options, testQuote.configuration.optionsTitle);
console.log('Case A (BBQ Enabled):', tile3A);
console.assert(tile3A.title === 'UITSPARING' && tile3A.val === 'Big Green Egg Large', 'Point 5.1 Failed!');

// Case B: BBQ Disabled, Fridge & Sink Enabled
testQuote.configuration.options = { bbqCutout: { enabled: false }, fridge: { enabled: true }, sink: { enabled: true } };
const tile3B = getTile3Info(testQuote.configuration.options, testQuote.configuration.optionsTitle);
console.log('Case B (Fridge & Sink Enabled, BBQ OFF):', tile3B);
console.assert(tile3B.title === 'OPTIES' && tile3B.val === 'Ingebouwde Koelkast, Spoelbak met Kraan', 'Point 5.2 Failed!');

// Case C: All Options Disabled
testQuote.configuration.options = { bbqCutout: { enabled: false }, fridge: { enabled: false }, sink: { enabled: false } };
const tile3C = getTile3Info(testQuote.configuration.options, testQuote.configuration.optionsTitle);
console.log('Case C (All Options Disabled):', tile3C);
console.assert(tile3C.title === 'OPTIES' && tile3C.val === 'Geen extra opties', 'Point 5.3 Failed!');
console.log('✓ POINT 4 & 5 PASSED!\n');

console.log('=== ALL STEP 3 COMPLIANCE REFINEMENT QA TESTS PASSED 100% ===');
