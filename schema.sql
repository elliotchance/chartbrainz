-- https://github.com/metabrainz/musicbrainz-server/blob/master/admin/sql/CreateTables.sql

CREATE TABLE tag ( -- replicate (verbose)
    id                  SERIAL,
    name                VARCHAR(255) NOT NULL,
    ref_count           INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);

CREATE TABLE release_group_meta ( -- replicate
    id                  INTEGER NOT NULL, -- PK, references release_group.id CASCADE
    release_count       INTEGER NOT NULL DEFAULT 0,
    first_release_date_year   SMALLINT,
    first_release_date_month  SMALLINT,
    first_release_date_day    SMALLINT,
    rating              SMALLINT,
    rating_count        INTEGER,
    PRIMARY KEY (id)
);

CREATE TABLE release_group_tag ( -- replicate (verbose)
    release_group       INTEGER NOT NULL, -- PK, references release_group.id
    tag                 INTEGER NOT NULL, -- PK, references tag.id
    count               INTEGER NOT NULL,
    last_updated        TIMESTAMP,
    PRIMARY KEY (release_group, tag)
);

CREATE INDEX release_group_tag_idx_tag ON release_group_tag (tag);

CREATE TABLE release_group ( -- replicate (verbose)
    id                  SERIAL,
    gid                 UUID NOT NULL,
    name                VARCHAR NOT NULL,
    artist_credit       INTEGER NOT NULL, -- references artist_credit.id
    type                INTEGER, -- references release_group_primary_type.id
    comment             VARCHAR(255) NOT NULL DEFAULT '',
    edits_pending       INTEGER NOT NULL DEFAULT 0,
    last_updated        TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE artist ( -- replicate (verbose)
    id                  SERIAL,
    gid                 UUID NOT NULL,
    name                VARCHAR NOT NULL,
    sort_name           VARCHAR NOT NULL,
    begin_date_year     SMALLINT,
    begin_date_month    SMALLINT,
    begin_date_day      SMALLINT,
    end_date_year       SMALLINT,
    end_date_month      SMALLINT,
    end_date_day        SMALLINT,
    type                INTEGER, -- references artist_type.id
    area                INTEGER, -- references area.id
    gender              INTEGER, -- references gender.id
    comment             VARCHAR(255) NOT NULL DEFAULT '',
    edits_pending       INTEGER NOT NULL DEFAULT 0,
    last_updated        TIMESTAMP,
    ended               BOOLEAN NOT NULL DEFAULT FALSE,
    begin_area          INTEGER, -- references area.id
    end_area            INTEGER, -- references area.id
    PRIMARY KEY (id)
);

CREATE TABLE artist_credit ( -- replicate
    id                  SERIAL,
    name                VARCHAR NOT NULL,
    artist_count        SMALLINT NOT NULL,
    ref_count           INTEGER DEFAULT 0,
    created             TIMESTAMP,
    edits_pending       INTEGER NOT NULL DEFAULT 0,
    gid                 UUID NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE genre ( -- replicate (verbose)
    id                  SERIAL, -- PK
    gid                 UUID NOT NULL,
    name                VARCHAR NOT NULL,
    comment             VARCHAR(255) NOT NULL DEFAULT '',
    edits_pending       INTEGER NOT NULL DEFAULT 0,
    last_updated        TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE link ( -- replicate
    id                  SERIAL,
    link_type           INTEGER NOT NULL, -- references link_type.id
    begin_date_year     SMALLINT,
    begin_date_month    SMALLINT,
    begin_date_day      SMALLINT,
    end_date_year       SMALLINT,
    end_date_month      SMALLINT,
    end_date_day        SMALLINT,
    attribute_count     INTEGER NOT NULL DEFAULT 0,
    created             TIMESTAMP,
    ended               BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (id)
);

CREATE INDEX link_idx_type ON link (link_type);

CREATE TABLE l_genre_genre ( -- replicate
    id                  SERIAL,
    link                INTEGER NOT NULL, -- references link.id
    entity0             INTEGER NOT NULL, -- references genre.id
    entity1             INTEGER NOT NULL, -- references genre.id
    edits_pending       INTEGER NOT NULL DEFAULT 0,
    last_updated        TIMESTAMP,
    link_order          INTEGER NOT NULL DEFAULT 0,
    entity0_credit      TEXT NOT NULL DEFAULT '',
    entity1_credit      TEXT NOT NULL DEFAULT ''
);

-- https://github.com/metabrainz/musicbrainz-server/blob/master/admin/sql/caa/CreateTables.sql

CREATE TABLE cover_art ( -- replicate (verbose)
    id BIGINT NOT NULL, -- PK
    release INTEGER NOT NULL, -- references musicbrainz.release.id CASCADE
    comment TEXT NOT NULL DEFAULT '',
    edit INTEGER NOT NULL, -- separately references musicbrainz.edit.id
    ordering INTEGER NOT NULL CHECK (ordering > 0),
    date_uploaded TIMESTAMP NOT NULL,
    edits_pending INTEGER NOT NULL DEFAULT 0 CHECK (edits_pending >= 0),
    mime_type TEXT NOT NULL, -- references cover_art_archive.image_type.mime_type
    filesize INTEGER,
    thumb_250_filesize INTEGER,
    thumb_500_filesize INTEGER,
    thumb_1200_filesize INTEGER,
    PRIMARY KEY (id)
);

CREATE INDEX cover_art_idx_release ON cover_art (release);

CREATE TABLE exclude_release_groups (
    gid UUID NOT NULL,
    PRIMARY KEY (gid)
);

INSERT INTO exclude_release_groups VALUES
-- Carlo Zerulo Dj
('16283bab-ed55-4ee0-8f6e-57b071c2d80c'),
('edb0019f-4a9b-418a-90e4-7412075d2b51'),
-- SB19
('9bdcd649-cfce-4aeb-a537-d6e3bad13486'),
('28766261-cd2d-4f6d-905a-185bf40c96b1'),
('fac9772d-a91d-41d7-9c03-c21807cef04d');

CREATE TABLE genre_parents (
    parent_genre VARCHAR NOT NULL,
    child_genre VARCHAR NOT NULL,
    file_name VARCHAR,
    PRIMARY KEY (parent_genre, child_genre)
);

-- Start with the known "subgenre" relationships.
INSERT INTO genre_parents (parent_genre, child_genre)
SELECT parent_genre.name, child_genre.name
FROM l_genre_genre
JOIN genre AS parent_genre ON (entity0 = parent_genre.id)
JOIN genre AS child_genre ON (entity1 = child_genre.id)
WHERE link = 944810;

-- Many genres do not have parents, but do have "fusion" relationships. We can
-- make these all parent relationships (only if an explicit parent is not
-- provided).
INSERT INTO genre_parents (parent_genre, child_genre)
SELECT child_genre.name, parent_genre.name
FROM l_genre_genre
JOIN genre AS parent_genre ON (entity0 = parent_genre.id)
JOIN genre AS child_genre ON (entity1 = child_genre.id)
WHERE link = 944812
  AND parent_genre.name NOT IN (SELECT child_genre FROM genre_parents);

-- Of those still remaining, some genres have an "influenced by" which may be a
-- little vague, but it's better than nothing.
INSERT INTO genre_parents (parent_genre, child_genre)
SELECT child_genre.name, parent_genre.name
FROM l_genre_genre
JOIN genre AS parent_genre ON (entity0 = parent_genre.id)
JOIN genre AS child_genre ON (entity1 = child_genre.id)
WHERE link = 944813
  AND parent_genre.name NOT IN (SELECT parent_genre FROM genre_parents)
  AND parent_genre.name NOT IN (SELECT child_genre FROM genre_parents);

-- Of those STILL remaining, we don't have any relationship, so we throw them
-- into a new special root called "other".
INSERT INTO genre_parents (parent_genre, child_genre)
SELECT 'other', name
FROM genre
WHERE name NOT IN (SELECT parent_genre FROM genre_parents)
  AND name NOT IN (SELECT child_genre FROM genre_parents);

-- Finally, not all genres that appear to be root genres should be root genres.
-- For example, "arabesk" is a type of Turkish music that has influence on other
-- genres, but it doesn't have a parent. These will be fixed over time in
-- MusicBrainz, but for now we need to move these into the "other" category.
INSERT INTO genre_parents (parent_genre, child_genre) VALUES
('other', 'arabesk'),
('other', 'arrocha'),
('other', 'ballad'),
('other', 'benga'),
('other', 'bolero'),
('other', 'brega'),
('other', 'bélé'),
('other', 'cadence rampa'),
('other', 'calypso'),
('other', 'candombe'),
('other', 'cantoria'),
('other', 'canzone napoletana'),
('other', 'carimbó'),
('other', 'chamarrita açoriana'),
('other', 'chanson française'),
('other', 'chinese opera'),
('other', 'choro'),
('other', 'chutney'),
('other', 'coco'),
('other', 'conga'),
('other', 'cumbia'),
('other', 'cuplé'),
('other', 'dangdut'),
('other', 'dark ambient'),
('other', 'dark wave'),
('other', 'fado'),
('other', 'fandango'),
('other', 'flamenco'),
('other', 'forró'),
('other', 'free improvisation'),
('other', 'frevo'),
('other', 'funk carioca'),
('other', 'gamelan'),
('other', 'habanera'),
('other', 'haitian vodou drumming'),
('other', 'highlife'),
('other', 'hindustani classical'),
('other', 'joropo'),
('other', 'jácara'),
('other', 'kizomba'),
('other', 'laiko'),
('other', 'latin'),
('other', 'lundu'),
('other', 'maracatu'),
('other', 'marching band'),
('other', 'medieval'),
('other', 'meiji shinkyoku'),
('other', 'merengue'),
('other', 'mor lam'),
('other', 'morna'),
('other', 'méringue'),
('other', 'ngoma'),
('other', 'pasodoble'),
('other', 'plainchant'),
('other', 'poetry'),
('other', 'polka'),
('other', 'punto'),
('other', 'ragtime'),
('other', 'raï'),
('other', 'reggaeton'),
('other', 'regional mexicano'),
('other', 'rumba cubana'),
('other', 'runo song'),
('other', 'salsa'),
('other', 'samba'),
('other', 'sertanejo'),
('other', 'shaabi'),
('other', 'soca'),
('other', 'son cubano'),
('other', 'soukous'),
('other', 'séga'),
('other', 'sōkyoku'),
('other', 'tamborito'),
('other', 'tango'),
('other', 'tembang cianjuran'),
('other', 'trot'),
('other', 'trova'),
('other', 'waltz'),
('other', 'zamacueca'),
('other', 'zouk'),
('other', 'zydeco'),
('other', 'éntekhno');

UPDATE genre_parents SET file_name = replace(parent_genre, ' ', '-');
