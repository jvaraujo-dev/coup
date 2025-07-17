BACKEND_DIR = coup-server
FRONTEND_DIR = coup-client

BACKEND_JAR_NAME = coup-0.0.1-SNAPSHOT.jar
BACKEND_JAR_PATH = $(BACKEND_DIR)/build/libs/$(BACKEND_JAR_NAME)

.PHONY: all build_backend build_frontend build_docker up clean prune

all: up

# Builds the Java (backend) project locally and prepares the image for Docker.
build_backend:
	@echo "--- Building backend (Java/Gradle) project ---"
	@if [ ! -f "$(BACKEND_DIR)/gradlew" ]; then \
		echo "Gradle wrapper not found. Please ensure $(BACKEND_DIR)/gradlew exists."; \
		exit 1; \
	fi
	cd $(BACKEND_DIR) && ./gradlew clean build -x test
	@echo "--- Backend build complete ---"

up:
	@echo "--- Bringing up Docker Compose services ---"
	docker compose up -d # -d para rodar em detached mode
	@echo "--- Services are up and running ---"
	@echo "Frontend will be available at http://localhost:3000"
	@echo "Backend will be available at http://localhost:8080"

down:
	@echo "--- Bringing down Docker Compose services ---"
	docker compose down
	@echo "--- Services are down ---"

clean:
	@echo "--- Cleaning local build artifacts ---"
	rm -rf $(BACKEND_DIR)/build
	rm -rf $(FRONTEND_DIR)/.next
	rm -rf $(FRONTEND_DIR)/node_modules
	@echo "--- Local build artifacts cleaned ---"

prune: down
	@echo "--- Removing all Docker Compose related resources ---"
	docker-compose rm -s -f -v
	@echo "--- Docker resources removed ---"