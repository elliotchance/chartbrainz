ChartBrainz
===========

The unofficial way to view charts from MusicBrainz.

Development
-----------

## Running Locally

If you try to open `index.html` directly your browser will block the data files,
so they have have to be server through a static web server. Fortunately, there
is one build into python:

```sh
python3 -m http.server
```

Now open http://localhost:8000

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

## Publish Latest Version

```sh
make deploy
```
