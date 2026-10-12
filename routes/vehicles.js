const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/vehiclesController');

router.get('/', ctrl.getAllVehicles);
router.get('/client/:clientId', ctrl.getVehiclesByClient);
router.get('/:id', ctrl.getVehicleById);
router.post('/', ctrl.createVehicle);
router.put('/:id', ctrl.updateVehicle);
router.delete('/:id', ctrl.deleteVehicle);

module.exports = router;