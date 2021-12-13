#!/bin/bash
set -ex

sed -i '' -e '/"homepage": "http:\/\/krizanka.github.io\//'"s/\",\$/${GITHUB_SHA}\\/\",/" package.json
