import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { migratePipelineCandidates, STAGE_MAP } from './pipelineMigration.js';

// In-memory mock storage implementation conforming to Web Storage API
function createMockStorage(initial = {}) {
  const store = new Map(Object.entries(initial));
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => { store.set(key, String(value)); },
    removeItem: (key) => { store.delete(key); },
    clear: () => { store.clear(); },
    dump: () => Object.fromEntries(store.entries()),
  };
}

describe('pipelineMigration tests', () => {
  test('Stage mapping translates all Dutch pipeline stages to backend enums', () => {
    assert.equal(STAGE_MAP['Geïnteresseerd'], 'interested');
    assert.equal(STAGE_MAP['In gesprek'], 'in_discussion');
    assert.equal(STAGE_MAP['Proefproject'], 'trial_project');
    assert.equal(STAGE_MAP['Actief'], 'active');
    assert.equal(STAGE_MAP['Afgewezen'], 'rejected');
  });

  test('Offline guard: Never touches app_pipeline_candidates or marks migrated when offline', async () => {
    const rawData = JSON.stringify([
      { name: 'Klaas de Vries', email: 'klaas@example.nl', stage: 'Geïnteresseerd' },
    ]);
    const storage = createMockStorage({ app_pipeline_candidates: rawData });

    let apiCallCount = 0;
    const mockApi = {
      post: async () => {
        apiCallCount++;
        return { success: true };
      },
    };

    const result = await migratePipelineCandidates({
      apiClient: mockApi,
      storage,
      isOnline: () => false, // Browser is offline
    });

    assert.equal(result.status, 'offline');
    assert.equal(apiCallCount, 0, 'No API calls should be attempted when offline');
    assert.equal(storage.getItem('app_pipeline_candidates'), rawData, 'app_pipeline_candidates must NOT be removed');
    assert.equal(storage.getItem('pipeline_candidates_migrated'), null, 'Must NOT mark migrated');
  });

  test('Pre-migration backup: Timestamped backup is always created before attempting requests', async () => {
    const rawData = JSON.stringify([
      { name: 'Pieter Post', email: 'pieter@example.nl', stage: 'In gesprek' },
    ]);
    const storage = createMockStorage({ app_pipeline_candidates: rawData });

    let backupExistsDuringApiCall = false;
    const mockApi = {
      post: async () => {
        const keys = Object.keys(storage.dump());
        backupExistsDuringApiCall = keys.some((k) => k.startsWith('backup_pipeline_candidates_'));
        return { success: true };
      },
    };

    const result = await migratePipelineCandidates({
      apiClient: mockApi,
      storage,
      isOnline: () => true,
    });

    assert.equal(result.status, 'success');
    assert.ok(backupExistsDuringApiCall, 'Backup must exist in storage before any API call is made');
    assert.ok(result.backupKey.startsWith('backup_pipeline_candidates_'));
    assert.equal(storage.getItem(result.backupKey), rawData);
  });

  test('Network error failure: Preserves app_pipeline_candidates and does not mark migrated', async () => {
    const rawData = JSON.stringify([
      { name: 'Jan Jansen', email: 'jan@example.nl', stage: 'Geïnteresseerd' },
    ]);
    const storage = createMockStorage({ app_pipeline_candidates: rawData });

    const mockApi = {
      post: async () => {
        throw new Error('TypeError: Failed to fetch (Network connection refused)');
      },
    };

    const result = await migratePipelineCandidates({
      apiClient: mockApi,
      storage,
      isOnline: () => true,
    });

    assert.equal(result.status, 'failed');
    assert.equal(result.networkErrorCount, 1);
    assert.equal(storage.getItem('pipeline_candidates_migrated'), null, 'Must NOT mark migrated on network error');
    assert.ok(storage.getItem('app_pipeline_candidates'), 'Must NOT delete app_pipeline_candidates on network error');
  });

  test('Duplicate handling (409 Conflict): Correctly recognized as already in DB and marked resolved', async () => {
    const rawData = JSON.stringify([
      { name: 'Existing Candidate', email: 'existing@example.nl', stage: 'Proefproject' },
    ]);
    const storage = createMockStorage({ app_pipeline_candidates: rawData });

    const mockApi = {
      post: async () => ({
        success: false,
        error: { code: 'DUPLICATE_CANDIDATE', message: "Candidate with email 'existing@example.nl' already exists" },
      }),
    };

    const result = await migratePipelineCandidates({
      apiClient: mockApi,
      storage,
      isOnline: () => true,
    });

    assert.equal(result.status, 'success', 'Duplicate candidate is resolved without error');
    assert.equal(result.duplicateCount, 1);
    assert.equal(result.migratedCount, 0);
    assert.equal(storage.getItem('app_pipeline_candidates'), null, 'Candidate is resolved so local key is cleared');
    assert.equal(storage.getItem('pipeline_candidates_migrated'), 'true');
  });

  test('Partial migration & safe retry: Preserves failed candidates and completes cleanly on retry', async () => {
    const cand1 = { name: 'First Craftsman', email: 'first@example.nl', stage: 'Geïnteresseerd' };
    const cand2 = { name: 'Second Craftsman', email: 'second@example.nl', stage: 'In gesprek' };
    const initialRaw = JSON.stringify([cand1, cand2]);
    const storage = createMockStorage({ app_pipeline_candidates: initialRaw });

    // Run 1: First candidate succeeds, second candidate encounters 503 Server Error
    let callIndex = 0;
    const mockApiRun1 = {
      post: async (path, body) => {
        callIndex++;
        if (body.email === 'first@example.nl') {
          return { success: true, data: { id: 'c-1' } };
        }
        return { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Service Unavailable' } };
      },
    };

    const result1 = await migratePipelineCandidates({
      apiClient: mockApiRun1,
      storage,
      isOnline: () => true,
    });

    assert.equal(result1.status, 'partial');
    assert.equal(result1.migratedCount, 1);
    assert.equal(result1.remainingCount, 1);
    assert.equal(storage.getItem('pipeline_candidates_migrated'), null, 'Must NOT mark migrated on partial failure');

    // Verify app_pipeline_candidates now contains ONLY the unmigrated second candidate
    const remainingAfterRun1 = JSON.parse(storage.getItem('app_pipeline_candidates'));
    assert.equal(remainingAfterRun1.length, 1);
    assert.equal(remainingAfterRun1[0].email, 'second@example.nl');

    // Run 2 (Retry): Network is restored, second candidate succeeds
    const mockApiRun2 = {
      post: async (path, body) => {
        if (body.email === 'second@example.nl') {
          return { success: true, data: { id: 'c-2' } };
        }
        // If first is retried for any reason, it returns 409 conflict
        return { success: false, error: { code: 'DUPLICATE_CANDIDATE', message: 'Already exists' } };
      },
    };

    const result2 = await migratePipelineCandidates({
      apiClient: mockApiRun2,
      storage,
      isOnline: () => true,
    });

    assert.equal(result2.status, 'success');
    assert.equal(result2.migratedCount, 1);
    assert.equal(result2.remainingCount, 0);
    assert.equal(storage.getItem('app_pipeline_candidates'), null, 'Legacy key removed after all items complete');
    assert.equal(storage.getItem('pipeline_candidates_migrated'), 'true');

    // Verify backups from both runs are still preserved
    const allKeys = Object.keys(storage.dump());
    const backups = allKeys.filter((k) => k.startsWith('backup_pipeline_candidates_'));
    assert.ok(backups.length >= 2, 'All historical backups must be preserved and never deleted');
  });

  test('Backups are never deleted automatically after migration', async () => {
    const rawData = JSON.stringify([
      { name: 'Sven Test', email: 'sven@example.nl', stage: 'Actief' },
    ]);
    const storage = createMockStorage({
      app_pipeline_candidates: rawData,
      backup_pipeline_candidates_old: 'historical-backup-data',
    });

    const mockApi = {
      post: async () => ({ success: true }),
    };

    const result = await migratePipelineCandidates({
      apiClient: mockApi,
      storage,
      isOnline: () => true,
    });

    assert.equal(result.status, 'success');
    assert.equal(storage.getItem('backup_pipeline_candidates_old'), 'historical-backup-data');
    assert.ok(storage.getItem(result.backupKey), 'New backup must still exist');
  });

  test('Validation error (400 Bad Request): Distinguished from network errors and preserved without marking migrated', async () => {
    const rawData = JSON.stringify([
      { name: 'Invalid Candidate', email: 'invalid-email', stage: 'Geïnteresseerd' },
    ]);
    const storage = createMockStorage({ app_pipeline_candidates: rawData });

    const mockApi = {
      post: async () => ({
        success: false,
        error: { code: 'VALIDATION_FAILED', message: 'Invalid candidate payload' },
      }),
    };

    const result = await migratePipelineCandidates({
      apiClient: mockApi,
      storage,
      isOnline: () => true,
    });

    assert.equal(result.status, 'partial');
    assert.equal(result.validationErrorCount, 1);
    assert.equal(result.networkErrorCount, undefined);
    assert.equal(storage.getItem('pipeline_candidates_migrated'), null, 'Must NOT mark migrated when validation fails');
    assert.ok(storage.getItem('app_pipeline_candidates'), 'Invalid candidates preserved in storage for user review');
  });
});

