import {
	DEFAULT_ACCOUNT_NONPROD,
	DEFAULT_ACCOUNT_PROD,
	DEFAULT_REGION_EAST,
	DEFAULT_REGION_WEST,
	REGIONS,
} from '../../constants.js';
import {
	ENV_DEV,
	ENV_STAGING,
	ENV_PROD,
	KOMODO_NAME_FULL,
	CANARY_BLUE,
	CANARY_GREEN,
	CICD_TOOL_CDK,
	CICD_TOOL_TERRAFORM,
} from '../../../constants.js';

export * from './validators.js';

export type RegionKey = keyof typeof REGIONS;
export type Region = (typeof REGIONS)[RegionKey] | '';

export interface RegionDeploy {
	region: Region;
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
		owner: KOMODO_NAME_FULL,
		managedBy: CICD_TOOL_CDK,
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
		owner: KOMODO_NAME_FULL,
		managedBy: CICD_TOOL_CDK,
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
		owner: KOMODO_NAME_FULL,
		managedBy: CICD_TOOL_CDK,
		environment: ENV_PROD,
	},
});

export const createRegionDeploy = (region: Region, suffix: string, enabled: boolean): RegionDeploy => ({
	region,
	suffix,
	enabled,
});

export type DataClassificationTag = 'public' | 'internal' | 'confidential' | 'pii' | 'restricted' | 'critical' | string;
export type AutoStartTag = 'true' | 'false' | 'yes' | 'no';
export type TierTag = 'standard' | 'high' | 'critical' | string;

export interface TagsConfig {
	project?: string;
	owner: typeof KOMODO_NAME_FULL | string;
	environment?: typeof ENV_DEV | typeof ENV_STAGING | typeof ENV_PROD | string;
	costCenter?: string;
	managedBy: typeof CICD_TOOL_CDK | typeof CICD_TOOL_TERRAFORM | string;
	version?: string;
	tier?: TierTag;
	autoStart?: AutoStartTag;
	dataClassification?: DataClassificationTag;
}

export const createTags = (config?: TagsConfig): Record<string, string> => ({
	project: config?.project || '',
	owner: config?.owner || KOMODO_NAME_FULL,
	environment: config?.environment || '',
	managedBy: config?.managedBy || CICD_TOOL_CDK,
	costCenter: config?.costCenter || '',
	version: config?.version || '',
	tier: config?.tier || '',
	autoStart: config?.autoStart || 'true',
	dataClassification: config?.dataClassification || '',
});

export const defaultTags = (): Record<string, string> => ({
	owner: KOMODO_NAME_FULL,
	managedBy: CICD_TOOL_CDK,
});

export type DeployColor = typeof CANARY_BLUE | typeof CANARY_GREEN;

export const resolveDeployColor = (): DeployColor => (process.env.DEPLOY_COLOR === 'green' ? CANARY_GREEN : CANARY_BLUE);
