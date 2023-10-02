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

let globalData;
const updateData = () =>
    new Promise((resolve, reject) => {
        try {
            const browserResponse = scraper.fetchData();
            browserResponse.then((data) => {
                globalData = data;
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
    const latest = req.query.latest;

    latest
        ? await updateData().catch((e) =>
              res.send({ message: `Error: ${e}`, success: false })
          )
        : {};

    res.send({ ...globalData, success: true });
});

app.get("/getTrain", async function (req, res) {
    const latest = req.query.latest;
    const trainNo = req.query.tno;

    if (!trainNo)
        res.send({
            message: 'Error: "trainNo" parameter not supplied',
            success: false,
        });

    if (latest)
        await updateData().catch((e) =>
            res.send({ message: `Error: ${e}`, success: false })
        );

    globalData?.trains[trainNo]
        ? res.send({ ...globalData?.trains[trainNo], success: true })
        : res.send({
              message: `Train number ${trainNo} NOT found. Perhaps it hasn't started its course yet.`,
              success: false,
          });
});
