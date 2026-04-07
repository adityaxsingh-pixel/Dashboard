import React from 'react';
import userDetails from './User_Details.json';

export default function Dashboard({ onGroupAnalysis, onRoleAnalysis }) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.eyebrow}>Role Management</span>
        <h1 style={styles.title}>Global Identity Matrix</h1>
        <p style={styles.subtitle}>Audit user assignments, identify license bloat, and redesign roles.</p>
      </div>

      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>User Identity</th>
              <th style={styles.th}>Department / Position</th>
              <th style={styles.th}>Role Usage (Tx)</th>
              <th style={styles.th}>SoD Conflicts</th>
              <th style={styles.th}>License Optimization</th>
              <th style={styles.th}>Action Menu</th>
            </tr>
          </thead>
          <tbody>
            {userDetails.slice(0, 15).map((user, idx) => {
              const riskColor = user.criticality === 'High' ? '#ef4444' : user.criticality === 'Medium' ? '#f59e0b' : '#10b981';
              
              return (
                <tr key={idx} style={styles.tr}>
                  {/* IDENTITY */}
                  <td style={styles.td}>
                    <div style={styles.primaryText}>{user.userName}</div>
                    <div style={styles.secondaryText}>{user.userId}</div>
                  </td>
                  
                  {/* ORG MAPPING */}
                  <td style={styles.td}>
                    <div style={styles.primaryText}>{user.position}</div>
                    <div style={styles.secondaryText}>{user.department}</div>
                  </td>
                  
                  {/* USAGE */}
                  <td style={styles.td}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <div style={styles.usageBarBg}>
                        <div style={{...styles.usageBarFill, width: `${user.usagePercent}%`, backgroundColor: user.usagePercent < 20 ? '#ef4444' : '#10b981'}}></div>
                      </div>
                      <span style={{fontSize: '0.8rem', fontWeight: '600', color: '#475569'}}>{user.usagePercent}%</span>
                    </div>
                    <div style={styles.secondaryText}>
                      {user.totalTxExecuted} executed / {user.totalTxAssigned} assigned
                    </div>
                  </td>

                  {/* CONFLICTS */}
                  <td style={styles.td}>
                    <div style={{...styles.primaryText, color: riskColor}}>{user.conflictCount} Conflicts</div>
                    <div style={styles.secondaryText}>Risk: {user.criticality}</div>
                  </td>

                  {/* LICENSE */}
                  <td style={styles.td}>
                    <div style={{...styles.primaryText, color: '#0f172a'}}>Current: {user.currentLicense}</div>
                    <div style={{...styles.secondaryText, color: '#059669', fontWeight: '600'}}>Target: {user.optimalLicense}</div>
                  </td>

                  {/* ACTIONS */}
                  <td style={styles.td}>
                    <div style={{display: 'flex', gap: '8px'}}>
                      <button onClick={() => onGroupAnalysis(user)} style={styles.actionBtn}>Group Analysis</button>
                      <button onClick={() => onRoleAnalysis(user)} style={{...styles.actionBtn, backgroundColor: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1'}}>Role Audit</button>
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

const styles = {
  container: { padding: '40px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: '"Inter", sans-serif' },
  header: { marginBottom: '30px' },
  eyebrow: { fontSize: '0.8rem', fontWeight: '600', color: '#059669', textTransform: 'uppercase', letterSpacing: '1px' },
  title: { fontSize: '2rem', fontWeight: '600', color: '#0f172a', margin: '5px 0' },
  subtitle: { color: '#64748b', fontSize: '0.9rem', margin: 0 },
  tableCard: { backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '16px 20px', backgroundColor: '#f8fafc', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' },
  tr: { borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' },
  td: { padding: '16px 20px', verticalAlign: 'middle' },
  primaryText: { fontSize: '0.9rem', fontWeight: '600', color: '#0f172a', marginBottom: '2px' },
  secondaryText: { fontSize: '0.8rem', color: '#64748b' },
  usageBarBg: { width: '80px', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' },
  usageBarFill: { height: '100%', borderRadius: '3px' },
  actionBtn: { padding: '8px 12px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', transition: 'opacity 0.2s' }
};