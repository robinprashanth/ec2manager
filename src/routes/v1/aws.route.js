const express = require('express');
const awsController = require('../../controllers/aws.controller');

const router = express.Router();

router.route('/').get(awsController.getInstance).post(awsController.createEc2Instance);
router.route('/start/:instanceId').get(awsController.startEc2Instance);
router.route('/reboot/:instanceId').get(awsController.rebootEc2Instance);
router.route('/stop/:instanceId').get(awsController.stopEc2Instance);
router.route('/terminate/:instanceId').get(awsController.terminateEc2Instance);
router.route('/reboot/:instanceId').get(awsController.rebootEc2Instance);

router.route('/regions').get(awsController.regionsAndAvailabilityZones);

router.route('/describe').get(awsController.describeKeyPair).post(awsController.createKeyPair);

module.exports = router;
