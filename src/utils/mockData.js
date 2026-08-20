const getRelativeDate = (daysAgo) => new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

export const mockPartners = [
  {
    id: 'PART-000',
    name: 'Ruben Verbeij — RV Meubels',
    contactPerson: 'Ruben Verbeij',
    company: 'RV Meubels',
    email: 'ruben@rvmeubels.nl',
    phone: '+31 6 9876 5432',
    status: 'Actief',
    region: 'Noord-Holland',
    workload: 'Beschikbaar',
    rating: 4.9,
    completedProjects: 18,
    productTypes: ['Buitenkeukens', 'Buitenverblijven'],
    specialties: ['Maatwerk Teak Wood', 'Luxe Houtbewerking']
  },
  {
    id: 'PART-000B',
    name: 'Sven Hoek — Hoek Bouw',
    contactPerson: 'Sven Hoek',
    company: 'Hoek Bouw',
    email: 'sven@hoekbouw.nl',
    phone: '+31 6 8765 4321',
    status: 'Actief',
    region: 'Utrecht',
    workload: 'Beschikbaar',
    rating: 4.8,
    completedProjects: 12,
    productTypes: ['Buitenkeukens', 'Overkappingen'],
    specialties: ['Timmerwerk', 'Montage op Locatie']
  },
  {
    id: 'PART-001',
    name: 'CraftWood Veluwe',
    contactPerson: 'Erik van den Berg',
    company: 'CraftWood B.V.',
    email: 'erik@craftwood.nl',
    phone: '+31 6 1234 5678',
    status: 'Actief',
    region: 'Gelderland',
    workload: 'Beschikbaar',
    rating: 4.9,
    completedProjects: 14,
    productTypes: ['Buitenkeukens', 'Overkappingen'],
    specialties: ['Eikenhout Constructies', 'RVS Inbouw']
  },
  {
    id: 'PART-002',
    name: 'StaalWerk Brabant',
    contactPerson: 'Karel De Jong',
    email: 'karel@staalwerk.nl',
    phone: '+31 6 8765 4321',
    status: 'Actief',
    region: 'Noord-Brabant',
    workload: 'Druk',
    rating: 4.7,
    completedProjects: 9,
    productTypes: ['Kliko ombouwen', 'Stalen Frames'],
    specialties: ['Poedercoaten', 'Maatwerk Klikobox']
  },
  {
    id: 'PART-003',
    name: 'Hout & Steen Utrecht',
    contactPerson: 'Lisa Bakker',
    email: 'lisa@houtsteen.nl',
    phone: '+31 6 5544 3322',
    status: 'Actief',
    region: 'Utrecht',
    workload: 'Volgeboekt',
    rating: 4.8,
    completedProjects: 22,
    productTypes: ['Buitenverblijf', 'Poolhouse'],
    specialties: ['Beton Cire', 'Luxe Poolhouses']
  },
  {
    id: 'PART-004',
    name: 'De Gelderse Ambacht',
    contactPerson: 'Wouter Meijer',
    email: 'info@gelderseambacht.nl',
    phone: '+31 6 7788 9900',
    status: 'Inactief',
    region: 'Gelderland',
    workload: 'Inactief',
    rating: 4.5,
    completedProjects: 6,
    productTypes: ['Buitenkeukens'],
    specialties: ['Tijdelijk Gepauzeerd']
  },
  {
    id: 'PART-005',
    name: 'Noord-Zeeland Houtbouw',
    contactPerson: 'Sanne Smits',
    email: 'contact@zeelandhout.nl',
    phone: '+31 6 6655 4433',
    status: 'Inactief',
    region: 'Zeeland',
    workload: 'Inactief',
    rating: 4.2,
    completedProjects: 4,
    productTypes: ['Overkappingen'],
    specialties: ['Contract Verlopen']
  }
];

export const mockLeads = [
  {
    id: 'L-1001',
    name: 'John Miller',
    phone: '+31 6 1122 3344',
    email: 'john.miller@gmail.com',
    productType: 'buitenkeuken',
    size: '4x1.2m',
    source: 'Google Ads',
    status: 'Gewonnen',
    workflowStep: 5,
    assignedTo: 'Tim',
    date: getRelativeDate(15),
    lastContactDate: getRelativeDate(3),
    lostReason: ''
  },
  {
    id: 'L-1002',
    name: 'Sophia Taylor',
    phone: '+31 6 9988 7766',
    email: 'sophia.taylor@outlook.com',
    productType: 'buitenverblijf',
    size: '6x3m Garden Studio',
    source: 'Facebook',
    status: 'Offerte verstuurd',
    assignedTo: 'Bram',
    date: getRelativeDate(10),
    lastContactDate: getRelativeDate(1),
    lostReason: ''
  },
  {
    id: 'L-1003',
    name: 'Mark Davis',
    phone: '+31 6 4455 6677',
    email: 'mark.davis@gmail.com',
    productType: 'overkapping',
    size: '6x4m',
    source: 'Direct',
    status: 'In gesprek',
    assignedTo: 'Tim',
    date: getRelativeDate(5),
    lastContactDate: getRelativeDate(1),
    lostReason: ''
  },
  {
    id: 'L-1004',
    name: 'Emma Wilson',
    phone: '+31 6 3322 1100',
    email: 'emma.wilson@hotmail.com',
    productType: 'poolhouse',
    size: '8x4m Luxe',
    source: 'Referral',
    status: 'Nieuw',
    assignedTo: 'Bram',
    date: getRelativeDate(6),
    lastContactDate: getRelativeDate(4),
    lostReason: ''
  }
];

export const mockQuotes = [
  {
    id: 'Q-4001',
    customer: 'John Miller',
    project: 'Luxury Teak Outdoor Kitchen 4m',
    amount: '€ 11,300',
    date: getRelativeDate(12),
    status: 'Accepted',
    discountPercent: 0,
    items: [
      { description: 'Outdoor Kitchen Teak Wood Frame 4m', quantity: 1, unitPrice: 8500 },
      { description: 'Concrete Countertop with Kamado Cutout', quantity: 1, unitPrice: 2800 }
    ]
  },
  {
    id: 'Q-4002',
    customer: 'Sophia Taylor',
    project: 'Oak Wooden Canopy 6x4m',
    amount: '€ 14,500',
    date: getRelativeDate(8),
    status: 'Sent',
    discountPercent: 5,
    items: [
      { description: 'Rustic Oak Beam Construction 6x4m', quantity: 1, unitPrice: 11000 },
      { description: 'Glass Sliding Wall (4-piece panel)', quantity: 1, unitPrice: 3500 }
    ]
  },
  {
    id: 'Q-4003',
    customer: 'Mark Davis',
    project: 'Oak Wooden Canopy 6x4m',
    amount: '€ 14,500',
    date: getRelativeDate(4),
    status: 'Draft',
    discountPercent: 0,
    items: [
      { description: 'Rustic Oak Beam Construction', quantity: 1, unitPrice: 11000 },
      { description: 'EPDM Roof System & Zinc Drainage', quantity: 1, unitPrice: 3500 }
    ]
  }
];

export const mockProjects = [
  {
    id: 'PRJ-101',
    name: 'Luxury Teak Outdoor Kitchen 4m',
    customer: 'John Miller',
    partner: 'CraftWood Veluwe',
    progress: 65,
    deadline: getRelativeDate(-14), // 14 days in future
    status: 'In Progress',
    orderStatus: 'Production started',
    quoteId: 'Q-4001',
    value: '€ 11,300'
  },
  {
    id: 'PRJ-102',
    name: 'Oak Wooden Canopy 6x4m',
    customer: 'Sophia Taylor',
    partner: 'Hout & Steen Utrecht',
    progress: 35,
    deadline: getRelativeDate(-21),
    status: 'In Progress',
    orderStatus: 'Materials delivered',
    quoteId: 'Q-4002',
    value: '€ 14,500'
  }
];

export const mockInvoices = [
  {
    id: 'INV-4001-A',
    quoteId: 'Q-4001',
    customer: 'John Miller',
    type: '50% Down Payment (Upfront)',
    amount: '€ 5,650',
    numericAmount: 5650,
    status: 'Paid',
    dueDate: getRelativeDate(5),
    createdDate: getRelativeDate(12)
  },
  {
    id: 'INV-4001-B',
    quoteId: 'Q-4001',
    customer: 'John Miller',
    type: '50% Final Invoice (Completion)',
    amount: '€ 5,650',
    numericAmount: 5650,
    status: 'Pending',
    dueDate: getRelativeDate(-14),
    createdDate: getRelativeDate(12)
  }
];

export const mockTasks = [
  {
    id: 'TSK-101',
    title: 'Measure outdoor kitchen for John Miller',
    customer: 'John Miller',
    project: 'Luxury Teak Outdoor Kitchen 4m',
    dueDate: getRelativeDate(-1),
    priority: 'High',
    status: 'Completed',
    assignedTo: 'Tim',
    assignee: 'Tim'
  },
  {
    id: 'TSK-102',
    title: 'Send color samples to Sophia Taylor',
    customer: 'Sophia Taylor',
    project: 'Bin Storage Triple Anthracite',
    dueDate: getRelativeDate(0),
    priority: 'Medium',
    status: 'Pending',
    assignedTo: 'Tim',
    assignee: 'Tim'
  },
  {
    id: 'TSK-103',
    title: 'Follow up on Quote Q-4003 (Mark Davis)',
    customer: 'Mark Davis',
    project: 'Oak Wooden Canopy 6x4m',
    dueDate: getRelativeDate(-2),
    priority: 'High',
    status: 'Pending',
    assignedTo: 'Tim',
    assignee: 'Tim'
  }
];

export const mockRecentActivities = [
  { id: 1, type: 'lead', title: 'New lead received', detail: 'Emma Wilson (Poolhouse 8x4m)', time: '2 hours ago' },
  { id: 2, type: 'invoice', title: 'Invoice paid', detail: 'John Miller (€ 5,650 deposit)', time: '1 day ago' },
  { id: 3, type: 'quote', title: 'Quote approved', detail: 'Q-4001 by John Miller', time: '2 days ago' }
];

export const mockFollowUps = [
  { id: 'FOL-101', name: 'Sophia Taylor', type: 'Follow up on Quote Q-4002', due: 'Today' },
  { id: 'FOL-102', name: 'Mark Davis', type: 'Discuss canopy options', due: 'Tomorrow' },
  { id: 'FOL-103', name: 'Emma Wilson', type: 'Schedule intake consultation poolhouse', due: 'In 2 days' }
];

export const mockDeliveries = [
  { id: 'DEL-101', project: 'Luxury Teak Outdoor Kitchen 4m', customer: 'John Miller', date: 'Fri 14 Aug', partner: 'CraftWood Veluwe' },
  { id: 'DEL-102', project: 'Bin Storage Triple Anthracite', customer: 'Sophia Taylor', date: 'Wed 19 Aug', partner: 'StaalWerk Brabant' },
  { id: 'DEL-103', project: 'Oak Wooden Canopy 6x4m', customer: 'Mark Davis', date: 'Mon 24 Aug', partner: 'Hout & Steen Utrecht' }
];

export const mockWarnings = [
  { id: 'WRN-101', type: 'Pending Down Payment', customer: 'Sophia Taylor', detail: 'Quote Q-4002 from Sophia Taylor is awaiting deposit of € 925.' },
  { id: 'WRN-102', type: 'Delivery Approaching', customer: 'John Miller', detail: 'PRJ-101 (John Miller) is due for delivery in 14 days.' }
];

export const mockProfitLossData = [
  {
    projectId: 'PRJ-101',
    projectName: 'Luxury Teak Outdoor Kitchen 4m',
    customer: 'John Miller',
    category: 'Outdoor Kitchens',
    revenue: 11300,
    partnerCost: 3200,
    materialCost: 1650,
    otherCost: 0
  },
  {
    projectId: 'PRJ-102',
    projectName: 'Triple Bin Storage Anthracite',
    customer: 'Sophia Taylor',
    category: 'Bin Storage',
    revenue: 1850,
    partnerCost: 520,
    materialCost: 300,
    otherCost: 0
  },
  {
    projectId: 'PRJ-103',
    projectName: 'Oak Wooden Canopy 6x4m',
    customer: 'Mark Davis',
    category: 'Canopies',
    revenue: 14500,
    partnerCost: 4500,
    materialCost: 2300,
    otherCost: 0
  },
  {
    projectId: 'PRJ-104',
    projectName: 'Luxury Terrace Decking',
    customer: 'Emma Wilson',
    category: 'Terraces',
    revenue: 8900,
    partnerCost: 2400,
    materialCost: 1200,
    otherCost: 0
  }
];

export const mockBankTransactions = [
  {
    id: 'TXN-ABN-9001',
    date: '2026-08-10',
    description: '50% Aanbetaling Keuken Bjorn Valk (FA-2026-108)',
    debit: 0,
    credit: 3495,
    numericAmount: 3495,
    amountStr: '€ 3.495,00',
    counterIban: 'NL91 ABNA 0412 3456 78',
    counterName: 'Bjorn Valk',
    remi: '50% Aanbetaling Keuken Bjorn Valk (FA-2026-108)',
    eref: 'EREF-2026-9001',
    type: 'iDEAL',
    category: 'Revenue – Outdoor Kitchens',
    matchReason: 'Invoice Number Match (FA-2026-108)',
    projectRef: 'PRJ-101',
    orderId: 'FA-2026-108',
    status: 'Categorized',
    reviewReason: null,
    isInternal: false
  },
  {
    id: 'TXN-ABN-9002',
    date: '2026-08-09',
    description: 'Interne Overboeking Zakelijk Flexibel Sparen',
    debit: 2000,
    credit: 0,
    numericAmount: 2000,
    amountStr: '€ 2.000,00',
    counterIban: 'NL44 ABNA 0987 6543 21',
    counterName: 'VANUIT AMBACHT',
    remi: 'Zakelijk Flexibel Sparen spaarreserve',
    eref: 'EREF-2026-9002',
    type: 'Transfer',
    category: 'Internal Transfer / Kruispost',
    matchReason: 'Savings IBAN Match',
    projectRef: '-',
    status: 'Internal Transfer',
    reviewReason: null,
    isInternal: true
  },
  {
    id: 'TXN-ABN-9003',
    date: '2026-08-08',
    description: 'Ruben Verbeij Meubels Op Maat - Houtbewerking eiken frame',
    debit: 1250,
    credit: 0,
    numericAmount: 1250,
    amountStr: '€ 1.250,00',
    counterIban: 'NL12 ABNA 0555 4443 22',
    counterName: 'Ruben Verbeij Meubels Op Maat',
    remi: 'Houtbewerking eiken frame PRJ-101',
    eref: 'EREF-2026-9003',
    type: 'Transfer',
    category: 'Purchasing (Inkoop)',
    matchReason: 'Supplier Name Match (Ruben Verbeij)',
    projectRef: 'PRJ-101',
    orderId: 'PRJ-101',
    status: 'Categorized',
    reviewReason: null,
    isInternal: false
  },
  {
    id: 'TXN-ABN-9004',
    date: '2026-08-07',
    description: 'Smart Fulfilment B.V. Transport en Logistiek Buitenkeuken',
    debit: 450,
    credit: 0,
    numericAmount: 450,
    amountStr: '€ 450,00',
    counterIban: 'NL88 INGB 0001 2345 67',
    counterName: 'Smart Fulfilment B.V.',
    remi: 'Transport & Koerier Levering Dongen PRJ-101',
    eref: 'EREF-2026-9004',
    type: 'Transfer',
    category: 'Transport – Smart Fulfilment',
    matchReason: 'Supplier Name Match (Smart Fulfilment)',
    projectRef: 'PRJ-101',
    orderId: 'PRJ-101',
    status: 'Categorized',
    reviewReason: null,
    isInternal: false
  },
  {
    id: 'TXN-ABN-9005',
    date: '2026-08-06',
    description: 'Alibaba.com Singapore - Kliko & RVS Scharnieren Inkoop',
    debit: 890,
    credit: 0,
    numericAmount: 890,
    amountStr: '€ 890,00',
    counterIban: 'NL03 RABO 0111 2223 33',
    counterName: 'Alibaba.com Singapore',
    remi: 'Order ALI-9821 RVS Beslag',
    eref: 'EREF-2026-9005',
    type: 'iDEAL',
    category: 'Purchasing (Inkoop)',
    matchReason: 'Supplier Name Match (Alibaba.com)',
    projectRef: 'PRJ-102',
    status: 'Categorized',
    reviewReason: null,
    isInternal: false
  },
  {
    id: 'TXN-ABN-9006',
    date: '2026-08-05',
    description: 'Buckaroo B.V. - Transactiekosten iDEAL & Payment Provider',
    debit: 45,
    credit: 0,
    numericAmount: 45,
    amountStr: '€ 45,00',
    counterIban: 'NL55 BUCK 0000 1111 22',
    counterName: 'Buckaroo B.V.',
    remi: 'Middels Buckaroo Payment Provider Fees Aug',
    eref: 'EREF-2026-9006',
    type: 'Direct debit',
    category: 'Payment Provider Fees',
    matchReason: 'Payment Provider Match',
    projectRef: '-',
    status: 'Categorized',
    reviewReason: null,
    isInternal: false
  },
  {
    id: 'TXN-ABN-9007',
    date: '2026-08-04',
    description: 'BOLCOM B.V. Netto Uitbetaling Verkoopaccount',
    debit: 0,
    credit: 800,
    numericAmount: 800,
    amountStr: '€ 800,00',
    counterIban: 'NL11 BOLC 0009 8765 43',
    counterName: 'BOLCOM B.V.',
    remi: 'BOL.COM Payout Spec SPEC-2026-BOL-99',
    eref: 'EREF-2026-9007',
    type: 'Transfer',
    category: 'Revenue – bol.com',
    matchReason: 'bol.com Payout Match',
    projectRef: '-',
    status: 'Categorized',
    reviewReason: null,
    isInternal: false,
    bolSpecification: {
      grossSales: 950,
      commissionFees: 150,
      netPayout: 800,
      sellerAccountRef: 'SPEC-2026-BOL-99'
    }
  },
  {
    id: 'TXN-ABN-9008',
    date: '2026-08-05',
    description: 'Onbekende Transactie - Global Trading Direct Ltd',
    debit: 340,
    credit: 0,
    numericAmount: 340,
    amountStr: '€ 340,00',
    counterIban: 'GB99 BARK 1234 5678 90',
    counterName: 'Global Trading Direct Ltd',
    remi: 'Consulting Services Invoice 901',
    eref: 'EREF-2026-9008',
    type: 'BEA card payment',
    category: 'Review Item / Vraagpost',
    matchReason: 'No Matching Rule — Review Required',
    projectRef: '-',
    status: 'Review Needed',
    reviewReason: 'No configured counterparty or invoice matching rule found.',
    isInternal: false
  },
  {
    id: 'TXN-ABN-9009',
    date: '2026-08-04',
    description: 'Onbekende Transactie - assf / qwer online store',
    debit: 175,
    credit: 0,
    numericAmount: 175,
    amountStr: '€ 175,00',
    counterIban: 'NL99 UNKN 0000 1111 22',
    counterName: 'assf / qwer',
    remi: 'assf qwer payment ref 9912',
    eref: 'EREF-2026-9009',
    type: 'iDEAL',
    category: 'Review Item / Vraagpost',
    matchReason: 'No Matching Rule — Review Required',
    projectRef: '-',
    status: 'Review Needed',
    reviewReason: 'No recognizable counterparty, IBAN or business reference found.',
    isInternal: false
  },
  {
    id: 'TXN-ABN-9010',
    date: '2026-08-03',
    description: 'Purchase Teak Wood & Granite Slabs – CraftWood Veluwe',
    debit: 1450,
    credit: 0,
    numericAmount: 1450,
    amountStr: '€ 1.450,00',
    counterIban: 'NL44 CRAF 0099 8877 66',
    counterName: 'CraftWood Veluwe B.V.',
    remi: 'Inkoop teakhout en granieten werkblad plaatmateriaal',
    eref: 'EREF-2026-9010',
    type: 'Transfer',
    category: 'Review Item / Vraagpost',
    matchReason: 'No Matching Rule — Review Required',
    projectRef: '-',
    status: 'Review Needed',
    reviewReason: 'No invoice/reference found. Project matching required.',
    isInternal: false
  },
  {
    id: 'TXN-ABN-9011',
    date: '2026-08-02',
    description: 'Payout Craftsman Advance – Erik van den Berg (CraftWood)',
    debit: 650,
    credit: 0,
    numericAmount: 650,
    amountStr: '€ 650,00',
    counterIban: 'NL88 ABNA 0777 6655 44',
    counterName: 'Erik van den Berg',
    remi: 'Voorschot vakman montage buitenkeuken',
    eref: 'EREF-2026-9011',
    type: 'Transfer',
    category: 'Review Item / Vraagpost',
    matchReason: 'No Matching Rule — Review Required',
    projectRef: '-',
    status: 'Review Needed',
    reviewReason: 'No invoice/reference found. Project matching required.',
    isInternal: false
  },
  {
    id: 'TXN-ABN-9012',
    date: '2026-08-01',
    description: 'Deposit Wooden Canopy – Mark Davis',
    debit: 0,
    credit: 2100,
    numericAmount: 2100,
    amountStr: '€ 2.100,00',
    counterIban: 'NL12 ING 0004 5566 77',
    counterName: 'Mark Davis',
    remi: 'Aanbetaling houten overkapping maatwerk',
    eref: 'EREF-2026-9012',
    type: 'iDEAL',
    category: 'Review Item / Vraagpost',
    matchReason: 'No Matching Rule — Review Required',
    projectRef: '-',
    status: 'Review Needed',
    reviewReason: 'Customer/payment pattern found, but no confident order match.',
    isInternal: false
  }
];

export const mockFunnelData = {
  leads: { count: 4, label: "Leads deze maand" },
  inGesprek: { count: 1, label: "In gesprek", percentage: 25 },
  offerte: { count: 1, label: "Offerte verstuurd", percentage: 25 },
  gewonnen: { count: 1, label: "Gewonnen (Project)", percentage: 25 }
};

export const mockFinancials = {
  monthlyRevenue: '€ 5.650',
  outstandingInvoices: '€ 5.650',
  expectedRevenue: '€ 11.300'
};
