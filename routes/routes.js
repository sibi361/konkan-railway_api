const env = require("../constants.js");
const express = require("express");
const router = express.Router();
const scraper = require("../utils/scraper.js");

let stationsData = {},
    trainsData = {};

// fetch stations list
const browserResponse = scraper.fetchStations();
browserResponse.then((data) => {
    stationsData = {
        ...stationsData,
        stations: data.stations,
        count_stations: data.count,
    };
});

const updateData = () =>
    new Promise((resolve, reject) => {
        try {
            const browserResponse = scraper.fetchTrains(trainsData);
            browserResponse.then((data) => {
                trainsData = { ...data, ...trainsData };
                resolve(data);
            });
        } catch (e) {
            reject(e);
        }
    });

// at init
updateData();

// periodically refresh data from upstream
setInterval(updateData, env.UPSTREAM_REFRESH_INTERVAL * 1000);

router.get("/", function (req, res) {
    res.send({
        message: `Please visit ${env.REPO_URL} for API documentation`,
        success: true,
    });
});

router.get("/fetchStations", function (req, res) {
    if (stationsData?.stations) res.send({ ...stationsData, success: true });
    else {
        res.status(503);
        res.send({
            message: "Server is retrieving stations. Please wait.",
            success: false,
        });
    }
});

router.get("/fetchStation", function (req, res) {
    res.status(400);
    res.send({
        message: "Error: station name parameter not provided",
        success: false,
    });
});

router.get("/fetchStation/:stationName", function (req, res) {
    const stationName = req.params.stationName;
    if (env.DEBUG) console.log(`Fetching station: ${stationName}`);

    if (stationsData?.stations)
        if (Object.keys(stationsData?.stations).includes(stationName))
            res.send({
                [stationName]: stationsData.stations[stationName],
                success: true,
            });
        else {
            res.status(404);
            res.send({
                message: `Station named \"${stationName}\" NOT found.`,
                success: false,
            });
        }
    else {
        res.status(503);
        res.send({
            message: "Server is retrieving stations. Please wait.",
            success: false,
        });
    }
});

router.get("/fetchTrains", async function (req, res) {
    if (typeof req.query.latest !== "undefined")
        await updateData().catch((e) => {
            console.log(`Error: ${e}`);
            res.send(500);
            res.send({
                message: env.SERVER_ERROR_MESSAGE,
                success: false,
            });
        });

    if (trainsData.trains) res.send({ ...trainsData, success: true });
    else {
        res.status(503);
        res.send({
            message: "Server is retrieving trains. Please wait.",
            success: false,
        });
    }
});

router.get("/fetchTrain", function (req, res) {
    res.status(400);
    res.send({
        message: "Error: train number parameter not provided",
        success: false,
    });
});

router.get("/fetchTrain/:trainNo", async function (req, res) {
    const trainNo = req.params.trainNo;
    if (env.DEBUG) console.log(`Fetching train: ${trainNo}`);

    if (typeof req.query.latest !== "undefined")
        await updateData().catch((e) => {
            console.log(`Error: ${e}`);
            res.send(500);
            res.send({
                message: env.SERVER_ERROR_MESSAGE,
                success: false,
            });
        });

    if (trainsData?.trains)
        if (Object.keys(trainsData?.trains).includes(trainNo))
            res.send({
                lastUpdatedAt: trainsData.lastUpdatedAt,
                [trainNo]: trainsData.trains[trainNo],
                success: true,
            });
        else {
            res.status(404);
            res.send({
                lastUpdatedAt: trainsData?.lastUpdatedAt,
                message: `Train number \"${trainNo}\" NOT found. It might not have started yet.`,
                success: false,
            });
        }
    else {
        res.status(503);
        res.send({
            message: "Server is retrieving trains. Please wait.",
            success: false,
        });
    }
});

module.exports = router;
