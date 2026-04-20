import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import userDetails from './User_Details.json';
import licenseCosts from './License_Costs.json';

// --- MOCK DATA FROM Data1.txt ---
const mockPfcgData = [
  { clss: "AAAB", clssText: "Cross-application Authorization Objects", object: "S_TCODE", objText: "Transaction Code Check at Transaction Start", auth: "00", authStatus: "S", fieldName: "TCD", fieldText: "Transaction Code", value: "ME23N" },
  { clss: "AAAB", clssText: "Cross-application Authorization Objects", object: "S_TCODE", objText: "Transaction Code Check at Transaction Start", auth: "00", authStatus: "S", fieldName: "TCD", fieldText: "Transaction Code", value: "VA03" },
  { clss: "AAAB", clssText: "Cross-application Authorization Objects", object: "B_BUPA_GRP", objText: "Business Partner: Authorization Groups", auth: "00", authStatus: "U", fieldName: "ACTVT", fieldText: "Activity", value: "03" },
  { clss: "AAAB", clssText: "Cross-application Authorization Objects", object: "B_BUPA_GRP", objText: "Business Partner: Authorization Groups", auth: "00", authStatus: "U", fieldName: "ACTVT", fieldText: "Activity", value: "F4" },
  { clss: "AAAB", clssText: "Cross-application Authorization Objects", object: "B_BUPA_GRP", objText: "Business Partner: Authorization Groups", auth: "00", authStatus: "U", fieldName: "BEGRU", fieldText: "Authorization Group", value: "*" },
  { clss: "AAAB", clssText: "Cross-application Authorization Objects", object: "B_BUPA_RLT", objText: "Business Partner: BP Roles", auth: "01", authStatus: "G", fieldName: "ACTVT", fieldText: "Activity", value: "F4" },
  { clss: "BC_A", clssText: "Basis: Administration", object: "S_ARCHIVE", objText: "Archiving", auth: "00", authStatus: "S", fieldName: "ACTVT", fieldText: "Activity", value: "03" },
  { clss: "BC_A", clssText: "Basis: Administration", object: "S_ARCHIVE", objText: "Archiving", auth: "00", authStatus: "S", fieldName: "APPLIC", fieldText: "Application area", value: "SD" },
  { clss: "BC_A", clssText: "Basis: Administration", object: "S_ARCHIVE", objText: "Archiving", auth: "01", authStatus: "U", fieldName: "ACTVT", fieldText: "Activity", value: "48" },
  { clss: "CLAS", clssText: "Classification", object: "C_TCLS_MNT", objText: "Authorization for Characteristics of Org. Area", auth: "00", authStatus: "S", fieldName: "ACTVT", fieldText: "Activity", value: "" }, 
  { clss: "CO", clssText: "Controlling", object: "K_KEKO", objText: "CO-PC: Product Costing", auth: "00", authStatus: "U", fieldName: "ACTVT", fieldText: "Activity", value: "03" },
  { clss: "CO", clssText: "Controlling", object: "K_KEKO", objText: "CO-PC: Product Costing", auth: "00", authStatus: "U", fieldName: "BUKRS", fieldText: "Company Code", value: "$BUKRS" },
];

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

const PIE_COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];

// --- FULL SCREEN PFCG BUILDER COMPONENT ---
function PfcgBuilderScreen({ roleType, onBack }) {
  const [expandedNodes, setExpandedNodes] = useState({});

  const toggleNode = (id) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

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

      if (!tree[row.clss].objects[row.object].auths[authKey].fields[row.fieldName]) {
        tree[row.clss].objects[row.object].auths[authKey].fields[row.fieldName] = { text: row.fieldText, name: row.fieldName, values: new Set() };
      }
      if (row.value) tree[row.clss].objects[row.object].auths[authKey].fields[row.fieldName].values.add(row.value);
    });
    return tree;
  }, []);

  const getNodeStatus = (rows) => {
    if (rows.some(r => r.authStatus === 'U')) return 'Manual';
    if (rows.some(r => r.authStatus === 'G')) return 'Maintained';
    return 'Standard';
  };

  const getNodeLight = (rows) => {
    const hasBlank = rows.some(r => !r.value || r.value.trim() === '');
    return hasBlank ? '🟡' : '🟢';
  };

  return (
    <div style={styles.container}>
      <header style={styles.sleekHeader}>
        <div style={styles.headerTopRow}>
          <button onClick={onBack} style={styles.backLinkBtn}>
            <span style={styles.backArrow}>←</span> Back to Role Workspace
          </button>
        </div>

        <div style={styles.headerTitleRow}>
          <div style={{ textAlign: 'left' }}>
            <div style={styles.eyebrowText}>PFCG Profile Generator</div>
            <h1 style={styles.heroTitle}>Role Architecture <span style={styles.heroAccent}>Review</span></h1>
            <p style={styles.heroSubtitle}>Validating final authorization objects for the <strong>{roleType} Role</strong> based on optimized selections.</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <button style={{...styles.btnPrimaryEmerald, padding: '14px 32px', fontSize: '1.05rem'}}>
               Push to SAP / Generate Profile
            </button>
          </div>
        </div>
      </header>

      <div style={{...styles.contentCanvas, padding: '0', overflow: 'hidden', border: '1px solid #cbd5e1'}}>
        <div style={styles.pfcgCanvas}>
          <div style={{...styles.pfcgRow, backgroundColor: '#e0f2fe'}}>
            <span style={{marginRight: '8px'}}>▼</span>
            <span style={{marginRight: '8px', fontWeight: 'bold'}}>ZROLE_GENERATION_{roleType.toUpperCase()}</span>
          </div>

          {Object.values(hierarchy).map(clss => {
            const isClssOpen = expandedNodes[clss.id];
            return (
              <React.Fragment key={clss.id}>
                <div style={{...styles.pfcgRow, backgroundColor: '#fef3c7', paddingLeft: '24px'}} onClick={() => toggleNode(clss.id)}>
                  <span style={styles.toggleSp}>{isClssOpen ? '▼' : '▶'}</span>
                  <span>{getNodeLight(clss.rows)}</span>
                  <span style={styles.pfcgFolder}>📁</span>
                  <span style={styles.pfcgStatus}>{getNodeStatus(clss.rows)}</span>
                  <span style={styles.pfcgTextMain}>{clss.text}</span>
                  <span style={styles.pfcgIdLabel}>{clss.id}</span>
                </div>

                {isClssOpen && Object.values(clss.objects).map(obj => {
                  const isObjOpen = expandedNodes[`${clss.id}-${obj.id}`];
                  return (
                    <React.Fragment key={obj.id}>
                      <div style={{...styles.pfcgRow, backgroundColor: '#dcfce3', paddingLeft: '48px'}} onClick={() => toggleNode(`${clss.id}-${obj.id}`)}>
                        <span style={styles.toggleSp}>{isObjOpen ? '▼' : '▶'}</span>
                        <span>{getNodeLight(obj.rows)}</span>
                        <span style={styles.pfcgFolder}>📁</span>
                        <span style={styles.pfcgStatus}>{getNodeStatus(obj.rows)}</span>
                        <span style={styles.pfcgTextMain}>{obj.text}</span>
                        <span style={styles.pfcgIdLabel}>{obj.id}</span>
                      </div>

                      {isObjOpen && Object.values(obj.auths).map(auth => {
                        const isAuthOpen = expandedNodes[`${clss.id}-${obj.id}-${auth.authId}`];
                        return (
                          <React.Fragment key={auth.authId}>
                            <div style={{...styles.pfcgRow, backgroundColor: '#fef9c3', paddingLeft: '72px'}} onClick={() => toggleNode(`${clss.id}-${obj.id}-${auth.authId}`)}>
                              <span style={styles.toggleSp}>{isAuthOpen ? '▼' : '▶'}</span>
                              <span>{getNodeLight(auth.rows)}</span>
                              <span style={styles.pfcgDoc}>📄</span>
                              <span style={styles.pfcgStatus}>{getNodeStatus(auth.rows)}</span>
                              <span style={styles.pfcgTextMain}>{auth.text}</span>
                              <span style={styles.pfcgIdLabel}>T-D{Math.floor(Math.random()*10000000)} (Auth: {auth.authId})</span>
                            </div>

                            {isAuthOpen && Object.values(auth.fields).map(field => (
                              <div key={field.name} style={{...styles.pfcgRow, backgroundColor: '#f8fafc', paddingLeft: '96px', borderBottom: '1px dashed #e2e8f0'}}>
                                <span style={{marginRight: '12px'}}></span>
                                <span style={styles.pfcgEdit}>✏️</span>
                                <span style={{...styles.pfcgTextMain, width: '250px'}}>{field.text}</span>
                                <span style={{color: '#0284c7', fontWeight: 'bold', width: '200px'}}>
                                  {field.values.size > 0 ? Array.from(field.values).join(', ') : <span style={{color:'#ef4444'}}>&lt;Empty&gt;</span>}
                                </span>
                                <span style={styles.pfcgIdLabel}>{field.name}</span>
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


// --- NEW AI DEMO MODAL COMPONENT ---
const TeamMatrixAIDemoModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div style={styles.modalBackdrop} onClick={onClose}>
      <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>✨ AI Insights: Team Optimization</h3>
          <button style={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <div style={styles.modalBody}>
          <p style={styles.modalText}>
            Our engine analyzes historical transaction execution logs against current PFCG role assignments to deliver precise, actionable insights for this specific team.
          </p>

          <div style={styles.algorithmCard}>
            <div style={{...styles.algoIcon, backgroundColor: '#3b82f6'}}>🗑️</div>
            <div style={styles.algoDetails}>
              <h4 style={styles.algoTitle}>1. Smart Transaction Pruning</h4>
              <p style={styles.algoDesc}>Identifies transactions with near-zero usage and flags them for removal. This directly cuts architectural "Role Bloat" and strips out unnecessary authorization objects.</p>
            </div>
          </div>

          <div style={styles.algorithmCard}>
            <div style={{...styles.algoIcon, backgroundColor: '#10b981'}}>🔄</div>
            <div style={styles.algoDetails}>
              <h4 style={styles.algoTitle}>2. Intelligent Segregation</h4>
              <p style={styles.algoDesc}>Detects users who only execute "Display" functions despite having "Maintain" roles. Suggests read-only replacements to instantly neutralize SoD conflicts without disrupting workflow.</p>
            </div>
          </div>

          <div style={styles.algorithmCard}>
            <div style={{...styles.algoIcon, backgroundColor: '#f59e0b'}}>💰</div>
            <div style={styles.algoDetails}>
              <h4 style={styles.algoTitle}>3. FUE License Downgrades</h4>
              <p style={styles.algoDesc}>Maps actual execution percentages against SAP licensing tiers. Automatically highlights optimal downgrade candidates (e.g., Professional to Core Use) to capture budget savings.</p>
            </div>
          </div>

          <div style={styles.algorithmCard}>
            <div style={{...styles.algoIcon, backgroundColor: '#ef4444'}}>🛡️</div>
            <div style={styles.algoDetails}>
              <h4 style={styles.algoTitle}>4. Residual Risk Mitigation</h4>
              <p style={styles.algoDesc}>Calculates the exact drop in Segregation of Duties conflicts after applying bloat pruning and segregation steps, providing a clear mathematical path to a clean audit.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default function TeamMatrix({ team, onBack }) {
  // --- STATE MANAGEMENT ---
  const [activeScreen, setActiveScreen] = useState('matrix');
  const [activeTab, setActiveTab] = useState('summary'); 
  const [summaryView, setSummaryView] = useState('plan'); 
  
  const [expandedSections, setExpandedSections] = useState([]);
  const [expandedKpis, setExpandedKpis] = useState([]);
  const [expandedRoleSections, setExpandedRoleSections] = useState([]);
  const [excludedTx, setExcludedTx] = useState(new Set());
  const [pfcgRoleType, setPfcgRoleType] = useState('');
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false); 

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
    const hasRealTxData = allTx.length > 0;
    
    if (!hasRealTxData) {
        allTx = ['SU01D', 'ME23N', 'VA03', 'SE16N', 'PFCG', 'SU01', 'SM59', 'FB01', 'Z_CUSTOM_03', 'Z_CUSTOM_MAINTAIN'];
    }

    const txUsageCount = {};
    if (hasRealTxData) {
      enrichedUsers.forEach(u => {
        const uTx = u.transactions || [];
        const uniqueUserCodes = [...new Set(uTx.map(t => typeof t === 'object' ? t.tcode : t))];
        uniqueUserCodes.forEach(code => {
          txUsageCount[code] = (txUsageCount[code] || 0) + 1;
        });
      });
    }

    const uniqueTxMap = new Map();
    allTx.forEach((tx, idx) => {
      let tcode, desc, type;
    
      if (typeof tx === 'object' && tx.tcode) {
        tcode = tx.tcode; desc = tx.description || 'Description unavailable';
        type = tx.type || 'M';
      } else if (typeof tx === 'string') {
        tcode = tx;
        const fallback = fallbackDictionary[tx];
        if (fallback) {
            desc = fallback.description;
            type = fallback.type;
        } else {
            const isDisplay = tx.endsWith('03') || tx.endsWith('D') || tx.includes('DISPLAY');
            desc = isDisplay ? 'Standard Display Transaction' : 'Standard Maintenance Transaction'; 
            type = isDisplay ? 'D' : 'M';
        }
      }
      
      if (!uniqueTxMap.has(tcode)) {
        let usagePercent = 0;
        if (hasRealTxData && enrichedUsers.length > 0) {
          usagePercent = Math.round(((txUsageCount[tcode] || 0) / enrichedUsers.length) * 100);
        } else {
          usagePercent = Math.max(0, (tcode.length * 15 + idx * 7) % 95);
        }
        uniqueTxMap.set(tcode, { tcode, description: desc, type, usagePercent });
      }
    });

    const uniqueTx = Array.from(uniqueTxMap.values());
    return { 
      displayTcodes: uniqueTx.filter(t => t.type === 'D').sort((a,b) => b.usagePercent - a.usagePercent), 
      maintainTcodes: uniqueTx.filter(t => t.type !== 'D').sort((a,b) => b.usagePercent - a.usagePercent), 
      activeTransactions: uniqueTx
    };
  }, [enrichedUsers]);

  // --- DATA PROCESSING 4: OPTIMIZATION INSIGHTS ---
  const optimizationInsights = useMemo(() => {
    const bloatCandidates = maintainTcodes
      .slice(0, 4)
      .map((tx, index) => ({ ...tx, usage: index < 2 ? 0 : Math.max(2, (tx.tcode.length * index) % 9) }))
      .sort((a, b) => a.usage - b.usage); 
      
    const sodCandidates = maintainTcodes
      .slice(4, 7)
      .map(tx => ({ ...tx, usage: Math.max(5, (tx.tcode.length * 2) % 25), conflicts: tx.tcode.length + 2 }));

    const financialCandidates = maintainTcodes
      .slice(7, 10)
      .map(tx => ({ ...tx, usage: 12 }));

    const standardPairs = [
      { maintain: 'ME21N', display: 'ME23N', desc: 'Purchase Orders' },
      { maintain: 'VA01', display: 'VA03', desc: 'Sales Orders' },
      { maintain: 'FB01', display: 'FB03', desc: 'Financial Documents' },
      { maintain: 'SU01', display: 'SU01D', desc: 'User Maintenance' }
    ];
    
    const segregationPairs = standardPairs.filter(pair => 
      activeTransactions.some(t => t.tcode === pair.maintain)
    );

    return { bloatCandidates, sodCandidates, financialCandidates, segregationPairs };
  }, [maintainTcodes, activeTransactions]);

  // MAP EXCLUDED TRANSACTIONS TO THEIR REASON FOR ROLE GENERATION TAB
  const removalReasonMap = useMemo(() => {
    const map = new Map();
    optimizationInsights.bloatCandidates.forEach(t => map.set(t.tcode, 'Zero-Usage Bloat'));
    optimizationInsights.sodCandidates.forEach(t => map.set(t.tcode, 'SoD Conflict Driver'));
    optimizationInsights.financialCandidates.forEach(t => map.set(t.tcode, 'License Downgrade'));
    return map;
  }, [optimizationInsights]);

  // --- CHART DATA PREPARATION ---
  const chartDataCost = [
    { name: 'Current Run-Rate', value: kpis.currentCost, fill: '#cbd5e1' },
    { name: 'Target Optimized', value: kpis.optimalCost, fill: '#10b981' }
  ];
  const chartDataBloat = [
    { name: 'Active Executions', value: kpis.totalAssignedTx - kpis.totalUnusedTx },
    { name: 'Unused (Bloat)', value: kpis.totalUnusedTx }
  ];
  const chartDataRisk = [
    { phase: 'Baseline', conflicts: kpis.totalConflicts },
    { phase: 'Phase 1: Clean', conflicts: kpis.postBloatConflicts },
    { phase: 'Phase 2: Segregate', conflicts: kpis.finalResidualConflicts }
  ];
  const chartDataArchitecture = [
    { name: 'Current', roles: kpis.avgRoleDensity, fill: '#cbd5e1' },
    { name: 'Target Target', roles: 2, fill: '#6366f1' } 
  ];

  // --- HELPERS ---
  const toggleSection = (id) => setExpandedSections(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleKpi = (id) => setExpandedKpis(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleRoleSection = (id) => setExpandedRoleSections(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  
  const toggleTxInclude = (tcode) => {
    setExcludedTx(prev => {
      const next = new Set(prev);
      if (next.has(tcode)) next.delete(tcode);
      else next.add(tcode);
      return next;
    });
  };

  const handleImproveRole = (candidates) => {
    setExcludedTx(prev => {
      const next = new Set(prev);
      candidates.forEach(c => next.add(c.tcode));
      return next;
    });
  };

  const getRiskTheme = (colorCode) => {
    switch (colorCode) {
      case 'Red': return { bg: '#fee2e2', text: '#dc2626', border: '#f87171', bar: 'linear-gradient(90deg, #fca5a5 0%, #ef4444 100%)' };
      case 'Yellow': return { bg: '#fef3c7', text: '#d97706', border: '#fbbf24', bar: 'linear-gradient(90deg, #fde047 0%, #f59e0b 100%)' };
      case 'Blue': return { bg: '#e0f2fe', text: '#0284c7', border: '#38bdf8', bar: 'linear-gradient(90deg, #7dd3fc 0%, #0ea5e9 100%)' };
      case 'Green': return { bg: '#d1fae5', text: '#059669', border: '#34d399', bar: 'linear-gradient(90deg, #6ee7b7 0%, #10b981 100%)' };
      default: return { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1', bar: '#94a3b8' };
    }
  };

  const handleBuildRoleClick = (type) => {
    setPfcgRoleType(type);
    setActiveScreen('pfcg'); 
  };

  // --- RENDER CONDITIONAL VIEWS ---
  if (activeScreen === 'pfcg') {
    return <PfcgBuilderScreen roleType={pfcgRoleType} onBack={() => setActiveScreen('matrix')} />;
  }

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
            
            <button 
              style={styles.demoButton} 
              onClick={() => setIsDemoModalOpen(true)}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
               ✨ View AI Optimization Logic
            </button>
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

                        {/* FINANCIAL PROPOSED REMOVALS */}
                        <div style={styles.proposedRemovalsBox}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <h4 style={styles.proposedTitle}>Actionable Insight: Proposed Transaction Removals</h4>
                            <button onClick={() => handleImproveRole(optimizationInsights.financialCandidates)} style={styles.btnImproveRole}>
                              ✨ Improve Role (Remove Selected)
                            </button>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {optimizationInsights.financialCandidates.map(tx => {
                              const isIncluded = !excludedTx.has(tx.tcode);
                              return (
                                <label key={tx.tcode} style={{...styles.proposedLabel, opacity: isIncluded ? 1 : 0.5}}>
                                  <input type="checkbox" checked={isIncluded} onChange={() => toggleTxInclude(tx.tcode)} style={styles.checkbox}/>
                                  <span style={styles.txCodeBadge}>{tx.tcode}</span>
                                  <span style={styles.txDescText}>{tx.description}</span>
                                  {!isIncluded && <span style={styles.removedTag}>Removed</span>}
                                </label>
                              );
                            })}
                          </div>
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

                        {/* SECURITY PROPOSED REMOVALS */}
                        <div style={styles.proposedRemovalsBox}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <h4 style={styles.proposedTitle}>Actionable Insight: Remove Conflict Drivers</h4>
                            <button onClick={() => handleImproveRole(optimizationInsights.sodCandidates)} style={styles.btnImproveRole}>
                              ✨ Improve Role (Remove Selected)
                            </button>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {optimizationInsights.sodCandidates.map(tx => {
                              const isIncluded = !excludedTx.has(tx.tcode);
                              return (
                                <label key={tx.tcode} style={{...styles.proposedLabel, opacity: isIncluded ? 1 : 0.5}}>
                                  <input type="checkbox" checked={isIncluded} onChange={() => toggleTxInclude(tx.tcode)} style={styles.checkbox}/>
                                  <span style={styles.txCodeBadge}>{tx.tcode}</span>
                                  <span style={styles.txDescText}>{tx.description} (SoD Risk)</span>
                                  {!isIncluded && <span style={styles.removedTag}>Removed</span>}
                                </label>
                              );
                            })}
                          </div>
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

                        {/* ARCHITECTURE PROPOSED REMOVALS */}
                        <div style={styles.proposedRemovalsBox}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <h4 style={styles.proposedTitle}>Actionable Insight: Remove Zero-Usage Bloat</h4>
                            <button onClick={() => handleImproveRole(optimizationInsights.bloatCandidates)} style={styles.btnImproveRole}>
                              ✨ Improve Role (Remove Selected)
                            </button>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {optimizationInsights.bloatCandidates.map(tx => {
                              const isIncluded = !excludedTx.has(tx.tcode);
                              return (
                                <label key={tx.tcode} style={{...styles.proposedLabel, opacity: isIncluded ? 1 : 0.5}}>
                                  <input type="checkbox" checked={isIncluded} onChange={() => toggleTxInclude(tx.tcode)} style={styles.checkbox}/>
                                  <span style={styles.txCodeBadge}>{tx.tcode}</span>
                                  <span style={styles.txDescText}>{tx.description} ({tx.usage}% Usage)</span>
                                  {!isIncluded && <span style={styles.removedTag}>Removed</span>}
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            ) : (
              /* VIEW MODE: GRID WITH RECHARTS (6 KPIs) */
              <div style={styles.flowingGrid}>
                {/* KPI 1: Cost */}
                <div style={styles.flowingAccordionItem}>
                  <div style={styles.flowingAccordionHeader} onClick={() => toggleKpi(1)}>
                    <div style={styles.kpiTitleGroup}><span style={{fontSize: '1.4rem'}}>💰</span><div style={styles.kpiTitleCol}><h3 style={styles.kpiTitle}>License Cost</h3></div></div>
                    <div style={styles.kpiMainValueGroup}><div style={styles.kpiAccordionValue}>${kpis.projectedSavings.toLocaleString()} <span style={styles.kpiSubValue}>Saved</span></div><div style={{...styles.chevron, transform: expandedKpis.includes(1) ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</div></div>
                  </div>
                  {expandedKpis.includes(1) && (
                    <div style={styles.flowingAccordionContent}>
                      <div style={styles.chartWrapper}>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={chartDataCost} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={120} tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} />
                            <RechartsTooltip cursor={{fill: 'transparent'}} formatter={(val) => `$${val.toLocaleString()}`} />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={25}>
                              {chartDataCost.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>

                {/* KPI 2: Bloat */}
                <div style={styles.flowingAccordionItem}>
                  <div style={styles.flowingAccordionHeader} onClick={() => toggleKpi(2)}>
                    <div style={styles.kpiTitleGroup}><span style={{fontSize: '1.4rem'}}>🗑️</span><div style={styles.kpiTitleCol}><h3 style={styles.kpiTitle}>Role Bloat</h3></div></div>
                    <div style={styles.kpiMainValueGroup}><div style={styles.kpiAccordionValue}>{kpis.avgBloat}% <span style={styles.kpiSubValue}>Unused</span></div><div style={{...styles.chevron, transform: expandedKpis.includes(2) ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</div></div>
                  </div>
                  {expandedKpis.includes(2) && (
                    <div style={styles.flowingAccordionContent}>
                      <div style={styles.chartWrapper}>
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie data={chartDataBloat} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                              {chartDataBloat.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip formatter={(val) => `${val.toLocaleString()} Transactions`} />
                            <Legend verticalAlign="bottom" height={36}/>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>

                {/* KPI 3: SoD Risk */}
                <div style={styles.flowingAccordionItem}>
                  <div style={styles.flowingAccordionHeader} onClick={() => toggleKpi(3)}>
                    <div style={styles.kpiTitleGroup}><span style={{fontSize: '1.4rem'}}>🛡️</span><div style={styles.kpiTitleCol}><h3 style={styles.kpiTitle}>SoD Risk</h3></div></div>
                    <div style={styles.kpiMainValueGroup}><div style={styles.kpiAccordionValue}>{kpis.finalResidualConflicts} <span style={styles.kpiSubValue}>Target</span></div><div style={{...styles.chevron, transform: expandedKpis.includes(3) ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</div></div>
                  </div>
                  {expandedKpis.includes(3) && (
                    <div style={styles.flowingAccordionContent}>
                      <div style={styles.chartWrapper}>
                        <ResponsiveContainer width="100%" height={200}>
                          <AreaChart data={chartDataRisk} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorConflicts" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="phase" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis hide />
                            <RechartsTooltip />
                            <Area type="monotone" dataKey="conflicts" stroke="#ef4444" fillOpacity={1} fill="url(#colorConflicts)" />
                          </AreaChart>
                        </ResponsiveContainer>
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
                       <div style={styles.chartWrapper}>
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie data={[{name: 'Unique Configs', value: kpis.totalAssignedTx - kpis.estimatedDuplicates}, {name: 'Redundant Auth Objects', value: kpis.estimatedDuplicates}]} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                <Cell fill="#3b82f6" />
                                <Cell fill="#9333ea" />
                            </Pie>
                            <RechartsTooltip />
                            <Legend verticalAlign="bottom" height={36}/>
                          </PieChart>
                        </ResponsiveContainer>
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
                      <div style={styles.chartWrapper}>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={chartDataArchitecture} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                            <RechartsTooltip cursor={{fill: 'transparent'}} />
                            <Bar dataKey="roles" radius={[4, 4, 0, 0]} barSize={40}>
                              {chartDataArchitecture.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
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
                      <div style={styles.chartWrapper}>
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie data={[{name: 'Mitigated Controls', value: kpis.mitigatedConflicts}, {name: 'Exposed Flaws', value: kpis.totalConflicts - kpis.mitigatedConflicts}]} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                <Cell fill="#d97706" />
                                <Cell fill="#fca5a5" />
                            </Pie>
                            <RechartsTooltip />
                            <Legend verticalAlign="bottom" height={36}/>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
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
        {/* TAB 3: ROLE GENERATION (COLLAPSIBLE LAYOUT)               */}
        {/* ========================================================= */}
        {activeTab === 'roles' && (
          <div style={styles.tabContentFadeIn}>
             <div style={{marginBottom: '20px'}}>
                <h2 style={styles.sectionTitle}>Transaction Segregation & Pruning</h2>
                <p style={styles.sectionSubtitle}>Deselect specific transactions to remove them from the generated role architecture.</p>
             </div>
             
             <div style={styles.accordionContainer}>
                
                {/* DISPLAY ROLE BUILDER */}
                <div style={{...styles.accordionItem, borderColor: expandedRoleSections.includes('display') ? '#bae6fd' : '#e2e8f0'}}>
                  <div style={{...styles.accordionHeader, backgroundColor: expandedRoleSections.includes('display') ? '#f0f9ff' : '#ffffff'}} onClick={() => toggleRoleSection('display')}>
                    <div style={styles.accordionTitleWrap}>
                      <span style={styles.iconSp}>👁️</span>
                      <div>
                        <h3 style={{...styles.accordionTitle, color: '#0284c7'}}>Display Access Definition</h3>
                        <span style={styles.cardSub}>Clean Core / Low Risk read-only execution.</span>
                      </div>
                    </div>
                    <div style={styles.flexCenter}>
                      <span style={styles.countBadgeLight}>{displayTcodes.length} Potential T-Codes</span>
                      <div style={{...styles.chevron, marginLeft: '16px', transform: expandedRoleSections.includes('display') ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</div>
                    </div>
                  </div>
                  
                  {expandedRoleSections.includes('display') && (
                    <div style={{...styles.accordionContent, padding: 0}}>
                      <table style={styles.roleTable}>
                        <thead>
                          <tr>
                            <th style={{...styles.th, width: '80px', textAlign: 'center'}}>Include</th>
                            <th style={styles.th}>Transaction</th>
                            <th style={styles.th}>Execution Range (Usage)</th>
                            <th style={{...styles.th, width: '150px'}}>Removal Reason</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayTcodes.map(tx => {
                            const isIncluded = !excludedTx.has(tx.tcode);
                            return (
                              <tr key={tx.tcode} style={{...styles.tr, backgroundColor: isIncluded ? '#ffffff' : '#f8fafc', transition: 'all 0.2s ease'}}>
                                <td style={{...styles.td, textAlign: 'center'}}>
                                  <input type="checkbox" checked={isIncluded} onChange={() => toggleTxInclude(tx.tcode)} style={styles.checkbox} />
                                </td>
                                <td style={{...styles.td, opacity: isIncluded ? 1 : 0.5}}>
                                  <div style={styles.primaryText}>{tx.tcode}</div>
                                  <div style={styles.secondaryText}>{tx.description}</div>
                                </td>
                                <td style={{...styles.td, opacity: isIncluded ? 1 : 0.5}}>
                                  <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                    <div style={{...styles.usageBarBg, width: '100px'}}><div style={{...styles.usageBarFill, width: `${tx.usagePercent}%`, background: '#38bdf8'}}></div></div>
                                    <span style={{fontSize: '0.85rem', fontWeight: '700', color: tx.usagePercent === 0 ? '#94a3b8' : '#0f172a'}}>{tx.usagePercent}%</span>
                                  </div>
                                </td>
                                <td style={{...styles.td, fontStyle: 'italic', fontSize: '0.85rem', color: '#dc2626'}}>
                                  {!isIncluded ? (removalReasonMap.get(tx.tcode) || 'Manual Removal') : '--'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* MAINTAIN ROLE BUILDER */}
                <div style={{...styles.accordionItem, borderColor: expandedRoleSections.includes('maintain') ? '#fecaca' : '#e2e8f0'}}>
                  <div style={{...styles.accordionHeader, backgroundColor: expandedRoleSections.includes('maintain') ? '#fef2f2' : '#ffffff'}} onClick={() => toggleRoleSection('maintain')}>
                    <div style={styles.accordionTitleWrap}>
                      <span style={styles.iconSp}>✍️</span>
                      <div>
                        <h3 style={{...styles.accordionTitle, color: '#dc2626'}}>Maintain Access Definition</h3>
                        <span style={styles.cardSub}>Create/Update capabilities carrying High Risk of SoD conflicts.</span>
                      </div>
                    </div>
                    <div style={styles.flexCenter}>
                      <span style={styles.countBadgeLightRed}>{maintainTcodes.length} Potential T-Codes</span>
                      <div style={{...styles.chevron, marginLeft: '16px', transform: expandedRoleSections.includes('maintain') ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</div>
                    </div>
                  </div>
                  
                  {expandedRoleSections.includes('maintain') && (
                    <div style={{...styles.accordionContent, padding: 0}}>
                      <table style={styles.roleTable}>
                        <thead>
                          <tr>
                            <th style={{...styles.th, width: '80px', textAlign: 'center'}}>Include</th>
                            <th style={styles.th}>Transaction</th>
                            <th style={styles.th}>Execution Range (Usage)</th>
                            <th style={{...styles.th, width: '150px'}}>Removal Reason</th>
                          </tr>
                        </thead>
                        <tbody>
                          {maintainTcodes.map(tx => {
                            const isIncluded = !excludedTx.has(tx.tcode);
                            return (
                              <tr key={tx.tcode} style={{...styles.tr, backgroundColor: isIncluded ? '#ffffff' : '#f8fafc', transition: 'all 0.2s ease'}}>
                                <td style={{...styles.td, textAlign: 'center'}}>
                                  <input type="checkbox" checked={isIncluded} onChange={() => toggleTxInclude(tx.tcode)} style={styles.checkbox} />
                                </td>
                                <td style={{...styles.td, opacity: isIncluded ? 1 : 0.5}}>
                                  <div style={styles.primaryText}>{tx.tcode}</div>
                                  <div style={styles.secondaryText}>{tx.description}</div>
                                </td>
                                <td style={{...styles.td, opacity: isIncluded ? 1 : 0.5}}>
                                  <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                    <div style={{...styles.usageBarBg, width: '100px'}}><div style={{...styles.usageBarFill, width: `${tx.usagePercent}%`, background: tx.usagePercent === 0 ? '#cbd5e1' : '#f87171'}}></div></div>
                                    <span style={{fontSize: '0.85rem', fontWeight: '700', color: tx.usagePercent === 0 ? '#94a3b8' : '#0f172a'}}>{tx.usagePercent}%</span>
                                  </div>
                                </td>
                                <td style={{...styles.td, fontStyle: 'italic', fontSize: '0.85rem', color: '#dc2626'}}>
                                  {!isIncluded ? (removalReasonMap.get(tx.tcode) || 'Manual Removal') : '--'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

             </div>

             {/* ACTION BUTTONS */}
             <div style={styles.roleActionFooter}>
                <div style={styles.footerInner}>
                  <div style={{color: '#64748b', fontSize: '0.95rem', fontWeight: '600'}}>
                      Optimization selections active. {excludedTx.size} transactions excluded.
                  </div>
                  <div style={styles.footerActionGroup}>
                    <button onClick={() => handleBuildRoleClick('Display')} style={styles.btnSecondaryBlue}>Build Display Role</button>
                    <button onClick={() => handleBuildRoleClick('Maintain')} style={styles.btnSecondaryRed}>Build Maintain Role</button>
                    <div style={styles.vertDivider}></div>
                    <button style={styles.btnPrimaryEmerald}>Generate Enforced Architecture</button>
                  </div>
                </div>
             </div>

          </div>
        )}
      </div>

      <TeamMatrixAIDemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
    </div>
  );
}

// --- MASTER STYLES ---
const styles = {
  container: { padding: '40px 60px 60px 60px', backgroundColor: '#f0fdf4', minHeight: '100vh', fontFamily: '"Inter", -apple-system, sans-serif', position: 'relative' },
  flexCenter: { display: 'flex', alignItems: 'center' },
  
  sleekHeader: { display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' },
  headerTopRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  backLinkBtn: { background: 'none', border: 'none', color: '#047857', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s ease', padding: 0, marginBottom: '15px' },
  backArrow: { fontSize: '1.2rem', lineHeight: '1' },
  headerTitleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', textAlign: 'left' },
  eyebrowText: { color: '#047857', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' },
  heroTitle: { color: '#064e3b', margin: '0 0 6px 0', fontSize: '2.4rem', fontWeight: '500', letterSpacing: '-1px' },
  heroAccent: { color: '#10b981', fontWeight: '700' }, 
  heroSubtitle: { margin: 0, fontSize: '1.05rem', color: '#065f46', fontWeight: '400', marginBottom: '16px' },

  // TABS
  tabContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '10px', borderBottom: '2px solid #d1fae5', paddingBottom: '0' },
  tabGroup: { display: 'flex', gap: '2px' },
  tabBtn: { padding: '14px 24px', border: 'none', background: 'transparent', color: '#047857', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s ease', opacity: 0.6, borderBottom: '3px solid transparent', marginBottom: '-2px' },
  tabBtnActive: { color: '#064e3b', opacity: 1, borderBottom: '3px solid #10b981' },
  
  // SUB-TABS 
  toggleGroup: { display: 'flex', backgroundColor: '#e2e8f0', padding: '4px', borderRadius: '8px', marginBottom: '10px' },
  toggleBtn: { border: 'none', background: 'transparent', padding: '6px 14px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#64748b', cursor: 'pointer', transition: 'all 0.2s' },
  toggleBtnActive: { background: '#ffffff', color: '#0f172a', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },

  // CANVAS
  contentCanvas: { backgroundColor: '#ffffff', borderRadius: '0 0 16px 16px', border: '1px solid #e2e8f0', borderTop: 'none', boxShadow: '0 10px 40px -10px rgba(5, 150, 105, 0.08)', padding: '30px 50px 50px 50px', textAlign: 'left', minHeight: '500px' },
  tabContentFadeIn: { animation: 'fadeIn 0.3s ease-in-out' },
  sectionTitle: { margin: '0 0 4px 0', fontSize: '1.4rem', color: '#064e3b', fontWeight: '700', letterSpacing: '-0.5px' },
  sectionSubtitle: { fontSize: '0.95rem', color: '#64748b', margin: 0 },

  // ACCORDIONS
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

  // --- NEW PROPOSED REMOVALS UI ---
  proposedRemovalsBox: { backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginTop: '20px' },
  proposedTitle: { margin: 0, fontSize: '0.95rem', color: '#0f172a', fontWeight: '700' },
  btnImproveRole: { backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' },
  proposedLabel: { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' },
  txCodeBadge: { fontFamily: 'monospace', fontWeight: '700', backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontSize: '0.85rem' },
  txDescText: { fontSize: '0.9rem', color: '#475569', flex: 1 },
  removedTag: { fontSize: '0.75rem', fontWeight: '700', color: '#ef4444', backgroundColor: '#fee2e2', padding: '2px 8px', borderRadius: '100px' },

  // INSIGHTS STYLES
  insightSection: { marginBottom: '24px' },
  insightTitle: { fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', margin: '0 0 6px 0' },
  insightDesc: { fontSize: '0.85rem', color: '#475569', margin: '0 0 12px 0', lineHeight: '1.5' },
  pillWrap: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  txPillBase: { display: 'flex', alignItems: 'center', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', border: '1px solid', gap: '8px' },
  pillValue: { fontSize: '0.75rem', padding: '2px 8px', borderRadius: '100px', fontWeight: '600', border: '1px solid transparent' },
  txBloat: { background: '#f8fafc', borderColor: '#cbd5e1', color: '#334155' },
  txSod: { background: '#fef2f2', borderColor: '#fecaca', color: '#b91c1c' },
  txSeg: { background: '#f0fdf4', borderColor: '#bbf7d0', color: '#15803d' },

  // GRID WITH RECHARTS
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
  chartWrapper: { paddingTop: '20px', borderTop: '1px dashed #e2e8f0', minHeight: '220px' },

  // TABLES
  tableWrapper: { borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', maxHeight: '500px', overflowY: 'auto' },
  roleTable: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' },
  th: { padding: '16px 20px', backgroundColor: '#f8fafc', color: '#0f172a', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 1 },
  tr: { borderBottom: '1px solid #f1f5f9', backgroundColor: '#ffffff' },
  td: { padding: '16px 20px', verticalAlign: 'middle', color: '#334155' },
  checkbox: { width: '18px', height: '18px', cursor: 'pointer', accentColor: '#10b981' },
  primaryText: { fontSize: '1rem', fontWeight: '600', color: '#0f172a', marginBottom: '4px' },
  secondaryText: { fontSize: '0.85rem', color: '#64748b', fontWeight: '500' },
  usageBarBg: { height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' },
  usageBarFill: { height: '100%', borderRadius: '4px' },
  pillBadge: { padding: '4px 12px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' },
  reductionBadge: { backgroundColor: '#d1fae5', color: '#047857', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', border: '1px solid #a7f3d0' },

  // ROLE CARDS & FOOTER
  cardSub: { margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: '500' },
  countBadgeLight: { backgroundColor: '#e0f2fe', color: '#0284c7', padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '700' },
  countBadgeLightRed: { backgroundColor: '#fee2e2', color: '#dc2626', padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '700' },
  
  roleActionFooter: { marginTop: '40px', paddingTop: '30px', borderTop: '1px solid #e2e8f0' },
  footerInner: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  footerActionGroup: { display: 'flex', alignItems: 'center', gap: '16px' },
  vertDivider: { width: '1px', height: '24px', backgroundColor: '#e2e8f0', margin: '0 8px' },
  
  btnSecondaryBlue: { background: '#f0f9ff', border: '1px solid #bae6fd', color: '#0284c7', padding: '12px 24px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' },
  btnSecondaryRed: { background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 24px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' },
  btnPrimaryEmerald: { background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', border: 'none', color: '#ffffff', padding: '12px 32px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)', transition: 'transform 0.1s ease' },

  // --- PFCG SCREEN STYLES ---
  pfcgCanvas: { flex: 1, overflowY: 'auto', padding: '24px 32px', backgroundColor: '#f8fafc', fontFamily: '"Consolas", "Courier New", monospace', fontSize: '0.95rem', height: '100%', minHeight: '600px' },
  pfcgRow: { display: 'flex', alignItems: 'center', padding: '10px 12px', borderBottom: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'background-color 0.1s' },
  toggleSp: { display: 'inline-block', width: '20px', fontSize: '0.7rem', color: '#64748b' },
  pfcgFolder: { margin: '0 12px 0 8px', fontSize: '1.2rem' },
  pfcgDoc: { margin: '0 12px 0 8px', fontSize: '1.2rem' },
  pfcgEdit: { margin: '0 12px 0 8px', fontSize: '1.1rem' },
  pfcgStatus: { width: '120px', color: '#475569', fontWeight: 'bold' },
  pfcgTextMain: { flex: 1, color: '#0f172a' },
  pfcgIdLabel: { color: '#64748b', textAlign: 'right' },

  // --- NEW DEMO MODAL STYLES ---
  modalBackdrop: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  modalContent: { backgroundColor: '#ffffff', borderRadius: '20px', width: '550px', maxWidth: '90%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', animation: 'slideUp 0.3s ease-out forwards' },
  modalHeader: { backgroundColor: '#f8fafc', padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { margin: 0, color: '#0f172a', fontSize: '1.25rem', fontWeight: '700' },
  closeButton: { background: 'none', border: 'none', fontSize: '1.5rem', color: '#64748b', cursor: 'pointer', padding: 0, lineHeight: 1 },
  modalBody: { padding: '24px' },
  modalText: { color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px', marginTop: 0 },
  algorithmCard: { display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', marginBottom: '12px', border: '1px solid #f1f5f9' },
  algoIcon: { width: '32px', height: '32px', borderRadius: '8px', color: '#ffffff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '1.2rem', flexShrink: 0 },
  algoDetails: { display: 'flex', flexDirection: 'column', gap: '4px' },
  algoTitle: { margin: 0, fontSize: '0.95rem', fontWeight: '700', color: '#0f172a' },
  algoDesc: { margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5' },
  demoButton: { marginTop: '16px', padding: '10px 20px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#047857', border: '1px solid rgba(52, 211, 153, 0.4)', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', width: 'fit-content', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }
};