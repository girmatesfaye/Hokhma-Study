import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import { Topic } from '../models/Topic.js';
import { Article } from '../models/Article.js';
import { Question } from '../models/Question.js';
import { LearningPath } from '../models/LearningPath.js';
import { Resource } from '../models/Resource.js';
import { Comment } from '../models/Comment.js';
import { SiteSettings } from '../models/SiteSettings.js';
import {
  INITIAL_TOPICS,
  INITIAL_ARTICLES,
  INITIAL_QUESTIONS,
  INITIAL_PATHS,
  INITIAL_RESOURCES,
  INITIAL_COMMENTS,
  STATEMENT_OF_FAITH,
  AUTHOR_BIO
} from './seedData.js';

// Execute idempotent content seeding without deleting admins or analytics
const runContentSeed = async (): Promise<void> => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await connectDB();

    console.log('[Seed] Commencing non-destructive content verification and insertion...');

    // 1. Seed Topics
    let insertedTopics = 0;
    for (const topicData of INITIAL_TOPICS) {
      const existing = await Topic.findOne({ slug: topicData.slug });
      if (!existing) {
        await Topic.create(topicData);
        insertedTopics++;
      }
    }
    console.log(`[Seed] Topics: ${insertedTopics} added (${INITIAL_TOPICS.length - insertedTopics} already present).`);

    // 2. Seed Articles
    let insertedArticles = 0;
    for (const articleData of INITIAL_ARTICLES) {
      const existing = await Article.findOne({ slug: articleData.slug });
      if (!existing) {
        await Article.create(articleData as any);
        insertedArticles++;
      }
    }
    console.log(`[Seed] Articles: ${insertedArticles} added (${INITIAL_ARTICLES.length - insertedArticles} already present).`);

    // 3. Seed Theological Questions
    let insertedQuestions = 0;
    for (const questionData of INITIAL_QUESTIONS) {
      const existing = await Question.findOne({
        articleSlug: questionData.articleSlug,
        text: questionData.text
      });
      if (!existing) {
        await Question.create(questionData as any);
        insertedQuestions++;
      }
    }
    console.log(`[Seed] Questions: ${insertedQuestions} added (${INITIAL_QUESTIONS.length - insertedQuestions} already present).`);

    // 4. Seed Learning Paths
    let insertedPaths = 0;
    for (const pathData of INITIAL_PATHS) {
      const existing = await LearningPath.findOne({ slug: pathData.slug });
      if (!existing) {
        await LearningPath.create(pathData as any);
        insertedPaths++;
      }
    }
    console.log(`[Seed] Learning Paths: ${insertedPaths} added (${INITIAL_PATHS.length - insertedPaths} already present).`);

    // 5. Seed Reference Resources
    let insertedResources = 0;
    for (const resourceData of INITIAL_RESOURCES) {
      const existing = await Resource.findOne({
        title: resourceData.title,
        author: resourceData.author
      });
      if (!existing) {
        await Resource.create(resourceData as any);
        insertedResources++;
      }
    }
    console.log(`[Seed] Resources: ${insertedResources} added (${INITIAL_RESOURCES.length - insertedResources} already present).`);

    // 6. Seed Reader Comments
    let insertedComments = 0;
    for (const commentData of INITIAL_COMMENTS) {
      const existing = await Comment.findOne({
        articleSlug: commentData.articleSlug,
        authorName: commentData.authorName,
        text: commentData.text
      });
      if (!existing) {
        await Comment.create(commentData);
        insertedComments++;
      }
    }
    console.log(`[Seed] Comments: ${insertedComments} added (${INITIAL_COMMENTS.length - insertedComments} already present).`);

    // 7. Seed Site Settings Singleton
    const existingSettings = await SiteSettings.findOne({ singletonKey: 'site_settings' });
    if (!existingSettings) {
      await SiteSettings.create({
        singletonKey: 'site_settings',
        profile: AUTHOR_BIO,
        faithStatements: STATEMENT_OF_FAITH
      });
      console.log('[Seed] Site Settings: Singleton document initialized.');
    } else {
      console.log('[Seed] Site Settings: Singleton document already configured. Preserving existing values.');
    }

    console.log('[Seed] Content seeding completed successfully.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    const err = error as Error;
    console.error(`[Seed Error] Seeding failed: ${err.message}`);
    await mongoose.disconnect();
    process.exit(1);
  }
};

runContentSeed();
