const express = require('express');
const Database = require('better-sqlite3');

const app = express();
const db = new Database('tasks.db');
const PORT = process.env.PORT || 3000;

app.use(express.json());

db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        done BOOLEAN NOT NULL DEFAULT 0
    )
`);

const taskCount = db.prepare('SELECT COUNT(*) AS count FROM tasks').get();

if (taskCount.count === 0) {
    const insert = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');

    insert.run('Learn Node.js', 0);
    insert.run('Build a REST API', 0);
    insert.run('Connect SQLite', 0);
}

app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});
app.get('/hello', (req, res) => {
  res.json({ message: 'Hello World!' });
});
app.get('/tasks', (req, res) => {
    const tasks = db.prepare('SELECT * FROM tasks').all();
    res.json(tasks);
});

app.get('/tasks/:id', (req, res) => {
    const task = db
        .prepare('SELECT * FROM tasks WHERE id = ?')
        .get(req.params.id);

    if (!task) {
        return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
});

app.post('/tasks', (req, res) => {
    const { title } = req.body;

    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    const result = db
        .prepare('INSERT INTO tasks (title, done) VALUES (?, ?)')
        .run(title, 0);

    const task = db
        .prepare('SELECT * FROM tasks WHERE id = ?')
        .get(result.lastInsertRowid);

    res.status(201).json(task);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});