# Local Firebase emulator suite (Auth, Firestore, Storage) for development.
FROM eclipse-temurin:17-jre AS java
FROM node:20-bookworm-slim
COPY --from=java /opt/java/openjdk /opt/java/openjdk
ENV JAVA_HOME=/opt/java/openjdk PATH="/opt/java/openjdk/bin:${PATH}"
RUN npm install -g firebase-tools@13.29.1 --no-audit --no-fund \
 && firebase setup:emulators:firestore \
 && firebase setup:emulators:storage \
 && firebase setup:emulators:ui
WORKDIR /srv
COPY firebase.json storage.rules ./
EXPOSE 9099 8080 9199 4000
CMD ["sh","-c","firebase emulators:start --project demo-app --import=/data --export-on-exit=/data"]
