# HealthRadarNJ
CS546 Final Project

## Setup

Before running the project, install dependencies:

    npm install

## Environment Variables

Create a `.env` file in the root of the project with the following values:

    MONGO_URI=mongodb://localhost:27017
    MONGO_DB_NAME=healthradar_nj
    SESSION_SECRET=secret
    PORT=3000
    RUN_SEED=FALSE
    CREATE_ADMIN=FALSE

### First Run Only

On your first run, set the following values to TRUE:

    RUN_SEED=TRUE
    CREATE_ADMIN=TRUE

This will seed the database and create the admin account.  
After the initial run, change both values back to FALSE to avoid reseeding or recreating the admin user.

## Admin Account

The default admin credentials are:

- Username: Admin  
- Email: admin@example.com  
- Password: Admin123!

These values are defined in `app.js` where the `createAdmin()` function is called

## Running the App

Once everything is set up, start the server:

    npm start
