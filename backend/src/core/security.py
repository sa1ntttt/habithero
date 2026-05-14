"""Telegram WebApp initData HMAC-SHA256 validation.

Reference: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
"""
import hashlib
import hmac
import json
import time
from urllib.parse import parse_qsl


class InitDataValidationError(Exception):
    pass


def validate_init_data(init_data: str, bot_token: str, max_age_seconds: int = 86400) -> dict:
    """Validate Telegram WebApp initData string.

    Returns parsed user dict if valid. Raises InitDataValidationError if not.
    """
    if not init_data:
        raise InitDataValidationError("empty init_data")

    try:
        parsed = dict(parse_qsl(init_data, strict_parsing=True))
    except ValueError as e:
        raise InitDataValidationError(f"malformed init_data: {e}") from e

    received_hash = parsed.pop("hash", None)
    if not received_hash:
        raise InitDataValidationError("missing hash field")

    # Data-check-string: alphabetically sorted "key=value" lines joined by \n
    data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(parsed.items()))

    # Secret key derivation per Telegram spec
    secret_key = hmac.new(
        b"WebAppData",
        bot_token.encode("utf-8"),
        hashlib.sha256,
    ).digest()

    expected_hash = hmac.new(
        secret_key,
        data_check_string.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(received_hash, expected_hash):
        raise InitDataValidationError("invalid hash signature")

    # Reject stale init_data
    try:
        auth_date = int(parsed.get("auth_date", 0))
    except ValueError:
        raise InitDataValidationError("invalid auth_date")

    if auth_date <= 0 or time.time() - auth_date > max_age_seconds:
        raise InitDataValidationError("init_data is too old")

    user_json = parsed.get("user")
    if not user_json:
        raise InitDataValidationError("missing user field")

    try:
        user = json.loads(user_json)
    except json.JSONDecodeError as e:
        raise InitDataValidationError(f"invalid user JSON: {e}") from e

    if "id" not in user:
        raise InitDataValidationError("user.id missing")

    return user
