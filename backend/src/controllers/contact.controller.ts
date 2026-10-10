import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { ContactMessage } from '../models/ContactMessage.js';

// Send notification email asynchronously when mailer is configured
const sendContactNotification = async (message: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_RECEIVER_EMAIL } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !CONTACT_RECEIVER_EMAIL) {
    return; // Mail service optional or not fully configured in local dev
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: `"Hokhma Study Contact" <${SMTP_USER}>`,
      to: CONTACT_RECEIVER_EMAIL,
      replyTo: message.email,
      subject: `[Hokhma Study Inquiry] ${message.subject}`,
      text: `From: ${message.name} (${message.email})\n\nMessage:\n${message.message}`
    });
  } catch (err) {
    console.warn('[Contact Mailer Warning] Could not dispatch notification email:', (err as Error).message);
  }
};

// Submit a new reader contact inquiry and persist to database (public)
export const submitContactMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      res.status(400).json({ message: 'Name, email, subject, and message are required.' });
      return;
    }

    const newMessage = await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      submittedAt: new Date().toISOString(),
      isRead: false
    });

    // Attempt optional email notification in background
    sendContactNotification({ name, email, subject, message });

    res.status(201).json({
      message: 'Your message has been received. Thank you for reaching out.',
      data: newMessage
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to submit contact message.', error: err.message });
  }
};

// Retrieve all contact inquiries for administrative review (admin authenticated)
export const getAllContactMessages = async (_req: Request, res: Response): Promise<void> => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to retrieve contact messages.', error: err.message });
  }
};

// Toggle or update the read/unread status of a contact inquiry (admin authenticated)
export const toggleReadStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const message = await ContactMessage.findById(id);

    // Return 404 if message not found
    if (!message) {
      res.status(404).json({ message: 'Contact message not found.' });
      return;
    }

    message.isRead = !message.isRead;
    await message.save();

    res.status(200).json({ message: 'Status updated successfully.', data: message });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to update message status.', error: err.message });
  }
};

// Delete a contact inquiry (admin authenticated)
export const deleteContactMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await ContactMessage.findByIdAndDelete(id);

    // Return 404 if message not found
    if (!deleted) {
      res.status(404).json({ message: 'Contact message not found.' });
      return;
    }

    res.status(200).json({ message: 'Contact message deleted successfully.' });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to delete contact message.', error: err.message });
  }
};
