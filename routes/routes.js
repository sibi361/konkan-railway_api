const env = require("../constants.js");
const express = require("express");
const router = express.Router();
const scraper = require("../utils/scraper.js");

let globalData = {};

// fetch stations list
const browserResponse = scraper.fetchStations();
browserResponse.then((data) => {
    globalData = { ...globalData, stations: data.stations };
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

// at init
updateData();

// periodically fetch the latest data from upstream
setInterval(updateData, env.UPSTREAM_REFRESH_INTERVAL * 1000);

router.get("/", function (req, res) {
    res.send({
        message: `Please visit ${env.REPO_URL} for API documentation`,
        success: true,
    });
});

router.get("/fetchData", async function (req, res) {
    typeof req.query.latest !== "undefined"
        ? await updateData().catch((e) =>
              res.send({ message: `Error: ${e}`, success: false })
          )
        : {};

    res.send({ ...globalData, success: true });
});

router.get("/fetchStations", function (req, res) {
    res.send({ stations: globalData?.stations, success: true });
});

router.get("/fetchTrain", function (req, res) {
    res.send({
        message: "Error: train number parameter must be supplied",
        success: false,
    });
});

router.get("/fetchTrain/:trainNo", async function (req, res) {
    const trainNo = req.params.trainNo;

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
});

module.exports = router;
