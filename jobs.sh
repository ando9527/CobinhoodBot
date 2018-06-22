#!/bin/sh
REPOSITORY=$(sed -nE 's/^\s*"name": "(.*?)",$/\1/p' package.json)
REGISTRY=docker.kumay.net
IMAGE="$REGISTRY/$REPOSITORY:latest"
BUILDCMD="sudo docker build -t $IMAGE ."
PUSHCMD="sudo docker push $IMAGE"
PULLCMD="docker pull $IMAGE"

echo "Image: $IMAGE"

if [ "$1" = "build" ] 
  then
  eval $BUILDCMD
fi

if [ "$1" = "push" ] 
  then
  eval $PUSHCMD
fi

if [ "$1" = "all" ] 
  then
  eval $BUILDCMD
  eval $PUSHCMD
fi


if [ "$1" = "pull" ] 
  then
  eval $PULLCMD
fi

if [ "$1" = "replace" ] 
  then
  sed -i -e "s/REPOSITORY/$REPOSITORY/g" ./docker-compose.yaml
fi



