# Introduction

This is a FastAPI application developed in Python version 3.13.2

All code of this project must follow the rules of Black Formatter (25.1.0)

# Development

1. Create a Python virtual environment in `/backend`

```
python -m venv .venv
```

2. Activate the virtual environment

Linux / macOS:

```
source .venv/bin/activate
```

Windows:

```
source .venv/Scripts/activate
```

3. Install all required libraries

```
pip install -r requirements.txt
```

# Running

If you run `docker-compose up`, the FastAPI server will be started in production mode automatically

If you wish to run the FastAPI server in development mode, run `fastapi dev main.py`

# Update Dependencies

After installing new dependencies or updating their versions, make sure to update the `requirements.txt` as well.

You can do so with `pip freeze > requirements.txt`
