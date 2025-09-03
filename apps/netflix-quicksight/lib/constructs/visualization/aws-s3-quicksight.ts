import { Stack } from 'aws-cdk-lib'
import { CfnManagedPolicy } from 'aws-cdk-lib/aws-iam'
import { CfnDataSet, CfnDataSource, CfnTemplate } from 'aws-cdk-lib/aws-quicksight'
import { Bucket } from 'aws-cdk-lib/aws-s3'
import { BucketDeployment } from 'aws-cdk-lib/aws-s3-deployment'
import { Construct } from 'constructs'
import { permission } from 'process'

export interface QuicksightProps {
  prefix: string
  datasourceProps: {
    name: string
    s3Parameters: CfnDataSource.S3ParametersProperty
  }

  datasetProps: {
    name: string
    inputColumns: CfnDataSet.InputColumnProperty[]
    dataTransforms?: CfnDataSet.TransformOperationProperty[]
  }

  managedPolicyProps: {
    bucket: Bucket
    deployment: BucketDeployment
    quicksightAccountArn: string
  }
}

export class Quicksight extends Construct {
  /**
   * By default, Amazon QuickSight uses a role named aws-quicksight-service-role-v0.
   * @see https://docs.aws.amazon.com/lake-formation/latest/dg/qs-integ-lf.html
   */
  public static QUICKSIGHT_SERVICE_ROLE = 'aws-quicksight-service-role-v0'

  public datasource: CfnDataSource
  public dataset: CfnDataSet
  public managedPolicy: CfnManagedPolicy

  constructor(scope: Stack, id: string, props: QuicksightProps) {
    super(scope, id)

    const { datasetPermissions, datasourcePermissions, managedPolicy } = this.createManagedPolicy(
      props.managedPolicyProps.bucket,
      props.managedPolicyProps.deployment,
      props.managedPolicyProps.quicksightAccountArn
    )

    this.managedPolicy = managedPolicy

    this.datasource = new CfnDataSource(this, `${id}-DataSource`, {
      awsAccountId: scope.account,
      dataSourceId: `${props.prefix}-s3-datasource`,
      name: props.datasourceProps.name,
      type: 'S3',
      dataSourceParameters: {
        s3Parameters: props.datasourceProps.s3Parameters
      },
      permissions: datasourcePermissions
    })

    this.dataset = new CfnDataSet(this, `${id}-QSS3NetflixDataset`, {
      awsAccountId: scope.account,
      dataSetId: `${props.prefix}-manifest-dataset`,
      name: props.datasetProps.name,
      importMode: 'SPICE',
      physicalTableMap: {
        NetflixManifest: {
          s3Source: {
            dataSourceArn: this.datasource.attrArn,
            inputColumns: props.datasetProps.inputColumns,
            uploadSettings: {
              format: 'CSV',
              delimiter: ',',
              textQualifier: 'DOUBLE_QUOTE',
              containsHeader: true,
            }
          }
        }
      },
      ...(props.datasetProps.dataTransforms && {
        logicalTableMap: {
          NetflixLogical: {
            alias: 'NetflixLogical',
            source: { physicalTableId: 'NetflixManifest' },
            dataTransforms: props.datasetProps.dataTransforms
          }
        }
      }),
      permissions: datasetPermissions
    })
  }

  private createManagedPolicy(bucket: Bucket, deployment: BucketDeployment, quicksightAccountArn: string) {
    const datasourcePermissions: CfnTemplate.ResourcePermissionProperty[] = [
      {
        principal: quicksightAccountArn,
        actions: [
          'quicksight:DescribeDataSource',
          'quicksight:DescribeDataSourcePermissions',
          'quicksight:PassDataSource',
          'quicksight:UpdateDataSource'
        ]
      }
    ]

    const datasetPermissions: CfnTemplate.ResourcePermissionProperty[] = [
      {
        principal: quicksightAccountArn,
        actions: [
          'quicksight:DescribeDataSet',
          'quicksight:DescribeDataSetPermissions',
          'quicksight:PassDataSet',
          'quicksight:DescribeIngestion',
          'quicksight:ListIngestions',
          'quicksight:UpdateDataSet',
          'quicksight:DeleteDataSet',
          'quicksight:CreateIngestion',
          'quicksight:CancelIngestion',
          'quicksight:UpdateDataSetPermissions'
        ]
      }
    ]

    const policyName = 'quicksightExamplePolicy'
    const managedPolicy = new CfnManagedPolicy(this, policyName, {
      managedPolicyName: policyName,
      policyDocument: {
        Statement: [
          {
            Effect: 'Allow',
            Action: ['s3:ListAllMyBuckets'],
            Resource: ['arn:aws:s3:::*']
          },
          {
            Effect: 'Allow',
            Action: ['s3:*'],
            Resource: [`arn:aws:s3:::${bucket.bucketName}`, `arn:aws:s3:::${bucket.bucketName}/*`]
          }
        ],
        Version: '2012-10-17'
      },
      roles: [Quicksight.QUICKSIGHT_SERVICE_ROLE]
    })

    return { datasourcePermissions, datasetPermissions, managedPolicy }
  }
}
