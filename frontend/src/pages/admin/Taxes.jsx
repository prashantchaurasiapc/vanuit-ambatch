import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../components/Card';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { Receipt, CheckCircle, Download, FileText, Send, Calendar, Percent, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import BookkeepingHeader from '../../components/admin/BookkeepingHeader';
import api from '../../api/apiClient';

const AVAILABLE_QUARTERS = ['Q4-2026', 'Q3-2026', 'Q2-2026', 'Q1-2026'];

export default function Taxes() {
  const { t, language } = useLanguage();
  const [selectedQuarter, setSelectedQuarter] = useState('Q4-2026');
  const [toastMsg, setToastMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [vatData, setVatData] = useState({
    omzetExcl: 0,
    btwOntvangen: 0,
    btwBetaald: 0,
    nettoBtw: 0,
    status: 'Nog niet ingediend',
    date: ''
  });

  const [filingsList, setFilingsList] = useState([]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Fetch real VAT calculations for selected year & quarter from backend
  const fetchVatData = async (quarterStr) => {
    setLoading(true);
    setError(null);
    try {
      const [q, y] = quarterStr.split('-');
      const year = parseInt(y, 10) || 2026;
      const quarter = q || 'Q4';

      const res = await api.get(`/reports/taxes?year=${year}&quarter=${quarter}`);
      if (res.success && res.data) {
        const boxes = res.data.boxes || {};
        const turnover = Number(boxes.box1a?.turnoverAmount || 0);
        const vatReceived = Number(boxes.box1a?.vatAmount || 0);
        const vatPaid = Number(boxes.box5b?.vatAmount || 0);
        const net = Number(boxes.box5g?.netVatPayable ?? (vatReceived - vatPaid));

        const isFiled = filingsList.some(
          f => f.quarter === `${quarter} ${year}` || f.id === `BTW-${year}-${quarter}`
        );

        setVatData({
          omzetExcl: turnover,
          btwOntvangen: vatReceived,
          btwBetaald: vatPaid,
          nettoBtw: net,
          status: isFiled ? 'Ingediend' : 'Nog niet ingediend',
          date: isFiled ? new Date().toISOString().split('T')[0] : ''
        });
      } else {
        setError(res.error?.message || 'Failed to load VAT report');
      }
    } catch (err) {
      setError(err.message || 'Error fetching VAT data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVatData(selectedQuarter);
  }, [selectedQuarter]);

  const handleDownloadVatPdf = (row) => {
    if (!row) return;
    const filingId = row.id || `BTW-${selectedQuarter.replace('-', '')}`;
    const pdfUrl = `/api/reports/taxes/receipt-pdf?filingNumber=${encodeURIComponent(filingId)}`;

    // Try official backend PDF download
    const pdfWindow = window.open(pdfUrl, '_blank');
    if (pdfWindow) {
      showToast(`BTW Aangifte PDF download gestart: ${filingId}.pdf`);
      return;
    }

    // Fallback: Printable HTML view
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast(`Pop-up geblokkeerd! PDF download: ${filingId}.pdf`);
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${filingId}.pdf</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #4A4A43; background: #fff; max-width: 800px; margin: 0 auto; }
            .header { border-bottom: 3px solid #3E4E36; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-end; }
            .brand { color: #3E4E36; font-size: 26px; font-weight: bold; margin: 0; font-family: 'Georgia', serif; }
            .subtitle { color: #70624F; font-size: 13px; font-weight: 600; margin-top: 4px; }
            .badge { background: #3E4E36; color: #EDE8DF; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-family: monospace; font-weight: bold; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; }
            .card { background: #F8F7F4; padding: 15px; border-radius: 10px; border: 1px solid #D6CFC2; }
            .label { font-size: 10px; text-transform: uppercase; color: #70624F; font-weight: bold; letter-spacing: 0.5px; }
            .value { font-size: 15px; font-weight: bold; margin-top: 4px; color: #3E4E36; }
            .table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
            .table th, .table td { border: 1px solid #D6CFC2; padding: 10px 12px; text-align: left; }
            .table th { background: #EDE8DF; color: #3E4E36; font-weight: bold; text-transform: uppercase; font-size: 11px; }
            .footer { margin-top: 40px; padding-top: 15px; border-top: 1px solid #D6CFC2; font-size: 11px; color: #888; text-align: center; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="brand">VANUIT AMBACHT</h1>
              <div class="subtitle">OFFICIËLE BTW-AANGIFTE SPECIFICATIE (BELASTINGDIENST)</div>
            </div>
            <div>
              <span class="badge">${filingId}</span>
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <h2 style="font-size: 18px; color: #3E4E36; margin: 0 0 5px 0;">Kwartaal Periode: ${row.quarter || selectedQuarter}</h2>
            <p style="margin: 0; color: #666; font-size: 13px;">Status: Ingediend bij Belastingdienst op ${row.date || new Date().toISOString().split('T')[0]}</p>
          </div>

          <div class="grid">
            <div class="card">
              <div class="label">Totale Omzet Excl. BTW</div>
              <div class="value">${row.omzet || `€ ${vatData.omzetExcl.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`}</div>
            </div>
            <div class="card">
              <div class="label">Netto Af te dragen BTW</div>
              <div class="value" style="color: #854d0e;">${row.netto || `€ ${vatData.nettoBtw.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`}</div>
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Omschrijving Rubriek</th>
                <th>Bedrag</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1a. Prestaties belast met 21% BTW (Omzet)</td>
                <td><strong>${row.omzet || `€ ${vatData.omzetExcl.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`}</strong></td>
              </tr>
              <tr>
                <td>1b. Verschuldigde BTW over omzet (21%)</td>
                <td style="color: #3E4E36; font-weight: bold;">${row.btwCollected || `€ ${vatData.btwOntvangen.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`}</td>
              </tr>
              <tr>
                <td>5b. Voorbelasting (Aangetoonde BTW op inkoop/kosten)</td>
                <td style="color: #b91c1c; font-weight: bold;">- ${row.btwPaid || `€ ${vatData.btwBetaald.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`}</td>
              </tr>
              <tr style="background: #F8F7F4; font-weight: bold;">
                <td>Totaal Te Betalen / Ontvangen (Netto BTW)</td>
                <td style="color: #854d0e; font-size: 15px;">${row.netto || `€ ${vatData.nettoBtw.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            Gegenereerd door Vanuit Ambacht Cloud Management • Kenmerk: ${filingId}
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 400);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    showToast(`BTW Aangifte PDF geopend voor download: ${filingId}.pdf`);
  };

  // Submit formal VAT Return to backend POST /api/reports/taxes/file
  const handleFileReturn = async () => {
    if (vatData.status === 'Ingediend') {
      const [q, y] = selectedQuarter.split('-');
      const filingId = `BTW-${y || '2026'}-${q || 'Q4'}`;
      const existing = filingsList.find(f => f.id === filingId);
      handleDownloadVatPdf(existing || {
        id: filingId,
        quarter: `${q} ${y}`,
        omzet: `€ ${vatData.omzetExcl.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`,
        btwCollected: `€ ${vatData.btwOntvangen.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`,
        btwPaid: `€ ${vatData.btwBetaald.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`,
        netto: `€ ${vatData.nettoBtw.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`,
        status: 'Ingediend',
        date: vatData.date || new Date().toISOString().split('T')[0]
      });
      return;
    }

    setSubmitting(true);
    try {
      const [q, y] = selectedQuarter.split('-');
      const year = parseInt(y, 10) || 2026;
      const quarter = q || 'Q4';

      const res = await api.post('/reports/taxes/file', { year, quarter });
      if (res.success) {
        const filing = res.data;
        const todayDate = new Date().toISOString().split('T')[0];

        setVatData(prev => ({
          ...prev,
          status: 'Ingediend',
          date: todayDate
        }));

        const filingNumber = filing?.filingNumber || `BTW-${year}-${quarter}`;
        const newFiling = {
          id: filingNumber,
          quarter: `${quarter} ${year}`,
          omzet: `€ ${Number(filing?.revenueExclVat || vatData.omzetExcl).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`,
          btwCollected: `€ ${Number(filing?.vatCollected21 || vatData.btwOntvangen).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`,
          btwPaid: `€ ${Number(filing?.vatDeductible5b || vatData.btwBetaald).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`,
          netto: `€ ${Number(filing?.netVatPayable || vatData.nettoBtw).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`,
          status: 'Ingediend',
          date: filing?.filedAt ? new Date(filing.filedAt).toISOString().split('T')[0] : todayDate
        };

        setFilingsList(prev => [newFiling, ...prev.filter(f => f.id !== filingNumber)]);
        showToast(res.message || `BTW Aangifte voor ${selectedQuarter} succesvol verzonden naar Belastingdienst!`);

        setTimeout(() => {
          handleDownloadVatPdf(newFiling);
        }, 600);
      } else {
        showToast(`⚠ ${res.error?.message || 'Inzending mislukt'}`);
      }
    } catch (err) {
      showToast(`⚠ Fout bij indienen: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { header: language === 'EN' ? 'Filing ID' : 'Aangifte ID', accessor: 'id' },
    { header: language === 'EN' ? 'Period / Quarter' : 'Periode / Kwartaal', accessor: 'quarter' },
    { header: language === 'EN' ? 'Revenue Excl. VAT' : 'Omzet Excl. BTW', accessor: 'omzet' },
    { header: language === 'EN' ? 'VAT Collected (21%)' : 'BTW Ontvangen (21%)', accessor: 'btwCollected' },
    { header: language === 'EN' ? 'Input VAT (Deductible)' : 'Voorbelasting (BTW Betaald)', accessor: 'btwPaid' },
    { 
      header: language === 'EN' ? 'Net VAT Payable' : 'Netto Afdragen', 
      render: (row) => <span className="font-mono font-bold text-amber-900">{row.netto}</span>
    },
    { 
      header: language === 'EN' ? 'Status' : 'Status', 
      render: (row) => (
        <Badge variant={row.status === 'Ingediend' ? 'success' : 'warning'}>
          {language === 'EN' ? (row.status === 'Ingediend' ? 'Submitted' : 'Pending') : row.status}
        </Badge>
      )
    },
    { 
      header: language === 'EN' ? 'Action' : 'Actie', 
      render: (row) => (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleDownloadVatPdf(row)}
          className="text-xs"
        >
          <Download className="w-3.5 h-3.5 mr-1" /> PDF
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6 relative font-body text-[#4A4A43]">
      {/* BOOKKEEPING HEADER NAVIGATION */}
      <BookkeepingHeader activeTab="taxes" />

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 80 }} className="fixed top-20 right-4 z-[9999] flex items-center gap-2 bg-primary text-cream px-4 py-3 rounded-xl shadow-lg text-xs">
            <CheckCircle className="w-4 h-4 text-green-400" />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-primary">{t('screens.taxes.title')}</h2>
          <p className="text-dark/60 text-sm">{t('screens.taxes.description')}</p>
        </div>
        <Button 
          size="sm" 
          icon={submitting ? Loader2 : Send} 
          onClick={handleFileReturn}
          disabled={submitting}
          className="py-1.5 px-3 text-xs font-bold whitespace-nowrap"
        >
          {submitting 
            ? (language === 'EN' ? 'Submitting...' : 'Indienen...') 
            : vatData.status === 'Ingediend' 
              ? (language === 'EN' ? 'Download Filed VAT Receipt' : 'Download Ingediende Aangifte')
              : (language === 'EN' ? 'Submit VAT Return' : 'BTW Aangifte Indienen')}
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Quarter Selector Tabs — Compact single row on mobile */}
      <div className="grid grid-cols-4 sm:flex gap-1.5 sm:gap-2">
        {AVAILABLE_QUARTERS.map(q => (
          <button
            key={q}
            onClick={() => setSelectedQuarter(q)}
            disabled={loading}
            className={`flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold font-body border transition-all ${
              selectedQuarter === q
                ? 'bg-primary text-cream border-primary shadow-xs'
                : 'bg-[#EDE8DF]/40 text-dark/70 border-[#D6CFC2] hover:bg-[#EDE8DF]'
            }`}
          >
            {loading && selectedQuarter === q ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
            ) : (
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
            )}
            <span className="truncate">{q.split('-')[0]}</span>
            <span className="hidden sm:inline">{q.split('-')[1]}</span>
          </button>
        ))}
      </div>

      {/* Selected Quarter Overview Cards — Compact 2x2 Grid on Mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <Card noPadding className="p-2.5 sm:p-3 relative">
          <p className="text-[10px] text-dark/50 font-bold uppercase tracking-wider truncate">
            {t('screens.taxes.revenueExcl')}
          </p>
          <p className="text-sm sm:text-base font-heading font-bold text-primary mt-1 truncate">
            {loading ? '...' : `€ ${vatData.omzetExcl.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`}
          </p>
        </Card>

        <Card noPadding className="p-2.5 sm:p-3 relative">
          <p className="text-[10px] text-green-800 font-bold uppercase tracking-wider truncate">
            {t('screens.taxes.vatReceived')}
          </p>
          <p className="text-sm sm:text-base font-heading font-bold text-green-700 mt-1 truncate">
            {loading ? '...' : `€ ${vatData.btwOntvangen.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`}
          </p>
        </Card>

        <Card noPadding className="p-2.5 sm:p-3 relative">
          <p className="text-[10px] text-red-700 font-bold uppercase tracking-wider truncate">
            {t('screens.taxes.inputVat')}
          </p>
          <p className="text-sm sm:text-base font-heading font-bold text-red-600 mt-1 truncate">
            {loading ? '...' : `€ ${vatData.btwBetaald.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`}
          </p>
        </Card>

        <Card noPadding className="p-2.5 sm:p-3 bg-[#EDE8DF]/90 border border-[#C4BEB3] relative">
          <p className="text-[10px] text-dark/60 font-bold uppercase tracking-wider truncate">
            {t('screens.taxes.netVat')}
          </p>
          <p className="text-sm sm:text-base font-heading font-bold text-primary mt-1 truncate">
            {loading ? '...' : `€ ${vatData.nettoBtw.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`}
          </p>
        </Card>
      </div>

      {/* Detailed Calculation Summary Box */}
      <Card className="bg-[#EDE8DF]/60 border border-[#D6CFC2]">
        <div className="flex justify-between items-center pb-3 border-b border-[#D6CFC2]">
          <h3 className="font-heading font-bold text-primary text-base flex items-center gap-2">
            <Percent className="w-4 h-4 text-primary" /> {t('screens.taxes.scheme')} {selectedQuarter.replace('-', ' ')}
          </h3>
          <Badge variant={vatData.status === 'Ingediend' ? 'success' : 'warning'}>
            {language === 'EN' ? (vatData.status === 'Ingediend' ? 'Submitted' : 'Not yet submitted') : vatData.status}
          </Badge>
        </div>
        <div className="space-y-2 pt-3 text-xs">
          <div className="flex justify-between py-1 border-b border-[#D6CFC2]/40">
            <span>1a. {t('screens.taxes.supply')}</span>
            <span className="font-semibold font-mono">
              {loading ? '...' : `€ ${vatData.omzetExcl.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#D6CFC2]/40 text-green-800">
            <span>1b. {t('screens.taxes.salesVat')}</span>
            <span className="font-semibold font-mono">
              {loading ? '...' : `€ ${vatData.btwOntvangen.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#D6CFC2]/40 text-red-700">
            <span>5b. {t('screens.taxes.purchaseVat')}</span>
            <span className="font-semibold font-mono">
              {loading ? '...' : `- € ${vatData.btwBetaald.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`}
            </span>
          </div>
          <div className="flex justify-between py-2 font-bold text-sm text-amber-900 pt-2 border-t border-[#D6CFC2]">
            <span>{t('screens.taxes.total')}</span>
            <span className="font-mono">
              {loading ? '...' : `€ ${vatData.nettoBtw.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`}
            </span>
          </div>
        </div>
      </Card>

      {/* Historical Filings Table */}
      <Card>
        <div className="mb-4">
          <h3 className="font-heading font-bold text-primary text-base">{t('screens.taxes.history')}</h3>
          <p className="text-xs text-dark/50">{t('screens.taxes.historyDescription')}</p>
        </div>
        {filingsList.length === 0 ? (
          <div className="py-6 text-center text-xs text-dark/50 bg-[#EDE8DF]/30 rounded-xl border border-[#D6CFC2]/50">
            {language === 'EN' 
              ? 'No historical VAT filings submitted yet for this fiscal year. Submit a return above to register the first filing.'
              : 'Nog geen historische BTW-aangiften ingediend voor dit boekjaar. Dien hierboven een aangifte in om de eerste aangifte te registreren.'}
          </div>
        ) : (
          <Table columns={columns} data={filingsList} />
        )}
      </Card>
    </div>
  );
}
