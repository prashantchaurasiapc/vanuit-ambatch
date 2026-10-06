// Customer Conversion & Duplicate Prevention Utility
import api from '../api/apiClient';

export const convertLeadToCustomerOnInvoiceSent = async (invoiceData, leadData = null) => {
  try {
    const customerName = typeof invoiceData === 'string' ? invoiceData : (invoiceData?.customer || leadData?.name || 'Customer');
    const invoiceId = invoiceData?.id || (typeof invoiceData === 'object' ? invoiceData?.invoiceNumber : null);
    const customerEmail = leadData?.email || invoiceData?.email || `${customerName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`;
    const customerPhone = leadData?.phone || invoiceData?.phone || '+31 6 12345678';
    const customerAddress = leadData?.address || leadData?.city || invoiceData?.city || 'Amsterdam, NL';
    const productInterest = leadData?.productType || leadData?.category || invoiceData?.type || 'Maatwerk Project';
    const invoiceAmt = invoiceData?.amount || '€ 0';
    const numericAmt = typeof invoiceData?.numericAmount === 'number' 
      ? invoiceData.numericAmount 
      : (typeof invoiceData === 'number' ? invoiceData : parseFloat(String(invoiceAmt).replace(/[^\d.-]/g, '')) || 0);

    // Call API to create/update customer
    api.post('/customers', {
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      address: customerAddress,
      city: customerAddress,
      productInterest: productInterest,
      totalSpend: numericAmt,
      status: 'active'
    }).catch(() => {});

    // Update Lead status if leadId is present
    const leadId = leadData?.id || (leadData ? leadData.leadId : null);
    if (leadId) {
      api.patch(`/leads/${leadId}`, {
        status: 'Gewonnen'
      }).catch(() => {});
    }

    window.dispatchEvent(new Event('app_data_changed'));
  } catch (e) {
    console.error('Customer conversion error:', e);
  }
};
