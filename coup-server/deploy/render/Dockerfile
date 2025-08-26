#FROM ubuntu:latest AS build
#
#RUN apt-get update
#
#RUN apt install temurin-21-jdk=21.0.2+13-1
#
#COPY . .
#
#RUN apt-get install maven -y
#
#RUN mvn clean install
#
#FROM eclipse-temurin:21-jre-alpine
#
#EXPOSE 8080
#
#COPY --from=build /build/libs/coup-0.0.1-SNAPSHOT-plain.jar coup.jar
#
#ENTRYPOINT ["java", "-jar", "coup.jar"]

# --- Estágio 1: Build ---
# Usamos uma imagem oficial do Maven que já inclui o JDK 21 (Temurin).
# Isso é muito mais eficiente e confiável do que instalar tudo numa imagem base do Ubuntu.
FROM maven:3.9-eclipse-temurin-21 AS build

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia primeiro o pom.xml para aproveitar o cache de camadas do Docker.
# As dependências só serão baixadas novamente se o pom.xml mudar.
COPY pom.xml .
RUN mvn dependency:go-offline

# Copia o resto do código-fonte do projeto
COPY coup-server/src ./src

# Executa o build do Maven para gerar o arquivo .jar executável.
# Usamos 'package' e '-DskipTests' para um build mais rápido e focado.
RUN mvn clean package -DskipTests

# --- Estágio 2: Final ---
# Usamos a imagem JRE Alpine, que é extremamente leve e ideal para produção.
FROM eclipse-temurin:21-jre-alpine

# Define o diretório de trabalho
WORKDIR /app

# Expõe a porta que a aplicação Spring Boot usa por padrão
EXPOSE 8080

# Copia APENAS o arquivo .jar gerado no estágio de build.
# O caminho padrão do Maven é 'target/'. Usamos um curinga (*) para não depender da versão.
# O JAR é renomeado para 'app.jar' para simplificar o comando ENTRYPOINT.
COPY --from=build /app/target/*.jar app.jar

# Define o comando para executar a aplicação
ENTRYPOINT ["java", "-jar", "app.jar"]

