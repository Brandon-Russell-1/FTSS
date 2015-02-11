#!/bin/bash

rm -rf _public
node_modules/.bin/brunch build -P

cd _public

mkdir failover
mkdir aws

cd js

echo Building live-libs
cp vendor.js ../failover/live-libs.js
cat vendor.js | gzip -9cv > ../aws/live-libs.js

echo Building live-apps
cat partials.js app.js > ../failover/live-apps.js
gzip -9cv ../failover/live-apps.js > ../aws/live-app.js

cd ../css

echo Builidng live-css
cp app.css ../failover/live.css
gzip -9cv app.css > ../aws/live.css

