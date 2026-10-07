-- Referans şema: uygulama açılışında IF NOT EXISTS ile oluşturulur.
PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,name TEXT NOT NULL,salt TEXT NOT NULL,password_hash TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),expires_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS courses(id TEXT PRIMARY KEY);CREATE TABLE IF NOT EXISTS lessons(id TEXT PRIMARY KEY,course TEXT REFERENCES courses(id),position INTEGER);
 CREATE TABLE IF NOT EXISTS translations(entity TEXT,locale TEXT,title TEXT,body TEXT,PRIMARY KEY(entity,locale));CREATE TABLE IF NOT EXISTS progress(owner TEXT REFERENCES users(id),lesson TEXT REFERENCES lessons(id),completed INTEGER,PRIMARY KEY(owner,lesson));
