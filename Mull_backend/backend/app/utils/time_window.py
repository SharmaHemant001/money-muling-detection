from datetime import timedelta

WINDOW_HOURS = 72

def within_time_window(start, end):
    return (end - start) <= timedelta(hours=WINDOW_HOURS)
