import logging

logger = logging.getLogger('uvicorn.error')

def log_debug(message: str):
    logger.debug(message)