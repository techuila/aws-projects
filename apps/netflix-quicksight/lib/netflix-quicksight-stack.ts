import { Stack, StackProps } from 'aws-cdk-lib'
import { Bucket } from 'aws-cdk-lib/aws-s3'
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment'
import { Construct } from 'constructs'
import * as path from 'path'

export class NetflixQuicksightStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const netflixBucket = new Bucket(this, 'NetflixQuicksightBucket', {
      bucketName: 'netflix-quicksight-project'
    })

    new BucketDeployment(this, 'DeployNetflixDatasets', {
      sources: [Source.asset(path.join(__dirname, 'data/netflix-dataset'))],
      destinationBucket: netflixBucket
    })
  }
}
