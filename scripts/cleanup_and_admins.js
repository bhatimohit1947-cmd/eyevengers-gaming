const { DatabaseSync } = require('node:sqlite');
const bcrypt = require('bcryptjs');

const db = new DatabaseSync('.data/eyevengers.db');
const now = new Date().toISOString();

// Hash password 'Heyeyevengers'
const salt = bcrypt.genSaltSync(10);
const passwordHash = bcrypt.hashSync('Heyeyevengers', salt);

console.log('Password hash generated successfully');

// 1. Delete all vouchers, redemptions, game_plays
db.exec('DELETE FROM redemptions;');
db.exec('DELETE FROM vouchers;');
db.exec('DELETE FROM game_plays;');
db.exec('UPDATE rewards SET reserved_inventory = 0, issued_count = 0, redeemed_count = 0;');
console.log('Cleared vouchers, game_plays, and redemptions.');

// 2. Remove all dummy customers and old admin
db.exec("DELETE FROM profiles WHERE mobile NOT IN ('+917240158860', '+918824187493', '+919876500002');");
console.log('Removed dummy customer and admin profiles.');

// 3. Upsert Admin 1: +917240158860
const admin1 = db.prepare('SELECT id FROM profiles WHERE mobile = ?').get('+917240158860');
if (admin1) {
  db.prepare('UPDATE profiles SET full_name = ?, password_hash = ?, role = ?, status = ?, updated_at = ? WHERE mobile = ?')
    .run('Admin (7240158860)', passwordHash, 'admin', 'active', now, '+917240158860');
  console.log('Updated existing profile 7240158860 to Admin with password Heyeyevengers');
} else {
  db.prepare('INSERT INTO profiles (id, mobile, full_name, password_hash, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run('adm-7240-158860', '+917240158860', 'Admin (7240158860)', passwordHash, 'admin', 'active', now, now);
  console.log('Inserted new Admin profile 7240158860 with password Heyeyevengers');
}

// 4. Upsert Admin 2: +918824187493
const admin2 = db.prepare('SELECT id FROM profiles WHERE mobile = ?').get('+918824187493');
if (admin2) {
  db.prepare('UPDATE profiles SET full_name = ?, password_hash = ?, role = ?, status = ?, updated_at = ? WHERE mobile = ?')
    .run('Admin (8824187493)', passwordHash, 'admin', 'active', now, '+918824187493');
  console.log('Updated existing profile 8824187493 to Admin with password Heyeyevengers');
} else {
  db.prepare('INSERT INTO profiles (id, mobile, full_name, password_hash, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run('adm-8824-187493', '+918824187493', 'Admin (8824187493)', passwordHash, 'admin', 'active', now, now);
  console.log('Inserted new Admin profile 8824187493 with password Heyeyevengers');
}

console.log('Final Profiles in DB:');
console.log(db.prepare('SELECT id, mobile, full_name, role, status FROM profiles').all());

console.log('Voucher count in DB:');
console.log(db.prepare('SELECT COUNT(*) as cnt FROM vouchers').get());
