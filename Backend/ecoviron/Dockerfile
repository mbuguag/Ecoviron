# Build stage
FROM maven:3.9.8-eclipse-temurin-21 AS builder
WORKDIR /app

# Copy only pom.xml first (so dependencies are cached)
COPY pom.xml ./
RUN mvn dependency:resolve dependency:resolve-plugins

# Now copy source code
COPY src ./src

# Package the app
RUN mvn clean package spring-boot:repackage -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

COPY --from=builder /app/target/*SNAPSHOT.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
