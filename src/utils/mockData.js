/**
 * mockData.js — Empty production stub
 * All real data is stored in and retrieved from the PostgreSQL database via API.
 */

export const mockPartners = [];
export const mockLeads = [];
export const mockQuotes = [];
export const mockProjects = [];
export const mockInvoices = [];
export const mockTransactions = [];

export const mockFunnelData = {
  leads: { count: 0, label: "Leads this month" },
  inGesprek: { count: 0, label: "In discussion", percentage: 0 },
  offerte: { count: 0, label: "Quote Sent", percentage: 0 },
  gewonnen: { count: 0, label: "Won (Project)", percentage: 0 }
};

export const mockFinancials = {
  monthlyRevenue: '€ 0',
  outstandingInvoices: '€ 0',
  expectedRevenue: '€ 0'
};
