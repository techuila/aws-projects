#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'

import { NetflixQuicksightStack } from '../lib/stacks/netflix-quicksight-stack'

const app = new cdk.App()

const username = app.node.tryGetContext('quicksight-username')

if (!username) {
  throw new Error('quicksight-username context is required. Pass it via cdk context')
}

const netflixQuicksightStack = new NetflixQuicksightStack(app, 'NetflixQuicksightStack', { username })

cdk.Tags.of(netflixQuicksightStack).add('Project', 'NetflixQuicksight')
