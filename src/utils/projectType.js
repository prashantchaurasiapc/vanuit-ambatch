/**
 * Project Type Support & Identification Utility
 * 
 * Implements Step 1 Project Type Identification according to:
 * - Customer Portal — Outdoor Kitchens v1.1
 * - Customer Portal — Garden Rooms & Poolhouses v1.0
 * 
 * Supported Types:
 * - outdoor_kitchen (Default for backward compatibility)
 * - garden_room
 * - poolhouse
 * - canopy
 */

export const PROJECT_TYPES = {
  OUTDOOR_KITCHEN: 'outdoor_kitchen',
  GARDEN_ROOM: 'garden_room',
  POOLHOUSE: 'poolhouse',
  CANOPY: 'canopy'
};

const VALID_TYPES = Object.values(PROJECT_TYPES);

/**
 * Safely detects the project type from project data, category, or productType.
 * Defaults to 'outdoor_kitchen' if unassigned (100% backward compatibility).
 * 
 * @param {Object|String} projectOrCategory - Project data object or category string
 * @returns {String} One of: 'outdoor_kitchen', 'garden_room', 'poolhouse', 'canopy'
 */
export function detectProjectType(projectOrCategory) {
  if (!projectOrCategory) return PROJECT_TYPES.OUTDOOR_KITCHEN;

  if (typeof projectOrCategory === 'object') {
    // 1. Direct explicit projectType property check
    if (projectOrCategory.projectType && VALID_TYPES.includes(projectOrCategory.projectType)) {
      return projectOrCategory.projectType;
    }

    // 2. Derive from category, productType, division, or project name strings
    const searchStr = [
      projectOrCategory.category,
      projectOrCategory.productType,
      projectOrCategory.division,
      projectOrCategory.name,
      projectOrCategory.project
    ].filter(Boolean).join(' ').toLowerCase();

    return resolveTypeFromString(searchStr);
  }

  return resolveTypeFromString(String(projectOrCategory).toLowerCase());
}

/**
 * Helper to match category/title strings to supported project types
 */
function resolveTypeFromString(str) {
  if (!str) return PROJECT_TYPES.OUTDOOR_KITCHEN;
  if (str.includes('poolhouse')) return PROJECT_TYPES.POOLHOUSE;
  if (str.includes('verblijf') || str.includes('buitenverblijf') || str.includes('garden room') || str.includes('studio')) {
    return PROJECT_TYPES.GARDEN_ROOM;
  }
  if (str.includes('overkapping') || str.includes('canopy') || str.includes('pergola')) {
    return PROJECT_TYPES.CANOPY;
  }
  return PROJECT_TYPES.OUTDOOR_KITCHEN;
}

/**
 * Boolean helper returning true for Garden Room family projects:
 * - garden_room
 * - poolhouse
 * - canopy
 * 
 * Returns false for outdoor_kitchen.
 * 
 * @param {Object|String} projectOrCategory 
 * @returns {Boolean}
 */
export function isGardenRoomFamily(projectOrCategory) {
  const pType = detectProjectType(projectOrCategory);
  return pType === PROJECT_TYPES.GARDEN_ROOM || pType === PROJECT_TYPES.POOLHOUSE || pType === PROJECT_TYPES.CANOPY;
}

/**
 * Normalizes project object in memory without mutating original or rewriting localStorage.
 * Ensures project.projectType is populated (defaulting to 'outdoor_kitchen').
 * 
 * @param {Object} rawProject 
 * @returns {Object} Project with guaranteed projectType property
 */
export function normalizeProjectType(rawProject) {
  if (!rawProject) return null;
  const projectType = detectProjectType(rawProject);
  return {
    ...rawProject,
    projectType,
    isGardenRoomFamily: isGardenRoomFamily(rawProject)
  };
}
