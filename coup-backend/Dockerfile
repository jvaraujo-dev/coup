FROM eclipse-temurin:21.0.2_13-jdk

WORKDIR /app/coup-backend

COPY build/libs/coup-0.0.1-SNAPSHOT.jar /app/coup-backend/coup.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/coup-backend/coup.jar"]