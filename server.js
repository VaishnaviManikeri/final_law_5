const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const connectDB = require("./config/database");

/*
|--------------------------------------------------------------------------
| LOAD ENV VARIABLES
|--------------------------------------------------------------------------
*/
dotenv.config();

/*
|--------------------------------------------------------------------------
| CONNECT DATABASE
|--------------------------------------------------------------------------
*/
connectDB();

/*
|--------------------------------------------------------------------------
| CREATE EXPRESS APP
|--------------------------------------------------------------------------
*/
const app = express();

/*
|--------------------------------------------------------------------------
| CORS CONFIGURATION
|--------------------------------------------------------------------------
*/
app.use(
  cors({
    origin: [
      "http://localhost:5173", 
      "http://localhost:3000",
      "https://yourfrontenddomain.com"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/*
|--------------------------------------------------------------------------
| BODY PARSER
|--------------------------------------------------------------------------
*/
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*
|--------------------------------------------------------------------------
| STATIC FOLDERS
|--------------------------------------------------------------------------
*/
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/exports", express.static(path.join(__dirname, "exports")));

/*
|--------------------------------------------------------------------------
| ROOT TEST
|--------------------------------------------------------------------------
*/
app.get("/", (req, res) => {
  res.send("Backend is running successfully 🚀");
});

/*
|--------------------------------------------------------------------------
| API ROUTES
|--------------------------------------------------------------------------
*/
app.use("/api/test", require("./routes/testRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/gallery", require("./routes/galleryRoutes"));
app.use("/api/announcements", require("./routes/announcementRoutes"));
app.use("/api/careers", require("./routes/careerRoutes"));
app.use("/api/blogs", require("./routes/blogRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/admissions", require("./routes/admissionRoutes"));

/*
|--------------------------------------------------------------------------
| 404 HANDLER
|--------------------------------------------------------------------------
*/
app.use((req, res) => {
  res.status(404).json({
    error: "API route not found",
  });
});

/*
|--------------------------------------------------------------------------
| GLOBAL ERROR HANDLER
|--------------------------------------------------------------------------
*/
app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(500).json({
    error: "Something went wrong!",
    details: err.message,
  });
});

/*
|--------------------------------------------------------------------------
| START SERVER
|--------------------------------------------------------------------------
*/
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});