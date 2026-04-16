import React, { useState, useMemo } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import treemapData from './Optimized_Role_Treemap.json';
import userDetails from './User_Details.json';

// --- CUSTOM TOOLTIP COMPONENT ---
const CustomTooltip = ({ active, payload, scaleMetric, colorMetric }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    // Helper to get the user-friendly dropdown label
    const getMetricLabel = (metric) => {
      switch (metric) {
        case 'userCount': return 'Total Headcount';
        case 'sodCount': return 'Total SoD Conflicts';
        case 'highRiskCount': return 'High Risk Conflicts';
        case 'bloatScore': return 'Role Usage Bloat';
        default: return metric;
      }
    };

    // Helper to format the metric value
    const formatMetric = (metric, val) => {
      switch (metric) {
        case 'userCount': return `${val} ${val === 1 ? 'User' : 'Users'}`;
        case 'sodCount': return `${val} Conflicts`;
        case 'highRiskCount': return `${val} High Risk`;
        case 'bloatScore': return `${val}% Bloat`;
        default: return val;
      }
    };

    const scaleValue = data['_' + scaleMetric] || data[scaleMetric] || 0;
    const colorValue = data['_' + colorMetric] || data[colorMetric] || 0;
    const isSameMetric = scaleMetric === colorMetric;

    return (
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '12px 16px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
        border: '1px solid #e2e8f0',
        fontFamily: '"Inter", -apple-system, sans-serif',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        pointerEvents: 'none'
      }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#064e3b', fontWeight: '700', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
          {data.name}
        </h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '13px', color: '#475569' }}>
            <strong style={{ color: '#0f172a' }}>{isSameMetric ? 'Value:' : getMetricLabel(scaleMetric) + ':'}</strong> {formatMetric(scaleMetric, scaleValue)}
          </div>
          
          {!isSameMetric && (
            <div style={{ fontSize: '13px', color: '#475569' }}>
              <strong style={{ color: '#0f172a' }}>{getMetricLabel(colorMetric)}:</strong> {formatMetric(colorMetric, colorValue)}
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

// --- ULTRA-PREMIUM "APP ICON" TREEMAP SHAPE ---
const CustomizedTreemapContent = (props) => {
  const { x, y, width, height, name, depth, users, colorMetric, maxValue } = props;
  
  if (depth < 2 || !users) return null; 

  const colorValue = props['_' + colorMetric] || 0;

  let fillColor = '#10b981'; 
  if (colorValue > 0 && maxValue > 0) {
    const ratio = colorValue / maxValue;
    if (ratio >= 0.70) fillColor = '#ef4444';       
    else if (ratio >= 0.40) fillColor = '#f59e0b';  
    else if (ratio >= 0.15) fillColor = '#3b82f6';  
    else fillColor = '#10b981';                     
  }

  const padding = 4;
  const innerX = x + padding;
  const innerY = y + padding;
  const innerWidth = Math.max(0, width - padding * 2);
  const innerHeight = Math.max(0, height - padding * 2);

  let showName = false;
  let fontSizeName = 14;
  let displayName = name;

  if (innerWidth > 100 && innerHeight > 45) {
    showName = true;
    displayName = name.length > 20 ? name.substring(0, 17) + '...' : name;
  } else if (innerWidth > 60 && innerHeight > 30) {
    showName = true;
    fontSizeName = 11;
    displayName = name.length > 14 ? name.substring(0, 12) + '..' : name;
  } else if (innerWidth > 35 && innerHeight > 20) {
    showName = true;
    fontSizeName = 8.5;
    displayName = name.length > 8 ? name.substring(0, 6) + '..' : name;
  }

  return (
    <g>
      <rect 
        x={innerX} y={innerY} width={innerWidth} height={innerHeight} 
        fill={fillColor} 
        rx={12} ry={12} 
        stroke="rgba(255,255,255,0.35)" 
        strokeWidth={1.5}
        style={{ 
          cursor: 'pointer', 
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)', 
          filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.08))' 
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-3px) scale(1.02)';
          e.target.style.filter = 'drop-shadow(0px 12px 20px rgba(0,0,0,0.18))';
          e.target.style.stroke = "rgba(255,255,255,0.8)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0) scale(1)';
          e.target.style.filter = 'drop-shadow(0px 4px 8px rgba(0,0,0,0.08))';
          e.target.style.stroke = "rgba(255,255,255,0.35)";
        }}
      />
      
      {showName && (
        <text 
          x={innerX + innerWidth / 2} 
          y={innerY + innerHeight / 2} 
          textAnchor="middle" fill="#ffffff" fontSize={fontSizeName} fontWeight="700" 
          fontFamily='"Inter", -apple-system, sans-serif' letterSpacing="0.5px"
          dominantBaseline="central" 
          style={{ textShadow: '0px 2px 4px rgba(0,0,0,0.3)', pointerEvents: 'none' }} 
        >
          {displayName}
        </text>
      )}
    </g>
  );
};


export default function DashboardHome({ onSelectTeam }) {

  const [scaleMetric, setScaleMetric] = useState('userCount');
  const [colorMetric, setColorMetric] = useState('userCount');

  const { enrichedTreemapData, maxValues } = useMemo(() => {
    let globalMaxUsers = 0;
    let globalMaxSod = 0;
    let globalMaxHighRisk = 0;
    let globalMaxBloat = 0;

    const processedData = treemapData.map(region => {
      const newRegion = { ...region, children: [] };
      region.children.forEach(dept => {
        const newDept = { ...dept, children: [] };
        dept.children.forEach(pos => {
          let exactUsers = pos.users ? pos.users.length : 0;
          let exactSodConflicts = 0;
          let exactHighRiskConflicts = 0;
          let blockTotalAssigned = 0;
          let blockTotalExecuted = 0;

          if (pos.users) {
            pos.users.forEach((u, index) => {
              const ud = userDetails.find(d => d.userId === u.userId) || {};
              const fallbackUsage = 12 + (index * 17) % 70; 
              const fallbackAssigned = 150 + (index * 23) % 150;
              const fallbackExecuted = Math.floor((fallbackUsage / 100) * fallbackAssigned);
              const conflicts = ud.conflictCount !== undefined ? ud.conflictCount : (u.conflictCount || 0);
              const statusColor = ud.statusColor || u.status || 'Green';
              const criticality = ud.criticality || (statusColor === 'Red' ? 'High Risk' : statusColor === 'Yellow' ? 'Medium Risk' : 'Clean');

              exactSodConflicts += conflicts;
              if (statusColor === 'Red' || criticality === 'High Risk' || criticality === 'Critical') {
                exactHighRiskConflicts += conflicts;
              }
              blockTotalAssigned += ud.totalTxAssigned !== undefined ? ud.totalTxAssigned : fallbackAssigned;
              blockTotalExecuted += ud.totalTxExecuted !== undefined ? ud.totalTxExecuted : fallbackExecuted;
            });
          }

          let exactBloatScore = 0;
          if (blockTotalAssigned > 0) {
            exactBloatScore = Math.round((1 - (blockTotalExecuted / blockTotalAssigned)) * 100);
          }

          if (exactUsers > globalMaxUsers) globalMaxUsers = exactUsers;
          if (exactSodConflicts > globalMaxSod) globalMaxSod = exactSodConflicts;
          if (exactHighRiskConflicts > globalMaxHighRisk) globalMaxHighRisk = exactHighRiskConflicts;
          if (exactBloatScore > globalMaxBloat) globalMaxBloat = exactBloatScore;

          newDept.children.push({
            ...pos,
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

  const getRegionSize = (region) => region.children.reduce((acc, dept) => acc + dept.children.reduce((a, pos) => a + pos[scaleMetric], 0), 0);

  return (
    <div style={styles.container}>
      
      <div style={styles.heroHeaderCard}>
        <div style={styles.headerAccentLine}></div>
        <div style={styles.brandBox}>
          <div style={styles.eyebrowBadge}>Global Operations View</div>
          <h1 style={styles.heroTitle}>Role Redesign <span style={styles.heroAccent}>Landscape</span></h1>
          <p style={styles.heroSubtitle}>Click on any department chip to audit user roles, optimize licenses, and eliminate Segregation of Duties conflicts.</p>
        </div>
      </div>

      {/* TOP CONTROLS ONLY HAVE THE DROPDOWNS NOW */}
      <div style={styles.controlsContainer}>
        <div style={{ display: 'flex', gap: '30px', margin: '0 auto' }}> {/* Centered dropdowns */}
          <div style={styles.metricSelectorBox}>
            <span style={styles.metricLabel}>Scale By:</span>
            <select style={styles.metricSelect} value={scaleMetric} onChange={(e) => setScaleMetric(e.target.value)}>
              <option value="userCount">Total Headcount</option>
              <option value="sodCount">Total SoD Conflicts</option>
              <option value="highRiskCount">High Risk Conflicts</option>
              <option value="bloatScore">Role Usage Bloat</option>
            </select>
          </div>

          <div style={styles.metricSelectorBox}>
            <span style={styles.metricLabel}>Color By:</span>
            <select style={styles.metricSelect} value={colorMetric} onChange={(e) => setColorMetric(e.target.value)}>
              <option value="userCount">Total Headcount</option>
              <option value="sodCount">Total SoD Conflicts</option>
              <option value="highRiskCount">High Risk Conflicts</option>
              <option value="bloatScore">Role Usage Bloat</option>
            </select>
          </div>
        </div>
      </div>

      <div style={styles.chartMasterWindow}>
        {enrichedTreemapData.map((region, idx) => {
          const regionSize = getRegionSize(region);
          const isLast = idx === enrichedTreemapData.length - 1;
          
          return (
            <div key={idx} style={{ flex: regionSize, display: 'flex', flexDirection: 'column', borderRight: isLast ? 'none' : '2px dashed #cbd5e1', padding: '12px', transition: 'flex 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}>
              <div style={styles.regionHeaderContainer}><span style={styles.regionHeaderTop}>{region.name}</span></div>
              <div style={{ flex: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <Treemap 
                    data={region.children} 
                    dataKey={scaleMetric} 
                    content={<CustomizedTreemapContent colorMetric={colorMetric} maxValue={maxValues[colorMetric]} />} 
                    onClick={(e) => e && e.users && onSelectTeam(e)} 
                    isAnimationActive={true} 
                    animationDuration={600} 
                    animationEasing="ease-in-out"
                  >
                    <Tooltip content={<CustomTooltip scaleMetric={scaleMetric} colorMetric={colorMetric} />} />
                  </Treemap>
                </ResponsiveContainer>
              </div>
            </div>
          )
        })}
      </div>

      {/* NEW FOOTER LEGEND */}
      <div style={styles.footerLegendContainer}>
        <div style={styles.legendItem}><div style={{...styles.legendDot, backgroundColor: '#ef4444', boxShadow: '0 0 8px rgba(239, 68, 68, 0.5)'}}></div><span style={styles.legendText}>Top 30% (Severe)</span></div>
        <div style={styles.legendItem}><div style={{...styles.legendDot, backgroundColor: '#f59e0b', boxShadow: '0 0 8px rgba(245, 158, 11, 0.5)'}}></div><span style={styles.legendText}>Elevated</span></div>
        <div style={styles.legendItem}><div style={{...styles.legendDot, backgroundColor: '#3b82f6', boxShadow: '0 0 8px rgba(59, 130, 246, 0.5)'}}></div><span style={styles.legendText}>Moderate</span></div>
        <div style={styles.legendItem}><div style={{...styles.legendDot, backgroundColor: '#10b981', boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)'}}></div><span style={styles.legendText}>Low/Clean</span></div>
      </div>
      
    </div>
  );
}

// --- CSS-IN-JS STYLES ---
const styles = {
  container: { padding: '40px 60px', backgroundColor: '#f0fdf4', minHeight: '100vh', fontFamily: '"Inter", -apple-system, sans-serif' },
  heroHeaderCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: '#064e3b', padding: '45px 50px', borderRadius: '24px', boxShadow: '0 20px 40px -10px rgba(6, 78, 59, 0.25)', marginBottom: '35px', position: 'relative', overflow: 'hidden' },
  headerAccentLine: { position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: 'linear-gradient(90deg, #34d399 0%, #10b981 100%)' },
  brandBox: { display: 'flex', flexDirection: 'column', maxWidth: '800px', position: 'relative', zIndex: 2 },
  eyebrowBadge: { display: 'inline-block', padding: '6px 14px', backgroundColor: 'rgba(167, 243, 208, 0.15)', color: '#a7f3d0', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', width: 'fit-content', border: '1px solid rgba(167, 243, 208, 0.3)' },
  heroTitle: { color: '#ffffff', margin: '0 0 10px 0', fontSize: '2.6rem', fontWeight: '400', letterSpacing: '-1px' },
  heroAccent: { color: '#10b981', fontWeight: '700' },
  heroSubtitle: { margin: 0, fontSize: '1.05rem', color: '#a7f3d0', lineHeight: '1.6', fontWeight: '400' },
  
  // Updated Controls Container (Just the dropdowns now)
  controlsContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff', padding: '16px 24px', borderRadius: '100px', boxShadow: '0 10px 25px -5px rgba(5, 150, 105, 0.08)', border: '1px solid #e2e8f0', marginBottom: '30px' },
  metricSelectorBox: { display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '8px' },
  metricLabel: { fontSize: '0.80rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' },
  metricSelect: { border: 'none', fontSize: '1rem', fontWeight: '700', color: '#064e3b', backgroundColor: 'transparent', outline: 'none', cursor: 'pointer', fontFamily: '"Inter", -apple-system, sans-serif' },
  
  chartMasterWindow: { display: 'flex', width: '100%', height: '650px', backgroundColor: '#ffffff', borderRadius: '28px', boxShadow: '0 20px 40px -10px rgba(5, 150, 105, 0.08)', padding: '12px', border: '1px solid #ffffff' },
  regionHeaderContainer: { display: 'flex', justifyContent: 'center', marginBottom: '15px', marginTop: '10px' },
  regionHeaderTop: { backgroundColor: '#f0fdf4', color: '#047857', padding: '8px 20px', borderRadius: '100px', textAlign: 'center', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', border: '1px solid #a7f3d0' },

  // New Footer Legend Container
  footerLegendContainer: { 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: '32px', 
    marginTop: '24px', 
    padding: '16px 32px', 
    backgroundColor: '#ffffff', 
    borderRadius: '100px', 
    boxShadow: '0 10px 25px -5px rgba(5, 150, 105, 0.08)', 
    border: '1px solid #e2e8f0', 
    width: 'fit-content', 
    margin: '30px auto 0 auto' 
  },
  legendItem: { display: 'flex', alignItems: 'center', gap: '8px' },
  legendDot: { width: '12px', height: '12px', borderRadius: '50%' },
  legendText: { fontSize: '0.85rem', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' },
};