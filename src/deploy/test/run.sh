#!/bin/bash
# T42 engine SQL check — needs a local PostgreSQL (psql on PATH, a server
# you can create databases on). Not part of the app build.
#
#   PGHOST=/tmp PGPORT=5432 PGUSER=postgres bash src/deploy/test/run.sh
#
# 1. Builds the schema as it was BEFORE the challenge engine (from git), the
#    way the live database is, then runs the changed files on top — the
#    upgrade path, not a fresh install.
# 2. Runs t42-engine.sql (entitlement, gated plan, guards, v2 score, access
#    ending) and diffs its output against expected.out.
set -e
cd "$(dirname "$0")"
BASE=${T42_BASE:-c16727f}          # the commit before the engine
P="psql -v ON_ERROR_STOP=1 -q"
DB=t42_engine_check
$P -c "drop database if exists $DB" -c "create database $DB" >/dev/null
$P -d $DB -f stub.sql >/dev/null
for f in 01-plus-tables 10-club-tables 11-club-checkin 20-t42-core 21-t42-seed 22-t42-plan \
         23-t42-storage 24-t42-scoring 25-t42-finalise 26-t42-gym; do
  git show "$BASE:src/deploy/$f.sql" | $P -d $DB >/dev/null 2>&1 || { echo "old $f failed"; exit 1; }
done
for f in 20-t42-core 21-t42-seed 24-t42-scoring 25-t42-finalise 26-t42-gym; do
  $P -d $DB -f ../$f.sql 2>&1 | grep -v NOTICE | grep . && { echo "upgrade $f failed"; exit 1; }
done
echo "upgrade path OK"
psql -q -d $DB -f t42-engine.sql 2>&1 | grep -v '^$' | grep -v CONTEXT | sed 's/^psql:[^:]*:[0-9]*: //' > actual.out
if diff -u expected.out actual.out; then echo "t42 engine checks OK"; rm -f actual.out; else echo "t42 engine checks FAILED (see diff)"; exit 1; fi
