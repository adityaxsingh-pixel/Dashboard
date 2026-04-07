import React, { useMemo } from 'react';

// A lightweight dictionary to provide realistic descriptions for raw string T-codes
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

export default function RoleGeneration({ users = [], onBack }) {
  
  const { displayTcodes, maintainTcodes, activeTransactions, includedUsers } = useMemo(() => {
    // 1. Extract user names/IDs for the summary banner (or use a dummy name)
    const userList = users.length > 0 
        ? users.map(u => u.userName || u.userId).join(', ') 
        : 'Demo User Group (Fallback Data)';

    // 2. Extract all transactions passed from UserDetailsTable
    let allTx = users.flatMap(u => u.transactions || u.executedTransactions || []);
    
    // 3. If NO transactions are passed, inject dummy data so the UI isn't empty!
    if (allTx.length === 0) {
        allTx = ['SU01D', 'ME23N', 'VA03', 'SE16N', 'PFCG', 'SU01', 'SM59', 'FB01', 'Z_CUSTOM_03', 'Z_CUSTOM_MAINTAIN'];
    }

    // 4. Deduplicate and format into rich objects (Tcode + Text + Type)
    const uniqueTxMap = new Map();
    allTx.forEach(tx => {
      // If it's already a rich object from your JSON:
      if (typeof tx === 'object' && tx.tcode) {
        uniqueTxMap.set(tx.tcode, {
           tcode: tx.tcode,
           description: tx.description || 'Description unavailable',
           type: tx.type || 'M'
        });
      } 
      // If it's a raw string like "ME23N":
      else if (typeof tx === 'string') {
        const fallback = fallbackDictionary[tx];
        if (fallback) {
            uniqueTxMap.set(tx, { tcode: tx, description: fallback.description, type: fallback.type });
        } else {
            // Guess Display vs Maintain based on SAP naming conventions
            const isDisplay = tx.endsWith('03') || tx.endsWith('D') || tx.includes('DISPLAY');
            uniqueTxMap.set(tx, { 
                tcode: tx, 
                description: isDisplay ? 'Standard Display Transaction' : 'Standard Maintenance Transaction', 
                type: isDisplay ? 'D' : 'M' 
            });
        }
      }
    });

    const uniqueTx = Array.from(uniqueTxMap.values());

    // 5. Sort into Display vs Maintain
    const display = uniqueTx.filter(t => t.type === 'D').sort((a,b) => a.tcode.localeCompare(b.tcode));
    const maintain = uniqueTx.filter(t => t.type !== 'D').sort((a,b) => a.tcode.localeCompare(b.tcode));

    return { 
      displayTcodes: display, 
      maintainTcodes: maintain, 
      activeTransactions: uniqueTx,
      includedUsers: userList
    };
  }, [users]);

  return (
    <div style={styles.container}>
      
      {/* --- SLEEK EMERALD HEADER --- */}
      <header style={styles.sleekHeader}>
        <div style={styles.headerTopRow}>
          <button onClick={onBack} style={styles.backLinkBtn}>
            <span style={styles.backArrow}>←</span> Back to User Roster
          </button>
        </div>

        <div style={styles.headerTitleRow}>
          <div style={{ textAlign: 'left' }}>
            <div style={styles.eyebrowText}>Role Architecture</div>
            <h1 style={styles.heroTitle}>Role Generation <span style={styles.heroAccent}>Workspace</span></h1>
            <p style={styles.heroSubtitle}>Review and segregate executed transactions to build clean, conflict-free roles.</p>
          </div>
          
          {/* QUICK STAT */}
          <div style={styles.heroQuickStat}>
            <span style={styles.quickStatLabel}>Unique T-Codes Found</span>
            <span style={styles.quickStatValue}>{activeTransactions.length}</span>
          </div>
        </div>
      </header>

      {/* --- UNIFIED CANVAS --- */}
      <div style={styles.unifiedCanvas}>
        
        {/* SCOPE BANNER */}
        <div style={styles.scopeBanner}>
          <span style={styles.scopeLabel}>Target Users ({users.length || 1}):</span>
          <span style={styles.scopeText}>
            {includedUsers.length > 120 ? includedUsers.substring(0, 120) + '...' : includedUsers}
          </span>
        </div>

        <div style={styles.grid}>
          {/* BLOCK 1: DISPLAY ACCESS */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h3 style={{...styles.cardTitle, color: '#0284c7'}}>Display Access</h3>
                <p style={styles.cardSub}>Read-only transactions (Low Risk)</p>
              </div>
              <span style={{...styles.countBadge, backgroundColor: '#e0f2fe', color: '#0284c7'}}>
                {displayTcodes.length} T-Codes
              </span>
            </div>
            
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Transaction</th>
                    <th style={styles.th}>Transaction Text</th>
                  </tr>
                </thead>
                <tbody>
                  {displayTcodes.length > 0 ? (
                    displayTcodes.map(tx => (
                      <tr key={tx.tcode} style={styles.tr}>
                        <td style={{...styles.td, fontFamily: '"Fira Code", monospace', fontWeight: '600'}}>{tx.tcode}</td>
                        <td style={styles.td}>{tx.description}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="2" style={styles.emptyText}>No display transactions found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <button style={{...styles.secondaryBtn, backgroundColor: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd'}}>
              Create Display Access Role
            </button>
          </div>

          {/* BLOCK 2: MAINTAIN ACCESS */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h3 style={{...styles.cardTitle, color: '#dc2626'}}>Maintain Access</h3>
                <p style={styles.cardSub}>Create/Update/Delete capabilities (High Risk)</p>
              </div>
              <span style={{...styles.countBadge, backgroundColor: '#fee2e2', color: '#dc2626'}}>
                {maintainTcodes.length} T-Codes
              </span>
            </div>
            
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Transaction</th>
                    <th style={styles.th}>Transaction Text</th>
                  </tr>
                </thead>
                <tbody>
                  {maintainTcodes.length > 0 ? (
                    maintainTcodes.map(tx => (
                      <tr key={tx.tcode} style={styles.tr}>
                        <td style={{...styles.td, fontFamily: '"Fira Code", monospace', fontWeight: '600'}}>{tx.tcode}</td>
                        <td style={styles.td}>{tx.description}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="2" style={styles.emptyText}>No maintain transactions found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <button style={{...styles.secondaryBtn, backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca'}}>
              Create Maintain Role
            </button>
          </div>
        </div>

        {/* BLOCK 3: ALL-INCLUSIVE */}
        <div style={styles.bottomSection}>
          <div style={styles.divider}></div>
          <button style={styles.ctaButton}>
            Generate All-Inclusive Role (Combined Access)
          </button>
          <p style={{fontSize: '0.85rem', color: '#64748b', marginTop: '12px'}}>
            Generates a single role containing all {activeTransactions.length} executed transactions.
          </p>
        </div>
        
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
  
  headerTitleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', textAlign: 'left' },
  eyebrowText: { color: '#047857', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' },
  heroTitle: { color: '#064e3b', margin: '0 0 6px 0', fontSize: '2.4rem', fontWeight: '500', letterSpacing: '-1px' },
  heroAccent: { color: '#10b981', fontWeight: '700' }, 
  heroSubtitle: { margin: 0, fontSize: '1.05rem', color: '#065f46', fontWeight: '400' },
  
  heroQuickStat: { textAlign: 'right' },
  quickStatLabel: { display: 'block', fontSize: '0.85rem', color: '#047857', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' },
  quickStatValue: { display: 'block', fontSize: '2.4rem', color: '#059669', fontWeight: '800', letterSpacing: '-1px', lineHeight: '1' },

  // UNIFIED CANVAS
  unifiedCanvas: { 
    backgroundColor: '#ffffff', 
    borderRadius: '20px', 
    border: '1px solid #e2e8f0', 
    boxShadow: '0 10px 40px -10px rgba(5, 150, 105, 0.08)', // subtle green shadow
    padding: '40px 50px',
    display: 'flex',
    flexDirection: 'column'
  },

  scopeBanner: { 
    backgroundColor: '#f0fdf4', 
    padding: '16px 20px', 
    borderRadius: '12px', 
    marginBottom: '35px', 
    display: 'flex', 
    gap: '10px', 
    alignItems: 'center', 
    border: '1px solid #a7f3d0' 
  },
  scopeLabel: { fontWeight: '700', fontSize: '0.85rem', color: '#047857', textTransform: 'uppercase', letterSpacing: '0.5px' },
  scopeText: { fontSize: '0.95rem', color: '#064e3b', fontWeight: '600' },

  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' },
  card: { backgroundColor: '#ffffff', padding: '30px', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
  cardTitle: { margin: '0 0 6px 0', fontSize: '1.4rem', fontWeight: '600', letterSpacing: '-0.5px' },
  cardSub: { margin: 0, fontSize: '0.9rem', color: '#64748b' },
  countBadge: { padding: '6px 14px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '700' },
  
  // SCROLLING TABLE CONTAINER
  tableWrapper: { flexGrow: 1, maxHeight: '350px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '25px', backgroundColor: '#f8fafc' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' },
  th: { padding: '12px 16px', backgroundColor: '#f1f5f9', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 1 },
  tr: { borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff' },
  td: { padding: '10px 16px', color: '#334155', borderBottom: '1px solid #f1f5f9' },
  emptyText: { color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic', padding: '20px', textAlign: 'center' },

  secondaryBtn: { padding: '14px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem', width: '100%', transition: 'all 0.2s ease', marginTop: 'auto' },
  
  bottomSection: { textAlign: 'center', marginTop: '10px' },
  divider: { height: '1px', backgroundColor: '#e2e8f0', width: '100%', marginBottom: '35px' },
  
  // PRIMARY EMERALD CTA
  ctaButton: { 
    background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', 
    border: 'none', 
    color: '#ffffff', 
    padding: '16px 40px', 
    borderRadius: '12px', 
    cursor: 'pointer', 
    fontWeight: '600', 
    fontSize: '1rem', 
    boxShadow: '0 8px 20px rgba(5, 150, 105, 0.25)', 
    transition: 'transform 0.1s ease' 
  }
};