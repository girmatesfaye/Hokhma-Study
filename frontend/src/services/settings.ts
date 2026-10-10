import api from './api';
import { AuthorProfile, FaithStatement } from '../types';

// Retrieve public author profile and statement of faith
export const getPublicSettings = async (): Promise<{
  profile: AuthorProfile;
  faithStatements: FaithStatement[];
}> => {
  const response = await api.get<{ profile: AuthorProfile; faithStatements: FaithStatement[] }>('/settings/public');
  return response.data;
};

// Update author biographical profile (admin only)
export const updateAuthorProfile = async (profile: Partial<AuthorProfile>): Promise<{ message: string; profile: AuthorProfile }> => {
  const response = await api.put<{ message: string; profile: AuthorProfile }>('/settings/profile', profile);
  return response.data;
};

// Update statement of faith doctrines (admin only)
export const updateFaithStatements = async (
  faithStatements: FaithStatement[]
): Promise<{ message: string; faithStatements: FaithStatement[] }> => {
  const response = await api.put<{ message: string; faithStatements: FaithStatement[] }>('/settings/faith', {
    faithStatements
  });
  return response.data;
};
