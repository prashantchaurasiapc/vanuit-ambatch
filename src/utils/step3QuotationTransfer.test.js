import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultQuote, calculateInstalments, calculateTotals } from './quoteSchema.js';
import { getDisplayDeliveryTime, getDisplayWoodType } from './translator.js';

describe('Step 3: Quotation & PDF Data Transfer Verification', () => {

  it('1. Dimensions transfer correctly and do not revert to defaults', () => {
    // Test 1a: changing dimensions to 240 cm
    const quote1 = createDefaultQuote({
      name: 'Test Customer',
      dimensions: '240 cm',
      woodType: 'Douglas'
    });
    assert.equal(quote1.configuration.dimensions, '240');
    assert.ok(quote1.investment.lineItems[0].title.includes('240 cm'));

    // Test 1b: 300 × 90 cm
    const quote2 = createDefaultQuote({
      name: 'Test Customer',
      dimensions: '300 × 90',
      woodType: 'Thermo Fraké'
    });
    assert.equal(quote2.configuration.dimensions, '300 × 90');
    assert.ok(quote2.investment.lineItems[0].title.includes('300 × 90 cm'));

    // Test 1c: Object format { lengthCm: 280, widthCm: 85 }
    const quote3 = createDefaultQuote({
      name: 'Test Customer',
      dimensions: { lengthCm: 280, widthCm: 85 }
    });
    assert.equal(quote3.configuration.dimensions, '280 × 85');
    assert.ok(quote3.investment.lineItems[0].title.includes('280 × 85 cm'));
  });

  it('2. Selected wood types transfer correctly and do not revert to Thermo Fraké', () => {
    // Test 2a: Douglas
    const quoteDouglas = createDefaultQuote({
      name: 'Test Customer',
      woodType: 'Douglas'
    });
    assert.equal(quoteDouglas.configuration.woodType, 'Douglas');
    assert.ok(quoteDouglas.investment.lineItems[0].title.includes('Douglas'));

    // Test 2b: Eikenhout / Oak
    const quoteOak = createDefaultQuote({
      name: 'Test Customer',
      woodType: 'Eikenhout'
    }, null, 'NL');
    assert.equal(quoteOak.configuration.woodType, 'Eikenhout');
    assert.ok(quoteOak.investment.lineItems[0].title.includes('Eikenhout'));

    // Test 2c: Padouk
    const quotePadouk = createDefaultQuote({
      name: 'Test Customer',
      woodType: 'Padouk'
    });
    assert.equal(quotePadouk.configuration.woodType, 'Padouk');
    assert.ok(quotePadouk.investment.lineItems[0].title.includes('Padouk'));
  });

  it('3. Total quotation amount transfers to line items and payment terms (not €0)', () => {
    // Test 3a: Explicit target price €4,500
    const quoteWithPrice = createDefaultQuote({
      name: 'Test Customer',
    }, {
      calculatedPrice: 4500,
      totalInclVat: 4500
    });
    assert.equal(quoteWithPrice.investment.lineItems[0].priceInclVat, 4500);

    const totals = calculateTotals(quoteWithPrice.investment.lineItems);
    assert.equal(totals.totalInclVat, 4500);

    const instalments = calculateInstalments(totals.totalInclVat, 2, [50, 50]);
    assert.equal(instalments.length, 2);
    assert.equal(instalments[0].amount, 2250);
    assert.equal(instalments[1].amount, 2250);

    // Test 3b: Calculated from partner cost + margin (e.g. €3,000 cost + 35% margin)
    // 3000 + 1050 = 4050 excl. VAT -> 4050 * 1.21 = 4900.50 incl. VAT
    const quoteFromCost = createDefaultQuote({
      name: 'Test Customer',
      partnerCostPrice: 3000,
      marginPercent: 35
    });
    assert.ok(quoteFromCost.investment.lineItems[0].priceInclVat > 4000);
    const costTotals = calculateTotals(quoteFromCost.investment.lineItems);
    assert.ok(costTotals.totalInclVat > 4000);
    const costInstalments = calculateInstalments(costTotals.totalInclVat, 2, [50, 50]);
    assert.ok(costInstalments[0].amount > 2000);
    assert.ok(costInstalments[1].amount > 2000);
  });

  it('4. Partner delivery time transfers correctly (e.g. 8 weeks not 4 weeks)', () => {
    // Test 4a: integer 8
    assert.equal(getDisplayDeliveryTime(8, 'NL'), '8 weken');
    assert.equal(getDisplayDeliveryTime(8, 'EN'), '8 weeks');

    // Test 4b: string "8"
    assert.equal(getDisplayDeliveryTime('8', 'NL'), '8 weken');
    assert.equal(getDisplayDeliveryTime('8', 'EN'), '8 weeks');

    // Test 4c: string "8 weeks" / "8 weken"
    assert.equal(getDisplayDeliveryTime('8 weeks', 'NL'), '8 weken');
    assert.equal(getDisplayDeliveryTime('8 weken', 'EN'), '8 weeks');

    // Test 4d: quote configuration receives 8 weeks properly
    const quote8 = createDefaultQuote({
      name: 'Test Customer',
      deliveryTime: '8 weken'
    }, null, 'NL');
    assert.equal(quote8.configuration.deliveryTime, '8 weken');

    const quote8RawNum = createDefaultQuote({
      name: 'Test Customer',
      deliveryTime: 8
    }, null, 'NL');
    assert.equal(quote8RawNum.configuration.deliveryTime, '8 weken');
  });

  it('5. Signoff and company branding is Vanuit Ambacht', () => {
    const quote = createDefaultQuote({ name: 'Test Customer' });
    assert.equal(quote.letterAndProcess.signoffName, 'Tim & Bram');
    assert.ok(quote.letterAndProcess.signoffRole.includes('Vanuit Ambacht'));
  });

});
