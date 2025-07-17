FROM eclipse-temurin:21.0.2_13-jdk

WORKDIR /app/coup-server

COPY build/libs/coup-0.0.1-SNAPSHOT.jar /app/coup.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/coup.jar"]