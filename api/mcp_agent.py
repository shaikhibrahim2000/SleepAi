def summarize_sleep(summary: dict):
    """
    Placeholder for MCP-powered assistant. This returns a deterministic summary
    so the frontend can be wired up before MCP integration.
    """
    score = summary.get("sleep_quality_score", "unknown")
    duration = summary.get("duration_sec", "unknown")

    return (
        f"Your sleep session lasted {duration} seconds with a quality score of {score}. "
        "I can help explain disturbances and trends once MCP is connected."
    )
