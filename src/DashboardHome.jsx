import React, { useState, useMemo } from 'react';
import { Treemap, ResponsiveContainer } from 'recharts';
import treemapData from './Optimized_Role_Treemap.json';
import userDetails from './User_Details.json';

const CustomTooltip = ({ active, payload, scaleMetric, colorMetric }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const getMetricLabel = (m) => m === 'userCount' ? 'Total Team Size' : m === 'sodCount' ? 'Total Security Risks' : m === 'highRiskCount' ? 'Severe Security Risks' : 'Unused Access (Clutter)';
    const formatMetric = (m, val) => m === 'userCount' ? `${val} ${val === 1 ? 'User' : 'Users'}` : m === 'sodCount' ? `${val} Risks` : m === 'highRiskCount' ? `${val} Severe Risks` : `${val}% Clutter`;
    const scaleValue = data['_' + scaleMetric] || data[scaleMetric] || 0;
    const colorValue = data['_' + colorMetric] || data[colorMetric] || 0;
    const isSameMetric = scaleMetric === colorMetric;

    return (
      <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)', padding: '14px 18px', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(4, 120, 87, 0.15)', border: '1px solid #d1fae5', fontFamily: '"Inter", -apple-system, sans-serif', zIndex: 1000, pointerEvents: 'none' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#047857', fontWeight: '700', borderBottom: '1px solid #ecfdf5', paddingBottom: '8px' }}>{data.name}</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '13px', color: '#475569' }}><strong style={{ color: '#0f172a' }}>{isSameMetric ? 'Value:' : getMetricLabel(scaleMetric) + ':'}</strong> {formatMetric(scaleMetric, scaleValue)}</div>
          {!isSameMetric && <div style={{ fontSize: '13px', color: '#475569' }}><strong style={{ color: '#0f172a' }}>{getMetricLabel(colorMetric)}:</strong> {formatMetric(colorMetric, colorValue)}</div>}
        </div>
      </div>
    );
  }
  return null;
};

const CustomizedTreemapContent = (props) => {
  const { x, y, width, height, name, depth, users, colorMetric, maxValue, selectedTeams = [], uniqueId, onBlockClick } = props;
  
  if (depth < 2 || !users) return null; 

  const isSelected = selectedTeams.some(t => t.uniqueId === uniqueId);
  const colorValue = props['_' + colorMetric] || 0;

  let fillColor = '#10b981'; // Default Emerald
  if (colorValue > 0 && maxValue > 0) {
    const ratio = colorValue / maxValue;
    if (ratio >= 0.70) fillColor = '#ef4444'; // Rose/Red for high risk
    else if (ratio >= 0.40) fillColor = '#f59e0b'; // Amber for med risk
    else if (ratio >= 0.15) fillColor = '#34d399'; // Lighter green for low risk
  }

  const pad = 4; const innerX = x + pad; const innerY = y + pad;
  const innerWidth = Math.max(0, width - pad * 2); const innerHeight = Math.max(0, height - pad * 2);

  let showName = false; let fontSizeName = 14; let displayName = name;
  if (innerWidth > 100 && innerHeight > 45) { showName = true; displayName = name.length > 20 ? name.substring(0, 17) + '...' : name; } 
  else if (innerWidth > 60 && innerHeight > 30) { showName = true; fontSizeName = 11; displayName = name.length > 14 ? name.substring(0, 12) + '..' : name; } 
  else if (innerWidth > 35 && innerHeight > 20) { showName = true; fontSizeName = 8.5; displayName = name.length > 8 ? name.substring(0, 6) + '..' : name; }

  return (
    <g onClick={() => onBlockClick(props)} style={{ cursor: 'pointer' }}>
      <rect 
        x={innerX} y={innerY} width={innerWidth} height={innerHeight} 
        fill={fillColor} rx={8} ry={8} 
        stroke={isSelected ? "#064e3b" : "rgba(255,255,255,0.6)"} 
        strokeWidth={isSelected ? 3 : 1.5} 
        style={{ transition: 'all 0.2s ease', filter: isSelected ? 'drop-shadow(0px 6px 12px rgba(4,120,87,0.3))' : 'drop-shadow(0px 1px 2px rgba(0,0,0,0.05))' }} 
      />
      {showName && (
        <text 
          x={innerX + innerWidth / 2} y={innerY + innerHeight / 2} 
          textAnchor="middle" fill="#ffffff" fontSize={fontSizeName} fontWeight="600" 
          fontFamily='"Inter", -apple-system, sans-serif' dominantBaseline="central" 
          style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.2)', pointerEvents: 'none' }}
        >
          {displayName}
        </text>
      )}
      {isSelected && innerWidth > 30 && innerHeight > 30 && (
         <circle cx={innerX + 16} cy={innerY + 16} r={10} fill="#ffffff" style={{pointerEvents: 'none'}} />
      )}
      {isSelected && innerWidth > 30 && innerHeight > 30 && (
         <text x={innerX + 16} y={innerY + 16} textAnchor="middle" dominantBaseline="central" fill="#047857" fontSize="12" fontWeight="800" style={{pointerEvents: 'none'}}>✓</text>
      )}
    </g>
  );
};

const AIDemoModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div style={styles.modalBackdrop} onClick={onClose}>
      <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}><h3 style={styles.modalTitle}>✨ How This Map Works</h3><button style={styles.closeButton} onClick={onClose}>×</button></div>
        <div style={styles.modalBody}>
          <p style={styles.modalText}>This map automatically organizes your workforce by looking at what tasks they actually perform, not just their job titles. This helps spot hidden risks and wasted licenses.</p>
          <div style={styles.algorithmCard}>
            <div style={{...styles.algoIcon, backgroundColor: '#10b981'}}>⊞</div>
            <div style={styles.algoDetails}>
              <h4 style={styles.algoTitle}>1. Grouping the Teams</h4>
              <p style={styles.algoDesc}>The system clusters users together based on shared access. The size of the blocks can change based on how many people are in them, or how many security risks they carry.</p>
            </div>
          </div>
          <div style={styles.algorithmCard}>
            <div style={{...styles.algoIcon, backgroundColor: '#ef4444'}}>◑</div>
            <div style={styles.algoDetails}>
              <h4 style={styles.algoTitle}>2. Highlighting Trouble Spots</h4>
              <p style={styles.algoDesc}>By comparing what users are allowed to do versus what they actually do, the system calculates "Clutter." Red blocks mean a team has severe security risks or lots of unused access.</p>
            </div>
          </div>
          <div style={styles.algorithmCard}>
            <div style={{...styles.algoIcon, backgroundColor: '#047857'}}>📈</div>
            <div style={styles.algoDetails}>
              <h4 style={styles.algoTitle}>3. Finding Cost Savings</h4>
              <p style={styles.algoDesc}>This mapping instantly highlights where you are paying for expensive licenses that people aren't using, making it easy to downgrade them and save money.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DashboardHome({ onProceed, onSelectTeam }) {
  const [scaleMetric, setScaleMetric] = useState('userCount');
  const [colorMetric, setColorMetric] = useState('userCount');
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  
  const { enrichedTreemapData, maxValues } = useMemo(() => {
    let globalMaxUsers = 0; let globalMaxSod = 0; let globalMaxHighRisk = 0; let globalMaxBloat = 0;
    const processedData = treemapData.map(region => {
      const newRegion = { ...region, children: [] };
      (region.children || []).forEach(dept => {
        const newDept = { ...dept, children: [] };
        (dept.children || []).forEach(pos => {
          let exactUsers = pos.users ? pos.users.length : 0;
          let exactSodConflicts = 0; let exactHighRiskConflicts = 0; let blockTotalAssigned = 0; let blockTotalExecuted = 0;
          if (pos.users) {
            pos.users.forEach((u, index) => {
              const ud = userDetails.find(d => d.userId === u.userId) || {};
              const fallbackUsage = 12 + (index * 17) % 70; const fallbackAssigned = 150 + (index * 23) % 150;
              const fallbackExecuted = Math.floor((fallbackUsage / 100) * fallbackAssigned);
              const conflicts = ud.conflictCount !== undefined ? ud.conflictCount : (u.conflictCount || 0);
              const statusColor = ud.statusColor || u.status || 'Green';
              const criticality = ud.criticality || (statusColor === 'Red' ? 'High Risk' : statusColor === 'Yellow' ? 'Medium Risk' : 'Clean');
              exactSodConflicts += conflicts;
              if (statusColor === 'Red' || criticality === 'High Risk' || criticality === 'Critical') exactHighRiskConflicts += conflicts;
              blockTotalAssigned += ud.totalTxAssigned !== undefined ? ud.totalTxAssigned : fallbackAssigned;
              blockTotalExecuted += ud.totalTxExecuted !== undefined ? ud.totalTxExecuted : fallbackExecuted;
            });
          }
          let exactBloatScore = 0; if (blockTotalAssigned > 0) exactBloatScore = Math.round((1 - (blockTotalExecuted / blockTotalAssigned)) * 100);
          if (exactUsers > globalMaxUsers) globalMaxUsers = exactUsers; if (exactSodConflicts > globalMaxSod) globalMaxSod = exactSodConflicts;
          if (exactHighRiskConflicts > globalMaxHighRisk) globalMaxHighRisk = exactHighRiskConflicts; if (exactBloatScore > globalMaxBloat) globalMaxBloat = exactBloatScore;
          newDept.children.push({ 
            ...pos, 
            uniqueId: `${region.name}-${dept.name}-${pos.name}`,
            userCount: exactUsers || 1, sodCount: exactSodConflicts || 1, highRiskCount: exactHighRiskConflicts || 1, bloatScore: exactBloatScore || 1, 
            _userCount: exactUsers, _sodCount: exactSodConflicts, _highRiskCount: exactHighRiskConflicts, _bloatScore: exactBloatScore 
          });
        });
        newRegion.children.push(newDept);
      });
      return newRegion;
    });
    return { enrichedTreemapData: processedData, maxValues: { userCount: globalMaxUsers, sodCount: globalMaxSod, highRiskCount: globalMaxHighRisk, bloatScore: globalMaxBloat } };
  }, []);

  const getRegionSize = (region) => (region.children || []).reduce((acc, dept) => acc + (dept.children || []).reduce((a, pos) => a + pos[scaleMetric], 0), 0);

  const toggleTeamSelection = (teamNode) => {
    setSelectedTeams(prev => {
      const exists = prev.some(t => t.uniqueId === teamNode.uniqueId);
      if (exists) return prev.filter(t => t.uniqueId !== teamNode.uniqueId);
      return [...prev, teamNode];
    });
  };

  const handleProceedClick = () => {
    if (onProceed) onProceed(selectedTeams);
    else if (onSelectTeam) onSelectTeam(selectedTeams);
  };

  return (
    <div style={styles.container}>
      <div style={styles.heroHeaderCard}>
        <div style={styles.brandBox}>
          <div style={styles.eyebrowBadge}>Global Operations View</div>
          <h1 style={styles.heroTitle}>Role Management <span style={styles.heroAccent}>Dashboard</span></h1>
          <p style={styles.heroSubtitle}>Click on organizational units to select them, then proceed to optimize their access.</p>
          <button style={styles.demoButton} onClick={() => setIsDemoModalOpen(true)}>✨ How this map works</button>
        </div>
      </div>

      <div style={styles.controlsContainer}>
        <div style={{ display: 'flex', gap: '32px', margin: '0 auto' }}>
          <div style={styles.metricSelectorBox}>
            <span style={styles.metricLabel}>Scale By:</span>
            <select style={styles.metricSelect} value={scaleMetric} onChange={(e) => setScaleMetric(e.target.value)}>
              <option value="userCount">Total Team Size</option>
              <option value="sodCount">Total Security Risks</option>
              <option value="highRiskCount">Severe Security Risks</option>
              <option value="bloatScore">Unused Access (Clutter)</option>
            </select>
          </div>
          <div style={styles.vertDividerMini}></div>
          <div style={styles.metricSelectorBox}>
            <span style={styles.metricLabel}>Color By:</span>
            <select style={styles.metricSelect} value={colorMetric} onChange={(e) => setColorMetric(e.target.value)}>
              <option value="userCount">Total Team Size</option>
              <option value="sodCount">Total Security Risks</option>
              <option value="highRiskCount">Severe Security Risks</option>
              <option value="bloatScore">Unused Access (Clutter)</option>
            </select>
          </div>
        </div>
      </div>

      <div style={styles.chartMasterWindow}>
        {enrichedTreemapData.map((region, idx) => {
          const regionSize = getRegionSize(region);
          const isLast = idx === enrichedTreemapData.length - 1;
          return (
            <div key={idx} style={{ flex: regionSize, display: 'flex', flexDirection: 'column', borderRight: isLast ? 'none' : '1px dashed #e2e8f0', padding: '12px', transition: 'flex 0.5s ease' }}>
              <div style={styles.regionHeaderContainer}><span style={styles.regionHeaderTop}>{region.name}</span></div>
              <div style={{ flex: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <Treemap 
                    data={region.children} 
                    dataKey={scaleMetric} 
                    content={<CustomizedTreemapContent colorMetric={colorMetric} maxValue={maxValues[colorMetric]} selectedTeams={selectedTeams} onBlockClick={toggleTeamSelection} />} 
                    isAnimationActive={true} 
                  />
                </ResponsiveContainer>
              </div>
            </div>
          )
        })}
      </div>

      <div style={styles.footerLegendContainer}>
        <div style={styles.legendItem}><div style={{...styles.legendDot, backgroundColor: '#ef4444'}}></div><span style={styles.legendText}>Severe Risk / High Clutter</span></div>
        <div style={styles.legendItem}><div style={{...styles.legendDot, backgroundColor: '#f59e0b'}}></div><span style={styles.legendText}>Elevated</span></div>
        <div style={styles.legendItem}><div style={{...styles.legendDot, backgroundColor: '#34d399'}}></div><span style={styles.legendText}>Moderate</span></div>
        <div style={styles.legendItem}><div style={{...styles.legendDot, backgroundColor: '#10b981'}}></div><span style={styles.legendText}>Clean & Optimized</span></div>
      </div>
      
      {selectedTeams.length > 0 && (
        <div style={styles.floatingActionBar}>
          <div style={{color: '#047857', fontWeight: '700', fontSize: '1.05rem'}}>{selectedTeams.length} {selectedTeams.length === 1 ? 'Team' : 'Teams'} Selected</div>
          <button style={styles.btnPrimaryEmerald} onClick={handleProceedClick}>Proceed to Optimization Hub →</button>
        </div>
      )}
      
      <AIDemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
    </div>
  );
}

const styles = {
  container: { padding: '40px 60px 80px 60px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: '"Inter", -apple-system, sans-serif' },
  
  heroHeaderCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)', padding: '35px 45px', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(4, 120, 87, 0.2)', marginBottom: '35px', position: 'relative', overflow: 'hidden' },
  brandBox: { display: 'flex', flexDirection: 'column', maxWidth: '800px', position: 'relative', zIndex: 2 },
  eyebrowBadge: { display: 'inline-block', padding: '6px 14px', backgroundColor: 'rgba(209, 250, 229, 0.15)', color: '#a7f3d0', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', width: 'fit-content', border: '1px solid rgba(167, 243, 208, 0.3)' },
  heroTitle: { color: '#ffffff', margin: '0 0 8px 0', fontSize: '2.4rem', fontWeight: '600', letterSpacing: '-0.5px' },
  heroAccent: { color: '#34d399', fontWeight: '700' },
  heroSubtitle: { margin: 0, fontSize: '1rem', color: '#d1fae5', lineHeight: '1.6', fontWeight: '400', marginBottom: '12px' },
  demoButton: { marginTop: '12px', padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', width: 'fit-content' },
  
  controlsContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: '30px' },
  metricSelectorBox: { display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '8px' },
  metricLabel: { fontSize: '0.80rem', fontWeight: '700', color: '#047857', textTransform: 'uppercase', letterSpacing: '0.5px' },
  metricSelect: { border: 'none', fontSize: '1rem', fontWeight: '600', color: '#0f172a', backgroundColor: 'transparent', outline: 'none', cursor: 'pointer' },
  vertDividerMini: { width: '1px', height: '24px', backgroundColor: '#e2e8f0', margin: '0 4px' },
  
  chartMasterWindow: { display: 'flex', width: '100%', height: '600px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', padding: '16px', border: '1px solid #e2e8f0' },
  regionHeaderContainer: { display: 'flex', justifyContent: 'center', marginBottom: '16px', marginTop: '4px' },
  regionHeaderTop: { backgroundColor: '#ecfdf5', color: '#047857', padding: '6px 16px', borderRadius: '8px', textAlign: 'center', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', border: '1px solid #a7f3d0' },
  
  footerLegendContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '32px', marginTop: '24px', padding: '16px 32px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', width: 'fit-content', margin: '30px auto 0 auto' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '8px' },
  legendDot: { width: '10px', height: '10px', borderRadius: '50%' },
  legendText: { fontSize: '0.8rem', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' },
  
  floatingActionBar: { position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#ecfdf5', padding: '12px 24px', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(4, 120, 87, 0.2)', display: 'flex', alignItems: 'center', gap: '30px', zIndex: 100, border: '1px solid #10b981' },
  btnPrimaryEmerald: { background: '#10b981', border: 'none', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.4)' },
  
  modalBackdrop: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  modalContent: { backgroundColor: '#ffffff', borderRadius: '16px', width: '500px', maxWidth: '90%', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)', overflow: 'hidden' },
  modalHeader: { backgroundColor: '#ffffff', padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { margin: 0, color: '#0f172a', fontSize: '1.2rem', fontWeight: '700' },
  closeButton: { background: 'none', border: 'none', fontSize: '1.5rem', color: '#94a3b8', cursor: 'pointer', padding: 0, lineHeight: 1 },
  modalBody: { padding: '24px' },
  modalText: { color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px', marginTop: 0 },
  algorithmCard: { display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', marginBottom: '12px', border: '1px solid #e2e8f0' },
  algoIcon: { width: '32px', height: '32px', borderRadius: '8px', color: '#ffffff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '1.2rem', flexShrink: 0 },
  algoDetails: { display: 'flex', flexDirection: 'column', gap: '4px' },
  algoTitle: { margin: 0, fontSize: '0.95rem', fontWeight: '700', color: '#0f172a' },
  algoDesc: { margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5' }
};