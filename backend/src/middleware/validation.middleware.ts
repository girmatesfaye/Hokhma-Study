import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

// Middleware to evaluate validation result and return 400 on error
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      message: 'Validation failed for request payload.',
      errors: errors.array().map((err) => ({
        field: 'path' in err ? err.path : 'unknown',
        message: err.msg
      }))
    });
    return;
  }
  next();
};

// Admin authentication login validation rules
export const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required.')
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email address.'),
  body('password')
    .notEmpty()
    .withMessage('Password is required.')
    .isString()
    .withMessage('Password must be a string.'),
  handleValidationErrors
];

// Contact inquiry submission validation rules
export const validateContactMessage = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required.')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters.')
    .escape(),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required.')
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email address.'),
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required.')
    .isLength({ max: 150 })
    .withMessage('Subject cannot exceed 150 characters.')
    .escape(),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message body is required.')
    .isLength({ max: 5000 })
    .withMessage('Message body cannot exceed 5000 characters.'),
  handleValidationErrors
];

// Reader comment submission validation rules
export const validateComment = [
  body('author')
    .trim()
    .notEmpty()
    .withMessage('Author name is required.')
    .isLength({ max: 80 })
    .withMessage('Author name cannot exceed 80 characters.')
    .escape(),
  body('text')
    .trim()
    .notEmpty()
    .withMessage('Comment text is required.')
    .isLength({ max: 2000 })
    .withMessage('Comment text cannot exceed 2000 characters.'),
  body('articleSlug')
    .trim()
    .notEmpty()
    .withMessage('Article slug is required.')
    .isLength({ max: 150 })
    .withMessage('Article slug cannot exceed 150 characters.'),
  handleValidationErrors
];

// Theological objection question submission validation rules
export const validateQuestionSubmission = [
  body('question')
    .trim()
    .notEmpty()
    .withMessage('Question text is required.')
    .isLength({ max: 500 })
    .withMessage('Question cannot exceed 500 characters.')
    .escape(),
  body('topicSlug')
    .trim()
    .notEmpty()
    .withMessage('Topic selection is required.'),
  body('name')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters.')
    .escape(),
  body('email')
    .optional({ values: 'falsy' })
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('If provided, email must be valid.'),
  handleValidationErrors
];

// Article publishing and editing payload validation rules
export const validateArticle = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Article title is required.')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters.'),
  body('topicSlug')
    .trim()
    .notEmpty()
    .withMessage('Topic slug is required.'),
  body('difficulty')
    .trim()
    .isIn(['beginner', 'intermediate', 'deep-dive'])
    .withMessage('Difficulty must be beginner, intermediate, or deep-dive.'),
  body('excerpt')
    .trim()
    .notEmpty()
    .withMessage('Article summary excerpt is required.'),
  handleValidationErrors
];
