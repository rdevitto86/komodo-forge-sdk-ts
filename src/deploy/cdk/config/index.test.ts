import { describe, it, expect } from 'vitest';
import {
  createEmptyConfig,
  defaultDevConfig,
  defaultStgConfig,
  defaultProdConfig,
  createTags,
  defaultTags,
} from './index.js';

describe('config/index', () => {
  describe('createEmptyConfig', () => {
    it('should create an empty config with default values', () => {
      const config = createEmptyConfig();
      expect(config).toEqual({
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
    });
  });

  describe('defaultDevConfig', () => {
    it('should create default dev config', () => {
      const config = defaultDevConfig();
      expect(config.name).toBe('dev');
      expect(config.account).toBe('123456789012');
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
    });
  });

  describe('defaultStgConfig', () => {
    it('should create default staging config', () => {
      const config = defaultStgConfig();
      expect(config.name).toBe('staging');
      expect(config.account).toBe('123456789012');
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
        { region: 'us-west-2', suffix: 'west', enabled: false },
      ]);
    });
  });

  describe('defaultProdConfig', () => {
    it('should create default prod config', () => {
      const config = defaultProdConfig();
      expect(config.name).toBe('prod');
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
        { region: 'us-west-2', suffix: 'west', enabled: false },
      ]);
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
      const tags = createTags(config);
      expect(tags).toEqual(config);
    });

    it('should create tags with partial config', () => {
      const config = {
        owner: 'test-owner',
        managedBy: 'test-manager',
      };
      const tags = createTags(config);
      expect(tags).toEqual({
        project: '',
        owner: 'test-owner',
        environment: '',
        managedBy: 'test-manager',
        costCenter: '',
      });
    });

    it('should create tags with empty config', () => {
      const tags = createTags();
      expect(tags).toEqual({
        project: '',
        owner: '',
        environment: '',
        managedBy: '',
        costCenter: '',
      });
    });
  });

  describe('defaultTags', () => {
    it('should create default tags', () => {
      const tags = defaultTags();
      expect(tags).toEqual({
        owner: 'Komodo Future Solutions',
        managedBy: 'Komodo Future Solutions',
      });
    });
  });
});
