import * as cdk from 'aws-cdk-lib';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as logs from 'aws-cdk-lib/aws-logs';
import { beforeEach, describe, expect, it } from 'vitest';
import { LogGroup } from './logGroup.js';

describe('constructs/logGroup', () => {
	let mockStack: cdk.Stack;

	beforeEach(() => {
		mockStack = new cdk.Stack();
	});

	it('should build log group with defaults', () => {
		const construct = new LogGroup(mockStack, 'LogGroup');
		expect(construct.logGroup).toBeInstanceOf(logs.LogGroup);
	});

	it('should build log group with custom values', () => {
		const construct = new LogGroup(mockStack, 'LogGroup', {
			logGroupName: 'custom-log-group',
			retention: logs.RetentionDays.ONE_MONTH,
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			tags: { Environment: 'test' },
		});
		expect(construct.logGroup).toBeInstanceOf(logs.LogGroup);
	});

	it('should build log group with encryption key', () => {
		const key = new kms.Key(mockStack, 'TestKey');
		const construct = new LogGroup(mockStack, 'LogGroup', { encryptionKey: key });
		expect(construct.logGroup).toBeInstanceOf(logs.LogGroup);
	});
});
