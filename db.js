// db.js
// Very simple JSON file storage for ZKNON coupons and events

"use strict";

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "data");
const COUPONS_FILE = path.join(DATA_DIR, "coupons.json");
const EVENTS_FILE = path.join(DATA_DIR, "events.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function safeReadJSON(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) {
      return fallback;
    }
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return fallback;
    return parsed;
  } catch (err) {
    console.error("Failed to read JSON:", filePath, err);
    return fallback;
  }
}

function safeWriteJSON(filePath, data) {
  try {
    ensureDataDir();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write JSON:", filePath, err);
  }
}

// coupons.json structure: { coupons: [...] }
// events.json structure: { events: [...] }

function loadCoupons() {
  const data = safeReadJSON(COUPONS_FILE, { coupons: [] });
  if (!Array.isArray(data.coupons)) return [];
  return data.coupons;
}

function saveCoupons(coupons) {
  safeWriteJSON(COUPONS_FILE, { coupons });
}

function loadEvents() {
  const data = safeReadJSON(EVENTS_FILE, { events: [] });
  if (!Array.isArray(data.events)) return [];
  return data.events;
}

function saveEvents(events) {
  safeWriteJSON(EVENTS_FILE, { events });
}

// ---------------------------------------------------------------------------
// Coupon operations
// ---------------------------------------------------------------------------

function getCouponsByOwner(ownerWallet) {
  const coupons = loadCoupons();
  return coupons.filter((c) => c.owner_wallet === ownerWallet);
}

function getCouponById(id, ownerWallet) {
  const coupons = loadCoupons();
  return coupons.find(
    (c) => c.id === id && (!ownerWallet || c.owner_wallet === ownerWallet)
  );
}

function createCoupon(coupon) {
  const coupons = loadCoupons();
  coupons.push(coupon);
  saveCoupons(coupons);
  return coupon;
}

function updateCoupon(id, ownerWallet, mutator) {
  const coupons = loadCoupons();
  const idx = coupons.findIndex(
    (c) => c.id === id && c.owner_wallet === ownerWallet
  );
  if (idx === -1) return null;
  const c = coupons[idx];
  mutator(c);
  coupons[idx] = c;
  saveCoupons(coupons);
  return c;
}

// ---------------------------------------------------------------------------
// Events operations
// ---------------------------------------------------------------------------

function addEvent(event) {
  const events = loadEvents();
  events.push(event);
  saveEvents(events);
  return event;
}

function getEventsForCoupon(couponId, ownerWallet) {
  const events = loadEvents();
  return events.filter(
    (e) => e.coupon_id === couponId && e.owner_wallet === ownerWallet
  );
}

module.exports = {
  getCouponsByOwner,
  getCouponById,
  createCoupon,
  updateCoupon,
  addEvent,
  getEventsForCoupon,
};
