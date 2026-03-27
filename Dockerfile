FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean install -DskipTests -f backend/pom.xml

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/backend/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
