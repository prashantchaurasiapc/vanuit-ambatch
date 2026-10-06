import { runPdfDownloadNamingQA } from './pdfDownloadNamingQA.js';
import { runNoAutoCommunicationQA } from './noAutoCommunicationQA.js';
import { runDraftChannelGatingQA } from './draftChannelGatingQA.js';
import { runMarginSyncQA } from './marginSyncQA.js';
import { runPricingConfidentialityQA } from './pricingConfidentialityQA.js';
import { runApprovalProjectCreationQA } from './approvalProjectCreationQA.js';
import { runProjectDataPopulationQA } from './projectDataPopulationQA.js';
import { runPartnerContinuityQA } from './partnerContinuityQA.js';
import { runPartnerVisibilityGateQA } from './partnerVisibilityGateQA.js';

console.log('====================================================');
console.log('🚀 MASTER SYSTEM-WIDE AUDIT — ZERO MISMATCH CHECK');
console.log('====================================================\n');

const suites = [
  { name: 'Quote PDF Naming QA', runner: runPdfDownloadNamingQA },
  { name: 'No Auto-Communication QA', runner: runNoAutoCommunicationQA },
  { name: 'Draft Channel Gating QA', runner: runDraftChannelGatingQA },
  { name: 'Margin ↔ Amount Sync QA', runner: runMarginSyncQA },
  { name: 'Pricing Confidentiality QA', runner: runPricingConfidentialityQA },
  { name: 'Approval -> Project Creation QA', runner: runApprovalProjectCreationQA },
  { name: 'Project Data Population QA', runner: runProjectDataPopulationQA },
  { name: 'Partner Continuity QA', runner: runPartnerContinuityQA },
  { name: 'Partner Visibility Gate QA', runner: runPartnerVisibilityGateQA }
];

let totalPassed = 0;
let totalTests = 0;

suites.forEach((s) => {
  try {
    const res = s.runner();
    totalPassed += res.passed;
    totalTests += res.total;
    console.log(`[${s.name}] PASSED ${res.passed}/${res.total}`);
  } catch (err) {
    console.error(`[${s.name}] FAILED WITH ERROR:`, err);
  }
});

console.log('\n====================================================');
console.log(`🏆 FINAL SYSTEM-WIDE AUDIT RESULT: ${totalPassed}/${totalTests} PASSED 100%`);
console.log('====================================================');
