# LoL

## Who Am I?

Daniele Brugnara, from Scurelle

## Why?

Just for fun and future needs.

## What you need

### A working mongo server

### GTFS data

You can use GTFS data you want. This project is built for our local public transport. Feel free to fork and reuse!

Go to `http://www.ttesercizio.it/TTEOpenData/` and download `gtfs` files for `trentino trasporti` and unzip into that folders `urbano` and `extraurbano` zips,
getting as a result, something like:

```
- gtfs
|- googletransitextraurbano
|-- agency.txt
|-- routes.txt
|-- ....
|- googletransiturbano
|-- agency.txt
|-- ....
```

## Config

Check `config/settings.json` for mongo connection url.

## RUN

```bash
# only first time:
# npm install

npm start
```

## Queries

### Retrieves all stops within 500 meters from the given point (lon, lat)

Change query for more

```
db.stops.aggregate([
  {
    $geoNear: {
      near: {
        type: "Point",
        coordinates: [ 11.541747, 46.285513 ]
      },
      distanceField: "dist.calculated",
      maxDistance: 500,
      query: { },
      includeLocs: "dist.location",
      limit: 10,
      spherical: true
    }
  }
])
```