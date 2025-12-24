/**
 * HTTP Request/Response Logger
 * Logs detailed information about fetch requests for debugging
 */

import { appendLogToFile } from './file-logger';

interface LogEntry {
  timestamp: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: any;
  formDataEntries?: Array<[string, string]>;
  response?: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: any;
  };
  error?: any;
}

const logs: LogEntry[] = [];

/**
 * Log FormData entries
 */
export const logFormData = (formData: FormData, label: string = 'FormData') => {
  console.log(`\n========== ${label} ==========`);
  const entries: Array<[string, string]> = [];
  let logMessage = `\n========== ${label} ==========\n`;

  // @ts-ignore - FormData.entries() exists
  for (const pair of formData.entries()) {
    const key = pair[0];
    const value = pair[1];
    entries.push([key, String(value)]);
    const line = `${key}: ${value}`;
    console.log(line);
    logMessage += line + '\n';
  }
  console.log(`========== End ${label} ==========\n`);
  logMessage += `========== End ${label} ==========\n`;

  // Write to file
  appendLogToFile(logMessage);

  return entries;
};

/**
 * Log HTTP Request
 */
export const logRequest = (
  method: string,
  url: string,
  options: RequestInit
): LogEntry => {
  const timestamp = new Date().toISOString();

  let logMessage = `\n========== HTTP REQUEST ==========\n`;
  logMessage += `[${timestamp}]\n`;
  logMessage += `Method: ${method}\n`;
  logMessage += `URL: ${url}\n`;

  console.log(logMessage);

  // Log headers
  console.log(`\nHeaders:`);
  logMessage += `\nHeaders:\n`;
  const headers: Record<string, string> = {};
  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      headers[key] = String(value);
      const line = `  ${key}: ${value}`;
      console.log(line);
      logMessage += line + '\n';
    });
  }

  // Log body
  let formDataEntries: Array<[string, string]> | undefined;
  if (options.body instanceof FormData) {
    console.log(`\nBody (FormData):`);
    logMessage += `\nBody (FormData):\n`;
    formDataEntries = logFormData(options.body, 'Request Body');
  } else if (options.body) {
    console.log(`\nBody:`);
    console.log(options.body);
    logMessage += `\nBody:\n${options.body}\n`;
  }

  console.log(`========== END HTTP REQUEST ==========\n`);
  logMessage += `========== END HTTP REQUEST ==========\n`;

  // Write to file
  appendLogToFile(logMessage);

  const logEntry: LogEntry = {
    timestamp,
    method,
    url,
    headers,
    body: options.body instanceof FormData ? '[FormData]' : options.body,
    formDataEntries,
  };

  logs.push(logEntry);
  return logEntry;
};

/**
 * Log HTTP Response
 */
export const logResponse = async (
  logEntry: LogEntry,
  response: Response,
  responseData?: any
) => {
  const timestamp = new Date().toISOString();

  console.log(`\n========== HTTP RESPONSE ==========`);
  console.log(`[${timestamp}]`);
  console.log(`Status: ${response.status} ${response.statusText}`);
  console.log(`URL: ${response.url}`);

  // Log response headers
  console.log(`\nResponse Headers:`);
  const responseHeaders: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    responseHeaders[key] = value;
    console.log(`  ${key}: ${value}`);
  });

  // Log response body
  console.log(`\nResponse Body:`);
  console.log(JSON.stringify(responseData, null, 2));

  console.log(`========== END HTTP RESPONSE ==========\n`);

  logEntry.response = {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
    body: responseData,
  };
};

/**
 * Log HTTP Error
 */
export const logError = (logEntry: LogEntry, error: any) => {
  const timestamp = new Date().toISOString();

  console.log(`\n========== HTTP ERROR ==========`);
  console.log(`[${timestamp}]`);
  console.log(`Error:`, error);
  console.log(`Error Message:`, error.message);
  console.log(`Error Stack:`, error.stack);
  console.log(`========== END HTTP ERROR ==========\n`);

  logEntry.error = {
    message: error.message,
    stack: error.stack,
    ...error,
  };
};

/**
 * Get all logs
 */
export const getLogs = () => logs;

/**
 * Clear logs
 */
export const clearLogs = () => {
  logs.length = 0;
};

/**
 * Export logs to string
 */
export const exportLogs = () => {
  return JSON.stringify(logs, null, 2);
};

/**
 * Generate curl command from request
 */
export const generateCurl = (logEntry: LogEntry): string => {
  let curl = `curl '${logEntry.url}' \\\n`;

  // Add headers
  Object.entries(logEntry.headers).forEach(([key, value]) => {
    curl += `  -H '${key}: ${value}' \\\n`;
  });

  // Add method
  curl += `  -X ${logEntry.method} \\\n`;

  // Add body
  if (logEntry.formDataEntries) {
    curl += `  --form-data-entries:\n`;
    logEntry.formDataEntries.forEach(([key, value]) => {
      curl += `    ${key}=${value}\n`;
    });
  } else if (logEntry.body) {
    curl += `  --data '${logEntry.body}'`;
  }

  return curl;
};
