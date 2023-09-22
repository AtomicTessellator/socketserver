DOCKER_REGISTRY = harbor.atomic.t/atomict
IMAGE_NAME = socketserver
IMAGE_TAG = latest

build:
	docker build -t $(IMAGE_NAME):$(IMAGE_TAG) .

push:
	docker tag $(IMAGE_NAME):$(IMAGE_TAG) $(DOCKER_REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)
	docker push $(DOCKER_REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)

build-push:
	make build
	make push
