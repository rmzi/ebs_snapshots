#!/usr/bin/env node

var url = require('url');
var AWS = require('aws-sdk');
var _ = require('lodash');

// Set retention time for backups (in hours)
const MAX_RETENTION="24"

// Configure AWS region
AWS.config.region = 'us-east-1';

// Instantiate ec2 instance w/ specific API version
var ec2 = new AWS.EC2({apiVersion: '2015-10-01'});

var tagSnapshot = function(snapshot_id) {
  var params = {
    Resources: [
      snapshot_id
    ],
    Tags: [
      {
        Key: 'Retention',
        Value: MAX_RETENTION
      }
    ],
    DryRun: false
  };
  ec2.createTags(params, function(err, data) {
    if (err)
      console.log(err, err.stack);
    else
      console.log("Successfully added Retention tag to " + snapshot_id);
  });
}

var makeSnapshot = function(volume_id) {
  var snapshot_params = {
    VolumeId: volume_id, /* required */
    Description: 'Backup of ' + volume_id + ' made at ' + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + " .",
    DryRun: false
  };

  ec2.createSnapshot(snapshot_params, function(err, data) {
    if (err)
      console.log(err, err.stack);
    else {
      console.log("Successfully created hourly snapshot of " + volume_id);
      tagSnapshot(data.SnapshotId)
    }
  });
}

// Query EBS volumes tagged "backup"
var params = {
  DryRun: false,
  Filters: [
    {
      Name: 'tag-key',
      Values: [
        'Backup'
      ]
    }
  ]
};

ec2.describeVolumes(params, function(err, data) {
  if (err)
    console.log(err, err.stack);
  else
    // Create snapshot of volume
    var volumes = _.map(data.Volumes, 'VolumeId')
    _.map(volumes, makeSnapshot)
});
