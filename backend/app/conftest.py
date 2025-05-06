import pytest


# Configure pytest-asyncio to use function-scoped event loops by default
# This prevents "Event loop is closed" errors
def pytest_configure(config):
    config.option.asyncio_default_fixture_loop_scope = "function"
    config.option.asyncio_default_test_loop_scope = "function"


@pytest.fixture(scope="session")
def event_loop(event_loop_policy):
    # Needed to work with asyncpg
    loop = event_loop_policy.new_event_loop()
    yield loop
    loop.close()
