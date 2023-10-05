const env = require("../constants.js");
const puppeteer = require("puppeteer");
const userAgents = require("../assets/userAgents.json");

const fetchData = async (oldTrainsData) =>
    puppeteer.launch(env.PUPPETEER_OPTS).then(async function (browser) {
        if (env.DEBUG)
            console.log("fetchData: Fetching trains data from upstream");

        const page = await browser.newPage();
        const UA = userAgents[Math.floor(Math.random() * userAgents.length)].ua;
        await page.setUserAgent(UA);

        await page.goto(env.UPSTREAM_TRAINS_URL);

        const response = await page.evaluate((oldData) => {
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

            let updated = false;
            if (oldData?.lastUpdatedAt === timeStamp)
                return { data: { ...oldData }, updated };
            else updated = true;

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

            // fetchother side and get 2 stu

            return { data, updated };
        }, oldTrainsData);
        await browser.close();

        response.data.count_trains = Object.keys(response.data.trains).length;

        if (env.DEBUG)
            if (response.updated)
                console.log(
                    `fetchData: Updated trains count: ${response.data.count_trains}`
                );
            else console.log("fetchData: No new updates");

        return response.data;
    });

const fetchStations = () =>
    puppeteer.launch(env.PUPPETEER_OPTS).then(async function (browser) {
        if (env.DEBUG)
            console.log("fetchStations: Fetching stations data from upstream");

        const page = await browser.newPage();
        const UA = userAgents[Math.floor(Math.random() * userAgents.length)].ua;
        await page.setUserAgent(UA);

        await page.goto(env.UPSTREAM_STATIONS_URL);

        const response = await page.evaluate(() => {
            const stationsSelectEle = document.querySelector("#stationId");
            const options = Array.from(
                stationsSelectEle.querySelectorAll("option")
            ).slice(1); // exclude header
            let stations = options.reduce(
                (stations, option) => ({
                    ...stations,
                    [option.textContent.trim()]: {},
                }),
                {}
            );

            const stationTypeArr = document.querySelectorAll(
                'input[type="hidden"][name^="stationType"]'
            );
            const stationStateArr = document.querySelectorAll(
                'input[type="hidden"][name^="stationState"]'
            );
            const stationDescriptionArr = document.querySelectorAll(
                'input[type="hidden"][name^="stationDescription"]'
            );
            const distanceArr = document.querySelectorAll(
                'input[type="hidden"][name^="distance"]'
            );

            if (stations)
                stations = Object.keys(stations)
                    .slice(0)
                    .reduce((stationsObj, stName, i, arr) => {
                        // break if num(hidden inputs) < num(select options)
                        if (
                            i === stationTypeArr.length ||
                            i === stationStateArr.length ||
                            i === stationDescriptionArr.length ||
                            i === distanceArr.length
                        )
                            arr.splice(i); // https://stackoverflow.com/a/47441371

                        const stateValue = stationStateArr[i]?.value
                            .trim()
                            .toLocaleLowerCase();
                        let state;
                        switch (stateValue) {
                            case "m":
                                state = "Maharashtra";
                                break;
                            case "g":
                                state = "Goa";
                                break;
                            case "k":
                                state = "Karnataka";
                                break;
                            default:
                                state = stateValue;
                        }

                        return {
                            ...stationsObj,
                            [stName]: {
                                type: stationTypeArr[i]?.value
                                    .trim()
                                    .toLocaleLowerCase(),
                                state,
                                description:
                                    stationDescriptionArr[i]?.value.trim(),
                                distance: distanceArr[i]?.value.trim(),
                            },
                        };
                    }, stations);

            return { stations, count: Object.keys(stations).length };
        });

        await browser.close();
        if (env.DEBUG)
            console.log(`fetchStations: Stations count: ${response.count}`);

        return response;
    });

module.exports = {
    fetchData,
    fetchStations,
};
