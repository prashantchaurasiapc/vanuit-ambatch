import Card from '../../components/Card';
import Button from '../../components/Button';
import { Download, TrendingUp, Briefcase, Users } from 'lucide-react';
import { downloadDocumentPdf } from '../../utils/pdfGenerator';


export default function Reports() {
  const handleExportExcel = () => {
    const reportData = [
      ['Lead Conversion Funnel Metric Report'],
      ['Stage', 'Inquiries Count', 'Percentage'],
      ['Total Inquiries', 220, '100%'],
      ['Leads Created', 142, '65%'],
      ['Quotes Sent', 80, '36%'],
      ['Projects Started', 52, '24%'],
      ['Completed', 48, '22%'],
      [],
      ['Monthly Revenue Performance (2023)'],
      ['Month', 'Revenue (€)'],
      ['Jan', 32000], ['Feb', 41000], ['Mar', 38000],
      ['Apr', 55000], ['May', 48000], ['Jun', 62000],
      ['Jul', 58000], ['Aug', 71000], ['Sep', 65000],
      ['Oct', 78000], ['Nov', 69000], ['Dec', 90000]
    ];
    
    const csvContent = reportData.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Vanuit_Ambacht_Reports_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = () => {
    downloadDocumentPdf({
      name: `Vanuit-Ambacht-Reports-${new Date().toISOString().split('T')[0]}.pdf`,
      id: `RPT-${new Date().toISOString().split('T')[0]}`,
      category: 'Business Reports & Analytics',
      uploader: 'Vanuit Ambacht System',
      date: new Date().toLocaleDateString('nl-NL'),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-primary">Reports</h2>
          <p className="text-dark/60 text-sm">Business performance reports and analytics.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" icon={Download} size="sm" onClick={handleDownloadPDF}>Download PDF</Button>
          <Button variant="outline" icon={Download} size="sm" onClick={handleExportExcel}>Export Excel</Button>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Revenue Report', icon: TrendingUp, desc: 'Monthly and yearly revenue trends', color: 'bg-green-50 text-green-600' },
          { title: 'Projects Report', icon: Briefcase, desc: 'Project completion and progress stats', color: 'bg-primary/10 text-primary' },
          { title: 'Lead Conversion', icon: Users, desc: 'Lead to project conversion rate', color: 'bg-blue-50 text-blue-600' },
        ].map((report, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer group">
            <div className={`p-3 rounded-xl ${report.color} inline-block mb-4`}>
              <report.icon className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-semibold text-dark group-hover:text-primary transition-colors">{report.title}</h3>
            <p className="text-sm text-dark/60 mt-1">{report.desc}</p>
            <Button variant="ghost" size="sm" className="mt-4 px-0 text-primary">View Report →</Button>
          </Card>
        ))}
      </div>

      {/* Lead Conversion Chart */}
      <Card title="Lead Conversion Funnel">
        <div className="space-y-4">
          {[
            { stage: 'Total Inquiries', count: 220, pct: 100, color: 'bg-blue-400' },
            { stage: 'Leads Created', count: 142, pct: 65, color: 'bg-primary/80' },
            { stage: 'Quotes Sent', count: 80, pct: 36, color: 'bg-accent' },
            { stage: 'Projects Started', count: 52, pct: 24, color: 'bg-green-500' },
            { stage: 'Completed', count: 48, pct: 22, color: 'bg-green-600' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
              <span className="text-xs sm:text-sm font-body font-medium text-dark/70 sm:w-36 flex-shrink-0">{item.stage}</span>
              <div className="flex-1 flex items-center gap-3">
                <div className="flex-1 bg-secondary/20 rounded-full h-6 relative overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full transition-all flex items-center justify-end pr-3 min-w-[36px]`} style={{ width: `${item.pct}%` }}>
                    <span className="text-white text-[11px] font-bold">{item.count}</span>
                  </div>
                </div>
                <span className="text-xs sm:text-sm text-dark/50 font-body w-10 text-right font-medium">{item.pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Monthly Performance */}
      <Card title="Monthly Revenue Performance">
        <div className="overflow-x-auto pb-2 min-w-0">
          <div className="flex items-end justify-between gap-2 h-44 min-w-[420px] pt-4 px-1">
            {[
              { month: 'Jan', val: 32000 }, { month: 'Feb', val: 41000 }, { month: 'Mar', val: 38000 },
              { month: 'Apr', val: 55000 }, { month: 'May', val: 48000 }, { month: 'Jun', val: 62000 },
              { month: 'Jul', val: 58000 }, { month: 'Aug', val: 71000 }, { month: 'Sep', val: 65000 },
              { month: 'Oct', val: 78000 }, { month: 'Nov', val: 69000 }, { month: 'Dec', val: 90000 },
            ].map((item, i) => {
              const maxVal = 90000;
              const pct = (item.val / maxVal) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[10px] text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    €{(item.val / 1000).toFixed(0)}k
                  </span>
                  <div className="w-full bg-primary hover:bg-accent transition-colors rounded-t-md shadow-sm" style={{ height: `${pct}%` }}></div>
                  <span className="text-[11px] text-dark/60 font-body font-medium mt-0.5">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}
