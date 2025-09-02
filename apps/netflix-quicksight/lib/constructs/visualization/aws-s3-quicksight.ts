import { Stack } from 'aws-cdk-lib'
import { CfnDataSet, CfnDataSource } from 'aws-cdk-lib/aws-quicksight'
import { Construct } from 'constructs'

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
}

export class Quicksight extends Construct {
  public datasource: CfnDataSource
  public dataset: CfnDataSet

  constructor(scope: Stack, id: string, props: QuicksightProps) {
    super(scope, id)

    this.datasource = new CfnDataSource(this, `${id}-DataSource`, {
      awsAccountId: scope.account,
      dataSourceId: `${props.prefix}-s3-datasource`,
      name: props.datasourceProps.name,
      type: 'S3',
      dataSourceParameters: {
        s3Parameters: props.datasourceProps.s3Parameters
      }
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
              startFromRow: 1
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
      })
    })
  }
}
