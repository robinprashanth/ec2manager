/* eslint-disable no-console */
const httpStatus = require('http-status');
const AWS = require('aws-sdk');
const config = require('../config/config');

const catchAsync = require('../utils/catchAsync');

const credentials = new AWS.SharedIniFileCredentials({ profile: 'personal-account' });
AWS.config.credentials = credentials;
// set the region
AWS.config.update({ region: 'us-east-1' });

// create an ec2 object
const ec2 = new AWS.EC2({ apiVersion: '2016-11-15' });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const describeKeyPair = catchAsync(async (req, res) => {
  // Retrieve key pair descriptions; no params needed
  const p = new Promise((resolve, rej) => {
    ec2.describeKeyPairs(function (err, data) {
      if (err) {
        rej(err);
      } else {
        resolve(data);
        console.log('Success', JSON.stringify(data.KeyPairs));
      }
    });
  });

  const result = await p;
  res.send(result);
});

const regionsAndAvailabilityZones = catchAsync(async (req, res) => {
  // Retrieve key pair descriptions; no params needed
  const params = {};

  const p = new Promise((resolve, rej) => {
    ec2.describeRegions(function (err, data) {
      if (err) {
        rej(err);
      } else {
        resolve(data);
        console.log('Success', JSON.stringify(data.Regions));
      }
    });
  });

  const pAvailabilityZones = new Promise((resolve, rej) => {
    // Retrieves availability zones only for region of the ec2 service object
    ec2.describeAvailabilityZones(params, function (err, data) {
      if (err) {
        rej(err);
      } else {
        resolve(data.AvailabilityZones);
      }
    });
  });

  const result = await p;
  const availabilityZones = await pAvailabilityZones;
  res.send({ regions: result, zones: availabilityZones });
});

const createKeyPair = catchAsync(async (req, res) => {
  // Retrieve key pair descriptions; no params needed
  const p = new Promise((resolve, rej) => {
    const params = {
      KeyName: config.awsKeyPair,
    };
    // Create the key pair
    ec2.createKeyPair(params, function (err, data) {
      if (err) {
        console.log('Error', err);
        rej(err);
      } else {
        console.log(JSON.stringify(data));
        resolve(data);
      }
    });
  });

  const result = await p;
  res.send(result);
});

const deleteKeyPair = catchAsync(async (req, res) => {
  // Retrieve key pair descriptions; no params needed
  const p = new Promise((resolve, rej) => {
    const params = {
      KeyName: config.awsKeyPair,
    };
    // Create the key pair
    ec2.deleteKeyPair(params, function (err, data) {
      if (err) {
        console.log('Error', err);
        rej(err);
      } else {
        console.log(JSON.stringify(data));
        resolve(data);
      }
    });
  });

  const result = await p;
  res.send(result);
});

const createEc2Instance = catchAsync(async (req, res) => {
  // AMI is amzn-ami-2011.09.1.x86_64-ebs
  const instanceParams = {
    ImageId: 'ami-04505e74c0741db8d',
    InstanceType: 't2.micro',
    KeyName: config.awsKeyPair,
    MinCount: 1,
    MaxCount: 1,
  };

  const p = new Promise((resolve, rej) => {
    // Create a promise on an EC2 service object
    const instancePromise = ec2.runInstances(instanceParams).promise();

    // Handle promise's fulfilled/rejected states
    instancePromise
      .then(async function (data) {
        console.log(data);
        const instanceId = data.Instances[0].InstanceId;
        console.log('Created instance', instanceId);
        await sleep(3000);
        // Add tags to the instance
        const tagParams = {
          Resources: [instanceId],
          Tags: [
            {
              Key: 'Name',
              Value: 'SDK Sample',
            },
          ],
        };
        // Create a promise on an EC2 service object
        const tagPromise = ec2.createTags(tagParams).promise();
        // Handle promise's fulfilled/rejected states
        tagPromise
          .then(function () {
            console.log('Instance tagged');
            resolve(instanceId);
          })
          .catch(function (err) {
            rej(err);
          });
      })
      .catch(function (err) {
        rej(err);
      });
  });

  const result = await p;
  res.status(httpStatus.CREATED).send({ instanceId: result });
});

const startEc2Instance = catchAsync(async (req, res) => {
  const params = {
    DryRun: false,
    InstanceIds: [req.params.instanceId],
  };
  const p = new Promise((resolve, rej) => {
    // Call EC2 to retrieve policy for selected bucket
    ec2.startInstances(params, function (err, data) {
      if (err) {
        console.log('Error', err.stack);
        rej(rej);
      } else {
        console.log('Success', JSON.stringify(data));
        resolve(data);
      }
    });
  });
  const result = await p;
  res.status(httpStatus.OK).send({ data: result });
});

const rebootEc2Instance = catchAsync(async (req, res) => {
  const params = {
    DryRun: false,
    InstanceIds: [req.params.instanceId],
  };
  const p = new Promise((resolve, rej) => {
    // Call EC2 to retrieve policy for selected bucket
    ec2.rebootInstances(params, function (err, data) {
      if (err) {
        console.log('Error', err.stack);
        rej(rej);
      } else {
        console.log('Success', JSON.stringify(data));
        resolve(data);
      }
    });
  });
  const result = await p;
  res.status(httpStatus.OK).send({ data: result });
});

const stopEc2Instance = catchAsync(async (req, res) => {
  const params = {
    DryRun: false,
    InstanceIds: [req.params.instanceId],
  };
  const p = new Promise((resolve, rej) => {
    // Call EC2 to retrieve policy for selected bucket
    ec2.stopInstances(params, function (err, data) {
      if (err) {
        console.log('Error', err.stack);
        rej(rej);
      } else {
        console.log('Success', JSON.stringify(data));
        resolve(data);
      }
    });
  });
  const result = await p;
  res.status(httpStatus.OK).send({ data: result });
});

const terminateEc2Instance = catchAsync(async (req, res) => {
  const params = {
    DryRun: false,
    InstanceIds: [req.params.instanceId],
  };
  const p = new Promise((resolve, rej) => {
    // Call EC2 to retrieve policy for selected bucket
    ec2.terminateInstances(params, function (err, data) {
      if (err) {
        console.log('Error', err.stack);
        rej(rej);
      } else {
        console.log('Success', JSON.stringify(data));
        resolve(data);
      }
    });
  });
  const result = await p;
  res.status(httpStatus.OK).send({ data: result });
});

const getInstance = catchAsync(async (req, res) => {
  const params = {
    DryRun: false,
  };
  const p = new Promise((resolve, rej) => {
    // Call EC2 to retrieve policy for selected bucket
    ec2.describeInstances(params, function (err, data) {
      if (err) {
        console.log('Error', err.stack);
        rej(rej);
      } else {
        console.log('Success', JSON.stringify(data));
        resolve(data);
      }
    });
  });
  const result = await p;

  res.status(httpStatus.OK).send({ data: result });
});

module.exports = {
  createEc2Instance,
  stopEc2Instance,
  startEc2Instance,
  terminateEc2Instance,
  describeKeyPair,
  getInstance,
  createKeyPair,
  deleteKeyPair,
  rebootEc2Instance,
  regionsAndAvailabilityZones,
};
