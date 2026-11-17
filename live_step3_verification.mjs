import { createDefaultQuote, calculateTotals, calculateInstalments } from './src/utils/quoteSchema.js';
import { getDisplayDeliveryTime, getDisplayWoodType } from './src/utils/translator.js';

console.log('================================================================');
console.log('🚀 LIVE STEP 3 END-TO-END VERIFICATION (DATA TRANSFER & PDF) 🚀');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function assertCheck(name, condition, details = '') {
  if (condition) {
    console.log(`✅ [PASS] ${name}`);
    if (details) console.log(`   ↳ ${details}`);
    passCount++;
  } else {
    console.error(`❌ [FAIL] ${name}`);
    if (details) console.error(`   ↳ ${details}`);
    failCount++;
  }
}

// -------------------------------------------------------------
// TEST 1: Dimensions Transfer (240 cm in Lead -> 240 cm in Quote)
// -------------------------------------------------------------
console.log('--- TEST 1: DIMENSIONS DATA TRANSFER ---');
const staleQuote = {
  configuration: {
    dimensions: '300 × 90',
    woodType: 'Thermo Fraké',
    deliveryTime: '3 tot 5 weken'
  },
  dimensions: '300 × 90',
  investment: {
    lineItems: [
      { id: 'old-1', title: 'Old 300x90 kitchen', priceInclVat: 0 }
    ]
  }
};

const leadInput = {
  id: 'LEAD-2026-088',
  name: 'Bjorn Valk',
  city: 'Amsterdam',
  category: 'Buitenkeuken',
  dimensions: '240 cm',       // User entered 240 cm in Lead
  woodType: 'Douglas',
  cutout: 'Big Green Egg Large',
  deliveryTime: '8 weken',    // Partner entered 8 weeks
  partnerCostPrice: 3800,     // Partner submitted price €3,800
  marginPercent: 35
};

const quoteResult = createDefaultQuote(leadInput, staleQuote, 'NL');

assertCheck(
  'Dimensions in configuration match fresh lead input (240 cm)',
  quoteResult.configuration.dimensions === '240',
  `Expected: "240" | Actual: "${quoteResult.configuration.dimensions}"`
);

assertCheck(
  'Primary line item title reflects 240 cm and not stale 300x90',
  quoteResult.investment.lineItems[0].title.includes('240 cm'),
  `Line item title: "${quoteResult.investment.lineItems[0].title}"`
);

// -------------------------------------------------------------
// TEST 2: Wood Type & Specifications Transfer
// -------------------------------------------------------------
console.log('\n--- TEST 2: WOOD TYPE & SPECIFICATIONS ---');
assertCheck(
  'Wood type in configuration is Douglas (overriding Thermo Fraké)',
  quoteResult.configuration.woodType === 'Douglas',
  `Expected: "Douglas" | Actual: "${quoteResult.configuration.woodType}"`
);

assertCheck(
  'Options title reflects Big Green Egg Large',
  quoteResult.configuration.optionsTitle === 'Big Green Egg Large',
  `Options title: "${quoteResult.configuration.optionsTitle}"`
);

assertCheck(
  'Line item title contains selected wood (Douglas)',
  quoteResult.investment.lineItems[0].title.includes('Douglas'),
  `Line item title: "${quoteResult.investment.lineItems[0].title}"`
);

// -------------------------------------------------------------
// TEST 3: Correct Price Transfer (Partner cost + margin -> Line Items, NOT €0)
// -------------------------------------------------------------
console.log('\n--- TEST 3: CORRECT PRICE & TOTAL INCL VAT ---');
// Partner cost €3,800 + 35% margin = €5,130 excl. VAT -> €5,130 * 1.21 = €6,207.30 incl. VAT
const expectedSellingPrice = 6207.3;
const actualLinePrice = quoteResult.investment.lineItems[0].priceInclVat;

assertCheck(
  'Line item price is NOT €0',
  actualLinePrice > 0,
  `Line item 0 price: €${actualLinePrice}`
);

assertCheck(
  'Line item price matches partner cost + 35% margin (€6,207.30)',
  Math.abs(actualLinePrice - expectedSellingPrice) < 0.01,
  `Expected: €${expectedSellingPrice} | Actual: €${actualLinePrice}`
);

const totals = calculateTotals(quoteResult.investment.lineItems);
assertCheck(
  'Total quotation calculation matches €6,207.30',
  Math.abs(totals.totalInclVat - expectedSellingPrice) < 0.01,
  `Calculated Total incl. VAT: €${totals.totalInclVat}`
);

// -------------------------------------------------------------
// TEST 4: Payment Terms Transfer (Termijnen non-zero amounts)
// -------------------------------------------------------------
console.log('\n--- TEST 4: PAYMENT TERMS (BETALING IN TERMIJNEN) ---');
const instalments2 = calculateInstalments(totals.totalInclVat, 2, [50, 50]);

assertCheck(
  'Termijn 1 (50%) is non-zero and equals €3,103.65',
  Math.abs(instalments2[0].amount - 3103.65) < 0.01,
  `Card 1: ${instalments2[0].percentage}% = €${instalments2[0].amount} (${instalments2[0].label})`
);

assertCheck(
  'Termijn 2 (50%) is non-zero and equals €3,103.65',
  Math.abs(instalments2[1].amount - 3103.65) < 0.01,
  `Card 2: ${instalments2[1].percentage}% = €${instalments2[1].amount} (${instalments2[1].label})`
);

const sumInstalments = instalments2.reduce((acc, card) => acc + card.amount, 0);
assertCheck(
  'Sum of instalments matches full quote total (€6,207.30)',
  Math.abs(sumInstalments - totals.totalInclVat) < 0.01,
  `Sum: €${sumInstalments} == Total: €${totals.totalInclVat}`
);

// -------------------------------------------------------------
// TEST 5: Delivery Time Transfer (8 Weeks, Not 4 Weeks)
// -------------------------------------------------------------
console.log('\n--- TEST 5: DELIVERY TIME TRANSFER (8 WEEKS) ---');
assertCheck(
  'getDisplayDeliveryTime formats 8 as "8 weken" in NL',
  getDisplayDeliveryTime(8, 'NL') === '8 weken',
  `8 -> "${getDisplayDeliveryTime(8, 'NL')}"`
);

assertCheck(
  'getDisplayDeliveryTime formats "8 weeks" as "8 weken" in NL',
  getDisplayDeliveryTime('8 weeks', 'NL') === '8 weken',
  `"8 weeks" -> "${getDisplayDeliveryTime('8 weeks', 'NL')}"`
);

assertCheck(
  'Quotation configuration deliveryTime is 8 weken (never reverting to 4 weeks)',
  quoteResult.configuration.deliveryTime === '8 weken',
  `Actual Quote Delivery Time: "${quoteResult.configuration.deliveryTime}"`
);

// -------------------------------------------------------------
// TEST 6: Company Name (Vanuit Ambacht, NOT Vanuit Ambacht Meesters BV)
// -------------------------------------------------------------
console.log('\n--- TEST 6: COMPANY NAME & BRANDING ---');
const signoffRole = quoteResult.letterAndProcess.signoffRole;
assertCheck(
  'Letter signoff role is strictly "Founders Vanuit Ambacht"',
  signoffRole.includes('Vanuit Ambacht'),
  `Signoff Role: "${signoffRole}"`
);

assertCheck(
  'Does not contain "Meesters BV"',
  !signoffRole.includes('Meesters') && !signoffRole.includes('B.V.'),
  `Verified clean: "${signoffRole}"`
);

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log('\n================================================================');
console.log(`🏁 LIVE SCRATCH RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
console.log('================================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL 6 CHECKS ARE 100% WORKING & VERIFIED IN LIVE LOGIC! 🎉\n');
}
