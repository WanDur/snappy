FROM python:3.13.3-alpine

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt

RUN pip install --upgrade -r /code/requirements.txt

COPY ./app /code/app

WORKDIR /code/app

ENV RUN_MODE=prod

CMD ["fastapi", "run", "main.py", "--port", "8000"]