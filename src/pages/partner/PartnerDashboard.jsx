import React, { useState } from 'react';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { Briefcase, Calendar, CheckCircle, Clock, Upload, FileText, ArrowUpRight, Eye, Edit3, X, Sliders } from 'lucide-react';
import { mockProjects, mockRecentActivities } from '../../utils/mockData';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import projectImg from '../../assets/outdoor_project_card.png';
import heroBg from '/dasbordes images.png';

export default function PartnerDashboard() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [projects, setProjects] = useState(mockProjects);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editProject, setEditProject] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleUpdateProgress = (e) => {
    e.preventDefault();
    if (!editProject) return;
    setProjects(prev => prev.map(p => p.id === editProject.id ? editProject : p));
    setEditProject(null);
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      {/* Hero Banner Box — Increased Height + Buttons Shifted to Top Right */}
      <div className="relative rounded-2xl overflow-hidden w-full h-56 sm:h-64 md:h-72 lg:h-[300px] shadow-sm border border-[#C4BEB3]/40">
        <img src={heroBg} alt="Vanuit Ambacht" className="w-full h-full object-cover object-[center_35%]" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/55 to-transparent pointer-events-none"></div>
        
        {/* Left Title */}
        <div className="absolute top-4 left-4 sm:top-5 sm:left-6 md:top-6 md:left-8 max-w-md z-20">
          <p className="text-white/50 text-[10px] sm:text-xs font-body uppercase tracking-widest mb-0.5">Vanuit Ambacht</p>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-white">{t('dashboard.partnerTitle')}</h2>
          <p className="text-white/60 text-xs sm:text-sm font-body mt-0.5">{t('dashboard.partnerOverview')}</p>
        </div>

        {/* Right Top Action Button */}
        <div className="absolute top-3.5 right-3.5 sm:top-4 sm:right-5 md:top-5 md:right-6 hidden sm:flex gap-3 z-20">
          <Button className="bg-cream text-primary hover:bg-cream/90 shadow-xs text-[11px] font-semibold py-1 px-2.5 rounded-md leading-tight" size="sm" icon={Upload} onClick={() => navigate('/partner/documents')}>
            {t('common.uploadDocument')}
          </Button>
        </div>
      </div>

      {/* Stats Summary Cards — Compact 3-col row on mobile */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
        {[
          { label: t('common.myProjects'), value: projects.length, icon: Briefcase, color: 'bg-primary/10 text-primary' },
          { label: t('statuses.In Progress'), value: projects.filter(p => p.status === 'In Progress').length, icon: Clock, color: 'bg-accent/10 text-accent' },
          { label: t('statuses.Completed'), value: projects.filter(p => p.status === 'Completed').length, icon: CheckCircle, color: 'bg-green-100 text-green-700' },
        ].map((stat, i) => (
          <Card key={i} noPadding className="p-2 sm:p-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[11px] text-dark/50 font-body font-semibold uppercase tracking-wider truncate">{stat.label}</p>
                <p className="text-sm sm:text-xl font-heading font-bold text-dark mt-0.5">{stat.value}</p>
              </div>
              <div className={`p-1.5 sm:p-2 rounded-lg ${stat.color} flex-shrink-0`}>
                <stat.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-heading font-bold text-primary">{language === 'EN' ? 'My Active Projects' : 'Mijn Actieve Projecten'}</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/partner/projects')}>
              {language === 'EN' ? 'View All' : 'Bekijk Alles'} <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>

          {projects.map((project) => (
            <Card key={project.id} className="overflow-hidden hover:shadow-card-hover transition-shadow" noPadding>
              <div className="flex flex-col sm:flex-row">
                {/* Project image thumbnail */}
                <div className="sm:w-32 h-32 flex-shrink-0 relative overflow-hidden bg-cream-dark/20">
                  <img
                    src={projectImg}
                    alt={project.name}
                    className="w-full h-full object-cover"
                    style={{ filter: 'brightness(0.88)' }}
                  />
                </div>

                {/* Project info */}
                <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm font-body text-dark truncate">{project.name}</h4>
                      <Badge variant={project.status === 'Completed' ? 'success' : project.status === 'In Progress' ? 'primary' : 'warning'} className="flex-shrink-0">
                        {project.status === 'In Progress' ? (language === 'NL' ? 'In uitvoering' : 'In Progress') : project.status === 'Completed' ? (language === 'NL' ? 'Afgerond' : 'Completed') : (language === 'NL' ? 'In behandeling' : project.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-dark/50 font-body">{language === 'NL' ? 'Klant:' : 'Client:'} {project.customer}</p>
                      <span className="text-dark/30 text-xs">•</span>
                      <div className="flex items-center gap-1.5 bg-primary/10 px-2 py-0.5 rounded-md">
                        <img 
                          src={
                            project.name.toLowerCase().includes('snijplanken') || project.name.toLowerCase().includes('utrecht')
                              ? '/logo_snijplanken.png'
                              : '/logo_buitenkeukens.png'
                          } 
                          alt="Division" 
                          className="h-4 object-contain mix-blend-multiply" 
                        />
                        <span className="text-[10px] font-bold text-primary font-body">
                          {project.name.toLowerCase().includes('snijplanken') || project.name.toLowerCase().includes('utrecht')
                            ? 'Snijplanken'
                            : 'Buitenkeukens'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-[11px] font-body mb-1">
                      <span className="text-dark/50 font-medium">{language === 'NL' ? 'Voortgang' : 'Completion Progress'}</span>
                      <span className="font-bold text-primary">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-secondary/30 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${project.progress}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex sm:flex-col gap-2 p-3 border-t sm:border-t-0 sm:border-l border-cream-dark/40 justify-center bg-[#EDE8DF]/40">
                  <Button size="sm" variant="outline" className="flex-1 text-xs whitespace-nowrap" icon={Edit3} onClick={() => setEditProject({ ...project })}>
                    {language === 'NL' ? 'Bewerken' : 'Update'}
                  </Button>
                  <Button size="sm" className="flex-1 text-xs whitespace-nowrap" icon={Eye} onClick={() => setSelectedProject(project)}>
                    {language === 'NL' ? 'Bekijk' : 'View'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Schedule Widget */}
          <Card title={language === 'NL' ? 'Aankomende Agenda' : 'Upcoming Schedule'} action={<button onClick={() => navigate('/partner/planning')} className="text-xs font-body text-accent hover:underline">{language === 'NL' ? 'Volledige Agenda' : 'Full Agenda'}</button>}>
            <div className="space-y-3">
              {[
                { task: language === 'NL' ? 'Locatiebezoek – Amsterdam project' : 'Site visit – Amsterdam project', date: language === 'NL' ? 'Morgen, 09:00' : 'Tomorrow, 09:00', dot: 'bg-primary' },
                { task: language === 'NL' ? 'Levering materialen – Rotterdam' : 'Material delivery – Rotterdam', date: '25 Nov, 13:00', dot: 'bg-accent' },
                { task: language === 'NL' ? 'Klantoverleg meeting' : 'Client review meeting', date: '28 Nov, 10:30', dot: 'bg-secondary' },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 p-3 bg-white/70 rounded-xl border border-cream-dark/50 hover:border-primary/20 transition-all">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${item.dot}`}></div>
                  <div>
                    <p className="text-xs text-dark font-body font-medium">{item.task}</p>
                    <p className="text-[11px] text-dark/40 font-body mt-0.5">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Activity */}
          <Card title={language === 'NL' ? 'Recente Activiteit' : 'Recent Activity'}>
            <div className="space-y-4">
              {mockRecentActivities.slice(0, 4).map((activity) => (
                <div key={activity.id} className="relative pl-4 border-l-2 border-accent/40">
                  <p className="text-xs text-dark font-body">
                    {language === 'EN' 
                      ? (activity.text || activity.title || '')
                          .replace(/Nieuwe lead ontvangen/g, 'New lead received')
                          .replace(/Factuur betaald/g, 'Invoice paid')
                          .replace(/Offerte goedgekeurd/g, 'Quote approved')
                          .replace(/Sollicitatie bekeken/g, 'Application reviewed')
                      : (activity.text || activity.title)}
                  </p>
                  <span className="text-[10px] text-dark/40 font-body mt-0.5 block">
                    {language === 'EN' 
                      ? (activity.time || '')
                          .replace(/uur geleden/g, 'hours ago')
                          .replace(/1 uur geleden/g, '1 hour ago')
                          .replace(/dag geleden/g, 'day ago')
                          .replace(/dagen geleden/g, 'days ago')
                      : activity.time}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card title={language === 'NL' ? 'Snelle Acties' : 'Quick Actions'}>
            <div className="space-y-2">
              <button 
                onClick={() => navigate('/partner/documents')}
                className="flex items-center gap-3 w-full p-3 rounded-xl bg-white/60 border border-[#D6CFC2] hover:border-primary hover:bg-white transition-all text-xs font-body text-dark/80 font-medium"
              >
                <Upload className="w-4 h-4 text-primary" />
                {language === 'NL' ? 'Document Uploaden' : 'Upload Document'}
              </button>
              <button 
                onClick={() => navigate('/partner/planning')}
                className="flex items-center gap-3 w-full p-3 rounded-xl bg-white/60 border border-[#D6CFC2] hover:border-primary hover:bg-white transition-all text-xs font-body text-dark/80 font-medium"
              >
                <Calendar className="w-4 h-4 text-primary" />
                {language === 'NL' ? 'Planning & Agenda Bekijken' : 'View Schedule & Agenda'}
              </button>
              <button 
                onClick={() => setShowReportModal(true)}
                className="flex items-center gap-3 w-full p-3 rounded-xl bg-white/60 border border-[#D6CFC2] hover:border-primary hover:bg-white transition-all text-xs font-body text-dark/80 font-medium"
              >
                <FileText className="w-4 h-4 text-primary" />
                {language === 'NL' ? 'Partnerrapport Genereren' : 'Generate Partner Report'}
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Progress Modal */}
      {editProject && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#EDE8DF] border border-[#D6CFC2] rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-[#D6CFC2]">
              <h3 className="text-lg font-heading font-bold text-primary">Update Project Progress</h3>
              <button onClick={() => setEditProject(null)} className="text-dark/40 hover:text-dark"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleUpdateProgress} className="space-y-4 font-body text-xs">
              <div>
                <label className="block text-dark/70 font-semibold mb-1">Project Name</label>
                <input type="text" disabled value={editProject.name} className="w-full p-2.5 bg-cream-dark/30 border border-[#D6CFC2] rounded-lg text-dark/60" />
              </div>
              <div>
                <label className="block text-dark/70 font-semibold mb-1">Status</label>
                <select
                  value={editProject.status}
                  onChange={e => setEditProject({ ...editProject, status: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#D6CFC2] rounded-lg text-dark focus:outline-none"
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Review Required">Review Required</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-dark/70 font-semibold">Progress Percentage</label>
                  <span className="font-bold text-primary">{editProject.progress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editProject.progress}
                  onChange={e => setEditProject({ ...editProject, progress: Number(e.target.value) })}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditProject(null)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#EDE8DF] border border-[#D6CFC2] rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-[#D6CFC2]">
              <h3 className="text-lg font-heading font-bold text-primary">{selectedProject.name}</h3>
              <button onClick={() => setSelectedProject(null)} className="text-dark/40 hover:text-dark"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 font-body text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-white/70 rounded-xl">
                <div>
                  <span className="text-dark/50 font-medium block">Client Name</span>
                  <span className="font-bold text-dark">{selectedProject.customer}</span>
                </div>
                <div>
                  <span className="text-dark/50 font-medium block">Deadline</span>
                  <span className="font-bold text-dark">{selectedProject.deadline}</span>
                </div>
                <div>
                  <span className="text-dark/50 font-medium block">Status</span>
                  <Badge variant={selectedProject.status === 'Completed' ? 'success' : 'primary'}>{selectedProject.status}</Badge>
                </div>
                <div>
                  <span className="text-dark/50 font-medium block">Progress</span>
                  <span className="font-bold text-primary">{selectedProject.progress}%</span>
                </div>
              </div>
              <div>
                <span className="text-dark/70 font-semibold block mb-1">Project Scope & Specifications</span>
                <p className="text-dark/70 bg-white/60 p-3 rounded-xl border border-[#D6CFC2]/50 leading-relaxed">
                  Bespoke outdoor kitchen installation featuring custom concrete countertops, teak wood cabinetry, integrated Kamado Joe BBQ surround, and ambient LED perimeter lighting.
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={() => setSelectedProject(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Partner Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#EDE8DF] border border-[#D6CFC2] rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-[#D6CFC2]">
              <h3 className="text-lg font-heading font-bold text-primary">Partner Summary Report</h3>
              <button onClick={() => setShowReportModal(false)} className="text-dark/40 hover:text-dark"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 font-body text-xs">
              <p className="text-dark/70">Your Q3 2026 partner performance summary has been compiled successfully.</p>
              <div className="p-4 bg-white/70 rounded-xl space-y-2">
                <div className="flex justify-between"><span>Total Assigned Projects:</span> <span className="font-bold">4</span></div>
                <div className="flex justify-between"><span>Completed Projects:</span> <span className="font-bold text-green-700">8</span></div>
                <div className="flex justify-between"><span>On-Time Completion Rate:</span> <span className="font-bold text-primary">98.5%</span></div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 font-body text-xs">
              <Button variant="outline" onClick={() => setShowReportModal(false)}>Close</Button>
              <Button icon={FileText} onClick={() => { alert("Report downloaded as PDF!"); setShowReportModal(false); }}>Download PDF</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
