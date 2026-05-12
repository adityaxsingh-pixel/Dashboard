import React, { useState } from 'react';
import DashboardHome from './DashboardHome';
import TeamMatrix from './TeamMatrix';
import Configuration from './Configuration';
import MasterData from './MasterData';

export default function App() {
  // We start on the dashboard map
  const [activeView, setActiveView] = useState('dashboard'); 
  
  // Holds the array of ALL teams selected from the multi-select map
  const [selectedTeams, setSelectedTeams] = useState([]);

  // Triggered when "Proceed to Optimization Hub" is clicked on the Dashboard
  const handleProceed = (teams) => { 
    setSelectedTeams(teams); 
    setActiveView('workspace'); 
    window.scrollTo(0,0);
  };

  // Triggered by the Top Navigation Bar (Dashboard <-> Configuration)
  const handleNavigate = (page) => {
    setActiveView(page);
    window.scrollTo(0,0);
  };

  // 1. RENDER DASHBOARD (HEATMAP)
  if (activeView === 'dashboard') {
    return (
      <DashboardHome 
        onProceed={handleProceed} 
        onNavigate={handleNavigate} 
      />
    );
  }
  
  // 2. RENDER GLOBAL CONFIGURATION
  if (activeView === 'configuration') {
    return (
      <Configuration 
        onNavigate={handleNavigate} 
      />
    );
  }
  
  // 3. RENDER BATCH OPTIMIZATION HUB (MATRIX + ROSTERS + ROLE GEN)
  if (activeView === 'workspace') {
     return (
       <TeamMatrix 
         selectedTeams={selectedTeams} 
         onBack={() => handleNavigate('dashboard')} 
       />
     );
  }

  // 2. RENDER GLOBAL CONFIGURATION
  if (activeView === 'masterData') {
    return (
      <MasterData 
        onNavigate={handleNavigate} 
      />
    );
  }
  return null;
}