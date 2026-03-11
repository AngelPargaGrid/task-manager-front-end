# User Profile Management – Comprehensive E2E Test Cases

## Overview

This document provides comprehensive test cases for a user profile management feature, covering user registration, profile updates, password changes, and account deletion. Test cases include positive scenarios, negative scenarios, edge cases, and security-focused tests.

**Traceability:** Aligns with `docs/TEST_SPEC_USER_PROFILE_MANAGEMENT.md` (API spec) and extends coverage for E2E/UI flows.

---

## Test Data Reference

| Field | Valid Value | Invalid Value |
|-------|-------------|---------------|
| Email | `john.doe@example.com` | `notanemail`, `email@alreadyregistered.com` |
| Password | `SecurePass123!` (8+ chars, mixed case, number, special) | `weak`, `short`, empty |
| Name | `John Doe` (2–255 chars) | Empty, `A` (< 2 chars) |
| Bio | `Software Engineer passionate about AI` | XSS payloads |
| Location | `San Francisco, CA` | N/A |

### Test User Credentials

```
New User:  { name: "John Doe", email: "john.doe@example.com", password: "SecurePass123!" }
Existing:  { email: "email@alreadyregistered.com" }
```

---

## 1. Positive Test Cases

### TC-001: User Registration with Valid Data

| Attribute | Value |
|-----------|-------|
| **ID** | TC-001 |
| **Priority** | P0 |
| **Type** | Positive |

**Preconditions:**
- User is on registration page

**Test Data:**
- Email: `john.doe@example.com`
- Password: `SecurePass123!`
- Name: `John Doe`

**Steps:**
1. Enter valid email
2. Enter valid password (meets requirements: 8+ chars, uppercase, lowercase, number, special character)
3. Enter full name
4. Click Register button

**Expected Result:**
- User account created successfully
- Confirmation email sent (if feature exists)
- User redirected to dashboard
- HTTP Status: `201 Created` (API) or success UI feedback

---

### TC-002: Successful Profile Update

| Attribute | Value |
|-----------|-------|
| **ID** | TC-002 |
| **Priority** | P0 |
| **Type** | Positive |

**Preconditions:**
- User is logged in

**Test Data:**
- New bio: `Software Engineer passionate about AI`
- New location: `San Francisco, CA`

**Steps:**
1. Navigate to profile settings
2. Update bio field
3. Update location
4. Click Save Changes

**Expected Result:**
- Profile updated successfully
- Changes reflected immediately
- Success message displayed
- HTTP Status: `200 OK` (API) or success toast/alert

---

### TC-003: Password Change with Correct Old Password

| Attribute | Value |
|-----------|-------|
| **ID** | TC-003 |
| **Priority** | P0 |
| **Type** | Positive |

**Preconditions:**
- User is authenticated

**Test Data:**
- Old password: `CurrentPass123!`
- New password: `NewSecurePass456!`

**Steps:**
1. Go to security settings
2. Enter current password
3. Enter new password
4. Confirm new password
5. Submit

**Expected Result:**
- Password updated successfully
- User remains logged in
- Confirmation email sent (if feature exists)
- Subsequent login with new password succeeds

---

## 2. Negative Test Cases

### TC-101: Registration with Existing Email

| Attribute | Value |
|-----------|-------|
| **ID** | TC-101 |
| **Priority** | P0 |
| **Type** | Negative |

**Test Data:**
- Email: `email@alreadyregistered.com` (already in system)

**Expected Result:**
- Error: "Email already exists" (or equivalent)
- HTTP Status: `409 Conflict`
- User not redirected; form remains with error message

---

### TC-102: Invalid Email Format

| Attribute | Value |
|-----------|-------|
| **ID** | TC-102 |
| **Priority** | P0 |
| **Type** | Negative |

**Test Data:**
- Email: `notanemail`

**Expected Result:**
- Error: "Invalid email format"
- HTTP Status: `400 Bad Request` (API) or validation message (UI)
- Submit disabled or blocked

---

### TC-103: Password Doesn't Meet Requirements

| Attribute | Value |
|-----------|-------|
| **ID** | TC-103 |
| **Priority** | P0 |
| **Type** | Negative |

**Test Data:**
- Password: `weak` (no uppercase, no number, no special char, too short)

**Expected Result:**
- Error: "Password must be at least 8 characters with uppercase, lowercase, number, and special character"
- HTTP Status: `400 Bad Request`
- Registration blocked

---

### TC-104: Profile Update Without Authentication

| Attribute | Value |
|-----------|-------|
| **ID** | TC-104 |
| **Priority** | P0 |
| **Type** | Negative |

**Preconditions:**
- User not logged in

**Steps:**
- Attempt to access profile settings URL directly or via API

**Expected Result:**
- Error: "Authentication required"
- HTTP Status: `401 Unauthorized`
- Redirect to login page (UI)

---

## 3. Edge Cases

### TC-201: Very Long Username (255 characters)

| Attribute | Value |
|-----------|-------|
| **ID** | TC-201 |
| **Priority** | P2 |
| **Type** | Edge |

**Test Data:**
- Name/Username: String of 255 characters

**Expected Result:**
- Accepted or truncated with warning
- No crash or overflow
- Data stored/displayed correctly

---

### TC-202: Special Characters in Bio

| Attribute | Value |
|-----------|-------|
| **ID** | TC-202 |
| **Priority** | P1 |
| **Type** | Edge |

**Test Data:**
- Bio: `<script>alert('xss')</script>`

**Expected Result:**
- Special characters escaped or stripped
- No script execution in browser
- Safe display (HTML entities or plain text)

---

### TC-203: Profile Photo at Maximum Size Limit

| Attribute | Value |
|-----------|-------|
| **ID** | TC-203 |
| **Priority** | P2 |
| **Type** | Edge |

**Test Data:**
- 5MB image file (at limit)
- 6MB image file (above limit)

**Expected Result:**
- Upload succeeds at 5MB (if limit is 5MB)
- Upload fails above limit with clear error message

---

### TC-204: Rapid Successive Profile Updates

| Attribute | Value |
|-----------|-------|
| **ID** | TC-204 |
| **Priority** | P2 |
| **Type** | Edge |

**Test Data:**
- 10 updates within 10 seconds

**Expected Result:**
- Rate limiting applied, or all updates processed correctly
- No race conditions or corrupted state
- Last update wins or debouncing applied

---

## 4. Security Test Cases

### TC-301: SQL Injection in Login

| Attribute | Value |
|-----------|-------|
| **ID** | TC-301 |
| **Priority** | P0 |
| **Type** | Security |

**Test Data:**
- Username/Email: `'; DROP TABLE users; --`

**Expected Result:**
- Injection prevented
- Invalid credentials error returned
- No database modification

---

### TC-302: XSS Attack in Profile Fields

| Attribute | Value |
|-----------|-------|
| **ID** | TC-302 |
| **Priority** | P0 |
| **Type** | Security |

**Test Data:**
- Bio: `<img src=x onerror=alert('XSS')>`

**Expected Result:**
- Input sanitized or escaped
- No script execution
- Safe display of content

---

### TC-303: CSRF Token Validation

| Attribute | Value |
|-----------|-------|
| **ID** | TC-303 |
| **Priority** | P0 |
| **Type** | Security |

**Preconditions:**
- Remove CSRF token from request (or use expired/invalid token)

**Expected Result:**
- Request rejected
- HTTP Status: `403 Forbidden`

---

### TC-304: Password Hashing Verification

| Attribute | Value |
|-----------|-------|
| **ID** | TC-304 |
| **Priority** | P0 |
| **Type** | Security |

**Action:**
- Register user, then inspect database storage

**Expected Result:**
- Password stored as bcrypt hash (e.g. `$2b$12$...`)
- No plaintext password in database

---

### TC-305: Session Hijacking Attempt

| Attribute | Value |
|-----------|-------|
| **ID** | TC-305 |
| **Priority** | P0 |
| **Type** | Security |

**Action:**
- Use expired or invalid session token for protected request

**Expected Result:**
- Access denied
- Re-authentication required
- HTTP Status: `401 Unauthorized`

---

## 5. Account Deletion (Future)

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| TC-401 | User deletes own account | 200/204; account deactivated; login fails thereafter |
| TC-402 | Unauthenticated deletion attempt | 401 Unauthorized |
| TC-403 | Delete with wrong confirmation | 400 Bad Request |

---

## Implementation Status

| Test Case | E2E (Playwright) | API (pytest) |
|-----------|-------------------|--------------|
| TC-001 | ✅ `user-profile-management.spec.ts` | ✅ `test_user_profile.py` |
| TC-002 | ✅ | — |
| TC-003 | ⏸ Skip (no password change UI) | ⏸ Skip (endpoint TBD) |
| TC-101 | ✅ | ✅ |
| TC-102 | ✅ | ✅ |
| TC-103 | ✅ | ✅ |
| TC-104 | ✅ | ✅ |
| TC-201 | ✅ | ✅ |
| TC-202 | ✅ | — |
| TC-203 | ⏸ Skip (no photo upload) | — |
| TC-204 | ⏸ | — |
| TC-301 | — | ✅ (via auth/login) |
| TC-302 | ✅ | — |
| TC-303 | ⏸ | — |
| TC-304 | — | ✅ |
| TC-305 | ⏸ | — |

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-03-11 | Initial comprehensive E2E test cases |
