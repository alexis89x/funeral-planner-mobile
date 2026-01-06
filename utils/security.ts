/**
 * Security utility functions for API requests
 */

interface ChecksumResult {
  ts: string;
  cs: string;
}

/**
 * Get a random integer between min and max (inclusive)
 */
const getRandomIntInclusive = (min: number, max: number): number => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Calculate checksum for security headers
 * Returns timestamp and checksum values
 */
export const getCsm = (sum?: number): ChecksumResult => {
  const rnd = getRandomIntInclusive(3, 9);
  const realSum = sum || getRandomIntInclusive(11, 19);
  const chk = Math.pow(realSum, 3) - rnd * rnd;
  const chkStr = chk.toString().padStart(4, '0');
  const t = new Date().getTime().toString();

  // Create timestamp with random and sum
  const t1 = t.substring(0, t.length - 3) + rnd + realSum;

  // Create checksum timestamp
  const t2 = t.substring(0, t.length - 4) + chkStr;

  return {
    ts: t1,
    cs: t2,
  };
};

/**
 * Get security headers for API requests
 */
export const getSecurityHeaders = (token?: string): Record<string, string> => {
  const csm = getCsm();

  return {
    'X-apmb': 'version', // Tell that we're on our mobile app
    'X-ipac': token || '',
    'X-iptc': csm.cs,
    'X-ipts': csm.ts,
  };
};
