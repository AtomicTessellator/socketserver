# Define the default environment (dev or prod)
ENV ?= dev

# USAGE: make build-push ENV=prod

# Define registry for different environments
DOCKER_REGISTRY_DEV = harbor.atomic.t/atomict
DOCKER_REGISTRY_PROD = harbor.atomictessellator.com/atomict-private

# Select the appropriate registry based on the environment
ifeq ($(ENV),prod)
  DOCKER_REGISTRY = $(DOCKER_REGISTRY_PROD)
else
  DOCKER_REGISTRY = $(DOCKER_REGISTRY_DEV)
endif

IMAGE_NAME = socketserver
IMAGE_TAG = latest

# Define the login target
login:
	@echo "Logging into Docker registry"
	docker login $(DOCKER_REGISTRY)

# Build the project and create the Docker image
build:
	docker build -t $(IMAGE_NAME):$(IMAGE_TAG) .

# Clean build without using cache
build-clean:
	docker build --no-cache -t $(IMAGE_NAME):$(IMAGE_TAG) .

# Tag and push the Docker image
push: login
	docker tag $(IMAGE_NAME):$(IMAGE_TAG) $(DOCKER_REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)
	docker push $(DOCKER_REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)

# Build and push the Docker image
build-push: build push

# Clean build and push the Docker image
build-push-clean: build-clean push
