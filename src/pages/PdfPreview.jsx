import React, { useState, useEffect } from 'react';
import { WerkorderTemplate, OpleverrapportTemplate } from '../components/PartnerPdfTemplates';
import api from '../api/apiClient';

export default function PdfPreview() {
  const [project, setProject] = useState(null);

  useEffect(() => {
    api.get('/projects?limit=1').then((res) => {
      if (res.success && Array.isArray(res.data) && res.data[0]) {
        setProject(res.data[0]);
      }
    }).catch(() => {});
  }, []);

  const displayProject = project || {
    name: 'Project Template',
    id: '–',
    customer: '–',
    deliveryAddress: '–',
    partner: '–',
    agreedBuildPrice: '€ 0,00'
  };

  return (
    <div className="bg-gray-200 min-h-screen p-10 flex flex-col items-center gap-10 overflow-auto">
      <div className="shadow-2xl">
        <WerkorderTemplate project={displayProject} />
      </div>
      <div className="shadow-2xl mt-10 mb-20">
        <OpleverrapportTemplate project={displayProject} />
      </div>
    </div>
  );
}
