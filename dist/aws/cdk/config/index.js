import { DEFAULT_ACCOUNT_NONPROD, DEFAULT_ACCOUNT_PROD, DEFAULT_REGION_EAST, DEFAULT_REGION_WEST, REGIONS, } from '../../constants.js';
import { ENV_DEV, ENV_STAGING, ENV_PROD, KOMODO_NAME_FULL, CANARY_BLUE, CANARY_GREEN, CICD_TOOL_CDK, CICD_TOOL_TERRAFORM, } from '../../../constants.js';
export * from './validators.js';
export const createEmptyConfig = () => ({
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
export const defaultDevConfig = () => ({
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
export const defaultStgConfig = () => ({
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
export const defaultProdConfig = () => ({
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
export const createRegionDeploy = (region, suffix, enabled) => ({
    region,
    suffix,
    enabled,
});
export const createTags = (config) => ({
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
export const defaultTags = () => ({
    owner: KOMODO_NAME_FULL,
    managedBy: CICD_TOOL_CDK,
});
export const resolveDeployColor = () => (process.env.DEPLOY_COLOR === 'green' ? CANARY_GREEN : CANARY_BLUE);
//# sourceMappingURL=index.js.map