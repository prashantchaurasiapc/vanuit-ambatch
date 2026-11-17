import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultQuote, calculateInstalments, calculateTotals } from './quoteSchema.js';
import { getDisplayDeliveryTime, getDisplayWoodType } from './translator.js';

describe('Step 3: Comprehensive Quotation & PDF Verification', () => {

  // -------------------------------------------------------------
  // Requirement 1: Dimensions Transfer
  // -------------------------------------------------------------
  it('1. Dimensions: 240 cm entered in Lead transfers cleanly, overriding any previous/default dimensions', () => {
    // Scenario 1: Existing quote previously had 300 × 90 cm. User edits dimensions to 240 cm in Lead.
    const existingStaleQuote = {
      configuration: {
        dimensions: '300 × 90',
        woodType: 'Padouk'
      },
      dimensions: '300 × 90'
    };

    const freshLeadData = {
      name: 'Bjorn Valk',
      dimensions: '240 cm',
      woodType: 'Douglas'
    };

    const quote = createDefaultQuote(freshLeadData, existingStaleQuote);
    assert.equal(quote.configuration.dimensions, '240', 'Configuration dimensions must be 240, not 300 × 90');
    assert.ok(quote.investment.lineItems[0].title.includes('240 cm'), 'Line item title must reflect 240 cm');
  });

  // -------------------------------------------------------------
  // Requirement 2: Wood Type & Specifications Transfer
  // -------------------------------------------------------------
  it('2. Wood Type & Specifications: Lead selections automatically transfer to Quote and PDF', () => {
    // Scenario 2: User selects Douglas and a Big Green Egg Large cutout
    const leadData = {
      name: 'Sophie van Dijk',
      woodType: 'Douglas',
      cutout: 'Big Green Egg Large',
      dimensions: '260 × 80'
    };

    const quote = createDefaultQuote(leadData, null, 'NL');
    assert.equal(quote.configuration.woodType, 'Douglas', 'Wood type must be Douglas');
    assert.equal(quote.configuration.optionsTitle, 'Big Green Egg Large', 'Options title must reflect Big Green Egg');
    assert.ok(quote.investment.lineItems[0].title.includes('Douglas'), 'Line item must mention Douglas');
    assert.ok(quote.configuration.specifications.length > 0, 'Specifications must be populated');
  });

  // -------------------------------------------------------------
  // Requirement 3: Correct Price Transfer (No €0)
  // -------------------------------------------------------------
  it('3. Correct Price: Partner cost + margin correctly transfers to quotation line items (never €0)', () => {
    // Scenario 3: Partner submitted cost €3,800 + 35% margin
    // 3800 + 1330 = €5,130 excl. VAT -> €5,130 * 1.21 = €6,207.30 incl. VAT
    const leadData = {
      name: 'Dennis Jansen',
      partnerCostPrice: 3800,
      marginPercent: 35
    };

    const quote = createDefaultQuote(leadData);
    assert.notEqual(quote.investment.lineItems[0].priceInclVat, 0, 'Price must never be 0');
    assert.equal(quote.investment.lineItems[0].priceInclVat, 6207.3, 'Price must equal €6,207.30');

    const totals = calculateTotals(quote.investment.lineItems);
    assert.equal(totals.totalInclVat, 6207.3, 'Total incl VAT must be €6,207.30');
    assert.notEqual(totals.subtotalExclVat, 0, 'Subtotal excl VAT must be positive');
  });

  // -------------------------------------------------------------
  // Requirement 4: Payment Terms Transfer (Correct Totals)
  // -------------------------------------------------------------
  it('4. Payment Terms: Quotation total amount cleanly calculates instalment cards', () => {
    // Total €6,207.30 with 2 instalments [50%, 50%]
    const total = 6207.3;
    const instalments2 = calculateInstalments(total, 2, [50, 50]);
    assert.equal(instalments2.length, 2);
    assert.equal(instalments2[0].percentage, 50);
    assert.equal(instalments2[0].amount, 3103.65);
    assert.equal(instalments2[1].percentage, 50);
    assert.equal(instalments2[1].amount, 3103.65);
    assert.equal(Math.round((instalments2[0].amount + instalments2[1].amount) * 100) / 100, total);

    // 3 instalments [40%, 40%, 20%]
    const instalments3 = calculateInstalments(total, 3, [40, 40, 20]);
    assert.equal(instalments3.length, 3);
    assert.equal(instalments3[0].amount, 2482.92);
    assert.equal(instalments3[1].amount, 2482.92);
    assert.equal(instalments3[2].amount, 1241.46);
    assert.equal(Math.round((instalments3[0].amount + instalments3[1].amount + instalments3[2].amount) * 100) / 100, total);
  });

  // -------------------------------------------------------------
  // Requirement 5: Delivery Time Transfer (8 Weeks, Not 4 Weeks)
  // -------------------------------------------------------------
  it('5. Delivery Time: Partner delivery time (8 weeks) transfers cleanly and never reverts to 4 weeks', () => {
    // 5a: Formats numbers and strings accurately
    assert.equal(getDisplayDeliveryTime(8, 'NL'), '8 weken');
    assert.equal(getDisplayDeliveryTime(8, 'EN'), '8 weeks');
    assert.equal(getDisplayDeliveryTime('8', 'NL'), '8 weken');
    assert.equal(getDisplayDeliveryTime('8 weken', 'NL'), '8 weken');
    assert.equal(getDisplayDeliveryTime('8 weeks', 'NL'), '8 weken');
    assert.equal(getDisplayDeliveryTime('8 weeks', 'EN'), '8 weeks');

    // 5b: Full quote integration
    const quote8 = createDefaultQuote({
      name: 'Tim Client',
      deliveryTime: '8 weken'
    }, null, 'NL');
    assert.equal(quote8.configuration.deliveryTime, '8 weken', 'Quote configuration must have 8 weken, not 4 weeks');
    assert.notEqual(quote8.configuration.deliveryTime, '4 weken');
    assert.notEqual(quote8.configuration.deliveryTime, '4 weeks');
  });

  // -------------------------------------------------------------
  // Requirement 6: Company Name (Vanuit Ambacht, Not Vanuit Ambacht Meesters BV)
  // -------------------------------------------------------------
  it('6. Company Name: Branding is strictly Vanuit Ambacht and does not contain Meesters BV', () => {
    const quote = createDefaultQuote({ name: 'Client Test' });
    assert.equal(quote.letterAndProcess.signoffName, 'Tim & Bram');
    assert.ok(quote.letterAndProcess.signoffRole.includes('Vanuit Ambacht'));
    assert.ok(!quote.letterAndProcess.signoffRole.includes('Meesters BV'));
    assert.ok(!quote.letterAndProcess.signoffRole.includes('B.V.'));
  });

});
