import React, { useState } from 'react';
import DashboardHome from './DashboardHome';
import TeamMatrix from './TeamMatrix';
import UserDetailsTable from './UserDetailsTable'; 
import RoleGeneration from './RoleGeneration';

export default function App() {
  const [view, setView] = useState('dashboard'); // 'dashboard', 'matrix', 'userDetails', 'roleGeneration'
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [dashboardMetric, setDashboardMetric] = useState('userCount');
  
  // NEW: State to hold the data passed from the table to the role generation screen
  const [roleGenUsers, setRoleGenUsers] = useState([]);

  if (view === 'dashboard') {
    return <DashboardHome 
      metric={dashboardMetric} 
      setMetric={setDashboardMetric} 
      onSelectTeam={(team) => { 
        setSelectedTeam(team); 
        setView('matrix'); 
        window.scrollTo(0,0); 
      }} 
    />;
  }
  
  if (view === 'matrix') {
    return <TeamMatrix 
      team={selectedTeam} 
      onBack={() => setView('dashboard')} 
      onViewUsers={() => { 
        setView('userDetails'); 
        window.scrollTo(0,0); 
      }}
    />;
  }

  if (view === 'userDetails') {
    return <UserDetailsTable 
      team={selectedTeam} 
      onBack={() => setView('matrix')} 
      
      // NEW: Catch the button click and switch the view
      onContinueToRoleGen={(users) => {
        setRoleGenUsers(users);
        setView('roleGeneration');
        window.scrollTo(0,0);
      }}
    />;
  }

  // NEW: Render the Role Generation Workspace
  if (view === 'roleGeneration') {
    return <RoleGeneration 
      users={roleGenUsers} 
      onBack={() => setView('userDetails')} 
    />;
  }
}