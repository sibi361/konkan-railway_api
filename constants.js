const env = {
    DEBUG: true,
    PORT: 3000,
    UPSTREAM_REFRESH_INTERVAL: 300,
    UPSTREAM_URL: "https://konkanrailway.com/VisualTrain/",
    REPO_URL: "https://github.com/sibi361/konkan-railway_api",
    API_VERSION: 1,
    PUPPETEER_OPTS: { headless: "false" },
    SERVER_ERROR_MESSAGE: "Server overloaded. Please wait.",
};

module.exports = env;
