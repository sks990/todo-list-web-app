# 작업 보고서: 개인정보 보호(PII)를 위한 데이터 암호화 및 고가용성 인프라 구성 계획

## 메타데이터
- **태스크 ID**: 3f8b1f28-55cb-48c7-acaf-75f3cb4791e1
- **타입**: improvement
- **우선순위**: medium
- **담당 에이전트**: Infrastructure
- **완료 시간**: 2026-02-09T15:03:02.954Z

## 태스크 설명
이메일 등 개인정보의 저장 시 암호화(Encryption at Rest) 적용 및 DB Multi-AZ 구성 계획 수립

---
*멘션 논의에서 생성된 후속 태스크: 사용자 인증 데이터베이스 스키마 설계*

## 작업 내용
Infrastructure AI Agent로서, 이메일과 같은 개인정보(PII)를 안전하게 보호하기 위한 AWS 기반의 고가용성 인프라 구성과 데이터 암호화 전략을 설계하고, 이를 프로그래밍 방식으로 관리할 수 있는 가이드를 제공합니다.

이 태스크는 인프라 수준에서의 보안과 가용성에 초점을 맞추고 있으므로, AWS CDK(Cloud Development Kit)와 TypeScript를 사용하여 **Infrastructure as Code (IaC)** 파일을 생성하겠습니다.

```filepath:infra/lib/pii-secure-stack.ts
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
```

```filepath:src/utils/encryption.ts
/**
 * 애플리케이션 수준에서의 추가 암호화(Field-level Encryption)를 위한 유틸리티
 * 이메일 등 민감 정보를 DB에 저장하기 전 암호화할 때 사용합니다.
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
// 실제 환경에서는 AWS Secrets Manager 등에서 가져와야 합니다.
const ENCRYPTION_KEY = process.env.DB_FIELD_ENCRYPTION_KEY || 'default_secret_key_32_chars_long!!'; 
const IV_LENGTH = 16;

export const encryptPII = (text: string): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

export const decryptPII = (text: string): string => {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};
```

### 1. 생성/수정된 파일 목록
- `infra/lib/pii-secure-stack.ts`: AWS CDK를 이용한 인프라 정의 파일. Multi-AZ 설정 및 KMS 암호화가 포함됨.
- `src/utils/encryption.ts`: 애플리케이션 레벨에서 데이터 필드를 암호화/복호화하기 위한 유틸리티.

### 2. 핵심 구현 결정 사항
- **Encryption at Rest (KMS)**: AWS Managed Key가 아닌 Customer Managed Key(CMK)를 생성하여 사용했습니다. 이는 키 순환(Rotation) 주기를 제어하고 접근 정책을 더 세밀하게 관리하기 위함입니다.
- **Multi-AZ Availability**: Aurora PostgreSQL을 사용하여 Writer와 Reader 노드를 서로 다른 가용 영역(AZ)에 배치함으로써 데이터베이스의 고가용성을 보장했습니다.
- **Deep Defense**: 인프라 수준의 암호화(KMS)뿐만 아니라, 애플리케이션 수준에서도 이메일 등의 PII를 암호화할 수 있도록 `crypto` 모듈 기반 유틸리티를 추가하여 '방어 계층화' 전략을 적용했습니다.

### 3. 테스트 권장 사항
- **장애 조치 테스트**: AWS 콘솔에서 RDS Failover를 강제로 발생시켜 Reader 인스턴스가 승격되는 동안 서비스 중단 시간이 최소화되는지 확인하십시오.
- **암호화 검증**: DB에 직접 접속하여 저장된 데이터(이메일 필드 등)가 평문이 아닌 암호문으로 저장되어 있는지 쿼리를 통해 확인하십시오.
- **KMS 정책 검증**: 권한이 없는 IAM 역할이 데이터베이스에 접근하려 할 때 KMS 키 복호화 권한 부족으로 접근이 차단되는지 확인하십시오.

### 4. 다음 단계
- **비밀 관리**: `DB_FIELD_ENCRYPTION_KEY`를 환경 변수가 아닌 AWS Secrets Manager에서 동적으로 가져오도록 연동해야 합니다.
- **로깅 및 모니터링**: CloudWatch Logs를 통해 비정상적인 DB 접근 패턴을 감지하는 알람 설정을 추가할 계획입니다.
- **데이터 보존 정책**: 백업 데이터의 보존 기간과 아카이브 전략을 법적 요구사항(개인정보보호법)에 맞춰 구체화해야 합니다.

## 다음 단계
- [ ] PM 리뷰 대기
- [ ] 코드 리뷰 진행
- [ ] 테스트 검증
- [ ] 배포 승인

---
*이 보고서는 AI 에이전트에 의해 자동 생성되었습니다.*
