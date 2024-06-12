# Define the default environment (dev or prod)
ENV ?= dev

# USAGE: make build-push ENV=prod

# Select the appropriate registry based on the environment
ifeq ($(ENV),prod)
  IMAGE_NAME = socketserver
else
  IMAGE_NAME = qf_socketserver
endif

DOCKER_REGISTRY = docker.io/atomictessellator
IMAGE_TAG = latest
DOCKERFILE = Dockerfile


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
