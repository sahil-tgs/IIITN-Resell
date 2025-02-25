FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/chat-service-*.jar app.jar
EXPOSE 8084 9092
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
