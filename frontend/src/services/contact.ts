import api from './api';
import { ContactMessage } from '../types';

// Submit a reader contact inquiry
export const submitContactMessage = async (message: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<{ message: string; data: ContactMessage }> => {
  const response = await api.post<{ message: string; data: ContactMessage }>('/contact', message);
  return response.data;
};

// Retrieve all contact inquiries (admin only)
export const getAllContactMessages = async (): Promise<ContactMessage[]> => {
  const response = await api.get<ContactMessage[]>('/contact');
  return response.data;
};

// Toggle or update the read status of a contact inquiry (admin only)
export const toggleContactReadStatus = async (id: string): Promise<{ message: string; data: ContactMessage }> => {
  const response = await api.patch<{ message: string; data: ContactMessage }>(`/contact/${id}/read`);
  return response.data;
};

// Delete a contact inquiry (admin only)
export const deleteContactMessage = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/contact/${id}`);
  return response.data;
};
