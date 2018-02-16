#!/bin/bash

(cd swindler && carthage update --platform mac)
(cd pyocr && ./build.sh)

cd orbit
carthage update --platform mac
xcodebuild -configuration Release -derivedDataPath $(mktemp -d) -scheme orbit
touch ../apps/desktop/src/index.js