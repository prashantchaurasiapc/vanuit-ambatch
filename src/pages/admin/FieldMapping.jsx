import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Sliders, Plus, Trash2, Edit2, ArrowRight, CheckCircle, 
  Layers, Link2, RefreshCw, FileText, Wrench, Sparkles, 
  Search, Info, ArrowLeft, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DEFAULT_MAPPINGS = {
  buitenkeuken: [
    {
      id: 'map-01',
      sourceField: 'Werkblad Type & Afwerking',
      sourceType: 'Select',
      projectKey: 'quote.specifications.countertop',
      partnerCostSection: 'Material Cost (Hout & Grondstoffen)',
      isRequired: true,
      status: 'Active',
      description: 'Maps customer worktop choice directly into quote specs & partner material breakdown'
    },
    {
      id: 'map-02',
      sourceField: 'Houtsoort Onderstel',
      sourceType: 'Select',
      projectKey: 'project.woodType',
      partnerCostSection: 'Material Cost (Hout & Grondstoffen)',
      isRequired: true,
      status: 'Active',
      description: 'Maps wood selection (Thermo Fraké / Teak) into project specs and material cost'
    },
    {
      id: 'map-03',
      sourceField: 'Inbouw Kamado Cutout',
      sourceType: 'Select',
      projectKey: 'quote.specifications.kamadoCutout',
      partnerCostSection: 'Labour Cost (Arbeid & Ambacht)',
      isRequired: true,
      status: 'Active',
      description: 'Calculates custom CNC cutout labor for Kamado BGE / Bastard'
    },
    {
      id: 'map-04',
      sourceField: 'Inbouw RVS Spoelbak & Kraan',
      sourceType: 'Select',
      projectKey: 'quote.specifications.sinkPackage',
      partnerCostSection: 'Installation Cost (Montage & Plaatsing)',
      isRequired: false,
      status: 'Active',
      description: 'Routes plumbing & faucet setup to partner installation scope'
    }
  ],
  buitenverblijf: [
    {
      id: 'map-101',
      sourceField: 'Isolatie Type (Dak & Wand)',
      sourceType: 'Select',
      projectKey: 'quote.specifications.insulation',
      partnerCostSection: 'Material Cost (Hout & Grondstoffen)',
      isRequired: true,
      status: 'Active',
      description: 'Maps PIR / Mineral wool insulation rating to project specification'
    },
    {
      id: 'map-102',
      sourceField: 'Glaswand Optie',
      sourceType: 'Select',
      projectKey: 'quote.specifications.glassWalls',
      partnerCostSection: 'Installation Cost (Montage & Plaatsing)',
      isRequired: true,
      status: 'Active',
      description: 'Connects glass sliding doors option to project quote & partner installation cost'
    },
    {
      id: 'map-103',
      sourceField: 'Houtsoort Frame',
      sourceType: 'Select',
      projectKey: 'project.woodType',
      partnerCostSection: 'Material Cost (Hout & Grondstoffen)',
      isRequired: true,
      status: 'Active',
      description: 'Structural wood frame timber material mapping'
    },
    {
      id: 'map-104',
      sourceField: 'Elektra & Verlichting Pakket',
      sourceType: 'Select',
      projectKey: 'quote.specifications.electrical',
      partnerCostSection: 'Other Cost (Overige Kosten & Vergunning)',
      isRequired: false,
      status: 'Active',
      description: 'Maps LED spot lighting & socket count to electrical package'
    }
  ],
  overkapping: [
    {
      id: 'map-201',
      sourceField: 'Lamellendak Besturing',
      sourceType: 'Select',
      projectKey: 'quote.specifications.roofControl',
      partnerCostSection: 'Material Cost (Hout & Grondstoffen)',
      isRequired: true,
      status: 'Active',
      description: 'Somfy motor vs manual louver roof mechanism mapping'
    },
    {
      id: 'map-202',
      sourceField: 'Sneeuwbelasting Klasse',
      sourceType: 'Select',
      projectKey: 'project.loadRating',
      partnerCostSection: 'Labour Cost (Arbeid & Ambacht)',
      isRequired: true,
      status: 'Active',
      description: 'Structural load capacity engineering requirement'
    }
  ],
  poolhouse: [
    {
      id: 'map-301',
      sourceField: 'Techniekruimte Zwembad',
      sourceType: 'Select',
      projectKey: 'quote.specifications.pumpRoom',
      partnerCostSection: 'Installation Cost (Montage & Plaatsing)',
      isRequired: true,
      status: 'Active',
      description: 'Pool pump housing & utility room integration mapping'
    },
    {
      id: 'map-302',
      sourceField: 'Sauna Module Integratie',
      sourceType: 'Select',
      projectKey: 'quote.specifications.saunaModule',
      partnerCostSection: 'Material Cost (Hout & Grondstoffen)',
      isRequired: false,
      status: 'Active',
      description: 'Infrared / Finnish sauna cabin custom mapping'
    }
  ]
};

export default function FieldMapping() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [activeProductType, setActiveProductType] = useState('buitenkeuken');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [mappings, setMappings] = useState(() => {
    const saved = localStorage.getItem('app_field_mappings');
    return saved ? JSON.parse(saved) : DEFAULT_MAPPINGS;
  });

  const [newForm, setNewForm] = useState({
    sourceField: '',
    sourceType: 'Select',
    projectKey: '',
    partnerCostSection: 'Material Cost (Hout & Grondstoffen)',
    isRequired: true,
    description: ''
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleSaveMappings = (updated) => {
    setMappings(updated);
    localStorage.setItem('app_field_mappings', JSON.stringify(updated));
    window.dispatchEvent(new Event('app_data_changed'));
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newForm.sourceField.trim() || !newForm.projectKey.trim()) {
      showToast(language === 'EN' ? 'Please fill in required fields.' : 'Vul de verplichte velden in.');
      return;
    }

    const newMap = {
      id: `map-${Date.now()}`,
      sourceField: newForm.sourceField.trim(),
      sourceType: newForm.sourceType,
      projectKey: newForm.projectKey.trim(),
      partnerCostSection: newForm.partnerCostSection,
      isRequired: newForm.isRequired,
      status: 'Active',
      description: newForm.description.trim() || 'Custom field mapping'
    };

    const currentList = mappings[activeProductType] || [];
    const updated = {
      ...mappings,
      [activeProductType]: [newMap, ...currentList]
    };

    handleSaveMappings(updated);
    showToast(language === 'EN' ? 'New field mapping added successfully!' : 'Nieuwe veldenkoppeling succesvol toegevoegd!');
    setNewForm({
      sourceField: '',
      sourceType: 'Select',
      projectKey: '',
      partnerCostSection: 'Material Cost (Hout & Grondstoffen)',
      isRequired: true,
      description: ''
    });
    setIsAddModalOpen(false);
  };

  const handleDelete = (id) => {
    const currentList = mappings[activeProductType] || [];
    const updated = {
      ...mappings,
      [activeProductType]: currentList.filter(m => m.id !== id)
    };
    handleSaveMappings(updated);
    showToast(language === 'EN' ? 'Field mapping deleted.' : 'Veldenkoppeling verwijderd.');
  };

  const activeList = (mappings[activeProductType] || []).filter(m => 
    m.sourceField.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.projectKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.partnerCostSection.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-body text-[#4A4A43] relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, x: 80 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: 80 }} 
            className="fixed top-20 right-4 z-[9999] flex items-center gap-2 bg-[#33422C] text-white px-4 py-3 rounded-xl shadow-lg border border-white/20 text-xs"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-[#D6CFC2] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#F4F1EA] rounded-xl text-primary">
              <Sliders className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-primary">
              {language === 'EN' ? 'Field Mapping (Veldenkoppeling)' : 'Veldenkoppeling (Field Mapping)'}
            </h2>
            <Badge variant="success" className="text-[10px] uppercase tracking-wider font-mono">
              PRD 4.12 Mappings
            </Badge>
          </div>
          <p className="text-xs text-dark/60 mt-1 font-body">
            {language === 'EN' 
              ? 'Configure data mapping rules connecting Customer Intake forms, Project Schemas, Quotes & Partner Cost breakdowns.'
              : 'Beheer de gegevenskoppelingen tussen intake-formulieren, project-attributen, offertes en partner-prijsopbouw.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/projects')}
            className="text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            {language === 'EN' ? 'Back to Projects' : 'Terug naar Projecten'}
          </Button>

          <Button 
            icon={Plus} 
            onClick={() => setIsAddModalOpen(true)}
            className="text-xs bg-[#33422C] text-white hover:bg-[#273421]"
          >
            {language === 'EN' ? 'Add Mapping' : 'Koppeling Toevoegen'}
          </Button>
        </div>
      </div>

      {/* Product Type Tabs */}
      <div className="flex gap-2 border-b border-[#D6CFC2] pb-2 overflow-x-auto no-scrollbar">
        {[
          { key: 'buitenkeuken', labelEN: 'Outdoor Kitchen Project', labelNL: 'Project Buitenkeuken', icon: '🔥' },
          { key: 'buitenverblijf', labelEN: 'Garden Room Project', labelNL: 'Project Buitenverblijf', icon: '🏡' },
          { key: 'overkapping', labelEN: 'Canopy Project', labelNL: 'Project Overkapping', icon: '☂️' },
          { key: 'poolhouse', labelEN: 'Poolhouse Project', labelNL: 'Project Poolhouse', icon: '🏊' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveProductType(tab.key)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold font-body transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeProductType === tab.key 
                ? 'bg-[#33422C] text-white shadow-sm' 
                : 'bg-white text-dark/70 hover:bg-[#EDE8DF] border border-[#D6CFC2]/60'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{language === 'EN' ? tab.labelEN : tab.labelNL}</span>
            <span className="text-[10px] font-mono opacity-80 bg-white/20 px-1.5 py-0.2 rounded-full">
              {(mappings[tab.key] || []).length}
            </span>
          </button>
        ))}
      </div>

      {/* Search & Info Banner */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-8 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-dark/40" />
          <input
            type="text"
            placeholder={language === 'EN' ? 'Search field mappings by source, target key or partner section...' : 'Zoek veldenkoppeling op bron, doel-key of partner-sectie...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#D6CFC2] rounded-xl text-xs font-body focus:outline-none focus:ring-2 focus:ring-primary/20 text-[#4A4A43]"
          />
        </div>

        <div className="md:col-span-4 bg-[#F4F1EA] p-2.5 rounded-xl border border-[#D6CFC2]/70 flex items-center gap-2 text-xs text-primary font-body">
          <Info className="w-4 h-4 flex-shrink-0 text-[#33422C]" />
          <span>
            {language === 'EN' 
              ? 'Changes instantly apply to new project creations & quote calculations.' 
              : 'Wijzigingen worden direct doorgevoerd in offertes en projecten.'}
          </span>
        </div>
      </div>

      {/* Visual Field Mapping Cards */}
      <div className="space-y-3">
        {activeList.length === 0 ? (
          <Card p="p-8 text-center">
            <Sliders className="w-8 h-8 text-dark/30 mx-auto mb-2" />
            <p className="font-bold text-dark text-sm">
              {language === 'EN' ? 'No field mappings found' : 'Geen veldenkoppelingen gevonden'}
            </p>
            <p className="text-xs text-dark/50 mt-1">
              {language === 'EN' ? 'Try adjusting your search query or add a new field mapping.' : 'Pas uw zoekopdracht aan of voeg een nieuwe koppeling toe.'}
            </p>
          </Card>
        ) : (
          activeList.map((item) => (
            <div 
              key={item.id} 
              className="bg-white border border-[#D6CFC2] rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all space-y-3"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                {/* Flow Step 1: Customer Intake Field */}
                <div className="flex-1 bg-[#FAF8F5] p-3 rounded-xl border border-[#D6CFC2]/70">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold text-dark/50 uppercase tracking-wider">
                      {language === 'EN' ? 'Intake Form Field' : 'Intake Formulierveld'}
                    </span>
                    <span className="px-1.5 py-0.2 bg-[#EDE8DF] text-primary font-mono text-[10px] font-bold rounded-md">
                      {item.sourceType}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-primary font-heading flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                    <span>{item.sourceField}</span>
                  </h4>
                </div>

                {/* Arrow Connector 1 */}
                <div className="hidden lg:flex items-center justify-center text-primary/40">
                  <ArrowRight className="w-5 h-5" />
                </div>

                {/* Flow Step 2: System Project Model Key */}
                <div className="flex-1 bg-[#FAF8F5] p-3 rounded-xl border border-[#D6CFC2]/70">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold text-dark/50 uppercase tracking-wider">
                      {language === 'EN' ? 'Project / Quote Schema' : 'Project / Offerte Schema'}
                    </span>
                    <Badge variant={item.isRequired ? 'primary' : 'secondary'} className="text-[9px]">
                      {item.isRequired ? (language === 'EN' ? 'Mandatory' : 'Verplicht') : (language === 'EN' ? 'Optional' : 'Optioneel')}
                    </Badge>
                  </div>
                  <h4 className="font-mono font-bold text-xs text-emerald-800 flex items-center gap-1.5 truncate">
                    <Link2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                    <span>{item.projectKey}</span>
                  </h4>
                </div>

                {/* Arrow Connector 2 */}
                <div className="hidden lg:flex items-center justify-center text-primary/40">
                  <ArrowRight className="w-5 h-5" />
                </div>

                {/* Flow Step 3: Partner Cost Breakdown Section */}
                <div className="flex-1 bg-[#FAF8F5] p-3 rounded-xl border border-[#D6CFC2]/70">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold text-dark/50 uppercase tracking-wider">
                      {language === 'EN' ? 'Partner Cost Section' : 'Partner Kostensectie'}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3" /> Mapped
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-primary font-body flex items-center gap-1.5 truncate">
                    <Wrench className="w-4 h-4 text-amber-700 flex-shrink-0" />
                    <span>{item.partnerCostSection}</span>
                  </h4>
                </div>

                {/* Action Delete */}
                <div className="flex items-center justify-end pl-2">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    title={language === 'EN' ? 'Delete mapping' : 'Verwijder koppeling'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {item.description && (
                <div className="text-[11px] text-dark/60 font-body pt-1.5 border-t border-[#D6CFC2]/40 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <span>{item.description}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add New Field Mapping Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-[#D6CFC2] shadow-2xl max-w-lg w-full p-6 space-y-4 font-body"
          >
            <div className="flex items-center justify-between border-b border-[#D6CFC2] pb-3">
              <h3 className="font-heading font-bold text-primary text-lg flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#33422C]" />
                {language === 'EN' ? 'Add Field Mapping' : 'Veldenkoppeling Toevoegen'}
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-dark/40 hover:text-dark font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-primary mb-1 uppercase text-[10px]">
                  {language === 'EN' ? 'Source Intake Field Name *' : 'Bron Intake Veldnaam *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Werkblad Type & Afwerking"
                  value={newForm.sourceField}
                  onChange={e => setNewForm({ ...newForm, sourceField: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-[#4A4A43]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-primary mb-1 uppercase text-[10px]">
                    {language === 'EN' ? 'Field Input Type' : 'Veld Invoertype'}
                  </label>
                  <select
                    value={newForm.sourceType}
                    onChange={e => setNewForm({ ...newForm, sourceType: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-xl text-xs text-[#4A4A43]"
                  >
                    <option value="Select">Dropdown Select</option>
                    <option value="Text">Text Input</option>
                    <option value="Number">Number / Currency</option>
                    <option value="Checkbox">Multi-Choice Checkbox</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-primary mb-1 uppercase text-[10px]">
                    {language === 'EN' ? 'Required Status' : 'Verplicht Status'}
                  </label>
                  <select
                    value={newForm.isRequired ? 'true' : 'false'}
                    onChange={e => setNewForm({ ...newForm, isRequired: e.target.value === 'true' })}
                    className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-xl text-xs text-[#4A4A43]"
                  >
                    <option value="true">{language === 'EN' ? 'Mandatory (Verplicht)' : 'Verplicht'}</option>
                    <option value="false">{language === 'EN' ? 'Optional (Optioneel)' : 'Optioneel'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-primary mb-1 uppercase text-[10px]">
                  {language === 'EN' ? 'Target System Property Key *' : 'Doel Systeem Property Key *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. quote.specifications.worktop"
                  value={newForm.projectKey}
                  onChange={e => setNewForm({ ...newForm, projectKey: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-xl font-mono text-xs text-[#4A4A43]"
                />
              </div>

              <div>
                <label className="block font-bold text-primary mb-1 uppercase text-[10px]">
                  {language === 'EN' ? 'Target Partner Cost Section' : 'Doel Partner Kostensectie'}
                </label>
                <select
                  value={newForm.partnerCostSection}
                  onChange={e => setNewForm({ ...newForm, partnerCostSection: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-xl text-xs text-[#4A4A43]"
                >
                  <option value="Material Cost (Hout & Grondstoffen)">Material Cost (Hout & Grondstoffen)</option>
                  <option value="Labour Cost (Arbeid & Ambacht)">Labour Cost (Arbeid & Ambacht)</option>
                  <option value="Transport Cost (Transport & Logistiek)">Transport Cost (Transport & Logistiek)</option>
                  <option value="Installation Cost (Montage & Plaatsing)">Installation Cost (Montage & Plaatsing)</option>
                  <option value="Other Cost (Overige Kosten & Vergunning)">Other Cost (Overige Kosten & Vergunning)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-primary mb-1 uppercase text-[10px]">
                  {language === 'EN' ? 'Mapping Description' : 'Koppeling Omschrijving'}
                </label>
                <input
                  type="text"
                  placeholder="Brief summary of how this field is mapped"
                  value={newForm.description}
                  onChange={e => setNewForm({ ...newForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#D6CFC2] rounded-xl text-xs text-[#4A4A43]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#D6CFC2]">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddModalOpen(false)}
                >
                  {language === 'EN' ? 'Cancel' : 'Annuleren'}
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#33422C] text-white hover:bg-[#273421]"
                >
                  {language === 'EN' ? 'Save Field Mapping' : 'Koppeling Opslaan'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
