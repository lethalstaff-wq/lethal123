"""Тесты многошаговой воронки."""

from __future__ import annotations

from services.funnel_v2 import (
    DEFAULT_FUNNEL,
    FunnelState,
    FunnelStep,
    generate_personal_promo,
    pick_template,
    render_funnel_message,
    should_stop_funnel,
)


def test_default_funnel_has_3_steps():
    assert len(DEFAULT_FUNNEL) == 3
    assert DEFAULT_FUNNEL[0].delay_minutes == 60
    assert DEFAULT_FUNNEL[1].delay_minutes == 24 * 60


def test_should_stop_on_purchase():
    assert should_stop_funnel("купил, спасибо", ["купил"])
    assert should_stop_funnel("уже взял", ["взял"])
    assert not should_stop_funnel("думаю ещё", ["купил", "взял"])


def test_should_stop_empty():
    assert not should_stop_funnel("", ["купил"])
    assert not should_stop_funnel("hello", ["купил"])


def test_pick_template_random():
    step = FunnelStep(delay_minutes=60, templates=["A", "B", "C"])
    for _ in range(20):
        assert pick_template(step) in {"A", "B", "C"}


def test_pick_template_empty():
    step = FunnelStep(delay_minutes=60, templates=[])
    assert pick_template(step) == ""


def test_render_message_vars():
    text = render_funnel_message(
        "Привет, {buyer}! Цена {lot} со скидкой {discount}% — промо {promo}",
        buyer="alice",
        lot="Random Key",
        discount=10,
        promo="FNL-ABC-123",
    )
    assert "alice" in text
    assert "Random Key" in text
    assert "10" in text
    assert "FNL-ABC-123" in text


def test_render_message_unknown_var_safe():
    text = render_funnel_message("{unknown_var}", buyer="a", lot="b")
    assert text == "{unknown_var}"


def test_generate_promo_format():
    code = generate_personal_promo(user_id=42, chat_id="c1")
    assert code.startswith("FNL-")
    assert len(code) == 15  # FNL-XXXXX-XXXXX


def test_generate_promo_unique():
    codes = {generate_personal_promo(42, "c1") for _ in range(20)}
    assert len(codes) > 1  # не все одинаковые (т.к. есть random token)


def test_funnel_state_advance():
    state = FunnelState()
    assert state.step_index == 0
    state.advance()
    assert state.step_index == 1
    assert state.total_sent == 1


def test_funnel_state_stop():
    state = FunnelState()
    state.mark_stopped()
    assert state.stopped is True


def test_funnel_state_conversion():
    state = FunnelState()
    state.mark_converted()
    assert state.conversion is True
    assert state.stopped is True
