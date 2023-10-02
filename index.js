const env = require("./constants.js");
const express = require("express");
const apiRoute = require("./routes/routes.js");

const app = express();

// CORS
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

app.use(`/api/v${env.API_VERSION}/`, apiRoute);

app.get("/", function (req, res) {
    res.redirect(`/api/v${env.API_VERSION}/`);
});

app.listen(env.PORT, function () {
    if (env.DEBUG) console.log(`Running on port ${env.PORT}.`);
});
