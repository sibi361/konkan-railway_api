const env = require("./assets/constants.js");
const express = require("express");
const scraper = require("./methods/scraper.js");

const app = express();

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

let globalData;
const updateData = () => {
    const browserResponse = scraper.fetchData();
    browserResponse.then((data) => (globalData = data));
};

updateData();
setInterval(updateData, env.REFRESH_INTERVAL * 1000);

app.listen(env.PORT, function () {
    if (env.DEBUG) console.log(`Running on port ${env.PORT}.`);
});

app.get("/", function (req, res) {
    res.send(globalData);
});
