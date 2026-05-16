// basic app configuration
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import expressLayouts from "express-ejs-layouts";
import methodOverride from "method-override";
import "./db/index.js";
import bookRoutes from "./routes/books.routes.js";

const app = express();

// ES module setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// layouts
app.use(expressLayouts);
app.set("layout", "layouts/main");

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  methodOverride((req) => {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
      return req.body._method;
    }
  }),
);
app.use(express.static(path.join(__dirname, "../public")));

// Routes
app.use("/books", bookRoutes);

// Main page
app.get("/", (req, res) => {
  res.redirect("/books");
});

// 404 handler
app.use((req, res) => {
  res.status(404).send("Page not found");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

export default app;
