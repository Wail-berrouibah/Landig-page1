const express = require("express");
const session = require("express-session");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const path = require("path");
const { getDb } = require("./db");
const { requireAuth } = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 3001;
const SESSION_SECRET = process.env.SESSION_SECRET || "techpro-admin-secret-change-in-production";
const UNIT_PRICE = 89900;

const SQLiteStore = require("express-session-better-sqlite3")(session, getDb());

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(
  session({
    store: new SQLiteStore(),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: false, maxAge: 24 * 60 * 60 * 1000 },
  })
);
app.use("/admin", express.static(path.join(__dirname, "admin")));

app.get("/admin", (_req, res) => {
  res.redirect("/admin/login.html");
});

const sseClients = [];

function broadcastSSE(event, data) {
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    client.write(message);
  }
}

// ── Public endpoints ────────────────────────────────────────────────

app.post("/api/orders", (req, res) => {
  try {
    const { full_name, phone_number, wilaya, commune, delivery_address, quantity, notes } = req.body;

    if (!full_name || !full_name.trim()) {
      return res.status(400).json({ error: "Le nom complet est requis" });
    }
    if (!phone_number || !/^\+213[0-9]{9}$/.test(phone_number)) {
      return res.status(400).json({ error: "Numéro de téléphone invalide. Format: +213XXXXXXXXX" });
    }
    if (!wilaya || !wilaya.trim()) {
      return res.status(400).json({ error: "La wilaya est requise" });
    }
    if (!commune || !commune.trim()) {
      return res.status(400).json({ error: "La commune est requise" });
    }
    if (!delivery_address || !delivery_address.trim()) {
      return res.status(400).json({ error: "L'adresse de livraison est requise" });
    }
    const qty = Math.max(1, Math.min(3, parseInt(quantity, 10) || 1));

    const db = getDb();
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const datePrefix = `${yyyy}${mm}${dd}`;

    const lastToday = db
      .prepare("SELECT order_number FROM orders WHERE order_number LIKE ? ORDER BY id DESC LIMIT 1")
      .get(`ORD-${datePrefix}-%`);

    let seq = 1;
    if (lastToday) {
      seq = parseInt(lastToday.order_number.slice(-3), 10) + 1;
    }
    const orderNumber = `ORD-${datePrefix}-${String(seq).padStart(3, "0")}`;

    const result = db
      .prepare(
        `INSERT INTO orders (order_number, full_name, phone_number, wilaya, commune, delivery_address, quantity, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(orderNumber, full_name.trim(), phone_number, wilaya.trim(), commune.trim(), delivery_address.trim(), qty, notes?.trim() || null);

    db.prepare("INSERT INTO order_history (order_id, action, new_status) VALUES (?, 'created', 'pending')").run(
      result.lastInsertRowid
    );

    broadcastSSE("new_order", { order_number: orderNumber, full_name: full_name.trim() });

    res.status(201).json({ success: true, order_number: orderNumber });
  } catch (err) {
    console.error("POST /api/orders error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ── Admin auth endpoints ────────────────────────────────────────────

app.post("/api/admin/login", (req, res) => {
  try {
    const { username, email, password } = req.body;
    const login = username || email;
    if (!login || !password) {
      return res.status(400).json({ error: "Identifiant et mot de passe requis" });
    }

    const db = getDb();
    const admin = db
      .prepare("SELECT * FROM admins WHERE (username = ? OR email = ?) AND is_active = 1")
      .get(login, login);

    if (!admin) {
      return res.status(401).json({ error: "Identifiant ou mot de passe incorrect" });
    }

    if (!bcrypt.compareSync(password, admin.password_hash)) {
      return res.status(401).json({ error: "Identifiant ou mot de passe incorrect" });
    }

    req.session.adminId = admin.id;
    req.session.adminUsername = admin.username;

    db.prepare("UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?").run(admin.id);

    const forceChange = password === "ChangeMe123";

    res.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        full_name: admin.full_name,
        role: admin.role,
      },
      forcePasswordChange: forceChange,
    });
  } catch (err) {
    console.error("POST /api/admin/login error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.post("/api/admin/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// ── Admin order endpoints ───────────────────────────────────────────

app.get("/api/admin/orders", requireAuth, (req, res) => {
  try {
    const db = getDb();
    const {
      search = "",
      status = "",
      payment_status = "",
      date_from = "",
      date_to = "",
      sort_by = "created_at",
      sort_order = "DESC",
      page = "1",
      limit = "20",
    } = req.query;

    const conditions = [];
    const params = [];

    if (search) {
      conditions.push("(o.order_number LIKE ? OR o.full_name LIKE ? OR o.phone_number LIKE ?)");
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    if (status) {
      conditions.push("o.status = ?");
      params.push(status);
    }
    if (payment_status) {
      conditions.push("o.payment_status = ?");
      params.push(payment_status);
    }
    if (date_from) {
      conditions.push("o.created_at >= ?");
      params.push(date_from);
    }
    if (date_to) {
      conditions.push("o.created_at <= ?");
      params.push(date_to + " 23:59:59");
    }

    const where = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

    const allowedSort = [
      "order_number", "full_name", "phone_number", "wilaya", "quantity",
      "status", "payment_status", "created_at", "updated_at",
    ];
    const sb = allowedSort.includes(sort_by) ? sort_by : "created_at";
    const so = sort_order === "ASC" ? "ASC" : "DESC";

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const countResult = db.prepare(`SELECT COUNT(*) as total FROM orders o ${where}`).get(...params);
    const total = countResult.total;

    const orders = db
      .prepare(`SELECT o.* FROM orders o ${where} ORDER BY o.${sb} ${so} LIMIT ? OFFSET ?`)
      .all(...params, limitNum, offset)
      .map(o => ({ ...o, total: o.quantity * UNIT_PRICE }));

    res.json({
      orders,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error("GET /api/admin/orders error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.get("/api/admin/orders/export", requireAuth, (req, res) => {
  try {
    const db = getDb();
    const {
      search = "",
      status = "",
      payment_status = "",
      date_from = "",
      date_to = "",
      sort_by = "created_at",
      sort_order = "DESC",
    } = req.query;

    const conditions = [];
    const params = [];

    if (search) {
      conditions.push("(o.order_number LIKE ? OR o.full_name LIKE ? OR o.phone_number LIKE ?)");
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    if (status) {
      conditions.push("o.status = ?");
      params.push(status);
    }
    if (payment_status) {
      conditions.push("o.payment_status = ?");
      params.push(payment_status);
    }
    if (date_from) {
      conditions.push("o.created_at >= ?");
      params.push(date_from);
    }
    if (date_to) {
      conditions.push("o.created_at <= ?");
      params.push(date_to + " 23:59:59");
    }

    const where = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

    const allowedSort = [
      "order_number", "full_name", "phone_number", "wilaya", "quantity",
      "status", "payment_status", "created_at", "updated_at",
    ];
    const sb = allowedSort.includes(sort_by) ? sort_by : "created_at";
    const so = sort_order === "ASC" ? "ASC" : "DESC";

    const orders = db
      .prepare(`SELECT * FROM orders o ${where} ORDER BY o.${sb} ${so}`)
      .all(...params);

    const paymentLabels = { pending: "En attente", paid: "Payé", failed: "Échoué" };
    const statusLabels = {
      pending: "En attente", confirmed: "Confirmé", processing: "En traitement",
      shipped: "Expédié", delivered: "Livré", cancelled: "Annulé",
    };

    const esc = (v) => {
      if (v == null) return '""';
      const s = String(v).replace(/"/g, '""');
      return `"${s}"`;
    };

    const BOM = "\uFEFF";
    const headers = ["N° Commande", "Client", "Téléphone", "Wilaya", "Commune", "Adresse", "Qté", "Total (DA)", "Paiement", "Statut", "Date créée"];
    const rows = orders.map((o) =>
      [
        esc(o.order_number),
        esc(o.full_name),
        esc(o.phone_number),
        esc(o.wilaya),
        esc(o.commune),
        esc(o.delivery_address),
        esc(o.quantity),
        esc(o.quantity * UNIT_PRICE),
        esc(paymentLabels[o.payment_status] || o.payment_status),
        esc(statusLabels[o.status] || o.status),
        esc(o.created_at || ""),
      ].join(",")
    );

    const csv = BOM + headers.join(",") + "\r\n" + rows.join("\r\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="commandes.csv"');
    res.send(csv);
  } catch (err) {
    console.error("GET /api/admin/orders/export error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.get("/api/admin/orders/:id", requireAuth, (req, res) => {
  try {
    const db = getDb();
    const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Commande introuvable" });
    }
    order.total = order.quantity * UNIT_PRICE;

    const history = db
      .prepare(
        `SELECT h.*, a.full_name as admin_name
         FROM order_history h
         LEFT JOIN admins a ON h.admin_id = a.id
         WHERE h.order_id = ?
         ORDER BY h.created_at ASC`
      )
      .all(req.params.id);

    res.json({ order, history });
  } catch (err) {
    console.error("GET /api/admin/orders/:id error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.patch("/api/admin/orders/:id", requireAuth, (req, res) => {
  try {
    const db = getDb();
    const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Commande introuvable" });
    }

    const { status: newStatus, payment_status, admin_notes } = req.body;
    const updates = [];
    const params = [];

    if (newStatus && newStatus !== order.status) {
      const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
      if (!validStatuses.includes(newStatus)) {
        return res.status(400).json({ error: "Statut invalide" });
      }
      updates.push("status = ?");
      params.push(newStatus);
    }

    if (payment_status && payment_status !== order.payment_status) {
      const validPayment = ["pending", "paid", "failed"];
      if (!validPayment.includes(payment_status)) {
        return res.status(400).json({ error: "Statut de paiement invalide" });
      }
      updates.push("payment_status = ?");
      params.push(payment_status);
    }

    if (admin_notes !== undefined) {
      updates.push("admin_notes = ?");
      params.push(admin_notes);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "Aucune modification" });
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");
    params.push(req.params.id);

    db.prepare(`UPDATE orders SET ${updates.join(", ")} WHERE id = ?`).run(...params);

    if (newStatus && newStatus !== order.status) {
      db.prepare(
        "INSERT INTO order_history (order_id, action, old_status, new_status, admin_id) VALUES (?, 'status_change', ?, ?, ?)"
      ).run(req.params.id, order.status, newStatus, req.session.adminId);
    }

    if (payment_status && payment_status !== order.payment_status) {
      db.prepare(
        "INSERT INTO order_history (order_id, action, old_status, new_status, admin_id) VALUES (?, 'payment_change', ?, ?, ?)"
      ).run(req.params.id, order.payment_status, payment_status, req.session.adminId);
    }

    if (admin_notes !== undefined && admin_notes !== order.admin_notes) {
      db.prepare(
        "INSERT INTO order_history (order_id, action, note, admin_id) VALUES (?, 'note_updated', ?, ?)"
      ).run(req.params.id, admin_notes, req.session.adminId);
    }

    const updated = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id);

    broadcastSSE("order_updated", {
      id: updated.id,
      order_number: updated.order_number,
      status: updated.status,
    });

    res.json({ success: true, order: updated });
  } catch (err) {
    console.error("PATCH /api/admin/orders/:id error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.delete("/api/admin/orders/:id", requireAuth, (req, res) => {
  try {
    const db = getDb();
    const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Commande introuvable" });
    }
    db.prepare("DELETE FROM orders WHERE id = ?").run(req.params.id);
    broadcastSSE("order_deleted", { id: order.id, order_number: order.order_number });
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/admin/orders/:id error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.get("/api/admin/orders/:id/history", requireAuth, (req, res) => {
  try {
    const db = getDb();
    const history = db
      .prepare(
        `SELECT h.*, a.full_name as admin_name
         FROM order_history h
         LEFT JOIN admins a ON h.admin_id = a.id
         WHERE h.order_id = ?
         ORDER BY h.created_at ASC`
      )
      .all(req.params.id);

    res.json({ history });
  } catch (err) {
    console.error("GET /api/admin/orders/:id/history error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ── Admin management endpoints ──────────────────────────────────────

app.get("/api/admin/admins", requireAuth, (req, res) => {
  try {
    const db = getDb();
    const admins = db
      .prepare("SELECT id, username, email, full_name, role, is_active, created_at, last_login FROM admins")
      .all();
    res.json({ admins });
  } catch (err) {
    console.error("GET /api/admin/admins error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.post("/api/admin/admins", requireAuth, (req, res) => {
  try {
    const { username, email, password, full_name } = req.body;
    if (!username || !email || !password || !full_name) {
      return res.status(400).json({ error: "Tous les champs sont requis" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Le mot de passe doit contenir au moins 6 caractères" });
    }

    const db = getDb();
    const existing = db.prepare("SELECT id FROM admins WHERE username = ? OR email = ?").get(username, email);
    if (existing) {
      return res.status(400).json({ error: "Nom d'utilisateur ou email déjà utilisé" });
    }

    const hash = bcrypt.hashSync(password, 10);
    const result = db
      .prepare("INSERT INTO admins (username, email, password_hash, full_name) VALUES (?, ?, ?, ?)")
      .run(username, email, hash, full_name);

    const admin = db.prepare("SELECT id, username, email, full_name, role, is_active, created_at FROM admins WHERE id = ?").get(
      result.lastInsertRowid
    );

    res.status(201).json({ success: true, admin });
  } catch (err) {
    console.error("POST /api/admin/admins error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.patch("/api/admin/admins/:id", requireAuth, (req, res) => {
  try {
    const adminId = parseInt(req.params.id, 10);
    if (adminId === req.session.adminId) {
      return res.status(400).json({ error: "Vous ne pouvez pas vous désactiver vous-même" });
    }

    const db = getDb();
    const { is_active, password, full_name } = req.body;

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: "Le mot de passe doit contenir au moins 6 caractères" });
      }
      const hash = bcrypt.hashSync(password, 10);
      db.prepare("UPDATE admins SET password_hash = ? WHERE id = ?").run(hash, adminId);
    }

    if (is_active !== undefined) {
      db.prepare("UPDATE admins SET is_active = ? WHERE id = ?").run(is_active ? 1 : 0, adminId);
    }

    if (full_name) {
      db.prepare("UPDATE admins SET full_name = ? WHERE id = ?").run(full_name, adminId);
    }

    res.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/admin/admins/:id error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ── Current admin info ─────────────────────────────────────────────

app.get("/api/admin/me", requireAuth, (req, res) => {
  try {
    const db = getDb();
    const admin = db.prepare("SELECT id, username, email, full_name, role FROM admins WHERE id = ?").get(req.session.adminId);
    if (!admin) return res.status(404).json({ error: "Admin introuvable" });
    res.json({ admin });
  } catch (err) {
    console.error("GET /api/admin/me error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ── Admin settings (change own password) ────────────────────────────

app.patch("/api/admin/settings", requireAuth, (req, res) => {
  try {
    const db = getDb();
    const admin = db.prepare("SELECT * FROM admins WHERE id = ?").get(req.session.adminId);
    if (!admin) return res.status(404).json({ error: "Admin introuvable" });

    const { currentPassword, newPassword, full_name } = req.body;

    if (!bcrypt.compareSync(currentPassword, admin.password_hash)) {
      return res.status(401).json({ error: "Mot de passe actuel incorrect" });
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ error: "Le mot de passe doit contenir au moins 6 caractères" });
      }
      const hash = bcrypt.hashSync(newPassword, 10);
      db.prepare("UPDATE admins SET password_hash = ?, full_name = COALESCE(?, full_name) WHERE id = ?").run(
        hash,
        full_name || null,
        req.session.adminId
      );
    } else if (full_name) {
      db.prepare("UPDATE admins SET full_name = ? WHERE id = ?").run(full_name, req.session.adminId);
    }

    res.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/admin/settings error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ── Wilayas list ────────────────────────────────────────────────────

app.get("/api/wilayas", (req, res) => {
  try {
    const db = getDb();
    const wilayas = db.prepare("SELECT * FROM wilayas ORDER BY name ASC").all();
    res.json({ wilayas });
  } catch (err) {
    console.error("GET /api/wilayas error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ── SSE endpoint ────────────────────────────────────────────────────

app.get("/api/admin/notifications", requireAuth, (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  res.write("event: connected\ndata: {}\n\n");

  sseClients.push(res);

  req.on("close", () => {
    const idx = sseClients.indexOf(res);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

// ── Start ───────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`TechPro Admin API running on http://localhost:${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin/login.html`);
});
