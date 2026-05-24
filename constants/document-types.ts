export interface DocumentType {
  id: string;
  name: string;
}

export const DocumentTypes: DocumentType[] = [
  { id: 'generic', name: 'Documento generico' },
  { id: 'identity_card', name: "Carta d'identità" },
  { id: 'drivers_license', name: 'Patente di guida' },
  { id: 'passport', name: 'Passaporto' },
  { id: 'health_card', name: 'Tessera sanitaria' },
  { id: 'other_personal_documents', name: 'Altro (documenti personali)' },
  { id: 'mortgage_contract', name: 'Contratto mutuo' },
  { id: 'rent_contract', name: 'Contratto affitto' },
  { id: 'bank_postal_contracts', name: 'Contratti bancari e/o postali' },
  { id: 'insurance_contracts', name: 'Contratti assicurativi' },
  { id: 'real_estate_contracts', name: 'Contratti immobiliari' },
  { id: 'medical_documents', name: 'Documenti clinici' },
  { id: 'other_contracts', name: 'Altri contratti' },
  { id: 'pension_booklet', name: 'Libretto pensione' },
  { id: 'will', name: 'Testamento' },
  { id: 'living_will', name: 'Testamento biologico' },
  { id: 'other_documents_objects', name: 'Altro (documenti e oggetti vari)' },
  { id: 'bank_account_number', name: 'Numero di conto corrente (banca)' },
  { id: 'bank', name: 'Banca' },
  { id: 'bank_branch_address', name: 'Indirizzo filiale' },
  { id: 'postal_account_number', name: 'Numero di conto corrente (posta)' },
  { id: 'post_office', name: 'Posta' },
  { id: 'post_office_branch_address', name: 'Indirizzo filiale (posta)' },
  { id: 'insurance_type', name: 'Tipo di assicurazione' },
  { id: 'insurance_contract_number', name: 'Numero di contratto' },
  { id: 'insurance_company_address', name: 'Compagnia assicurativa e indirizzo agenzia' },
  { id: 'pension_fund_contract_number', name: 'Numero di contratto (fondo pensione)' },
  { id: 'pension_fund_manager_address', name: 'Gestore e indirizzo' },
  { id: 'safe_deposit_box_contract', name: 'Contratto n. (cassette di sicurezza)' },
  { id: 'safe_deposit_box_bank', name: 'Banca (cassette di sicurezza)' },
  { id: 'safe_deposit_box_branch_address', name: 'Indirizzo filiale (cassette di sicurezza)' },
  { id: 'property_deed', name: 'Atto di proprietà' },
  { id: 'other_real_estate', name: 'Altro (proprietà immobiliari)' },
  { id: 'online_accounts_passwords', name: 'Password di accesso a servizi' },
  { id: 'smartphone_unlock_code', name: 'Codice sblocco smartphone' },
  { id: 'important_contacts', name: 'Contatti importanti' },
].sort((a, b) => {
  if (a.id === 'generic') return -1;
  if (b.id === 'generic') return 1;
  return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
});

export const getDocumentTypeDesc = (key: string): string =>
  DocumentTypes.find(d => d.id === key)?.name || key;
