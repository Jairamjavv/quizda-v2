/**
 * Seed script for populating initial database data
 * Run with: wrangler d1 execute quizda-d1-db --remote --file=./dist/seed.sql
 */

import { drizzle } from "drizzle-orm/d1";
import { categories, tags } from "../db/schema";

// Categories to seed (matching frontend quizCategories.ts)
const CATEGORIES = [
  {
    name: "General Knowledge",
    description: "Questions about general knowledge and trivia",
  },
  {
    name: "Science",
    description: "Scientific concepts, discoveries, and principles",
  },
  {
    name: "Mathematics & Logic",
    description: "Mathematical problems and logical reasoning",
  },
  {
    name: "Technology & Computing",
    description: "Technology, programming, and computing topics",
  },
  { name: "History", description: "Historical events, figures, and periods" },
  { name: "Geography", description: "Places, maps, and geographical features" },
  {
    name: "Culture & Society",
    description: "Cultural topics and social issues",
  },
  {
    name: "Literature & Language",
    description: "Books, authors, and language topics",
  },
  {
    name: "Arts & Entertainment",
    description: "Visual arts, music, movies, and entertainment",
  },
  {
    name: "Sports & Games",
    description: "Sports, games, and competitive activities",
  },
  {
    name: "Business & Economics",
    description: "Business principles and economic concepts",
  },
  {
    name: "Politics & Governance",
    description: "Political systems and governance",
  },
  {
    name: "Philosophy & Psychology",
    description: "Philosophical ideas and psychological concepts",
  },
  {
    name: "Health & Medicine",
    description: "Health, wellness, and medical topics",
  },
  {
    name: "Nature & Environment",
    description: "Natural world and environmental topics",
  },
  {
    name: "Food & Culinary",
    description: "Cooking, cuisine, and food culture",
  },
  {
    name: "Religion & Mythology",
    description: "Religious beliefs and mythological stories",
  },
  { name: "Pop Culture", description: "Current trends and popular culture" },
  {
    name: "Education & Careers",
    description: "Educational topics and career development",
  },
  {
    name: "Automotive & Transportation",
    description: "Vehicles and transportation systems",
  },
  {
    name: "Home & Lifestyle",
    description: "Home improvement and lifestyle topics",
  },
  {
    name: "Mythos & Fictional Universes",
    description: "Fictional worlds and characters",
  },
  { name: "Ethics & Law", description: "Ethical principles and legal topics" },
  {
    name: "Personal Development",
    description: "Self-improvement and personal growth",
  },
  {
    name: "Special Topics / Custom",
    description: "Custom or specialized topics",
  },
];

// Common tags to seed
const TAGS = [
  "beginner",
  "intermediate",
  "advanced",
  "trivia",
  "educational",
  "fun",
  "competitive",
  "practice",
  "certification",
  "quick",
];

/**
 * Generate SQL for seeding
 */
export function generateSeedSQL(): string {
  const sqlStatements: string[] = [];

  // Insert categories
  CATEGORIES.forEach((cat) => {
    const name = cat.name.replace(/'/g, "''");
    const desc = cat.description.replace(/'/g, "''");
    sqlStatements.push(
      `INSERT OR IGNORE INTO categories (name, description) VALUES ('${name}', '${desc}');`
    );
  });

  // Insert tags
  TAGS.forEach((tag) => {
    const tagName = tag.replace(/'/g, "''");
    sqlStatements.push(
      `INSERT OR IGNORE INTO tags (name) VALUES ('${tagName}');`
    );
  });

  return sqlStatements.join("\n");
}

// Export SQL to console (for manual execution or file generation)
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(generateSeedSQL());
}
