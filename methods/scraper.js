const env = require("../assets/constants.js");
const puppeteer = require("puppeteer");
const userAgents = require("../assets/userAgents.json");

const fetchData = async () =>
    puppeteer.launch({ headless: "false" }).then(async function (browser) {
        if (env.DEBUG) console.log("Fetching data from upstream");

        const page = await browser.newPage();
        const UA = userAgents[Math.floor(Math.random() * userAgents.length)].ua;
        await page.setUserAgent(UA);

        await page.goto(env.UPSTREAM_URL);

        const data = await page.evaluate(() => {
            const toTitleCase = (input) => {
                return `${input[0].toLocaleUpperCase()}${input
                    .slice(1)
                    .toLocaleLowerCase()}`;
            };

            const table = document.querySelector("#empNoHelpList");

            const timeStampRow = table.querySelectorAll("tr")[1];
            const timeSplit = timeStampRow.textContent.split(" ").slice(4, 6);
            const timeStamp =
                `${timeSplit[0].split("/").reverse().join("-")}` +
                `T${timeSplit[1]}`;

            const response = { lastUpdatedAt: timeStamp, trains: {} };
            const rows = Array.from(table.querySelectorAll("tr")).slice(3);

            response.trains = Array.from(rows).reduce((obj, row) => {
                const cells = row.querySelectorAll("td");

                return {
                    ...obj,
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

            return response;
        });
        await browser.close();
        if (env.DEBUG) console.log("Upstream fetch successful\n");

        return data;
    });

module.exports = {
    fetchData,
};
