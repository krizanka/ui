#!/bin/bash
set -ex
pwd
echo "$PATH"
ls -l
ls -C /bin
ls -C /usr/bin
sed -i '' -e '/"homepage": "http:\/\/krizanka.github.io\//'"s/\",\$/${GITHUB_SHA}\\/\",/" package.json
