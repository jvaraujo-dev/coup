FROM gradle:8-jdk21 AS build

WORKDIR /home/gradle/src

COPY coup-backend/build.gradle.kts coup-backend/settings.gradle.kts ./
COPY coup-backend/gradlew ./
COPY coup-backend/gradle ./gradle

COPY coup-backend/src ./src

RUN ./gradlew build -x test --no-daemon

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

EXPOSE 8080

COPY --from=build /home/gradle/src/build/libs/*.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]