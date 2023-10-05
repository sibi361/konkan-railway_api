const env = require("../constants.js");
const puppeteer = require("puppeteer");
const userAgents = require("../assets/userAgents.json");
const res = require("express/lib/response.js");

const fetchData = async () =>
    puppeteer.launch(env.PUPPETEER_OPTS).then(async function (browser) {
        if (env.DEBUG) console.log("Fetching trains data from upstream");

        const page = await browser.newPage();
        const UA = userAgents[Math.floor(Math.random() * userAgents.length)].ua;
        await page.setUserAgent(UA);

        await page.goto(env.UPSTREAM_TRAINS_URL);

        const response = await page.evaluate(() => {
            const toTitleCase = (input) => {
                if (!input) return "";

                return input
                    .split(" ")
                    .map(
                        (word) =>
                            `${word[0].toLocaleUpperCase()}${word
                                .slice(1)
                                .toLocaleLowerCase()}`
                    )
                    .join(" ");
            };

            const table = document.querySelector("#empNoHelpList");

            const timeStampRow = table.querySelectorAll("tr")[1];
            const timeSplit = timeStampRow.textContent.split(" ").slice(4, 6);
            const timeStamp =
                `${timeSplit[0].split("/").reverse().join("-")}` +
                `T${timeSplit[1]}`;

            const data = { lastUpdatedAt: timeStamp };
            const rows = Array.from(table.querySelectorAll("tr")).slice(3);

            data.trains = Array.from(rows).reduce((trains, row) => {
                const cells = row.querySelectorAll("td");

                return {
                    ...trains,
                    [cells[0].textContent.trim()]: {
                        name: cells[1].textContent.trim(),
                        status: cells[2].textContent.toLocaleLowerCase(),
                        station: toTitleCase(cells[3].textContent),
                        statusTime: {
                            hours: cells[4].textContent.split(":")[0],
                            minutes: cells[4].textContent.split(":")[1],
                        },
                        delayedTime: {
                            hours: cells[5].textContent.split(":")[0],
                            minutes: cells[5].textContent.split(":")[1],
                        },
                    },
                };
            }, {});
            data.count_trains = Object.keys(data.trains).length;

            return data;
        });

        await browser.close();
        if (env.DEBUG) console.log(`Updated trains count: ${response.count}`);

        return response;
    });

const fetchStations = () =>
    puppeteer.launch(env.PUPPETEER_OPTS).then(async function (browser) {
        if (env.DEBUG) console.log("Fetching stations data from upstream");

        const page = await browser.newPage();
        const UA = userAgents[Math.floor(Math.random() * userAgents.length)].ua;
        await page.setUserAgent(UA);

        await page.goto(env.UPSTREAM_STATIONS_URL);

        const response = await page.evaluate(() => {
            const stationsSelectEle = document.querySelector("#stationId");
            const options = Array.from(
                stationsSelectEle.querySelectorAll("option")
            ).slice(1); // exclude header
            const stations = options.map((option) => option.textContent.trim());

            return { stations, count: stations.length };
        });

        await browser.close();
        if (env.DEBUG) console.log(`Stations count: ${response.count}`);

        return response;
    });

module.exports = {
    fetchData,
    fetchStations,
};
