dump:
	mkdir -p dump

dump/LATEST: dump
	curl http://ftp.musicbrainz.org/pub/musicbrainz/data/fullexport/LATEST --output dump/LATEST

dump/mbdump.tar.bz2: dump/LATEST
	curl http://ftp.musicbrainz.org/pub/musicbrainz/data/fullexport/$(shell cat dump/LATEST)/mbdump.tar.bz2 --output dump/mbdump.tar.bz2

dump/mbdump-derived.tar.bz2: dump/LATEST
	curl http://ftp.musicbrainz.org/pub/musicbrainz/data/fullexport/$(shell cat dump/LATEST)/mbdump-derived.tar.bz2 --output dump/mbdump-derived.tar.bz2

dump/mbdump-cover-art-archive.tar.bz2: dump/LATEST
	curl http://ftp.musicbrainz.org/pub/musicbrainz/data/fullexport/$(shell cat dump/LATEST)/mbdump-cover-art-archive.tar.bz2 --output dump/mbdump-cover-art-archive.tar.bz2

dump/mbdump: dump/mbdump.tar.bz2
	mkdir -p dump/mbdump
	tar -xvzf dump/mbdump.tar.bz2 -C dump/mbdump \
		mbdump/artist \
		mbdump/genre \
		mbdump/artist_credit \
		mbdump/release_group \
		mbdump/l_genre_genre

dump/mbdump-derived: dump/mbdump-derived.tar.bz2
	mkdir -p dump/mbdump-derived
	tar -xvzf dump/mbdump-derived.tar.bz2 -C dump/mbdump-derived \
		mbdump/release_group_meta \
		mbdump/release_group_tag \
		mbdump/tag

dump/mbdump-cover-art-archive: dump/mbdump-cover-art-archive.tar.bz2
	mkdir -p dump/mbdump-cover-art-archive
	tar -xvzf dump/mbdump-cover-art-archive.tar.bz2 -C dump/mbdump-cover-art-archive

db.sqlite3: dump/mbdump dump/mbdump-derived
	sqlite3 db.sqlite3 < schema.sql
	sqlite3 -batch db.sqlite3 '.mode ascii' '.separator "\t" "\n"' '.import dump/mbdump/mbdump/artist artist'
	sqlite3 -batch db.sqlite3 '.mode ascii' '.separator "\t" "\n"' '.import dump/mbdump/mbdump/genre genre'
	sqlite3 -batch db.sqlite3 '.mode ascii' '.separator "\t" "\n"' '.import dump/mbdump/mbdump/artist_credit artist_credit'
	sqlite3 -batch db.sqlite3 '.mode ascii' '.separator "\t" "\n"' '.import dump/mbdump/mbdump/release_group release_group'
	sqlite3 -batch db.sqlite3 '.mode ascii' '.separator "\t" "\n"' '.import dump/mbdump/mbdump/l_genre_genre l_genre_genre'
	sqlite3 -batch db.sqlite3 '.mode ascii' '.separator "\t" "\n"' '.import dump/mbdump-derived/mbdump/release_group_meta release_group_meta'
	sqlite3 -batch db.sqlite3 '.mode ascii' '.separator "\t" "\n"' '.import dump/mbdump-derived/mbdump/release_group_tag release_group_tag'
	sqlite3 -batch db.sqlite3 '.mode ascii' '.separator "\t" "\n"' '.import dump/mbdump-derived/mbdump/tag tag'
	sqlite3 db.sqlite3 "UPDATE release_group_meta SET rating = NULL WHERE rating = '\N';"
	sqlite3 db.sqlite3 "UPDATE release_group_meta SET first_release_date_year = NULL WHERE first_release_date_year = '\N';"
	sqlite3 db.sqlite3 "UPDATE release_group_meta SET first_release_date_month = NULL WHERE first_release_date_month = '\N';"
	sqlite3 db.sqlite3 "UPDATE release_group_meta SET first_release_date_day = NULL WHERE first_release_date_day = '\N';"

static/data:
	mkdir -p static/data

static/data/genre: static/data
	mkdir -p static/data/genre

static/data/genres.json: static/data
	sqlite3 db.sqlite3 '.mode json' '.once $@' "\
SELECT parent_genre, child_genre \
FROM genre_parents \
ORDER BY parent_genre, child_genre"

static/data/genre/%.json: static/data/genre
	sqlite3 db.sqlite3 '.mode json' '.once $@' "\
SELECT \
    artist_credit.name as artist, \
    release_group.gid as release_group_gid, \
    release_group.name as release_group, \
    first_release_date_year as release_year, \
    first_release_date_month as release_month, \
    first_release_date_day as release_day, \
    rating, \
    rating_count, \
    group_concat(count || ' ' || genre.name, ';') as genres, \
    group_concat(count || ' ' || tag.name, ';') FILTER (WHERE genre.id IS NULL) as tags \
FROM release_group_meta \
JOIN release_group ON (release_group.id = release_group_meta.id) \
LEFT JOIN release_group_tag ON (release_group_meta.id = release_group_tag.release_group) \
JOIN tag ON (tag.id = release_group_tag.tag) \
LEFT JOIN genre ON (genre.name = tag.name) \
JOIN artist_credit ON (artist_credit.id = release_group.artist_credit) \
WHERE rating IS NOT NULL AND rating_count >= 3 AND count > 0 AND genre.name IN ( \
    WITH RECURSIVE genres(name) AS ( \
        SELECT DISTINCT parent_genre \
        FROM genre_parents \
        WHERE file_name = '$*' \
        UNION \
        SELECT child_genre \
        FROM genre_parents, genres \
        WHERE parent_genre = genres.name \
    ) \
    SELECT * \
    FROM genres \
) AND release_group.gid NOT IN (SELECT * FROM exclude_release_groups) \
GROUP BY 1, 2, 3, 4, 5, 6, 7, 8 \
ORDER BY rating DESC, rating_count DESC, count DESC \
LIMIT 250;"

static/data/top.json:
	sqlite3 db.sqlite3 '.mode json' '.once $@' "\
SELECT \
    artist_credit.name as artist, \
    release_group.gid as release_group_gid, \
    release_group.name as release_group, \
    first_release_date_year as release_year, \
    first_release_date_month as release_month, \
    first_release_date_day as release_day, \
    rating, \
    rating_count, \
    group_concat(count || ' ' || genre.name, ';') as genres, \
    group_concat(count || ' ' || tag.name, ';') FILTER (WHERE genre.id IS NULL) as tags \
FROM release_group_meta \
JOIN release_group ON (release_group.id = release_group_meta.id) \
LEFT JOIN release_group_tag ON (release_group_meta.id = release_group_tag.release_group) \
JOIN tag ON (tag.id = release_group_tag.tag) \
LEFT JOIN genre ON (genre.name = tag.name) \
JOIN artist_credit ON (artist_credit.id = release_group.artist_credit) \
WHERE rating IS NOT NULL AND rating_count >= 24 AND count > 0 \
	AND release_group.gid NOT IN (SELECT * FROM exclude_release_groups) \
GROUP BY 1, 2, 3, 4, 5, 6, 7, 8 \
ORDER BY rating DESC, rating_count DESC, count DESC \
LIMIT 250;"

.PHONY: clean
clean:
	rm -rf db.sqlite3

.PHONY: all-data
all-data: static/data static/data/genres.json static/data/top.json
	sqlite3 db.sqlite3 '\
SELECT replace(name, " ", "-") \
FROM genre \
ORDER BY name;' | while read -r genre ; do \
		make "static/data/genre/$$genre.json" ; \
	done

.PHONY: deploy-dev
deploy-dev:
	./node_modules/.bin/vue-tsc
	./node_modules/.bin/vite build --mode dev
	sls deploy --stage dev

.PHONY: deploy-prod
deploy-prod:
	./node_modules/.bin/vue-tsc
	./node_modules/.bin/vite build --mode prod
	sls deploy --stage prod

config/local.json:
	cp config/sample.json config/local.json

backend: config/local.json
	serverless offline -s local --noPrependStageInUrl

frontend:
	npm run dev
