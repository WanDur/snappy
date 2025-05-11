# Snappy

## Introduction

This is the main repository for the software system of **_Snappy_**.

`/frontend` contains the Expo project for front end mobile application

`/backend` contains the FastAPI application mainly responsible for API endpoints.

Please refer to README in respective folders for detailed explanation on their usage.

# Development

Install Docker & Docker Compose first.

Run `docker-compose up` to install and deploy necessary backend services.

Upon pulling new updates from the backend, you should run `docker-compose up --build` to rebuild the backend.
