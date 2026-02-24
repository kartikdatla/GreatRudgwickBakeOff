const express = require('express');
const router = express.Router();
const {
  createResource,
  getAllResources,
  getResourcesByCategory,
  deleteResource
} = require('../controllers/resourceController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.post('/', authenticateToken, authorizeRoles('Admin', 'Judge'), createResource);
router.get('/', authenticateToken, getAllResources);
router.get('/category/:category', authenticateToken, getResourcesByCategory);
router.delete('/:id', authenticateToken, authorizeRoles('Admin'), deleteResource);

module.exports = router;
