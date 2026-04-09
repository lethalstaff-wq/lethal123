"""Тесты для utils.helpers."""

from __future__ import annotations

import pytest

from utils.helpers import (
    escape_html,
    gen_referral_code,
    mask_password,
    parse_proxy,
    proxy_to_url,
)


class TestParseProxy:
    def test_full_url(self):
        p = parse_proxy("http://user:pass@1.2.3.4:8080")
        assert p == {
            "scheme": "http",
            "host": "1.2.3.4",
            "port": 8080,
            "user": "user",
            "password": "pass",
        }

    def test_socks5(self):
        p = parse_proxy("socks5://1.2.3.4:1080")
        assert p["scheme"] == "socks5"
        assert p["port"] == 1080
        assert p["user"] is None

    def test_host_port(self):
        p = parse_proxy("1.2.3.4:8080")
        assert p["host"] == "1.2.3.4"
        assert p["port"] == 8080
        assert p["scheme"] == "http"

    def test_colon_format(self):
        p = parse_proxy("1.2.3.4:8080:user:pass")
        assert p["user"] == "user"
        assert p["password"] == "pass"

    def test_user_pass_at(self):
        p = parse_proxy("user:pass@1.2.3.4:8080")
        assert p["user"] == "user"
        assert p["host"] == "1.2.3.4"

    def test_garbage(self):
        assert parse_proxy("garbage") is None
        assert parse_proxy("") is None
        assert parse_proxy("not:a:port") is None

    def test_roundtrip(self):
        for raw in [
            "http://u:p@1.2.3.4:8080",
            "socks5://1.2.3.4:1080",
            "1.2.3.4:8080",
        ]:
            p = parse_proxy(raw)
            url = proxy_to_url(p)
            re_p = parse_proxy(url)
            assert re_p["host"] == p["host"]
            assert re_p["port"] == p["port"]


class TestRefCode:
    def test_length(self):
        assert len(gen_referral_code()) == 8

    def test_custom_length(self):
        assert len(gen_referral_code(12)) == 12

    def test_alphanumeric(self):
        code = gen_referral_code()
        assert code.isalnum()
        assert code.isupper() or any(c.isdigit() for c in code)


class TestMaskPassword:
    def test_normal(self):
        assert mask_password("hunter2") == "h*****2"

    def test_short(self):
        assert mask_password("ab") == "**"
        assert mask_password("a") == "*"

    def test_empty(self):
        assert mask_password("") == ""


class TestEscapeHtml:
    def test_basic(self):
        assert escape_html("<b>hi</b>") == "&lt;b&gt;hi&lt;/b&gt;"

    def test_amp_first(self):
        # & должен экранироваться ПЕРВЫМ — иначе получится &amp;lt;
        assert escape_html("a & <b>") == "a &amp; &lt;b&gt;"

    def test_no_special(self):
        assert escape_html("hello world") == "hello world"
