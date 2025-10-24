FROM gradle:8-jdk21 AS build

WORKDIR /home/gradle/src

COPY coup-server/build.gradle.kts coup-server/settings.gradle.kts ./
COPY coup-server/gradlew ./
COPY coup-server/gradle ./gradle

COPY coup-server/src ./src

RUN ./gradlew build -x test --no-daemon

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

EXPOSE 8080

COPY --from=build /home/gradle/src/build/libs/*.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]