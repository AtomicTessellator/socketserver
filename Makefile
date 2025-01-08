# Define the default environment (dev or prod)
ENV ?= qf

# USAGE: make build-push ENV=prod
# testing cloudbuild
# Select the appropriate registry based on the environment
ifeq ($(ENV),prod)
	PROJECT_ID = production-437300
endif

ifeq ($(ENV),qf)
	PROJECT_ID = quantumforge-445605
endif

ifeq ($(ENV),beta)
	PROJECT_ID = betaatomics
endif

# ENV validation
ifndef PROJECT_ID
$(error Invalid ENV value: '$(ENV)'. Must be one of: prod, qf, beta)
endif

IMAGE_NAME = socketserver
DOCKER_REGISTRY = atomictessellator
REGION = australia-southeast1
IMAGE_TAG = latest
DOCKERFILE = Dockerfile


build:
	docker build -t $(IMAGE_NAME):$(IMAGE_TAG) --build-arg arch=amd64 .

build-clean:
	docker build --build-arg arch=amd64 --no-cache -t $(IMAGE_NAME):$(IMAGE_TAG) .

push:
	gcloud config set project $(PROJECT_ID)
	docker tag $(IMAGE_NAME):$(IMAGE_TAG) $(REGION)-docker.pkg.dev/$(PROJECT_ID)/$(DOCKER_REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)
	docker push $(REGION)-docker.pkg.dev/$(PROJECT_ID)/$(DOCKER_REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)

build-push: build push

build-push-clean: build-clean push
