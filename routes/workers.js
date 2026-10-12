const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/workersController');

router.get('/', ctrl.getAllWorkers);
router.get('/:id', ctrl.getWorkerById);
router.post('/', ctrl.createWorker);
router.put('/:id', ctrl.updateWorker);
router.delete('/:id', ctrl.deleteWorker);

module.exports = router;