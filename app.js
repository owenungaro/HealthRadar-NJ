
import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import exphbs from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import connectDb from './config/mongoConnection.js';
import configRoutes from './routes/index.js';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/public', express.static(path.join(__dirname, 'public')));

// handlebars setup
const hbs = exphbs.create({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts')
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// connect DB (once at startup)
await connectDb();

// sessions stored in Mongo
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      dbName: process.env.MONGO_DB_NAME,
      collectionName: 'sessions'
    }),
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 2 // 2 hours
    }
  })
);

// configure routes
configRoutes(app);

// start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  
  console.log(`Server running on http://localhost:${port}`);
});
