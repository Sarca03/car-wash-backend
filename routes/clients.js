const express = require('express');
const router = express.Router();
const clientsController = require('../controllers/clientsController');

// GET /api/clients: svi klijenti
router.get('/', clientsController.getAllClients);

// GET /api/clients/:id: jedan klijent
router.get('/:id', clientsController.getClientById);

// POST /api/clients: novi klijent
router.post('/', clientsController.createClient);

// PUT /api/clients/:id: izmeni klijenta
router.put('/:id', clientsController.updateClient);

// DELETE /api/clients/:id: obriši klijenta
router.delete('/:id', clientsController.deleteClient);

module.exports = router;