export declare const ENV_DEV = "dev";
export declare const ENV_STAGING = "stg";
export declare const ENV_PROD = "prod";
export * from './validators.js';
export type Region = 'us-east-1' | 'us-east-2' | 'us-west-1' | 'us-west-2';
export interface RegionDeploy {
    region: Region;
    suffix: string;
    enabled: boolean;
}
export interface EnvConfig {
    name: string;
    env: string;
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
export declare const createTags: (config?: TagsConfig) => Record<string, string>;
export declare const defaultTags: () => Record<string, string>;
export type DeployColor = 'blue' | 'green';
export declare const resolveDeployColor: () => DeployColor;
//# sourceMappingURL=index.d.ts.map