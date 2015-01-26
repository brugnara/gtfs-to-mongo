# LoL

## Who Am I?

Daniele Brugnara, from Scurelle

## Why?

Just for fun and future needs.

## What you need

Go to `dati.trentino.it` and download `gtfs` files and unzip into that folders `urbano` and `extraurbano` zips,
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

npm run
```