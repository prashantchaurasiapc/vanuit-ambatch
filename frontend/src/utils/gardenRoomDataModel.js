/**
 * Garden Room & Poolhouse Extended Data Model Helper
 * 
 * Provides backward-compatible data structures and normalizers for:
 * 1. Project Type differentiation (outdoor_kitchen, garden_room, poolhouse, canopy)
 * 2. Extended Payment Instalments (50/50 vs 40/40/20 with handover lock)
 * 3. Extended 7-Phase Planning & Week-Based Schedule (Schouw, Prov/Def status)
 * 4. Garden Room specific feature models (renders, version history, prep checklist, 
 *    team updates, handover confirmation, seasonal maintenance, 3-month check)
 */

import { PROJECT_TYPES, detectProjectType, isGardenRoomFamily, normalizeProjectType } from './projectType.js';

export { PROJECT_TYPES, detectProjectType, isGardenRoomFamily, normalizeProjectType };


/**
 * Returns payment instalment structure based on project type.
 * Outdoor Kitchen: 50% / 50%
 * Garden Room / Poolhouse / Canopy: 40% / 40% / 20%
 */
export function getPaymentInstalmentsModel(projectType, totalAmount = 0) {
  const pType = detectProjectType(projectType);
  const isGardenRoomFamily = pType !== PROJECT_TYPES.OUTDOOR_KITCHEN;

  if (!isGardenRoomFamily) {
    // Base Outdoor Kitchen 50/50 Model
    const amount1 = Math.round((totalAmount * 0.5) * 100) / 100;
    const amount2 = Math.round((totalAmount - amount1) * 100) / 100;
    return {
      count: 2,
      percentages: [50, 50],
      instalments: [
        {
          step: 1,
          percentage: 50,
          labelNL: '1e termijn (50% bij akkoord)',
          labelEN: '1st instalment (50% upon approval)',
          amount: amount1,
          status: 'Betaald',
          requiresHandoverConfirmation: false
        },
        {
          step: 2,
          percentage: 50,
          labelNL: '2e termijn (50% bij levering)',
          labelEN: '2nd instalment (50% upon delivery)',
          amount: amount2,
          status: 'Openstaand',
          requiresHandoverConfirmation: false
        }
      ]
    };
  }

  // Extended Garden Room 40/40/20 Model
  const amount1 = Math.round((totalAmount * 0.4) * 100) / 100;
  const amount2 = Math.round((totalAmount * 0.4) * 100) / 100;
  const amount3 = Math.round((totalAmount - amount1 - amount2) * 100) / 100;

  return {
    count: 3,
    percentages: [40, 40, 20],
    instalments: [
      {
        step: 1,
        percentage: 40,
        labelNL: '1e termijn (40% bij akkoord)',
        labelEN: '1st instalment (40% upon approval)',
        amount: amount1,
        status: 'Betaald',
        requiresHandoverConfirmation: false
      },
      {
        step: 2,
        percentage: 40,
        labelNL: '2e termijn (40% bij start bouw)',
        labelEN: '2nd instalment (40% at start of build)',
        amount: amount2,
        status: 'Openstaand',
        requiresHandoverConfirmation: false
      },
      {
        step: 3,
        percentage: 20,
        labelNL: '3e termijn (20% bij oplevering)',
        labelEN: '3rd instalment (20% at handover)',
        amount: amount3,
        status: 'Verwacht na oplevering',
        requiresHandoverConfirmation: true // HARD RULE: Cannot create 20% invoice before handover confirmation
      }
    ]
  };
}

/**
 * Returns planning phase model based on project type.
 * Outdoor Kitchen: 5 phases
 * Garden Room / Poolhouse / Canopy: 7 phases (includes Schouw / Site Survey)
 */
export function getPlanningPhaseModel(projectType) {
  const pType = detectProjectType(projectType);
  const isGardenRoomFamily = pType !== PROJECT_TYPES.OUTDOOR_KITCHEN;

  if (!isGardenRoomFamily) {
    return [
      { id: 'p-1', nameNL: 'Akkoord & ontwerp', nameEN: 'Approved & design', status: 'done' },
      { id: 'p-2', nameNL: 'In de werkplaats', nameEN: 'In the workshop', status: 'current' },
      { id: 'p-3', nameNL: 'Klaar voor levering', nameEN: 'Ready for delivery', status: 'planned' },
      { id: 'p-4', nameNL: 'Geleverd', nameEN: 'Delivered', status: 'planned' },
      { id: 'p-5', nameNL: 'Nazorg', nameEN: 'Aftercare', status: 'planned' }
    ];
  }

  return [
    { id: 'gr-1', nameNL: 'Akkoord & ontwerp', nameEN: 'Approved & design', status: 'done' },
    { id: 'gr-2', nameNL: 'Schouw', nameEN: 'Site survey', status: 'current', isSurveyPhase: true },
    { id: 'gr-3', nameNL: 'Voorbereiding', nameEN: 'Preparation', status: 'planned' },
    { id: 'gr-4', nameNL: 'Materialen', nameEN: 'Materials', status: 'planned' },
    { id: 'gr-5', nameNL: 'De bouw', nameEN: 'The build', status: 'planned' },
    { id: 'gr-6', nameNL: 'Oplevering', nameEN: 'Handover', status: 'planned' },
    { id: 'gr-7', nameNL: 'Nazorg', nameEN: 'Aftercare', status: 'planned' }
  ];
}

/**
 * Default Render Viewer Data Package for Garden Rooms
 */
export function createDefaultRenderPackage() {
  return {
    hasUploadedRenders: true,
    hasEveningRender: true,
    activeViewId: 'view-front',
    dayEveningState: 'day', // 'day' | 'evening'
    mainRender: {
      url: '/outdoor_project_card.png',
      version: 2,
      date: '2026-08-14',
      title: 'Vooraanzicht Buitenverblijf'
    },
    views: [
      { id: 'view-front', labelNL: 'Vooraanzicht', labelEN: 'Front view', url: '/outdoor_project_card.png' },
      { id: 'view-side', labelNL: 'Zijaanzicht', labelEN: 'Side view', url: '/dasbordes images.png' },
      { id: 'view-interior', labelNL: 'Interieur poolhouse', labelEN: 'Interior poolhouse', url: '/outdoor_living_login.png' },
      { id: 'view-garden', labelNL: 'Vanuit de tuin', labelEN: 'From the garden', url: '/dasbordes images.png' }
    ],
    detailRenders: [
      { id: 'det-wood', titleNL: 'Thermo Fraké Hout', titleEN: 'Thermo Fraké Wood', descNL: 'Warm roodbruin, duurzaamheidsklasse 1-2', url: '/wood_texture.png' },
      { id: 'det-roof', titleNL: 'EPDM Daksysteem', titleEN: 'EPDM Roofing', descNL: 'Onderhoudsarm, strakke antraciet rand', url: '/outdoor_project_card.png' },
      { id: 'det-floor', titleNL: 'Keramische Tegels 60x60', titleEN: 'Ceramic Tiles 60x60', descNL: 'In het poolhouse-deel, kleur greige', url: '/dasbordes images.png' }
    ],
    layoutDiagram: {
      show: true,
      totalWidth: 800, // 8.00m
      segments: [
        { id: 'seg-1', type: 'CLOSED', labelNL: 'Poolhouse dicht (3,00 m)', labelEN: 'Closed poolhouse (3.00 m)', width: 300 },
        { id: 'seg-2', type: 'LOUNGE', labelNL: 'Lounge overkapping (5,00 m)', labelEN: 'Lounge canopy (5.00 m)', width: 500 }
      ]
    },
    versionHistory: [
      { version: 2, date: '14 augustus 2026', changeLine: 'Schuifpui verplaatst naar de zuidzijde, overstek 40 cm verbreed', isCurrent: true },
      { version: 1, date: '6 augustus 2026', changeLine: 'Eerste ontwerp op basis van de offerte', isCurrent: false }
    ]
  };
}

/**
 * Default Preparation Checklist for Garden Rooms
 */
export function createDefaultPrepChecklist() {
  return [
    { id: 'prep-1', labelNL: 'Toegang naar de achtertuin minimaal 1.20 m breed', labelEN: 'Rear garden access at least 1.20 m wide', isChecked: true },
    { id: 'prep-2', labelNL: 'Bouwplek leeg en bereikbaar (± 15 m² extra voor materiaal)', labelEN: 'Site clear & accessible (± 15 m² extra storage space)', isChecked: false },
    { id: 'prep-3', labelNL: 'Stroompunt beschikbaar op maximaal 25 m', labelEN: 'Power point available within max 25 m', isChecked: false },
    { id: 'prep-4', labelNL: 'Parkeerplek voor de bus en aanhanger in de buurt', labelEN: 'Parking available for bus and trailer nearby', isChecked: false },
    { id: 'prep-5', labelNL: 'Buren geïnformeerd over de bouwweek', labelEN: 'Neighbours informed about the build week', isChecked: false }
  ];
}

/**
 * Default Team Updates for Garden Rooms
 */
export function createDefaultTeamUpdates() {
  return [
    {
      id: 'upd-1',
      author: 'Tim & Bram',
      avatar: '/dasbordes images.png',
      date: '14 augustus 2026',
      weekNumber: 33,
      messageNL: 'Render versie 2 staat klaar. We hebben de schuifpui naar de zuidzijde verplaatst — met de middagzon wordt dat echt de mooiste plek. Volgende stap is de schouw!',
      messageEN: 'Render version 2 is ready. We moved the sliding door to the south side — with afternoon sun that will be the best spot. Next step is the site survey!'
    }
  ];
}

/**
 * Default Handover Confirmation Model
 */
export function createDefaultHandoverModel() {
  return {
    isConfirmed: false,
    confirmedAt: null,
    confirmedBy: null,
    checklist: [
      { id: 'chk-1', textNL: 'Gebouwd volgens tekening en render', textEN: 'Built according to drawing and render', isChecked: true },
      { id: 'chk-2', textNL: 'Dak, goten en afwatering gecontroleerd', textEN: 'Roof, gutters and drainage checked', isChecked: true },
      { id: 'chk-3', textNL: 'Schuifpui, elektra en verlichting werken', textEN: 'Sliding doors, electrics and lighting working', isChecked: true },
      { id: 'chk-4', textNL: 'Tuin en bouwplek netjes achtergelaten', textEN: 'Garden and build site left tidy', isChecked: true }
    ]
  };
}

/**
 * Default Seasonal Maintenance Calendar Model
 */
export function createDefaultSeasonalMaintenance() {
  return {
    optInReminders: true,
    seasons: [
      { id: 's-spring', seasonNL: 'LENTE', seasonEN: 'SPRING', titleNL: 'Hout behandelen', titleEN: 'Wood treatment', descNL: 'Reinig het Douglas/Teak en breng één laag beits of olie aan.', descEN: 'Clean wood and apply one layer of stain or oil.' },
      { id: 's-summer', seasonNL: 'ZOMER', seasonEN: 'SUMMER', titleNL: 'Niets — genieten', titleEN: 'Nothing — enjoy', descNL: 'Hooguit de schuifpui-rails even uitvegen.', descEN: 'Just sweep the sliding door rails.' },
      { id: 's-autumn', seasonNL: 'HERFST', seasonEN: 'AUTUMN', titleNL: 'Dak & afvoer vrij', titleEN: 'Roof & drain clear', descNL: 'Blad van het EPDM-dak en uit de afvoer halen.', descEN: 'Clear leaves from EPDM roof and drain.' },
      { id: 's-winter', seasonNL: 'WINTER', seasonEN: 'WINTER', titleNL: 'Niets nodig', titleEN: 'Nothing needed', descNL: 'Douglas en EPDM kunnen prima tegen vorst.', descEN: 'Timber and EPDM handle frost well.' }
    ]
  };
}

/**
 * Default 3-Month Checkup Model
 */
export function createDefaultThreeMonthCheck() {
  return {
    scheduledDate: 'januari 2027',
    statusNL: 'Gepland · januari 2027',
    statusEN: 'Scheduled · January 2027',
    taskCreated: true,
    descNL: 'In januari nemen we contact op: zit alles nog strak, doet de elektra het, ben je tevreden? Kleine punten lossen we dan meteen op.',
    descEN: 'In January we will contact you: is everything still tight, does electrics work, are you satisfied? We solve minor issues immediately.'
  };
}

/**
 * Backward-Compatible Project Normalizer Function
 * Ensures any project object from localStorage or mock data gets standard fields
 * without breaking existing Outdoor Kitchen properties.
 */
export function normalizeProjectData(rawProject) {
  if (!rawProject) return null;

  const projectType = detectProjectType(rawProject);
  const isGardenRoomFamily = projectType !== PROJECT_TYPES.OUTDOOR_KITCHEN;

  const numericAmount = typeof rawProject.numericAmount === 'number'
    ? rawProject.numericAmount
    : parseFloat(String(rawProject.value || rawProject.amount || '0').replace(/[^\d.-]/g, '')) || (isGardenRoomFamily ? 37950 : 5650);

  const paymentModel = rawProject.paymentModel || getPaymentInstalmentsModel(projectType, numericAmount);
  const planningPhases = rawProject.planningPhases || getPlanningPhaseModel(projectType);

  return {
    ...rawProject,
    projectType,
    isGardenRoomFamily,
    numericAmount,
    scheduleStatus: rawProject.scheduleStatus || (isGardenRoomFamily ? 'provisional' : 'definitive'), // 'provisional' | 'definitive'
    scheduleStatusBadgeNL: rawProject.scheduleStatusBadgeNL || (isGardenRoomFamily ? '◌ Voorlopig — definitief na de schouw' : '✓ Definitief'),
    paymentModel,
    planningPhases,
    
    // Extended Garden Room data fields (lazily evaluated defaults)
    renderPackage: rawProject.renderPackage || (isGardenRoomFamily ? createDefaultRenderPackage() : null),
    prepChecklist: rawProject.prepChecklist || (isGardenRoomFamily ? createDefaultPrepChecklist() : []),
    teamUpdates: rawProject.teamUpdates || (isGardenRoomFamily ? createDefaultTeamUpdates() : []),
    handoverModel: rawProject.handoverModel || (isGardenRoomFamily ? createDefaultHandoverModel() : null),
    seasonalMaintenance: rawProject.seasonalMaintenance || (isGardenRoomFamily ? createDefaultSeasonalMaintenance() : null),
    threeMonthCheck: rawProject.threeMonthCheck || (isGardenRoomFamily ? createDefaultThreeMonthCheck() : null),
    
    // Provisional sum quote line items footnote flag
    hasProvisionalSumItems: rawProject.hasProvisionalSumItems ?? isGardenRoomFamily,
    provisionalSumFootnoteNL: '* Stelpost: dit bedrag is een zorgvuldige inschatting; het definitieve bedrag wordt bij de schouw bevestigd.'
  };
}
