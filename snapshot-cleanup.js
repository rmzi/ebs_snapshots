#!/usr/bin/env node

var url = require('url');
var AWS = require('aws-sdk');
var _ = require('lodash');

// Configure AWS region
AWS.config.region = 'us-east-1';

// Instantiate ec2 w/ specific API version
var ec2 = new AWS.EC2({apiVersion: '2015-10-01'});

var deleteSnapshot = function(snapshot_id) {
  var snapshot_params = {
    SnapshotId: snapshot_id,
    DryRun: false
  };

  ec2.deleteSnapshot(snapshot_params, function(err, data) {
    if (err)
      console.log(err, err.stack);
    else {
      console.log("Successfully deleted " + snapshot_id);
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
        'Retention'
      ]
    }
  ]
};

var getExpired = function(snapshot) {
  // Check if Date Created + Retention < Date Created
  var retention = _.map(snapshot.Tags, "Value")[0]         // Used _.map in case there are other Tags
  return new Date(new Date(snapshot.StartTime).getTime() + (parseInt(retention) * 3600 * 1000)) < new Date()
}

ec2.describeSnapshots(params, function(err, data) {
  if (err)
    console.log(err, err.stack);
  else
    var expired_snapshots = _.filter(data.Snapshots, getExpired);
    var expired_snapshot_ids = _.map(expired_snapshots, 'SnapshotId')
    _.map(expired_snapshot_ids, deleteSnapshot)
});
