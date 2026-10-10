/**
 * pipelineMigration.js
 *
 * Safe LocalStorage Candidate Migration Utility for Vanuit Ambacht
 *
 * Requirements:
 * 1. Never removes `app_pipeline_candidates` or sets `pipeline_candidates_migrated = 'true'`
 *    if the network is unavailable or any candidate fails to migrate due to network/server errors.
 * 2. Preserves timestamped backups before attempting any migration.
 * 3. Distinguishes duplicate/validation conflicts from network/server errors.
 * 4. Supports safe retries without duplicating candidates (backed by backend duplicate checks).
 * 5. Handles partially completed migrations by preserving only remaining candidates.
 * 6. Never deletes any backup automatically.
 */

import api from '../api/apiClient.js';

export const STAGE_MAP = {
  'Geïnteresseerd': 'interested',
  'Interested': 'interested',
  'In gesprek': 'in_discussion',
  'In Discussion': 'in_discussion',
  'Proefproject': 'trial_project',
  'Trial Project': 'trial_project',
  'Actief': 'active',
  'Active': 'active',
  'Afgewezen': 'rejected',
  'Rejected': 'rejected',
};

/**
 * Checks whether the browser is currently online
 */
export function isBrowserOnline() {
  if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
    return navigator.onLine;
  }
  return true;
}

/**
 * Migrates local pipeline candidates to the backend PostgreSQL database safely.
 *
 * @param {Object} options
 * @param {Object} [options.apiClient] - API client instance (defaults to ../api/apiClient)
 * @param {Storage} [options.storage] - Storage interface (defaults to localStorage)
 * @param {Function} [options.isOnline] - Online status detector
 * @returns {Promise<Object>} Migration report object
 */
export async function migratePipelineCandidates(options = {}) {
  const apiClient = options.apiClient || api;
  const storage = options.storage || (typeof window !== 'undefined' ? window.localStorage : null);
  const isOnline = options.isOnline || isBrowserOnline;

  if (!storage) {
    return { status: 'none', count: 0 };
  }

  const rawStored = storage.getItem('app_pipeline_candidates');
  if (!rawStored) {
    return { status: 'none', count: 0 };
  }

  let candidates = [];
  try {
    candidates = JSON.parse(rawStored);
  } catch (parseErr) {
    console.error('[PipelineMigration] Corrupted JSON in app_pipeline_candidates:', parseErr);
    // Preserve corrupted data in a timestamped backup before clearing
    const corruptBackupKey = `backup_pipeline_candidates_corrupt_${Date.now()}`;
    storage.setItem(corruptBackupKey, rawStored);
    storage.removeItem('app_pipeline_candidates');
    return {
      status: 'corrupt',
      error: parseErr.message,
      backupKey: corruptBackupKey,
    };
  }

  if (!Array.isArray(candidates) || candidates.length === 0) {
    storage.removeItem('app_pipeline_candidates');
    return { status: 'none', count: 0 };
  }

  // Check network connectivity before attempting migration
  if (!isOnline()) {
    console.warn('[PipelineMigration] Network is offline. Migration postponed to protect local data.');
    return {
      status: 'offline',
      message: 'Network is offline. Migration postponed.',
      totalCount: candidates.length,
      remainingCount: candidates.length,
    };
  }

  // Step 1: Create a safe timestamped backup BEFORE doing anything
  const backupKey = `backup_pipeline_candidates_${Date.now()}`;
  storage.setItem(backupKey, rawStored);
  console.log(`[PipelineMigration] Safely backed up ${candidates.length} candidate(s) to ${backupKey}`);

  let migratedCount = 0;
  let duplicateCount = 0;
  let validationErrorCount = 0;
  let networkErrorCount = 0;
  const remainingCandidates = [];
  const errors = [];

  // Step 2: Attempt to migrate candidates one by one
  for (const item of candidates) {
    if (!item.name || !item.name.trim()) {
      continue;
    }

    const candidateEmail = item.email && item.email.trim()
      ? item.email.trim().toLowerCase()
      : `kandidaat_${Date.now()}_${Math.floor(Math.random() * 1000)}@ambacht-kandidaat.nl`;

    const payload = {
      name: item.name.trim(),
      companyName: item.company?.trim() || item.name.trim(),
      email: candidateEmail,
      phone: item.phone?.trim() || '+31 6 00000000',
      region: item.region?.trim() || 'Nederland',
      stage: STAGE_MAP[item.stage] || 'interested',
      notes: item.notes?.trim() || undefined,
    };

    try {
      const res = await apiClient.post('/partner-candidates', payload);

      if (res && res.success) {
        migratedCount++;
      } else if (res && !res.success) {
        const errCode = res.error?.code;
        const errMsg = res.error?.message || '';

        // Check if candidate already exists in backend
        if (
          errCode === 'DUPLICATE_CANDIDATE' ||
          errCode === 'DUPLICATE_CODE' ||
          errCode === 'CONFLICT' ||
          errMsg.toLowerCase().includes('already exists') ||
          errMsg.toLowerCase().includes('duplicate')
        ) {
          duplicateCount++;
          console.log(`[PipelineMigration] Candidate ${candidateEmail} already exists in DB. Marked as resolved.`);
        } else if (
          errCode === 'VALIDATION_ERROR' ||
          errCode === 'VALIDATION_FAILED' ||
          errCode === 'BAD_REQUEST' ||
          errCode === 'INVALID_PAYLOAD'
        ) {
          // Client data validation error (400)
          validationErrorCount++;
          errors.push({ candidate: item.name, error: errMsg, isNetwork: false });
          remainingCandidates.push(item);
        } else {
          // Server error (500, 502, 503, 404, PARSE_ERROR, etc.)
          networkErrorCount++;
          errors.push({ candidate: item.name, error: errMsg || 'Server error', isNetwork: true });
          remainingCandidates.push(item);
        }
      } else {
        // Unexpected empty response
        networkErrorCount++;
        errors.push({ candidate: item.name, error: 'Invalid response from server', isNetwork: true });
        remainingCandidates.push(item);
      }
    } catch (networkErr) {
      // Network failure, fetch aborted, connection refused, or timeout
      networkErrorCount++;
      errors.push({
        candidate: item.name,
        error: networkErr?.message || 'Network request failed',
        isNetwork: true,
      });
      remainingCandidates.push(item);
    }
  }

  const total = candidates.length;

  // Step 3: Handle partial/complete network failures
  if (networkErrorCount > 0) {
    // CRITICAL REQUIREMENT 1: Never remove app_pipeline_candidates and never mark migrated
    // Keep remaining candidates in localStorage so retry only processes unmigrated items
    storage.setItem('app_pipeline_candidates', JSON.stringify(remainingCandidates));

    return {
      status: migratedCount > 0 || duplicateCount > 0 ? 'partial' : 'failed',
      totalCount: total,
      migratedCount,
      duplicateCount,
      remainingCount: remainingCandidates.length,
      networkErrorCount,
      validationErrorCount,
      errors,
      backupKey,
    };
  }

  // If there were validation errors on some candidates but no network errors
  if (validationErrorCount > 0 && remainingCandidates.length > 0) {
    storage.setItem('app_pipeline_candidates', JSON.stringify(remainingCandidates));
    return {
      status: 'partial',
      totalCount: total,
      migratedCount,
      duplicateCount,
      remainingCount: remainingCandidates.length,
      validationErrorCount,
      errors,
      backupKey,
    };
  }

  // Step 4: Complete success — all candidates either newly created or confirmed existing
  storage.removeItem('app_pipeline_candidates');
  storage.setItem('pipeline_candidates_migrated', 'true');
  storage.setItem('pipeline_candidates_migrated_at', new Date().toISOString());

  return {
    status: 'success',
    totalCount: total,
    migratedCount,
    duplicateCount,
    remainingCount: 0,
    backupKey,
  };
}
