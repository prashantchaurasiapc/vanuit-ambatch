import React, { useState } from 'react';
import ProjectGlobalInbox from './ProjectGlobalInbox';
import OutdoorKitchenProjects from './OutdoorKitchenProjects';
import GardenRoomProjects from './GardenRoomProjects';
import FieldMapping from './FieldMapping';
import { detectProjectType } from '../../utils/projectType';

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState(null);

  // When a project is selected from overview list
  if (selectedProject) {
    const pType = detectProjectType(selectedProject);
    const catLower = (selectedProject.category || '').toLowerCase();

    if (pType === 'field_mapping' || catLower.includes('field') || catLower.includes('mapping')) {
      return <FieldMapping onBackToOverview={() => setSelectedProject(null)} />;
    }

    if (pType === 'garden_room' || catLower.includes('garden')) {
      return <GardenRoomProjects onBackToOverview={() => setSelectedProject(null)} />;
    }

    return <OutdoorKitchenProjects onBackToOverview={() => setSelectedProject(null)} />;
  }

  // Default: Overview / List of all Projects
  return (
    <ProjectGlobalInbox 
      onSelectProject={(proj) => setSelectedProject(proj)} 
    />
  );
}
