import React from 'react';
import { WerkorderTemplate, OpleverrapportTemplate } from '../components/PartnerPdfTemplates';

export default function PdfPreview() {
  const dummyProject = {
    name: 'Buitenverblijf Douglas',
    id: 'OF-2026418',
    customer: 'Sander de Vries',
    deliveryAddress: 'Sportlaan 12\n5062 LJ Oisterwijk',
    partner: 'J. van den Berg',
    agreedBuildPrice: '€ 26.800,00'
  };

  return (
    <div className="bg-gray-200 min-h-screen p-10 flex flex-col items-center gap-10 overflow-auto">
      <div className="shadow-2xl">
        <WerkorderTemplate project={dummyProject} />
      </div>
      <div className="shadow-2xl mt-10 mb-20">
        <OpleverrapportTemplate project={dummyProject} />
      </div>
    </div>
  );
}
