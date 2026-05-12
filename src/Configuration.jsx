import React, { useState } from 'react';

// The data you provided, cleaned up into a JSON array
const initialConfigData = [
  { id: 1, category: 'Authorizations', parameter: 'TABLE_AUTH_CHECK', defaultVal: 'S_TABU_DIS', currentVal: 'S_TABU_DIS', desc: 'Auth. Object to be used for Table Maintenance' },
  { id: 2, category: 'FIORI', parameter: 'FIORI_CATALOG_TCODES', defaultVal: 'Y', currentVal: 'Y', desc: 'Include Transactions when adding Services to a Role' },
  { id: 3, category: 'FIORI', parameter: 'FIORI_INSTALLATION', defaultVal: 'N', currentVal: 'Y', desc: 'Deployment scenarios for Fiori Installation' },
  { id: 4, category: 'FIORI', parameter: 'FIORI_TRANSPORT', defaultVal: '', currentVal: 'DHAK900990', desc: 'Transport for FIORI components' },
  { id: 5, category: 'FIORI', parameter: 'SOURCE_AUTH_RFC', defaultVal: '', currentVal: '', desc: 'System for User Authorization for Fiori Role' },
  { id: 6, category: 'FIORI', parameter: 'SYS_SOURCE_RFC', defaultVal: '', currentVal: '', desc: 'System to fetch Catalog TADIR data and User Service history' },
  { id: 7, category: 'FIORI', parameter: 'SYS_TRAN_SOURCE', defaultVal: '', currentVal: '', desc: 'System for Transaction History for GUI Tiles' },
  { id: 8, category: 'Master Data', parameter: 'DEF_LICENSE_FILE', defaultVal: '', currentVal: '1.9(WITH TEST DTA)', desc: 'Default License File used in FUE Calculation' },
  { id: 9, category: 'Master Data', parameter: 'DEF_TEXT_LANGUAGE', defaultVal: 'EN', currentVal: 'EN', desc: 'Transaction Code Text language' },
  { id: 10, category: 'Master Data', parameter: 'ID_BUS_UNIT_LENGTH', defaultVal: '3', currentVal: '4', desc: 'Business Unit ID Character Length' },
  { id: 11, category: 'Master Data', parameter: 'ID_DEPARTMENT_LENGTH', defaultVal: '3', currentVal: '4', desc: 'Department ID Character Length' },
  { id: 12, category: 'Master Data', parameter: 'ID_JOB_ABBREV_LENGTH', defaultVal: '16', currentVal: '14', desc: 'Position character length' },
  { id: 13, category: 'Master Data', parameter: 'TCODE_IMPORT_INFO_SE', defaultVal: 'AA', currentVal: 'AA', desc: 'Use SE or RM for Transaction Sensitivity' },
  { id: 14, category: 'Migration', parameter: 'FIORI_ROLE_SPLIT', defaultVal: 'Y', currentVal: 'Y', desc: 'If Fiori objects placed in GUI objects or in a new Role' },
  { id: 15, category: 'Migration', parameter: 'FIORI_TR_MIGR', defaultVal: '', currentVal: 'DHAK900925', desc: 'Transport for FIORI components' },
  { id: 16, category: 'Migration', parameter: 'MIGRATION_ROLE_CHAR', defaultVal: '', currentVal: 'ZPM', desc: 'Leading Characters Replacement of Donor Role' },
  { id: 17, category: 'Migration', parameter: 'MIGRATION_SOURCE', defaultVal: '', currentVal: '', desc: 'RFC destination to where roles are read from' },
  { id: 18, category: 'Migration', parameter: 'MIGRATION_TARGET', defaultVal: '', currentVal: 'D67_800_RM', desc: 'RFC destination to where new roles are to be created' },
  { id: 19, category: 'Migration', parameter: 'PROPOSE_SPACE_PAGE', defaultVal: 'N', currentVal: 'Y', desc: 'If Fiori Space and Page Creation include in Migrated Role' },
  { id: 20, category: 'Org Level', parameter: 'MASTER_ROLE_ORG_CHAR', defaultVal: '~', currentVal: '?', desc: 'Character used in Org Levels when creating a Master Role' },
  { id: 21, category: 'Org Level', parameter: 'ORG_LEVEL_DEFINITION', defaultVal: 'B', currentVal: 'B', desc: 'Org Level Definition at Business Unit or Department Level' },
  { id: 22, category: 'Org Level', parameter: 'ORG_LEVEL_DIFF_CHK', defaultVal: 'Y', currentVal: 'Y', desc: 'Enable User vs RM definition checking of Org Levels' },
  { id: 23, category: 'Org Level', parameter: 'ORG_LEVEL_VALIDATION', defaultVal: 'Y', currentVal: 'Y', desc: 'Check to validate if Org Levels exist when defined in RM' },
  { id: 24, category: 'Role Creation', parameter: 'ALL_USER_ROLE', defaultVal: '', currentVal: '/PSYNG/RM_ADMINISTRATOR', desc: 'Role used in ALL Composite Roles' },
  { id: 25, category: 'Role Creation', parameter: 'ALL_USER_ROLE_EXC', defaultVal: 'N', currentVal: 'N', desc: 'Excludes the All-User Role from the Position Composite Role' },
  { id: 26, category: 'Role Creation', parameter: 'ALL_USER_ROLE_READ', defaultVal: 'Y', currentVal: 'N', desc: 'Access User authorizations from All User Role' },
  { id: 27, category: 'Role Creation', parameter: 'ALLOW_USER_CHANGES', defaultVal: 'N', currentVal: 'N', desc: 'Allow User assignment changes' },
  { id: 28, category: 'Role Creation', parameter: 'ANALYSIS_JOB_DAYS', defaultVal: '30', currentVal: '30', desc: 'Days per iteration for Analysis Job' },
  { id: 29, category: 'Role Creation', parameter: 'ANONYMOUS_ANALYSIS', defaultVal: 'Y', currentVal: 'N', desc: 'Is User Analysis performed Anonymously' },
  { id: 30, category: 'Role Creation', parameter: 'BUS_DEPT_LEN_OBL', defaultVal: 'N', currentVal: 'N', desc: 'Is Business Unit/Department length obligatory' },
  { id: 31, category: 'Role Creation', parameter: 'DEF_ANALYSIS_MONTHS', defaultVal: '6', currentVal: '6', desc: 'Number of Months to Analyze by Default' },
  { id: 32, category: 'Role Creation', parameter: 'MULTIPLE_APPROVALS', defaultVal: 'N', currentVal: 'Y', desc: 'Enable Multiple Approvals for Role Creation' },
  { id: 33, category: 'Role Creation', parameter: 'QAS_CHECK_REQUIRED', defaultVal: 'N', currentVal: 'N', desc: 'Is QAS Check mandatory or optional' },
  { id: 34, category: 'Role Creation', parameter: 'QAS_ROLE_BLOCK', defaultVal: 'N', currentVal: 'Y', desc: 'Is Minimum Threshold Score relevant for Role Creation' },
  { id: 35, category: 'Role Creation', parameter: 'QAS_THRESHOLD_SCORE', defaultVal: '90', currentVal: '90', desc: 'Minimum Value Required for Role Quality Score' },
  { id: 36, category: 'Role Creation', parameter: 'ROLE_DATE_FORMAT', defaultVal: '1', currentVal: '1', desc: 'Date Format used in Role Creation Long Text' },
  { id: 37, category: 'Role Creation', parameter: 'ROLE_DELETE_ALLOWED', defaultVal: 'N', currentVal: 'Y', desc: 'Is Deletion Activity allowed in Maintain Roles' },
  { id: 38, category: 'Role Creation', parameter: 'SOD_CHECK_REQUIRED', defaultVal: 'N', currentVal: 'Y', desc: 'Is an SoD Check mandatory or optional' },
  { id: 39, category: 'Role Creation', parameter: 'STORE_FIORI_ANALYSIS', defaultVal: 'N', currentVal: 'Y', desc: 'Fetch and save Fiori usage history' },
  { id: 40, category: 'Role Creation', parameter: 'TOGGLE_AUTH_CHECKS', defaultVal: 'Y', currentVal: 'Y', desc: 'Manual Proposal allowed' },
  { id: 41, category: 'Role Name', parameter: 'PDF_SEPARATOR_CHAR', defaultVal: '-', currentVal: '_', desc: 'Separator used in PDF Naming' },
  { id: 42, category: 'Role Name', parameter: 'PERSONAL_ROLE_TEXT', defaultVal: 'Personal Role for:', currentVal: 'zrm', desc: 'Personal Role description' },
  { id: 43, category: 'Role Name', parameter: 'ROLE_ID_CHAR_LENGTH', defaultVal: '3', currentVal: '3', desc: 'Role ID character length' },
  { id: 44, category: 'Role Name', parameter: 'ROLE_ID_COMPOSITES', defaultVal: 'ZPC', currentVal: 'ZPC', desc: 'Composite Role Identifier Characters' },
  { id: 45, category: 'Role Name', parameter: 'ROLE_ID_DERIVED', defaultVal: 'ZPD', currentVal: 'ZPD', desc: 'Derived Role Identifier Characters' },
  { id: 46, category: 'Role Name', parameter: 'ROLE_ID_MASTER', defaultVal: 'YPM', currentVal: 'YPM', desc: 'Master Role Identifier Characters' },
  { id: 47, category: 'Role Name', parameter: 'ROLE_ID_PERSONAL', defaultVal: 'XPS', currentVal: 'XPS', desc: 'Personal Role identifier characters' },
  { id: 48, category: 'Role Name', parameter: 'ROLE_ID_SINGLES', defaultVal: 'ZPS', currentVal: 'ZPS', desc: 'Single Role Identifier Characters' },
  { id: 49, category: 'Role Name', parameter: 'ROLE_SEPARATOR_CHAR', defaultVal: '_', currentVal: '_', desc: 'Separator used in Role Naming' },
  { id: 50, category: 'System Info', parameter: 'LANDSCAPE_LENGTH', defaultVal: '3', currentVal: '3', desc: 'Landscape Character Length' },
  { id: 51, category: 'System Info', parameter: 'SYS_SOURCE_RELEASE', defaultVal: '', currentVal: '', desc: 'BASIS Release of Source System' },
  { id: 52, category: 'System Info', parameter: 'SYS_TARGET_RELEASE', defaultVal: '', currentVal: '', desc: 'BASIS Release of Target System' },
  { id: 53, category: 'System RFC', parameter: 'SYS_TARGET_RFC', defaultVal: '', currentVal: '', desc: 'System in which Roles are to be created' },
  { id: 54, category: 'System RFC', parameter: 'USER_CREATE_RFC', defaultVal: '', currentVal: '', desc: 'RFC used for User creation' },
  { id: 55, category: 'Testing', parameter: 'AT_TRACE_DUMMY_VAL', defaultVal: 'N', currentVal: 'N', desc: 'Place * in blank fields during Role append' },
  { id: 56, category: 'Testing', parameter: 'AT_TRACE_TYPE', defaultVal: 'U', currentVal: 'U', desc: 'Trace type for Automatic Testing' },
  { id: 57, category: 'Testing', parameter: 'CUA_RECEIVING_SYS', defaultVal: '', currentVal: '', desc: 'Receiving system for assigned Roles' },
  { id: 58, category: 'Testing', parameter: 'DEFAULT_USER_GRP', defaultVal: '', currentVal: 'ZZZ', desc: 'Default User group in Reference User' },
  { id: 59, category: 'Testing', parameter: 'SAFE_GOLIVE_APPROVER', defaultVal: '', currentVal: 'ZGUSER_1', desc: 'Safe Go-Live Approver If No Approver Is Maintained' },
  { id: 60, category: 'Testing', parameter: 'SAFE_GOLIVE_PERIOD', defaultVal: '7', currentVal: '3', desc: 'No. Of Days for Access' },
  { id: 61, category: 'Testing', parameter: 'SAVE_BLANK_TCODE', defaultVal: 'Y', currentVal: 'Y', desc: 'Exclude records with blank Transactions in Trace' },
  { id: 62, category: 'Testing', parameter: 'STORE_AUTH_FAIL_CHK', defaultVal: 'N', currentVal: 'Y', desc: 'Store Authorization Failure Check' },
  { id: 63, category: 'Testing', parameter: 'SYS_FACTORY_CALENDAR', defaultVal: '', currentVal: '', desc: 'Factory Calendar to be used in RM' },
  { id: 64, category: 'Testing', parameter: 'TCODE_IMPORT_RULESET', defaultVal: '000', currentVal: '093', desc: 'Ruleset ID for SoD Checks' },
  { id: 65, category: 'Testing', parameter: 'TEST_DAYS_AT', defaultVal: '90', currentVal: '90', desc: 'Days assigned for Automatic Testing' },
  { id: 66, category: 'Testing', parameter: 'TEST_DAYS_UT', defaultVal: '7', currentVal: '7', desc: 'Days allocated for Unit Testing' },
  { id: 67, category: 'Testing', parameter: 'TEST_METHOD_CHG', defaultVal: 'Y', currentVal: 'Y', desc: 'Controls if UAT method can be changed on Role Level' },
  { id: 68, category: 'Testing', parameter: 'TEST_METHOD_UAT', defaultVal: 'AT', currentVal: 'AT', desc: 'Method used to perform User Acceptance Testing' },
  { id: 69, category: 'Testing', parameter: 'UPD_TRACE_ALL', defaultVal: 'N', currentVal: 'N', desc: 'Allow all updates to Role - ITS' },
  { id: 70, category: 'Testing', parameter: 'UT_CHECK_FEB', defaultVal: 'N', currentVal: 'Y', desc: 'Unit Testing enabled for FEB' },
  { id: 71, category: 'Testing', parameter: 'UT_CHECK_MANDATORY', defaultVal: 'N', currentVal: 'N', desc: 'Is Unit Test mandatory for Composite/Derived Role creation' },
  { id: 72, category: 'Testing', parameter: 'UT_PASS_PERCENT', defaultVal: '100', currentVal: '100', desc: 'Percentage of Transactions that must pass Testing' },
  { id: 73, category: 'Ticket Number', parameter: 'CHNG_TICKET_CONFIG', defaultVal: 'N', currentVal: 'N', desc: 'Is a change ticket mandatory when changing Config' },
  { id: 74, category: 'Ticket Number', parameter: 'CHNG_TICKET_ROLE_CRE', defaultVal: 'N', currentVal: 'Y', desc: 'Is a change ticket mandatory when creating a Role' },
  { id: 75, category: 'Ticket Number', parameter: 'GLOBAL_TICKET_NO', defaultVal: '', currentVal: 'RM_ZG0001', desc: 'Global ticket number for Role creation' },
  { id: 76, category: 'Workflow', parameter: 'WF_APP_ROLE_ASSIGN', defaultVal: 'N', currentVal: 'Y', desc: 'Is Approval Req. for Role Assignment' },
  { id: 77, category: 'Workflow', parameter: 'WF_APP_ROLE_BUILD', defaultVal: 'N', currentVal: 'Y', desc: 'Is Approval Req. for Role Building' },
  { id: 78, category: 'Workflow', parameter: 'WF_APP_ROLE_TRACE', defaultVal: 'N', currentVal: 'Y', desc: 'Is Approval Req. for Role Update due to Trace Failure?' }
];

export default function Configuration({ onNavigate }) {
  const [data, setData] = useState(initialConfigData);
  const [newValues, setNewValues] = useState({});

  const handleValueChange = (id, val) => {
    setNewValues(prev => ({ ...prev, [id]: val }));
  };

  const handleSave = (id) => {
    alert(`Configuration Saved Successfully!\nNew Value applied.`);
    // In a real app, you would dispatch to backend here.
    setData(prev => prev.map(item => {
      if (item.id === id && newValues[id] !== undefined) {
        return { ...item, currentVal: newValues[id] };
      }
      return item;
    }));
    // Clear the unsaved draft
    const updatedDrafts = { ...newValues };
    delete updatedDrafts[id];
    setNewValues(updatedDrafts);
  };

  return (
    <div style={styles.container}>
      {/* TOP NAVIGATION BAR (Matches Dashboard) */}
      <div style={styles.topNav}>
        <div style={{fontWeight: '700', fontSize: '1.2rem', color: '#064e3b'}}>Pathlock Nexus</div>
        <div style={{display: 'flex', gap: '20px'}}>
          <button style={styles.navBtn} onClick={() => onNavigate && onNavigate('dashboard')}>Optimization Map</button>
          <button style={styles.navBtn} onClick={() => onNavigate && onNavigate('configuration')}>Configuration</button>
         <button style={styles.navBtn} onClick={() => onNavigate && onNavigate('masterData')}>Master Data</button>
         <button style={styles.navBtn} onClick={() => alert("Utilities coming soon")}>Utilities</button>
        </div>
      </div>

      <div style={styles.heroHeaderCard}>
        <div style={styles.brandBox}>
          <div style={styles.eyebrowBadge}>System Management</div>
          <h1 style={styles.heroTitle}>Master <span style={styles.heroAccent}>Configuration</span></h1>
          <p style={styles.heroSubtitle}>View and modify global application parameters and default behaviors.</p>
        </div>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Parameter</th>
              <th style={styles.th}>Description</th>
              <th style={styles.th}>Default</th>
              <th style={styles.th}>Current Value</th>
              <th style={styles.th}>New Value</th>
              <th style={{...styles.th, width: '80px', textAlign: 'center'}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} style={styles.tr}>
                <td style={styles.td}><span style={styles.catBadge}>{row.category}</span></td>
                <td style={{...styles.td, fontWeight: '600', color: '#0f172a'}}>{row.parameter}</td>
                <td style={{...styles.td, color: '#64748b', fontSize: '0.8rem'}}>{row.desc}</td>
                <td style={styles.td}><span style={styles.valBadge}>{row.defaultVal || '--'}</span></td>
                <td style={styles.td}><span style={{...styles.valBadge, backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0'}}>{row.currentVal || '--'}</span></td>
                <td style={styles.td}>
                  <input 
                    type="text" 
                    value={newValues[row.id] !== undefined ? newValues[row.id] : ''} 
                    onChange={(e) => handleValueChange(row.id, e.target.value)}
                    placeholder="Enter new..."
                    style={styles.inputField}
                  />
                </td>
                <td style={{...styles.td, textAlign: 'center'}}>
                  <button 
                    onClick={() => handleSave(row.id)} 
                    style={{...styles.saveBtn, opacity: newValues[row.id] !== undefined && newValues[row.id] !== '' ? 1 : 0.5}}
                    disabled={newValues[row.id] === undefined || newValues[row.id] === ''}
                  >
                    💾 Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '0 60px 80px 60px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: '"Inter", -apple-system, sans-serif' },
  topNav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', marginBottom: '20px', borderBottom: '1px solid #e2e8f0' },
  navBtn: { background: 'none', border: 'none', color: '#64748b', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', padding: '8px 12px', transition: 'color 0.2s ease' },
  navBtnActive: { background: '#ecfdf5', border: 'none', color: '#047857', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer', padding: '8px 16px', borderRadius: '8px' },
  
  heroHeaderCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)', padding: '35px 45px', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(4, 120, 87, 0.2)', marginBottom: '35px', position: 'relative', overflow: 'hidden' },
  brandBox: { display: 'flex', flexDirection: 'column', maxWidth: '800px', position: 'relative', zIndex: 2 },
  eyebrowBadge: { display: 'inline-block', padding: '6px 14px', backgroundColor: 'rgba(209, 250, 229, 0.15)', color: '#a7f3d0', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', width: 'fit-content', border: '1px solid rgba(167, 243, 208, 0.3)' },
  heroTitle: { color: '#ffffff', margin: '0 0 8px 0', fontSize: '2.4rem', fontWeight: '600', letterSpacing: '-0.5px' },
  heroAccent: { color: '#34d399', fontWeight: '700' },
  heroSubtitle: { margin: 0, fontSize: '1rem', color: '#d1fae5', lineHeight: '1.6', fontWeight: '400' },

  tableWrapper: { borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', backgroundColor: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', maxHeight: '650px', overflowY: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' },
  th: { padding: '16px 20px', backgroundColor: '#f8fafc', color: '#475569', fontWeight: '600', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 1 },
  tr: { borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s ease' },
  td: { padding: '12px 20px', verticalAlign: 'middle', color: '#334155' },
  
  catBadge: { backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600' },
  valBadge: { fontFamily: 'monospace', fontWeight: '600', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', color: '#334155' },
  
  inputField: { padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', width: '120px', outline: 'none', transition: 'border-color 0.2s ease' },
  saveBtn: { background: '#ffffff', border: '1px solid #e2e8f0', color: '#047857', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '4px' }
};