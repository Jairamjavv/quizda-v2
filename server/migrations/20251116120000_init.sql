CREATE TABLE `attempts` (
    `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    `quiz_id` integer NOT NULL,
    `user_id` integer NOT NULL,
    `score` integer DEFAULT 0 NOT NULL,
    `total_questions` integer NOT NULL,
    `correct_answers` integer DEFAULT 0 NOT NULL,
    `time_taken` integer,
    `status` text DEFAULT 'in_progress' NOT NULL,
    `started_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
    `completed_at` integer,
    FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON UPDATE no action ON DELETE no action,
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE no action ON DELETE no action
);
-- statement-breakpoint
CREATE TABLE IF NOT EXISTS `categories` (
    `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    `name` text NOT NULL,
    `description` text,
    `created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
-- statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `categories_name_unique` ON `categories` (`name`);
-- statement-breakpoint
CREATE TABLE IF NOT EXISTS `quiz_tags` (
    `quiz_id` integer NOT NULL,
    `tag_id` integer NOT NULL,
    FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON UPDATE no action ON DELETE cascade
);
-- statement-breakpoint
CREATE TABLE IF NOT EXISTS `quizzes` (
    `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    `title` text NOT NULL,
    `description` text,
    `category_id` integer,
    `creator_id` integer NOT NULL,
    `difficulty` text DEFAULT 'medium' NOT NULL,
    `time_limit` integer,
    `total_questions` integer DEFAULT 0 NOT NULL,
    `is_published` integer DEFAULT false NOT NULL,
    `r2_key` text,
    `created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
    `updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
    FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON UPDATE no action ON DELETE no action,
    FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`) ON UPDATE no action ON DELETE no action
);
-- statement-breakpoint
CREATE TABLE IF NOT EXISTS `tags` (
    `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    `name` text NOT NULL,
    `created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
-- statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `tags_name_unique` ON `tags` (`name`);
-- statement-breakpoint
CREATE TABLE IF NOT EXISTS `user_answers` (
    `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    `attempt_id` integer NOT NULL,
    `question_index` integer NOT NULL,
    `user_answer` text NOT NULL,
    `is_correct` integer NOT NULL,
    `time_spent` integer,
    `created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
    FOREIGN KEY (`attempt_id`) REFERENCES `attempts` (`id`) ON UPDATE no action ON DELETE cascade
);
-- statement-breakpoint
CREATE TABLE IF NOT EXISTS `users` (
    `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    `firebase_uid` text NOT NULL,
    `email` text NOT NULL,
    `username` text NOT NULL,
    `role` text DEFAULT 'attempter' NOT NULL,
    `created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
    `updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
-- statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `users_firebase_uid_unique` ON `users` (`firebase_uid`);
-- statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `users_email_unique` ON `users` (`email`);
-- statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `users_username_unique` ON `users` (`username`);