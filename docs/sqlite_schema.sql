-- SQLite Schema for Nikki

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL UNIQUE,
    user_name TEXT NOT NULL,
    password TEXT NOT NULL
);

-- Nikki Table
CREATE TABLE IF NOT EXISTS nikki (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_by INTEGER NOT NULL,
    title TEXT NOT NULL,
    goodness INTEGER DEFAULT 10,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tag Table
CREATE TABLE IF NOT EXISTS tag (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_by INTEGER NOT NULL,
    name TEXT NOT NULL,
    UNIQUE(created_by, name)
);

-- Nikki-Tag Association Table
CREATE TABLE IF NOT EXISTS nikkitag (
    nikki_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (nikki_id, tag_id),
    FOREIGN KEY (nikki_id) REFERENCES nikki(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tag(id) ON DELETE CASCADE
);

-- Public Nikki Table
CREATE TABLE IF NOT EXISTS public_nikki (
    user_id INTEGER NOT NULL,
    other_user_id INTEGER NOT NULL,
    nikki_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, other_user_id, nikki_id)
);
