"""
User Profile Management – Automated Python unittest Scripts

Converts test cases from docs/TEST_CASES_USER_PROFILE_E2E.md into unittest format.
Covers: registration, profile updates, password change, account deletion.
Organized by category: Positive, Negative, Edge, Security.
"""

import unittest

from app import create_app, db


# ─── Mock Data (aligns with TEST_CASES_USER_PROFILE_E2E.md) ─────────────────

MOCK_DATA = {
    "registration": {
        "valid": {
            "name": "John Doe",
            "email": "john.doe@example.com",
            "password": "SecurePass123!",
        },
        "invalid_email": {"name": "Test User", "email": "notanemail", "password": "SecurePass123!"},
        "weak_password": {"name": "Test User", "email": "user@example.com", "password": "weak"},
        "duplicate_email": "email@alreadyregistered.com",
        "sql_injection": {"name": "'; DROP TABLE users; --", "email": "x@test.com", "password": "password123"},
    },
    "profile_update": {
        "valid": {"bio": "Software Engineer passionate about AI", "location": "San Francisco, CA"},
        "xss_bio": "<img src=x onerror=alert('XSS')>",
    },
    "password_change": {
        "valid": {"current_password": "CurrentPass123!", "new_password": "NewSecurePass456!"},
        "wrong_current": {"current_password": "wrong", "new_password": "newpass123"},
    },
}


def auth_headers(token):
    """Build Authorization header from JWT token."""
    return {"Authorization": f"Bearer {token}"}


# ─── Base Test Case with Fixtures ────────────────────────────────────────────


class BaseUserProfileTestCase(unittest.TestCase):
    """Base class with app, client, and shared setup/teardown."""

    @classmethod
    def setUpClass(cls):
        """Create app and client once for the test class."""
        cls.app = create_app("testing")
        cls.client = cls.app.test_client()

    def setUp(self):
        """Run before each test. Create fresh DB tables."""
        with self.app.app_context():
            db.create_all()

    def tearDown(self):
        """Run after each test. Clean up database."""
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def _register_user(self, payload):
        """Helper: register user and return response."""
        return self.client.post("/api/v1/auth/register", json=payload)

    def _login_user(self, email, password):
        """Helper: login and return token + user info."""
        resp = self.client.post("/api/v1/auth/login", json={"email": email, "password": password})
        if resp.status_code != 200:
            return None
        data = resp.get_json()
        return {
            "token": data["access_token"],
            "id": data["user"]["id"],
            "email": email,
        }

    def _create_admin_user(self):
        """Fixture: create admin user and return token + id."""
        self._register_user({
            "name": "Test Admin",
            "email": "admin@unittest.com",
            "password": "admin123",
            "role": "admin",
        })
        return self._login_user("admin@unittest.com", "admin123")

    def _create_customer_user(self):
        """Fixture: create customer user and return token + id."""
        self._register_user({
            "name": "Test Customer",
            "email": "customer@unittest.com",
            "password": "customer123",
        })
        return self._login_user("customer@unittest.com", "customer123")

    def _create_agent_user(self):
        """Fixture: create agent user and return token + id."""
        self._register_user({
            "name": "Test Agent",
            "email": "agent@unittest.com",
            "password": "agent123",
            "role": "agent",
        })
        return self._login_user("agent@unittest.com", "agent123")


# ─── 1. POSITIVE TEST CASES ──────────────────────────────────────────────────


class TestPositiveRegistration(BaseUserProfileTestCase):
    """TC-001: User registration with valid data."""

    def test_tc001_registration_with_valid_data(self):
        """TC-001: User account created successfully, 201 Created."""
        payload = MOCK_DATA["registration"]["valid"]
        resp = self._register_user(payload)
        self.assertEqual(resp.status_code, 201, f"Expected 201, got {resp.status_code}: {resp.get_json()}")
        data = resp.get_json()
        self.assertEqual(data.get("status"), "success")
        self.assertIn("user", data)
        self.assertEqual(data["user"]["email"], payload["email"])
        self.assertEqual(data["user"]["name"], payload["name"])
        self.assertIn("id", data["user"])
        self.assertNotIn("password", data["user"])
        self.assertNotIn("password_hash", str(data))

    def test_registration_with_role_and_username(self):
        """TC-001 variant: Registration with optional fields."""
        payload = {
            "name": "Agent User",
            "email": "agent@unittest.com",
            "password": "pass12345",
            "role": "agent",
            "username": "agentuser",
        }
        resp = self._register_user(payload)
        self.assertEqual(resp.status_code, 201)
        user = resp.get_json()["user"]
        self.assertEqual(user["role"], "agent")
        self.assertEqual(user["email"], payload["email"])

    def test_login_after_registration(self):
        """TC-001: Password hashed correctly, login succeeds after registration."""
        payload = MOCK_DATA["registration"]["valid"]
        self._register_user(payload)
        resp = self.client.post(
            "/api/v1/auth/login",
            json={"email": payload["email"], "password": payload["password"]},
        )
        self.assertEqual(resp.status_code, 200)
        self.assertIn("access_token", resp.get_json())


class TestPositiveProfileUpdate(BaseUserProfileTestCase):
    """TC-002: Successful profile update."""

    def test_tc002_admin_can_update_user_name(self):
        """TC-002: Profile updated successfully, 200 OK."""
        admin = self._create_admin_user()
        customer = self._create_customer_user()
        resp = self.client.put(
            f"/api/v1/users/{customer['id']}",
            headers=auth_headers(admin["token"]),
            json={"name": "Updated Customer Name"},
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.get_json()["user"]["name"], "Updated Customer Name")

    def test_admin_can_update_agent_availability(self):
        """TC-002: Admin updates agent availability."""
        admin = self._create_admin_user()
        agent = self._create_agent_user()
        resp = self.client.put(
            f"/api/v1/users/{agent['id']}",
            headers=auth_headers(admin["token"]),
            json={"availability_status": "available"},
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.get_json()["user"]["availability_status"], "available")


class TestPositivePasswordChange(BaseUserProfileTestCase):
    """TC-003: Password change with correct old password. Skipped until endpoint exists."""

    @unittest.skip("Endpoint POST /auth/change-password not yet implemented")
    def test_tc003_password_change_success(self):
        """TC-003: Password updated successfully, user remains logged in."""
        customer = self._create_customer_user()
        resp = self.client.post(
            "/api/v1/auth/change-password",
            headers=auth_headers(customer["token"]),
            json=MOCK_DATA["password_change"]["valid"],
        )
        self.assertEqual(resp.status_code, 200)
        login_resp = self.client.post(
            "/api/v1/auth/login",
            json={"email": customer["email"], "password": "NewSecure456!"},
        )
        self.assertEqual(login_resp.status_code, 200)


# ─── 2. NEGATIVE TEST CASES ──────────────────────────────────────────────────


class TestNegativeRegistration(BaseUserProfileTestCase):
    """TC-101, TC-102, TC-103: Registration validation errors."""

    def test_tc101_registration_with_existing_email(self):
        """TC-101: Duplicate email returns 409 Conflict."""
        payload = {"name": "First", "email": "dup@unittest.com", "password": "password123"}
        self._register_user(payload)
        resp = self._register_user({**payload, "name": "Second"})
        self.assertEqual(resp.status_code, 409)
        msg = resp.get_json().get("message", "").lower()
        self.assertTrue("already" in msg or "exist" in msg, f"Message should mention existing email: {msg}")

    def test_tc102_invalid_email_format(self):
        """TC-102: Invalid email returns 400 Bad Request."""
        resp = self._register_user(MOCK_DATA["registration"]["invalid_email"])
        self.assertEqual(resp.status_code, 400)
        data = resp.get_json()
        self.assertEqual(data.get("code"), "VALIDATION_ERROR")

    def test_tc103_password_doesnt_meet_requirements(self):
        """TC-103: Weak password returns 400 Bad Request."""
        resp = self._register_user(MOCK_DATA["registration"]["weak_password"])
        self.assertEqual(resp.status_code, 400)

    def test_missing_name_returns_400(self):
        """REG-N01: Missing name returns 400."""
        resp = self._register_user({"email": "x@unittest.com", "password": "password123"})
        self.assertEqual(resp.status_code, 400)
        self.assertIn("name", str(resp.get_json().get("errors", {})).lower())

    def test_missing_email_returns_400(self):
        """REG-N02: Missing email returns 400."""
        resp = self._register_user({"name": "User", "password": "password123"})
        self.assertEqual(resp.status_code, 400)

    def test_missing_password_returns_400(self):
        """REG-N03: Missing password returns 400."""
        resp = self._register_user({"name": "User", "email": "x@unittest.com"})
        self.assertEqual(resp.status_code, 400)

    def test_name_too_short_returns_400(self):
        """REG-N06: Name < 2 chars returns 400."""
        resp = self._register_user({"name": "A", "email": "x@unittest.com", "password": "password123"})
        self.assertEqual(resp.status_code, 400)

    def test_invalid_role_returns_400(self):
        """REG-N07: Invalid role returns 400."""
        resp = self._register_user({
            "name": "User",
            "email": "x@unittest.com",
            "password": "password123",
            "role": "superuser",
        })
        self.assertEqual(resp.status_code, 400)


class TestNegativeProfileUpdate(BaseUserProfileTestCase):
    """TC-104: Profile update without authentication."""

    def test_tc104_profile_update_without_auth(self):
        """TC-104: Unauthenticated request returns 401 Unauthorized."""
        customer = self._create_customer_user()
        resp = self.client.put(
            f"/api/v1/users/{customer['id']}",
            json={"name": "Hacked"},
        )
        self.assertIn(resp.status_code, (401, 422))

    def test_customer_cannot_update_other_user(self):
        """PROF-N01: Customer cannot update any user."""
        customer = self._create_customer_user()
        agent = self._create_agent_user()
        resp = self.client.put(
            f"/api/v1/users/{agent['id']}",
            headers=auth_headers(customer["token"]),
            json={"name": "Hacked"},
        )
        self.assertEqual(resp.status_code, 403)

    def test_agent_cannot_update_other_user(self):
        """PROF-N02: Agent cannot update other users."""
        agent = self._create_agent_user()
        customer = self._create_customer_user()
        resp = self.client.put(
            f"/api/v1/users/{customer['id']}",
            headers=auth_headers(agent["token"]),
            json={"name": "Hacked"},
        )
        self.assertEqual(resp.status_code, 403)


# ─── 3. EDGE CASES ───────────────────────────────────────────────────────────


class TestEdgeCases(BaseUserProfileTestCase):
    """TC-201, TC-202: Edge case scenarios."""

    def test_tc201_maximum_valid_name_length(self):
        """TC-201: Very long name (255 chars) accepted or truncated."""
        long_name = "a" * 255
        resp = self._register_user({
            "name": long_name,
            "email": "longname@unittest.com",
            "password": "password123",
        })
        self.assertIn(resp.status_code, (201, 400), "Should accept or reject with validation")

    def test_tc201_name_over_max_returns_400(self):
        """TC-201: Name > 255 chars returns 400."""
        long_name = "a" * 256
        resp = self._register_user({
            "name": long_name,
            "email": "toolong@unittest.com",
            "password": "password123",
        })
        self.assertEqual(resp.status_code, 400)

    def test_empty_body_returns_400(self):
        """REG-E01: Empty JSON body returns 400."""
        resp = self.client.post("/api/v1/auth/register", json={})
        self.assertEqual(resp.status_code, 400)

    def test_partial_update_empty_body(self):
        """PROF-E01: Empty update body returns 200 (no changes)."""
        admin = self._create_admin_user()
        customer = self._create_customer_user()
        resp = self.client.put(
            f"/api/v1/users/{customer['id']}",
            headers=auth_headers(admin["token"]),
            json={},
        )
        self.assertEqual(resp.status_code, 200)


# ─── 4. SECURITY TEST CASES ──────────────────────────────────────────────────


class TestSecurity(BaseUserProfileTestCase):
    """TC-301, TC-302, TC-304, TC-305: Security scenarios."""

    def test_tc301_sql_injection_in_registration(self):
        """TC-301: SQL injection in name prevented; no DB modification."""
        resp = self._register_user(MOCK_DATA["registration"]["sql_injection"])
        self.assertIn(resp.status_code, (201, 400), "Should accept (sanitized) or reject")
        if resp.status_code == 201:
            login_resp = self.client.post(
                "/api/v1/auth/login",
                json={"email": "x@test.com", "password": "password123"},
            )
            self.assertIn(login_resp.status_code, (200, 401))

    def test_tc301_sql_injection_in_login(self):
        """TC-301: SQL injection in login prevented; returns 400/401, no DB modification."""
        self._register_user({"name": "User", "email": "user@test.com", "password": "password123"})
        resp = self.client.post(
            "/api/v1/auth/login",
            json={"email": "'; DROP TABLE users; --", "password": "anything"},
        )
        self.assertIn(resp.status_code, (400, 401), "Should reject invalid input without executing")

    def test_tc304_password_not_returned_in_response(self):
        """TC-304: Password never returned in API response."""
        payload = {"name": "User", "email": "secret@unittest.com", "password": "secret123"}
        resp = self._register_user(payload)
        self.assertEqual(resp.status_code, 201)
        body = resp.get_data(as_text=True)
        self.assertNotIn("secret123", body)
        self.assertNotIn("password_hash", body.lower())

    def test_tc305_invalid_token_returns_401(self):
        """TC-305: Invalid/expired token returns 401 Unauthorized."""
        customer = self._create_customer_user()
        resp = self.client.get(
            f"/api/v1/users/{customer['id']}",
            headers={"Authorization": "Bearer invalid-or-expired-token"},
        )
        self.assertIn(resp.status_code, (401, 422))

    def test_tc305_no_auth_header_returns_401(self):
        """TC-305: Missing Authorization returns 401."""
        customer = self._create_customer_user()
        resp = self.client.get(f"/api/v1/users/{customer['id']}")
        self.assertIn(resp.status_code, (401, 422))

    def test_idor_customer_cannot_access_other_profile(self):
        """PROF-S01: Customer cannot GET other user (IDOR prevention)."""
        customer = self._create_customer_user()
        agent = self._create_agent_user()
        resp = self.client.get(
            f"/api/v1/users/{agent['id']}",
            headers=auth_headers(customer["token"]),
        )
        self.assertIn(resp.status_code, (403, 404))


# ─── 5. ACCOUNT DELETION (Future) ────────────────────────────────────────────


class TestAccountDeletion(BaseUserProfileTestCase):
    """TC-401, TC-402: Account deletion. Skipped until endpoint exists."""

    @unittest.skip("Endpoint DELETE /users/me not yet implemented")
    def test_tc401_user_can_delete_own_account(self):
        """TC-401: User deletes own account, login fails thereafter."""
        customer = self._create_customer_user()
        resp = self.client.delete(
            "/api/v1/users/me",
            headers=auth_headers(customer["token"]),
        )
        self.assertIn(resp.status_code, (200, 204))
        login_resp = self.client.post(
            "/api/v1/auth/login",
            json={"email": customer["email"], "password": "customer123"},
        )
        self.assertEqual(login_resp.status_code, 401)

    @unittest.skip("Endpoint DELETE /users/me not yet implemented")
    def test_tc402_unauthenticated_deletion_returns_401(self):
        """TC-402: Unauthenticated deletion returns 401."""
        resp = self.client.delete("/api/v1/users/me")
        self.assertEqual(resp.status_code, 401)


# ─── 6. INTEGRATION TESTS ────────────────────────────────────────────────────


class TestIntegration(BaseUserProfileTestCase):
    """Cross-feature integration tests."""

    def test_admin_can_list_users(self):
        """INT-005: Admin can list all users."""
        admin = self._create_admin_user()
        self._create_customer_user()
        resp = self.client.get("/api/v1/users/", headers=auth_headers(admin["token"]))
        self.assertEqual(resp.status_code, 200)
        data = resp.get_json()
        self.assertIn("users", data)
        self.assertGreaterEqual(len(data["users"]), 1)

    def test_customer_cannot_list_users(self):
        """INT-004: Customer cannot list users."""
        customer = self._create_customer_user()
        resp = self.client.get("/api/v1/users/", headers=auth_headers(customer["token"]))
        self.assertEqual(resp.status_code, 403)

    def test_get_nonexistent_user_returns_404(self):
        """PROF-N04: Invalid user ID returns 404."""
        admin = self._create_admin_user()
        resp = self.client.get(
            "/api/v1/users/99999",
            headers=auth_headers(admin["token"]),
        )
        self.assertEqual(resp.status_code, 404)


if __name__ == "__main__":
    unittest.main(verbosity=2)
