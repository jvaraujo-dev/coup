FROM ubuntu:latest AS build

RUN apt-get update

#RUN apt install curl

RUN curl -s "https://get.sdkman.io" | bash

RUN source "$HOME/.sdkman/bin/sdkman-init.sh"

RUN sdk install java 21.0.7-oracle -y

COPY . .

RUN ./gradlew clean build

FROM eclipse-temurin:21-jre-alpine

EXPOSE 8080

COPY --from=build /build/libs/coup-0.0.1-SNAPSHOT-plain.jar coup.jar

ENTRYPOINT ["java", "-jar", "coup.jar"]