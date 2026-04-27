from __future__ import annotations

import logging

import pytest
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.testclient import TestClient

from src.app.utils.logging import RequestLoggingMiddleware, configure_logging


def test_configure_logging_runs():
    configure_logging()


def test_request_logging_middleware_logs_success(caplog: pytest.LogCaptureFixture):
    app = FastAPI()
    app.add_middleware(RequestLoggingMiddleware)

    @app.get("/ok")
    async def ok():
        return JSONResponse({"ok": True})

    with caplog.at_level(logging.INFO, logger="app.http"):
        response = TestClient(app).get("/ok", headers={"X-Request-ID": "req-1"})

    assert response.status_code == 200
    assert response.headers["X-Request-ID"] == "req-1"
    assert any("request_completed" in message for message in caplog.messages)


def test_request_logging_middleware_logs_failure(caplog: pytest.LogCaptureFixture):
    app = FastAPI()
    app.add_middleware(RequestLoggingMiddleware)

    @app.get("/boom")
    async def boom():
        raise RuntimeError("boom")

    client = TestClient(app, raise_server_exceptions=False)
    with caplog.at_level(logging.ERROR, logger="app.http"):
        response = client.get("/boom", headers={"X-Request-ID": "req-2"})

    assert response.status_code == 500
    assert any("request_failed" in message for message in caplog.messages)
