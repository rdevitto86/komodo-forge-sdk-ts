import {
  ENV_DEV,
  ENV_STAGING,
  ENV_PROD,
  DEFAULT_REGION_EAST,
  DEFAULT_REGION_WEST,
  DEFAULT_ACCOUNT_DEV,
  DEFAULT_ACCOUNT_STAGING,
  DEFAULT_ACCOUNT_PROD,
} from '../constants.js';

export interface RegionDeploy {
  region: 'us-east-1' | 'us-east-2' | 'us-west-1' | 'us-west-2';
  suffix: string;
  enabled: boolean;
}

export interface EnvConfig {
  name: string;
  account: string;
  cpu: number;
  memory: number;
  minCapacity: number;
  maxCapacity: number;
  secretPath?: string;
  downstreamUrls?: string[];
  upstreamUrls?: string[];
  vpcTag: string;
  domainName: string;
  certificateArn: string;
  cloudfrontEnabled?: boolean;
  cloudFrontCertificateArn?: string;
  regions: RegionDeploy[];
}

export const createEmptyConfig = (): EnvConfig => ({
  name: '',
  account: '',
  cpu: 0,
  memory: 0,
  minCapacity: 0,
  maxCapacity: 0,
  secretPath: '',
  vpcTag: '',
  domainName: '',
  certificateArn: '',
  regions: [],
});

export const defaultDevConfig = (): EnvConfig => ({
  name: ENV_DEV,
  account: DEFAULT_ACCOUNT_DEV,
  cpu: 256,
  memory: 512,
  minCapacity: 1,
  maxCapacity: 2,
  downstreamUrls: [],
  upstreamUrls: [],
  vpcTag: '',
  domainName: '',
  certificateArn: '',
  regions: [{ region: DEFAULT_REGION_EAST, suffix: 'east', enabled: true }],
});

export const defaultStgConfig = (): EnvConfig => ({
  name: ENV_STAGING,
  account: DEFAULT_ACCOUNT_STAGING,
  cpu: 512,
  memory: 1024,
  minCapacity: 1,
  maxCapacity: 3,
  downstreamUrls: [],
  upstreamUrls: [],
  vpcTag: '',
  domainName: '',
  certificateArn: '',
  cloudfrontEnabled: false,
  regions: [
    { region: DEFAULT_REGION_EAST, suffix: 'east', enabled: true },
    { region: DEFAULT_REGION_WEST, suffix: 'west', enabled: false },
  ],
});

export const defaultProdConfig = (): EnvConfig => ({
  name: ENV_PROD,
  account: DEFAULT_ACCOUNT_PROD,
  cpu: 1024,
  memory: 2048,
  minCapacity: 1,
  maxCapacity: 6,
  downstreamUrls: [],
  upstreamUrls: [],
  vpcTag: '',
  domainName: '',
  certificateArn: '',
  regions: [
    { region: DEFAULT_REGION_EAST, suffix: 'east', enabled: true },
    { region: DEFAULT_REGION_WEST, suffix: 'west', enabled: false },
  ],
});

export interface TagsConfig {
  project?: string;
  owner: string;
  environment?: string;
  costCenter?: string;
  managedBy: string;
}

export const createTags = (config?: TagsConfig): TagsConfig => ({
  project: config?.project || '',
  owner: config?.owner || '',
  environment: config?.environment || '',
  managedBy: config?.managedBy || '',
  costCenter: config?.costCenter || '',
});

export const defaultTags = (): TagsConfig => ({
  owner: 'Komodo Future Solutions',
  managedBy: 'Komodo Future Solutions',
});
