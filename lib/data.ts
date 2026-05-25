import fs from "fs";
import path from "path";

export type OrderStatus = "en_attente" | "confirme" | "annule";

export type Order = {
  id: string;
  name: string;
  phone: string;
  wilaya: string;
  commune: string;
  address: string;
  notes: string;
  quantity: number;
  total: number;
  date: string;
  status: OrderStatus;
};

export type AdminCredentials = {
  email: string;
  passwordHash: string;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const ADMIN_FILE = path.join(DATA_DIR, "admin.json");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readOrders(): Order[] {
  ensureDir();
  if (!fs.existsSync(ORDERS_FILE)) return [];
  try {
    const raw = fs.readFileSync(ORDERS_FILE, "utf-8");
    return JSON.parse(raw) as Order[];
  } catch {
    return [];
  }
}

function writeOrders(orders: Order[]) {
  ensureDir();
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
}

export function getAllOrders(): Order[] {
  return readOrders();
}

export function createOrder(order: Order): void {
  const orders = readOrders();
  orders.push(order);
  writeOrders(orders);
}

export function updateOrderStatus(orderId: string, status: OrderStatus): Order | null {
  const orders = readOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return null;
  orders[idx].status = status;
  writeOrders(orders);
  return orders[idx];
}

export function deleteOrder(orderId: string): boolean {
  const orders = readOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return false;
  orders.splice(idx, 1);
  writeOrders(orders);
  return true;
}

export function getAdminCredentials(): AdminCredentials | null {
  ensureDir();
  if (!fs.existsSync(ADMIN_FILE)) return null;
  try {
    const raw = fs.readFileSync(ADMIN_FILE, "utf-8");
    return JSON.parse(raw) as AdminCredentials;
  } catch {
    return null;
  }
}

export function saveAdminCredentials(credentials: AdminCredentials): void {
  ensureDir();
  fs.writeFileSync(ADMIN_FILE, JSON.stringify(credentials, null, 2), "utf-8");
}

export type VerificationCode = {
  code: string;
  passwordHash: string;
  expiresAt: number;
};

const VERIFY_CODES_FILE = path.join(DATA_DIR, "verify-codes.json");

function readVerifyCodes(): Record<string, VerificationCode> {
  if (!fs.existsSync(VERIFY_CODES_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(VERIFY_CODES_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function writeVerifyCodes(codes: Record<string, VerificationCode>) {
  ensureDir();
  fs.writeFileSync(VERIFY_CODES_FILE, JSON.stringify(codes, null, 2), "utf-8");
}

export function saveVerificationCode(email: string, data: VerificationCode): void {
  const codes = readVerifyCodes();
  codes[email.toLowerCase()] = data;
  writeVerifyCodes(codes);
}

export function getVerificationCode(email: string): VerificationCode | null {
  const codes = readVerifyCodes();
  return codes[email.toLowerCase()] ?? null;
}

export function deleteVerificationCode(email: string): void {
  const codes = readVerifyCodes();
  delete codes[email.toLowerCase()];
  writeVerifyCodes(codes);
}
