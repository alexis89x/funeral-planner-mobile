export interface GatewayError {
  type: string;
  message: string;
}

export interface GatewayResponse {
  error?: boolean | string | GatewayError;
  message?: string;
  result?: string;
  count?: number;
  total?: number;
  data?: any;
  per_page?: number;
  page?: number;
  total_pages?: number;
  status?: number;
}

const ERROR_TRANSLATIONS: Record<string, string> = {
  AUTHORIZATION: 'Non sei autorizzato ad eseguire questa azione',
  CONFIRMATION_PARAM: 'I parametri indicati non sono corretti',
  GENERIC: 'Si è verificato un errore',
  NO_MATCH_EMAIL: 'Le e-mail non coincidono',
  NO_MATCH_PSW: 'Le password non coincidono',
  OBJECT_ALREADY_EXISTS: 'Oggetto già esistente',
  OBJECT_DOES_NOT_EXIST: "L'oggetto richiesto non esiste",
  PARAM_ERROR: 'Parametri non validi',
  PARAM_INVALID_EMAIL: 'E-mail non valida',
  PARAM_INVALID_ID: 'Identificativo non valido',
  PARAM_INVALID_PSW: 'Password non valida',
  PARAM_INVALID_ROLE: 'Ruolo non valido',
  PLAN_NO_FUNERAL_OPERATOR: 'Il piano non ha una onoranza funebre associata.',
  PSW_OLD_REQUIRED: 'La vecchia password è obbligatoria',
  PSW_OLD_WRONG: 'La vecchia password è errata',
  PSW_TOKEN_EXPIRED: 'Il link per reimpostare la password è scaduto. Richiedine uno nuovo.',
  'RATE-LIMIT-1HOUR': 'Hai superato il limite di richieste. Riprova tra 1 ora.',
  'RATE-LIMIT-5MIN': 'Hai superato il limite di richieste. Riprova tra 5 minuti.',
  'RATE-LIMITED': 'Hai superato il limite di richieste. Riprova più tardi.',
  SESSION_EXPIRED: 'Sessione scaduta',
  TOKEN_MALFORMED: 'I dati indicati non sono validi',
  TOKEN_NOT_VALID: "Sessione scaduta. Si prega di effettuare nuovamente l'accesso.",
  'USER-DOES-NOT-EXIST': "L'utente non esiste",
  'USERNAME-RATE-LIMIT-1HOUR': 'Hai superato il limite di richieste per il nome utente. Riprova tra 1 ora.',
  'USERNAME-RATE-LIMIT-5MIN': 'Hai superato il limite di richieste per il nome utente. Riprova tra 5 minuti.',
  USER_ALREADY_ACTIVE: "L'utente è già stato attivato",
  USER_ALREADY_EXIST: 'Esiste già un utente registrato con questa e-mail.',
  USER_NOT_ACTIVE: 'Utente non attivo',
  USER_NOT_AUTHORIZED: 'Utente non autorizzato',
  WRONG_LOGIN: 'Dati di accesso non validi',
  UPLOAD_WRONG_TYPE: 'Tipo di file non supportato.',
  UPLOAD_TOO_LARGE: 'Il file supera la dimensione massima consentita.',
  UPLOAD_FAILED: 'Caricamento fallito. Riprova.',
  NOT_FOUND: 'Risorsa non trovata.',
  SERVER_ERROR: 'Errore del server. Riprova più tardi.',
};

export function extractApiErrorMessage(
  responseData: GatewayResponse | any,
  fallback = 'Si è verificato un errore imprevisto.'
): string {
  if (!responseData) return fallback;

  const { error, message } = responseData;

  if (error && typeof error === 'object' && !Array.isArray(error)) {
    const typed = error as GatewayError;
    if (typed.type && ERROR_TRANSLATIONS[typed.type]) return ERROR_TRANSLATIONS[typed.type];
    return typed.message || fallback;
  }

  if (typeof error === 'string' && error) return error;
  if (typeof message === 'string' && message) return message;

  return fallback;
}