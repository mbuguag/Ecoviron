# ===== BUILD STAGE =====
FROM maven:3.9.8-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# ===== RUN STAGE =====
FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app
COPY --from=build /app/target/ecoviron-0.0.1-SNAPSHOT.jar app.jar

# Set environment variables (adjust values as needed)
ENV SPRING_DATASOURCE_URL=jdbc:postgresql://host:5432/ecoviron_pos
ENV SPRING_DATASOURCE_USERNAME=ecoviron_pos_user
ENV SPRING_DATASOURCE_PASSWORD=hqYSJJSGtT9w66A7Ee4Gl3RPEYSUjpIO

EXPOSE 10000
CMD ["sh", "-c", "java -Dserver.port=10000 -jar app.jar"]
