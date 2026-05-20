require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-greenspace-key';

const app = express();
const port = process.env.PORT || 5000;


app.use(cors()); 
app.use(express.json()); 


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Помилка підключення до бази Terraforma:', err.stack);
  }
  console.log('Успішно підключено до бази даних Terraforma!');
  release();
});


app.get('/api/services', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM services ORDER BY type, name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Помилка сервера при отриманні послуг' });
  }
});


app.get('/api/workers', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE role = 'worker'");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Помилка сервера при отриманні працівників' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { client_id, client_name, client_phone, client_email, description, address } = req.body;
    
    
    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

    const newOrder = await pool.query(
      `INSERT INTO orders (id, client_id, client_name, client_phone, client_email, description, address, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'new') RETURNING *`,
      [orderId, client_id, client_name, client_phone, client_email, description, address]
    );

    res.status(201).json(newOrder.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Помилка при створенні замовлення' });
  }
});


app.get('/api/orders/client/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM orders WHERE client_id = $1 ORDER BY created_at DESC', [id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Помилка при отриманні замовлень клієнта' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Помилка при отриманні всіх замовлень' });
  }
});


app.put('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      status, scheduled_date, work_hours, hourly_rate, 
      transport_km, transport_rate, materials_cost, manager_notes, total_amount 
    } = req.body;

    const result = await pool.query(
      `UPDATE orders 
       SET status = $1, scheduled_date = $2, work_hours = $3, hourly_rate = $4, 
           transport_km = $5, transport_rate = $6, materials_cost = $7, manager_notes = $8, total_amount = $9
       WHERE id = $10 RETURNING *`,
      [
        status, 
        scheduled_date || null, 
        work_hours || null, 
        hourly_rate || null, 
        transport_km || null, 
        transport_rate || null, 
        materials_cost || null, 
        manager_notes || null, 
        total_amount || null,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Замовлення не знайдено' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Помилка при оновленні замовлення' });
  }
});

app.get('/api/schedules', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM schedules ORDER BY date ASC, start_time ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Помилка отримання розкладу' });
  }
});


app.post('/api/schedules', async (req, res) => {
  try {
    const { order_id, worker_id, worker_name, date, start_time, address, notes } = req.body;
    
    
    const scheduleId = 'SCH-' + Math.floor(100000 + Math.random() * 900000);
    
   
    const result = await pool.query(
      `INSERT INTO schedules (id, order_id, worker_id, worker_name, date, start_time, address, notes, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'planned') RETURNING *`,
      [scheduleId, order_id, worker_id, worker_name, date, start_time, address, notes]
    );

    
    await pool.query(
      `INSERT INTO order_workers (order_id, worker_id) 
       VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [order_id, worker_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Помилка при створенні зміни' });
  }
});

app.get('/api/schedules/worker/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM schedules WHERE worker_id = $1 ORDER BY date ASC, start_time ASC', [id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Помилка отримання розкладу працівника' });
  }
});


app.get('/api/work-logs/worker/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM work_logs WHERE worker_id = $1 ORDER BY date DESC', [id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Помилка отримання звітів' });
  }
});


app.post('/api/work-logs', async (req, res) => {
  try {
    const { schedule_id, worker_id, order_id, date, actual_hours, km_driven, notes } = req.body;
    
  
    const logId = 'WL-' + Math.floor(100000 + Math.random() * 900000);

   
    const result = await pool.query(
      `INSERT INTO work_logs (id, schedule_id, worker_id, order_id, date, actual_hours, km_driven, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [logId, schedule_id, worker_id, order_id, date, actual_hours, km_driven, notes]
    );

   
    await pool.query('UPDATE schedules SET status = $1 WHERE id = $2', ['completed', schedule_id]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Помилка при збереженні звіту' });
  }
});

app.get('/api/salary-records/worker/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM salary_records WHERE worker_id = $1 ORDER BY period_start DESC', [id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Помилка отримання зарплат' });
  }
});

app.get('/api/work-logs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM work_logs ORDER BY date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Помилка отримання звітів' });
  }
});


app.put('/api/workers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { salary_hourly_rate, client_hourly_rate } = req.body;
    
    const result = await pool.query(
      `UPDATE users 
       SET salary_hourly_rate = $1, client_hourly_rate = $2 
       WHERE id = $3 RETURNING *`,
      [salary_hourly_rate || null, client_hourly_rate || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Працівника не знайдено' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Помилка оновлення ставок' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Помилка отримання користувачів' });
  }
});



app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password, role, secretCode } = req.body;

 
    if (role === 'worker' && secretCode !== 'GREEN2024') {
      return res.status(403).json({ error: 'Невірний секретний код для реєстрації працівника' });
    }

   
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Користувач з таким email вже існує' });
    }

    
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    
    const userId = Math.floor(100000 + Math.random() * 900000).toString();
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`;

    
    const salary_rate = role === 'worker' ? 150 : null;
    const client_rate = role === 'worker' ? 300 : null;

    const newUser = await pool.query(
      `INSERT INTO users (id, email, name, phone, role, avatar, salary_hourly_rate, client_hourly_rate, password_hash) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, email, name, phone, role, avatar, salary_hourly_rate, client_hourly_rate`,
      [userId, email, name, phone, role, avatar, salary_rate, client_rate, password_hash]
    );

    
    const token = jwt.sign({ id: newUser.rows[0].id, role: newUser.rows[0].role }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({ user: newUser.rows[0], token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Помилка реєстрації' });
  }
});


app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Невірний email або пароль' });
    }

    const user = result.rows[0];


    let isMatch = false;
    if (user.password_hash) {
      isMatch = await bcrypt.compare(password, user.password_hash);
    } else {
     
      isMatch = (password === 'password' || password === 'будь-який'); 
    }

    if (!isMatch) {
      return res.status(400).json({ error: 'Невірний email або пароль' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

  
    delete user.password_hash;

    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Помилка входу' });
  }
});

app.get('/api/portfolio', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM portfolio_items ORDER BY completed_date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Помилка при отриманні портфоліо' });
  }
});

app.listen(port, () => {
  console.log(`Бекенд Terraforma працює на http://localhost:${port}`);
});