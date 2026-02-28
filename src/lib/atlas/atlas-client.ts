import DigestFetch from 'digest-fetch';

const ATLAS_BASE_URL = process.env.ATLAS_BASE_URL || 'https://cloud.mongodb.com/api/atlas/v2';
const ATLAS_PUBLIC_KEY = process.env.ATLAS_PUBLIC_KEY!;
const ATLAS_PRIVATE_KEY = process.env.ATLAS_PRIVATE_KEY!;
const ATLAS_ORG_ID = process.env.ATLAS_ORG_ID!;
const ATLAS_API_VERSION = '2025-03-12';

// Singleton digest client
let digestClient: DigestFetch | null = null;

function getDigestClient(): DigestFetch {
  if (!digestClient) {
    digestClient = new DigestFetch(ATLAS_PUBLIC_KEY, ATLAS_PRIVATE_KEY);
  }
  return digestClient;
}

export class AtlasApiError extends Error {
  constructor(
    public statusCode: number,
    public atlasError: { errorCode?: string; detail?: string; reason?: string }
  ) {
    super(`Atlas API error ${statusCode}: ${atlasError.detail || atlasError.reason || 'Unknown'}`);
    this.name = 'AtlasApiError';
  }
}

/**
 * Makes an authenticated request to the Atlas Admin API v2.
 * Uses HTTP Digest Authentication via digest-fetch.
 */
async function atlasRequest<T>(
  path: string,
  options: {
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    body?: unknown;
  }
): Promise<T> {
  const url = `${ATLAS_BASE_URL}${path}`;
  const client = getDigestClient();

  const headers: Record<string, string> = {
    Accept: `application/vnd.atlas.${ATLAS_API_VERSION}+json`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await client.fetch(url, {
      method: options.method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new AtlasApiError(response.status, error);
    }

    // DELETE requests return 204 No Content
    if (response.status === 204) return undefined as T;
    
    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof AtlasApiError) {
      throw error;
    }
    console.error('Atlas API request failed:', error);
    throw new Error(`Atlas API request failed: ${(error as Error).message}`);
  }
}

// --- Type Definitions ---

export interface AtlasProject {
  id: string;
  name: string;
  orgId: string;
  clusterCount?: number;
  created?: string;
}

export interface AtlasClusterResponse {
  id?: string;
  name: string;
  clusterType: string;
  stateName: string; // CREATING, IDLE, UPDATING, DELETING, etc.
  mongoDBVersion?: string;
  connectionStrings?: {
    standard?: string;
    standardSrv?: string;
  };
  replicationSpecs?: unknown[];
  providerSettings?: {
    providerName: string;
    regionName: string;
    instanceSizeName: string;
  };
}

export interface AtlasDbUser {
  username: string;
  databaseName: string;
  roles: { roleName: string; databaseName: string }[];
  scopes?: { name: string; type: string }[];
}

export interface IpAccessEntry {
  cidrBlock: string;
  comment?: string;
  ipAddress?: string;
}

// --- Project Operations ---

export async function createAtlasProject(name: string): Promise<AtlasProject> {
  return atlasRequest('/groups', {
    method: 'POST',
    body: { name, orgId: ATLAS_ORG_ID },
  });
}

export async function deleteAtlasProject(groupId: string): Promise<void> {
  return atlasRequest(`/groups/${groupId}`, { method: 'DELETE' });
}

// --- Cluster Operations ---

export async function createM0Cluster(
  groupId: string,
  config: {
    name: string;
    backingProvider: 'AWS' | 'GCP' | 'AZURE';
    region: string;
  }
): Promise<AtlasClusterResponse> {
  return atlasRequest(`/groups/${groupId}/clusters`, {
    method: 'POST',
    body: {
      name: config.name,
      clusterType: 'REPLICASET',
      replicationSpecs: [
        {
          regionConfigs: [
            {
              providerName: 'TENANT',
              backingProviderName: config.backingProvider,
              regionName: config.region,
              priority: 7,
              electableSpecs: { instanceSize: 'M0' },
            },
          ],
        },
      ],
    },
  });
}

export async function getAtlasCluster(
  groupId: string,
  clusterName: string
): Promise<AtlasClusterResponse> {
  return atlasRequest(`/groups/${groupId}/clusters/${clusterName}`, {
    method: 'GET',
  });
}

export async function deleteAtlasCluster(
  groupId: string,
  clusterName: string
): Promise<void> {
  return atlasRequest(`/groups/${groupId}/clusters/${clusterName}`, {
    method: 'DELETE',
  });
}

// --- Database User Operations ---

export async function createAtlasDatabaseUser(
  groupId: string,
  config: {
    username: string;
    password: string;
    clusterName: string;
    roles?: { roleName: string; databaseName: string }[];
  }
): Promise<AtlasDbUser> {
  return atlasRequest(`/groups/${groupId}/databaseUsers`, {
    method: 'POST',
    body: {
      databaseName: 'admin',
      username: config.username,
      password: config.password,
      roles: config.roles || [
        { roleName: 'readWriteAnyDatabase', databaseName: 'admin' },
      ],
      scopes: [{ name: config.clusterName, type: 'CLUSTER' }],
    },
  });
}

export async function deleteAtlasDatabaseUser(
  groupId: string,
  username: string
): Promise<void> {
  return atlasRequest(
    `/groups/${groupId}/databaseUsers/admin/${encodeURIComponent(username)}`,
    { method: 'DELETE' }
  );
}

export async function listAtlasDatabaseUsers(groupId: string): Promise<AtlasDbUser[]> {
  const response = await atlasRequest<{ results: AtlasDbUser[] }>(
    `/groups/${groupId}/databaseUsers`,
    { method: 'GET' }
  );
  return response.results || [];
}

// --- IP Access List Operations ---

export async function addIpAccessListEntries(
  groupId: string,
  entries: { cidrBlock?: string; ipAddress?: string; comment?: string }[]
): Promise<void> {
  return atlasRequest(`/groups/${groupId}/accessList`, {
    method: 'POST',
    body: entries,
  });
}

export async function removeIpAccessListEntry(
  groupId: string,
  entry: string // cidrBlock or ipAddress
): Promise<void> {
  return atlasRequest(
    `/groups/${groupId}/accessList/${encodeURIComponent(entry)}`,
    { method: 'DELETE' }
  );
}

export async function listIpAccessList(groupId: string): Promise<IpAccessEntry[]> {
  const response = await atlasRequest<{ results: IpAccessEntry[] }>(
    `/groups/${groupId}/accessList`,
    { method: 'GET' }
  );
  return response.results || [];
}
