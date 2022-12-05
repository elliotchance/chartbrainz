ChartBrainz
===========

The unofficial way to view charts and manage your ratings on MusicBrainz.

https://chartbrainz.com

Features
--------

1. **View up to 250 releases for each genre.** Since there isn't much ratings
data, the threshold to be included in the chart is very low, only 3 ratings.
2. **Genre charts are hierarchical.** So when looking at rock, you see all the
genres and subgenera included.
3. **Login to MusicBrainz to sync your ratings.** You see your ratings overlayed
on the charts.
4. **Submit ratings.** On any chart item with half-star accuracy.

Development
-----------

## Local development

Install/update any required packages:

```sh
npm install
```

Create the environment variables (you may need to update this config file
depending on which features you need):

```bash
make config/dev.json
```

You will need to run the backend and frontend separately:

```bash
make backend
```

```bash
make frontend
```

## Download Latest Dump

```sh
rm -rf dump db.sqlite3
make db.sqlite3
```

## Regenerate Data Files

```sh
rm -rf backend/static/data
make all-data
```

## Deploy

Development (https://dev.chartbrainz.com)

```sh
make deploy-dev
```

Production (https://chartbrainz.com)

```sh
make deploy-prod
```
