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

When testing out the frontend on the same device as the backend running device, you can directly test
the connection to the backend server.

Otherwise, make sure your mobile device is connected to the same network as the backend running device,
and obtain the local IP of the backend running device. Make a new file `/frontend/.env.local` and set
`EXPO_PUBLIC_DEBUG_URL=http://<LOCAL_IP_OF_BACKEND_SERVER>:8000`. Then you may test out the mobile app with Expo Go app.

## Sample Data in Database

You may run `python backend/app/utils/generate_mock_data.py` to generate 10 sample users in the database.

If you wish to reset the database, you may add `--reset` after the above command`
