import { Stack, StackProps } from 'aws-cdk-lib'
import { CfnDataSet, CfnDataSource } from 'aws-cdk-lib/aws-quicksight'
import { Bucket } from 'aws-cdk-lib/aws-s3'
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment'
import { Construct } from 'constructs'
import * as path from 'path'

export class NetflixQuicksightStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const netflixBucket = new Bucket(this, 'NetflixQuicksightBucket', {
      bucketName: 'netflix-quicksight-project-techuila'
    })

    const bucketDeploy = new BucketDeployment(this, 'DeployNetflixDatasets', {
      sources: [Source.asset(path.join(__dirname, 'data/netflix-dataset'))],
      destinationBucket: netflixBucket
    })

    const datasource = new CfnDataSource(this, 'NetflixS3DataSource', {
      awsAccountId: this.account,
      dataSourceId: 'netflix-s3-datasource',
      name: 'Netflix S3 Data Source',
      type: 'S3',
      dataSourceParameters: {
        s3Parameters: {
          manifestFileLocation: {
            bucket: netflixBucket.bucketName,
            key: 'manifest.json'
          }
        }
      }
    })

    const dataset = new CfnDataSet(this, 'QSS3NetflixDataset', {
      awsAccountId: this.account,
      dataSetId: 'netflix-manifest-dataset',
      name: 'Netflix Manifest Dataset',
      importMode: 'SPICE',
      physicalTableMap: {
        NetflixManifest: {
          s3Source: {
            dataSourceArn: datasource.attrArn,
            inputColumns: [
              { name: 'show_id', type: 'STRING' },
              { name: 'type', type: 'STRING' },
              { name: 'title', type: 'STRING' },
              { name: 'director', type: 'STRING' },
              { name: 'cast', type: 'STRING' },
              { name: 'country', type: 'STRING' },
              { name: 'date_added', type: 'STRING' },
              { name: 'release_year', type: 'STRING' },
              { name: 'rating', type: 'STRING' },
              { name: 'duration', type: 'STRING' },
              { name: 'listed_in', type: 'STRING' },
              { name: 'description', type: 'STRING' }
            ],
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
      logicalTableMap: {
        NetflixLogical: {
          alias: 'NetflixLogical',
          source: { physicalTableId: 'NetflixManifest' },
          dataTransforms: [
            {
              castColumnTypeOperation: {
                columnName: 'release_year',
                newColumnType: 'INTEGER'
              }
            },
            {
              castColumnTypeOperation: {
                columnName: 'duration',
                newColumnType: 'INTEGER'
              }
            }
          ]
        }
      }
    })

    datasource.node.addDependency(bucketDeploy)
    dataset.node.addDependency(bucketDeploy)
  }
}
