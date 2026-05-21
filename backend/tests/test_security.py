from datetime import UTC, datetime, timedelta

import pytest
from jose import jwt

from app.config import get_settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)

settings = get_settings()


class TestPasswordHashing:
    def test_hash_password_returns_string(self):
        hashed = get_password_hash("mypassword")
        assert isinstance(hashed, str)
        assert len(hashed) > 0

    def test_hash_password_different_each_time(self):
        hashed1 = get_password_hash("mypassword")
        hashed2 = get_password_hash("mypassword")
        assert hashed1 != hashed2

    def test_verify_password_correct(self):
        password = "testpassword123"
        hashed = get_password_hash(password)
        assert verify_password(password, hashed) is True

    def test_verify_password_incorrect(self):
        password = "testpassword123"
        hashed = get_password_hash(password)
        assert verify_password("wrongpassword", hashed) is False

    def test_verify_password_empty(self):
        hashed = get_password_hash("password")
        assert verify_password("", hashed) is False

    def test_password_hash_with_special_chars(self):
        password = "p@ssw0rd!#$%^&*()"
        hashed = get_password_hash(password)
        assert verify_password(password, hashed) is True


class TestAccessToken:
    def test_create_access_token_returns_string(self):
        token = create_access_token(data={"sub": "user123"})
        assert isinstance(token, str)
        assert len(token) > 0

    def test_create_access_token_with_custom_expiry(self):
        delta = timedelta(hours=2)
        token = create_access_token(data={"sub": "user123"}, expires_delta=delta)
        payload = decode_token(token)
        assert payload is not None
        assert payload["sub"] == "user123"
        assert payload["type"] == "access"

    def test_create_access_token_default_expiry(self):
        token = create_access_token(data={"sub": "user123"})
        payload = decode_token(token)
        assert payload is not None
        assert payload["sub"] == "user123"
        assert payload["type"] == "access"

    def test_access_token_contains_exp_claim(self):
        token = create_access_token(data={"sub": "user123"})
        payload = decode_token(token)
        assert payload is not None
        assert "exp" in payload

    def test_expired_access_token(self):
        delta = timedelta(seconds=-1)
        token = create_access_token(data={"sub": "user123"}, expires_delta=delta)
        payload = decode_token(token)
        assert payload is None


class TestRefreshToken:
    def test_create_refresh_token_returns_string(self):
        token = create_refresh_token(data={"sub": "user123"})
        assert isinstance(token, str)
        assert len(token) > 0

    def test_refresh_token_type(self):
        token = create_refresh_token(data={"sub": "user123"})
        payload = decode_token(token)
        assert payload is not None
        assert payload["type"] == "refresh"

    def test_refresh_token_expiry(self):
        token = create_refresh_token(data={"sub": "user123"})
        payload = decode_token(token)
        assert payload is not None
        assert "exp" in payload


class TestDecodeToken:
    def test_decode_valid_token(self):
        token = create_access_token(data={"sub": "user123", "role": "admin"})
        payload = decode_token(token)
        assert payload is not None
        assert payload["sub"] == "user123"
        assert payload["role"] == "admin"

    def test_decode_invalid_token(self):
        payload = decode_token("invalid.token.string")
        assert payload is None

    def test_decode_empty_string(self):
        payload = decode_token("")
        assert payload is None

    def test_decode_malformed_token(self):
        payload = decode_token("not-a-jwt-token")
        assert payload is None

    def test_decode_token_with_extra_data(self):
        data = {"sub": "user123", "role": "admin", "custom": "value"}
        token = create_access_token(data=data)
        payload = decode_token(token)
        assert payload is not None
        assert payload["custom"] == "value"
