const puppeteer = require("puppeteer");
const userAgents = require("../assets/userAgents.json");

const fetchData = async () =>
    puppeteer.launch({ headless: "false" }).then(async function (browser) {
        // if (DEBUG) console.log("Fetching data from upstream");

        const page = await browser.newPage();
        const UA = userAgents[Math.floor(Math.random() * userAgents.length)].ua;
        await page.setUserAgent(UA);

        await page.goto(
            "https://konkanrailway.com/VisualTrain/otrktp0100Table.jsp"
        );

        const data = await page.evaluate(() => {
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
                    [cells[1].textContent.trim()]: {
                        number: cells[0].textContent,
                        status: cells[2].textContent.toLocaleLowerCase(),
                        station: cells[3].textContent.toLocaleLowerCase(),
                        arrivedTime: {
                            hours: cells[4].textContent.split(":")[0],
                            minutes: cells[4].textContent.split(":")[1],
                        },
                        delayed: {
                            hours: cells[5].textContent.split(":")[0],
                            minutes: cells[5].textContent.split(":")[1],
                        },
                    },
                };
            }, {});

            return response;
        });
        await browser.close();
        return data;
    });

module.exports = {
    fetchData,
};
