#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'

import { NetflixQuicksightStack } from '../lib/stacks/netflix-quicksight-stack'

const app = new cdk.App()
const netflixQuicksightStack = new NetflixQuicksightStack(app, 'NetflixQuicksightStack', {})

cdk.Tags.of(netflixQuicksightStack).add('Project', 'NetflixQuicksight')
