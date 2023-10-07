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

Docker Compose might not be viable for hosting on a cloud service such as MS Azure due to the requirement of `chrome.json`. In that you may follow the Docker Method instead.

### Docker

- Switch to the ```azure``` branch
    ```
    git checkout azure
    ```
- Build a docker image
    ```
    docker build . -t img_konkan-railway_api_v2
    ```
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

All endpoints return JSON and serve at http://localhost:3000/api/v2/ by default.

- `/api/v2/fetchTrains/`
    Returns live status about all the trains currently moving on the Konkan Railway

    Appending `?latest` to the URL will trigger a manual update from the upstream

- `/api/v2/fetchTrain/<TRAIN-NUMBER>`
    Returns an object containing information about the queried train such as
        - most recently touched station
        - arrived/departed time from that station
        - delay time i.e. whether the train is late or not

    Appending `?latest` to the URL will trigger a manual update from the upstream

- `/api/v2/fetchStations/`
    Returns an object containing all the stations on the Konkan Railway route

- `/api/v2/fetchStation/<STATION-PLACE-NAME>`
     Returns an object containing information about the queried station such as
        - type i.e. big station or small station
        - state
        - description

## TODO

- [ ] Implement rate limiting
- [x] Utilize `VisualTrain` upstream to get more info such as train type
- [ ] Send PR to [public-api-lists](https://github.com/public-api-lists/public-api-lists) after hosting on a stable cloud as azure keeps suspending this API since it's currently running on free tier


## Motivation

Due to poor network connectivity near most railway stations and during transit, the Current Train Position site with a size of ~250KB would take a long time to load.

When deployed on a cloud server, this API can instantly fetch the upstream site and send the required information to the client, consuming well under 1KB, hence leaving no chance for lag.

![postman_api_test_screenshot](./images/postman_screenshot.png)

~550 Bytes versus ~120KB, that too without the assets

![official_website_screenshot](./images/official_website_screnshot.png)

## Legal

This project is in no way affiliated or related to any railway or other company/organization, for e.g. Indian Railways. It is a completely independent and not-for-profit API built for educational purposes only.
