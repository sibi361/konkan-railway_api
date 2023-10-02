const env = require("../constants.js");
const puppeteer = require("puppeteer");
const userAgents = require("../assets/userAgents.json");

const fetchData = async () =>
    puppeteer.launch({ headless: "false" }).then(async function (browser) {
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

            const data = { lastUpdatedAt: timeStamp, trains: {} };
            const rows = Array.from(table.querySelectorAll("tr")).slice(3);

            data.trains = Array.from(rows).reduce((trains, row) => {
                const cells = row.querySelectorAll("td");

                return {
                    ...trains,
                    [cells[0].textContent.trim()]: {
                        name: cells[1].textContent.trim(),
                        status: cells[2].textContent.toLocaleLowerCase(),
                        station: toTitleCase(cells[3].textContent),
                        arrivedTime: {
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

            return data;
        });

        await browser.close();
        if (env.DEBUG) console.log("Upstream trains fetch successful");

        return response;
    });

const fetchStations = () =>
    puppeteer.launch({ headless: "false" }).then(async function (browser) {
        if (env.DEBUG) console.log("Fetching stations data from upstream");

        const page = await browser.newPage();
        const UA = userAgents[Math.floor(Math.random() * userAgents.length)].ua;
        await page.setUserAgent(UA);

        await page.goto(env.UPSTREAM_STATIONS_URL);

        const response = await page.evaluate(() => {
            stationsSelectEle = document.querySelector("#stationId");

            options = Array.from(
                stationsSelectEle.querySelectorAll("option")
            ).slice(1);

            stations = options.map((option) => option.textContent.trim());

            return { stations };
        });

        await browser.close();
        if (env.DEBUG) console.log("Upstream stations fetch successful\n");

        return response;
    });

module.exports = {
    fetchData,
    fetchStations,
};
