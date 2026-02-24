const Resource = require('../models/Resource');

const createResource = async (req, res) => {
  try {
    const { title, url, category, description } = req.body;
    const createdBy = req.user.id;

    if (!title || !url || !category) {
      return res.status(400).json({ error: 'Title, URL, and category are required' });
    }

    const validCategories = ['Boxes', 'Decorations', 'Ingredients', 'Tools', 'Other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const resource = await Resource.create(title, url, category, description, createdBy);

    res.status(201).json({
      message: 'Resource created successfully',
      resource
    });
  } catch (error) {
    console.error('Create resource error:', error);
    res.status(500).json({ error: 'Failed to create resource' });
  }
};

const getAllResources = async (req, res) => {
  try {
    const resources = await Resource.getAll();
    res.json({ resources });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ error: 'Failed to get resources' });
  }
};

const getResourcesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const resources = await Resource.getByCategory(category);
    res.json({ resources });
  } catch (error) {
    console.error('Get resources by category error:', error);
    res.status(500).json({ error: 'Failed to get resources' });
  }
};

const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Resource.delete(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({ error: 'Failed to delete resource' });
  }
};

module.exports = {
  createResource,
  getAllResources,
  getResourcesByCategory,
  deleteResource
};
