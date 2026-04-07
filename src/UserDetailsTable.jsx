import React from 'react';
import userDetails from './User_Details.json';

export default function UserDetailsTable({ team, onBack, onContinueToRoleGen }) {
  
  let optimizedCount = 0;

  const enrichedUsers = team.users.map((u, index) => {
    const details = userDetails.find(ud => ud.userId === u.userId);
    const fallbackUsage = 12 + (index * 17) % 70; 
    const fallbackAssigned = 150 + (index * 23) % 150;
    const fallbackExecuted = Math.floor((fallbackUsage / 100) * fallbackAssigned);
    
    const currentLicense = details?.currentLicense || "GB Advanced Use";
    const optimalLicense = details?.optimalLicense || (fallbackUsage < 30 ? "GC Core Use" : "GB Advanced Use");
    
    // Check if a reduction/downgrade is occurring
    const isReduced = currentLicense !== optimalLicense;
    if (isReduced) optimizedCount++;

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
      
      {/* --- SLEEK EMERALD HEADER --- */}
      <header style={styles.sleekHeader}>
        <div style={styles.headerTopRow}>
          <button onClick={onBack} style={styles.backLinkBtn}>
            <span style={styles.backArrow}>←</span> Back to Executive Summary
          </button>
          
          <button 
            onClick={() => onContinueToRoleGen(enrichedUsers)} 
            style={styles.ctaButton}
          >
            Continue to Role Generation →
          </button>
        </div>

        <div style={styles.headerTitleRow}>
          <div style={{ textAlign: 'left' }}>
            <div style={styles.eyebrowText}>{team.users[0]?.country || 'Global'} / {team.name}</div>
            <h1 style={styles.heroTitle}>Detailed <span style={styles.heroAccent}>User Roster</span></h1>
            <p style={styles.heroSubtitle}>Showing <strong>{enrichedUsers.length}</strong> exact user assignments and risk profiles.</p>
          </div>
          
          {/* OVERALL REDUCTION STAT */}
          <div style={styles.heroQuickStat}>
            <span style={styles.quickStatLabel}>Licenses Optimized</span>
            <span style={styles.quickStatValue}>{optimizedCount} <span style={{fontSize: '1.2rem', color: '#065f46'}}>Users</span></span>
          </div>
        </div>
      </header>

      {/* --- DATA TABLE --- */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>User Profile</th>
              <th style={styles.th}>Role Usage (Bloat)</th>
              <th style={styles.th}>Detected Conflicts</th>
              <th style={styles.th}>FUE License Target</th>
            </tr>
          </thead>
          <tbody>
            {enrichedUsers.map((user, idx) => {
              const theme = getRiskTheme(user.statusColor);
              return (
                <tr key={idx} style={{...styles.tr, borderLeft: `4px solid ${theme.border}`}}>
                  <td style={styles.td}>
                    <div style={styles.primaryText}>{user.userName || 'Unknown User'}</div>
                    <div style={styles.secondaryText}>{user.position || user.department} • <span style={{color: '#94a3b8'}}>{user.userId}</span></div>
                  </td>
                  <td style={styles.td}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px'}}>
                      <div style={styles.usageBarBg}>
                        <div style={{...styles.usageBarFill, width: `${user.usagePercent}%`, background: theme.bar}}></div>
                      </div>
                      <span style={{fontSize: '0.85rem', fontWeight: '800', color: '#0f172a'}}>{user.usagePercent}%</span>
                    </div>
                    <div style={styles.secondaryText}>{user.totalTxExecuted} Executed / <span style={{color:'#64748b'}}>{user.totalTxAssigned} Assigned</span></div>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: '800', color: theme.text }}>{user.conflictCount}</span>
                      <span style={{ ...styles.pillBadge, backgroundColor: theme.bg, color: theme.text }}>{user.criticality}</span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.licenseRow}>
                      <span style={styles.licenseLabel}>Current:</span> 
                      <span style={{...styles.licenseValue, color: '#94a3b8', textDecoration: user.isReduced ? 'line-through' : 'none'}}>{user.currentLicense}</span>
                    </div>
                    <div style={{...styles.licenseRow, marginTop: '6px'}}>
                      <span style={styles.licenseLabel}>Target:</span> 
                      <span style={{...styles.licenseValue, color: '#059669', fontWeight: '800'}}>{user.optimalLicense}</span>
                      
                      {/* USER SPECIFIC REDUCTION BADGE */}
                      {user.isReduced && (
                        <span style={styles.reductionBadge}>↓ Reduced</span>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- SLEEK, EMERALD/GREEN THEME STYLES ---
const styles = {
  container: { padding: '40px 60px', backgroundColor: '#f0fdf4', minHeight: '100vh', fontFamily: '"Inter", -apple-system, sans-serif' },
  
  // SLEEK HEADER
  sleekHeader: { display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '35px' },
  headerTopRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  backLinkBtn: { background: 'none', border: 'none', color: '#047857', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s ease', padding: 0 },
  backArrow: { fontSize: '1.2rem', lineHeight: '1' },
  
  ctaButton: { 
    background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', // Emerald gradient
    border: 'none', color: '#ffffff', 
    padding: '12px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', 
    boxShadow: '0 8px 15px rgba(5, 150, 105, 0.2)', transition: 'transform 0.1s ease'
  },

  headerTitleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', textAlign: 'left' },
  eyebrowText: { color: '#047857', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' },
  heroTitle: { color: '#064e3b', margin: '0 0 6px 0', fontSize: '2.4rem', fontWeight: '500', letterSpacing: '-1px' },
  heroAccent: { color: '#10b981', fontWeight: '700' }, 
  heroSubtitle: { margin: 0, fontSize: '1.05rem', color: '#065f46', fontWeight: '400' },
  
  heroQuickStat: { textAlign: 'right' },
  quickStatLabel: { display: 'block', fontSize: '0.85rem', color: '#047857', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' },
  quickStatValue: { display: 'block', fontSize: '2.4rem', color: '#059669', fontWeight: '800', letterSpacing: '-1px', lineHeight: '1' },

  // TABLE STYLES
  tableWrapper: { 
    backgroundColor: '#ffffff', 
    borderRadius: '20px', 
    border: '1px solid #e2e8f0', 
    boxShadow: '0 10px 40px -10px rgba(5, 150, 105, 0.08)', // subtle green shadow
    overflow: 'hidden' 
  },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { 
    padding: '20px 24px', 
    backgroundColor: '#f0fdf4', // Matching emerald tint
    fontSize: '0.75rem', 
    fontWeight: '700', 
    color: '#047857', // Emerald text 
    textTransform: 'uppercase', 
    letterSpacing: '1px', 
    borderBottom: '1px solid #a7f3d0' 
  },
  tr: { borderBottom: '1px solid #f1f5f9', backgroundColor: '#ffffff', transition: 'background 0.2s ease' },
  td: { padding: '20px 24px', verticalAlign: 'middle' },
  
  primaryText: { fontSize: '1rem', fontWeight: '600', color: '#0f172a', marginBottom: '4px' },
  secondaryText: { fontSize: '0.85rem', color: '#64748b', fontWeight: '500' },
  
  usageBarBg: { width: '120px', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' },
  usageBarFill: { height: '100%', borderRadius: '4px' },
  pillBadge: { padding: '4px 12px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' },
  
  licenseRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  licenseLabel: { fontSize: '0.75rem', fontWeight: '600', color: '#94a3b8', width: '50px' },
  licenseValue: { fontSize: '0.85rem', fontWeight: '600' },
  
  reductionBadge: { 
    backgroundColor: '#d1fae5', 
    color: '#047857', 
    padding: '2px 8px', 
    borderRadius: '6px', 
    fontSize: '0.7rem', 
    fontWeight: '700', 
    marginLeft: '6px',
    border: '1px solid #a7f3d0'
  }
};