const bcrypt = require("bcryptjs");
const { getDb } = require("./db");

const WILAYAS = [
  [1, "Adrar"], [2, "Chlef"], [3, "Laghouat"], [4, "Oum El Bouaghi"],
  [5, "Batna"], [6, "Béjaïa"], [7, "Biskra"], [8, "Béchar"],
  [9, "Blida"], [10, "Bouira"], [11, "Tamanrasset"], [12, "Tébessa"],
  [13, "Tlemcen"], [14, "Tiaret"], [15, "Tizi Ouzou"], [16, "Alger"],
  [17, "Djelfa"], [18, "Jijel"], [19, "Sétif"], [20, "Saïda"],
  [21, "Skikda"], [22, "Sidi Bel Abbès"], [23, "Annaba"], [24, "Guelma"],
  [25, "Constantine"], [26, "Médéa"], [27, "Mostaganem"], [28, "M'Sila"],
  [29, "Mascara"], [30, "Ouargla"], [31, "Oran"], [32, "El Bayadh"],
  [33, "Illizi"], [34, "Bordj Bou Arréridj"], [35, "Boumerdès"],
  [36, "El Tarf"], [37, "Tindouf"], [38, "Tissemsilt"], [39, "El Oued"],
  [40, "Khenchela"], [41, "Souk Ahras"], [42, "Tipaza"], [43, "Mila"],
  [44, "Aïn Defla"], [45, "Naâma"], [46, "Aïn Témouchent"],
  [47, "Ghardaïa"], [48, "Relizane"], [49, "Timimoun"], [50, "Bordj Badji Mokhtar"],
  [51, "Ouled Djellal"], [52, "Béni Abbès"], [53, "In Salah"],
  [54, "In Guezzam"], [55, "Touggourt"], [56, "Djanet"],
  [57, "El M'Ghair"], [58, "El Menia"],
];

function initDb() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS wilayas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      code TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      phone_number TEXT NOT NULL,
      wilaya TEXT NOT NULL,
      commune TEXT NOT NULL,
      delivery_address TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      notes TEXT,
      status TEXT DEFAULT 'pending',
      payment_status TEXT DEFAULT 'pending',
      admin_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      old_status TEXT,
      new_status TEXT,
      note TEXT,
      admin_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
    CREATE INDEX IF NOT EXISTS idx_order_history_order_id ON order_history(order_id);
  `);

  const wilayaCount = db.prepare("SELECT COUNT(*) as count FROM wilayas").get().count;
  if (wilayaCount === 0) {
    const insertWilaya = db.prepare("INSERT INTO wilayas (name, code) VALUES (?, ?)");
    const insertMany = db.transaction((wilayas) => {
      for (const [code, name] of wilayas) {
        insertWilaya.run(name, String(code));
      }
    });
    insertMany(WILAYAS);
    console.log(`Seeded ${WILAYAS.length} wilayas`);
  } else {
    console.log(`Wilayas table already has ${wilayaCount} entries, skipping seed`);
  }

  const adminCount = db.prepare("SELECT COUNT(*) as count FROM admins").get().count;
  if (adminCount === 0) {
    const hash = bcrypt.hashSync("ChangeMe123", 10);
    db.prepare(
      "INSERT INTO admins (username, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)"
    ).run("admin", "admin@system.com", hash, "System Administrator", "superadmin");
    console.log("Default admin created: admin / ChangeMe123");
  } else {
    console.log(`Admins table already has ${adminCount} entries, skipping seed`);
  }

  console.log("Database initialized successfully");
}

initDb();
