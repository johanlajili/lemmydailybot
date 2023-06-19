# Lemmy Daily Bot

A nodeJS / Docker based lemmy bot that does a "daily thread" every day, with the ability to change the title and content based on the day of the week.

It also pins the thread in question and removes the pin the following day.

It is currently used by @france@lemmy.world

## How to run directly in NodeJS

First you'll want to clone the repo and run npm install on it. Then you'll need to create a .env file with the following variables:

```
LEMMY_URL=https://lemmy.world
LEMMY_USERNAME=your_bot_username
LEMMY_PASSWORD=your_bot_password
```
    
Then you can run the bot with `npm run start`

Note that the bot is configured using a cron job in node, so will only make a post once a day at 6am Paris time. If you want to test it locally, you can call the function "runBot()" at the end of index.ts

Be sure to update the daily_post.json with the correct title and content for the day of the week you are testing and your community ID.

## How to find my community ID
An easy way is to look at the websocket communication on your debugger for the lemmy instance, write a post, and look at the message in websocket, that will contain the community ID.

## How to run in Docker
You can run it in docker from dockerhub with the following command

docker pull iraldir/lemmy_daily_bot
docker run -d -e LEMMY_INSTANCE_URL='youlemmyurl' -e LEMMY_USERNAME='yourbotusername' -e LEMMY_PASSWORD='yourbotpassword' iraldir/lemmy_daily_bot

## How to build the docker image
You can build the docker image locally with the following command instead if you want to make changes to the code:

```
docker build -t lemmy_daily_bot .
```