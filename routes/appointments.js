const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/appointmentsController');

router.get('/', ctrl.getAllAppointments);
router.get('/stats', ctrl.getStats);
router.get('/:id', ctrl.getAppointmentById);
router.post('/', ctrl.createAppointment);
router.put('/:id', ctrl.updateAppointment);
router.patch('/:id/status', ctrl.updateStatus);
router.delete('/:id', ctrl.deleteAppointment);

module.exports = router;