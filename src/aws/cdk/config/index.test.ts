import { afterEach, describe, expect, it } from 'vitest';
import {
	createEmptyConfig,
	createTags,
	defaultDevConfig,
	defaultProdConfig,
	defaultStgConfig,
	defaultTags,
	resolveDeployColor,
} from './index.js';

describe('config/index', () => {
	describe('createEmptyConfig', () => {
		it('should create an empty config with default values', () => {
			expect(createEmptyConfig()).toEqual({
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
		});
	});

	describe('defaultDevConfig', () => {
		it('should create default dev config', () => {
			const config = defaultDevConfig();
			expect(config.name).toBe('');
			expect(config.env).toBe('dev');
			expect(config.account).toBe('122703641091');
			expect(config.cpu).toBe(256);
			expect(config.memory).toBe(512);
			expect(config.minCapacity).toBe(1);
			expect(config.maxCapacity).toBe(2);
			expect(config.downstreamUrls).toEqual([]);
			expect(config.upstreamUrls).toEqual([]);
			expect(config.vpcTag).toBe('');
			expect(config.domainName).toBe('');
			expect(config.certificateArn).toBe('');
			expect(config.regions).toEqual([{ region: 'us-east-2', suffix: 'east', enabled: true }]);
			expect(config.tags).toEqual({ owner: 'Komodo Future Solutions', managedBy: 'cdk', environment: 'dev' });
		});
	});

	describe('defaultStgConfig', () => {
		it('should create default staging config', () => {
			const config = defaultStgConfig();
			expect(config.name).toBe('');
			expect(config.env).toBe('stg');
			expect(config.account).toBe('122703641091');
			expect(config.cpu).toBe(512);
			expect(config.memory).toBe(1024);
			expect(config.minCapacity).toBe(1);
			expect(config.maxCapacity).toBe(3);
			expect(config.downstreamUrls).toEqual([]);
			expect(config.upstreamUrls).toEqual([]);
			expect(config.vpcTag).toBe('');
			expect(config.domainName).toBe('');
			expect(config.certificateArn).toBe('');
			expect(config.cloudfrontEnabled).toBe(false);
			expect(config.regions).toEqual([
				{ region: 'us-east-2', suffix: 'east', enabled: true },
				{ region: 'us-west-2', suffix: 'west', enabled: true },
			]);
			expect(config.tags).toEqual({
				owner: 'Komodo Future Solutions',
				managedBy: 'cdk',
				environment: 'stg',
			});
		});
	});

	describe('defaultProdConfig', () => {
		it('should create default prod config', () => {
			const config = defaultProdConfig();
			expect(config.name).toBe('');
			expect(config.env).toBe('prod');
			expect(config.account).toBe('123456789012');
			expect(config.cpu).toBe(1024);
			expect(config.memory).toBe(2048);
			expect(config.minCapacity).toBe(1);
			expect(config.maxCapacity).toBe(6);
			expect(config.downstreamUrls).toEqual([]);
			expect(config.upstreamUrls).toEqual([]);
			expect(config.vpcTag).toBe('');
			expect(config.domainName).toBe('');
			expect(config.certificateArn).toBe('');
			expect(config.regions).toEqual([
				{ region: 'us-east-2', suffix: 'east', enabled: true },
				{ region: 'us-west-2', suffix: 'west', enabled: true },
			]);
			expect(config.tags).toEqual({
				owner: 'Komodo Future Solutions',
				managedBy: 'cdk',
				environment: 'prod',
			});
		});
	});

	describe('createTags', () => {
		it('should create tags with provided config', () => {
			const config = {
				project: 'test-project',
				owner: 'test-owner',
				environment: 'dev',
				costCenter: '12345',
				managedBy: 'test-manager',
			};
			expect(createTags(config)).toMatchObject(config);
		});

		it('should create tags with partial config', () => {
			const { owner, managedBy, project, environment, costCenter } = createTags({
				owner: 'test-owner',
				managedBy: 'test-manager',
			});
			expect(owner).toBe('test-owner');
			expect(managedBy).toBe('test-manager');
			expect(project).toBe('');
			expect(environment).toBe('');
			expect(costCenter).toBe('');
		});

		it('should create tags with empty config', () => {
			const { owner, managedBy, project, environment, costCenter } = createTags();
			expect(owner).toBe('Komodo Future Solutions');
			expect(managedBy).toBe('cdk');
			expect(project).toBe('');
			expect(environment).toBe('');
			expect(costCenter).toBe('');
		});
	});

	describe('defaultTags', () => {
		it('should create default tags', () => {
			const { owner, managedBy } = defaultTags();
			expect(owner).toBe('Komodo Future Solutions');
			expect(managedBy).toBe('cdk');
		});
	});

	describe('resolveDeployColor', () => {
		afterEach(() => {
			delete process.env.DEPLOY_COLOR;
		});

		it('should default to blue when DEPLOY_COLOR is unset', () => {
			delete process.env.DEPLOY_COLOR;
			expect(resolveDeployColor()).toBe('blue');
		});

		it('should return green when DEPLOY_COLOR is green', () => {
			process.env.DEPLOY_COLOR = 'green';
			expect(resolveDeployColor()).toBe('green');
		});

		it('should default to blue for an unrecognized DEPLOY_COLOR value', () => {
			process.env.DEPLOY_COLOR = 'purple';
			expect(resolveDeployColor()).toBe('blue');
		});
	});
});
