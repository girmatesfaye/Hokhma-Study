import { Request, Response } from 'express';
import { Resource } from '../models/Resource.js';

// Retrieve all reference resources with optional category filter
export const getAllResources = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.query;
    const filter: Record<string, any> = {};

    // Filter by resource category when specified
    if (category) {
      filter.category = String(category);
    }

    const resources = await Resource.find(filter).sort({ createdAt: -1 });
    res.status(200).json(resources);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to retrieve resources.', error: err.message });
  }
};

// Retrieve a single reference resource by its database ID
export const getResourceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const resource = await Resource.findById(id);

    // Return 404 if resource not found
    if (!resource) {
      res.status(404).json({ message: 'Resource not found.' });
      return;
    }

    res.status(200).json(resource);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to retrieve resource.', error: err.message });
  }
};

// Create a new reference resource (admin authenticated)
export const createResource = async (req: Request, res: Response): Promise<void> => {
  try {
    const newResource = await Resource.create(req.body);
    res.status(201).json(newResource);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to create resource.', error: err.message });
  }
};

// Update an existing reference resource by ID (admin authenticated)
export const updateResource = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await Resource.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    // Return 404 if resource not found
    if (!updated) {
      res.status(404).json({ message: 'Resource not found.' });
      return;
    }

    res.status(200).json(updated);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to update resource.', error: err.message });
  }
};

// Delete a reference resource by ID (admin authenticated)
export const deleteResource = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await Resource.findByIdAndDelete(id);

    // Return 404 if resource not found
    if (!deleted) {
      res.status(404).json({ message: 'Resource not found.' });
      return;
    }

    res.status(200).json({ message: 'Resource deleted successfully.' });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to delete resource.', error: err.message });
  }
};
