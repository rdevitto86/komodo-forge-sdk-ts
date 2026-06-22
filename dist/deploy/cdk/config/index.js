import { ENV_DEV, ENV_STAGING, ENV_PROD, DEFAULT_REGION_EAST, DEFAULT_REGION_WEST, DEFAULT_ACCOUNT_DEV, DEFAULT_ACCOUNT_STAGING, DEFAULT_ACCOUNT_PROD, } from '../constants.js';
export const createEmptyConfig = () => ({
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
export const defaultDevConfig = () => ({
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
export const defaultStgConfig = () => ({
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
export const defaultProdConfig = () => ({
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
export const createTags = (config) => ({
    project: config?.project || '',
    owner: config?.owner || '',
    environment: config?.environment || '',
    managedBy: config?.managedBy || '',
    costCenter: config?.costCenter || '',
});
export const defaultTags = () => ({
    owner: 'Komodo Future Solutions',
    managedBy: 'Komodo Future Solutions',
});
//# sourceMappingURL=index.js.map