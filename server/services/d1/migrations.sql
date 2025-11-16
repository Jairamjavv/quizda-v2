-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firebase_uid TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL,
    role TEXT NOT NULL
);

-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    metadata_url TEXT NOT NULL -- Reference to JSON chunks in Cloudflare R2
);