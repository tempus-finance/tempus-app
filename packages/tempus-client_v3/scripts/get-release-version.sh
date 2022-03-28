#!/bin/sh

RELEASE_FILE="./src/release.json"

if [ ! -z "$1" ]
then
  BRANCH_NAME=`git branch --show-current`
  APP_VERSION=$BRANCH_NAME
else
  BRANCH_NAME=`git branch --show-current`
  COMMIT_HASH=`git log --pretty=format:'%h' -n 1`
  TIMESTAMP=`date '+%Y%m%d-%H:%M:%S'`
  APP_VERSION="$BRANCH_NAME-$COMMIT_HASH-$TIMESTAMP"
fi

echo "Current version: $APP_VERSION"
printf '{ "releaseVersion": "%s" }' $APP_VERSION > $RELEASE_FILE
echo "Release version stored in $RELEASE_FILE"
