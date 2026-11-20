import api from '../api/apiClient.js';

// Centralized Dynamic Configuration Manager for Vanuit Ambacht
// Allows administrators to configure Categories, Wood Types, Materials/Countertops, and Options
// dynamically through Settings without developer intervention, with fallback to Dutch standards.

const STORAGE_KEY = 'va_product_configuration_v2';

const TEST_CATEGORY_NAMES = ['aaaa', 'test categorie', 'tim test', 'abc', 'test'];

export function sanitizeCategories(categories) {
  if (!Array.isArray(categories)) return [];
  return categories.filter(c => {
    const name = (c?.name || '').trim().toLowerCase();
    return !TEST_CATEGORY_NAMES.includes(name);
  });
}

export const DEFAULT_PRODUCT_CONFIG = {
  categories: [
    { id: 'cat-bk', name: 'Buitenkeukens', icon: '🍳', status: 'Actief', description: 'Ambachtelijke maatwerk buitenkeukens' },
    { id: 'cat-bv', name: 'Buitenverblijven', icon: '🏡', status: 'Actief', description: 'Poolhouse, Tuinkamer, Tuinhuis' },
    { id: 'cat-ov', name: 'Overkappingen', icon: '☂️', status: 'Actief', description: 'Veranda, Vrijstaande overkapping, Pergola' },
    { id: 'cat-kliko', name: 'Kliko-ombouw', icon: '🗑️', status: 'Inactief', description: 'Archived: not selectable for new leads or quotes' }
  ],
  woodTypes: [],
  materials: [],
  options: []
};

// Safely load configuration from localStorage or initialize with empty defaults
export function getProductConfig() {
  if (typeof window === 'undefined') return DEFAULT_PRODUCT_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCT_CONFIG));
      return DEFAULT_PRODUCT_CONFIG;
    }
    const parsed = JSON.parse(raw);
    const cleanedCats = sanitizeCategories(Array.isArray(parsed.categories) ? parsed.categories : []);
    return {
      categories: cleanedCats.length > 0 ? cleanedCats : DEFAULT_PRODUCT_CONFIG.categories,
      woodTypes: Array.isArray(parsed.woodTypes) ? parsed.woodTypes : [],
      materials: Array.isArray(parsed.materials) ? parsed.materials : [],
      options: Array.isArray(parsed.options) ? parsed.options : []
    };
  } catch (err) {
    console.warn('Failed to parse product configuration, using defaults:', err);
    return DEFAULT_PRODUCT_CONFIG;
  }
}

// Reload configuration from PostgreSQL backend database
export async function reloadProductConfigFromBackend() {
  if (typeof window === 'undefined') return DEFAULT_PRODUCT_CONFIG;
  try {
    const res = await api.get('/settings/company');
    if (res && res.success && res.data?.categoriesConfig) {
      const cfg = res.data.categoriesConfig;
      const isArray = Array.isArray(cfg);
      const rawCats = isArray ? cfg : (Array.isArray(cfg?.categories) ? cfg.categories : []);
      const cleanedCats = sanitizeCategories(rawCats);
      const merged = {
        categories: cleanedCats.length > 0 ? cleanedCats : DEFAULT_PRODUCT_CONFIG.categories,
        woodTypes: Array.isArray(cfg?.woodTypes) ? cfg.woodTypes : [],
        materials: Array.isArray(cfg?.materials) ? cfg.materials : [],
        options: Array.isArray(cfg?.options) ? cfg.options : [],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      window.dispatchEvent(new CustomEvent('app_product_config_changed', { detail: merged }));
      window.dispatchEvent(new Event('app_data_changed'));
      return merged;
    }
  } catch (err) {
    console.warn('[productConfigManager] Could not load shared config from backend, using local:', err);
  }
  return getProductConfig();
}

// Persist updated configuration and notify other listeners and PostgreSQL backend
export async function saveProductConfig(newConfig) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    window.dispatchEvent(new CustomEvent('app_product_config_changed', { detail: newConfig }));
    window.dispatchEvent(new Event('app_data_changed'));

    // Persist complete config to central PostgreSQL backend so all logged-in users share identical configs
    api.patch('/settings/config/categories', newConfig).catch((apiErr) => {
      console.warn('[productConfigManager] Background backend sync failed:', apiErr);
    });
  } catch (err) {
    console.error('Failed to save product configuration:', err);
  }
}

// Multi-user synchronization: Auto-hydrate on startup, background poll every 25s, and sync on tab focus
if (typeof window !== 'undefined') {
  setTimeout(() => {
    reloadProductConfigFromBackend();
  }, 200);

  // Background poll for multi-user sync
  setInterval(() => {
    reloadProductConfigFromBackend();
  }, 25000);

  // Sync immediately when switching back to tab
  window.addEventListener('focus', () => {
    reloadProductConfigFromBackend();
  });
}

// Get Active Categories
export function getActiveCategories() {
  const config = getProductConfig();
  return (config.categories || []).filter(c => c.status !== 'Inactief');
}

// Get Active Wood Types
export function getActiveWoodTypes() {
  const config = getProductConfig();
  return (config.woodTypes || []).filter(w => w.status !== 'Inactief');
}

// Get Active Materials
export function getActiveMaterials() {
  const config = getProductConfig();
  return (config.materials || []).filter(m => m.status !== 'Inactief');
}

// Get Active Options
export function getActiveOptions() {
  const config = getProductConfig();
  return (config.options || []).filter(o => o.status !== 'Inactief');
}

// Helper to convert dynamic wood types to WOOD_LIBRARY format expected by QuoteEditor & PDF
export function getWoodLibraryForSchema(language = 'NL') {
  const woodTypes = getActiveWoodTypes();
  return woodTypes.map(w => ({
    id: w.id,
    name: w.name,
    lifespan: language === 'EN' ? (w.lifespanEn || w.lifespan) : w.lifespan,
    infoboxTitle: language === 'EN' ? `About ${w.nameEn || w.name}` : `Over ${w.name}`,
    infoboxText: language === 'EN' ? (w.descriptionEn || w.description) : w.description
  }));
}

