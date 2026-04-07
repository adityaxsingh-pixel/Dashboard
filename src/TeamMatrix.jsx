import React, { useState, useMemo } from 'react';
import userDetails from './User_Details.json';
import licenseCosts from './License_Costs.json';

// --- DICTIONARY FOR ROLE GENERATION ---
const fallbackDictionary = {
  'SU01D': { description: 'User Display', type: 'D' },
  'PFCG': { description: 'Role Maintenance', type: 'M' },
  'SE16N': { description: 'General Table Display', type: 'D' },
  'SM20': { description: 'Security Audit Log', type: 'D' },
  'ME23N': { description: 'Display Purchase Order', type: 'D' },
  'FB03': { description: 'Display Document', type: 'D' },
  'VA03': { description: 'Display Sales Order', type: 'D' },
  'SU01': { description: 'User Maintenance', type: 'M' },
  'SE38': { description: 'ABAP Editor', type: 'M' },
  'ME21N': { description: 'Create Purchase Order', type: 'M' },
  'FB01': { description: 'Post Financial Document', type: 'M' },
  'VA01': { description: 'Create Sales Order', type: 'M' },
  'SCC4': { description: 'Client Administration', type: 'M' },
  'SM59': { description: 'RFC Destinations', type: 'M' },
  'OB52': { description: 'Open/Close Posting Periods', type: 'M' },
  'SE11': { description: 'ABAP Dictionary', type: 'D' },
  'SESSION_MANAGER': { description: 'SAP Easy Access Menu', type: 'D' },
};

export default function TeamMatrix({ team, onBack }) {
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState('summary'); // 'summary', 'roster', 'roles'
  const [summaryView, setSummaryView] = useState('plan'); // 'plan' or 'grid' (Plan is default)
  const [expandedSections, setExpandedSections] = useState([1]); // First section open by default in plan
  const [expandedKpis, setExpandedKpis] = useState([1, 2, 3]); // First 3 KPIs open by default in grid

  // --- DATA PROCESSING 1: USER ROSTER ---
  const { enrichedUsers, optimizedCount } = useMemo(() => {
    let optCount = 0;
    const users = team.users.map((u, index) => {
      const details = userDetails.find(ud => ud.userId === u.userId);
      const fallbackUsage = 12 + (index * 17) % 70; 
      const fallbackAssigned = 150 + (index * 23) % 150;
      const fallbackExecuted = Math.floor((fallbackUsage / 100) * fallbackAssigned);
      
      const currentLicense = details?.currentLicense || "GB Advanced Use";
      const optimalLicense = details?.optimalLicense || (fallbackUsage < 30 ? "GC Core Use" : "GB Advanced Use");
      const isReduced = currentLicense !== optimalLicense;
      if (isReduced) optCount++;

      return { 
        ...u, 
        usagePercent: details?.usagePercent !== undefined ? details.usagePercent : fallbackUsage,
        totalTxAssigned: details?.totalTxAssigned || fallbackAssigned,
        totalTxExecuted: details?.totalTxExecuted || fallbackExecuted,
        currentLicense,
        optimalLicense,
        isReduced,
        statusColor: details?.statusColor || u.status,
        conflictCount: details?.conflictCount !== undefined ? details.conflictCount : (u.conflictCount || 0),
        criticality: details?.criticality || (u.status === 'Red' ? 'High Risk' : u.status === 'Yellow' ? 'Medium Risk' : u.status === 'Blue' ? 'Low Risk' : 'Clean'),
        transactions: details?.executedTransactions || [] 
      };
    });
    return { enrichedUsers: users, optimizedCount: optCount };
  }, [team]);

  // --- DATA PROCESSING 2: KPIS ---
  const kpis = useMemo(() => {
    let currentCost = 0; let optimalCost = 0;
    let totalConflicts = 0; let totalBloatPercent = 0;
    let totalAssignedTx = 0; let totalUnusedTx = 0;
    let criticalUsers = 0; let mitigatedConflicts = 0; 
    let totalRolesAssigned = 0; let totalRolesUsed = 0;

    enrichedUsers.forEach((user, index) => {
      currentCost += licenseCosts[user.currentLicense]?.cost || 2400;
      optimalCost += licenseCosts[user.optimalLicense]?.cost || 2400;
      totalConflicts += user.conflictCount;
      totalBloatPercent += (100 - user.usagePercent);
      totalAssignedTx += user.totalTxAssigned;
      totalUnusedTx += Math.max(0, user.totalTxAssigned - user.totalTxExecuted);

      if (user.statusColor === 'Red' || user.criticality === 'High Risk') criticalUsers++;
      mitigatedConflicts += Math.floor(user.conflictCount * 0.25); 
      
      const mockRolesAssigned = 8 + (index * 7) % 35; 
      const mockRolesUsed = Math.max(1, Math.round(mockRolesAssigned * (user.usagePercent / 100)));
      totalRolesAssigned += mockRolesAssigned;
      totalRolesUsed += mockRolesUsed;
    });

    const projectedSavings = currentCost - optimalCost;
    const baseConflicts = totalConflicts;
    const postBloatConflicts = baseConflicts - Math.floor(baseConflicts * 0.40); 

    return {
      currentCost, optimalCost, projectedSavings,
      savingsPercentage: currentCost > 0 ? Math.round((projectedSavings / currentCost) * 100) : 0,
      avgBloat: Math.round(totalBloatPercent / enrichedUsers.length),
      totalAssignedTx, totalUnusedTx,
      estimatedDuplicates: Math.floor(totalAssignedTx * 0.08),
      authObjectsSaved: (totalUnusedTx + Math.floor(totalAssignedTx * 0.08)) * 30,
      totalConflicts: baseConflicts, criticalUsers, mitigatedConflicts,
      mitigationPercent: baseConflicts > 0 ? Math.round((mitigatedConflicts / baseConflicts) * 100) : 100,
      avgRoleDensity: Math.round(totalRolesAssigned / enrichedUsers.length),
      avgRolesUsed: Math.round(totalRolesUsed / enrichedUsers.length),
      postBloatConflicts,
      finalResidualConflicts: postBloatConflicts - Math.floor(postBloatConflicts * 0.85)
    };
  }, [enrichedUsers]);

  // --- DATA PROCESSING 3: ROLE GENERATION ---
  const { displayTcodes, maintainTcodes, activeTransactions } = useMemo(() => {
    let allTx = enrichedUsers.flatMap(u => u.transactions || []);
    if (allTx.length === 0) {
        allTx = ['SU01D', 'ME23N', 'VA03', 'SE16N', 'PFCG', 'SU01', 'SM59', 'FB01', 'Z_CUSTOM_03', 'Z_CUSTOM_MAINTAIN'];
    }

    const uniqueTxMap = new Map();
    allTx.forEach(tx => {
      if (typeof tx === 'object' && tx.tcode) {
        uniqueTxMap.set(tx.tcode, { tcode: tx.tcode, description: tx.description || 'Description unavailable', type: tx.type || 'M' });
      } else if (typeof tx === 'string') {
        const fallback = fallbackDictionary[tx];
        if (fallback) {
            uniqueTxMap.set(tx, { tcode: tx, description: fallback.description, type: fallback.type });
        } else {
            const isDisplay = tx.endsWith('03') || tx.endsWith('D') || tx.includes('DISPLAY');
            uniqueTxMap.set(tx, { tcode: tx, description: isDisplay ? 'Standard Display Transaction' : 'Standard Maintenance Transaction', type: isDisplay ? 'D' : 'M' });
        }
      }
    });

    const uniqueTx = Array.from(uniqueTxMap.values());
    return { 
      displayTcodes: uniqueTx.filter(t => t.type === 'D').sort((a,b) => a.tcode.localeCompare(b.tcode)), 
      maintainTcodes: uniqueTx.filter(t => t.type !== 'D').sort((a,b) => a.tcode.localeCompare(b.tcode)), 
      activeTransactions: uniqueTx
    };
  }, [enrichedUsers]);

  // --- HELPERS ---
  const toggleSection = (id) => setExpandedSections(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleKpi = (id) => setExpandedKpis(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const getRiskTheme = (colorCode) => {
    switch (colorCode) {
      case 'Red': return { bg: '#fee2e2', text: '#dc2626', border: '#f87171', bar: 'linear-gradient(90deg, #fca5a5 0%, #ef4444 100%)' };      
      case 'Yellow': return { bg: '#fef3c7', text: '#d97706', border: '#fbbf24', bar: 'linear-gradient(90deg, #fde047 0%, #f59e0b 100%)' };   
      case 'Blue': return { bg: '#e0f2fe', text: '#0284c7', border: '#38bdf8', bar: 'linear-gradient(90deg, #7dd3fc 0%, #0ea5e9 100%)' };     
      case 'Green': return { bg: '#d1fae5', text: '#059669', border: '#34d399', bar: 'linear-gradient(90deg, #6ee7b7 0%, #10b981 100%)' };    
      default: return { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1', bar: '#94a3b8' };
    }
  };

  return (
    <div style={styles.container}>
      
      {/* --- MASTER HEADER --- */}
      <header style={styles.sleekHeader}>
        <div style={styles.headerTopRow}>
          <button onClick={onBack} style={styles.backLinkBtn}>
            <span style={styles.backArrow}>←</span> Back to Global Map
          </button>
        </div>

        <div style={styles.headerTitleRow}>
          <div style={{ textAlign: 'left' }}>
            <div style={styles.eyebrowText}>{team.users[0]?.country || 'Global'} / {team.name}</div>
            <h1 style={styles.heroTitle}>Role Optimization <span style={styles.heroAccent}>Workspace</span></h1>
            <p style={styles.heroSubtitle}>Analyzing <strong>{enrichedUsers.length} active users</strong> and <strong>{activeTransactions.length} unique transactions</strong>.</p>
          </div>
        </div>

        {/* --- MAIN TAB NAVIGATION --- */}
        <div style={styles.tabContainer}>
          <div style={styles.tabGroup}>
            <button onClick={() => setActiveTab('summary')} style={{...styles.tabBtn, ...(activeTab === 'summary' ? styles.tabBtnActive : {})}}>
              📑 Executive Summary
            </button>
            <button onClick={() => setActiveTab('roster')} style={{...styles.tabBtn, ...(activeTab === 'roster' ? styles.tabBtnActive : {})}}>
              👥 Detailed User Roster
            </button>
            <button onClick={() => setActiveTab('roles')} style={{...styles.tabBtn, ...(activeTab === 'roles' ? styles.tabBtnActive : {})}}>
              🏗️ Role Generation
            </button>
          </div>
          
          {/* Show View Toggles only on Summary Tab */}
          {activeTab === 'summary' && (
            <div style={styles.toggleGroup}>
              <button onClick={() => setSummaryView('plan')} style={{...styles.toggleBtn, ...(summaryView === 'plan' ? styles.toggleBtnActive : {})}}>📝 Plan</button>
              <button onClick={() => setSummaryView('grid')} style={{...styles.toggleBtn, ...(summaryView === 'grid' ? styles.toggleBtnActive : {})}}>📊 Grid</button>
            </div>
          )}
        </div>
      </header>

      {/* --- MAIN CONTENT AREA --- */}
      <div style={styles.contentCanvas}>

        {/* ========================================================= */}
        {/* TAB 1: EXECUTIVE SUMMARY                                  */}
        {/* ========================================================= */}
        {activeTab === 'summary' && (
          <div style={styles.tabContentFadeIn}>

            {/* VIEW MODE: PLAN (Text Accordions) */}
            {summaryView === 'plan' ? (
              <div style={styles.reportContainer}>
                <div style={styles.accordionContainer}>
                  {/* ACCORDION 1: Financials */}
                  <div style={{...styles.accordionItem, borderColor: expandedSections.includes(1) ? '#bae6fd' : '#e2e8f0'}}>
                    <div style={{...styles.accordionHeader, backgroundColor: expandedSections.includes(1) ? '#f0fdf4' : '#ffffff'}} onClick={() => toggleSection(1)}>
                      <div style={styles.accordionTitleWrap}>
                        <span style={styles.iconSp}>🎯</span>
                        <h3 style={styles.accordionTitle}>Financial & Licensing Optimization</h3>
                      </div>
                      <div style={{...styles.chevron, transform: expandedSections.includes(1) ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</div>
                    </div>
                    {expandedSections.includes(1) && (
                      <div style={styles.accordionContent}>
                        <div style={styles.listWrapper}>
                          <div style={styles.bulletItem}><div style={styles.bulletMarker}></div><div style={styles.bulletContent}><strong>Capture ${kpis.projectedSavings.toLocaleString()} in Immediate Savings:</strong> Downgrade under-utilized accounts from expensive licenses to optimal configurations, reclaiming {kpis.savingsPercentage}% of the annual group budget.</div></div>
                          <div style={styles.bulletItem}><div style={styles.bulletMarker}></div><div style={styles.bulletContent}><strong>Re-align Run-Rate Spend:</strong> Shift current licensing footprint from ${kpis.currentCost.toLocaleString()} down to a mathematically justified baseline of ${kpis.optimalCost.toLocaleString()}.</div></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ACCORDION 2: Security */}
                  <div style={{...styles.accordionItem, borderColor: expandedSections.includes(2) ? '#bae6fd' : '#e2e8f0'}}>
                    <div style={{...styles.accordionHeader, backgroundColor: expandedSections.includes(2) ? '#f0fdf4' : '#ffffff'}} onClick={() => toggleSection(2)}>
                      <div style={styles.accordionTitleWrap}>
                        <span style={styles.iconSp}>🛡️</span>
                        <h3 style={styles.accordionTitle}>Security & Risk Remediation</h3>
                      </div>
                      <div style={{...styles.chevron, transform: expandedSections.includes(2) ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</div>
                    </div>
                    {expandedSections.includes(2) && (
                      <div style={styles.accordionContent}>
                        <div style={styles.listWrapper}>
                          <div style={styles.bulletItem}><div style={styles.bulletMarker}></div><div style={styles.bulletContent}><strong>Resolve {kpis.totalConflicts} Active SoD Conflicts:</strong> Strip out unexecuted, overlapping access to organically drop conflict counts from {kpis.totalConflicts} down to a residual {kpis.finalResidualConflicts}.</div></div>
                          <div style={styles.bulletItem}><div style={styles.bulletMarker}></div><div style={styles.bulletContent}><strong>Secure {kpis.criticalUsers} High-Risk Users:</strong> Immediately revoke sensitive Maintain/Create capabilities from exposed users who only demonstrate Display-level execution activity.</div></div>
                          <div style={styles.bulletItem}><div style={styles.bulletMarker}></div><div style={styles.bulletContent}><strong>Reduce Audit Reliance:</strong> Transition away from manual compensating controls (which currently only patch {kpis.mitigationPercent}% of exposure) toward a permanently clean architectural design.</div></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ACCORDION 3: Architecture */}
                  <div style={{...styles.accordionItem, borderColor: expandedSections.includes(3) ? '#bae6fd' : '#e2e8f0'}}>
                    <div style={{...styles.accordionHeader, backgroundColor: expandedSections.includes(3) ? '#f0fdf4' : '#ffffff'}} onClick={() => toggleSection(3)}>
                      <div style={styles.accordionTitleWrap}>
                        <span style={styles.iconSp}>⚙️</span>
                        <h3 style={styles.accordionTitle}>Architecture & Technical Simplification</h3>
                      </div>
                      <div style={{...styles.chevron, transform: expandedSections.includes(3) ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</div>
                    </div>
                    {expandedSections.includes(3) && (
                      <div style={styles.accordionContent}>
                        <div style={styles.listWrapper}>
                          <div style={styles.bulletItem}><div style={styles.bulletMarker}></div><div style={styles.bulletContent}><strong>Eliminate {kpis.avgBloat}% Average Role Bloat:</strong> Broadly revoke {kpis.totalUnusedTx.toLocaleString()} assigned but entirely unexecuted transaction codes across the team.</div></div>
                          <div style={styles.bulletItem}><div style={styles.bulletMarker}></div><div style={styles.bulletContent}><strong>Purge Technical Debt:</strong> Clean up {kpis.estimatedDuplicates.toLocaleString()} redundant assignments to shed approximately {kpis.authObjectsSaved.toLocaleString()} unnecessary authorization objects.</div></div>
                          <div style={styles.bulletItem}><div style={styles.bulletMarker}></div><div style={styles.bulletContent}><strong>Streamline User Profiles:</strong> Compress the current heavy density of {kpis.avgRoleDensity} assigned roles per user down to a strictly governed 2-role target framework.</div></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              
              /* VIEW MODE: GRID (6 KPIs) */
              <div style={styles.flowingGrid}>
                {/* KPI 1: Cost */}
                <div style={styles.flowingAccordionItem}>
                  <div style={styles.flowingAccordionHeader} onClick={() => toggleKpi(1)}>
                    <div style={styles.kpiTitleGroup}><span style={{fontSize: '1.4rem'}}>💰</span><div style={styles.kpiTitleCol}><h3 style={styles.kpiTitle}>License Cost</h3></div></div>
                    <div style={styles.kpiMainValueGroup}><div style={styles.kpiAccordionValue}>${kpis.projectedSavings.toLocaleString()}</div><div style={{...styles.chevron, transform: expandedKpis.includes(1) ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</div></div>
                  </div>
                  {expandedKpis.includes(1) && (
                    <div style={styles.flowingAccordionContent}>
                      <div style={styles.miniChartContainer}>
                        <div style={styles.chartLabelRow}><span style={styles.chartLabelText}>Current Spend</span><span style={styles.chartLabelNum}>${kpis.currentCost.toLocaleString()}</span></div>
                        <div style={styles.chartBarBg}><div style={{...styles.chartBarFill, width: '100%', backgroundColor: '#cbd5e1'}}></div></div>
                        <div style={{...styles.chartLabelRow, marginTop: '12px'}}><span style={styles.chartLabelText}>Target Spend</span><span style={{...styles.chartLabelNum, color: '#10b981'}}>${kpis.optimalCost.toLocaleString()}</span></div>
                        <div style={styles.chartBarBg}><div style={{...styles.chartBarFill, width: `${(kpis.optimalCost/kpis.currentCost)*100}%`, backgroundColor: '#10b981'}}></div></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* KPI 2: Bloat */}
                <div style={styles.flowingAccordionItem}>
                  <div style={styles.flowingAccordionHeader} onClick={() => toggleKpi(2)}>
                    <div style={styles.kpiTitleGroup}><span style={{fontSize: '1.4rem'}}>🗑️</span><div style={styles.kpiTitleCol}><h3 style={styles.kpiTitle}>Role Bloat</h3></div></div>
                    <div style={styles.kpiMainValueGroup}><div style={styles.kpiAccordionValue}>{kpis.avgBloat}%</div><div style={{...styles.chevron, transform: expandedKpis.includes(2) ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</div></div>
                  </div>
                  {expandedKpis.includes(2) && (
                    <div style={styles.flowingAccordionContent}>
                      <div style={styles.miniChartContainer}>
                        <div style={styles.chartLabelRow}><span style={styles.chartLabelText}>Total Assigned T-Codes</span><span style={styles.chartLabelNum}>{kpis.totalAssignedTx.toLocaleString()}</span></div>
                        <div style={styles.chartBarBg}><div style={{...styles.chartBarFill, width: '100%', backgroundColor: '#cbd5e1'}}></div></div>
                        <div style={{...styles.chartLabelRow, marginTop: '12px'}}><span style={styles.chartLabelText}>Unused Executions</span><span style={{...styles.chartLabelNum, color: '#047857'}}>{kpis.totalUnusedTx.toLocaleString()}</span></div>
                        <div style={styles.chartBarBg}><div style={{...styles.chartBarFill, width: `${(kpis.totalUnusedTx/kpis.totalAssignedTx)*100}%`, backgroundColor: '#047857'}}></div></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* KPI 3: SoD Risk */}
                <div style={styles.flowingAccordionItem}>
                  <div style={styles.flowingAccordionHeader} onClick={() => toggleKpi(3)}>
                    <div style={styles.kpiTitleGroup}><span style={{fontSize: '1.4rem'}}>🛡️</span><div style={styles.kpiTitleCol}><h3 style={styles.kpiTitle}>SoD Risk</h3></div></div>
                    <div style={styles.kpiMainValueGroup}><div style={styles.kpiAccordionValue}>{kpis.totalConflicts} <span style={styles.kpiSubValue}>Conflicts</span></div><div style={{...styles.chevron, transform: expandedKpis.includes(3) ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</div></div>
                  </div>
                  {expandedKpis.includes(3) && (
                    <div style={styles.flowingAccordionContent}>
                      <div style={styles.miniChartContainer}>
                        <div style={styles.chartLabelRow}><span style={styles.chartLabelText}>Critical Risk Users</span><span style={{...styles.chartLabelNum, color: '#dc2626'}}>{kpis.criticalUsers}</span></div>
                        <div style={styles.chartBarBg}><div style={{...styles.chartBarFill, width: `${(kpis.criticalUsers/enrichedUsers.length)*100}%`, backgroundColor: '#dc2626'}}></div></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* KPI 4: Tech Debt */}
                <div style={styles.flowingAccordionItem}>
                  <div style={styles.flowingAccordionHeader} onClick={() => toggleKpi(4)}>
                    <div style={styles.kpiTitleGroup}><span style={{fontSize: '1.4rem'}}>⚙️</span><div style={styles.kpiTitleCol}><h3 style={styles.kpiTitle}>Tech Debt</h3></div></div>
                    <div style={styles.kpiMainValueGroup}><div style={styles.kpiAccordionValue}>{kpis.authObjectsSaved.toLocaleString()} <span style={styles.kpiSubValue}>Objs Cut</span></div><div style={{...styles.chevron, transform: expandedKpis.includes(4) ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</div></div>
                  </div>
                  {expandedKpis.includes(4) && (
                    <div style={styles.flowingAccordionContent}>
                      <div style={styles.miniChartContainer}>
                        <div style={styles.chartLabelRow}><span style={styles.chartLabelText}>Duplicates Removed</span><span style={{...styles.chartLabelNum, color: '#9333ea'}}>{kpis.estimatedDuplicates.toLocaleString()}</span></div>
                        <div style={styles.chartBarBg}><div style={{...styles.chartBarFill, width: '100%', backgroundColor: '#9333ea'}}></div></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* KPI 5: Architecture */}
                <div style={styles.flowingAccordionItem}>
                  <div style={styles.flowingAccordionHeader} onClick={() => toggleKpi(5)}>
                    <div style={styles.kpiTitleGroup}><span style={{fontSize: '1.4rem'}}>📐</span><div style={styles.kpiTitleCol}><h3 style={styles.kpiTitle}>Architecture</h3></div></div>
                    <div style={styles.kpiMainValueGroup}><div style={styles.kpiAccordionValue}>{kpis.avgRolesUsed} <span style={styles.kpiSubValue}>Roles/User</span></div><div style={{...styles.chevron, transform: expandedKpis.includes(5) ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</div></div>
                  </div>
                  {expandedKpis.includes(5) && (
                    <div style={styles.flowingAccordionContent}>
                      <div style={styles.miniChartContainer}>
                        <div style={styles.chartLabelRow}><span style={styles.chartLabelText}>Target Redesign Roles (Avg)</span><span style={{...styles.chartLabelNum, color: '#4f46e5'}}>2</span></div>
                        <div style={styles.chartBarBg}><div style={{...styles.chartBarFill, width: `${(2/kpis.avgRoleDensity)*100}%`, backgroundColor: '#4f46e5'}}></div></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* KPI 6: Audit Readiness */}
                <div style={styles.flowingAccordionItem}>
                  <div style={styles.flowingAccordionHeader} onClick={() => toggleKpi(6)}>
                    <div style={styles.kpiTitleGroup}><span style={{fontSize: '1.4rem'}}>📋</span><div style={styles.kpiTitleCol}><h3 style={styles.kpiTitle}>Audit Readiness</h3></div></div>
                    <div style={styles.kpiMainValueGroup}><div style={styles.kpiAccordionValue}>{kpis.mitigationPercent}% <span style={styles.kpiSubValue}>Coverage</span></div><div style={{...styles.chevron, transform: expandedKpis.includes(6) ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</div></div>
                  </div>
                  {expandedKpis.includes(6) && (
                    <div style={styles.flowingAccordionContent}>
                      <div style={styles.miniChartContainer}>
                        <div style={styles.chartLabelRow}><span style={styles.chartLabelText}>Mitigated Controls</span><span style={{...styles.chartLabelNum, color: '#d97706'}}>{kpis.mitigatedConflicts}</span></div>
                        <div style={styles.chartBarBg}><div style={{...styles.chartBarFill, width: `${kpis.mitigationPercent}%`, backgroundColor: '#d97706'}}></div></div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Simulation block inside Grid View */}
                <div style={{gridColumn: '1 / -1', marginTop: '20px'}}>
                  <h3 style={{...styles.sectionTitle, fontSize: '1.1rem', marginBottom: '16px'}}>SoD Conflict Resolution Pathway</h3>
                  <div style={styles.flowingSimContainer}>
                    <div style={styles.flowingSimBox}>
                      <div style={styles.simChartHeader}><span style={styles.simChartBadge}>Phase 1</span><h4 style={styles.simChartTitle}>Remove Unused Transactions</h4></div>
                      <div style={styles.barRow}><span style={styles.barLabel}>Baseline Risk</span><div style={styles.barTrack}><div style={{...styles.barFill, width: '100%', backgroundColor: '#ef4444'}}></div></div><span style={styles.barValue}>{kpis.totalConflicts}</span></div>
                      <div style={styles.barRow}><span style={styles.barLabel}>Post-Cleanup</span><div style={styles.barTrack}><div style={{...styles.barFill, width: `${(kpis.postBloatConflicts/kpis.totalConflicts)*100}%`, backgroundColor: '#f59e0b'}}></div></div><span style={{...styles.barValue, color: '#d97706'}}>{kpis.postBloatConflicts}</span></div>
                    </div>
                    <div style={styles.flowingSimBox}>
                      <div style={styles.simChartHeader}><span style={{...styles.simChartBadge, backgroundColor: '#d1fae5', color: '#047857', border: '1px solid #a7f3d0'}}>Phase 2</span><h4 style={styles.simChartTitle}>Segregate Display / Maintain</h4></div>
                      <div style={styles.barRow}><span style={styles.barLabel}>Remaining Risk</span><div style={styles.barTrack}><div style={{...styles.barFill, width: `${(kpis.postBloatConflicts/kpis.totalConflicts)*100}%`, backgroundColor: '#f59e0b'}}></div></div><span style={{...styles.barValue, color: '#d97706'}}>{kpis.postBloatConflicts}</span></div>
                      <div style={styles.barRow}><span style={styles.barLabel}>Residual Risk</span><div style={styles.barTrack}><div style={{...styles.barFill, width: `${(kpis.finalResidualConflicts/kpis.totalConflicts)*100}%`, backgroundColor: '#10b981'}}></div></div><span style={{...styles.barValue, color: '#059669'}}>{kpis.finalResidualConflicts}</span></div>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: DETAILED USER ROSTER                               */}
        {/* ========================================================= */}
        {activeTab === 'roster' && (
          <div style={styles.tabContentFadeIn}>
             <div style={{marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                  <h2 style={styles.sectionTitle}>User Assignments & Risk Profiles</h2>
                  <p style={styles.sectionSubtitle}>Row-by-row breakdown of all users and their performance metrics.</p>
                </div>
                <div style={styles.reductionBadge}><strong>{optimizedCount} Users</strong> Optimized for Downgrade</div>
             </div>
             
             <div style={styles.tableWrapper}>
               <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>User Profile</th>
                    <th style={styles.th}>Role Usage (Bloat)</th>
                    <th style={styles.th}>Detected Conflicts</th>
                  </tr>
                </thead>
                <tbody>
                  {enrichedUsers.map((user, idx) => {
                    const theme = getRiskTheme(user.statusColor);
                    return (
                      <tr key={idx} style={{...styles.tr, borderLeft: `4px solid ${theme.border}`}}>
                        <td style={styles.td}>
                          <div style={styles.primaryText}>{user.userName || 'Unknown User'}</div>
                          <div style={styles.secondaryText}>{user.position || user.department} • {user.userId}</div>
                        </td>
                        <td style={styles.td}>
                          <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px'}}>
                            <div style={styles.usageBarBg}><div style={{...styles.usageBarFill, width: `${user.usagePercent}%`, background: theme.bar}}></div></div>
                            <span style={{fontSize: '0.85rem', fontWeight: '800', color: '#0f172a'}}>{user.usagePercent}%</span>
                          </div>
                          <div style={styles.secondaryText}>{user.totalTxExecuted} Executed / {user.totalTxAssigned} Assigned</div>
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '1.05rem', fontWeight: '800', color: theme.text }}>{user.conflictCount}</span>
                            <span style={{ ...styles.pillBadge, backgroundColor: theme.bg, color: theme.text }}>{user.criticality}</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
             </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: ROLE GENERATION                                    */}
        {/* ========================================================= */}
        {activeTab === 'roles' && (
          <div style={styles.tabContentFadeIn}>
             <div style={{marginBottom: '20px'}}>
                <h2 style={styles.sectionTitle}>Transaction Segregation</h2>
                <p style={styles.sectionSubtitle}>Separating {activeTransactions.length} unique execution logs into distinct risk profiles.</p>
             </div>
             
             <div style={styles.rolesGrid}>
                {/* DISPLAY CARD */}
                <div style={styles.roleCard}>
                  <div style={styles.roleCardHeader}>
                    <h3 style={{...styles.cardTitle, color: '#0284c7'}}>Display Access <span style={styles.countBadgeLight}>{displayTcodes.length} T-Codes</span></h3>
                    <p style={styles.cardSub}>Read-only transactions (Clean Core / Low Risk)</p>
                  </div>
                  <div style={styles.roleTableWrapper}>
                    <table style={styles.table}>
                      <thead><tr><th style={styles.th}>Transaction</th><th style={styles.th}>Description</th></tr></thead>
                      <tbody>
                        {displayTcodes.map(tx => (
                          <tr key={tx.tcode} style={styles.tr}>
                            <td style={{...styles.td, fontFamily: '"Fira Code", monospace', fontWeight: '600'}}>{tx.tcode}</td>
                            <td style={styles.td}>{tx.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* MAINTAIN CARD */}
                <div style={styles.roleCard}>
                  <div style={styles.roleCardHeader}>
                    <h3 style={{...styles.cardTitle, color: '#dc2626'}}>Maintain Access <span style={styles.countBadgeLightRed}>{maintainTcodes.length} T-Codes</span></h3>
                    <p style={styles.cardSub}>Create/Update capabilities (High Risk)</p>
                  </div>
                  <div style={styles.roleTableWrapper}>
                    <table style={styles.table}>
                      <thead><tr><th style={styles.th}>Transaction</th><th style={styles.th}>Description</th></tr></thead>
                      <tbody>
                        {maintainTcodes.map(tx => (
                          <tr key={tx.tcode} style={styles.tr}>
                            <td style={{...styles.td, fontFamily: '"Fira Code", monospace', fontWeight: '600'}}>{tx.tcode}</td>
                            <td style={styles.td}>{tx.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
             </div>

             {/* ACTION BUTTONS: ONLY VISIBLE IN ROLE TAB */}
             <div style={styles.roleActionFooter}>
                <div style={styles.footerInner}>
                  <div style={{color: '#64748b', fontSize: '0.95rem', fontWeight: '600'}}>
                     Ready to deploy optimizations?
                  </div>
                  <div style={styles.footerActionGroup}>
                    <button style={styles.btnSecondaryBlue}>Create Display Role</button>
                    <button style={styles.btnSecondaryRed}>Create Maintain Role</button>
                    <div style={styles.vertDivider}></div>
                    <button style={styles.btnPrimaryEmerald}>Generate All-Inclusive Role</button>
                  </div>
                </div>
             </div>

          </div>
        )}
      </div>

    </div>
  );
}

// --- MASTER STYLES ---
const styles = {
  container: { padding: '40px 60px 60px 60px', backgroundColor: '#f0fdf4', minHeight: '100vh', fontFamily: '"Inter", -apple-system, sans-serif' },
  
  sleekHeader: { display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' },
  
  headerTopRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  backLinkBtn: { background: 'none', border: 'none', color: '#047857', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s ease', padding: 0, marginBottom: '15px' },
  backArrow: { fontSize: '1.2rem', lineHeight: '1' },

  headerTitleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', textAlign: 'left' },
  eyebrowText: { color: '#047857', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' },
  heroTitle: { color: '#064e3b', margin: '0 0 6px 0', fontSize: '2.4rem', fontWeight: '500', letterSpacing: '-1px' },
  heroAccent: { color: '#10b981', fontWeight: '700' }, 
  heroSubtitle: { margin: 0, fontSize: '1.05rem', color: '#065f46', fontWeight: '400' },
  
  heroQuickStat: { textAlign: 'right' },
  quickStatLabel: { display: 'block', fontSize: '0.85rem', color: '#047857', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' },
  quickStatValue: { display: 'block', fontSize: '2.4rem', color: '#059669', fontWeight: '800', letterSpacing: '-1px', lineHeight: '1' },

  // TABS
  tabContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '10px', borderBottom: '2px solid #d1fae5', paddingBottom: '0' },
  tabGroup: { display: 'flex', gap: '2px' },
  tabBtn: { padding: '14px 24px', border: 'none', background: 'transparent', color: '#047857', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s ease', opacity: 0.6, borderBottom: '3px solid transparent', marginBottom: '-2px' },
  tabBtnActive: { color: '#064e3b', opacity: 1, borderBottom: '3px solid #10b981' },
  
  // SUB-TABS (Summary View Mode)
  subTabWrapper: { display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' },
  subTabGroup: { display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px' },
  subTab: { padding: '8px 18px', border: 'none', background: 'transparent', color: '#64748b', fontWeight: '600', fontSize: '0.85rem', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s ease' },
  subTabActive: { backgroundColor: '#ffffff', color: '#0f172a', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },

  // CANVAS
  contentCanvas: { backgroundColor: '#ffffff', borderRadius: '0 0 16px 16px', border: '1px solid #e2e8f0', borderTop: 'none', boxShadow: '0 10px 40px -10px rgba(5, 150, 105, 0.08)', padding: '30px 50px 50px 50px', textAlign: 'left', minHeight: '500px' },
  tabContentFadeIn: { animation: 'fadeIn 0.3s ease-in-out' },
  sectionTitle: { margin: '0 0 4px 0', fontSize: '1.4rem', color: '#064e3b', fontWeight: '700', letterSpacing: '-0.5px' },
  sectionSubtitle: { fontSize: '0.95rem', color: '#64748b', margin: 0 },

  // SUMMARY STYLES (PLAN)
  reportContainer: { width: '100%', margin: '0 0 10px 0' },
  accordionContainer: { display: 'flex', flexDirection: 'column', gap: '16px' },
  accordionItem: { border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', transition: 'all 0.2s ease' },
  accordionHeader: { padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'background-color 0.2s ease' },
  accordionTitleWrap: { display: 'flex', alignItems: 'center' },
  iconSp: { marginRight: '12px', fontSize: '1.2rem' },
  accordionTitle: { margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: '600' },
  chevron: { color: '#64748b', fontSize: '0.8rem', display: 'inline-block', transition: 'transform 0.3s ease' },
  accordionContent: { padding: '24px', backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0' },
  listWrapper: { display: 'flex', flexDirection: 'column', gap: '16px', paddingLeft: '4px' },
  bulletItem: { display: 'flex', alignItems: 'flex-start', gap: '14px' },
  bulletMarker: { minWidth: '6px', height: '6px', backgroundColor: '#059669', borderRadius: '50%', marginTop: '9px' },
  bulletContent: { fontSize: '0.95rem', color: '#334155', lineHeight: '1.6' },

  // SUMMARY STYLES (GRID)
  flowingGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', columnGap: '60px' },
  flowingAccordionItem: { borderBottom: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' },
  flowingAccordionHeader: { padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' },
  kpiTitleGroup: { display: 'flex', alignItems: 'center', gap: '16px' },
  kpiTitleCol: { display: 'flex', flexDirection: 'column', gap: '4px' },
  kpiTitle: { margin: 0, fontSize: '1rem', fontWeight: '700', color: '#064e3b' },
  kpiMainValueGroup: { display: 'flex', alignItems: 'center', gap: '20px' },
  kpiAccordionValue: { fontSize: '1.8rem', fontWeight: '800', color: '#064e3b', display: 'flex', alignItems: 'baseline', gap: '6px' },
  kpiSubValue: { fontSize: '0.85rem', fontWeight: '600', color: '#64748b' },
  flowingAccordionContent: { padding: '0 0 24px 0', paddingLeft: '44px' },
  miniChartContainer: { paddingTop: '16px', borderTop: '1px dashed #e2e8f0' },
  chartLabelRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' },
  chartLabelText: { fontSize: '0.85rem', color: '#64748b', fontWeight: '600' },
  chartLabelNum: { fontSize: '0.9rem', color: '#064e3b', fontWeight: '700' },
  chartBarBg: { width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' },
  chartBarFill: { height: '100%', borderRadius: '3px' },
  
  flowingSimContainer: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '40px' },
  flowingSimBox: { padding: '10px 0' },
  simChartHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' },
  simChartBadge: { backgroundColor: '#fef3c7', color: '#d97706', padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase' },
  simChartTitle: { margin: 0, color: '#064e3b', fontSize: '1.1rem', fontWeight: '600' },
  barRow: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' },
  barLabel: { width: '120px', color: '#475569', fontSize: '0.85rem', fontWeight: '500' },
  barTrack: { flex: 1, height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: '3px', transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' },
  barValue: { width: '40px', textAlign: 'right', color: '#064e3b', fontSize: '1rem', fontWeight: '700' },

  // ROSTER TABLE
  tableWrapper: { borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', maxHeight: '500px', overflowY: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' },
  th: { padding: '16px 20px', backgroundColor: '#f8fafc', color: '#0f172a', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 1 },
  tr: { borderBottom: '1px solid #f1f5f9', backgroundColor: '#ffffff' },
  td: { padding: '16px 20px', verticalAlign: 'middle', color: '#334155' },
  primaryText: { fontSize: '1rem', fontWeight: '600', color: '#0f172a', marginBottom: '4px' },
  secondaryText: { fontSize: '0.85rem', color: '#64748b', fontWeight: '500' },
  usageBarBg: { width: '120px', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' },
  usageBarFill: { height: '100%', borderRadius: '4px' },
  pillBadge: { padding: '4px 12px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' },
  reductionBadge: { backgroundColor: '#d1fae5', color: '#047857', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', border: '1px solid #a7f3d0' },

  // ROLE GENERATION
  rolesGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' },
  roleCard: { border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  roleCardHeader: { padding: '20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' },
  cardTitle: { margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: '700', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardSub: { margin: 0, fontSize: '0.85rem', color: '#64748b' },
  countBadgeLight: { backgroundColor: '#e0f2fe', color: '#0284c7', padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '700' },
  countBadgeLightRed: { backgroundColor: '#fee2e2', color: '#dc2626', padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '700' },
  roleTableWrapper: { maxHeight: '320px', overflowY: 'auto' },

  // ROLE ACTION FOOTER
  roleActionFooter: { marginTop: '40px', paddingTop: '30px', borderTop: '1px solid #e2e8f0' },
  footerInner: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  footerActionGroup: { display: 'flex', alignItems: 'center', gap: '16px' },
  vertDivider: { width: '1px', height: '24px', backgroundColor: '#e2e8f0', margin: '0 8px' },
  
  btnSecondaryBlue: { background: '#f0f9ff', border: '1px solid #bae6fd', color: '#0284c7', padding: '12px 24px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' },
  btnSecondaryRed: { background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 24px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' },
  btnPrimaryEmerald: { background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', border: 'none', color: '#ffffff', padding: '12px 32px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)', transition: 'transform 0.1s ease' }
};