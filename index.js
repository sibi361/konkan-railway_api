const env = require("./constants.js");
const express = require("express");
const scraper = require("./methods/scraper.js");

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

let globalData = {};
new Promise(() => {
    const browserResponse = scraper.fetchStations();
    browserResponse.then((data) => {
        globalData = { ...globalData, stations: data.stations };
    });
});

const updateData = () =>
    new Promise((resolve, reject) => {
        try {
            const browserResponse = scraper.fetchData();
            browserResponse.then((data) => {
                globalData = { ...data, ...globalData };
                resolve(data);
            });
        } catch (e) {
            reject(e);
        }
    });

updateData();
setInterval(updateData, env.REFRESH_INTERVAL * 1000);

app.listen(env.PORT, function () {
    if (env.DEBUG) console.log(`Running on port ${env.PORT}.`);
});

app.get("/", function (req, res) {
    res.send({
        message: `Please visit ${env.REPO_URL} for API documentation`,
        success: true,
    });
});

app.get("/fetchData", async function (req, res) {
    typeof req.query.latest !== "undefined"
        ? await updateData().catch((e) =>
              res.send({ message: `Error: ${e}`, success: false })
          )
        : {};

    res.send({ ...globalData, success: true });
});

app.get("/fetchStations", async function (req, res) {
    res.send({ stations: globalData?.stations, success: true });
});

app.get("/fetchTrain/:trainNo", async function (req, res) {
    const trainNo = req.params.trainNo;

    if (!trainNo)
        res.send({
            message: 'Error: "trainNo" parameter not supplied',
            success: false,
        });
    else {
        if (typeof req.query.latest !== "undefined")
            await updateData().catch((e) =>
                res.send({ message: `Error: ${e}`, success: false })
            );

        globalData?.trains[trainNo]
            ? res.send({
                  lastUpdatedAt: globalData?.lastUpdatedAt,
                  [trainNo]: globalData?.trains[trainNo],
                  success: true,
              })
            : res.send({
                  lastUpdatedAt: globalData?.lastUpdatedAt,
                  message: `Train number ${trainNo} NOT found. It might not have started yet.`,
                  success: false,
              });
    }
});
