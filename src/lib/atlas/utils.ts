import crypto from 'crypto';

/**
 * Generate a secure random password for Atlas database users.
 * Password meets Atlas requirements:
 * - At least 10 characters
 * - Contains uppercase, lowercase, numbers, and special characters
 */
export function generateSecurePassword(length: number = 24): string {
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Excludes I, O for readability
  const lowercase = 'abcdefghjkmnpqrstuvwxyz'; // Excludes i, l, o for readability
  const numbers = '23456789'; // Excludes 0, 1 for readability
  const special = '!@#$%^&*-_=+';

  // Ensure at least one of each required character type
  let password = '';
  password += uppercase[crypto.randomInt(uppercase.length)];
  password += lowercase[crypto.randomInt(lowercase.length)];
  password += numbers[crypto.randomInt(numbers.length)];
  password += special[crypto.randomInt(special.length)];

  // Fill the rest with random characters from all sets
  const allChars = uppercase + lowercase + numbers + special;
  for (let i = 4; i < length; i++) {
    password += allChars[crypto.randomInt(allChars.length)];
  }

  // Shuffle the password to avoid predictable patterns
  return password
    .split('')
    .sort(() => crypto.randomInt(3) - 1)
    .join('');
}

/**
 * Sanitize a string for use as an Atlas cluster name.
 * Rules:
 * - Alphanumeric characters and hyphens only
 * - Cannot start or end with hyphen
 * - Max 64 characters
 */
export function sanitizeClusterName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-') // Replace invalid chars with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .substring(0, 64); // Truncate to max length
}

/**
 * Map Atlas cluster stateName to platform status.
 */
export function mapAtlasStateToPlatformStatus(
  atlasState: string
): 'creating' | 'idle' | 'active' | 'deleting' | 'deleted' | 'error' {
  const statusMap: Record<string, 'creating' | 'idle' | 'active' | 'deleting' | 'deleted' | 'error'> = {
    CREATING: 'creating',
    IDLE: 'active',
    UPDATING: 'active',
    DELETING: 'deleting',
    DELETED: 'deleted',
    REPAIRING: 'active',
  };

  return statusMap[atlasState] || 'active';
}

/**
 * Generate a short Atlas project name from event and team IDs.
 * Format: mh-{eventId}-{teamId}
 * Uses last 6 characters of each ObjectId for brevity.
 */
export function generateAtlasProjectName(eventId: string, teamId: string): string {
  const shortEventId = eventId.slice(-6);
  const shortTeamId = teamId.slice(-6);
  return `mh-${shortEventId}-${shortTeamId}`;
}

/**
 * DevRel appName for MongoDB attribution tracking.
 *
 * Format: devrel-MEDIUM-PRIMARY-SECONDARY
 * - MEDIUM: platform (how consumed)
 * - PRIMARY: hackathon (main topic)
 * - SECONDARY: atlas (complementary theme)
 *
 * See: /docs/Best_Practice_App_Name.md
 */
export const DEVREL_APP_NAME = 'devrel-platform-hackathon-atlas';

/**
 * Appends the devrel appName to a MongoDB connection string for attribution tracking.
 * Idempotent — won't add appName if already present.
 */
export function addAppNameToConnectionString(connectionString: string): string {
  if (!connectionString) return connectionString;
  if (connectionString.includes(`appName=${DEVREL_APP_NAME}`)) return connectionString;
  const separator = connectionString.includes('?') ? '&' : '?';
  return `${connectionString}${separator}appName=${DEVREL_APP_NAME}`;
}
