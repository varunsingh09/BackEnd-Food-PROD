#!/bin/bash
screen
if [ "$1" = "client" ]
then
    cd ./FRONT-END-PROD
    npm start
fi

if [ "$1" = "server" ]
then
    cd ./BackEnd-Food-PROD
nodemon
fi