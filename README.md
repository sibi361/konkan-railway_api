# konkan-railway_api

This API scrapes the [Konkan Railway Current Train Position](https://konkanrailway.com/VisualTrain/) website, converts the essential data into JSON and uses it to serve the various endpoints.


## Usage

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
- Configure options in ```constants.js``` if needed
- Run the server
    ```
    npm run start
    ```
    It will then be available by default at http://localhost:7000/api/v1/


## Available Endpoints

All endpoints return JSON.

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
