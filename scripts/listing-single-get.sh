#!/usr/bin/env bash
# Fetch a single listing from the public Elasticsearch index and
# pretty-print it. Useful for seeing the full set of fields available
# on a listing document without grepping through code.

curl -s -X POST 'https://tools.closehack.com/search/listings/_search' \
  -H 'Content-Type: application/json' \
  -d '{
    "size": 1,
    "query": {
      "bool": {
        "must": [
          {"exists": {"field": "gps_lat"}},
          {"exists": {"field": "media_photo_url"}},
          {"range":  {"beds": {"gte": 3}}}
        ]
      }
    }
  }' | python3 -m json.tool
