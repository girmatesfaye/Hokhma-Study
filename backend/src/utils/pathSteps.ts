import { Article } from '../models/Article.js';
import { ILearningPathStep } from '../models/LearningPath.js';

// A path's steps are its only definition; level numbers, article list, article count and reading time are derived from them.
export const derivePathFields = async (steps: ILearningPathStep[] = []) => {
  const numberedSteps = steps.map((step, index) => ({ ...step, level: index + 1 }));
  const articleSlugs = numberedSteps
    .filter((step) => step.type === 'article' && step.articleSlug)
    .map((step) => step.articleSlug as string);

  const articles = await Article.find({ slug: { $in: articleSlugs } }).select('slug readingTime');
  const readingTimeBySlug = new Map(articles.map((a) => [a.slug, a.readingTime]));
  const totalReadingTime = articleSlugs.reduce((sum, slug) => sum + (readingTimeBySlug.get(slug) || 0), 0);

  return { steps: numberedSteps, articleSlugs, articleCount: articleSlugs.length, totalReadingTime };
};
