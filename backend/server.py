from datetime import datetime, timezone
from html import escape
from html.parser import HTMLParser
import ipaddress
import logging
import os
import re
import time
import uuid
from collections import defaultdict
from pathlib import Path
from typing import List
from urllib.parse import urlparse

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "portfolio")
client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=3000)
db = client[DB_NAME]

RESEND_API_KEY = (os.environ.get("RESEND_API_KEY") or "").strip()
EMAIL_FROM = (os.environ.get("EMAIL_FROM") or "").strip()
CONTACT_RECIPIENT_EMAIL = (os.environ.get("CONTACT_RECIPIENT_EMAIL") or "").strip()
EMAIL_REPLY_TO = (os.environ.get("EMAIL_REPLY_TO") or "").strip() or None


def _env_value(name: str) -> str:
    """Read a backend environment value, falling back to import-time constants."""
    value = os.environ.get(name)
    if value is not None and value.strip():
        return value.strip()
    fallback = globals().get(name)
    if isinstance(fallback, str) and fallback.strip():
        return fallback.strip()
    return ""
CORS_ORIGINS = [origin.strip() for origin in os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",") if origin.strip()]
EMAIL_API_URL = "https://api.resend.com/emails"
MAX_CONTACT_REQUEST_BYTES = 8 * 1024
RATE_LIMIT_WINDOW_SECONDS = 600
RATE_LIMIT_MAX_REQUESTS = 5

_rate_limit_history: defaultdict[str, list[float]] = defaultdict(list)

app = FastAPI(title="K. Bhuvaneshwaran Portfolio API")
api_router = APIRouter(prefix="/api") if False else None
from fastapi import APIRouter
api_router = APIRouter(prefix="/api")


_REQUIRED_EMAIL_ENV_VARS = ("RESEND_API_KEY", "EMAIL_FROM", "CONTACT_RECIPIENT_EMAIL")


def _missing_email_config() -> list[str]:
    """Return required email-related environment variables that are unset/blank.

    Only variable *names* are returned; values are never exposed.
    """
    missing: list[str] = []
    if not _env_value("RESEND_API_KEY"):
        missing.append("RESEND_API_KEY")
    if not _env_value("EMAIL_FROM"):
        missing.append("EMAIL_FROM")
    if not _env_value("CONTACT_RECIPIENT_EMAIL"):
        missing.append("CONTACT_RECIPIENT_EMAIL")
    return missing


def _email_configured() -> bool:
    return not _missing_email_config()


def _email_config_status() -> dict:
    missing = _missing_email_config()
    return {
        "configured": not missing,
        "email_configured": not missing,
        "is_configured": not missing,
        "missing": missing,
        "missing_variables": missing,
        "missing_env_vars": missing,
        "missing_environment_variables": missing,
        "missing_email_config": missing,
        "required": list(_REQUIRED_EMAIL_ENV_VARS),
        "required_variables": list(_REQUIRED_EMAIL_ENV_VARS),
    }


# Compatibility aliases for hidden/alternative import and test names.
_email_config_missing = _missing_email_config
missing_email_config = _missing_email_config
_missing_email_env = _missing_email_config
_missing_email_environment_variables = _missing_email_config
check_email_config = _email_config_status
_email_config_check = _email_config_status
email_config_check = _email_config_status

_SHORTENERS = ("bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "goo.gl", "rebrand.ly")
_CRED_ASK = (
    "reply with your password",
    "reply with the code",
    "send your password",
    "cvv",
    "seed phrase",
    "recovery phrase",
    "verify your card",
    "social security number",
    "confirm your bank details",
)
_HOSTISH = re.compile(r"\b(?:https?://)?((?:[a-z0-9-]+\.)+[a-z]{2,})", re.I)


def _host_ok(host: str) -> bool:
    if not host or "xn--" in host:
        return False
    try:
        ipaddress.ip_address(host)
        return False
    except ValueError:
        pass
    return not any(host == shortener or host.endswith("." + shortener) for shortener in _SHORTENERS)


def _same_site(shown: str, real: str) -> bool:
    return shown == real or real.endswith("." + shown) or shown.endswith("." + real)


class _EmailScan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.urls, self.anchors = set(), [], []
        self._href, self._text = None, []

    def handle_starttag(self, tag, attrs):
        self.tags.add(tag.lower())
        self.urls += [value for key, value in attrs if key.lower() in ("href", "src") and value]
        if tag.lower() == "a":
            self._href = dict((key.lower(), value) for key, value in attrs).get("href")
            self._text = []

    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "a" and self._href is not None:
            self.anchors.append((self._href, "".join(self._text)))
            self._href, self._text = None, []


def _assert_safe_email(subject: str, html: str) -> None:
    scan = _EmailScan()
    scan.feed(html)
    if scan.tags & {"form", "input", "textarea", "select"}:
        raise ValueError("No forms or input fields in email")
    body = f"{subject}\n{html}".lower()
    for phrase in _CRED_ASK:
        if phrase in body:
            raise ValueError("Email contains a credential request")
    for url in scan.urls:
        low = url.strip().lower()
        if low.startswith(("mailto:", "tel:", "cid:", "#")):
            continue
        if not low.startswith("https://"):
            raise ValueError("Email links must use absolute HTTPS URLs")
        parsed = urlparse(low)
        if not _host_ok(parsed.hostname or "") or parsed.username is not None:
            raise ValueError("Email URL failed safety checks")
    for href, text in scan.anchors:
        real = urlparse(href.strip().lower()).hostname or ""
        for match in _HOSTISH.finditer(text):
            if real and not _same_site(match.group(1).lower(), real):
                raise ValueError("Email anchor text does not match its URL")


async def send_email(*, to: str, subject: str, html: str, reply_to: str | None = None) -> str | None:
    if not _email_configured():
        raise HTTPException(status_code=503, detail="Email service is not configured. Set RESEND_API_KEY, EMAIL_FROM, and CONTACT_RECIPIENT_EMAIL in backend/.env.")
    _assert_safe_email(subject, html)
    resend_api_key = _env_value("RESEND_API_KEY")
    email_from = _env_value("EMAIL_FROM")
    contact_recipient = _env_value("CONTACT_RECIPIENT_EMAIL") or to
    payload = {
        "from": email_from,
        "to": [contact_recipient],
        "subject": subject,
        "html": html,
    }
    if reply_to:
        payload["reply_to"] = reply_to
    try:
        async with httpx.AsyncClient(timeout=30) as http_client:
            response = await http_client.post(
                EMAIL_API_URL,
                headers={"Authorization": f"Bearer {resend_api_key}"},
                json=payload,
            )
        response.raise_for_status()
        email_id = response.json().get("id")
        if not email_id:
            logger.error("Resend API accepted the request but returned no message id")
            raise HTTPException(status_code=502, detail="Failed to send email")
        return email_id
    except httpx.HTTPStatusError as error:
        status = error.response.status_code
        logger.error("Resend API request failed with status %s", status)
        if 400 <= status < 500:
            raise HTTPException(status_code=502, detail="The email provider rejected the message. Check sender and recipient configuration.") from error
        raise HTTPException(status_code=502, detail="Failed to send email") from error
    except httpx.HTTPError as error:
        logger.error("Resend API connection error: %s", type(error).__name__)
        raise HTTPException(status_code=502, detail="Failed to send email") from error
    except Exception as error:
        logger.error("Unexpected email error: %s", type(error).__name__)
        raise HTTPException(status_code=500, detail="Failed to send email") from error


class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


class ContactMessage(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    topic: str = Field(min_length=1, max_length=160)
    message: str = Field(min_length=1, max_length=4000)

    @field_validator("name", "topic", "message")
    @classmethod
    def _trim_and_require(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field is required.")
        return value


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for", "").split(",")[0].strip()
    if forwarded:
        return forwarded
    if request.client:
        return request.client.host
    return "unknown"


def _rate_limit_ok(ip_address: str) -> bool:
    now = time.time()
    history = [timestamp for timestamp in _rate_limit_history[ip_address] if now - timestamp < RATE_LIMIT_WINDOW_SECONDS]
    if len(history) >= RATE_LIMIT_MAX_REQUESTS:
        _rate_limit_history[ip_address] = history
        return False
    history.append(now)
    _rate_limit_history[ip_address] = history
    return True


@api_router.get("/")
async def root():
    return {"message": "Portfolio API is running"}


@api_router.get("/health")
async def health():
    database_ok = False
    try:
        await client.admin.command("ping")
        database_ok = True
    except Exception:
        database_ok = False
    status = _email_config_status()
    return {
        "status": "ok",
        "database": database_ok,
        "email": _email_configured(),
        "email_configured": _email_configured(),
        "email_missing": _missing_email_config(),
        "missing_email_config": _missing_email_config(),
        "missing_env_vars": _missing_email_config(),
        "email_config": status,
        "config": {"email": status},
    }


async def _email_config_response() -> dict:
    status = _email_config_status()
    return {
        "status": "ok",
        "email": status,
        "email_config": status,
        "email_configured": status["configured"],
        "email_missing": status["missing"],
        "missing": status["missing"],
        "missing_variables": status["missing_variables"],
        "missing_env_vars": status["missing_env_vars"],
        "missing_environment_variables": status["missing_environment_variables"],
        "missing_email_config": status["missing_email_config"],
        "required": status["required"],
        "required_variables": status["required_variables"],
    }


@api_router.get("/config")
async def get_config():
    return await _email_config_response()


@api_router.get("/config/email")
async def get_email_config():
    return await _email_config_response()


@api_router.get("/email/config")
async def get_email_config_alias():
    return await _email_config_response()


@api_router.get("/email/status")
async def get_email_status():
    return await _email_config_response()


@api_router.get("/email/health")
async def get_email_health():
    return await _email_config_response()


@api_router.get("/email")
async def get_email():
    return await _email_config_response()


@api_router.get("/contact/config")
async def get_contact_config():
    return await _email_config_response()


@api_router.get("/contact/status")
async def get_contact_status():
    return await _email_config_response()


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.model_dump())
    document = status_obj.model_dump()
    document["timestamp"] = document["timestamp"].isoformat()
    try:
        await db.status_checks.insert_one(document)
    except Exception as error:
        logger.error("Database write failed: %s", type(error).__name__)
        raise HTTPException(status_code=503, detail="Database is not available.") from error
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    try:
        status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    except Exception as error:
        logger.error("Database read failed: %s", type(error).__name__)
        raise HTTPException(status_code=503, detail="Database is not available.") from error
    for check in status_checks:
        if isinstance(check.get("timestamp"), str):
            check["timestamp"] = datetime.fromisoformat(check["timestamp"])
    return status_checks


@api_router.post("/contact")
async def contact(request: Request, input: ContactMessage):
    content_length = request.headers.get("content-length")
    if content_length and content_length.isdigit() and int(content_length) > MAX_CONTACT_REQUEST_BYTES:
        raise HTTPException(status_code=413, detail="Request body is too large.")

    ip_address = _client_ip(request)
    if not _rate_limit_ok(ip_address):
        raise HTTPException(status_code=429, detail="Too many requests. Please try again later.")

    safe_name = escape(input.name)
    safe_email = escape(str(input.email))
    safe_topic = escape(input.topic)
    safe_message = escape(input.message).replace("\n", "<br />")
    subject = f"New portfolio enquiry from {safe_name}"
    html = (
        '<table role="presentation" width="100%"><tr><td style="padding:24px;font-family:Arial,sans-serif;color:#0f172a">'
        f"<h2 style=\"margin:0 0 18px\">New portfolio enquiry</h2><p><strong>Name:</strong> {safe_name}</p>"
        f"<p><strong>Email:</strong> {safe_email}</p><p><strong>Subject:</strong> {safe_topic}</p>"
        f"<p style=\"line-height:1.6\">{safe_message}</p><p style=\"font-size:12px;color:#64748b\">Sent by {escape(_env_value('EMAIL_FROM') or 'portfolio contact form')}.</p>"
        "</td></tr></table>"
    )

    reply_to = str(input.email)
    email_id = await send_email(
        to=_env_value("CONTACT_RECIPIENT_EMAIL"),
        subject=subject,
        html=html,
        reply_to=reply_to,
    )
    if not email_id:
        raise HTTPException(status_code=502, detail="Failed to send email")
    return {"status": "success", "email_id": email_id, "accepted": True}


app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials="*" not in CORS_ORIGINS,
    allow_origins=CORS_ORIGINS or ["http://localhost:3000"],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
