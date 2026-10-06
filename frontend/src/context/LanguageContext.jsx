import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../i18n/en.json';
import nl from '../i18n/nl.json';

const LanguageContext = createContext();

export const DICTIONARY = {
  EN: en,
  NL: nl
};

// Compatibility vocabulary for legacy screens that still contain JSX copy.
// This is deliberately an explicit two-way vocabulary: an inverted object is
// not safe here because multiple English labels can translate to the same
// Dutch label (and caused the mixed-language screens reported in testing).
// New UI should use t('...') keys; this vocabulary keeps the existing UI
// deterministic while those screens are migrated.
const LEGACY_TEXT = {
  'Welcome back': 'Welkom terug',
  'Log in to continue to your account.': 'Log in om door te gaan naar uw account.',
  'Email address': 'E-mailadres', 'Password': 'Wachtwoord', 'Log In': 'Inloggen',
  'Quick Demo Login': 'Snelle demo-login', 'Click to fill': 'Klik om in te vullen',
  'Invalid credentials. Use demo credentials below.': 'Ongeldige gegevens. Gebruik hieronder de demo-inloggegevens.',
  'Documents': 'Documenten', 'Upload, manage, and share project documents.': 'Projectdocumenten uploaden, beheren en delen.',
  'Upload Document': 'Document uploaden', 'Drag and drop file here, or click to browse': 'Sleep een bestand hierheen of klik om te bladeren',
  'PDF, Word, Excel, ZIP or Images up to 10MB': 'PDF, Word, Excel, ZIP of afbeeldingen tot 10 MB',
  'Search documents by name...': 'Zoek documenten op naam...', 'Filter:': 'Filter:',
  'All': 'Alle', 'Designs': 'Ontwerpen', 'Materials': 'Materialen', 'Contracts': 'Contracten', 'General': 'Algemeen', 'By:': 'Door:',
  'No documents found': 'Geen documenten gevonden', 'Try changing your filters or upload a new document.': 'Pas uw filters aan of upload een nieuw document.',
  'No live preview available': 'Geen livevoorbeeld beschikbaar', 'Download File': 'Bestand downloaden', 'Delete File': 'Bestand verwijderen',
  'Download': 'Downloaden', 'Delete': 'Verwijderen', 'Uploaded by:': 'Geüpload door:', 'Size:': 'Grootte:', 'Uploaded:': 'Geüpload:',
  'My Profile': 'Mijn profiel', 'Manage your profile details and security settings.': 'Beheer uw profielgegevens en beveiligingsinstellingen.',
  'Personal Information': 'Persoonlijke gegevens', 'Full Name': 'Volledige naam', 'Phone Number': 'Telefoonnummer',
  'Language': 'Taal', 'Save changes': 'Wijzigingen opslaan', 'Security & Password': 'Beveiliging en wachtwoord',
  'Current Password': 'Huidig wachtwoord', 'New Password': 'Nieuw wachtwoord', 'Confirm New Password': 'Bevestig nieuw wachtwoord', 'Update password': 'Wachtwoord bijwerken',
  'Finance': 'Boekhouding', 'Track revenue, invoices and payments.': 'Volg omzet, facturen en betalingen.', 'Export CSV': 'CSV exporteren',
  'Invoices': 'Facturen', 'View All': 'Alles bekijken', 'Total Revenue': 'Totale omzet', 'This Month': 'Deze maand',
  'Outstanding': 'Openstaand', 'Paid (Ytd)': 'Betaald (jaar tot nu toe)', '+23% this year': '+23% dit jaar', '+8% vs last month': '+8% t.o.v. vorige maand',
  '4 invoices pending': '4 facturen in behandeling', '92% collection rate': '92% inningspercentage', 'Revenue Overview (2023)': 'Omzetoverzicht (2023)',
  'Reports': 'Rapporten', 'Business performance reports and analytics.': 'Bedrijfsprestaties, rapporten en analyses.',
  'Download PDF': 'PDF downloaden', 'Export Excel': 'Excel exporteren', 'View Report →': 'Rapport bekijken →',
  'Revenue Report': 'Omzetrapport', 'Monthly and yearly revenue trends': 'Maandelijkse en jaarlijkse omzettrends',
  'Projects Report': 'Projectrapport', 'Project completion and progress stats': 'Statistieken over projectafronding en voortgang',
  'Lead Conversion': 'Leadconversie', 'Lead to project conversion rate': 'Conversiepercentage van lead naar project',
  'Lead Conversion Funnel': 'Leadconversietrechter', 'Total Inquiries': 'Totaal aanvragen', 'Leads Created': 'Leads aangemaakt',
  'Quotes Sent': 'Offertes verstuurd', 'Projects Started': 'Projecten gestart', 'Monthly Revenue Performance': 'Maandelijkse omzetprestaties',
  'Settings': 'Instellingen', 'Manage your company and platform settings.': 'Beheer uw bedrijfs- en platforminstellingen.',
  'Company Logo': 'Bedrijfslogo', 'Save brand settings': 'Huisstijl opslaan',
  'Company Information': 'Bedrijfsgegevens', 'Company Name': 'Bedrijfsnaam', 'Website': 'Website', 'Address': 'Adres', 'Country': 'Land',
  'Brand Settings': 'Huisstijlinstellingen', 'Click or drag new file to change logo': 'Klik of sleep een nieuw bestand om het logo te wijzigen',
  'Remove': 'Verwijderen', 'Click to upload or drag file here': 'Klik om een bestand te uploaden of sleep het hierheen',
  'Primary color': 'Primaire kleur', 'Accent color': 'Accentkleur', 'Background': 'Achtergrond',
  'Notification Settings': 'Meldingsinstellingen', 'New lead created': 'Nieuwe lead aangemaakt',
  'Receive a notification when there is a new lead': 'Ontvang een melding wanneer er een nieuwe lead is',
  'Quote accepted': 'Offerte geaccepteerd', 'Receive a notification when a quote has been accepted': 'Ontvang een melding wanneer een offerte is geaccepteerd',
  'Project updated': 'Project bijgewerkt', 'Receive a notification when a project status changes': 'Ontvang een melding wanneer een projectstatus wijzigt',
  'Payment received': 'Betaling ontvangen', 'Receive a notification on incoming payment': 'Ontvang een melding bij een binnenkomende betaling',
  'Planning & Agenda': 'Planning en agenda', 'Manage your weekly schedule, site visits, and installations.': 'Beheer uw wekelijkse planning, locatiebezoeken en installaties.',
  'Add Schedule Task': 'Planningstaak toevoegen', 'Total Scheduled': 'Totaal gepland', 'Upcoming Tasks': 'Aankomende taken',
  'Add New Planning Task': 'Nieuwe planningstaak toevoegen', 'Task Title': 'Taaktitel', 'Client Name': 'Klantnaam', 'Task Type': 'Taaktype',
  'Location Address': 'Locatieadres', 'Time Window': 'Tijdsvenster', 'Add Task': 'Taak toevoegen',
  'Site Visit': 'Locatiebezoek', 'Delivery': 'Levering', 'Assembly': 'Montage', 'Inspection': 'Inspectie', 'Upcoming': 'Aankomend',
  'No tasks matching this filter.': 'Geen taken gevonden voor dit filter.', 'July 2026 Calendar': 'Kalender juli 2026', 'July 2026': 'juli 2026',
  'Mo': 'Ma', 'Tu': 'Di', 'We': 'Wo', 'Th': 'Do', 'Fr': 'Vr', 'Sa': 'Za', 'Su': 'Zo',
  'My Projects': 'Mijn projecten', 'All your assigned projects in one place.': 'Al uw toegewezen projecten op één plek.',
  'Projects': 'Projecten', 'Manage, assign, and track client outdoor craftsmanship projects.': 'Beheer, wijs toe en volg ambachtelijke buitenprojecten van klanten.',
  'Create Project': 'Project aanmaken', 'Search projects by ID, name, customer or partner...': 'Zoek projecten op ID, naam, klant of partner...',
  'Assigned Partner': 'Toegewezen partner', 'Assigned': 'Toegewezen', 'Partner': 'Partner', 'Actions': 'Acties',
  'Edit': 'Bewerken', 'Unassigned': 'Niet toegewezen', 'ALL PROJECTS': 'ALLE PROJECTEN', 'All Projects': 'Alle projecten', 'Total': 'Totaal',
  'Client:': 'Klant:', 'Completion Progress': 'Voortgang', 'Update Project Status': 'Projectstatus bijwerken',
  'Project Name': 'Projectnaam', 'Progress Percentage': 'Voortgangspercentage', 'Division Category': 'Productcategorie',
  'Project Specifications & Materials': 'Projectspecificaties en materialen', 'Close': 'Sluiten', 'Cancel': 'Annuleren',
  'Save Changes': 'Wijzigingen opslaan', 'In Progress': 'In uitvoering', 'Review Required': 'Beoordeling nodig', 'Completed': 'Afgerond',
  'Update Status': 'Status bijwerken', 'View Details': 'Details bekijken',
  'Luxury Outdoor Kitchen Amsterdam': 'Luxe buitenkeuken Amsterdam', 'Garden Lounge Set Rotterdam': 'Tuinloungeset Rotterdam',
  'Custom Stone BBQ Utrecht': 'Op maat gemaakte stenen BBQ Utrecht', 'Outdoor Living Room Haarlem': 'Buitenwoonkamer Haarlem',
  'Notifications': 'Meldingen', 'Mark all read': 'Alles als gelezen markeren', 'new': 'nieuw',
  'Logout': 'Uitloggen', 'My Active Projects': 'Mijn actieve projecten', 'Upcoming Schedule': 'Aankomende planning', 'Full Agenda': 'Volledige agenda',
  'Workflow Lifecycle': 'Werkstroomlevenscyclus', 'Customer Name': 'Klantnaam', 'Customer': 'Klant', 'Email': 'E-mailadres',
  'Product Category': 'Productcategorie', 'Create Quote →': 'Offerte maken →', 'Create Project →': 'Project aanmaken →',
  'Assign Partner →': 'Partner toewijzen →', 'Generate & Store Invoice →': 'Factuur genereren en opslaan →',
  
  // Dashboard mock data strings
  'Lead Response': 'Lead Reactie', 'Quote Follow-up': 'Offerte Follow-up',
  'Today': 'Vandaag', 'Tomorrow': 'Morgen', 'Thursday': 'Donderdag', 'Friday': 'Vrijdag',
  'Quote Expiring': 'Offerte Verloopt', 'Expires in 2 days': 'Verloopt over 2 dagen',
  'Overdue Invoice': 'Openstaande Factuur', '€ 4,200 (5 days late)': '€ 4,200 (5 dagen te laat)',
  'Missing Delivery': 'Levering Ontbreekt', 'No week assigned': 'Nog geen week toegewezen',
  "This month's leads": 'Leads deze maand', 'In discussion': 'In gesprek',
  'Quote': 'Offerte', 'Won': 'Gewonnen'
  ,
  // Workflow, projects and planning UI
  'New Lead': 'Nieuwe lead', 'Requirement Discussion': 'Inventarisatiegesprek', 'Quote Prepared': 'Offerte opgesteld',
  'Quote Approved': 'Offerte akkoord', 'Project Created': 'Project aangemaakt', 'Partner Assigned': 'Partner toegewezen',
  'Planning & Installation': 'Planning en montage', 'Final inspection, invoice paid & closed': 'Eindinspectie, factuur betaald en afgesloten',
  'Initial inquiry received & lead intake': 'Eerste aanvraag ontvangen en lead geregistreerd', 'Customer meeting, specs & budget': 'Klantgesprek, specificaties en budget',
  'Cost estimate & quote generated': 'Kostenraming en offerte opgesteld', 'Client accepted quote & deposit paid': 'Klant heeft offerte geaccepteerd en aanbetaling voldaan',
  'Active project setup in system': 'Actief project in het systeem aangemaakt', 'Craftsman & supplier assigned': 'Vakman en leverancier toegewezen',
  'Delivery scheduled & build work': 'Levering gepland en werkzaamheden ingepland', 'WhatsApp': 'WhatsApp',
  'Step': 'Stap', 'Delivery Week': 'Leverweek', 'Target Delivery Week': 'Gewenste leverweek',
  'Filter by Status': 'Filter op status', 'Sort List By': 'Sorteer lijst op', 'Project Deadline (Earliest)': 'Opleverdatum (vroegste eerst)',
  'Project Name (A to Z)': 'Projectnaam (A tot Z)', 'Progress Percentage (Highest)': 'Voortgang (hoogste eerst)', 'Progress Percentage (Lowest)': 'Voortgang (laagste eerst)',
  'New / Custom Customer...': 'Nieuwe / aangepaste klant...', 'Pending': 'In behandeling',
  'All projects': 'Alle projecten', 'In progress': 'In uitvoering', 'Client Name': 'Klantnaam',
  'Project Scope & Specifications': 'Projectomvang en specificaties', 'Update Project Progress': 'Projectvoortgang bijwerken',
  'Partner Summary Report': 'Partnersamenvatting', 'Download PDF': 'PDF downloaden',
  'Total Assigned Projects:': 'Totaal toegewezen projecten:', 'Completed Projects:': 'Afgeronde projecten:', 'On-Time Completion Rate:': 'Op-tijd-afrondingspercentage:',
  'No tasks matching this filter.': 'Geen taken gevonden voor dit filter.', 'July 2026 Calendar': 'Kalender juli 2026',
  'Site Visit': 'Locatiebezoek', 'Delivery': 'Levering', 'Assembly': 'Montage', 'Inspection': 'Inspectie', 'Upcoming': 'Aankomend',
  'Open': 'Openstaand', 'Submitted Offers': 'Ingediende offertes', 'Open Requests': 'Openstaande aanvragen',
  'Customer:': 'Klant:', 'Client deadline:': 'Klantdeadline:', 'Submit by': 'Indienen voor', 'Project Specs': 'Projectspecificaties',
  'Your Build Price (€) *': 'Uw bouwprijs (€) *', 'Validity *': 'Geldigheid *', 'Lead Time (weeks) *': 'Levertijd (weken) *',
  'Remarks (optional)': 'Opmerkingen (optioneel)', 'Select...': 'Selecteer...', 'No offers submitted yet.': 'Nog geen offertes ingediend.',
  'Submitted': 'Ingediend', 'In Review': 'In beoordeling', 'Submitted On': 'Ingediend op', 'Build Price': 'Bouwprijs', 'Validity': 'Geldigheid',
  'Lead Time': 'Levertijd', 'Admin Status': 'Adminstatus', 'Remarks': 'Opmerkingen',
  'Profile information updated successfully!': 'Profielgegevens zijn opgeslagen.', 'Password updated successfully!': 'Wachtwoord is bijgewerkt.',
  'New passwords do not match!': 'De nieuwe wachtwoorden komen niet overeen.', 'Avatar updated successfully!': 'Profielfoto is bijgewerkt.',

  // Route-level labels found during the complete EN/NL visual audit
  'Leads Management': 'Leadsbeheer', 'Search by name or phone...': 'Zoek op naam of telefoon...',
  'Product Type': 'Producttype', 'Desired Size': 'Gewenste afmeting', 'Source / Campaign': 'Bron / campagne',
  'Last Contact': 'Laatste contact', 'No data available': 'Geen gegevens beschikbaar', 'New lead': 'Nieuwe lead',
  'My Assigned Projects': 'Mijn toegewezen projecten', 'Assigned Projects': 'Toegewezen projecten',
  'Overview of your assigned delivery projects, specifications, delivery locations and agreed build price.': 'Overzicht van uw toegewezen opleverprojecten, specificaties, opleverlocaties en overeengekomen bouwsom.',
  'Assigned Projects': 'Toegewezen projecten', 'Completed': 'Afgerond',
  'Bank & VAT (Bank Transactions & Tax)': 'Bank & btw (banktransacties en belasting)',
  'Overview of bank transactions and automatic 21% VAT calculation.': 'Overzicht van banktransacties en automatische 21% btw-berekening.',
  'Add Transaction': 'Transactie toevoegen', 'Bank Balance': 'Banksaldo', 'Total Income': 'Totale inkomsten',
  'Total Expenses': 'Totale uitgaven', 'Net VAT Payable': 'Netto btw afdragen',
  'VAT Return Overview (21% rate)': 'Btw-aangifteoverzicht (tarief 21%)', 'Quarter Q4 2023': 'Kwartaal Q4 2023',
  'VAT Received (Sales)': 'Btw ontvangen (verkoop)', 'VAT Paid (Purchases)': 'Btw betaald (voorbelasting)',
  'To be paid to tax authority': 'Te betalen aan Belastingdienst', 'Search transaction or category...': 'Zoek transactie of categorie...',
  'Income': 'Inkomsten', 'Expenses': 'Uitgaven', 'Transaction ID': 'Transactie-ID', 'Description': 'Omschrijving',
  'VAT & Taxes': 'Btw & belastingen', 'Submit Return (Tax Authority)': 'Aangifte indienen (Belastingdienst)',
  'Quarterly VAT return and Tax Authority overview.': 'Kwartalaangifte omzetbelasting en Belastingdienst-overzicht.',
  'Revenue excl. VAT': 'Omzet excl. btw', 'VAT received (sales)': 'Btw ontvangen (verkoop)',
  'Input VAT (purchases)': 'Voorbelasting (btw inkoop)', 'Net VAT to pay': 'Netto te betalen btw',
  'Return status: Not submitted': 'Aangiftestatus: nog niet ingediend', 'VAT Scheme Q4 2023': 'Rekenschema omzetbelasting Q4 2023',
  'Not submitted yet': 'Nog niet ingediend', 'Partners Module': 'Partnermodule',
  'Manage active craftspeople and the recruitment pipeline for new partners.': 'Beheer actieve ambachtelijke vakmensen en de wervingspijplijn voor nieuwe partners.',
  'Add New Partner': 'Nieuwe partner toevoegen', 'Active Partners List': 'Lijst actieve partners',
  'Prospective Partner Pipeline (Kanban)': 'Potentiële partnerpijplijn (Kanban)',
  'Search by partner name, region or specialty...': 'Zoek op partnernaam, regio of vakgebied...',
  'Active': 'Actief', 'Inactive': 'Inactief', 'Partner / Company': 'Partner / bedrijf',
  'Region / Location': 'Regio / locatie', 'Product Specialism': 'Productspecialisme', 'Active Projects': 'Actieve projecten',
  'Workload Indicator': 'Werkdrukindicator', 'Planning & 6-Week Calendar': 'Planning en 6-wekenkalender',
  '6-week delivery calendar, partner capacity and scheduling conflict warnings.': '6-weken opleverkalender, partner-capaciteit en waarschuwingen voor planningsconflicten.',
  'Filter Partner:': 'Filter partner:', 'All Partners': 'Alle partners', '6-Week Delivery Planning Grid': '6-weken opleverplanning',
  'Total Scheduled Deliveries:': 'Totaal ingeplande opleveringen:', 'deliveries': 'opleveringen',
  'No delivery planned in': 'Geen oplevering gepland in'
};

// Exact strings that are already present in screen components.  Include both
// the main pages and their filter / empty / modal states, because a language
// selector is only reliable when all of those states use the same vocabulary.
Object.assign(LEGACY_TEXT, {
  'Leads Management': 'Leadbeheer',
  'New Lead': 'Nieuwe lead',
  'Search by name or phone...': 'Zoek op naam of telefoon...',
  'Export as CSV': 'Exporteren als CSV', 'Import from CSV': 'Importeren vanuit CSV',
  'Filters': 'Filters', 'Reset': 'Herstellen', 'Status Filter': 'Statusfilter',
  'Product Type': 'Producttype', 'Desired Size': 'Gewenste afmeting',
  'Source': 'Bron', 'Source / Campaign': 'Bron / campagne', 'Last Contact': 'Laatste contact',
  'Customer Name': 'Klantnaam', 'Phone Number': 'Telefoonnummer',
  'Email Address': 'E-mailadres', 'Save Lead': 'Lead opslaan', 'Edit Lead': 'Lead bewerken',
  'Add Lead': 'Lead toevoegen', 'Reason for Loss?': 'Reden van verlies?',
  'Please specify why this deal was lost. This helps improve future sales strategies.': 'Geef aan waarom deze deal verloren is. Dit helpt toekomstige verkoopstrategieën te verbeteren.',
  'Please enter a reason.': 'Vul een reden in.', 'Confirm Loss': 'Verlies bevestigen',
  'Price too high, chose competitor...': 'Bijv. prijs te hoog, concurrent gekozen...',
  'Bank & VAT (Bank Transactions & Tax)': 'Bank & btw',
  'Bank & BTW (Bank Transactions & Tax)': 'Bank & btw',
  'Overview of bank transactions and automatic 21% VAT calculation.': 'Overzicht van banktransacties en automatische btw-berekening van 21%.',
  'Transactie Toevoegen': 'Transactie toevoegen', 'Add Transaction': 'Transactie toevoegen',
  'Bank Balance': 'Banksaldo', 'Bank Saldo': 'Banksaldo', 'Total Income': 'Totale inkomsten',
  'Totale Inkomsten': 'Totale inkomsten', 'Total Expenses': 'Totale uitgaven', 'Totale Uitgaven': 'Totale uitgaven',
  'Net VAT Payable': 'Netto btw afdragen', 'Netto BTW Afdragen (21%)': 'Netto btw afdragen (21%)',
  'VAT Return Overview (21% rate)': 'Btw-aangifteoverzicht (tarief 21%)',
  'BTW Aangifte Overzicht (21% Tarief)': 'Btw-aangifteoverzicht (tarief 21%)',
  'Quarter Q4 2023': 'Kwartaal Q4 2023', 'Kwartaal Q4 2023': 'Kwartaal Q4 2023',
  'VAT Received (Sales)': 'Btw ontvangen (verkoop)', 'BTW Ontvangen (Verkoop)': 'Btw ontvangen (verkoop)',
  'VAT Paid (Purchases)': 'Btw betaald (voorbelasting)', 'BTW Betaald (Voorbelasting)': 'Btw betaald (voorbelasting)',
  'To be paid to tax authority': 'Te betalen aan Belastingdienst', 'Te Betalen aan Belastingdienst': 'Te betalen aan Belastingdienst',
  'Search transaction or category...': 'Zoek transactie of categorie...',
  'Zoek transactie of categorie...': 'Zoek transactie of categorie...',
  'Income': 'Inkomsten', 'Expenses': 'Uitgaven', 'Expense': 'Uitgave', 'Type': 'Type',
  'Transaction ID': 'Transactie-ID', 'Transactie ID': 'Transactie-ID', 'Description': 'Omschrijving',
  'Omschrijving': 'Omschrijving', 'Amount': 'Bedrag', 'Bedrag': 'Bedrag', 'Date': 'Datum', 'Datum': 'Datum',
  'Category': 'Categorie', 'Categorie': 'Categorie', 'Save': 'Opslaan', 'Opslaan': 'Opslaan',
  'VAT & Taxes': 'Btw & belastingen', 'Btw & Belastingen (VAT & Taxes)': 'Btw & belastingen',
  'Quarterly VAT return and Tax Authority overview.': 'Kwartalaangifte omzetbelasting en overzicht van de Belastingdienst.',
  'Kwartaalaangifte omzetbelasting (21% BTW) en Belastingdienst overzicht.': 'Kwartalaangifte omzetbelasting (21% btw) en overzicht van de Belastingdienst.',
  'Submit Return (Tax Authority)': 'Aangifte indienen bij de Belastingdienst', 'Aangifte Indienen (Belastingdienst)': 'Aangifte indienen bij de Belastingdienst',
  'Revenue excl. VAT': 'Omzet excl. btw', 'Omzet Excl. BTW': 'Omzet excl. btw',
  'VAT received (sales)': 'Btw ontvangen (verkoop)', 'Input VAT (purchases)': 'Voorbelasting (btw op inkopen)',
  'Voorbelasting (BTW Inkoop)': 'Voorbelasting (btw op inkopen)', 'Net VAT to pay': 'Netto te betalen btw',
  'Netto Te Betalen BTW': 'Netto te betalen btw', 'Return status: Not submitted': 'Aangiftestatus: nog niet ingediend',
  'Aangiftestatus: Nog niet ingediend': 'Aangiftestatus: nog niet ingediend',
  'VAT Scheme Q4 2023': 'Btw-schema Q4 2023', 'Rekenschema Omzetbelasting Q4 2023': 'Btw-schema Q4 2023',
  'Not submitted yet': 'Nog niet ingediend', 'Nog niet ingediend': 'Nog niet ingediend',
  'Invoices': 'Facturen', 'Facturen (Invoices)': 'Facturen',
  'Automatically generated from approved quotes (50% deposit / 50% completion).': 'Automatisch gegenereerd uit goedgekeurde offertes (50% aanbetaling / 50% oplevering).',
  'Automatisch gegeneerd uit goedgekeurde offertes (50% aanbetaling / 50% oplevering).': 'Automatisch gegenereerd uit goedgekeurde offertes (50% aanbetaling / 50% oplevering).',
  'New Invoice': 'Nieuwe factuur', 'Nieuwe Factuur': 'Nieuwe factuur', 'Total Invoices': 'Totaal facturen',
  'Totaal Facturen': 'Totaal facturen', 'Paid': 'Betaald', 'Pending': 'Openstaand', 'Overdue': 'Vervallen',
  'Openstaand (Pending)': 'Openstaand', 'Vervallen (Overdue)': 'Vervallen',
  'Invoice Number': 'Factuurnummer', 'FACTUUR NR.': 'FACTUURNR.', 'Customer Name': 'Klantnaam',
  'Type / Description': 'Type / omschrijving', 'TYPE / OMSCHRIJVING': 'TYPE / OMSCHRIJVING',
  'Due Date': 'Vervaldatum', 'VERVALDATUM': 'VERVALDATUM', 'Create New Invoice': 'Nieuwe factuur maken',
  'Nieuwe Factuur Aanmaken': 'Nieuwe factuur maken', 'Invoice Type': 'Factuurtype', 'Factuur Type': 'Factuurtype',
  'Deposit (50%)': 'Aanbetaling (50%)', 'Completion invoice (50%)': 'Eindfactuur (50%)',
  'Full invoice (100%)': 'Volledige factuur (100%)', 'Print / Export PDF': 'Afdrukken / PDF exporteren',
  'Afdrukken / Export PDF': 'Afdrukken / PDF exporteren', 'Including 21% VAT': 'Inclusief 21% btw',
  'Projects': 'Projecten', 'Create Project': 'Project aanmaken',
  'Search projects by ID, name, customer or partner...': 'Zoek projecten op ID, naam, klant of partner...',
  'Partners Module': 'Partnermodule', 'Beheer actieve ambachtelijke vakmannen en sollicitatie-pipeline voor nieuwe partners.': 'Beheer actieve ambachtelijke vakmensen en de wervingspijplijn voor nieuwe partners.',
  'Manage active craftspeople and the recruitment pipeline for new partners.': 'Beheer actieve ambachtelijke vakmensen en de wervingspijplijn voor nieuwe partners.',
  'Nieuwe Partner Toevoegen': 'Nieuwe partner toevoegen', 'Add New Partner': 'Nieuwe partner toevoegen',
  'Active Partners List': 'Lijst actieve partners', 'Prospective Partner Recruitment Pipeline': 'Wervingspijplijn voor potentiële partners',
  'Prospective Partner Pipeline (Kanban)': 'Pijplijn potentiële partners (Kanban)',
  'Search by partner name, region or specialty...': 'Zoek op partnernaam, regio of specialisme...',
  'Zoek op partner naam, regio of vakgebied...': 'Zoek op partnernaam, regio of specialisme...',
  'Active': 'Actief', 'Inactive': 'Inactief', 'Partner / Company': 'Partner / bedrijf',
  'Region / Location': 'Regio / locatie', 'Product Specialism': 'Productspecialisme',
  'Active Projects': 'Actieve projecten', 'Workload Indicator': 'Werkdrukindicator',
  'Planning & 6-Week Calendar': 'Planning en 6-wekenkalender', 'Planning & 6-Weken Kalender': 'Planning en 6-wekenkalender',
  '6-week delivery calendar, partner capacity and scheduling conflict warnings.': '6-wekenopleverkalender, partnercapaciteit en waarschuwingen voor planningsconflicten.',
  '6-Weken opleverkalender, partner-capaciteit en waarschuwingen voor planningsconflicten.': '6-wekenopleverkalender, partnercapaciteit en waarschuwingen voor planningsconflicten.',
  'Filter Partner:': 'Partner filteren:', 'Filter Partner': 'Partner filteren', 'All Partners': 'Alle partners',
  'Alle Partners (0)': 'Alle partners (0)', '6-Week Delivery Planning Grid': '6-wekenopleverplanning',
  '6-Weken Opleverplanning Grid': '6-wekenopleverplanning', 'Total Scheduled Deliveries:': 'Totaal ingeplande opleveringen:',
  'Totaal Ingeplande Opleveringen:': 'Totaal ingeplande opleveringen:', 'No delivery planned in': 'Geen oplevering gepland in',
  'Geen oplevering gepland in': 'Geen oplevering gepland in', 'deliveries': 'opleveringen', 'oplevering(en)': 'oplevering(en)',
  'My Assigned Projects': 'Mijn toegewezen projecten', 'Mijn Toegewezen Projecten': 'Mijn toegewezen projecten',
  'Overview of your assigned delivery projects, specifications, delivery locations and agreed build price.': 'Overzicht van uw toegewezen opleverprojecten, specificaties, opleverlocaties en overeengekomen bouwsom.',
  'Overzicht van uw toegewezen opleverprojecten, specificaties, opleverlocaties en overeengekomen bouwsom.': 'Overzicht van uw toegewezen opleverprojecten, specificaties, opleverlocaties en overeengekomen bouwsom.',
  'Assigned Projects': 'Toegewezen projecten', 'TOEGEWEZEN PROJECTEN': 'TOEGEWEZEN PROJECTEN',
  'In Progress': 'In uitvoering', 'IN UITVOERING': 'IN UITVOERING', 'Completed': 'Afgerond', 'COMPLETED': 'AFGEROND',
  'Update Status': 'Status bijwerken', 'View Details': 'Details bekijken', 'My Projects': 'Mijn projecten',
  'Price Requests': 'Prijsaanvragen', 'Documents': 'Documenten', 'My Details': 'Mijn gegevens',
  'Planning': 'Planning', 'Dashboard': 'Dashboard', 'Bookkeeping': 'Boekhouding', 'Tasks': 'Taken',
  'No data available': 'Geen gegevens beschikbaar', 'Geen gegevens beschikbaar': 'Geen gegevens beschikbaar',
  'No Data Available': 'Geen gegevens beschikbaar', 'All': 'Alle', 'Alle': 'Alle', 'Status': 'Status',
  'Search...': 'Zoeken...', 'Zoeken...': 'Zoeken...', 'No results found': 'Geen resultaten gevonden'
  ,
  // Quotes and the partner-project detail cards
  'Manage quotes with bespoke items, discount % and PDF export.': 'Beheer offertes met maatwerkartikelen, korting % en PDF-export.',
  'Beheer offertes met maatwerk artikelen, korting % en PDF export.': 'Beheer offertes met maatwerkartikelen, korting % en PDF-export.',
  'Total Quotes': 'Totaal offertes', 'Totaal Offertes': 'Totaal offertes', 'Draft': 'Concept',
  'Sent': 'Verzonden', 'Accepted': 'Geaccepteerd', 'Search by customer, project or quote number...': 'Zoek op klant, project of offertenummer...',
  'Zoek op klant, project of offerte nr...': 'Zoek op klant, project of offertenummer...',
  'Sort by': 'Sorteren op', 'Sorteren op': 'Sorteren op', 'Created date (newest first)': 'Aanmaakdatum (nieuwste eerst)',
  'Datum Aangemaakt (Nieuwste)': 'Aanmaakdatum (nieuwste eerst)', 'Created date (oldest first)': 'Aanmaakdatum (oudste eerst)',
  'Datum Aangemaakt (Oudste)': 'Aanmaakdatum (oudste eerst)', 'Amount (highest first)': 'Bedrag (hoogste eerst)',
  'Bedrag (Hoogste eerst)': 'Bedrag (hoogste eerst)', 'Amount (lowest first)': 'Bedrag (laagste eerst)',
  'Bedrag (Laagste eerst)': 'Bedrag (laagste eerst)', 'Customer name (A–Z)': 'Klantnaam (A–Z)',
  'Klantnaam (A tot Z)': 'Klantnaam (A–Z)', 'Quote Builder': 'Offertebouwer', 'Create Quote': 'Offerte maken',
  'Edit Quote': 'Offerte bewerken', 'New Quote': 'Nieuwe offerte', 'Customer': 'Klant', 'Project': 'Project',
  'Project Type': 'Projecttype', 'Approval status': 'Goedkeuringsstatus', 'Goedkeuringsstatus (Status)': 'Goedkeuringsstatus',
  'Discount %': 'Korting %', 'Korting % (Discount %)': 'Korting %', 'Quote Items': 'Offerteartikelen',
  'Offerte Artikelen (Multi-Item Pricing)': 'Offerteartikelen', 'Add Item': 'Artikel toevoegen', 'Artikel Toevoegen': 'Artikel toevoegen',
  'Item description...': 'Artikelomschrijving...', 'Omschrijving artikel...': 'Artikelomschrijving...', 'Quantity': 'Aantal', 'Aantal': 'Aantal',
  'Price (€)': 'Prijs (€)', 'Subtotal:': 'Subtotaal:', 'Subtotaal:': 'Subtotaal:', 'Discount': 'Korting',
  'Total amount (incl. VAT):': 'Totaalbedrag (incl. btw):', 'Totaalbedrag (Incl. BTW):': 'Totaalbedrag (incl. btw):',
  'Save Quote': 'Offerte opslaan', 'Offerte Opslaan': 'Offerte opslaan', 'Quote PDF Preview': 'Offerte-PDF-voorbeeld',
  'Print / Export PDF': 'Afdrukken / PDF exporteren', 'Quote For (Client):': 'Offerte voor (klant):',
  'Offerte Voor (Client):': 'Offerte voor (klant):', 'Project Specs & Delivery': 'Projectspecificaties en oplevering',
  'Agreed Build Price': 'Overeengekomen bouwsom', 'Overeengekomen Bouwsom': 'Overeengekomen bouwsom',
  'Delivery Deadline': 'Opleverdeadline', 'Opleverdeadline': 'Opleverdeadline',
  'Delivery Location / Address': 'Opleverlocatie / bezorgadres', 'Opleverlocatie / Bezorgadres': 'Opleverlocatie / bezorgadres',
  'Progress': 'Voortgang', 'Voortgang (Progress)': 'Voortgang', 'Update Progress': 'Voortgang bijwerken',
  'Voortgang Bijwerken': 'Voortgang bijwerken', 'View Specifications': 'Specificaties bekijken',
  'Bekijk Specificaties': 'Specificaties bekijken', 'Update Progress & Status': 'Voortgang en status bijwerken',
  'Voortgang & Status Bijwerken': 'Voortgang en status bijwerken', 'Progress Percentage': 'Voortgangspercentage',
  'Voortgang Percentage': 'Voortgangspercentage', 'Cancel': 'Annuleren', 'Annuleren': 'Annuleren',
  'Buitenkeukens': 'Outdoor kitchens', 'Kliko-ombouw': 'Wheelie-bin enclosure', 'Snijplanken': 'Cutting boards',
  // Exact visible Dutch variants used by Finance, Taxes, Invoices and Planning
  'Btw & Belastingen (VAT & Taxes)': 'Btw & belastingen', 'Belast met 21% tarief': 'Taxed at the 21% rate',
  'Verschuldigde omzetbelasting': 'VAT due on sales', 'Aftrekbare BTW uitgaven': 'Deductible VAT on expenses',
  'Aangifte status: Nog niet ingediend': 'Return status: Not submitted',
  'Totaal te betalen / te ontvangen (Netto Afdragen)': 'Total to pay / receive (net VAT)',
  'Facturen (Invoices)': 'Facturen', 'Betaald (Paid)': 'Betaald', 'Openstaand (Pending)': 'Openstaand',
  'Vervallen (Overdue)': 'Vervallen', 'Zoek op klant of factuur nummer...': 'Search by customer or invoice number...',
  'Zoek op klant of factuur nummer...': 'Search by customer or invoice number...',
  'Datum (Nieuwste Eerst)': 'Date (newest first)', 'Datum (Oudste Eerst)': 'Date (oldest first)',
  'Bedrag (Hoogste Eerst)': 'Amount (highest first)', 'Bedrag (Laagste Eerst)': 'Amount (lowest first)',
  '50% Aanbetaling': '50% deposit', '50% Eindfactuur': '50% final invoice', '100% Volledige Factuur': '100% full invoice',
  'Factuur Aan (Client):': 'Invoice To (Client):', 'Omschrijving / Type:': 'Description / Type:',
  'Planning en 6-wekenkalender': 'Planning & 6-week calendar', 'Capaciteitsconflict! Partner Overbelast': 'Capacity conflict! Partner overloaded',
  'Overbelast': 'Overloaded', 'Klant': 'Customer', 'Toegewezen Partner': 'Assigned Partner',
  'Opleverdatum': 'Delivery date', 'Partner Toewijzen': 'Assign Partner', 'Wijs een vakman toe aan project': 'Assign a craftsperson to project',
  'Selecteer': 'Select', 'Sluiten': 'Close', 'Bekijk Profiel': 'View Profile',
  'Beschikbaar': 'Available', 'Druk (Busy)': 'Busy', 'Volgeboekt': 'Fully booked'
});

// Some translations have the same Dutch result.  Keep the EN direction
// explicit so one key cannot overwrite another when a map is reversed.
const LEGACY_NL_TO_EN = {
  ...Object.fromEntries(Object.entries(LEGACY_TEXT).map(([enText, nlText]) => [nlText, enText])),
  'Leadbeheer': 'Leads Management', 'Nieuwe lead': 'New Lead',
  'Zoek op naam of telefoon...': 'Search by name or phone...', 'Exporteren als CSV': 'Export as CSV',
  'Importeren vanuit CSV': 'Import from CSV', 'Herstellen': 'Reset', 'Statusfilter': 'Status Filter',
  'Producttype': 'Product Type', 'Gewenste afmeting': 'Desired Size', 'Bron': 'Source',
  'Klantnaam': 'Customer Name', 'Telefoonnummer': 'Phone Number', 'E-mailadres': 'Email Address',
  'Lead opslaan': 'Save Lead', 'Lead bewerken': 'Edit Lead', 'Lead toevoegen': 'Add Lead',
  'Bank & btw': 'Bank & VAT (Bank Transactions & Tax)', 'Banksaldo': 'Bank Balance',
  'Totale inkomsten': 'Total Income', 'Totale uitgaven': 'Total Expenses', 'Netto btw afdragen': 'Net VAT Payable',
  'Netto btw afdragen (21%)': 'Net VAT Payable (21%)', 'Btw-aangifteoverzicht (tarief 21%)': 'VAT Return Overview (21% rate)',
  'Kwartaal Q4 2023': 'Quarter Q4 2023', 'Btw ontvangen (verkoop)': 'VAT Received (Sales)',
  'Btw betaald (voorbelasting)': 'VAT Paid (Purchases)', 'Te betalen aan Belastingdienst': 'To be paid to tax authority',
  'Zoek transactie of categorie...': 'Search transaction or category...', 'Inkomsten': 'Income', 'Uitgaven': 'Expenses',
  'Uitgave': 'Expense', 'Transactie-ID': 'Transaction ID', 'Omschrijving': 'Description',
  'Bedrag': 'Amount', 'Datum': 'Date', 'Categorie': 'Category', 'Btw & belastingen': 'VAT & Taxes',
  'Aangifte indienen bij de Belastingdienst': 'Submit Return (Tax Authority)',
  'Omzet excl. btw': 'Revenue excl. VAT', 'Voorbelasting (btw op inkopen)': 'Input VAT (purchases)',
  'Netto te betalen btw': 'Net VAT to pay', 'Nog niet ingediend': 'Not submitted yet',
  'Facturen': 'Invoices', 'Totaal facturen': 'Total Invoices', 'Nieuwe factuur': 'New Invoice',
  'Openstaand': 'Pending', 'Vervallen': 'Overdue', 'Factuurnummer': 'Invoice Number',
  'Factuurtype': 'Invoice Type', 'Vervaldatum': 'Due Date', 'Nieuwe factuur maken': 'Create New Invoice',
  'Partnermodule': 'Partners Module', 'Nieuwe partner toevoegen': 'Add New Partner',
  'Lijst actieve partners': 'Active Partners List', 'Planning en 6-wekenkalender': 'Planning & 6-Week Calendar',
  'Partner filteren:': 'Filter Partner:', 'Alle partners': 'All Partners', '6-wekenopleverplanning': '6-Week Delivery Planning Grid',
  'Mijn toegewezen projecten': 'My Assigned Projects', 'Toegewezen projecten': 'Assigned Projects',
  'In uitvoering': 'In Progress', 'Afgerond': 'Completed', 'Status bijwerken': 'Update Status',
  'Details bekijken': 'View Details', 'Mijn projecten': 'My Projects', 'Prijsaanvragen': 'Price Requests',
  'Mijn gegevens': 'My Details', 'Documenten': 'Documents', 'Boekhouding': 'Bookkeeping', 'Taken': 'Tasks',
  'Geen gegevens beschikbaar': 'No data available', 'Geen resultaten gevonden': 'No results found',
  'Zoeken...': 'Search...'
  ,
  'Beheer offertes met maatwerkartikelen, korting % en PDF-export.': 'Manage quotes with bespoke items, discount % and PDF export.',
  'Totaal offertes': 'Total Quotes', 'Zoek op klant, project of offertenummer...': 'Search by customer, project or quote number...',
  'Aanmaakdatum (nieuwste eerst)': 'Created date (newest first)', 'Aanmaakdatum (oudste eerst)': 'Created date (oldest first)',
  'Bedrag (hoogste eerst)': 'Amount (highest first)', 'Bedrag (laagste eerst)': 'Amount (lowest first)',
  'Klantnaam (A–Z)': 'Customer name (A–Z)', 'Offertebouwer': 'Quote Builder', 'Offerte maken': 'Create Quote',
  'Offerte bewerken': 'Edit Quote', 'Nieuwe offerte': 'New Quote', 'Klant': 'Customer', 'Projecttype': 'Project Type',
  'Goedkeuringsstatus': 'Approval status', 'Korting %': 'Discount %', 'Offerteartikelen': 'Quote Items',
  'Artikel toevoegen': 'Add Item', 'Artikelomschrijving...': 'Item description...', 'Aantal': 'Quantity',
  'Totaalbedrag (incl. btw):': 'Total amount (incl. VAT):', 'Offerte opslaan': 'Save Quote',
  'Offerte-PDF-voorbeeld': 'Quote PDF Preview', 'Offerte voor (klant):': 'Quote For (Client):',
  'Projectspecificaties en oplevering': 'Project Specs & Delivery', 'Overeengekomen bouwsom': 'Agreed Build Price',
  'Opleverdeadline': 'Delivery Deadline', 'Opleverlocatie / bezorgadres': 'Delivery Location / Address',
  'Voortgang': 'Progress', 'Voortgang bijwerken': 'Update Progress', 'Specificaties bekijken': 'View Specifications',
  'Voortgang en status bijwerken': 'Update Progress & Status', 'Voortgangspercentage': 'Progress Percentage',
  'Outdoor kitchens': 'Outdoor kitchens', 'Wheelie-bin enclosure': 'Wheelie-bin enclosure', 'Cutting boards': 'Cutting boards',
  'Btw & Belastingen (VAT & Taxes)': 'VAT & Taxes', 'Btw & belastingen': 'VAT & Taxes',
  'Taxed at the 21% rate': 'Taxed at the 21% rate', 'VAT due on sales': 'VAT due on sales',
  'Deductible VAT on expenses': 'Deductible VAT on expenses', 'Return status: Not submitted': 'Return status: Not submitted',
  'Facturen (Invoices)': 'Invoices', 'Facturen': 'Invoices', 'Betaald': 'Paid', 'Zoek op klant of factuur nummer...': 'Search by customer or invoice number...',
  'Date (newest first)': 'Date (newest first)', 'Date (oldest first)': 'Date (oldest first)',
  'Amount (highest first)': 'Amount (highest first)', 'Amount (lowest first)': 'Amount (lowest first)',
  '50% deposit': '50% deposit', '50% final invoice': '50% final invoice', '100% full invoice': '100% full invoice',
  'Invoice To (Client):': 'Invoice To (Client):', 'Description / Type:': 'Description / Type:',
  'Planning en 6-wekenkalender': 'Planning & 6-week calendar', 'Capaciteitsconflict! Partner Overbelast': 'Capacity conflict! Partner overloaded',
  'Overloaded': 'Overloaded', 'Customer': 'Customer', 'Assigned Partner': 'Assigned Partner', 'Delivery date': 'Delivery date',
  'Assign Partner': 'Assign Partner', 'Assign a craftsperson to project': 'Assign a craftsperson to project', 'Select': 'Select',
  'View Profile': 'View Profile', 'Available': 'Available', 'Busy': 'Busy', 'Fully booked': 'Fully booked',
  'Mijn Toegewezen Projecten': 'My Assigned Projects',
  'Overzicht van uw toegewezen opleverprojecten, specificaties, opleverlocaties en overeengekomen bouwsom.': 'Overview of your assigned delivery projects, specifications, delivery locations and agreed build price.',
  'Toegewezen Projecten': 'Assigned Projects', 'In Uitvoering': 'In Progress', 'AFGEROND': 'COMPLETED',
  'Totaal': 'Total', 'Buitenkeukens': 'Outdoor kitchens', 'Kliko-ombouw': 'Wheelie-bin enclosure', 'Snijplanken': 'Cutting boards'
};

// Completion vocabulary found by the static UI audit.  This covers labels in
// conditional panels and dialogs as well as route headers, so a user can
// switch language before or after opening a modal without getting mixed copy.
Object.assign(LEGACY_TEXT, {
  'Workflow': 'Werkstroom', 'Location & Product': 'Locatie en product', 'Initial Intake Notes': 'Eerste intake-notities',
  'Desired Size (Size)': 'Gewenste afmeting', 'Gewenste Maat (Size)': 'Gewenste afmeting',
  'Special Requirements': 'Bijzondere vereisten', 'Bijzondere Vereisten (Special Requirements)': 'Bijzondere vereisten',
  'Response Deadline': 'Reactiedeadline', 'Reactie Deadline (Response Deadline)': 'Reactiedeadline',
  'Build Price': 'Bouwprijs', 'Bouwprijs (Build Price)': 'Bouwprijs', 'Valid Until': 'Geldig tot',
  'Geldig Tot (Valid Until)': 'Geldig tot', 'Lead Time': 'Levertijd', 'Levertijd (Lead Time)': 'Levertijd',
  'Partner Remarks': 'Opmerkingen van partner', 'Opmerkingen Partner (Partner Remarks)': 'Opmerkingen van partner',
  'Work Order': 'Werkopdracht', 'Active Project': 'Actief project', 'Target Delivery Date': 'Gewenste opleverdatum',
  'Assigned Team': 'Toegewezen team', 'Build Progress': 'Bouwvoortgang', 'Craftsman Partner': 'Vakmanpartner',
  'Workload Status': 'Werkdrukstatus', 'Available (2 Projects)': 'Beschikbaar (2 projecten)',
  'Delivery Week': 'Opleverweek', 'Site Assembly & Delivery': 'Montage en oplevering op locatie',
  'Address:': 'Adres:', 'Project Completed & Archived': 'Project afgerond en gearchiveerd',
  'Auto-Prefilled Quote Builder': 'Automatisch ingevulde offertebouwer', 'Quote Total (€)': 'Offertetotaal (€)',
  'Save & Send Quote →': 'Offerte opslaan en versturen →', 'Auto-Create Active Project': 'Automatisch actief project aanmaken',
  'Save & Create Active Project →': 'Opslaan en actief project aanmaken →', 'Assign Craftsman Partner': 'Vakmanpartner toewijzen',
  'Select Craftsman Partner': 'Vakmanpartner selecteren', 'Confirm Partner Work Order →': 'Werkopdracht partner bevestigen →',
  'Auto-Generate Final Invoice': 'Eindfactuur automatisch genereren', 'Invoice #': 'Factuurnr.',
  'Total Paid Amount (€)': 'Totaal betaald bedrag (€)', 'Generate & Store Invoice →': 'Factuur genereren en opslaan →',
  'My Profile': 'Mijn profiel', 'Manage your profile details and security settings.': 'Beheer uw profielgegevens en beveiligingsinstellingen.',
  'Full Name': 'Volledige naam', 'Language': 'Taal', 'Save changes': 'Wijzigingen opslaan',
  'Current Password': 'Huidig wachtwoord', 'New Password': 'Nieuw wachtwoord', 'Confirm New Password': 'Nieuw wachtwoord bevestigen',
  'Update password': 'Wachtwoord bijwerken', 'Dutch (Nederlands)': 'Nederlands',
  'Finance': 'Boekhouding', 'Track revenue, invoices and payments.': 'Volg omzet, facturen en betalingen.',
  'Export CSV': 'CSV exporteren', 'View All': 'Alles bekijken', 'Total Revenue': 'Totale omzet',
  'This Month': 'Deze maand', 'Outstanding': 'Openstaand', 'Paid (Ytd)': 'Betaald (jaar tot nu toe)',
  'Revenue Overview (2023)': 'Omzetoverzicht (2023)',
  'Profit & Loss': 'Winst en verlies', 'Winst & Verlies (Profit & Loss)': 'Winst en verlies',
  'Financial overview and profit margin analysis per project.': 'Financieel overzicht en analyse van de winstmarge per project.',
  'Financieel overzicht en winstmarge analyse per project.': 'Financieel overzicht en analyse van de winstmarge per project.',
  'Total Revenue': 'Totale omzet', 'Totale Omzet': 'Totale omzet', 'Total Project Costs': 'Totale projectkosten',
  'Totale Projectkosten': 'Totale projectkosten', 'Total Gross Profit': 'Totale brutowinst', 'Totale Brutowinst': 'Totale brutowinst',
  'Average Margin': 'Gemiddelde marge', 'Gemiddelde Marge': 'Gemiddelde marge',
  'Settings': 'Instellingen', 'Instellingen (Admin Settings)': 'Instellingen',
  'Manage company details, VAT rates, numbering formats, user rights and dynamic product fields.': 'Beheer bedrijfsgegevens, btw-tarieven, nummeringsindelingen, gebruikersrechten en dynamische productvelden.',
  'Beheer bedrijfsgegevens, btw-tarieven, nummeringsindelingen, gebruikersrechten en dynamische productvelden.': 'Beheer bedrijfsgegevens, btw-tarieven, nummeringsindelingen, gebruikersrechten en dynamische productvelden.',
  'Website URL': 'Website-URL', 'Address & City': 'Adres en woonplaats', 'Adres & Woonplaats': 'Adres en woonplaats',
  'Chamber of Commerce & VAT Number': 'KVK- en btw-nummer', 'KVK & BTW Nummer': 'KVK- en btw-nummer',
  'Save Company Details & Formats': 'Bedrijfsgegevens en formats opslaan', 'Bedrijfsgegevens & Formats Opslaan': 'Bedrijfsgegevens en formats opslaan',
  'Click to upload logo': 'Klik om logo te uploaden', 'Klik om logo te uploaden': 'Klik om logo te uploaden', 'Theme Colors': 'Themakleuren',
  'Thema Kleuren': 'Themakleuren', 'Notification Settings': 'Meldingsinstellingen',
  'Tasks & To-Do Management': 'Taken en to-do-beheer', 'Taken & To-Do Beheer': 'Taken en to-do-beheer',
  'Manage daily action items linked to leads and delivery projects.': 'Beheer dagelijkse actiepunten gekoppeld aan leads en opleverprojecten.',
  'Beheer dagelijkse actiepunten, gekoppeld aan leads en opleverprojecten.': 'Beheer dagelijkse actiepunten gekoppeld aan leads en opleverprojecten.',
  'Add New Task': 'Nieuwe taak toevoegen', 'Nieuwe Taak Toevoegen': 'Nieuwe taak toevoegen',
  'Task Description / Title': 'Taakomschrijving / titel', 'Taak Omschrijving / Titel': 'Taakomschrijving / titel',
  'Link Type': 'Koppelingstype', 'Koppel Type': 'Koppelingstype', 'Delivery Project': 'Opleverproject',
  'Oplever Project': 'Opleverproject', 'Customer Lead': 'Klantlead', 'Klant Lead': 'Klantlead', 'No Link': 'Geen koppeling',
  'Geen Koppeling': 'Geen koppeling', 'High': 'Hoog', 'Medium': 'Gemiddeld', 'Low': 'Laag',
  'Due Date': 'Vervaldatum', 'Vervaldatum (Due Date)': 'Vervaldatum',
  'History of VAT Returns': 'Historie btw-aangiftes', 'Historie BTW Aangiftes': 'Historie btw-aangiftes',
  'Overview of submitted and outstanding quarterly returns.': 'Overzicht van ingediende en openstaande kwartaalaangiftes.',
  'Overzicht van ingediende en openstaande kwartaalaangiftes.': 'Overzicht van ingediende en openstaande kwartaalaangiftes.',
  'Shared Construction Drawings & Documents': 'Gedeelde bouwtekeningen en documenten',
  'Gedeelde Bouwtekeningen & Documenten': 'Gedeelde bouwtekeningen en documenten',
  'View and download approved AutoCAD specifications, contracts and maintenance guides for your project.': 'Bekijk en download goedgekeurde AutoCAD-specificaties, contracten en onderhoudsgidsen voor uw project.',
  'Bekijk en download goedgekeurde AutoCAD specificaties, contracten en onderhoudsgidsen van uw project.': 'Bekijk en download goedgekeurde AutoCAD-specificaties, contracten en onderhoudsgidsen voor uw project.',
  'File name:': 'Bestandsnaam:', 'Bestandsnaam:': 'Bestandsnaam:', 'Date shared:': 'Datum gedeeld:', 'Datum Gedeeld:': 'Datum gedeeld:',
  'Workshop Photo Updates (Build Gallery)': 'Werkplaatsfoto-updates (bouwgalerij)',
  'Werkplaats Foto Updates (Build Gallery)': 'Werkplaatsfoto-updates (bouwgalerij)',
  'Follow the construction of your outdoor kitchen live with photo updates directly from the craft workshop.': 'Volg de bouw van uw buitenkeuken live met foto-updates rechtstreeks uit de ambachtelijke werkplaats.',
  'Volg de bouw van uw buitenkeuken live met foto updates direct uit de ambachtelijke werkplaats.': 'Volg de bouw van uw buitenkeuken live met foto-updates rechtstreeks uit de ambachtelijke werkplaats.',
  'Craftsperson:': 'Vakman:', 'Vakman:': 'Vakman:', 'Enlarge': 'Vergroten', 'Vergroten': 'Vergroten',
  'Expected Delivery': 'Verwachte oplevering', 'Verwachte Oplevering': 'Verwachte oplevering',
  'Delivery Location': 'Opleverlocatie', 'Opleverlocatie': 'Opleverlocatie',
  'Assigned Craftsperson': 'Toegewezen ambachtelijke vakman', 'Toegewezen Ambachtelijke Vakman': 'Toegewezen ambachtelijke vakman',
  'Deadline': 'Deadline', 'Technical Specs & Blueprint Files': 'Technische specificaties en blauwdrukbestanden',
  'Technische Specificaties & Materialen': 'Technische specificaties en materialen', 'Dimensions:': 'Afmetingen:',
  'Afmetingen:': 'Afmetingen:', 'Frame Construction:': 'Frameconstructie:', 'Frame Constructie:': 'Frameconstructie:',
  'Countertop Finish:': 'Afwerking aanrechtblad:', 'Aanrechtblad Afwerking:': 'Afwerking aanrechtblad:',
  'Download PDF Blueprint': 'PDF-blauwdruk downloaden', '14 days': '14 dagen', '30 days': '30 dagen',
  '45 days': '45 dagen', '60 days': '60 dagen'
});

Object.assign(LEGACY_NL_TO_EN, {
  'Werkstroom': 'Workflow', 'Locatie en product': 'Location & Product', 'Eerste intake-notities': 'Initial Intake Notes',
  'Gewenste afmeting': 'Desired Size', 'Bijzondere vereisten': 'Special Requirements', 'Reactiedeadline': 'Response Deadline',
  'Bouwprijs': 'Build Price', 'Geldig tot': 'Valid Until', 'Levertijd': 'Lead Time', 'Opmerkingen van partner': 'Partner Remarks',
  'Werkopdracht': 'Work Order', 'Actief project': 'Active Project', 'Gewenste opleverdatum': 'Target Delivery Date',
  'Toegewezen team': 'Assigned Team', 'Bouwvoortgang': 'Build Progress', 'Vakmanpartner': 'Craftsman Partner',
  'Werkdrukstatus': 'Workload Status', 'Beschikbaar (2 projecten)': 'Available (2 Projects)', 'Opleverweek': 'Delivery Week',
  'Montage en oplevering op locatie': 'Site Assembly & Delivery', 'Adres:': 'Address:', 'Project afgerond en gearchiveerd': 'Project Completed & Archived',
  'Automatisch ingevulde offertebouwer': 'Auto-Prefilled Quote Builder', 'Offertetotaal (€)': 'Quote Total (€)',
  'Offerte opslaan en versturen →': 'Save & Send Quote →', 'Automatisch actief project aanmaken': 'Auto-Create Active Project',
  'Opslaan en actief project aanmaken →': 'Save & Create Active Project →', 'Vakmanpartner toewijzen': 'Assign Craftsman Partner',
  'Vakmanpartner selecteren': 'Select Craftsman Partner', 'Werkopdracht partner bevestigen →': 'Confirm Partner Work Order →',
  'Eindfactuur automatisch genereren': 'Auto-Generate Final Invoice', 'Factuurnr.': 'Invoice #',
  'Totaal betaald bedrag (€)': 'Total Paid Amount (€)', 'Factuur genereren en opslaan →': 'Generate & Store Invoice →',
  'Mijn profiel': 'My Profile', 'Volledige naam': 'Full Name', 'Taal': 'Language', 'Wijzigingen opslaan': 'Save changes',
  'Huidig wachtwoord': 'Current Password', 'Nieuw wachtwoord': 'New Password', 'Nieuw wachtwoord bevestigen': 'Confirm New Password',
  'Wachtwoord bijwerken': 'Update password', 'Nederlands': 'Dutch (Nederlands)',
  'Winst en verlies': 'Profit & Loss', 'Financieel overzicht en analyse van de winstmarge per project.': 'Financial overview and profit margin analysis per project.',
  'Totale omzet': 'Total Revenue', 'Totale projectkosten': 'Total Project Costs', 'Totale brutowinst': 'Total Gross Profit',
  'Gemiddelde marge': 'Average Margin', 'Instellingen': 'Settings', 'Website-URL': 'Website URL',
  'Adres en woonplaats': 'Address & City', 'KVK- en btw-nummer': 'Chamber of Commerce & VAT Number',
  'Bedrijfsgegevens en formats opslaan': 'Save Company Details & Formats', 'Themakleuren': 'Theme Colors',
  'Taken en to-do-beheer': 'Tasks & To-Do Management', 'Nieuwe taak toevoegen': 'Add New Task',
  'Taakomschrijving / titel': 'Task Description / Title', 'Koppelingstype': 'Link Type', 'Opleverproject': 'Delivery Project',
  'Klantlead': 'Customer Lead', 'Geen koppeling': 'No Link', 'Hoog': 'High', 'Gemiddeld': 'Medium', 'Laag': 'Low',
  'Historie btw-aangiftes': 'History of VAT Returns', 'Gedeelde bouwtekeningen en documenten': 'Shared Construction Drawings & Documents',
  'Bestandsnaam:': 'File name:', 'Datum gedeeld:': 'Date shared:', 'Werkplaatsfoto-updates (bouwgalerij)': 'Workshop Photo Updates (Build Gallery)',
  'Vakman:': 'Craftsperson:', 'Verwachte oplevering': 'Expected Delivery', 'Toegewezen ambachtelijke vakman': 'Assigned Craftsperson',
  'Technische specificaties en blauwdrukbestanden': 'Technical Specs & Blueprint Files', 'Technische specificaties en materialen': 'Technical Specs & Materials',
  'Frameconstructie:': 'Frame Construction:', 'Afwerking aanrechtblad:': 'Countertop Finish:', 'PDF-blauwdruk downloaden': 'Download PDF Blueprint',
  '14 dagen': '14 days', '30 dagen': '30 days', '45 dagen': '45 days', '60 dagen': '60 days'
});

Object.assign(LEGACY_TEXT, {
  'Overview of bank transactions and automatic 21% VAT tax calculation.': 'Overzicht van banktransacties en automatische btw-belastingberekening van 21%.',
  'Overzicht van banktransacties en automatische 21% BTW belastingberekening.': 'Overzicht van banktransacties en automatische btw-belastingberekening van 21%.',
  'Income (Income)': 'Inkomsten', 'Inkomsten (Income)': 'Inkomsten', 'Expense (Expense)': 'Uitgave', 'Uitgave (Expense)': 'Uitgave',
  'Amount (€)': 'Bedrag (€)', 'Bedrag (€)': 'Bedrag (€)', 'Including 21% VAT': 'Inclusief 21% btw', 'Inclusief 21% BTW': 'Inclusief 21% btw',
  'All (All)': 'Alle', 'Alle (All)': 'Alle', 'New': 'Nieuw', 'Nieuw': 'Nieuw', 'Quote sent': 'Offerte verstuurd',
  'Offerte verstuurd': 'Offerte verstuurd', 'Lost': 'Verloren', 'Verloren': 'Verloren',
  'Outdoor kitchen': 'Buitenkeuken', 'Buitenkeuken': 'Buitenkeuken', 'Outdoor living': 'Buitenverblijf', 'Buitenverblijf': 'Buitenverblijf',
  'Canopy': 'Overkapping', 'Overkapping': 'Overkapping', 'Pool house': 'Poolhouse', 'Poolhouse': 'Poolhouse',
  'Wheelie-bin unit': 'Kliko', 'Kliko': 'Kliko', 'Other customer...': 'Aangepaste klant...', 'Aangepaste Klant...': 'Aangepaste klant...',
  'Other...': 'Anders...', 'Anders...': 'Anders...', 'Custom outdoor kitchen': 'Exclusieve buitenkeuken',
  'Exclusieve Buitenkeuken': 'Exclusieve buitenkeuken', 'Custom wheelie-bin enclosure': 'Exclusieve kliko-ombouw',
  'Exclusieve Kliko-ombouw': 'Exclusieve kliko-ombouw', 'Wooden pergola': 'Houten pergola', 'Houten Pergola': 'Houten pergola',
  'Garden terrace': 'Tuinterras', 'Tuinterras': 'Tuinterras', 'Coordinated': 'Gecoördineerd', 'GecoÃ¶rdineerd': 'Gecoördineerd',
  'Accepted (automatically generates 50/50 invoices)': 'Geaccepteerd (maakt automatisch 50/50-facturen)',
  'Geaccepteerd (Auto-generates 50/50 Invoices)': 'Geaccepteerd (maakt automatisch 50/50-facturen)',
  'Rejected': 'Afgewezen', 'Afgewezen': 'Afgewezen', 'Standard 21% VAT rate for deliveries and installation.': 'Standaard btw-tarief van 21% voor leveringen en montage.',
  'Standaard 21% btw tarief voor leveringen en montage.': 'Standaard btw-tarief van 21% voor leveringen en montage.',
  'Reduced 9% VAT rate for specific services.': 'Verlaagd btw-tarief van 9% voor specifieke diensten.', 'Laag 9% btw tarief voor specifieke diensten.': 'Verlaagd btw-tarief van 9% voor specifieke diensten.',
  'Example on quote PDFs:': 'Voorbeeld op offerte-PDF’s:', 'Voorbeeld op offerte PDFs:': 'Voorbeeld op offerte-PDF’s:',
  'Example on invoice PDFs:': 'Voorbeeld op factuur-PDF’s:', 'Voorbeeld op factuur PDFs:': 'Voorbeeld op factuur-PDF’s:',
  'Accent': 'Accent', 'Warm Cream': 'Warm crème', 'Gebruikersbeheer & Rol Toewijzing': 'Gebruikersbeheer en roltoewijzing',
  'User Management & Role Assignment': 'Gebruikersbeheer en roltoewijzing',
  'Invite new users, assign roles (Admin / Partner / Customer) and manage access.': 'Nieuwe gebruikers uitnodigen, rollen toewijzen (admin / partner / klant) en toegang beheren.',
  'Nieuwe gebruikers uitnodigen, rollen toewijzen (Admin / Partner / Customer) en toegang beheren.': 'Nieuwe gebruikers uitnodigen, rollen toewijzen (admin / partner / klant) en toegang beheren.',
  'Invite User': 'Gebruiker uitnodigen', '+ Gebruiker Uitnodigen': 'Gebruiker uitnodigen',
  'Admin': 'Admin', 'Partner': 'Partner', 'Customer': 'Klant', 'Customers': 'Klanten',
  'High': 'Hoog', 'Hoog (High)': 'Hoog', 'Medium': 'Gemiddeld', 'Gemiddeld (Medium)': 'Gemiddeld', 'Low': 'Laag', 'Laag (Low)': 'Laag',
  'Deductible VAT expenses': 'Aftrekbare btw-uitgaven', 'Aptrekbare BTW uitgaven': 'Aftrekbare btw-uitgaven',
  '1a. Goods/services taxed at 21% (revenue)': '1a. Leveringen/diensten belast met 21% (omzet)',
  '1a. Leveringen/diensten belast met 21% (Omzet)': '1a. Leveringen/diensten belast met 21% (omzet)',
  '1b. VAT due on sales (21% VAT)': '1b. Verschuldigde omzetbelasting (21% btw)',
  '1b. Verschuldigde omzetbelasting (21% BTW)': '1b. Verschuldigde omzetbelasting (21% btw)',
  '5b. Input VAT (deductible VAT on purchases)': '5b. Voorbelasting (aftrekbare btw op inkopen)',
  '5b. Voorbelasting (Aptrekbare BTW uit inkopen)': '5b. Voorbelasting (aftrekbare btw op inkopen)',
  'Unassigned': 'Niet toegewezen', 'Niet toegewezen (Unassigned)': 'Niet toegewezen',
  'New order': 'Nieuwe order', 'Nieuw (New Order)': 'Nieuwe order', 'Shipped': 'Verzonden', 'Verzonden (Shipped)': 'Verzonden',
  'Completed': 'Afgerond', 'Afgerond (Completed)': 'Afgerond',
  'Manage active installations, partner assignments, and technical construction blueprints.': 'Beheer actieve installaties, partnertoewijzingen en technische bouwblauwdrukken.',
  'Beheer actieve installaties, partner-toewijzingen, en technische bouwblauwdrukken.': 'Beheer actieve installaties, partnertoewijzingen en technische bouwblauwdrukken.',
  'New Project': 'Nieuw project', 'Nieuw Project': 'Nieuw project', 'Deadline (earliest)': 'Deadline (eerst)', 'Deadline (Eerst)': 'Deadline (eerst)',
  'Progress (highest)': 'Voortgang (hoogste)', 'Voortgang (Hoogste)': 'Voortgang (hoogste)', 'Progress (lowest)': 'Voortgang (laagste)', 'Voortgang (Laagste)': 'Voortgang (laagste)',
  'Technical Blueprint Spec': 'Technische blauwdrukspecificatie', 'Build Progress Tracker': 'Bouwvoortgangsoverzicht',
  'Client': 'Klant', 'Klant / Client': 'Klant', 'Target Deadline': 'Gewenste deadline',
  'Available': 'Beschikbaar', 'Busy': 'Druk', 'Fully booked': 'Volgeboekt', 'Bekijk Profiel →': 'Profiel bekijken →',
  'Follow new craftsperson applications from first interest to an active trial project.': 'Volg sollicitaties van nieuwe vakmensen van eerste interesse tot een actief proefproject.',
  'Volg nieuwe vakman-sollicitaties van eerste interesse tot actief proefproject.': 'Volg sollicitaties van nieuwe vakmensen van eerste interesse tot een actief proefproject.',
  '4-Stage Pipeline': 'Pijplijn met 4 fasen', '4 Fasen Pipeline': 'Pijplijn met 4 fasen', 'No recent purchase invoices registered.': 'Geen recente inkoopfacturen geregistreerd.',
  'Internal Notes': 'Interne notities', 'Interne Notities (Internal Notes)': 'Interne notities', 'Craftsperson Name': 'Naam vakman', 'Naam Vakman': 'Naam vakman',
  'Email': 'E-mail', 'E-mail': 'E-mail', 'Phone': 'Telefoon', 'Telefoon': 'Telefoon', 'Region / Province': 'Regio / provincie',
  'Regio / Provincie': 'Regio / provincie', 'Project Technical Schematic Spec': 'Technische projectspecificatie',
  'PROJECT TECHNICAL SCHEMATIC SPEC': 'TECHNISCHE PROJECTSPECIFICATIE', 'Partner:': 'Partner:',
  'In Progress (In Uitvoering)': 'In uitvoering', 'Review Required (Ter Controle)': 'Beoordeling vereist', 'Completed (Afgerond)': 'Afgerond',
  'Target Deadline': 'Gewenste deadline', 'Opleverlocatie / Delivery Address': 'Opleverlocatie / bezorgadres',
  'OFFICIAL SCHEMATIC BLUEPRINT (AUTOCAD SPEC)': 'OFFICIËLE SCHEMATISCHE BLAUWDRUK (AUTOCAD-SPECIFICATIE)',
  'SCALE 1:20': 'SCHAAL 1:20', 'TECHNICAL BLUEPRINT DIAGRAM': 'TECHNISCHE BLAUWDRUKTEKENING',
  'AUTOCAD 1:20 SPEC': 'AUTOCAD-SPECIFICATIE 1:20', 'Your Q3 2026 partner performance summary has been compiled successfully.': 'Uw partnerprestatiesamenvatting voor Q3 2026 is succesvol samengesteld.'
});

Object.assign(LEGACY_NL_TO_EN, {
  'Overzicht van banktransacties en automatische btw-belastingberekening van 21%.': 'Overview of bank transactions and automatic 21% VAT tax calculation.',
  'Bedrag (€)': 'Amount (€)', 'Inclusief 21% btw': 'Including 21% VAT', 'Alle': 'All', 'Nieuw': 'New',
  'Offerte verstuurd': 'Quote sent', 'Verloren': 'Lost', 'Buitenkeuken': 'Outdoor kitchen', 'Buitenverblijf': 'Outdoor living',
  'Overkapping': 'Canopy', 'Poolhouse': 'Pool house', 'Kliko': 'Wheelie-bin unit', 'Aangepaste klant...': 'Other customer...',
  'Anders...': 'Other...', 'Exclusieve buitenkeuken': 'Custom outdoor kitchen', 'Exclusieve kliko-ombouw': 'Custom wheelie-bin enclosure',
  'Houten pergola': 'Wooden pergola', 'Tuinterras': 'Garden terrace', 'Gecoördineerd': 'Coordinated',
  'Geaccepteerd (maakt automatisch 50/50-facturen)': 'Accepted (automatically generates 50/50 invoices)', 'Afgewezen': 'Rejected',
  'Standaard btw-tarief van 21% voor leveringen en montage.': 'Standard 21% VAT rate for deliveries and installation.',
  'Verlaagd btw-tarief van 9% voor specifieke diensten.': 'Reduced 9% VAT rate for specific services.',
  'Voorbeeld op offerte-PDF’s:': 'Example on quote PDFs:', 'Voorbeeld op factuur-PDF’s:': 'Example on invoice PDFs:',
  'Warm crème': 'Warm Cream', 'Gebruikersbeheer en roltoewijzing': 'User Management & Role Assignment',
  'Nieuwe gebruikers uitnodigen, rollen toewijzen (admin / partner / klant) en toegang beheren.': 'Invite new users, assign roles (Admin / Partner / Customer) and manage access.',
  'Gebruiker uitnodigen': 'Invite User', 'Klant': 'Customer', 'Klanten': 'Customers', 'Aftrekbare btw-uitgaven': 'Deductible VAT expenses',
  '1a. Leveringen/diensten belast met 21% (omzet)': '1a. Goods/services taxed at 21% (revenue)',
  '1b. Verschuldigde omzetbelasting (21% btw)': '1b. VAT due on sales (21% VAT)',
  '5b. Voorbelasting (aftrekbare btw op inkopen)': '5b. Input VAT (deductible VAT on purchases)', 'Niet toegewezen': 'Unassigned',
  'Nieuwe order': 'New order', 'Verzonden': 'Shipped', 'Afgerond': 'Completed',
  'Beheer actieve installaties, partnertoewijzingen en technische bouwblauwdrukken.': 'Manage active installations, partner assignments, and technical construction blueprints.',
  'Nieuw project': 'New Project', 'Deadline (eerst)': 'Deadline (earliest)', 'Voortgang (hoogste)': 'Progress (highest)', 'Voortgang (laagste)': 'Progress (lowest)',
  'Technische blauwdrukspecificatie': 'Technical Blueprint Spec', 'Bouwvoortgangsoverzicht': 'Build Progress Tracker',
  'Gewenste deadline': 'Target Deadline', 'Profiel bekijken →': 'View Profile →',
  'Volg sollicitaties van nieuwe vakmensen van eerste interesse tot een actief proefproject.': 'Follow new craftsperson applications from first interest to an active trial project.',
  'Pijplijn met 4 fasen': '4-Stage Pipeline', 'Naam vakman': 'Craftsperson Name', 'Regio / provincie': 'Region / Province',
  'Technische projectspecificatie': 'Project Technical Schematic Spec', 'TECHNISCHE PROJECTSPECIFICATIE': 'PROJECT TECHNICAL SCHEMATIC SPEC',
  'Beoordeling vereist': 'Review Required', 'Opleverlocatie / bezorgadres': 'Delivery Location / Address',
  'OFFICIËLE SCHEMATISCHE BLAUWDRUK (AUTOCAD-SPECIFICATIE)': 'OFFICIAL SCHEMATIC BLUEPRINT (AUTOCAD SPEC)',
  'SCHAAL 1:20': 'SCALE 1:20', 'TECHNISCHE BLAUWDRUKTEKENING': 'TECHNICAL BLUEPRINT DIAGRAM',
  'AUTOCAD-SPECIFICATIE 1:20': 'AUTOCAD 1:20 SPEC', 'Uw partnerprestatiesamenvatting voor Q3 2026 is succesvol samengesteld.': 'Your Q3 2026 partner performance summary has been compiled successfully.'
});

Object.assign(LEGACY_TEXT, {
  'English': 'Engels', 'German': 'Duits', 'Exclusive Timber Construction & Outdoor Kitchens': 'Exclusieve houtbouw en buitenkeukens',
  'Exclusieve Houtbouw & Buitenkeukens': 'Exclusieve houtbouw en buitenkeukens',
  '🟢 Available': '🟢 Beschikbaar', '🟢 Beschikbaar': '🟢 Beschikbaar', '🟡 Busy': '🟡 Druk', '🟡 Druk (Busy)': '🟡 Druk',
  '🔴 Fully booked': '🔴 Volgeboekt', '🔴 Volgeboekt': '🔴 Volgeboekt', 'Workload Indicator': 'Werkdrukindicator',
  'Capacity conflict! Partner overloaded': 'Capaciteitsconflict! Partner overbelast', '⚠️ Overloaded': '⚠️ Overbelast',
  'The partner has': 'De partner heeft', 'deliveries in': 'opleveringen in', 'PROJECT TECHNICAL SCHEMATIC SPEC': 'TECHNISCHE PROJECTSPECIFICATIE',
  'Dimensions: 350cm x 90cm x 95cm | Frame: Solid Teak Wood': 'Afmetingen: 350 cm x 90 cm x 95 cm | frame: massief teakhout',
  'Afmetingen: 350cm x 90cm x 95cm | Frame: Massief Teak Hout': 'Afmetingen: 350 cm x 90 cm x 95 cm | frame: massief teakhout',
  'All Projects (All Installations)': 'Alle projecten (alle installaties)', 'Alle Projecten (All Installations)': 'Alle projecten (alle installaties)',
  'Wheelie-bin enclosure webshop orders': 'Webshoporders kliko-ombouw', 'Kliko-Ombouw Webshop Orders': 'Webshoporders kliko-ombouw',
  'Search by project, customer or order ID...': 'Zoek op project, klant of order-ID...', 'Zoek op project, klant of order ID...': 'Zoek op project, klant of order-ID...',
  'Project name (A–Z)': 'Projectnaam (A–Z)', 'Projectnaam (A-Z)': 'Projectnaam (A–Z)',
  'Dimensions': 'Afmetingen', 'Afmetingen (Dimensions)': 'Afmetingen', 'Frame material': 'Framemateriaal', 'Materiaal Frame': 'Framemateriaal',
  'Solid Teak Wood': 'Massief teakhout', 'Massief Teak Hout': 'Massief teakhout', 'Countertop finish': 'Afwerking aanrechtblad',
  'Sluiten (Close Blueprint)': 'Blauwdruk sluiten', 'Project Bewerken': 'Project bewerken', 'Nieuw Project Aanmaken': 'Nieuw project aanmaken',
  'Projectnaam': 'Projectnaam', 'Partner Vakman': 'Vakmanpartner', 'Voortgang (%)': 'Voortgang (%)',
  'Dynamic Field-Set Configurator': 'Configurator voor dynamische velden',
  'Manage dynamic form fields per product type (outdoor living, canopy, pool house).': 'Beheer dynamische formuliervelden per producttype (buitenverblijf, overkapping, poolhouse).',
  'Beheer dynamische formuliervelden per product type (buitenverblijf, overkapping, poolhouse).': 'Beheer dynamische formuliervelden per producttype (buitenverblijf, overkapping, poolhouse).',
  'Add New Field': 'Nieuw veld toevoegen', '+ Nieuw Veld Toevoegen': 'Nieuw veld toevoegen', 'Required': 'Verplicht', 'Verplicht': 'Verplicht',
  'Type:': 'Type:', 'Configured fields for': 'Geconfigureerde velden voor', 'Geconfigureerde Velden voor': 'Geconfigureerde velden voor',
  'No custom fields configured for this product type.': 'Geen aangepaste velden geconfigureerd voor dit producttype.',
  'Geen aangepaste velden geconfigureerd voor dit product type.': 'Geen aangepaste velden geconfigureerd voor dit producttype.',
  'Invite New User': 'Nieuwe gebruiker uitnodigen', 'Nieuwe Gebruiker Uitnodigen': 'Nieuwe gebruiker uitnodigen',
  'Name': 'Naam', 'Naam': 'Naam', 'System Role': 'Systeemrol', 'Systeem Rol': 'Systeemrol', 'Send Invitation': 'Uitnodiging versturen',
  'Verstuur Uitnodiging': 'Uitnodiging versturen', 'Add Custom Field': 'Aangepast veld toevoegen', 'Aangepast Veld Toevoegen': 'Aangepast veld toevoegen',
  'Field Name / Label': 'Veldnaam / label', 'Veld Naam / Label': 'Veldnaam / label', 'Options (comma-separated)': 'Opties (komma-gescheiden)',
  'Opties (komma gescheiden)': 'Opties (komma-gescheiden)', 'Save Field': 'Veld opslaan', 'Veld Opslaan': 'Veld opslaan',
  'Send price request': 'Prijsaanvraag versturen', 'Prijsaanvraag Versturen (Send Price Request)': 'Prijsaanvraag versturen',
  'Partner quote received': 'Partnerofferte ontvangen', 'Partner Offerte Ontvangen (Partner Quote Received)': 'Partnerofferte ontvangen',
  'Customer Quote Summary': 'Klantoffertesamenvatting', 'Klantofferte Samenvatting (Quote Summary)': 'Klantoffertesamenvatting',
  'Finishing & materials': 'Afwerking en materialen', 'Afwerking & Materialen': 'Afwerking en materialen',
  'Delivery & installation': 'Levering en montage', 'Levering & Montage': 'Levering en montage',
  'Total (incl. VAT)': 'Totaal (incl. btw)', 'Totaal (Incl. BTW)': 'Totaal (incl. btw)',
  'Assigned Partner & Craftsman': 'Toegewezen partner en vakman', 'Installation & Calendar Schedule': 'Montage- en kalenderplanning',
  'Final inspection passed, 100% invoice paid, customer signature received.': 'Eindinspectie geslaagd, factuur 100% betaald en handtekening van de klant ontvangen.',
  'Pre-assembly quality check passed in workshop by Sven Hoek.': 'Kwaliteitscontrole vóór montage is in de werkplaats uitgevoerd door Sven Hoek.',
  'Technical Blueprint Diagram': 'Technische blauwdruktekening', '📐 TECHNICAL BLUEPRINT DIAGRAM': '📐 TECHNISCHE BLAUWDRUKTEKENING',
  'Official schematic blueprint (AutoCAD specification)': 'Officiële schematische blauwdruk (AutoCAD-specificatie)',
  'Verified by Tim & Bram • Includes cutout for Kamado Joe Ceramic Grill': 'Geverifieerd door Tim en Bram • Inclusief uitsparing voor Kamado Joe Ceramic Grill'
});

Object.assign(LEGACY_NL_TO_EN, {
  'Engels': 'English', 'Duits': 'German', 'Exclusieve houtbouw en buitenkeukens': 'Exclusive Timber Construction & Outdoor Kitchens',
  '🟢 Beschikbaar': '🟢 Available', '🟡 Druk': '🟡 Busy', '🔴 Volgeboekt': '🔴 Fully booked', 'Werkdrukindicator': 'Workload Indicator',
  'Capaciteitsconflict! Partner overbelast': 'Capacity conflict! Partner overloaded', '⚠️ Overbelast': '⚠️ Overloaded',
  'TECHNISCHE PROJECTSPECIFICATIE': 'PROJECT TECHNICAL SCHEMATIC SPEC', 'Afmetingen: 350 cm x 90 cm x 95 cm | frame: massief teakhout': 'Dimensions: 350cm x 90cm x 95cm | Frame: Solid Teak Wood',
  'Alle projecten (alle installaties)': 'All Projects (All Installations)', 'Webshoporders kliko-ombouw': 'Wheelie-bin enclosure webshop orders',
  'Zoek op project, klant of order-ID...': 'Search by project, customer or order ID...', 'Projectnaam (A–Z)': 'Project name (A–Z)',
  'Afmetingen': 'Dimensions', 'Framemateriaal': 'Frame material', 'Massief teakhout': 'Solid Teak Wood', 'Blauwdruk sluiten': 'Close Blueprint',
  'Project bewerken': 'Edit Project', 'Nieuw project aanmaken': 'Create New Project', 'Vakmanpartner': 'Craftsperson Partner',
  'Configurator voor dynamische velden': 'Dynamic Field-Set Configurator',
  'Beheer dynamische formuliervelden per producttype (buitenverblijf, overkapping, poolhouse).': 'Manage dynamic form fields per product type (outdoor living, canopy, pool house).',
  'Nieuw veld toevoegen': 'Add New Field', 'Verplicht': 'Required', 'Geconfigureerde velden voor': 'Configured fields for',
  'Geen aangepaste velden geconfigureerd voor dit producttype.': 'No custom fields configured for this product type.',
  'Nieuwe gebruiker uitnodigen': 'Invite New User', 'Systeemrol': 'System Role', 'Uitnodiging versturen': 'Send Invitation',
  'Aangepast veld toevoegen': 'Add Custom Field', 'Veldnaam / label': 'Field Name / Label', 'Opties (komma-gescheiden)': 'Options (comma-separated)', 'Veld opslaan': 'Save Field',
  'Prijsaanvraag versturen': 'Send price request', 'Partnerofferte ontvangen': 'Partner quote received', 'Klantoffertesamenvatting': 'Customer Quote Summary',
  'Afwerking en materialen': 'Finishing & materials', 'Levering en montage': 'Delivery & installation', 'Totaal (incl. btw)': 'Total (incl. VAT)',
  'Toegewezen partner en vakman': 'Assigned Partner & Craftsman', 'Montage- en kalenderplanning': 'Installation & Calendar Schedule',
  'Kwaliteitscontrole vóór montage is in de werkplaats uitgevoerd door Sven Hoek.': 'Pre-assembly quality check passed in workshop by Sven Hoek.',
  '📐 TECHNISCHE BLAUWDRUKTEKENING': '📐 TECHNICAL BLUEPRINT DIAGRAM', 'Technische blauwdruktekening': 'Technical Blueprint Diagram',
  'Officiële schematische blauwdruk (AutoCAD-specificatie)': 'Official schematic blueprint (AutoCAD specification)',
  'Geverifieerd door Tim en Bram • Inclusief uitsparing voor Kamado Joe Ceramic Grill': 'Verified by Tim & Bram • Includes cutout for Kamado Joe Ceramic Grill'
});

function translateLegacyText(value, language) {
  if (!value) return value;

  if (language === 'NL') {
    // An English source label can be translated directly. If the rendered
    // value is already a known Dutch variant, normalize it through English
    // first so hybrid legacy labels still land on one Dutch result.
    const directDutch = LEGACY_TEXT[value];
    if (directDutch) return directDutch;
    const english = LEGACY_NL_TO_EN[value];
    return english ? (LEGACY_TEXT[english] || value) : value;
  }

  // EN mode must also handle legacy source strings that were written in a
  // Dutch/English hybrid. Normalize that source value to Dutch, then use the
  // explicit Dutch-to-English vocabulary. This was the missing step behind
  // the user-visible Bank / Invoices / Taxes mismatch.
  const directEnglish = LEGACY_NL_TO_EN[value];
  if (directEnglish && directEnglish !== value) return directEnglish;
  const dutch = LEGACY_TEXT[value];
  if (dutch) {
    const normalizedEnglish = LEGACY_NL_TO_EN[dutch];
    if (normalizedEnglish && normalizedEnglish !== dutch) return normalizedEnglish;
  }
  return value;
}

function applyLegacyLanguage(language) {
  const replace = (value) => translateLegacyText(value, language);
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: node => ['SCRIPT', 'STYLE'].includes(node.parentElement?.tagName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    const raw = node.nodeValue;
    const translated = replace(raw.trim());
    if (translated !== raw.trim()) node.nodeValue = raw.replace(raw.trim(), translated);
  });
  document.querySelectorAll('[placeholder], [title]').forEach(element => {
    ['placeholder', 'title'].forEach(attribute => {
      const value = element.getAttribute(attribute);
      if (value) element.setAttribute(attribute, replace(value));
    });
  });
}

export function LanguageProvider({ children }) {
  // Default is EN (English) for development and client review.
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('app_language') || 'EN';
  });

  // ── Google Translate integration ────────────────────────────────
  // When language changes, forward it to Google Translate so any
  // text not covered by t() keys is also translated at the DOM level.
  // The existing t() / tStatus / DICTIONARY system is unchanged.
  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);

    // Forward to Google Translate (defined in index.html)
    if (typeof window.googleTranslatePage === 'function') {
      // Google Translate uses lowercase ISO codes: 'en' | 'nl'
      const gtLang = lang === 'NL' ? 'nl' : 'en';
      window.googleTranslatePage(gtLang);
    }
  };

  // Re-apply Google Translate on initial page load / navigation if NL was saved.
  // This ensures language persists across React Router navigations and refreshes.
  useEffect(() => {
    const saved = localStorage.getItem('app_language') || 'EN';
    if (saved === 'NL' && typeof window.googleTranslatePage === 'function') {
      // Small delay to allow Google Translate SDK to finish initialising
      const timer = setTimeout(() => {
        window.googleTranslatePage('nl');
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);
  // ── End Google Translate integration ────────────────────────────

  // Do not mutate the rendered DOM to translate text. The former
  // MutationObserver solution repeatedly scanned the entire application after
  // DOM updates and could freeze the browser. Every screen must render its
  // labels through t('...') instead, which is deterministic and responsive.


  // Nested object lookup helper e.g. t('common.search') or t('dashboard.totalLeads')
  const t = (path, params = {}) => {
    const keys = path.split('.');
    let result = DICTIONARY[language];
    
    for (const key of keys) {
      if (result && result[key] !== undefined) {
        result = result[key];
      } else {
        // Fallback to English dictionary
        let fallback = DICTIONARY['EN'];
        for (const k of keys) {
          fallback = fallback?.[k];
        }
        result = fallback || path;
        break;
      }
    }

    if (typeof result === 'string' && params) {
      Object.keys(params).forEach(pKey => {
        result = result.replace(new RegExp(`{{${pKey}}}`, 'g'), params[pKey]);
      });
    }

    return typeof result === 'string' ? result : path;
  };

  // Universal Data Status Translation Helper
  const tStatus = (statusStr) => {
    if (!statusStr) return statusStr;
    const statusKey = Object.keys(nl.statuses).find(
      key => key.toLowerCase() === String(statusStr).toLowerCase()
    );
    if (statusKey) {
      return DICTIONARY[language]?.statuses?.[statusKey] || statusStr;
    }
    return statusStr;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tStatus, DICTIONARY }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
