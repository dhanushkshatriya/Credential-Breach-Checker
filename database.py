import sqlite3
import hashlib

def init_db():
    conn = sqlite3.connect('breaches.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS breached_passwords (hash TEXT PRIMARY KEY)''')
    c.execute('''CREATE TABLE IF NOT EXISTS breached_emails (hash TEXT PRIMARY KEY)''')
    
    # Mock data for demonstration purposes
    passwords = ['password123', 'admin', '123456', 'hello', 'qwerty', '111111', '123456789']
    for p in passwords:
        h = hashlib.sha1(p.encode('utf-8')).hexdigest().upper()
        c.execute('INSERT OR IGNORE INTO breached_passwords (hash) VALUES (?)', (h,))
        
    emails = ['test@example.com', 'admin@example.com', 'user@example.com']
    for e in emails:
        h = hashlib.sha256(e.lower().encode('utf-8')).hexdigest()
        c.execute('INSERT OR IGNORE INTO breached_emails (hash) VALUES (?)', (h,))
        
    conn.commit()
    conn.close()
    print("Database initialized and mock data inserted.")

if __name__ == '__main__':
    init_db()
