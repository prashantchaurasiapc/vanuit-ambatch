// Customer Conversion & Duplicate Prevention Utility
export const convertLeadToCustomerOnInvoiceSent = (invoiceData, leadData = null) => {
  try {
    const customerName = invoiceData?.customer || leadData?.name || 'Customer';
    const customerEmail = leadData?.email || invoiceData?.email || `${customerName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`;
    const customerPhone = leadData?.phone || invoiceData?.phone || '+31 6 12345678';
    const customerAddress = leadData?.address || leadData?.city || invoiceData?.city || 'Amsterdam, NL';
    const productInterest = leadData?.productType || leadData?.category || invoiceData?.type || 'Maatwerk Project';
    const invoiceAmt = invoiceData?.amount || '€ 0';
    const numericAmt = typeof invoiceData?.numericAmount === 'number' 
      ? invoiceData.numericAmount 
      : parseFloat(String(invoiceAmt).replace(/[^\d.-]/g, '')) || 0;

    const savedCustomersStr = localStorage.getItem('app_customers');
    let customersList = savedCustomersStr ? JSON.parse(savedCustomersStr) : [];
    if (!Array.isArray(customersList)) customersList = [];

    // Check duplicate customer by email or exact name
    const existingIndex = customersList.findIndex(c => 
      (c.email && customerEmail && c.email.toLowerCase() === customerEmail.toLowerCase()) ||
      (c.name && customerName && c.name.toLowerCase() === customerName.toLowerCase())
    );

    if (existingIndex >= 0) {
      // Existing customer: update contract spend & active projects without duplicate record
      const existing = customersList[existingIndex];
      const prevNumeric = typeof existing.numericSpend === 'number' 
        ? existing.numericSpend 
        : parseFloat(String(existing.totalSpend || '0').replace(/[^\d.-]/g, '')) || 0;
      
      const updatedNumeric = prevNumeric + numericAmt;
      customersList[existingIndex] = {
        ...existing,
        totalSpend: `€ ${updatedNumeric.toLocaleString('nl-NL')}`,
        numericSpend: updatedNumeric,
        totalProjects: (existing.totalProjects || 1) + 1,
        activeProjects: Math.max((existing.activeProjects || 1), 1),
        status: 'Active',
        lastInvoiceId: invoiceData.id
      };
    } else {
      // Create New Customer record from Lead & Invoice
      const newCustomer = {
        id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        address: customerAddress,
        city: customerAddress,
        productInterest: productInterest,
        totalSpend: invoiceAmt,
        numericSpend: numericAmt,
        totalProjects: 1,
        activeProjects: 1,
        status: 'Active',
        convertedDate: new Date().toISOString().split('T')[0],
        sourceType: leadData ? `Converted from Lead (${leadData.id || 'LEAD'})` : 'Converted on Invoice Sent',
        linkedQuote: leadData?.quoteId || invoiceData.quoteId || '#Q-4001',
        linkedProject: leadData?.projectId || '#P-2001',
        originalLeadId: leadData?.id || null,
        firstInvoiceId: invoiceData.id
      };
      customersList = [newCustomer, ...customersList];
    }

    localStorage.setItem('app_customers', JSON.stringify(customersList));

    // Update Lead status to 'Gewonnen' across all leads storage keys
    ['app_leads_v5', 'app_leads_v2', 'app_leads'].forEach(key => {
      const str = localStorage.getItem(key);
      if (str) {
        try {
          const leads = JSON.parse(str);
          const updatedLeads = leads.map(l => {
            if ((leadData && l.id === leadData.id) || (customerName && l.name?.toLowerCase() === customerName.toLowerCase())) {
              return { ...l, status: 'Gewonnen', convertedToCustomer: true, customerConvertedDate: new Date().toISOString().split('T')[0] };
            }
            return l;
          });
          localStorage.setItem(key, JSON.stringify(updatedLeads));
        } catch (e) {}
      }
    });

    window.dispatchEvent(new Event('app_data_changed'));
    return customersList;
  } catch (e) {
    console.error('Customer conversion error:', e);
  }
};
