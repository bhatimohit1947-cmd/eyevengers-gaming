import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeMobile, isValidIndianMobile, hashPassword, verifyPassword } from '../src/lib/auth/password';
import { db } from '../src/lib/db/index';

test('Mobile Normalization: adds +91 prefix and formats standard 10-digit Indian numbers', () => {
  assert.equal(normalizeMobile('9876543210'), '+919876543210');
  assert.equal(normalizeMobile('09876543210'), '+919876543210');
  assert.equal(normalizeMobile('919876543210'), '+919876543210');
  assert.equal(normalizeMobile('+91 98765 43210'), '+919876543210');
  assert.equal(normalizeMobile('+91-98765-43210'), '+919876543210');
});

test('Mobile Validation: validates real Indian mobile number range', () => {
  assert.equal(isValidIndianMobile('9876543210'), true);
  assert.equal(isValidIndianMobile('7000000000'), true);
  assert.equal(isValidIndianMobile('1234567890'), false); // Starts with 1
  assert.equal(isValidIndianMobile('98765'), false); // Too short
});

test('Password Hashing: never stores plaintext and accurately verifies hashes', async () => {
  const plain = 'FestiveSecret@2026';
  const hash = await hashPassword(plain);

  assert.notEqual(plain, hash);
  assert.ok(hash.startsWith('$2')); // Standard bcrypt hash identifier

  const isCorrect = await verifyPassword(plain, hash);
  assert.equal(isCorrect, true);

  const isWrong = await verifyPassword('WrongPassword', hash);
  assert.equal(isWrong, false);
});

test('User Creation & Duplicate Mobile Rejection', async () => {
  const testMobile = `+9199999${Math.floor(10000 + Math.random() * 90000)}`;
  const hash = await hashPassword('TestPass@123');

  const user = db.createUser({
    mobile: testMobile,
    fullName: 'Test User Jodhpur',
    passwordHash: hash,
    role: 'customer',
  });

  assert.ok(user.id);
  assert.equal(user.mobile, testMobile);
  assert.equal(user.role, 'customer');

  // Verify lookup by mobile
  const fetched = db.getUserByMobile(testMobile);
  assert.ok(fetched);
  assert.equal(fetched.fullName, 'Test User Jodhpur');

  // Attempting duplicate mobile should throw or fail constraint
  assert.throws(() => {
    db.createUser({
      mobile: testMobile,
      fullName: 'Duplicate Person',
      passwordHash: hash,
    });
  });
});
