# Battleship Game - Backend

## Description

The backend of a Battleship game web application written in Typescript. Deployed live [here](https://battleship-game.onrender.com)

The frontend of this project is found [here](https://github.com/earacena/battleship-webapp-frontend).

### Technologies

* Typescript
* PostgreSQL
* Nodejs
* Fastify + Websockets

## Usage

### Download

While in terminal with chosen directory, enter the command:

```bash
git clone https://github.com/earacena/battleship-webapp-backend.git
```

### Install

While in the root project folder, enter the command:

```bash
npm install
```

### Setup

In order to run the backend, deploy locally, or run tests, a .env file with the following variables must be in root project folder:

```text
DEV_DATABASE_URL="postgres://pguser:pgpass@localhost:3003/pgdb"
TEST_DATABASE_URL="postgres://pguser:pgpass@localhost:3003/test_pgdb"
DATABASE_URL="postgres://..." # For live deployment, add connection URL for database 
PORT=3001
SECRET_JWT_KEY="abcd1234" # Generate your own key and paste here
```

### Deploy locally for development

In one terminal, run the following in the root project folder:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

In another terminal, run:

```bash
npm run dev
```
