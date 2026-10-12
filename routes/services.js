const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/servicesController');

router.get('/', ctrl.getAllServices);
router.get('/:id', ctrl.getServiceById);
router.post('/', ctrl.createService);
router.put('/:id', ctrl.updateService);
router.delete('/:id', ctrl.deleteService);

module.exports = router;