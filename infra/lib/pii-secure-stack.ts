import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as kms from 'aws-cdk-lib/aws-kms';
import { Construct } from 'constructs';

/**
 * PII 보호를 위한 데이터 암호화 및 Multi-AZ RDS 인프라 구성
 */
export class PiiSecureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. VPC 구성 (고가용성을 위해 2개 이상의 AZ 사용)
    const vpc = new ec2.Vpc(this, 'SecureVpc', {
      maxAzs: 2,
      subnetConfiguration: [
        {
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    // 2. Encryption at Rest를 위한 KMS Customer Managed Key 생성
    const rdsKey = new kms.Key(this, 'RdsEncryptionKey', {
      enableKeyRotation: true, // 보안 모범 사례: 키 자동 순환
      description: 'KMS key for PII data encryption at rest in RDS',
      alias: 'alias/rds-pii-key',
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // 3. Multi-AZ Aurora PostgreSQL 데이터베이스 구성
    const dbCluster = new rds.DatabaseCluster(this, 'PiiDatabaseCluster', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_15_3,
      }),
      writer: rds.ClusterInstance.provisioned('WriterInstance', {
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MEDIUM),
      }),
      readers: [
        rds.ClusterInstance.provisioned('ReaderInstance', {
          instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MEDIUM),
        }),
      ],
      vpc,
      storageEncryptionKey: rdsKey, // KMS를 이용한 스토리지 암호화 적용
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      backup: {
        retention: cdk.Duration.days(7),
        preferredWindow: '03:00-04:00',
      },
      // 고가용성 설정
      storageEncrypted: true,
    });

    // 출력 처리
    new cdk.CfnOutput(this, 'RDSClusterEndpoint', {
      value: dbCluster.clusterEndpoint.hostname,
    });
  }
}