const DEBUG = true;

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
setTimeout(updateData, 10000);

app.listen(7000, function () {
    if (DEBUG) console.log(`Running on port 7000.`);
});

app.get("/", function (req, res) {
    res.send(globalData);
});
