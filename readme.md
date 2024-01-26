
# Telegram capture bot

## Installation
`yarn install`

### Fill in .env
DB values, telegram token, port and webhook URL

## Run server
`node index.js`

## Migration
Migration (table schema) under `./migration`

## Features:
- Hong Kong Observatory (HKO) data
  - local forecast
  - radar image
  - weather photo
  - weather graph
  - weather warning
- Kowloon Motor Bus (KMB) BBI
- (HK Gov) Transport Department (TD) camera
- pending:
  - HKO radar animation, to move to queue
