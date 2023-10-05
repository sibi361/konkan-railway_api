const env = {
    DEBUG: true,
    PORT: 3000,
    UPSTREAM_REFRESH_INTERVAL: 300,
    UPSTREAM_TRAINS_URL:
        "https://konkanrailway.com/VisualTrain/otrktp0100Table.jsp",
    UPSTREAM_STATIONS_URL: "https://konkanrailway.com/VisualTrain/",
    REPO_URL: "https://github.com/sibi361/konkan-railway_api",
    API_VERSION: 1,
    PUPPETEER_OPTS: { headless: "false" },
};

module.exports = env;
