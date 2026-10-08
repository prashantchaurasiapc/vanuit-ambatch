import React, { useState, useEffect, useRef } from 'react';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { Plus, CheckSquare, Square, Trash2, Edit2, X, CheckCircle, Clock, Link as LinkIcon, Filter, Search, Calendar, Mic, Sparkles, FileText, UploadCloud, User, Bot, Play, Pause, Check, ArrowRight, Zap, FolderOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../api/apiClient';

const DEFAULT_SAMPLE_TRANSCRIPT = `[00:01] Tim: Goedemiddag Bjorn! Bedankt voor de koffie. Laten we de buitenkeuken opstelling bespreken.
[00:15] Bjorn Valk: Ja top! Ik wil graag een strakke houten buitenkeuken van 240x80 cm op ons achterterras.
[00:42] Bram: Welke houtsoort heeft jouw voorkeur? Eiken of Thermo Fraké?
[01:05] Bjorn Valk: Thermo Fraké is toch duurzamer en onderhoudsvrij? Laten we definitief voor Thermo Fraké gaan.
[01:35] Tim: Helder! En betreft de BBQ uitsparing?
[02:10] Bjorn Valk: Ik heb een Big Green Egg Large. Die moet rechts ingebouwd worden met een zwart beton cire werkblad van 8cm.
[02:45] Bram: Duidelijk. Ik ga vandaag nog de 3D CAD werktekening maken voor de werkplaats. Tim stuur jij de officiële offerte?
[03:15] Tim: Afgesproken, ik stuur de offerte (OF-2026-003) uiterlijk morgen naar Bjorn Valk. Aanbetaling 50% vooraf.`;

export default function Tasks() {
  const { t, language } = useLanguage();
  const [tasks, setTasks] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [leadsList, setLeadsList] = useState([]);
  
  // Filter & Search State
  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Pending' | 'Completed'
  const [assigneeFilter, setAssigneeFilter] = useState('All'); // 'All' | 'Tim' | 'Bram'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal & Toast State
  const [toastMsg, setToastMsg] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Plaud AI Import & Analyzer State
  const [plaudModalOpen, setPlaudModalOpen] = useState(false);
  const [plaudInputMode, setPlaudInputMode] = useState('transcript'); // 'transcript' | 'audio'
  const [transcriptText, setTranscriptText] = useState(DEFAULT_SAMPLE_TRANSCRIPT);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Local Audio File Upload State & Ref
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(null);

  // Form State
  const [form, setForm] = useState({
    title: '',
    linkedType: 'Project', // 'Project' | 'Lead' | 'None'
    linkedId: '',
    assignee: 'Tim', // 'Tim' | 'Bram'
    priority: 'Medium', // 'High' | 'Medium' | 'Low'
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    completed: false
  });

  const translateTaskText = (str) => {
    if (language !== 'EN' || !str) return str;
    return str
      .replace(/Inmeten buitenkeuken bij Jan de Vries/g, 'Measure outdoor kitchen for John Miller')
      .replace(/Inmeten buitenkeuken bij John Miller/g, 'Measure outdoor kitchen for John Miller')
      .replace(/Kleurstalen opsturen naar Sophie Bakken/g, 'Send color samples to Sophia Taylor')
      .replace(/Kleurstalen opsturen naar Sophia Taylor/g, 'Send color samples to Sophia Taylor')
      .replace(/Offerte Q-4003 nabellen \(Mark de Boer\)/g, 'Follow up on Quote Q-4003 (Mark Davis)')
      .replace(/Offerte Q-4003 nabellen \(Mark Davis\)/g, 'Follow up on Quote Q-4003 (Mark Davis)')
      .replace(/Exclusieve Buitenkeuken - Maatwerk/g, 'Exclusive Outdoor Kitchen - Custom Build')
      .replace(/Exclusieve Buitenkeuken/g, 'Exclusive Outdoor Kitchen')
      .replace(/Luxe Teak Buitenkeuken 4m/g, 'Luxury Teak Outdoor Kitchen 4m')
      .replace(/Kliko Ombouw Triple Antraciet/g, 'Bin Storage Triple Anthracite')
      .replace(/Eiken Houten Overkapping 6x4m/g, 'Oak Wooden Canopy 6x4m')
      .replace(/Jan de Vries/g, 'John Miller')
      .replace(/Sophie Bakken/g, 'Sophia Taylor')
      .replace(/Mark de Boer/g, 'Mark Davis')
      .replace(/Anouk Visser/g, 'Emma Wilson');
  };

  const resolveAssignee = (rawAssignee) => {
    if (!rawAssignee) return 'Tim';
    const str = typeof rawAssignee === 'object' ? (rawAssignee.fullName || rawAssignee.name || rawAssignee.email || '') : String(rawAssignee);
    if (str.includes('Bram') && !str.includes('Tim')) return 'Bram';
    return 'Tim';
  };

  // Load Initial Data from API
  useEffect(() => {
    let isMounted = true;
    const loadTasksData = async () => {
      try {
        const res = await api.get('/tasks');
        if (isMounted) {
          if (res.success && Array.isArray(res.data)) {
            setTasks(res.data.map(t => ({
              id: t.id,
              title: t.title,
              linkedType: t.linkedType || (t.projectId ? 'Project' : t.leadId ? 'Lead' : 'None'),
              linkedId: t.linkedId || (t.project ? `P-${t.project.id || t.project.projectNumber} (${t.project.name || t.project.title})` : t.lead ? `Lead: ${t.lead.customerName}` : ''),
              priority: t.priority === 'urgent' || t.priority === 'Hoog' || t.priority === 'High' ? 'High' : (t.priority === 'low' || t.priority === 'Laag' || t.priority === 'Low' ? 'Low' : 'Medium'),
              dueDate: t.dueDate ? String(t.dueDate).split('T')[0] : '',
              completed: t.status === 'completed' || t.completed === true,
              assignee: resolveAssignee(t.assignedTo || t.assignee)
            })));
          } else {
            setTasks([]);
          }
        }
      } catch {
        if (isMounted) setTasks([]);
      }

      try {
        const pRes = await api.get('/projects');
        if (isMounted && pRes.success && Array.isArray(pRes.data)) {
          setProjectsList(pRes.data);
        } else if (isMounted) {
          setProjectsList([]);
        }
      } catch {
        if (isMounted) setProjectsList([]);
      }

      try {
        const lRes = await api.get('/leads');
        if (isMounted && lRes.success && Array.isArray(lRes.data)) {
          setLeadsList(lRes.data);
        } else if (isMounted) {
          setLeadsList([]);
        }
      } catch {
        if (isMounted) setLeadsList([]);
      }
    };

    loadTasksData();
    window.addEventListener('app_data_changed', loadTasksData);
    return () => {
      isMounted = false;
      window.removeEventListener('app_data_changed', loadTasksData);
    };
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const saveTasksToStorage = (updated) => {
    window.dispatchEvent(new Event('app_data_changed'));
  };

  // Toggle Task Checkbox completion
  const handleToggleComplete = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    const nextState = !task?.completed;
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        showToast(nextState ? (language === 'EN' ? 'Task marked as completed! ✅' : `Taak "${t.title}" gemarkeerd als afgerond! ✅`) : (language === 'EN' ? 'Task status reset.' : `Taak status teruggezet.`));
        return { ...t, completed: nextState };
      }
      return t;
    });
    setTasks(updatedTasks);
    try {
      await api.patch(`/tasks/${taskId}/status`, { completed: nextState, status: nextState ? 'completed' : 'pending' });
    } catch (e) {
      console.error('Failed to update task status:', e);
    }
  };

  const handleDeleteTask = async (id, title) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    showToast(language === 'EN' ? 'Task deleted.' : `Taak verwijderd.`);
    try {
      await api.delete(`/tasks/${id}`);
    } catch (e) {
      console.error('Failed to delete task:', e);
    }
  };

  // Handle Local File Upload Selection from Computer
  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setSelectedFile(file);

    if (file.name.endsWith('.txt') || file.name.endsWith('.json') || file.type.startsWith('text/')) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setTranscriptText(evt.target.result);
        showToast(language === 'EN' ? `Loaded transcript from "${file.name}"!` : `Transcript ingeladen uit "${file.name}"!`);
      };
      reader.readAsText(file);
    } else {
      const objectUrl = URL.createObjectURL(file);
      setAudioPreviewUrl(objectUrl);
      showToast(language === 'EN' ? `Selected local file "${file.name}" (${(file.size / (1024 * 1024)).toFixed(1)} MB)!` : `Lokaal bestand gekozen: "${file.name}"!`);
    }
  };

  // Plaud AI Meeting Analyzer Engine
  const handleAnalyzeMeeting = () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisResult({
        decisions: [
          'Klant gekozen voor Thermo Fraké hout afwerking boven Eiken (duurzaam & onderhoudsarm).',
          'Akkoord op Big Green Egg Large uitsparing aan de rechterzijde van het meubel.',
          'Akkoord op 50% aanbetaling vooraf en 50% bij oplevering.'
        ],
        requirements: [
          'Afmetingen meubel: 240 x 80 cm voor achterterras.',
          '8cm Zwart Polijst Beton Cire werkblad.',
          'Levering gewenst uiterlijk binnen 3 tot 5 weken.'
        ],
        tasks: [
          {
            id: `TSK-AI-${Date.now()}-1`,
            title: 'Maak 3D CAD werktekening voor Bjorn Valk (Thermo Fraké)',
            linkedType: 'Lead',
            linkedId: 'Bjorn Valk (Utrecht)',
            assignee: 'Bram',
            priority: 'High',
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            completed: false
          },
          {
            id: `TSK-AI-${Date.now()}-2`,
            title: 'Stuur officiële 6-Pagina Offerte (OF-2026-003) naar Bjorn Valk',
            linkedType: 'Lead',
            linkedId: 'Bjorn Valk (Utrecht)',
            assignee: 'Tim',
            priority: 'High',
            dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            completed: false
          },
          {
            id: `TSK-AI-${Date.now()}-3`,
            title: 'Bestel Big Green Egg Large uitsparing montagebeugel',
            linkedType: 'Project',
            linkedId: 'P-101 (Luxe Teak Buitenkeuken 4m)',
            assignee: 'Tim',
            priority: 'Medium',
            dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            completed: false
          }
        ]
      });
      showToast(language === 'EN' ? 'Plaud AI Meeting analysis complete!' : 'Plaud AI meeting analyse afgerond!');
    }, 1500);
  };

  const handleImportAITasks = async () => {
    if (!analysisResult || !analysisResult.tasks) return;
    const aiTasks = analysisResult.tasks;
    const updated = [...aiTasks, ...tasks];
    setTasks(updated);
    setPlaudModalOpen(false);
    showToast(language === 'EN' ? `${aiTasks.length} AI Tasks imported to board!` : `${aiTasks.length} AI Taken geïmporteerd naar board!`);
    try {
      await api.post('/tasks/batch', {
        tasks: aiTasks.map(t => ({
          title: t.title,
          priority: t.priority === 'High' ? 'urgent' : (t.priority === 'Low' ? 'low' : 'medium'),
          dueDate: t.dueDate
        }))
      });
    } catch (e) {
      console.error('Failed to batch create tasks:', e);
    }
  };

  const handleOpenAddModal = () => {
    setSelectedTask(null);
    const defaultLinked = projectsList[0] ? `P-${projectsList[0].id} (${projectsList[0].name})` : '';
    setForm({
      title: '',
      linkedType: 'Project',
      linkedId: defaultLinked,
      priority: 'Medium',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      completed: false
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setSelectedTask(task);
    setForm({
      title: task.title,
      linkedType: task.linkedType || 'None',
      linkedId: task.linkedId || '',
      priority: task.priority || 'Medium',
      dueDate: task.dueDate || new Date().toISOString().split('T')[0],
      completed: task.completed || false
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showToast("Vul een geldige taaktitel in.");
      return;
    }

    if (selectedTask) {
      const updatedList = tasks.map(t => {
        if (t.id === selectedTask.id) {
          return {
            ...t,
            title: form.title,
            linkedType: form.linkedType,
            linkedId: form.linkedId,
            priority: form.priority,
            dueDate: form.dueDate,
            completed: form.completed
          };
        }
        return t;
      });
      setTasks(updatedList);
      showToast(`Taak geüpdatet!`);
      setModalOpen(false);
      try {
        await api.patch(`/tasks/${selectedTask.id}`, {
          title: form.title,
          priority: form.priority === 'High' ? 'urgent' : (form.priority === 'Low' ? 'low' : 'medium'),
          dueDate: form.dueDate
        });
      } catch (e) {
        console.error('Failed to update task:', e);
      }
    } else {
      const newTask = {
        id: `TSK-${Date.now()}`,
        title: form.title,
        linkedType: form.linkedType,
        linkedId: form.linkedId,
        priority: form.priority,
        dueDate: form.dueDate,
        completed: false
      };
      setTasks([newTask, ...tasks]);
      showToast(language === 'EN' ? 'New task created!' : 'Nieuwe taak aangemaakt!');
      setModalOpen(false);
      try {
        const res = await api.post('/tasks', {
          title: form.title,
          priority: form.priority === 'High' ? 'urgent' : (form.priority === 'Low' ? 'low' : 'medium'),
          dueDate: form.dueDate
        });
        if (res.success && res.data) {
          setTasks(prev => prev.map(t => t.id === newTask.id ? { ...t, id: res.data.id } : t));
        }
      } catch (e) {
        console.error('Failed to create task:', e);
      }
    }
  };

  const handleToggleAssignee = (taskId) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        const current = t.assignee || t.assignedTo || 'Tim';
        const next = current === 'Tim' ? 'Bram' : 'Tim';
        showToast(language === 'EN' ? `Assignee changed to ${next}` : `Toegewezen aan ${next}`);
        return { ...t, assignee: next, assignedTo: next };
      }
      return t;
    });
    setTasks(updatedTasks);
    saveTasksToStorage(updatedTasks);
  };

  // Filter Tasks
  const filteredTasks = [...tasks].filter(t => {
    if (activeTab === 'Pending' && t.completed) return false;
    if (activeTab === 'Completed' && !t.completed) return false;

    const taskAssignee = t.assignee || t.assignedTo || 'Tim';
    if (assigneeFilter !== 'All' && taskAssignee !== assigneeFilter) return false;

    const translatedTitle = translateTaskText(t.title || '');
    const translatedLinked = translateTaskText(t.linkedId || '');

    const matchesSearch = 
      translatedTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      translatedLinked.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6 relative font-body text-[#4A4A43]">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 80 }} className="fixed top-20 right-4 z-[9999] flex items-center gap-2 bg-primary text-cream px-4 py-3 rounded-xl shadow-lg text-xs font-body">
            <CheckCircle className="w-4 h-4 text-green-400" />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-3 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-primary">
              {language === 'EN' ? 'Tasks & To-Do Management' : 'Taken & To-Do Beheer'}
            </h2>
            <p className="text-dark/60 text-xs sm:text-sm mt-0.5">
              {language === 'EN' 
                ? 'Manage daily action items linked to leads and projects.' 
                : 'Beheer dagelijkse actiepunten, gekoppeld aan leads en opleverprojecten.'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Button 
              size="sm"
              onClick={() => setPlaudModalOpen(true)} 
              className="bg-purple-900 hover:bg-purple-950 text-white font-bold border-none py-1.5 px-2.5 sm:px-3 text-xs whitespace-nowrap"
            >
              <Mic className="w-3.5 h-3.5 sm:mr-1 text-amber-300 flex-shrink-0" />
              <span className="hidden sm:inline">Plaud AI Import</span>
            </Button>
            <Button 
              size="sm"
              icon={Plus} 
              onClick={handleOpenAddModal}
              className="py-1.5 px-2.5 sm:px-3 text-xs font-bold whitespace-nowrap"
            >
              <span className="hidden sm:inline">{language === 'EN' ? 'Add New Task' : 'Nieuwe Taak'}</span>
              <span className="sm:hidden">{language === 'EN' ? 'New Task' : 'Nieuwe'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <Card p="p-3 sm:p-4">
        <div className="flex flex-col gap-3 mb-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveTab('All')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold font-body transition-all ${
                activeTab === 'All' ? 'bg-primary text-cream shadow-xs' : 'bg-[#EDE8DF]/60 text-dark/70 hover:bg-[#EDE8DF]'
              }`}
            >
              {language === 'EN' ? `All (${tasks.length})` : `Alle (${tasks.length})`}
            </button>
            <button
              onClick={() => setActiveTab('Pending')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold font-body transition-all ${
                activeTab === 'Pending' ? 'bg-primary text-cream shadow-xs' : 'bg-[#EDE8DF]/60 text-dark/70 hover:bg-[#EDE8DF]'
              }`}
            >
              {language === 'EN' ? `Pending (${tasks.filter(t => !t.completed).length})` : `Openstaand (${tasks.filter(t => !t.completed).length})`}
            </button>
            <button
              onClick={() => setActiveTab('Completed')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold font-body transition-all ${
                activeTab === 'Completed' ? 'bg-primary text-cream shadow-xs' : 'bg-[#EDE8DF]/60 text-dark/70 hover:bg-[#EDE8DF]'
              }`}
            >
              {language === 'EN' ? `Done (${tasks.filter(t => t.completed).length})` : `Afgerond (${tasks.filter(t => t.completed).length})`}
            </button>
          </div>

          {/* Assignee Filter + Search — same row or stacked on mobile */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-dark/50 uppercase tracking-wider flex-shrink-0">Assignee:</span>
              {['All', 'Tim', 'Bram'].map((ass) => (
                <button
                  key={ass}
                  onClick={() => setAssigneeFilter(ass)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    assigneeFilter === ass ? 'bg-purple-900 text-white' : 'bg-purple-100 text-purple-900 hover:bg-purple-200'
                  }`}
                >
                  {ass === 'All' ? 'All' : `👤 ${ass}`}
                </button>
              ))}
            </div>

            <div className="relative flex-1 sm:max-w-xs sm:ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/40" />
              <input
                type="text"
                placeholder={language === 'EN' ? 'Search tasks...' : 'Zoek taken...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#EDE8DF]/40 border border-[#D6CFC2] rounded-lg text-xs focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Tasks List Container */}
        <div className="space-y-2.5">
          {filteredTasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-3 sm:p-3.5 rounded-xl border transition-all ${
                task.completed
                  ? 'bg-gray-50/70 border-gray-200 text-dark/50'
                  : 'bg-white border-[#D6CFC2] hover:border-primary/50 shadow-xs'
              }`}
            >
              {/* Checkbox Toggle + Title */}
              <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
                <button
                  onClick={() => handleToggleComplete(task.id)}
                  className="text-primary hover:scale-110 transition-transform flex-shrink-0 mt-0.5"
                  title={task.completed ? "Mark as pending" : "Mark as completed"}
                >
                  {task.completed ? (
                    <CheckSquare className="w-5 h-5 text-green-600" />
                  ) : (
                    <Square className="w-5 h-5 text-dark/40 hover:text-primary" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <h4 className={`font-bold text-xs sm:text-sm leading-snug ${task.completed ? 'line-through text-dark/40' : 'text-dark'}`}>
                    {translateTaskText(task.title)}
                  </h4>
                  {task.linkedId && (
                    <p className="text-[10px] text-primary/80 flex items-center gap-1 mt-0.5 font-semibold break-words">
                      <LinkIcon className="w-3 h-3 text-accent flex-shrink-0" /> {language === 'EN' ? 'Linked to' : 'Gekoppeld aan'}: {translateTaskText(task.linkedId)}
                    </p>
                  )}

                  {/* Assignee + Priority + Due Date + Actions — always below title on mobile */}
                  <div className="flex items-center flex-wrap gap-1.5 mt-2 pt-2 border-t border-[#D6CFC2]/30">
                    <button
                      type="button"
                      onClick={() => handleToggleAssignee(task.id)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200 hover:bg-purple-200 transition-colors cursor-pointer flex-shrink-0"
                      title={language === 'EN' ? 'Click to toggle assignee (Tim / Bram)' : 'Klik om te wisselen tussen Tim & Bram'}
                    >
                      <User className="w-3 h-3 text-purple-700" />
                      <span>{resolveAssignee(task.assignee || task.assignedTo)}</span>
                    </button>

                    <Badge variant={(task.priority === 'High' || task.priority === 'Hoog') ? 'danger' : task.priority === 'Medium' ? 'warning' : 'default'} className="text-[9px] py-0.5 flex-shrink-0">
                      {language === 'EN' 
                        ? ((task.priority === 'Hoog' || task.priority === 'High') ? 'High' : task.priority === 'Medium' ? 'Medium' : 'Low')
                        : task.priority}
                    </Badge>

                    <span className="text-[10px] text-dark/60 font-mono flex items-center gap-1 bg-[#EDE8DF]/60 px-1.5 py-0.5 rounded-md border border-[#D6CFC2]/50 flex-shrink-0">
                      <Calendar className="w-3 h-3 text-dark/40" /> {task.dueDate}
                    </span>

                    <div className="flex items-center gap-1 ml-auto flex-shrink-0">
                      <button
                        onClick={() => handleOpenEditModal(task)}
                        className="p-1.5 text-dark/50 hover:text-primary hover:bg-[#EDE8DF]/60 rounded-md transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id, task.title)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredTasks.length === 0 && (
            <div className="text-center py-12 text-xs text-dark/40 italic">
              {language === 'EN' ? 'No tasks found in this overview.' : 'Geen taken gevonden in dit overzicht.'}
            </div>
          )}
        </div>
      </Card>

      {/* CREATE / EDIT TASK MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-dark/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-[#EDE8DF] border border-[#C4BEB3] rounded-2xl p-6 shadow-2xl z-10 space-y-4">
              <div className="flex items-center justify-between border-b border-cream-dark/60 pb-3">
                <h3 className="text-lg font-heading font-bold text-primary">
                  {selectedTask 
                    ? (language === 'EN' ? 'Edit Task' : 'Taak Bewerken') 
                    : (language === 'EN' ? 'Create New Task' : 'Nieuwe Taak Aanmaken')}
                </h3>
                <button onClick={() => setModalOpen(false)} className="p-1 text-dark/40 hover:text-dark"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-dark/60 mb-1 uppercase">
                    {language === 'EN' ? 'Task Description / Title' : 'Taak Omschrijving / Titel'}
                  </label>
                  <input type="text" required value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg" placeholder={language === 'EN' ? 'e.g. Call client for quote approval' : 'bijv. Bellen met klant voor offerte accoord'} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-dark/60 mb-1 uppercase">
                      {language === 'EN' ? 'Link Type' : 'Koppel Type'}
                    </label>
                    <select value={form.linkedType} onChange={e => setForm(prev => ({ ...prev, linkedType: e.target.value }))} className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg font-semibold">
                      <option value="Project">{language === 'EN' ? 'Project' : 'Oplever Project'}</option>
                      <option value="Lead">{language === 'EN' ? 'Lead' : 'Klant Lead'}</option>
                      <option value="None">{language === 'EN' ? 'No Link' : 'Geen Koppeling'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-dark/60 mb-1 uppercase">
                      {language === 'EN' ? 'Select Linked Item' : 'Selecteer Gekoppelde Item'}
                    </label>
                    {form.linkedType === 'Project' ? (
                      <select value={form.linkedId} onChange={e => setForm(prev => ({ ...prev, linkedId: e.target.value }))} className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg font-semibold">
                        {projectsList.map((p, idx) => (
                          <option key={idx} value={`${p.id} (${p.name})`}>{p.id} - {p.name}</option>
                        ))}
                      </select>
                    ) : form.linkedType === 'Lead' ? (
                      <select value={form.linkedId} onChange={e => setForm(prev => ({ ...prev, linkedId: e.target.value }))} className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg font-semibold">
                        {leadsList.map((l, idx) => (
                          <option key={idx} value={`${l.name} (${l.city || 'Lead'})`}>{l.name}</option>
                        ))}
                      </select>
                    ) : (
                      <input type="text" disabled value={language === 'EN' ? 'General Task' : 'Algemene Taak'} className="w-full px-3 py-2 bg-[#EDE8DF] text-dark/40 border border-[#D6CFC2] rounded-lg font-semibold" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-dark/60 mb-1 uppercase">
                      {language === 'EN' ? 'Priority' : 'Prioriteit'}
                    </label>
                    <select value={form.priority} onChange={e => setForm(prev => ({ ...prev, priority: e.target.value }))} className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg font-semibold">
                      <option value="High">🔴 {language === 'EN' ? 'High' : 'Hoog (High)'}</option>
                      <option value="Medium">🟡 {language === 'EN' ? 'Medium' : 'Gemiddeld (Medium)'}</option>
                      <option value="Low">🟢 {language === 'EN' ? 'Low' : 'Laag (Low)'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-dark/60 mb-1 uppercase">
                      {language === 'EN' ? 'Due Date' : 'Vervaldatum (Due Date)'}
                    </label>
                    <input type="date" value={form.dueDate} onChange={e => setForm(prev => ({ ...prev, dueDate: e.target.value }))} className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg font-semibold" />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-cream-dark/60">
                  <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>{t('common.cancel')}</Button>
                  <Button type="submit">{language === 'EN' ? 'Save' : 'Opslaan'}</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
