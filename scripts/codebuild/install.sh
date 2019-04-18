#!/bin/bash
echo "[Install phase] `date` in `pwd`"

cd passthrough
npm install --only=prod
rm -rf node_modules/load-config
cp -rp ../local_modules/load-config node_modules/