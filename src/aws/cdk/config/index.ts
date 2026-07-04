import {
	DEFAULT_ACCOUNT_NONPROD,
	DEFAULT_ACCOUNT_PROD,
	DEFAULT_REGION_EAST,
	DEFAULT_REGION_WEST,
	type AWSRegion,
} from '../../constants.js';
import { ENV_DEV, ENV_STAGING, ENV_PROD } from '../../../constants.js';

export * from './validators.js';
export interface RegionDeploy {
	region: AWSRegion;
	suffix: string;
	enabled: boolean;
}

export interface EnvConfig {
	name: string;
	env: typeof ENV_DEV | typeof ENV_STAGING | typeof ENV_PROD | '';
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
	tags?: Record<string, string>;
}

export const createEmptyConfig = (): EnvConfig => ({
	name: '',
	env: '',
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
	tags: {},
});

export const defaultDevConfig = (): EnvConfig => ({
	name: '',
	env: ENV_DEV,
	account: DEFAULT_ACCOUNT_NONPROD,
	cpu: 256,
	memory: 512,
	minCapacity: 1,
	maxCapacity: 2,
	downstreamUrls: [],
	upstreamUrls: [],
	vpcTag: '',
	domainName: '',
	certificateArn: '',
	regions: [{
		region: DEFAULT_REGION_EAST,
		suffix: 'east',
		enabled: true,
	}],
	tags: {
		owner: 'Komodo Future Solutions',
		managedBy: 'cdk',
		environment: ENV_DEV,
	},
});

export const defaultStgConfig = (): EnvConfig => ({
	name: '',
	env: ENV_STAGING,
	account: DEFAULT_ACCOUNT_NONPROD,
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
		{ region: DEFAULT_REGION_WEST, suffix: 'west', enabled: true },
	],
	tags: {
		owner: 'Komodo Future Solutions',
		managedBy: 'cdk',
		environment: ENV_STAGING,
	},
});

export const defaultProdConfig = (): EnvConfig => ({
	name: '',
	env: ENV_PROD,
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
		{ region: DEFAULT_REGION_WEST, suffix: 'west', enabled: true },
	],
	tags: {
		owner: 'Komodo Future Solutions',
		managedBy: 'cdk',
		environment: ENV_PROD,
	},
});

export const createRegionDeploy = (region: AWSRegion, suffix: string, enabled: boolean): RegionDeploy => ({
	region,
	suffix,
	enabled,
});

export interface TagsConfig {
	project?: string;
	owner: 'Komodo Future Solutions' | string;
	environment?: typeof ENV_DEV | typeof ENV_STAGING | typeof ENV_PROD | string;
	costCenter?: string;
	managedBy: 'cdk' | 'terraform' | string;
	version?: string;
	tier?: 'standard' | 'high' | 'critical' | string;
	autoStart?: 'true' | 'false' | 'yes' | 'no';
	dataClassification?: 'public' | 'internal' | 'confidential' | 'pii' | 'restricted' | 'critical' | string;
}

export const createTags = (config?: TagsConfig): Record<string, string> => ({
	project: config?.project || '',
	owner: config?.owner || 'Komodo Future Solutions',
	environment: config?.environment || '',
	managedBy: config?.managedBy || 'cdk',
	costCenter: config?.costCenter || '',
	version: config?.version || '',
	tier: config?.tier || '',
	autoStart: config?.autoStart || 'true',
	dataClassification: config?.dataClassification || '',
});

export const defaultTags = (): Record<string, string> => ({
	owner: 'Komodo Future Solutions',
	managedBy: 'cdk',
});

export type DeployColor = 'blue' | 'green';

export const resolveDeployColor = (): DeployColor => (process.env.DEPLOY_COLOR === 'green' ? 'green' : 'blue');
