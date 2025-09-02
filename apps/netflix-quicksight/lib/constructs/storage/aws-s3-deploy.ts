import { BlockPublicAccess, Bucket, BucketAccessControl, BucketEncryption, BucketProps } from 'aws-cdk-lib/aws-s3'
import { BucketDeployment, BucketDeploymentProps, ISource, Source } from 'aws-cdk-lib/aws-s3-deployment'
import { Construct } from 'constructs'

export interface S3BucketAndDeployProps {
  name: string
  deploySources: ISource[]
  bucketProps?: BucketProps
  bucketDeploymentProps?: BucketDeploymentProps
}

export class S3BucketAndDeploy extends Construct {
  public bucket: Bucket

  public deploy: BucketDeployment

  constructor(scope: Construct, id: string, props: S3BucketAndDeployProps) {
    super(scope, id)

    this.bucket = new Bucket(this, `${id}-Bucket`, {
      bucketName: props.name,
      accessControl: BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
      encryption: BucketEncryption.S3_MANAGED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      ...props.bucketProps
    })

    this.deploy = new BucketDeployment(this, `${id}-Deploy`, {
      sources: props.deploySources,
      destinationBucket: this.bucket,
      ...props.bucketDeploymentProps
    })
  }
}
