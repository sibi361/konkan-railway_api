# konkan-railway_api

This API scrapes the [Konkan Railway Current Train Position](https://konkanrailway.com/VisualTrain/) website, converts the essential data into JSON and uses it to serve the various endpoints.


## Usage

### Docker Compose

- Clone this repository
    ```
    git clone https://github.com/sibi361/konkan-railway_api.git
    ```
- Run the server
    ```
    docker compose up --build
    ```

Docker Compose might not be viable for hosting on a cloud service such as MS Azure due to the requirement of `chrome.json`. In that case follow the Docker Container Method to deploy this API as a web app to Azure App Service.

### Docker

- Build a docker image
    ```
    docker build . -t img_konkan-railway_api_v2
    ```
    Note: Build it off the "azure" branch if not running locally
- Create and run a container from the above image
    ```
    docker run -p 3000:3000 img_konkan-railway_api_v2
    ```

### NodeJS

- Clone this repository
    ```
    git clone https://github.com/sibi361/konkan-railway_api.git
    ```
- Install [NodeJS](https://nodejs.org/en/download)
- Install dependencies
    ```
    cd konkan-railway_api
    npm install
    ```
- Run the server
    ```
    npm run start
    ```

Parameters such as the API listening port can be configured in ```.env``` for Docker Compose and ```constants.js``` for NodeJS.

## Available Endpoints

All endpoints return JSON and serve at http://localhost:3000/api/v1/ by default.

- `/api/v1/fetchData/`
    Returns details about all the trains and stations on the Konkan Railway route

    Appending `?latest` to the URL will trigger a manual update from the upstream

- `/api/v1/fetchTrain/<TRAIN-NUMBER>`
    Returns an object containing information about the train such as
        - most recently arrived station
        - arrival time
        - delay time

    Appending `?latest` to the URL will trigger a manual update from the upstream

- `/api/v1/fetchStations/`
    Returns names of all the stations on the Konkan Railway route


## TODO

- [ ] Implement rate limiting
- [ ] Utilize `VisualTrain` upstream to get more info such as train type
- [ ] Send PR to [public-api-lists](https://github.com/public-api-lists/public-api-lists)
- [ ] Build Frontend


## Motivation

Due to poor network connectivity near most railway stations and during transit, the Current Train Position site with a size of ~250KB would take a long time to load.

When deployed on a cloud server, this API can instantly fetch the upstream site and send the required information to the client, consuming well under 1KB, hence leaving no chance for lag.

![postman_api_test_screenshot](./images/postman_screenshot.png)

~550 Bytes versus ~120KB, that too without the assets

![official_website_screenshot](./images/official_website_screnshot.png)

## Legal

This project is in no way affiliated or related to any railway or other company/organization, for e.g. Indian Railways. It is a completely independent and not-for-profit API built for educational purposes only.
