import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { TrendingUp, DollarSign, Clock, CheckCircle, Download } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../api/apiClient';

export default function Finance() {
  const { t, language, tStatus } = useLanguage();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    thisMonth: 0,
    outstanding: 0,
    paidYtd: 0,
    collectionRatePct: 0,
    pendingInvoicesCount: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [invRes, statsRes] = await Promise.allSettled([
          api.get('/invoices'),
          api.get('/reports/finance-stats')
        ]);

        if (invRes.status === 'fulfilled' && invRes.value) {
          const invData = invRes.value.data?.invoices || invRes.value.data || [];
          setInvoices(Array.isArray(invData) ? invData : []);
        } else {
          setInvoices([]);
        }

        if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
          setStats(statsRes.value.data);
        }
      } catch (e) {
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExportCSV = async () => {
    let currentInvoices = invoices;
    try {
      const res = await api.get('/invoices');
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        currentInvoices = res.data;
      }
    } catch (e) {}
    
    // Create CSV headers and rows
    const headers = language === 'NL' 
      ? ['Factuurnummer', 'Klant', 'Project', 'Bedrag', 'Status', 'Datum']
      : ['Invoice ID', 'Customer', 'Project', 'Amount', 'Status', 'Date'];
    const rows = currentInvoices.map(q => [
      q.id || q.invoiceNumber,
      `"${(q.customer || q.customerName || '').replace(/"/g, '""')}"`,
      `"${(q.project || q.name || 'Project').replace(/"/g, '""')}"`,
      `"${q.amount || q.totalAmount || 0}"`,
      q.status,
      q.date || q.createdAt
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    // Create download trigger
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Vanuit_Ambacht_Invoices_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-primary">
            {t('finance.title') || (language === 'NL' ? 'Financiën' : 'Finance')}
          </h2>
          <p className="text-dark/60 text-sm">
            {language === 'NL' ? 'Volg omzet, facturen en betalingen.' : 'Track revenue, invoices and payments.'}
          </p>
        </div>
        <Button icon={Download} variant="outline" onClick={handleExportCSV}>
          {language === 'NL' ? 'CSV Exporteren' : 'Export CSV'}
        </Button>
      </div>

      {/* Finance KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { 
            label: language === 'NL' ? 'Totale Omzet' : 'Total Revenue', 
            value: `€ ${(stats.totalRevenue || 0).toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
            icon: TrendingUp, 
            color: 'bg-green-50 text-green-600', 
            sub: language === 'NL' ? 'Alle betaalde omzet' : 'All paid revenue' 
          },
          { 
            label: language === 'NL' ? 'Deze Maand' : 'This Month', 
            value: `€ ${(stats.thisMonth || 0).toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
            icon: DollarSign, 
            color: 'bg-primary/10 text-primary', 
            sub: language === 'NL' ? 'Huidige kalendermaand' : 'Current calendar month' 
          },
          { 
            label: language === 'NL' ? 'Openstaand' : 'Outstanding', 
            value: `€ ${(stats.outstanding || 0).toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
            icon: Clock, 
            color: 'bg-yellow-50 text-yellow-600', 
            sub: language === 'NL' ? `${stats.pendingInvoicesCount || 0} facturen in behandeling` : `${stats.pendingInvoicesCount || 0} invoices pending` 
          },
          { 
            label: language === 'NL' ? 'Betaald (YTD)' : 'Paid (Ytd)', 
            value: `€ ${(stats.paidYtd || 0).toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
            icon: CheckCircle, 
            color: 'bg-blue-50 text-blue-600', 
            sub: language === 'NL' ? `${stats.collectionRatePct || 0}% inningspercentage` : `${stats.collectionRatePct || 0}% collection rate` 
          },
        ].map((stat, i) => (
          <Card key={i}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-dark/60 font-medium">{stat.label}</p>
                <p className="text-2xl font-heading font-bold text-dark mt-1">{stat.value}</p>
                <p className="text-xs text-dark/50 mt-1">{stat.sub}</p>
              </div>
              <div className={`p-2.5 rounded-lg ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Revenue by Month */}
      <Card title={language === 'NL' ? 'Omzetoverzicht (2026)' : 'Revenue Overview (2026)'}>
        <div className="flex items-end gap-2 h-32">
          {[30, 45, 38, 55, 42, 65, 52, 70, 58, 80, 68, 90].map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-primary/80 rounded-t-sm transition-all hover:bg-primary" style={{ height: `${val}%` }}></div>
              <span className="text-xs text-dark/40 hidden sm:block">
                {['J','F','M','A','M','J','J','A','S','O','N','D'][i]}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Invoice Table */}
      <Card title={t('common.invoices') || (language === 'NL' ? 'Facturen' : 'Invoices')}>
        <div className="space-y-3">
          {loading ? (
            <p className="text-sm text-dark/50 py-6 text-center">
              {language === 'NL' ? 'Facturen laden...' : 'Loading invoices...'}
            </p>
          ) : invoices.length === 0 ? (
            <div className="py-8 text-center text-dark/50 text-sm">
              {language === 'NL' ? 'Geen facturen gevonden in database.' : 'No invoices found in database.'}
            </div>
          ) : (
            invoices.map(inv => {
              const invNum = inv.invoiceNumber || inv.id;
              const custName = inv.customerName || inv.customer?.name || inv.customer || (language === 'NL' ? 'Klant' : 'Customer');
              const projName = inv.projectName || inv.project?.name || inv.project || (language === 'NL' ? 'Project' : 'Project');
              const amt = Number(inv.totalInclVat || inv.amount || inv.totalAmount || 0);
              const status = inv.status || 'draft';
              const dateStr = inv.issueDate || inv.date || (inv.createdAt ? new Date(inv.createdAt).toLocaleDateString(language === 'NL' ? 'nl-NL' : 'en-US') : '');
              const isPaid = status.toLowerCase() === 'paid';
              const isPartiallyPaid = status.toLowerCase() === 'partially_paid';

              return (
                <div key={inv.id || invNum} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-secondary/30 rounded-lg hover:bg-light/50 transition-colors gap-3">
                  <div>
                    <p className="font-medium text-dark">{invNum} – {custName}</p>
                    <p className="text-sm text-dark/60">{projName}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-heading font-bold text-dark">
                      € {amt.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <Badge variant={isPaid ? 'success' : isPartiallyPaid ? 'accent' : 'default'}>
                      {tStatus(status)}
                    </Badge>
                    <span className="text-xs text-dark/40">{dateStr}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
