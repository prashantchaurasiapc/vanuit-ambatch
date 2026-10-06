import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import { User, Mail, Phone, Lock, Save, Camera, CheckCircle, Globe } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [toastMsg, setToastMsg] = useState('');
  
  const [personalInfo, setPersonalInfo] = useState({
    name: user?.name || 'Admin User',
    email: user?.role === 'admin' ? 'admin@vanuitambacht.nl' : 'partner@vanuitambacht.nl',
    phone: '+31 6 98765432',
    language: 'English',
    timezone: 'Europe/Amsterdam'
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [avatar, setAvatar] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleInfoChange = (key, value) => {
    setPersonalInfo(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveInfo = (e) => {
    e.preventDefault();
    showToast(language === 'EN' ? 'Profile information updated successfully!' : 'Profielgegevens succesvol bijgewerkt!');
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert(language === 'EN' ? "New passwords do not match!" : "Nieuwe wachtwoorden komen niet overeen!");
      return;
    }
    showToast(language === 'EN' ? 'Password updated successfully!' : 'Wachtwoord succesvol bijgewerkt!');
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(URL.createObjectURL(file));
      showToast(language === 'EN' ? 'Avatar updated successfully!' : 'Profielfoto succesvol bijgewerkt!');
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 80 }}
            className="fixed top-20 right-4 z-[9999] flex items-center gap-2 bg-primary text-cream px-4 py-3 rounded-xl shadow-lg border border-[#D6CFC2]/20 font-body text-xs"
          >
            <CheckCircle className="w-4 h-4 text-green-400" />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <h2 className="text-2xl font-heading font-bold text-primary">
          {language === 'EN' ? 'My Profile' : 'Mijn Profiel'}
        </h2>
        <p className="text-dark/50 text-sm font-body">
          {language === 'EN' ? 'Manage your profile details and security settings.' : 'Beheer uw profielgegevens en beveiligingsinstellingen.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Overview */}
        <div className="space-y-6">
          <Card className="text-center py-8">
            <div className="relative w-28 h-28 mx-auto mb-4">
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-full h-full rounded-full object-cover border-4 border-cream-dark" />
              ) : (
                <div className="w-full h-full rounded-full bg-accent text-[#F2EDE4] flex items-center justify-center text-4xl font-bold font-body">
                  {personalInfo.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
              )}
              <label className="absolute bottom-0 right-0 p-2 bg-primary text-[#F2EDE4] rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-md">
                <Camera className="w-4 h-4" />
                <input type="file" onChange={handleAvatarChange} accept="image/*" className="hidden" />
              </label>
            </div>
            <h3 className="font-heading font-bold text-lg text-dark">{personalInfo.name}</h3>
            <p className="text-xs text-dark/50 capitalize font-body font-medium">{user?.role} {language === 'EN' ? 'Portal' : 'Portaal'}</p>
            
            <div className="mt-6 pt-6 border-t border-cream-dark/60 text-left space-y-4 px-2">
              <div className="flex items-center gap-3 text-xs text-dark/70 font-body">
                <Mail className="w-4 h-4 text-accent flex-shrink-0" />
                <span className="truncate">{personalInfo.email}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-dark/70 font-body">
                <Phone className="w-4 h-4 text-accent flex-shrink-0" />
                <span>{personalInfo.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-dark/70 font-body">
                <Globe className="w-4 h-4 text-accent flex-shrink-0" />
                <span>{personalInfo.language} ({personalInfo.timezone})</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Edit Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <Card title={language === 'EN' ? 'Personal Information' : 'Persoonlijke Gegevens'} action={<div className="p-2 rounded-lg" style={{background:'color-mix(in srgb, var(--primary-color) 15%, transparent)'}}><User className="w-4 h-4 text-primary" /></div>}>
            <form onSubmit={handleSaveInfo} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-dark/60 mb-1.5 font-body uppercase tracking-wider">
                    {language === 'EN' ? 'Full Name' : 'Volledige Naam'}
                  </label>
                  <input
                    type="text"
                    value={personalInfo.name}
                    onChange={(e) => handleInfoChange('name', e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[#EDE8DF] border border-[#D6CFC2] rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/20 text-[#4A4A43]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark/60 mb-1.5 font-body uppercase tracking-wider">
                    {language === 'EN' ? 'Email Address' : 'E-mailadres'}
                  </label>
                  <input
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => handleInfoChange('email', e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[#EDE8DF] border border-[#D6CFC2] rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/20 text-[#4A4A43]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark/60 mb-1.5 font-body uppercase tracking-wider">
                    {language === 'EN' ? 'Phone Number' : 'Telefoonnummer'}
                  </label>
                  <input
                    type="text"
                    value={personalInfo.phone}
                    onChange={(e) => handleInfoChange('phone', e.target.value)}
                    className="w-full px-3 py-2 bg-[#EDE8DF] border border-[#D6CFC2] rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/20 text-[#4A4A43]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark/60 mb-1.5 font-body uppercase tracking-wider">
                    {language === 'EN' ? 'Language' : 'Taal'}
                  </label>
                  <select
                    value={personalInfo.language}
                    onChange={(e) => handleInfoChange('language', e.target.value)}
                    className="w-full px-3 py-2 bg-[#EDE8DF] border border-[#D6CFC2] rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/20 text-[#4A4A43]"
                  >
                    <option value="English">English</option>
                    <option value="Dutch">Nederlands (Dutch)</option>
                    <option value="German">German</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end pt-2">
                <Button icon={Save} type="submit">
                  {language === 'EN' ? 'Save changes' : 'Wijzigingen Opslaan'}
                </Button>
              </div>
            </form>
          </Card>

          {/* Change Password */}
          <Card title={language === 'EN' ? 'Security & Password' : 'Beveiliging & Wachtwoord'} action={<div className="p-2 rounded-lg" style={{background:'color-mix(in srgb, var(--primary-color) 15%, transparent)'}}><Lock className="w-4 h-4 text-primary" /></div>}>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-dark/60 mb-1.5 font-body uppercase tracking-wider">
                    {language === 'EN' ? 'Current Password' : 'Huidig Wachtwoord'}
                  </label>
                  <input
                    type="password"
                    value={passwords.current}
                    onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                    required
                    className="w-full px-3 py-2 bg-[#EDE8DF] border border-[#D6CFC2] rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/20 text-[#4A4A43]"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-dark/60 mb-1.5 font-body uppercase tracking-wider">
                      {language === 'EN' ? 'New Password' : 'Nieuw Wachtwoord'}
                    </label>
                    <input
                      type="password"
                      value={passwords.new}
                      onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                      required
                      className="w-full px-3 py-2 bg-[#EDE8DF] border border-[#D6CFC2] rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/20 text-[#4A4A43]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-dark/60 mb-1.5 font-body uppercase tracking-wider">
                      {language === 'EN' ? 'Confirm New Password' : 'Bevestig Nieuw Wachtwoord'}
                    </label>
                    <input
                      type="password"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                      required
                      className="w-full px-3 py-2 bg-[#EDE8DF] border border-[#D6CFC2] rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/20 text-[#4A4A43]"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-2">
                <Button icon={Lock} type="submit">
                  {language === 'EN' ? 'Update password' : 'Wachtwoord Bijwerken'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
