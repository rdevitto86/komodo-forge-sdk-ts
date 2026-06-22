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
export declare const createEmptyConfig: () => EnvConfig;
export declare const defaultDevConfig: () => EnvConfig;
export declare const defaultStgConfig: () => EnvConfig;
export declare const defaultProdConfig: () => EnvConfig;
export interface TagsConfig {
    project?: string;
    owner: string;
    environment?: string;
    costCenter?: string;
    managedBy: string;
}
export declare const createTags: (config?: TagsConfig) => TagsConfig;
export declare const defaultTags: () => TagsConfig;
//# sourceMappingURL=index.d.ts.map