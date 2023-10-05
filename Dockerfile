FROM node:alpine as base

#############################################
# https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#running-on-alpine
# Installs latest Chromium (100) package.
RUN apk add --no-cache chromium

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# # Puppeteer v13.5.0 works with Chromium 100.
# RUN yarn add puppeteer@13.5.0

#############################################

WORKDIR /app

COPY package.json package-lock.json ./

RUN rm -rf node_modules && npm install --frozen-lockfile && npm cache clean --force

COPY . .

CMD ["node", "./app.js"]
