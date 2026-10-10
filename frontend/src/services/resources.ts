import api from './api';
import { Resource } from '../types';

// Retrieve all reference resources with optional category filter
export const getResources = async (params?: { category?: string }): Promise<Resource[]> => {
  const response = await api.get<Resource[]>('/resources', { params });
  return response.data;
};

// Retrieve a single resource by its ID
export const getResourceById = async (id: string): Promise<Resource> => {
  const response = await api.get<Resource>(`/resources/${id}`);
  return response.data;
};

// Create a new reference resource (admin only)
export const createResource = async (resource: Partial<Resource>): Promise<Resource> => {
  const response = await api.post<Resource>('/resources', resource);
  return response.data;
};

// Update an existing reference resource by ID (admin only)
export const updateResource = async (id: string, resource: Partial<Resource>): Promise<Resource> => {
  const response = await api.put<Resource>(`/resources/${id}`, resource);
  return response.data;
};

// Delete a reference resource by ID (admin only)
export const deleteResource = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/resources/${id}`);
  return response.data;
};
