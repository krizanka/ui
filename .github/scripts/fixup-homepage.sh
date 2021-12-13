#!/bin/bash
set -ex
pwd
ls -l
sed -i '' -e '/"homepage": "http:\/\/krizanka.github.io\//'"s/\",\$/${GITHUB_SHA}\\/\",/" package.json
