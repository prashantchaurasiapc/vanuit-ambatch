import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import { User, Mail, Phone, Lock, Save, Camera, CheckCircle, Globe, Loader2 } from 'lucide-react';
import api from '../api/apiClient';

export default function Profile() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [toastMsg, setToastMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  const [personalInfo, setPersonalInfo] = useState({
    name: user?.name || 'User',
    email: user?.email || (user?.role === 'admin' ? 'admin@vanuitambacht.nl' : 'partner@vanuitambacht.nl'),
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

  // Load real profile from backend
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.get('/users/profile').then(res => {
      if (isMounted && res.success && res.data) {
        setPersonalInfo({
          name: res.data.fullName || user?.name || 'User',
          email: res.data.email || user?.email || '',
          phone: res.data.phone || '+31 6 98765432',
          language: res.data.language || 'English',
          timezone: res.data.timezone || 'Europe/Amsterdam'
        });
        if (res.data.avatarUrl) {
          setAvatar(res.data.avatarUrl);
        }
      }
    }).catch(err => {
      console.warn('Failed to load profile:', err);
    }).finally(() => {
      if (isMounted) setLoading(false);
    });

    return () => { isMounted = false; };
  }, [user]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleInfoChange = (key, value) => {
    setPersonalInfo(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setSavingInfo(true);
    try {
      const res = await api.patch('/users/profile', {
        fullName: personalInfo.name,
        phone: personalInfo.phone,
        language: personalInfo.language,
        timezone: personalInfo.timezone
      });
      if (res.success) {
        showToast(language === 'EN' ? '✓ Profile information saved to database!' : '✓ Profielgegevens succesvol opgeslagen in database!');
      } else {
        showToast(`⚠ ${res.error?.message || 'Failed to update profile'}`);
      }
    } catch (err) {
      showToast('⚠ Failed to save profile to backend');
    } finally {
      setSavingInfo(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert(language === 'EN' ? "New passwords do not match!" : "Nieuwe wachtwoorden komen niet overeen!");
      return;
    }
    if (passwords.new.length < 6) {
      alert(language === 'EN' ? "New password must be at least 6 characters long!" : "Nieuw wachtwoord moet minimaal 6 tekens lang zijn!");
      return;
    }

    setSavingPwd(true);
    try {
      const res = await api.patch('/users/profile/password', {
        currentPassword: passwords.current,
        newPassword: passwords.new
      });
      if (res.success) {
        showToast(language === 'EN' ? '✓ Password updated successfully!' : '✓ Wachtwoord succesvol bijgewerkt!');
        setPasswords({ current: '', new: '', confirm: '' });
      } else {
        alert(`⚠ ${res.error?.message || 'Password update failed'}`);
      }
    } catch (err) {
      alert('⚠ Failed to update password');
    } finally {
      setSavingPwd(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setUploadingAvatar(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const fullBase64 = reader.result;
        const rawBase64 = typeof fullBase64 === 'string' && fullBase64.includes(',')
          ? fullBase64.split(',')[1]
          : fullBase64;

        const res = await api.post('/users/profile/avatar', {
          fileBase64: rawBase64,
          fileName: file.name,
          mimeType: file.type || 'image/jpeg'
        });

        if (res.success && res.data?.avatarUrl) {
          setAvatar(res.data.avatarUrl);
          showToast(language === 'EN' ? '✓ Avatar uploaded and saved!' : '✓ Profielfoto geüpload en opgeslagen!');
        } else {
          showToast(`⚠ ${res.error?.message || 'Avatar upload failed'}`);
        }
      } catch (err) {
        showToast('⚠ Avatar upload error');
      } finally {
        setUploadingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
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
                    disabled
                    title="Email is managed via system administrator"
                    className="w-full px-3 py-2 bg-[#E2DCD1] border border-[#D6CFC2] rounded-lg text-sm font-body opacity-75 cursor-not-allowed text-[#4A4A43]"
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
                <Button icon={Save} type="submit" disabled={savingInfo}>
                  {savingInfo 
                    ? (language === 'EN' ? 'Saving...' : 'Opslaan...')
                    : (language === 'EN' ? 'Save changes' : 'Wijzigingen Opslaan')}
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
                <Button icon={Lock} type="submit" disabled={savingPwd}>
                  {savingPwd
                    ? (language === 'EN' ? 'Updating...' : 'Bijwerken...')
                    : (language === 'EN' ? 'Update password' : 'Wachtwoord Bijwerken')}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
