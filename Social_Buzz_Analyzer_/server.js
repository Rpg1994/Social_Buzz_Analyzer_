// Load environment variables
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import authRoutes from './routes/authRoutes.js';
import stripeRoutes from './routes/stripeRoutes.js';
import bodyParser from 'body-parser';
import cron from 'node-cron';
import { updateCryptocurrencyList } from './services/cryptoUpdater.js';
import apiRoutes from './routes/apiRoutes.js'; // Consolidated API routes
import predictionRoutes from './routes/predictionRoutes.js'; // Prediction routes
import alertRoutes from './routes/alertRoutes.js'; // Alert management routes
import dashboardRoutes from './routes/dashboardRoutes.js'; // Dashboard management routes
import Cryptocurrency from './models/Cryptocurrency.js';
import { updateStatisticalModel } from './services/statisticalModelingService.js';
import { checkAlertConditions } from './services/notificationService.js'; // Importing the notification service
import { runSentimentAnalysis } from './services/sentimentAnalysisService.js'; // Importing the sentiment analysis service
import { detectAndStoreAnomalies } from './services/anomalyDetectionService.js'; // Importing the anomaly detection service

if (!process.env.DATABASE_URL || !process.env.SESSION_SECRET) {
  console.error("Error: config environment variables not set. Please create/edit .env configuration file.");
  process.exit(-1);
}

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Setting the templating engine to EJS
app.set("view engine", "ejs");

// Serve static files
app.use(express.static("public"));

// Database connection
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.error(`Database connection error: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  });

// Session configuration with connect-mongo
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DATABASE_URL }),
  }),
);

app.on("error", (error) => {
  console.error(`Server error: ${error.message}`);
  console.error(error.stack);
});

// Logging session creation and destruction
app.use((req, res, next) => {
  const sess = req.session;
  // Make session available to all views
  res.locals.session = sess;
  if (!sess.views) {
    sess.views = 1;
    console.log("Session created at: ", new Date().toISOString());
  } else {
    sess.views++;
    console.log(
      `Session accessed again at: ${new Date().toISOString()}, Views: ${sess.views}, User ID: ${sess.userId || '(unauthenticated)'}`,
    );
  }
  next();
});

// Authentication Routes
app.use(authRoutes);

// Stripe Routes
app.use('/stripe', bodyParser.raw({type: 'application/json'}), stripeRoutes);

// Consolidated API Routes
app.use('/api', apiRoutes);

// Prediction Routes
app.use('/api', predictionRoutes);

// Alert Management Routes
app.use(alertRoutes);

// Dashboard Management Routes
app.use('/api', dashboardRoutes);

// Root path response
app.get("/", (req, res) => {
  res.render("index");
});

// If no routes handled the request, it's a 404
app.use((req, res, next) => {
  res.status(404).send("Page not found.");
});

// Error handling
app.use((err, req, res, next) => {
  console.error(`Unhandled application error: ${err.message}`);
  console.error(err.stack);
  res.status(500).send("There was an error serving your request.");
});

// Schedule to run every day at 00:00
cron.schedule('0 0 * * *', () => {
  console.log('Running a daily task to update the cryptocurrency list');
  updateCryptocurrencyList().catch(error => {
    console.error('Failed to update cryptocurrency list:', error.message);
    console.error(error.stack);
  });
});

// Schedule to run every day at 01:00 to update the statistical models for each cryptocurrency
cron.schedule('0 1 * * *', async () => {
  console.log('Running a daily task to update the statistical models for each cryptocurrency');
  try {
    const cryptocurrencies = await Cryptocurrency.find({}).lean();
    if (cryptocurrencies.length === 0) {
      console.log('No cryptocurrencies found to update statistical models.');
      return;
    }

    for (let crypto of cryptocurrencies) {
      try {
        await updateStatisticalModel(crypto.ticker);
        console.log(`Statistical model updated for ${crypto.ticker}`);
      } catch (error) {
        console.error(`Failed to update statistical model for ${crypto.ticker}:`, error.message);
        console.error(error.stack);
      }
    }
  } catch (error) {
    console.error('Failed to retrieve cryptocurrencies for statistical model updates:', error.message);
    console.error(error.stack);
  }
});

// Schedule to run every hour to check alert conditions
cron.schedule('0 * * * *', () => {
  console.log('Running hourly task to check alert conditions');
  checkAlertConditions().catch(error => {
    console.error('Failed to check alert conditions:', error.message);
    console.error(error.stack);
  });
});

// Schedule to run daily sentiment analysis for all tracked cryptocurrencies
cron.schedule('0 2 * * *', () => {
  console.log('Running daily sentiment analysis task for all cryptocurrencies');
  runSentimentAnalysis().catch(error => {
    console.error('Failed to complete daily sentiment analysis task:', error.message);
    console.error(error.stack);
  });
});

// Schedule anomaly detection to run daily
cron.schedule('0 3 * * *', () => {
  console.log('Starting anomaly detection...');
  detectAndStoreAnomalies().catch(error => {
    console.error('Failed to complete anomaly detection task:', error.message);
    console.error(error.stack);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});