from aiogram.fsm.state import State, StatesGroup


class NewHabitStates(StatesGroup):
    waiting_for_name = State()
    waiting_for_emoji = State()
    waiting_for_custom_emoji = State()
    waiting_for_schedule_type = State()
    waiting_for_weekdays = State()
    waiting_for_times_per_week = State()
    waiting_for_every_n_days = State()
    waiting_for_description = State()
    waiting_for_reminder_time = State()
    waiting_for_reminder_custom_time = State()
    waiting_for_reminder_days = State()
    confirm = State()


class TimezoneStates(StatesGroup):
    waiting_for_manual_input = State()
