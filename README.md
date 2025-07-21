## Introduction

Coup is a project developed for study purposes, where I apply various programming concepts and explore new tools and technologies. Feel free to contribute with ideas, code, or suggest changes. All collaboration is welcome!

### About the game

This project implements the "Coup" card game, focusing on backend logic and real-time interaction via WebSockets. It aims to simulate the dynamics of a game of intrigue and bluff.

## Building and Running with Docker

### Requirements

- [Docker Engine](https://docs.docker.com/engine/install/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Java 21](https://www.oracle.com/br/java/technologies/downloads/#java21)

If you use Linux, you can also install java by [SDKMan](https://sdkman.io/)
___
Clone project source code:
```sh
git clone https://github.com/jvaraujo-dev/coup.git
```
___
Set your java version to 21

If you use SDKMan you can run a command like this:
```
sdk use java 21.0.7-oracle
```
Remember to switch the 21.0.7-oracle for the version that you downloaded
___
Build and Run the project:
```
make build_start
```

This command will build the images for the docker and start the projects, if you already build, you can just run
```
make start
```
___
To stop and remove the containers, run:
```
make down
```