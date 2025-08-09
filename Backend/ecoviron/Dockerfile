#FROM ubuntu:latest
#LABEL authors="Admin"
#
#ENTRYPOINT ["top", "-b"]

FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN ./mvnw package -DskipTests

COPY target/*.jar app.jar

VOLUME /app/uploads

ENTRYPOINT ["java","-jar","app.jar"]
