import { REGIONS } from '../../constants.js';
import { ENV_DEV, ENV_STAGING, ENV_PROD, KOMODO_NAME_FULL, CANARY_BLUE, CANARY_GREEN, CICD_TOOL_CDK, CICD_TOOL_TERRAFORM } from '../../../constants.js';
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
export declare const createEmptyConfig: () => EnvConfig;
export declare const defaultDevConfig: () => EnvConfig;
export declare const defaultStgConfig: () => EnvConfig;
export declare const defaultProdConfig: () => EnvConfig;
export declare const createRegionDeploy: (region: Region, suffix: string, enabled: boolean) => RegionDeploy;
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
export declare const createTags: (config?: TagsConfig) => Record<string, string>;
export declare const defaultTags: () => Record<string, string>;
export type DeployColor = typeof CANARY_BLUE | typeof CANARY_GREEN;
export declare const resolveDeployColor: () => DeployColor;
//# sourceMappingURL=index.d.ts.map