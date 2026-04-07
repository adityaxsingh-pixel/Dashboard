import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, ComposedChart, Line, Cell } from 'recharts';

export default function UserGroupAnalysis({ team, enrichedUsers, onBack }) {
  let totalConflicts = 0;
  let totalWaste = 0;
  let totalAssigned = 0;
  let totalExecuted = 0;

  enrichedUsers.forEach(u => {
    totalConflicts += u.conflictCount;
    totalAssigned += (u.totalTxAssigned || 0);
    totalExecuted += (u.totalTxExecuted || 0);
    if (u.currentLicense !== u.optimalLicense) totalWaste += 1600; 
  });

  const bloatData = [
    { category: 'Used Transactions', unique: totalExecuted, overhead: 0 },
    { category: 'Assigned Transactions', unique: totalExecuted, overhead: totalAssigned - totalExecuted },
  ];
  
  const riskMitigation = [
    { stage: 'Legacy Risk', risk: totalConflicts * 15 || 80, color: '#f87171' },
    { stage: 'Optimized', risk: Math.floor((totalConflicts * 15 || 80) * 0.4), color: '#f59e0b' },
    { stage: 'RM Shield', risk: 5, color: '#10b981' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.headerNavStyle}>
        <div style={styles.brandBox}>
          <span style={styles.sectionLabel}>{team.users[0].department}</span>
          <h1 style={styles.headingStyle}>Group Impact Diagnostic: <span style={styles.accentText}>{team.name}</span></h1>
        </div>
        <button onClick={onBack} style={styles.secondaryBtn}>← Back to Matrix</button>
      </div>

      <div style={styles.kpiRowStyle}>
        <div style={styles.kpiCardStyle}>
          <span style={styles.kpiLabel}>License Waste</span>
          <div style={{...styles.kpiValue, color: '#ef4444'}}>${totalWaste.toLocaleString()}/yr</div>
          <p style={styles.kpiSubText}>Due to unused high-cost T-Codes</p>
        </div>
        <div style={styles.kpiCardStyle}>
          <span style={styles.kpiLabel}>Total Audit Exposure</span>
          <div style={{...styles.kpiValue, color: '#f59e0b'}}>{totalConflicts}</div>
          <p style={styles.kpiSubText}>Unmitigated SoD Violations</p>
        </div>
        <div style={styles.kpiCardStyle}>
          <span style={styles.kpiLabel}>Ghost Assignments</span>
          <div style={{...styles.kpiValue, color: '#ef4444'}}>{totalAssigned > 0 ? Math.floor(((totalAssigned - totalExecuted)/totalAssigned)*100) : 0}%</div>
          <p style={styles.kpiSubText}>Overall Block Bloat Ratio</p>
        </div>
        <div style={styles.kpiCardStyle}>
          <span style={styles.kpiLabel}>Maintenance Delta</span>
          <div style={{...styles.kpiValue, color: '#10b981'}}>-85%</div>
          <p style={styles.kpiSubText}>Effort saved with RM Engine</p>
        </div>
      </div>

      <div style={styles.chartGridStyle}>
        <div style={styles.cardStyle}>
          <h3 style={styles.cardTitleStyle}>Usage vs. Assignment Bloat</h3>
          <div style={{height: '250px'}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bloatData} stackOffset="expand">
                <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="unique" stackId="a" fill="#10b981" name="Executed" />
                <Bar dataKey="overhead" stackId="a" fill="#e2e8f0" name="Unused (Ghost)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={styles.cardStyle}>
          <h3 style={styles.cardTitleStyle}>Risk Mitigation Path</h3>
          <div style={{height: '250px'}}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={riskMitigation}>
                <XAxis dataKey="stage" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="risk" barSize={40} radius={[4,4,0,0]}>
                  {riskMitigation.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
                <Line type="monotone" dataKey="risk" stroke="#0f172a" strokeWidth={2} dot={{r:4, fill: '#0f172a'}} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
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
  
  kpiRowStyle: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' },
  kpiCardStyle: { padding: '24px', borderRadius: '16px', backgroundColor: '#fff', border: '1px solid #cbdad2', textAlign: 'left', boxShadow: '0 4px 6px -1px rgba(2, 44, 34, 0.05)' },
  kpiLabel: { fontSize: '0.7rem', fontWeight: '800', color: '#64748b', letterSpacing: '1px', textTransform: 'uppercase' },
  kpiValue: { fontSize: '1.8rem', fontWeight: '900', margin: '8px 0', letterSpacing: '-0.5px' },
  kpiSubText: { fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600', margin: 0 },
  chartGridStyle: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '25px' },
  cardStyle: { padding: '30px', borderRadius: '16px', border: '1px solid #cbdad2', backgroundColor: '#fff', boxShadow: '0 4px 6px -1px rgba(2, 44, 34, 0.05)' },
  cardTitleStyle: { color: '#022c22', fontSize: '1rem', fontWeight: '800', marginBottom: '24px' }
};