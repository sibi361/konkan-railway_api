const env = require("../constants.js");
const userAgents = require("../assets/userAgents.json");

const { DEFAULT_INTERCEPT_RESOLUTION_PRIORITY } = require("puppeteer");
const puppeteer = require("puppeteer-extra");
const blockResourcesPlugin = require("puppeteer-extra-plugin-block-resources")({
    // everything except for "document" i.e. HTML is blocked to save bandwidth
    blockedTypes: new Set([
        "stylesheet",
        "image",
        "media",
        "font",
        "script",
        "texttrack",
        "xhr",
        "fetch",
        "eventsource",
        "websocket",
        "manifest",
        "other",
    ]),
    interceptResolutionPriority: DEFAULT_INTERCEPT_RESOLUTION_PRIORITY,
});
puppeteer.use(blockResourcesPlugin);

const fetchTrains = async (oldTrainsData) =>
    puppeteer.launch(env.PUPPETEER_OPTS).then(async function (browser) {
        if (env.DEBUG)
            console.log("fetchData: Fetching trains data from upstream");

        const page = await browser.newPage();
        const UA = userAgents[Math.floor(Math.random() * userAgents.length)].ua;
        await page.setUserAgent(UA);

        await page.goto(env.UPSTREAM_URL);

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

            const timeStampSpan = document.querySelector(".lastupdatetext");
            const timeSplit = timeStampSpan.textContent.split(" ").slice(4, 6);
            const timeStamp =
                `${timeSplit[0].split("/").reverse().join("-")}` +
                `T${timeSplit[1]}`;

            // proceed further only if upstream has new data
            let updated = false;
            if (oldData?.lastUpdatedAt === timeStamp)
                return { data: { ...oldData }, updated };
            else updated = true;

            const data = { lastUpdatedAt: timeStamp };

            const trainDataArr = document.querySelectorAll(
                'input[type="hidden"][name^="trainData"]'
            );

            const statusArr = document.querySelectorAll(
                'input[type="hidden"][name^="status"]'
            );
            const statusArrLen = statusArr.length;

            const closedSationArr = document.querySelectorAll(
                'input[type="hidden"][name^="closedSation"]'
            );
            const closedSationArrLen = closedSationArr.length;

            const arrivedTimeArr = document.querySelectorAll(
                'input[type="hidden"][name^="arrivedTime"]'
            );
            const arrivedTimeArrLen = arrivedTimeArr.length;

            const lateTimeArr = document.querySelectorAll(
                'input[type="hidden"][name^="lateTime"]'
            );
            const lateTimeArrLen = lateTimeArr.length;

            const trainTypeArr = document.querySelectorAll(
                'input[type="hidden"][name^="trainType"]'
            );
            const trainTypeArrLen = trainTypeArr.length;

            const trainDirectionArr = document.querySelectorAll(
                'input[type="hidden"][name^="trainDirection"]'
            );
            const trainDirectionArrLen = trainDirectionArr.length;

            data.trains = Array.from(trainDataArr)
                .slice(0)
                .reduce((trains, trainData, i, inputArray) => {
                    // break if num(hidden inputs) < num(select options)
                    if (
                        i === statusArrLen ||
                        i === closedSationArrLen ||
                        i === arrivedTimeArrLen ||
                        i === lateTimeArrLen ||
                        i === trainTypeArrLen ||
                        i === trainDirectionArrLen
                    )
                        inputArray.splice(i); // https://stackoverflow.com/a/47441371

                    const trainDataSplit = trainData?.value.split(" ");
                    const number = trainDataSplit[0];
                    const name = trainDataSplit.slice(1, -2).join(" ");
                    const arrivedTimeSplit =
                        arrivedTimeArr[i]?.value.split(":");
                    const lateTimeSplit = lateTimeArr[i]?.value.split(":");

                    const typeValue = trainTypeArr[i]?.value
                        .trim()
                        .toLocaleUpperCase();
                    let type;
                    switch (typeValue) {
                        case "EXP":
                            type = "Express";
                            break;
                        case "SUP":
                            type = "Superfast";
                            break;
                        case "ORD":
                            type = "Passenger";
                            break;
                        case "RAJ":
                            type = "Rajdhani";
                            break;
                        case "SHAT":
                            type = "Shatabdi";
                            break;
                        case "ROR":
                            type = "Goods";
                            break;
                        default:
                            type = typeValue;
                    }
                    return {
                        ...trains,
                        [number]: {
                            name,
                            status: statusArr[i]?.value.toLocaleLowerCase(),
                            station: toTitleCase(closedSationArr[i]?.value),
                            statusTime: {
                                hours: arrivedTimeSplit[0],
                                minutes: arrivedTimeSplit[1],
                            },
                            delayedTime: {
                                hours: lateTimeSplit[0],
                                minutes: lateTimeSplit[1],
                            },
                            type,
                            direction: trainDirectionArr[i]?.value
                                .trim()
                                .toLocaleLowerCase(),
                        },
                    };
                }, {});

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

        await page.goto(env.UPSTREAM_URL);

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
            const stationTypeArrLen = stationTypeArr.length;

            const stationStateArr = document.querySelectorAll(
                'input[type="hidden"][name^="stationState"]'
            );
            const stationStateArrLen = stationStateArr.length;

            const stationDescriptionArr = document.querySelectorAll(
                'input[type="hidden"][name^="stationDescription"]'
            );
            const stationDescriptionArrLen = stationDescriptionArr.length;

            const distanceArr = document.querySelectorAll(
                'input[type="hidden"][name^="distance"]'
            );
            const distanceArrLen = distanceArr.length;

            if (stations)
                stations = Object.keys(stations)
                    .slice(0)
                    .reduce((stationsObj, stName, i, inputArray) => {
                        // break if num(hidden inputs) < num(select options)
                        if (
                            i === stationTypeArrLen ||
                            i === stationStateArrLen ||
                            i === stationDescriptionArrLen ||
                            i === distanceArrLen
                        )
                            inputArray.splice(i); // https://stackoverflow.com/a/47441371

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
    fetchTrains,
    fetchStations,
};
