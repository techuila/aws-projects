import { Stack, StackProps } from 'aws-cdk-lib'
import { Source } from 'aws-cdk-lib/aws-s3-deployment'
import { Construct } from 'constructs'
import * as path from 'path'

import { S3BucketAndDeploy } from '../constructs/storage/aws-s3-deploy'
import { Quicksight } from '../constructs/visualization/aws-s3-quicksight'

export class NetflixQuicksightStack extends Stack {
  /**
   * Name of the s3 bucket to store the netflix dataset
   */
  public static BUCKET_NAME = 'netflix-quicksight-project-techuila'
  /**
   * location of the manifest json file in the s3 bucket.
   * Used by quicksight to discover the csv files.
   * */
  public static MANIFEST_KEY = 'manifest.json'
  /**
   * Name of the datasource in quicksight
   */
  public static QUICKSIGHT_DATASOURCE_NAME = 'NetflixS3DataSource'

  public static QUICKSIGHT_DATASET_NAME = 'Kaggle Netflix Dataset'

  constructor(scope: Construct, id: string, props: StackProps & { username: string }) {
    super(scope, id, props)

    const { bucket, deploy } = new S3BucketAndDeploy(this, 'S3BucketAndDeploy', {
      name: NetflixQuicksightStack.BUCKET_NAME,
      deploySources: [Source.asset(path.join(__dirname, '..', 'data/netflix-dataset'))]
    })

    const quicksight = new Quicksight(this, 'NetflixQuicksight', {
      prefix: 'netflix',
      datasourceProps: {
        name: 'Netflix S3 Data Source',
        s3Parameters: {
          manifestFileLocation: {
            bucket: bucket.bucketName,
            key: NetflixQuicksightStack.MANIFEST_KEY
          }
        }
      },
      datasetProps: {
        name: NetflixQuicksightStack.QUICKSIGHT_DATASET_NAME,
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
        dataTransforms: [
          {
            castColumnTypeOperation: {
              columnName: 'release_year',
              newColumnType: 'INTEGER'
            }
          }
        ]
      },
      managedPolicyProps: {
        bucket,
        deployment: deploy,
        quicksightAccountArn: `arn:aws:quicksight:${this.region}:${this.account}:user/default/${props.username}`
      }
    })

    quicksight.datasource.node.addDependency(quicksight.managedPolicy)
    quicksight.datasource.node.addDependency(deploy)
  }
}
