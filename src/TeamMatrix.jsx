import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';
import userDetails from './User_Details.json';
import licenseCosts from './License_Costs.json';

const fallbackDictionary = {
  'SU01D': { description: 'User Display', type: 'D' }, 'PFCG': { description: 'Role Maintenance', type: 'M' },
  'SE16N': { description: 'General Table Display', type: 'D' }, 'SM20': { description: 'Security Audit Log', type: 'D' },
  'ME23N': { description: 'Display Purchase Order', type: 'D' }, 'FB03': { description: 'Display Document', type: 'D' },
  'VA03': { description: 'Display Sales Order', type: 'D' }, 'SU01': { description: 'User Maintenance', type: 'M' },
  'SE38': { description: 'ABAP Editor', type: 'M' }, 'ME21N': { description: 'Create Purchase Order', type: 'M' },
  'FB01': { description: 'Post Financial Document', type: 'M' }, 'VA01': { description: 'Create Sales Order', type: 'M' }
};
const PIE_COLORS = ['#10b981', '#f43f5e', '#f59e0b', '#3b82f6'];

const mockPfcgData = [
  { clss: "AAAB", clssText: "Cross-application Authorization Objects", object: "S_TCODE", objText: "Transaction Code Check at Transaction Start", auth: "00", authStatus: "S", fieldName: "TCD", fieldText: "Transaction Code", value: "ME23N" },
  { clss: "AAAB", clssText: "Cross-application Authorization Objects", object: "S_TCODE", objText: "Transaction Code Check at Transaction Start", auth: "00", authStatus: "S", fieldName: "TCD", fieldText: "Transaction Code", value: "VA03" },
  { clss: "AAAB", clssText: "Cross-application Authorization Objects", object: "B_BUPA_GRP", objText: "Business Partner: Authorization Groups", auth: "00", authStatus: "U", fieldName: "ACTVT", fieldText: "Activity", value: "03" },
  { clss: "AAAB", clssText: "Cross-application Authorization Objects", object: "B_BUPA_GRP", objText: "Business Partner: Authorization Groups", auth: "00", authStatus: "U", fieldName: "BEGRU", fieldText: "Authorization Group", value: "*" },
  { clss: "BC_A", clssText: "Basis: Administration", object: "S_ARCHIVE", objText: "Archiving", auth: "00", authStatus: "S", fieldName: "ACTVT", fieldText: "Activity", value: "03" },
  { clss: "CLAS", clssText: "Classification", object: "C_TCLS_MNT", objText: "Authorization for Characteristics of Org. Area", auth: "00", authStatus: "S", fieldName: "ACTVT", fieldText: "Activity", value: "" }, 
  { clss: "CO", clssText: "Controlling", object: "K_KEKO", objText: "CO-PC: Product Costing", auth: "00", authStatus: "U", fieldName: "BUKRS", fieldText: "Company Code", value: "$BUKRS" },
];

// ============================================================================
// MODALS & SCREENS
// ============================================================================
const SummarizedChangesModal = ({ isOpen, onClose, allTx, excludedTx, displayTcodes, maintainTcodes, teamName }) => {
  if (!isOpen) return null;
  const removedList = allTx.filter(t => excludedTx.has(t.tcode));
  const targetDisplay = displayTcodes.filter(t => !excludedTx.has(t.tcode));
  const targetMaintain = maintainTcodes.filter(t => !excludedTx.has(t.tcode));

  return (
    <div style={styles.modalBackdrop} onClick={onClose}>
      <div style={{...styles.modalContent, width: '900px', maxWidth: '95%'}} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <div>
            <h3 style={styles.modalTitle}>Planned Changes: {teamName}</h3>
            <p style={{margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem'}}>Overview of access changes prior to role generation.</p>
          </div>
          <button style={styles.closeButton} onClick={onClose}>×</button>
        </div>
        <div style={{...styles.modalBody, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', backgroundColor: '#f8fafc', maxHeight: '70vh'}}>
          <div style={styles.summaryBox}><div style={styles.summaryBoxHeader}><span style={{fontSize: '1.2rem'}}>📦</span> <span style={styles.summaryBoxTitle}>Original Access Items ({allTx.length})</span></div><div style={styles.summaryPillContainer}>{allTx.map(tx => <span key={tx.tcode} style={{...styles.summaryPill, backgroundColor: '#f1f5f9', color: '#475569'}}>{tx.tcode}</span>)}</div></div>
          <div style={styles.summaryBox}><div style={styles.summaryBoxHeader}><span style={{fontSize: '1.2rem'}}>🗑️</span> <span style={styles.summaryBoxTitle}>Access Being Removed ({removedList.length})</span></div><div style={styles.summaryPillContainer}>{removedList.length > 0 ? removedList.map(tx => <span key={tx.tcode} style={{...styles.summaryPill, backgroundColor: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3'}}>{tx.tcode}</span>) : <span style={{color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic'}}>No removals.</span>}</div></div>
          <div style={styles.summaryBox}><div style={styles.summaryBoxHeader}><span style={{fontSize: '1.2rem'}}>👁️</span> <span style={styles.summaryBoxTitle}>New View-Only Role ({targetDisplay.length})</span></div><div style={styles.summaryPillContainer}>{targetDisplay.length > 0 ? targetDisplay.map(tx => <span key={tx.tcode} style={{...styles.summaryPill, backgroundColor: '#f0fdf4', color: '#047857', border: '1px solid #a7f3d0'}}>{tx.tcode}</span>) : <span style={{color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic'}}>Empty</span>}</div></div>
          <div style={styles.summaryBox}><div style={styles.summaryBoxHeader}><span style={{fontSize: '1.2rem'}}>✍️</span> <span style={styles.summaryBoxTitle}>New Edit Role ({targetMaintain.length})</span></div><div style={styles.summaryPillContainer}>{targetMaintain.length > 0 ? targetMaintain.map(tx => <span key={tx.tcode} style={{...styles.summaryPill, backgroundColor: '#fffbeb', color: '#d97706', border: '1px solid #fef3c7'}}>{tx.tcode}</span>) : <span style={{color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic'}}>Empty</span>}</div></div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// FULL SCREEN PFCG BUILDER SCREEN
// ============================================================================
function PfcgBuilderScreen({ roleType, onBack, teamsProcessed }) {
  const [expandedNodes, setExpandedNodes] = useState({});
  const toggleNode = (id) => setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));

  const hierarchy = useMemo(() => {
    const tree = {};
    mockPfcgData.forEach(row => {
      if (!tree[row.clss]) tree[row.clss] = { text: row.clssText, id: row.clss, rows: [], objects: {} };
      tree[row.clss].rows.push(row);
      if (!tree[row.clss].objects[row.object]) tree[row.clss].objects[row.object] = { text: row.objText, id: row.object, rows: [], auths: {} };
      tree[row.clss].objects[row.object].rows.push(row);
      const authKey = `${row.object}-${row.auth}`;
      if (!tree[row.clss].objects[row.object].auths[authKey]) tree[row.clss].objects[row.object].auths[authKey] = { text: row.objText, authId: row.auth, rows: [], fields: {} };
      tree[row.clss].objects[row.object].auths[authKey].rows.push(row);
      if (!tree[row.clss].objects[row.object].auths[authKey].fields[row.fieldName]) tree[row.clss].objects[row.object].auths[authKey].fields[row.fieldName] = { text: row.fieldText, name: row.fieldName, values: new Set() };
      if (row.value) tree[row.clss].objects[row.object].auths[authKey].fields[row.fieldName].values.add(row.value);
    });
    return tree;
  }, []);

  const getNodeStatus = (rows) => {
    if (rows.some(r => r.authStatus === 'U')) return 'Manual';
    if (rows.some(r => r.authStatus === 'G')) return 'Maintained';
    return 'Standard';
  };
  const getNodeLight = (rows) => rows.some(r => !r.value || r.value.trim() === '') ? '🟡' : '🟢';

  return (
    <div style={styles.container}>
      <header style={styles.sleekHeader}>
        <div style={styles.headerTopRow}><button onClick={onBack} style={styles.backLinkBtn}><span style={styles.backArrow}>←</span> Back to Workspace</button></div>
        <div style={styles.headerTitleRow}>
          <div style={{ textAlign: 'left' }}>
            <div style={styles.eyebrowText}>System Role Generator</div>
            <h1 style={styles.heroTitle}>Technical Setup <span style={styles.heroAccent}>Review</span></h1>
            <p style={styles.heroSubtitle}>Reviewing permissions for the <strong>{roleType}</strong> across {teamsProcessed} {teamsProcessed === 1 ? 'team' : 'teams'}.</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <button 
              onClick={() => { alert('Roles have been successfully generated on your SAP systems.'); onBack(); }}
              style={{...styles.btnPrimaryEmerald, padding: '12px 28px', fontSize: '0.95rem'}}
            >
              Push to SAP / Create Roles
            </button>
          </div>
        </div>
      </header>
      <div style={{...styles.contentCanvas, padding: '0', overflow: 'hidden', border: '1px solid #e2e8f0'}}>
        <div style={styles.pfcgCanvas}>
          <div style={{...styles.pfcgRow, backgroundColor: '#f8fafc'}}><span style={{marginRight: '8px'}}>▼</span><span style={{marginRight: '8px', fontWeight: '700', color: '#047857'}}>ZROLE_{teamsProcessed > 1 ? 'BATCH' : 'TEAM'}_{roleType.replace(/\s+/g, '_').toUpperCase()}</span></div>
          {Object.values(hierarchy).map(clss => {
            const isClssOpen = expandedNodes[clss.id];
            return (
              <React.Fragment key={clss.id}>
                <div style={{...styles.pfcgRow, backgroundColor: '#ffffff', borderBottom: '1px solid #f1f5f9', paddingLeft: '24px'}} onClick={() => toggleNode(clss.id)}>
                  <span style={styles.toggleSp}>{isClssOpen ? '▼' : '▶'}</span><span>{getNodeLight(clss.rows)}</span><span style={styles.pfcgFolder}>📁</span><span style={styles.pfcgStatus}>{getNodeStatus(clss.rows)}</span><span style={styles.pfcgTextMain}>{clss.text}</span><span style={styles.pfcgIdLabel}>{clss.id}</span>
                </div>
                {isClssOpen && Object.values(clss.objects).map(obj => {
                  const isObjOpen = expandedNodes[`${clss.id}-${obj.id}`];
                  return (
                    <React.Fragment key={obj.id}>
                      <div style={{...styles.pfcgRow, backgroundColor: '#f8fafc', paddingLeft: '48px'}} onClick={() => toggleNode(`${clss.id}-${obj.id}`)}>
                        <span style={styles.toggleSp}>{isObjOpen ? '▼' : '▶'}</span><span>{getNodeLight(obj.rows)}</span><span style={styles.pfcgFolder}>📁</span><span style={styles.pfcgStatus}>{getNodeStatus(obj.rows)}</span><span style={styles.pfcgTextMain}>{obj.text}</span><span style={styles.pfcgIdLabel}>{obj.id}</span>
                      </div>
                      {isObjOpen && Object.values(obj.auths).map(auth => {
                        const isAuthOpen = expandedNodes[`${clss.id}-${obj.id}-${auth.authId}`];
                        return (
                          <React.Fragment key={auth.authId}>
                            <div style={{...styles.pfcgRow, backgroundColor: '#ffffff', paddingLeft: '72px'}} onClick={() => toggleNode(`${clss.id}-${obj.id}-${auth.authId}`)}>
                              <span style={styles.toggleSp}>{isAuthOpen ? '▼' : '▶'}</span><span>{getNodeLight(auth.rows)}</span><span style={styles.pfcgDoc}>📄</span><span style={styles.pfcgStatus}>{getNodeStatus(auth.rows)}</span><span style={styles.pfcgTextMain}>{auth.text}</span><span style={styles.pfcgIdLabel}>T-D{Math.floor(Math.random()*10000000)} (Auth: {auth.authId})</span>
                            </div>
                            {isAuthOpen && Object.values(auth.fields).map(field => (
                              <div key={field.name} style={{...styles.pfcgRow, backgroundColor: '#f8fafc', paddingLeft: '96px', borderBottom: '1px dashed #e2e8f0'}}>
                                <span style={{marginRight: '12px'}}></span><span style={styles.pfcgEdit}>✏️</span><span style={{...styles.pfcgTextMain, width: '250px'}}>{field.text}</span><span style={{color: '#10b981', fontWeight: '600', width: '200px'}}>{field.values.size > 0 ? Array.from(field.values).join(', ') : <span style={{color:'#ef4444'}}>&lt;Empty&gt;</span>}</span><span style={styles.pfcgIdLabel}>{field.name}</span>
                              </div>
                            ))}
                          </React.Fragment>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// INDIVIDUAL TEAM ACCORDION (MATRIX LOGIC)
// ============================================================================
function TeamAccordion({ team, isChecked, onCheck, isExpanded, onToggle, onBuildRole }) {
  const [activeTab, setActiveTab] = useState('summary'); 
  const [summaryView, setSummaryView] = useState('plan'); 
  const [expandedSections, setExpandedSections] = useState([]); // COLLAPSED BY DEFAULT
  const [expandedKpis, setExpandedKpis] = useState([]);
  const [expandedRoleSections, setExpandedRoleSections] = useState([]);
  const [excludedTx, setExcludedTx] = useState(new Set());
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  const { enrichedUsers, optimizedCount } = useMemo(() => {
    let optCount = 0;
    const users = (team.users || []).map((u, index) => {
      const details = userDetails.find(ud => ud.userId === u.userId);
      const fallbackUsage = 12 + (index * 17) % 70; 
      const fallbackAssigned = 150 + (index * 23) % 150;
      const fallbackExecuted = Math.floor((fallbackUsage / 100) * fallbackAssigned);
      const currentLicense = details?.currentLicense || "GB Advanced Use";
      const optimalLicense = details?.optimalLicense || (fallbackUsage < 30 ? "GC Core Use" : "GB Advanced Use");
      if (currentLicense !== optimalLicense) optCount++;
      return { 
        ...u, usagePercent: details?.usagePercent !== undefined ? details.usagePercent : fallbackUsage,
        totalTxAssigned: details?.totalTxAssigned || fallbackAssigned, totalTxExecuted: details?.totalTxExecuted || fallbackExecuted,
        currentLicense, optimalLicense, statusColor: details?.statusColor || u.status,
        conflictCount: details?.conflictCount !== undefined ? details.conflictCount : (u.conflictCount || 0),
        criticality: details?.criticality || (u.status === 'Red' ? 'High Risk' : u.status === 'Yellow' ? 'Medium Risk' : u.status === 'Blue' ? 'Low Risk' : 'Clean'),
        transactions: details?.executedTransactions || [] 
      };
    });
    return { enrichedUsers: users, optimizedCount: optCount };
  }, [team]);

  const kpis = useMemo(() => {
    let currentCost = 0; let optimalCost = 0; let totalConflicts = 0; let totalBloatPercent = 0;
    let totalAssignedTx = 0; let totalUnusedTx = 0; let criticalUsers = 0; let mitigatedConflicts = 0; 
    let totalRolesAssigned = 0; let totalRolesUsed = 0;

    enrichedUsers.forEach((user, index) => {
      currentCost += licenseCosts[user.currentLicense]?.cost || 2400; optimalCost += licenseCosts[user.optimalLicense]?.cost || 2400;
      totalConflicts += user.conflictCount; totalBloatPercent += (100 - user.usagePercent);
      totalAssignedTx += user.totalTxAssigned; totalUnusedTx += Math.max(0, user.totalTxAssigned - user.totalTxExecuted);
      if (user.statusColor === 'Red' || user.criticality === 'High Risk') criticalUsers++;
      mitigatedConflicts += Math.floor(user.conflictCount * 0.25); 
      const mockRolesAssigned = 8 + (index * 7) % 35; const mockRolesUsed = Math.max(1, Math.round(mockRolesAssigned * (user.usagePercent / 100)));
      totalRolesAssigned += mockRolesAssigned; totalRolesUsed += mockRolesUsed;
    });

    const projectedSavings = currentCost - optimalCost; const baseConflicts = totalConflicts;
    const postBloatConflicts = baseConflicts - Math.floor(baseConflicts * 0.40); 
    return {
      currentCost, optimalCost, projectedSavings, savingsPercentage: currentCost > 0 ? Math.round((projectedSavings / currentCost) * 100) : 0,
      avgBloat: Math.round(totalBloatPercent / enrichedUsers.length), totalAssignedTx, totalUnusedTx, estimatedDuplicates: Math.floor(totalAssignedTx * 0.08),
      authObjectsSaved: (totalUnusedTx + Math.floor(totalAssignedTx * 0.08)) * 30, totalConflicts: baseConflicts, criticalUsers, mitigatedConflicts,
      mitigationPercent: baseConflicts > 0 ? Math.round((mitigatedConflicts / baseConflicts) * 100) : 100,
      avgRoleDensity: Math.round(totalRolesAssigned / enrichedUsers.length), avgRolesUsed: Math.round(totalRolesUsed / enrichedUsers.length),
      postBloatConflicts, finalResidualConflicts: postBloatConflicts - Math.floor(postBloatConflicts * 0.85)
    };
  }, [enrichedUsers]);

  const { displayTcodes, maintainTcodes, activeTransactions } = useMemo(() => {
    let allTx = enrichedUsers.flatMap(u => u.transactions || []);
    if (allTx.length === 0) {
      allTx = Object.keys(fallbackDictionary); 
    }
    const txUsageCount = {};
    if (enrichedUsers.some(u => u.transactions?.length > 0)) {
      enrichedUsers.forEach(u => {
        const uniqueUserCodes = [...new Set((u.transactions || []).map(t => typeof t === 'object' ? t.tcode : t))];
        uniqueUserCodes.forEach(code => { txUsageCount[code] = (txUsageCount[code] || 0) + 1; });
      });
    }

    const uniqueTxMap = new Map();
    allTx.forEach((tx, idx) => {
      let tcode, desc, type;
      if (typeof tx === 'object' && tx.tcode) { tcode = tx.tcode; desc = tx.description || 'N/A'; type = tx.type || 'M'; } 
      else {
        tcode = tx; const fallback = fallbackDictionary[tx];
        if (fallback) { desc = fallback.description; type = fallback.type; } 
        else { const isDisplay = tx.endsWith('03') || tx.endsWith('D') || tx.includes('DISPLAY'); desc = isDisplay ? 'Standard Display' : 'Standard Edit Task'; type = isDisplay ? 'D' : 'M'; }
      }
      if (!uniqueTxMap.has(tcode)) {
        let usagePercent = enrichedUsers.length > 0 ? Math.round(((txUsageCount[tcode] || 0) / enrichedUsers.length) * 100) : Math.max(0, (tcode.length * 15 + idx * 7) % 95);
        uniqueTxMap.set(tcode, { tcode, description: desc, type, usagePercent });
      }
    });
    const uniqueTx = Array.from(uniqueTxMap.values());
    return { displayTcodes: uniqueTx.filter(t => t.type === 'D').sort((a,b) => b.usagePercent - a.usagePercent), maintainTcodes: uniqueTx.filter(t => t.type !== 'D').sort((a,b) => b.usagePercent - a.usagePercent), activeTransactions: uniqueTx };
  }, [enrichedUsers]);

  const optimizationInsights = useMemo(() => {
    const bloatCandidates = maintainTcodes.slice(0, 4).map((tx, index) => ({ ...tx, usage: index < 2 ? 0 : Math.max(2, (tx.tcode.length * index) % 9) })).sort((a, b) => a.usage - b.usage); 
    const sodCandidates = maintainTcodes.slice(4, 8).map(tx => ({ ...tx, usage: Math.max(5, (tx.tcode.length * 2) % 25), conflicts: tx.tcode.length + 2 }));
    const financialCandidates = maintainTcodes.slice(8, 12).map(tx => ({ ...tx, usage: 12 }));
    return { bloatCandidates, sodCandidates, financialCandidates };
  }, [maintainTcodes]);

  const removalReasonMap = useMemo(() => {
    const map = new Map();
    optimizationInsights.bloatCandidates.forEach(t => map.set(t.tcode, 'Never Used (Removed to clean clutter)'));
    optimizationInsights.sodCandidates.forEach(t => map.set(t.tcode, 'Security Risk (Removed for safety)'));
    optimizationInsights.financialCandidates.forEach(t => map.set(t.tcode, 'Cost Savings (Removed to lower license tier)'));
    return map;
  }, [optimizationInsights]);

  const chartDataCost = [{ name: 'Current Run-Rate', value: kpis.currentCost, fill: '#e2e8f0' }, { name: 'Target Optimized', value: kpis.optimalCost, fill: '#10b981' }];
  const chartDataBloat = [{ name: 'Active Executions', value: kpis.totalAssignedTx - kpis.totalUnusedTx }, { name: 'Unused (Bloat)', value: kpis.totalUnusedTx }];
  const chartDataRisk = [{ phase: 'Baseline', conflicts: kpis.totalConflicts }, { phase: 'Phase 1: Clean', conflicts: kpis.postBloatConflicts }, { phase: 'Phase 2: Segregate', conflicts: kpis.finalResidualConflicts }];

  const toggleSection = (id) => setExpandedSections(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleKpi = (id) => setExpandedKpis(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleRoleSection = (id) => setExpandedRoleSections(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleTxInclude = (tcode) => { setExcludedTx(prev => { const next = new Set(prev); if (next.has(tcode)) next.delete(tcode); else next.add(tcode); return next; }); };
  const handleImproveRole = (candidates) => { setExcludedTx(prev => { const next = new Set(prev); candidates.forEach(c => next.add(c.tcode)); return next; }); };

  const getRiskTheme = (colorCode) => {
    switch (colorCode) {
      case 'Red': return { bg: '#fff1f2', text: '#e11d48', border: '#fda4af', bar: 'linear-gradient(90deg, #fda4af 0%, #e11d48 100%)' };
      case 'Yellow': return { bg: '#fffbeb', text: '#d97706', border: '#fcd34d', bar: 'linear-gradient(90deg, #fcd34d 0%, #f59e0b 100%)' };
      case 'Blue': return { bg: '#f0f9ff', text: '#0284c7', border: '#7dd3fc', bar: 'linear-gradient(90deg, #7dd3fc 0%, #0ea5e9 100%)' };
      case 'Green': return { bg: '#ecfdf5', text: '#047857', border: '#6ee7b7', bar: 'linear-gradient(90deg, #6ee7b7 0%, #10b981 100%)' };
      default: return { bg: '#f8fafc', text: '#475569', border: '#cbd5e1', bar: '#94a3b8' };
    }
  };

  return (
    <div style={styles.teamAccordionWrapper}>
      {/* ACCORDION HEADER (DECLUTTERED) */}
      <div style={{...styles.teamAccordionHeader, borderBottom: isExpanded ? '1px solid #f1f5f9' : 'none'}} onClick={onToggle}>
        <div style={styles.flexCenter}>
          <input 
            type="checkbox" 
            checked={isChecked} 
            onChange={(e) => { e.stopPropagation(); onCheck(); }} 
            style={{...styles.checkbox, marginRight: '16px', transform: 'scale(1.1)'}} 
          />
          <div>
            <h3 style={{margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: '600'}}>
              {team.name} 
            </h3>
            <div style={{fontSize: '0.8rem', color: '#64748b', marginTop: '2px'}}>
              {team.uniqueId && <span>{team.uniqueId.split('-').slice(0,2).join(' / ')} • </span>}
              <span>{enrichedUsers.length} Users</span>
            </div>
          </div>
        </div>
        
        <div style={styles.flexCenter}>
          <div style={{display: 'flex', gap: '8px', marginRight: '16px'}} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => onBuildRole('View-Only Role')} style={styles.btnMiniOutline} title="Create View-Only Roles">👁️ View</button>
            <button onClick={() => onBuildRole('Edit Role')} style={styles.btnMiniOutline} title="Create Edit Roles">✍️ Edit</button>
            <button onClick={() => onBuildRole('All Roles')} style={styles.btnMiniOutline} title="Create All Roles">🌟 All</button>
            <div style={styles.vertDividerMini}></div>
            <button onClick={() => setIsSummaryModalOpen(true)} style={styles.btnMiniGhost}>📊 Summary</button>
          </div>
          <div style={{color: '#94a3b8', fontSize: '0.8rem', width: '20px', textAlign: 'right'}}>{isExpanded ? '▼' : '▶'}</div>
        </div>
      </div>

      {/* ACCORDION BODY */}
      {isExpanded && (
        <div style={styles.teamAccordionBody}>
          <div style={{...styles.tabContainer, marginTop: 0, paddingTop: '16px', paddingBottom: '0', paddingLeft: '24px', paddingRight: '24px'}}>
            <div style={styles.tabGroup}>
              <button onClick={() => setActiveTab('summary')} style={{...styles.tabBtn, ...(activeTab === 'summary' ? styles.tabBtnActive : {})}}>📑 Executive Summary</button>
              <button onClick={() => setActiveTab('roster')} style={{...styles.tabBtn, ...(activeTab === 'roster' ? styles.tabBtnActive : {})}}>👥 User Details</button>
              <button onClick={() => setActiveTab('roles')} style={{...styles.tabBtn, ...(activeTab === 'roles' ? styles.tabBtnActive : {})}}>🏗️ Role Creation</button>
            </div>
            {activeTab === 'summary' && (
              <div style={styles.toggleGroup}>
                <button onClick={() => setSummaryView('plan')} style={{...styles.toggleBtn, ...(summaryView === 'plan' ? styles.toggleBtnActive : {})}}>📝 Plan</button>
                <button onClick={() => setSummaryView('grid')} style={{...styles.toggleBtn, ...(summaryView === 'grid' ? styles.toggleBtnActive : {})}}>📊 Grid</button>
              </div>
            )}
          </div>

          <div style={{padding: '24px'}}>
            {/* TAB 1: SUMMARY */}
            {activeTab === 'summary' && (
              <div style={styles.tabContentFadeIn}>
                {summaryView === 'plan' ? (
                  <div style={styles.reportContainer}>
                    <div style={styles.accordionContainer}>
                      {/* Financials */}
                      <div style={{...styles.accordionItem, borderColor: expandedSections.includes(1) ? '#bbf7d0' : '#e2e8f0'}}>
                        <div style={{...styles.accordionHeader, backgroundColor: expandedSections.includes(1) ? '#f0fdf4' : '#ffffff'}} onClick={(e) => { e.stopPropagation(); toggleSection(1); }}>
                          <div style={styles.accordionTitleWrap}><span style={styles.iconSp}>🎯</span><h3 style={{...styles.accordionTitle, color: expandedSections.includes(1) ? '#047857' : '#0f172a'}}>Save Money on Licenses</h3></div>
                          <div style={{...styles.chevron, transform: expandedSections.includes(1) ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</div>
                        </div>
                        {expandedSections.includes(1) && (
                          <div style={styles.accordionContent}>
                            <div style={styles.listWrapper}>
                              <div style={styles.bulletItem}><div style={styles.bulletMarker}></div><div style={styles.bulletContent}><strong>Save ${kpis.projectedSavings.toLocaleString()}:</strong> By giving users a cheaper license if they only do basic tasks.</div></div>
                            </div>
                            {optimizationInsights.financialCandidates.length > 0 ? (
                              <div style={styles.proposedRemovalsBox}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                  <h4 style={styles.proposedTitle}>Suggested Access Removals (to save money)</h4>
                                  <button onClick={() => handleImproveRole(optimizationInsights.financialCandidates)} style={styles.btnImproveRole}>✨ Remove Transactions</button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  {optimizationInsights.financialCandidates.map(tx => {
                                    const isIncluded = !excludedTx.has(tx.tcode);
                                    return (
                                      <label key={tx.tcode} style={{...styles.proposedLabel, opacity: isIncluded ? 1 : 0.5}}>
                                        <input type="checkbox" checked={isIncluded} onChange={() => toggleTxInclude(tx.tcode)} style={styles.checkbox}/>
                                        <span style={styles.txCodeBadge}>{tx.tcode}</span><span style={styles.txDescText}>{tx.description} ({tx.usage === 0 ? 'No Usage' : 'Low Usage'})</span>
                                        {!isIncluded && <span style={styles.removedTag}>Removed</span>}
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              <div style={styles.autoResolvedBox}>
                                <span style={{fontSize: '1.2rem'}}>✨</span>
                                <p style={{margin: 0, color: '#047857', fontSize: '0.9rem', fontWeight: '500'}}>
                                  <strong>Good news!</strong> Since we automatically removed access that users haven't used, your license costs are already optimized. No extra actions needed.
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Security */}
                      <div style={{...styles.accordionItem, borderColor: expandedSections.includes(2) ? '#bbf7d0' : '#e2e8f0'}}>
                        <div style={{...styles.accordionHeader, backgroundColor: expandedSections.includes(2) ? '#f0fdf4' : '#ffffff'}} onClick={(e) => { e.stopPropagation(); toggleSection(2); }}>
                          <div style={styles.accordionTitleWrap}><span style={styles.iconSp}>🛡️</span><h3 style={{...styles.accordionTitle, color: expandedSections.includes(2) ? '#047857' : '#0f172a'}}>Reduce Security Risks</h3></div>
                          <div style={{...styles.chevron, transform: expandedSections.includes(2) ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</div>
                        </div>
                        {expandedSections.includes(2) && (
                          <div style={styles.accordionContent}>
                            <div style={styles.listWrapper}>
                              <div style={styles.bulletItem}><div style={styles.bulletMarker}></div><div style={styles.bulletContent}><strong>Fix {kpis.totalConflicts} Security Risks:</strong> By making sure users don't have conflicting access (like both paying and approving a bill).</div></div>
                            </div>
                            {optimizationInsights.sodCandidates.length > 0 ? (
                              <div style={styles.proposedRemovalsBox}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                  <h4 style={styles.proposedTitle}>Suggested Access Removals (to fix risks)</h4>
                                  <button onClick={() => handleImproveRole(optimizationInsights.sodCandidates)} style={styles.btnImproveRole}>✨ Remove Transactions</button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  {optimizationInsights.sodCandidates.map(tx => {
                                    const isIncluded = !excludedTx.has(tx.tcode);
                                    return (
                                      <label key={tx.tcode} style={{...styles.proposedLabel, opacity: isIncluded ? 1 : 0.5}}>
                                        <input type="checkbox" checked={isIncluded} onChange={() => toggleTxInclude(tx.tcode)} style={styles.checkbox}/>
                                        <span style={styles.txCodeBadge}>{tx.tcode}</span><span style={styles.txDescText}>{tx.description} ({tx.usage === 0 ? 'No Usage' : 'Low Usage'} & Security Risk)</span>
                                        {!isIncluded && <span style={styles.removedTag}>Removed</span>}
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              <div style={styles.autoResolvedBox}>
                                <span style={{fontSize: '1.2rem'}}>✨</span>
                                <p style={{margin: 0, color: '#047857', fontSize: '0.9rem', fontWeight: '500'}}>
                                  <strong>Good news!</strong> Since we automatically removed access that users haven't used, these security risks are automatically resolved. No extra actions needed.
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Architecture */}
                      <div style={{...styles.accordionItem, borderColor: expandedSections.includes(3) ? '#bbf7d0' : '#e2e8f0'}}>
                        <div style={{...styles.accordionHeader, backgroundColor: expandedSections.includes(3) ? '#f0fdf4' : '#ffffff'}} onClick={(e) => { e.stopPropagation(); toggleSection(3); }}>
                          <div style={styles.accordionTitleWrap}><span style={styles.iconSp}>⚙️</span><h3 style={{...styles.accordionTitle, color: expandedSections.includes(3) ? '#047857' : '#0f172a'}}>Clean Up System Clutter</h3></div>
                          <div style={{...styles.chevron, transform: expandedSections.includes(3) ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</div>
                        </div>
                        {expandedSections.includes(3) && (
                          <div style={styles.accordionContent}>
                            <div style={styles.listWrapper}>
                              <div style={styles.bulletItem}><div style={styles.bulletMarker}></div><div style={styles.bulletContent}><strong>Remove {kpis.avgBloat}% Unused Access:</strong> By taking away permissions that people have but never actually use.</div></div>
                            </div>
                            {optimizationInsights.bloatCandidates.length > 0 ? (
                              <div style={styles.proposedRemovalsBox}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                  <h4 style={styles.proposedTitle}>Suggested Access Removals (to clean up clutter)</h4>
                                  <button onClick={() => handleImproveRole(optimizationInsights.bloatCandidates)} style={styles.btnImproveRole}>✨ Remove Transactions</button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  {optimizationInsights.bloatCandidates.map(tx => {
                                    const isIncluded = !excludedTx.has(tx.tcode);
                                    return (
                                      <label key={tx.tcode} style={{...styles.proposedLabel, opacity: isIncluded ? 1 : 0.5}}>
                                        <input type="checkbox" checked={isIncluded} onChange={() => toggleTxInclude(tx.tcode)} style={styles.checkbox}/>
                                        <span style={styles.txCodeBadge}>{tx.tcode}</span><span style={styles.txDescText}>{tx.description} ({tx.usage === 0 ? 'No Usage' : 'Low Usage'})</span>
                                        {!isIncluded && <span style={styles.removedTag}>Removed</span>}
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              <div style={styles.autoResolvedBox}>
                                <span style={{fontSize: '1.2rem'}}>✨</span>
                                <p style={{margin: 0, color: '#047857', fontSize: '0.9rem', fontWeight: '500'}}>
                                  <strong>Good news!</strong> Since we automatically removed access that users haven't used, your system clutter is automatically cleaned up. No extra actions needed.
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* GRID VIEW */
                  <div style={styles.flowingGrid}>
                    <div style={styles.flowingAccordionItem}>
                      <div style={styles.flowingAccordionHeader} onClick={() => toggleKpi(1)}>
                        <div style={styles.kpiTitleGroup}><span style={{fontSize: '1.4rem'}}>💰</span><div style={styles.kpiTitleCol}><h3 style={styles.kpiTitle}>License Cost</h3></div></div>
                        <div style={styles.kpiMainValueGroup}><div style={styles.kpiAccordionValue}>${kpis.projectedSavings.toLocaleString()} <span style={styles.kpiSubValue}>Saved</span></div><div style={{...styles.chevron, transform: expandedKpis.includes(1) ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</div></div>
                      </div>
                      {expandedKpis.includes(1) && (
                        <div style={styles.flowingAccordionContent}>
                          <div style={styles.chartWrapper}>
                            <ResponsiveContainer width="100%" height={200}>
                              <BarChart data={[{ name: 'Current Run-Rate', value: kpis.currentCost, fill: '#e2e8f0' }, { name: 'Target Optimized', value: kpis.optimalCost, fill: '#10b981' }]} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" /><XAxis type="number" hide /><YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={120} tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} /><RechartsTooltip cursor={{fill: 'transparent'}} formatter={(val) => `$${val.toLocaleString()}`} /><Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={25}><Cell fill="#e2e8f0" /><Cell fill="#10b981" /></Bar></BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Bloat */}
                    <div style={styles.flowingAccordionItem}>
                      <div style={styles.flowingAccordionHeader} onClick={() => toggleKpi(2)}>
                        <div style={styles.kpiTitleGroup}><span style={{fontSize: '1.4rem'}}>🗑️</span><div style={styles.kpiTitleCol}><h3 style={styles.kpiTitle}>Unused Clutter</h3></div></div>
                        <div style={styles.kpiMainValueGroup}><div style={styles.kpiAccordionValue}>{kpis.avgBloat}% <span style={styles.kpiSubValue}>Unused</span></div><div style={{...styles.chevron, transform: expandedKpis.includes(2) ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</div></div>
                      </div>
                      {expandedKpis.includes(2) && (
                        <div style={styles.flowingAccordionContent}>
                          <div style={styles.chartWrapper}>
                            <ResponsiveContainer width="100%" height={200}>
                              <PieChart><Pie data={[{ name: 'Active Executions', value: kpis.totalAssignedTx - kpis.totalUnusedTx }, { name: 'Unused (Bloat)', value: kpis.totalUnusedTx }]} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{[{ name: 'Active Executions', value: kpis.totalAssignedTx - kpis.totalUnusedTx }, { name: 'Unused (Bloat)', value: kpis.totalUnusedTx }].map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}</Pie><RechartsTooltip formatter={(val) => `${val.toLocaleString()} Items`} /><Legend verticalAlign="bottom" height={36}/></PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Risk */}
                    <div style={styles.flowingAccordionItem}>
                      <div style={styles.flowingAccordionHeader} onClick={() => toggleKpi(3)}>
                        <div style={styles.kpiTitleGroup}><span style={{fontSize: '1.4rem'}}>🛡️</span><div style={styles.kpiTitleCol}><h3 style={styles.kpiTitle}>Security Risks</h3></div></div>
                        <div style={styles.kpiMainValueGroup}><div style={styles.kpiAccordionValue}>{kpis.finalResidualConflicts} <span style={styles.kpiSubValue}>Target</span></div><div style={{...styles.chevron, transform: expandedKpis.includes(3) ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</div></div>
                      </div>
                      {expandedKpis.includes(3) && (
                        <div style={styles.flowingAccordionContent}>
                          <div style={styles.chartWrapper}>
                            <ResponsiveContainer width="100%" height={200}>
                              <AreaChart data={[{ phase: 'Baseline', conflicts: kpis.totalConflicts }, { phase: 'Phase 1: Clean', conflicts: kpis.postBloatConflicts }, { phase: 'Phase 2: Segregate', conflicts: kpis.finalResidualConflicts }]} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <defs><linearGradient id="colorConflicts" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/><stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/></linearGradient></defs>
                                <XAxis dataKey="phase" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis hide /><RechartsTooltip /><Area type="monotone" dataKey="conflicts" stroke="#f43f5e" fillOpacity={1} fill="url(#colorConflicts)" />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: ROSTER */}
            {activeTab === 'roster' && (
              <div style={styles.tabContentFadeIn}>
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>User Profile</th>
                        <th style={styles.th}>Access Used</th>
                        <th style={styles.th}>Original Risks</th>
                        <th style={styles.th}>New Risks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrichedUsers.map((user, idx) => {
                        const theme = getRiskTheme(user.statusColor);
                        const userTcodes = user.transactions.map(t => typeof t === 'object' ? t.tcode : t);
                        const userExcludedCount = userTcodes.filter(code => excludedTx.has(code)).length;
                        const mockReductionFactor = excludedTx.size > 0 ? Math.ceil((excludedTx.size / maintainTcodes.length) * user.conflictCount) : 0;
                        const actualReduction = userTcodes.length > 0 ? Math.min(user.conflictCount, userExcludedCount) : mockReductionFactor;
                        const newConflicts = Math.max(0, user.conflictCount - actualReduction);

                        return (
                          <tr key={idx} style={{...styles.tr, borderLeft: `3px solid ${theme.border}`}}>
                            <td style={styles.td}><div style={styles.primaryText}>{user.userName || 'Unknown User'}</div><div style={styles.secondaryText}>{user.position || user.department} • {user.userId}</div></td>
                            <td style={styles.td}>
                              <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px'}}>
                                <div style={styles.usageBarBg}><div style={{...styles.usageBarFill, width: `${user.usagePercent}%`, background: theme.bar}}></div></div><span style={{fontSize: '0.85rem', fontWeight: '700', color: '#0f172a'}}>{user.usagePercent}%</span>
                              </div>
                              <div style={styles.secondaryText}>{user.totalTxExecuted} Tasks Used</div>
                            </td>
                            <td style={styles.td}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '1rem', fontWeight: '700', color: theme.text, textDecoration: actualReduction > 0 ? 'line-through' : 'none', opacity: actualReduction > 0 ? 0.5 : 1 }}>{user.conflictCount}</span>
                                {actualReduction === 0 && <span style={{ ...styles.pillBadge, backgroundColor: theme.bg, color: theme.text }}>{user.criticality}</span>}
                              </div>
                            </td>
                            <td style={styles.td}>
                              {actualReduction > 0 ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '1rem', fontWeight: '700', color: '#059669' }}>{newConflicts}</span>
                                  <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#047857', backgroundColor: '#ecfdf5', padding: '2px 6px', borderRadius: '4px' }}>-{actualReduction} Fixed</span>
                                </div>
                              ) : <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#94a3b8', fontStyle: 'italic' }}>{user.conflictCount} (Unchanged)</span>}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: ROLES */}
            {activeTab === 'roles' && (
              <div style={styles.tabContentFadeIn}>
                <div style={styles.accordionContainer}>
                  {/* DISPLAY */}
                  <div style={{...styles.accordionItem, borderColor: expandedRoleSections.includes('display') ? '#a7f3d0' : '#e2e8f0'}}>
                    <div style={{...styles.accordionHeader, backgroundColor: expandedRoleSections.includes('display') ? '#f0fdf4' : '#ffffff'}} onClick={() => toggleRoleSection('display')}>
                      <div style={styles.accordionTitleWrap}><span style={styles.iconSp}>👁️</span><div><h3 style={{...styles.accordionTitle, color: '#047857'}}>View-Only Role (Safe Access)</h3><span style={styles.cardSub}>Safe, read-only tasks where users can't change data.</span></div></div>
                      <div style={styles.flexCenter}><span style={styles.countBadgeLight}>{displayTcodes.length} Items</span><div style={{...styles.chevron, marginLeft: '16px', transform: expandedRoleSections.includes('display') ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</div></div>
                    </div>
                    {expandedRoleSections.includes('display') && (
                      <div style={{...styles.accordionContent, padding: 0}}>
                        <table style={styles.roleTable}>
                          <thead><tr><th style={{...styles.th, width: '80px', textAlign: 'center'}}>Include</th><th style={styles.th}>Task / Access Item</th><th style={styles.th}>Usage</th><th style={{...styles.th, width: '200px'}}>Removal Reason</th></tr></thead>
                          <tbody>
                            {displayTcodes.map(tx => {
                              const isIncluded = !excludedTx.has(tx.tcode);
                              return (
                                <tr key={tx.tcode} style={{...styles.tr, backgroundColor: isIncluded ? '#ffffff' : '#f8fafc', transition: 'all 0.2s ease'}}>
                                  <td style={{...styles.td, textAlign: 'center'}}><input type="checkbox" checked={isIncluded} onChange={() => toggleTxInclude(tx.tcode)} style={styles.checkbox} /></td>
                                  <td style={{...styles.td, opacity: isIncluded ? 1 : 0.5}}><div style={styles.primaryText}>{tx.tcode}</div><div style={styles.secondaryText}>{tx.description}</div></td>
                                  <td style={{...styles.td, opacity: isIncluded ? 1 : 0.5}}><div style={{display: 'flex', alignItems: 'center', gap: '12px'}}><div style={{...styles.usageBarBg, width: '100px'}}><div style={{...styles.usageBarFill, width: `${tx.usagePercent}%`, background: '#0ea5e9'}}></div></div><span style={{fontSize: '0.85rem', fontWeight: '600', color: tx.usagePercent === 0 ? '#94a3b8' : '#0f172a'}}>{tx.usagePercent}%</span></div></td>
                                  <td style={{...styles.td, fontStyle: 'italic', fontSize: '0.85rem', color: '#e11d48'}}>{!isIncluded ? (removalReasonMap.get(tx.tcode) || 'Manually Removed') : '--'}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* MAINTAIN */}
                  <div style={{...styles.accordionItem, borderColor: expandedRoleSections.includes('maintain') ? '#fecdd3' : '#e2e8f0'}}>
                    <div style={{...styles.accordionHeader, backgroundColor: expandedRoleSections.includes('maintain') ? '#fff1f2' : '#ffffff'}} onClick={() => toggleRoleSection('maintain')}>
                      <div style={styles.accordionTitleWrap}><span style={styles.iconSp}>✍️</span><div><h3 style={{...styles.accordionTitle, color: '#e11d48'}}>Edit/Create Role (Higher Risk)</h3><span style={styles.cardSub}>Tasks that allow changing data, which carry higher risk.</span></div></div>
                      <div style={styles.flexCenter}><span style={styles.countBadgeLightRed}>{maintainTcodes.length} Items</span><div style={{...styles.chevron, marginLeft: '16px', transform: expandedRoleSections.includes('maintain') ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</div></div>
                    </div>
                    {expandedRoleSections.includes('maintain') && (
                      <div style={{...styles.accordionContent, padding: 0}}>
                        <table style={styles.roleTable}>
                          <thead><tr><th style={{...styles.th, width: '80px', textAlign: 'center'}}>Include</th><th style={styles.th}>Task / Access Item</th><th style={styles.th}>Usage</th><th style={{...styles.th, width: '200px'}}>Removal Reason</th></tr></thead>
                          <tbody>
                            {maintainTcodes.map(tx => {
                              const isIncluded = !excludedTx.has(tx.tcode);
                              return (
                                <tr key={tx.tcode} style={{...styles.tr, backgroundColor: isIncluded ? '#ffffff' : '#f8fafc', transition: 'all 0.2s ease'}}>
                                  <td style={{...styles.td, textAlign: 'center'}}><input type="checkbox" checked={isIncluded} onChange={() => toggleTxInclude(tx.tcode)} style={styles.checkbox} /></td>
                                  <td style={{...styles.td, opacity: isIncluded ? 1 : 0.5}}><div style={styles.primaryText}>{tx.tcode}</div><div style={styles.secondaryText}>{tx.description}</div></td>
                                  <td style={{...styles.td, opacity: isIncluded ? 1 : 0.5}}><div style={{display: 'flex', alignItems: 'center', gap: '12px'}}><div style={{...styles.usageBarBg, width: '100px'}}><div style={{...styles.usageBarFill, width: `${tx.usagePercent}%`, background: tx.usagePercent === 0 ? '#cbd5e1' : '#f43f5e'}}></div></div><span style={{fontSize: '0.85rem', fontWeight: '600', color: tx.usagePercent === 0 ? '#94a3b8' : '#0f172a'}}>{tx.usagePercent}%</span></div></td>
                                  <td style={{...styles.td, fontStyle: 'italic', fontSize: '0.85rem', color: '#e11d48'}}>{!isIncluded ? (removalReasonMap.get(tx.tcode) || 'Manually Removed') : '--'}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <SummarizedChangesModal 
        isOpen={isSummaryModalOpen} onClose={() => setIsSummaryModalOpen(false)} 
        allTx={activeTransactions} excludedTx={excludedTx} displayTcodes={displayTcodes} 
        maintainTcodes={maintainTcodes} teamName={team.name}
      />
    </div>
  );
}

// ============================================================================
// MAIN EXPORT (BATCH HUB)
// ============================================================================
export default function TeamMatrix({ selectedTeams, team, onBack }) {
  const rawTeams = selectedTeams || team;
  const teamsList = Array.isArray(rawTeams) ? rawTeams : (rawTeams ? [rawTeams] : []);
  
  const [activeScreen, setActiveScreen] = useState('matrix');
  const [pfcgRoleType, setPfcgRoleType] = useState('');
  const [pfcgTeamCount, setPfcgTeamCount] = useState(0);

  const [expandedTeam, setExpandedTeam] = useState(null);
  const [checkedTeams, setCheckedTeams] = useState(new Set());

  useEffect(() => {
    if (teamsList.length > 0) {
      setCheckedTeams(new Set(teamsList.map(t => t.uniqueId || t.name)));
    }
  }, [teamsList.length]);

  const toggleCheck = (id) => {
    setCheckedTeams(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleBuildRole = (type, count) => {
    setPfcgRoleType(type);
    setPfcgTeamCount(count);
    setActiveScreen('pfcg');
  };

  if (activeScreen === 'pfcg') {
    return <PfcgBuilderScreen roleType={pfcgRoleType} teamsProcessed={pfcgTeamCount} onBack={() => setActiveScreen('matrix')} />;
  }

  if (teamsList.length === 0) {
    return <div style={{...styles.container, textAlign: 'center', paddingTop: '100px'}}><h2>No Teams Selected</h2><button onClick={onBack} style={styles.btnSecondaryBlue}>Go Back</button></div>;
  }

  return (
    <div style={{...styles.container, backgroundColor: '#f8fafc'}}>
      <header style={styles.sleekHeader}>
        <div style={styles.headerTopRow}><button onClick={onBack} style={styles.backLinkBtn}><span style={styles.backArrow}>←</span> Back to Global Dashboard</button></div>
        <div style={styles.headerTitleRow}>
          <div style={{ textAlign: 'left' }}>
            <h1 style={styles.heroTitle}>Multi-Team <span style={styles.heroAccent}>Workspace</span></h1>
            <p style={styles.heroSubtitle}>Managing <strong>{teamsList.length} organizational units</strong> simultaneously.</p>
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
        {teamsList.map((t, idx) => {
          const id = t.uniqueId || t.name;
          return (
            <TeamAccordion 
              key={id + idx} team={t} isChecked={checkedTeams.has(id)}
              onCheck={() => toggleCheck(id)} isExpanded={expandedTeam === id}
              onToggle={() => setExpandedTeam(expandedTeam === id ? null : id)}
              onBuildRole={(type) => handleBuildRole(type, 1)}
            />
          );
        })}
      </div>

      <div style={{backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px 32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'}}>
        <div style={styles.footerInner}>
          <div style={{color: '#475569', fontSize: '1rem', fontWeight: '500'}}>Ready to deploy optimizations? ({checkedTeams.size} teams selected)</div>
          <div style={styles.footerActionGroup}>
            <button onClick={() => handleBuildRole('View-Only Role', checkedTeams.size)} style={styles.btnSecondaryBlue}>Create View-Only Roles</button>
            <button onClick={() => handleBuildRole('Edit Role', checkedTeams.size)} style={styles.btnSecondaryRed}>Create Edit Roles</button>
            <div style={styles.vertDivider}></div>
            <button onClick={() => handleBuildRole('All Roles', checkedTeams.size)} style={styles.btnPrimaryEmerald}>Create All Roles Together</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- CSS-IN-JS STYLES ---
const styles = {
  container: { padding: '40px 60px 80px 60px', minHeight: '100vh', fontFamily: '"Inter", -apple-system, sans-serif', position: 'relative' },
  flexCenter: { display: 'flex', alignItems: 'center' },
  sleekHeader: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '30px' },
  headerTopRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  backLinkBtn: { background: 'none', border: 'none', color: '#64748b', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: 0, marginBottom: '8px' },
  backArrow: { fontSize: '1.2rem', lineHeight: '1' },
  headerTitleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', textAlign: 'left' },
  eyebrowText: { color: '#64748b', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' },
  heroTitle: { color: '#0f172a', margin: '0 0 4px 0', fontSize: '2.2rem', fontWeight: '600', letterSpacing: '-0.5px' },
  heroAccent: { color: '#10b981', fontWeight: '600' }, 
  heroSubtitle: { margin: 0, fontSize: '1rem', color: '#475569', fontWeight: '400' },

  teamAccordionWrapper: { backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' },
  teamAccordionHeader: { padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: '#ffffff' },
  batchBadge: { backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600' },
  teamAccordionBody: { borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff' },

  tabContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #e2e8f0' },
  tabGroup: { display: 'flex', gap: '16px' },
  tabBtn: { padding: '12px 16px', border: 'none', background: 'transparent', color: '#64748b', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', borderBottom: '2px solid transparent', marginBottom: '-1px' },
  tabBtnActive: { color: '#0f172a', borderBottom: '2px solid #10b981' },
  toggleGroup: { display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '6px', marginBottom: '8px' },
  toggleBtn: { border: 'none', background: 'transparent', padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '500', color: '#64748b', cursor: 'pointer' },
  toggleBtnActive: { background: '#ffffff', color: '#0f172a', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },

  contentCanvas: { backgroundColor: '#ffffff', borderRadius: '0 0 12px 12px', padding: '24px 0 0 0' },
  tabContentFadeIn: { animation: 'fadeIn 0.2s ease-in-out' },

  reportContainer: { width: '100%', margin: '0' },
  accordionContainer: { display: 'flex', flexDirection: 'column', gap: '12px' },
  accordionItem: { border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' },
  accordionHeader: { padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' },
  accordionTitleWrap: { display: 'flex', alignItems: 'center' },
  iconSp: { marginRight: '12px', fontSize: '1.2rem' },
  accordionTitle: { margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: '600' },
  chevron: { color: '#94a3b8', fontSize: '0.7rem', display: 'inline-block', transition: 'transform 0.3s ease' },
  accordionContent: { padding: '20px', backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0' },
  listWrapper: { display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '4px' },
  bulletItem: { display: 'flex', alignItems: 'flex-start', gap: '12px' },
  bulletMarker: { minWidth: '6px', height: '6px', backgroundColor: '#cbd5e1', borderRadius: '50%', marginTop: '8px' },
  bulletContent: { fontSize: '0.9rem', color: '#475569', lineHeight: '1.5' },

  proposedRemovalsBox: { backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginTop: '16px' },
  proposedTitle: { margin: 0, fontSize: '0.9rem', color: '#0f172a', fontWeight: '600' },
  btnImproveRole: { backgroundColor: '#ffffff', color: '#10b981', border: '1px solid #a7f3d0', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' },
  proposedLabel: { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' },
  txCodeBadge: { fontFamily: 'monospace', fontWeight: '600', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem', color: '#334155' },
  txDescText: { fontSize: '0.85rem', color: '#475569', flex: 1 },
  removedTag: { fontSize: '0.7rem', fontWeight: '600', color: '#e11d48', backgroundColor: '#fff1f2', padding: '2px 8px', borderRadius: '100px' },
  autoResolvedBox: { backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px 16px', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' },

  flowingGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', columnGap: '40px' },
  flowingAccordionItem: { borderBottom: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' },
  flowingAccordionHeader: { padding: '16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' },
  kpiTitleGroup: { display: 'flex', alignItems: 'center', gap: '12px' },
  kpiTitleCol: { display: 'flex', flexDirection: 'column', gap: '2px' },
  kpiTitle: { margin: 0, fontSize: '0.95rem', fontWeight: '600', color: '#0f172a' },
  kpiMainValueGroup: { display: 'flex', alignItems: 'center', gap: '16px' },
  kpiAccordionValue: { fontSize: '1.4rem', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'baseline', gap: '6px' },
  kpiSubValue: { fontSize: '0.8rem', fontWeight: '500', color: '#64748b' },
  flowingAccordionContent: { padding: '0 0 20px 0', paddingLeft: '36px' },
  chartWrapper: { paddingTop: '16px', borderTop: '1px dashed #e2e8f0', minHeight: '200px' },

  tableWrapper: { borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden', maxHeight: '500px', overflowY: 'auto' },
  roleTable: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' },
  th: { padding: '12px 16px', backgroundColor: '#f8fafc', color: '#475569', fontWeight: '600', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 1 },
  tr: { borderBottom: '1px solid #f1f5f9', backgroundColor: '#ffffff' },
  td: { padding: '12px 16px', verticalAlign: 'middle', color: '#334155' },
  checkbox: { width: '16px', height: '16px', cursor: 'pointer', accentColor: '#10b981' },
  primaryText: { fontSize: '0.95rem', fontWeight: '600', color: '#0f172a', marginBottom: '2px' },
  secondaryText: { fontSize: '0.8rem', color: '#64748b' },
  usageBarBg: { height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden', width: '100px' },
  usageBarFill: { height: '100%', borderRadius: '3px' },
  pillBadge: { padding: '2px 8px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: '600' },

  cardSub: { margin: 0, fontSize: '0.8rem', color: '#64748b' },
  countBadgeLight: { backgroundColor: '#f0fdf4', color: '#047857', padding: '2px 8px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '600' },
  countBadgeLightRed: { backgroundColor: '#fff1f2', color: '#e11d48', padding: '2px 8px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '600' },
  
  footerInner: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  footerActionGroup: { display: 'flex', alignItems: 'center', gap: '12px' },
  vertDivider: { width: '1px', height: '24px', backgroundColor: '#e2e8f0', margin: '0 8px' },
  vertDividerMini: { width: '1px', height: '16px', backgroundColor: '#e2e8f0', margin: '0 4px' },
  
  btnMiniOutline: { background: '#ffffff', border: '1px solid #e2e8f0', color: '#475569', padding: '6px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' },
  btnMiniGhost: { background: 'transparent', border: '1px solid transparent', color: '#475569', padding: '6px 10px', borderRadius: '6px', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer' },
  btnSecondaryGraySmall: { background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', padding: '6px 12px', borderRadius: '6px', fontWeight: '500', fontSize: '0.8rem', cursor: 'pointer' },
  btnSecondaryBlue: { background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' },
  btnSecondaryRed: { background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' },
  btnPrimaryEmerald: { background: '#10b981', border: 'none', color: '#ffffff', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', boxShadow: '0 1px 3px rgba(16, 185, 129, 0.3)' },

  pfcgCanvas: { flex: 1, overflowY: 'auto', padding: '24px 32px', backgroundColor: '#f8fafc', fontFamily: '"Consolas", "Courier New", monospace', fontSize: '0.9rem', height: '100%', minHeight: '600px' },
  pfcgRow: { display: 'flex', alignItems: 'center', padding: '8px 12px', cursor: 'pointer' },
  toggleSp: { display: 'inline-block', width: '20px', fontSize: '0.7rem', color: '#94a3b8' },
  pfcgFolder: { margin: '0 12px 0 8px', fontSize: '1.1rem' },
  pfcgDoc: { margin: '0 12px 0 8px', fontSize: '1.1rem' },
  pfcgEdit: { margin: '0 12px 0 8px', fontSize: '1rem' },
  pfcgStatus: { width: '120px', color: '#475569', fontWeight: '600' },
  pfcgTextMain: { flex: 1, color: '#0f172a' },
  pfcgIdLabel: { color: '#64748b', textAlign: 'right' },

  modalBackdrop: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(2px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  modalContent: { backgroundColor: '#ffffff', borderRadius: '16px', width: '550px', maxWidth: '90%', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '85vh' },
  modalHeader: { backgroundColor: '#ffffff', padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: '600' },
  closeButton: { background: 'none', border: 'none', fontSize: '1.5rem', color: '#94a3b8', cursor: 'pointer', padding: 0, lineHeight: 1 },
  modalBody: { padding: '24px', overflowY: 'auto' },
  
  summaryBox: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column' },
  summaryBoxHeader: { display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '12px' },
  summaryBoxTitle: { fontWeight: '600', color: '#0f172a', fontSize: '0.9rem' },
  summaryPillContainer: { display: 'flex', flexWrap: 'wrap', gap: '6px', overflowY: 'auto', maxHeight: '180px', paddingRight: '4px' },
  summaryPill: { padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', fontFamily: '"Fira Code", monospace' },
};