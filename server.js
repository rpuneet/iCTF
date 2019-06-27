// Imports
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const path = require("path");

// Route Imports
const teams = require("./routes/api/teams");
const challenges = require("./routes/api/challenges");
const submissions = require("./routes/api/submissions");
const notifications = require("./routes/api/notifications");
const gamesettings = require("./routes/api/gamesettings");

// Initialisation
const app = express();
const PORT = process.env.PORT || 8008;

// Body Parser MiddleWare
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Connecting to database
const dbURI = require("./config/keys").mongoURI;
const dbOptions = { useNewUrlParser: true };
mongoose
  .connect(dbURI, dbOptions)
  .then(() => console.log("Database Connected"))
  .catch(err => console.log(err));

mongoose.set("useFindAndModify", false);

// Passport Middleware
app.use(passport.initialize());

// Passport confing
require("./config/passport")(passport);

// Use Routes
app.use("/api/teams", teams);
app.use("/api/challenges", challenges);
app.use("/api/submissions", submissions);
app.use("/api/notifications", notifications);
app.use("/api/gamesettings", gamesettings);

// Serve static assets.
if (process.env.NODE_ENV === "production") {
  // set a static folder.
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

app.listen(PORT, () => console.log(`Listening to port ${PORT}`));
