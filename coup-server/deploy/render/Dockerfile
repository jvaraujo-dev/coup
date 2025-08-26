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
# Usamos uma imagem oficial do Gradle que já inclui o JDK 21.
# É a forma mais limpa e confiável para projetos Gradle.
FROM gradle:8-jdk21 AS build

# Define o diretório de trabalho padrão da imagem Gradle
WORKDIR /home/gradle/src

# Copia os arquivos de configuração do Gradle e o wrapper para aproveitar o cache.
# As dependências só serão baixadas novamente se esses arquivos mudarem.
COPY build.gradle settings.gradle ./
COPY gradlew ./
COPY gradle ./gradle

# Copia o resto do código-fonte do projeto
COPY coup-server/src ./src

# Executa o build do Gradle para gerar o arquivo .jar executável.
# '-x test' pula os testes para um build mais rápido.
# '--no-daemon' é uma boa prática para ambientes de CI/CD como o Docker.
RUN ./gradlew build -x test --no-daemon

# --- Estágio 2: Final ---
# Usamos a imagem JRE Alpine, que é extremamente leve e ideal para produção.
FROM eclipse-temurin:21-jre-alpine

# Define o diretório de trabalho
WORKDIR /app

# Expõe a porta que a aplicação Spring Boot usa por padrão
EXPOSE 8080

# Copia APENAS o arquivo .jar gerado no estágio de build.
# O caminho padrão do Gradle é 'build/libs/'. Usamos um curinga (*) para não depender do nome/versão.
# O JAR é renomeado para 'app.jar' para simplificar o comando ENTRYPOINT.
COPY --from=build /home/gradle/src/build/libs/*.jar app.jar

# Define o comando para executar a aplicação
ENTRYPOINT ["java", "-jar", "app.jar"]