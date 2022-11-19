ChartBrainz
===========

The unofficial way to view charts and manage your ratings on MusicBrainz.

https://chartbrainz.com

Development
-----------

### Local development

```bash
serverless offline start
```

## Download Latest Dump

```sh
rm -rf dump db.sqlite3
make db.sqlite3
```

## Regenerate Data Files

```sh
rm -rf data
make all-data
```

## Deploy

Development (https://dev.chartbrainz.com)

```sh
sls deploy --stage dev
```

Production (https://chartbrainz.com)

```sh
sls deploy --stage prod
```
