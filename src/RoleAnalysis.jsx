import React from 'react';
import roleDetails from './Role_Details.json';

export default function RoleAnalysis({ team, enrichedUsers, onBack }) {
  let allRoleIds = new Set();
  let toxicTcodes = new Set();

  enrichedUsers.forEach(u => {
    if (u.assignedRoles) u.assignedRoles.forEach(r => allRoleIds.add(r));
    if (u.unusedHighCostTx) u.unusedHighCostTx.forEach(t => toxicTcodes.add(t));
  });

  const activeRoles = Array.from(allRoleIds).map(rId => roleDetails.find(d => d.roleId === rId)).filter(Boolean);

  return (
    <div style={styles.container}>
      <div style={styles.headerNavStyle}>
        <div style={styles.brandBox}>
          <span style={styles.sectionLabel}>Audit Dashboard</span>
          <h1 style={styles.headingStyle}>Role Analysis: <span style={styles.accentText}>{team.name}</span></h1>
        </div>
        <button onClick={onBack} style={styles.secondaryBtn}>← Back to Matrix</button>
      </div>

      <div style={styles.warningBanner}>
        <strong style={{color: '#9f1239'}}>License Warning:</strong> This group is consuming expensive Professional/Developer licenses due to the following unused, high-cost transactions: 
        <span style={styles.txHighlight}>{Array.from(toxicTcodes).join(', ')}</span>. Removing these will downgrade license requirements and save budget.
      </div>

      <div style={styles.chartGridStyle}>
        {activeRoles.map((role, idx) => (
          <div key={idx} style={styles.cardStyle}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '10px'}}>
              <span style={{ fontWeight: '800', color: '#0f172a' }}>{role.roleId}</span>
              <span style={{ fontSize: '0.65rem', padding: '4px 8px', borderRadius: '6px', fontWeight: '800', backgroundColor: role.criticality === 'CRITICAL' ? '#fee2e2' : '#f1fcf8', color: role.criticality === 'CRITICAL' ? '#b91c1c' : '#059669'}}>
                {role.criticality}
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '15px', fontWeight: '500' }}>{role.roleName}</div>
            
            <div style={{display: 'flex', flexWrap: 'wrap', gap: '6px'}}>
              {role.tcodes.map(tcode => {
                const isToxic = toxicTcodes.has(tcode);
                return (
                  <span key={tcode} style={{fontSize: '0.75rem', padding: '4px 8px', borderRadius: '6px', fontWeight: '600', backgroundColor: isToxic ? '#fee2e2' : '#f8fafc', color: isToxic ? '#b91c1c' : '#475569', border: isToxic ? '1px solid #fca5a5' : '1px solid #e2e8f0'}}>
                    {tcode}
                  </span>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '40px 60px', backgroundColor: '#f9fdfc', minHeight: '100vh', fontFamily: '"Inter", sans-serif' },
  headerNavStyle: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' },
  brandBox: { display: 'flex', flexDirection: 'column' },
  sectionLabel: { fontSize: '0.75rem', fontWeight: '900', color: '#059669', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' },
  headingStyle: { color: '#022c22', margin: '0', fontSize: '2.4rem', fontWeight: '900', letterSpacing: '-1px' },
  accentText: { color: '#059669' },
  secondaryBtn: { background: '#fff', border: '1px solid #cbdad2', color: '#022c22', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '800', fontSize: '0.85rem' },
  
  warningBanner: { padding: '16px 20px', backgroundColor: '#fff1f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#be123c', fontSize: '0.9rem', marginBottom: '30px', lineHeight: '1.5' },
  txHighlight: { fontWeight: '800', backgroundColor: '#fecaca', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' },
  
  chartGridStyle: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' },
  cardStyle: { padding: '20px', borderRadius: '16px', border: '1px solid #cbdad2', backgroundColor: '#fff', boxShadow: '0 4px 6px -1px rgba(2, 44, 34, 0.05)' }
};