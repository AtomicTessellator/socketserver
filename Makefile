
DOCKER_REGISTRY = 445057328137.dkr.ecr.us-west-2.amazonaws.com
IMAGE_NAME = socketserver
IMAGE_TAG = latest

ecr-auth:
	aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin 445057328137.dkr.ecr.us-west-2.amazonaws.com

build:
	docker build -t $(IMAGE_NAME):$(IMAGE_TAG) .

push:
	make ecr-auth
	docker tag $(IMAGE_NAME):$(IMAGE_TAG) $(DOCKER_REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)
	docker push $(DOCKER_REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)

build-push:
	make build
	make push
