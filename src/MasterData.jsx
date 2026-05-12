import React, { useState } from 'react';

// Reordered and categorized based on the SAP GUI screenshot
const masterDataCategories = [
  {
    title: "Company & Organization Data",
    items: [
      { name: "Configure Business Unit Data", icon: "🏢", desc: "Manage enterprise business units and ID lengths." },
      { name: "Configure Department Data", icon: "📁", desc: "Define department hierarchies and mappings." },
      { name: "Configure Positions Data", icon: "🧑‍💼", desc: "Maintain job titles and user profiles." },
      { name: "Positions Mapping", icon: "🔗", desc: "Map positions to specific organizational units." },
      { name: "Define Organization Levels", icon: "📍", desc: "Set up authorization organization levels." }
    ]
  },
  {
    title: "Transaction & Fiori Configuration",
    items: [
      { name: "Configure Transaction Data", icon: "⚡", desc: "Manage the standard SAP transaction library." },
      { name: "Configure Replacement TCodes", icon: "🔄", desc: "Set up mappings for obsolete to new transactions." },
      { name: "Populate Customer Fiori Data", icon: "📱", desc: "Sync custom Fiori tiles, spaces, and catalogs." },
      { name: "Additional Fiori Services", icon: "🧩", desc: "Manage supplementary Fiori OData services." }
    ]
  },
  {
    title: "Security & Authorization Rules",
    items: [
      { name: "Configure Activity Fields", icon: "⚙️", desc: "Define standard activity field authorization values." },
      { name: "Configure Sensitive Objects", icon: "🛡️", desc: "Manage critical and highly sensitive authorization objects." },
      { name: "Define Role Exclusion", icon: "🚫", desc: "Set up mutually exclusive roles and assignment rules." },
      { name: "Configure Template Data", icon: "📋", desc: "Maintain base templates used for role generation." }
    ]
  },
  {
    title: "Taxonomy & Mapping",
    items: [
      { name: "Configure Folder Mapping", icon: "📂", desc: "Map specific roles to PFCG menu folders." },
      { name: "Configure Taxonomy Elements", icon: "🗂️", desc: "Define taxonomy levels and classification categories." },
      { name: "Define Transaction Taxonomy Data", icon: "📊", desc: "Link SAP transactions to your taxonomy elements." }
    ]
  },
  {
    title: "Data Operations (Import / Export)",
    items: [
      { name: "Upload / Download", icon: "☁️", desc: "Import or export base Company Data." },
      { name: "Upload / Download Auth Data", icon: "🔐", desc: "Import or export Authorization rulesets and matrices." },
      { name: "Upload / Download Org. Levels", icon: "📤", desc: "Import or export Organization Level definitions." }
    ]
  }
];

// Reusable card component to handle hover states cleanly
const MasterDataCard = ({ item }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => alert(`Navigating to ${item.name}...`)}
      style={{...styles.card, ...(isHovered ? styles.cardHover : {})}}
    >
      <div style={{...styles.iconBox, ...(isHovered ? styles.iconBoxHover : {})}}>
        {item.icon}
      </div>
      <div style={styles.cardContent}>
        <h3 style={styles.cardTitle}>{item.name}</h3>
        <p style={styles.cardDesc}>{item.desc}</p>
      </div>
    </div>
  );
};

export default function MasterData({ onNavigate }) {
  return (
    <div style={styles.container}>
      {/* TOP NAVIGATION BAR */}
      <div style={styles.topNav}>
        <div style={{fontWeight: '700', fontSize: '1.2rem', color: '#064e3b'}}>Pathlock Nexus</div>
        <div style={{display: 'flex', gap: '20px'}}>
          <button style={styles.navBtn} onClick={() => onNavigate && onNavigate('dashboard')}>Optimization Map</button>
          <button style={styles.navBtn} onClick={() => onNavigate && onNavigate('configuration')}>Configuration</button>
          <button style={styles.navBtnActive}>Master Data</button>
          <button style={styles.navBtn} onClick={() => alert("Utilities coming soon")}>Utilities</button>
        </div>
      </div>

      <div style={styles.heroHeaderCard}>
        <div style={styles.brandBox}>
          <div style={styles.eyebrowBadge}>Database Management</div>
          <h1 style={styles.heroTitle}>Master Data <span style={styles.heroAccent}>Library</span></h1>
          <p style={styles.heroSubtitle}>Manage your core organizational structures, SAP rulesets, and system landscapes.</p>
        </div>
      </div>

      {/* RENDER CATEGORIES & GRIDS */}
      <div style={styles.contentWrapper}>
        {masterDataCategories.map((category, idx) => (
          <div key={idx} style={styles.categorySection}>
            <h2 style={styles.categoryTitle}>{category.title}</h2>
            <div style={styles.grid}>
              {category.items.map((item, itemIdx) => (
                <MasterDataCard key={itemIdx} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '0 60px 80px 60px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: '"Inter", -apple-system, sans-serif' },
  topNav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', marginBottom: '20px', borderBottom: '1px solid #e2e8f0' },
  navBtn: { background: 'none', border: 'none', color: '#64748b', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', padding: '8px 12px', transition: 'color 0.2s ease' },
  navBtnActive: { background: '#ecfdf5', border: 'none', color: '#047857', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer', padding: '8px 16px', borderRadius: '8px' },
  
  heroHeaderCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)', padding: '35px 45px', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(4, 120, 87, 0.2)', marginBottom: '40px', position: 'relative', overflow: 'hidden' },
  brandBox: { display: 'flex', flexDirection: 'column', maxWidth: '800px', position: 'relative', zIndex: 2 },
  eyebrowBadge: { display: 'inline-block', padding: '6px 14px', backgroundColor: 'rgba(209, 250, 229, 0.15)', color: '#a7f3d0', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', width: 'fit-content', border: '1px solid rgba(167, 243, 208, 0.3)' },
  heroTitle: { color: '#ffffff', margin: '0 0 8px 0', fontSize: '2.4rem', fontWeight: '600', letterSpacing: '-0.5px' },
  heroAccent: { color: '#34d399', fontWeight: '700' },
  heroSubtitle: { margin: 0, fontSize: '1rem', color: '#d1fae5', lineHeight: '1.6', fontWeight: '400' },

  contentWrapper: { display: 'flex', flexDirection: 'column', gap: '40px' },
  categorySection: { display: 'flex', flexDirection: 'column' },
  categoryTitle: { margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: '700', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px' },
  
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  card: { backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'flex-start', gap: '16px' },
  cardHover: { transform: 'translateY(-3px)', boxShadow: '0 10px 25px -5px rgba(4, 120, 87, 0.15)', borderColor: '#34d399' },
  
  iconBox: { fontSize: '1.8rem', backgroundColor: '#f8fafc', width: '56px', height: '56px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0, transition: 'background-color 0.2s ease' },
  iconBoxHover: { backgroundColor: '#ecfdf5' },
  
  cardContent: { display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '4px' },
  cardTitle: { margin: 0, fontSize: '1.05rem', fontWeight: '600', color: '#0f172a' },
  cardDesc: { margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: '1.4' }
};