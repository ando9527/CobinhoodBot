project = cobbv2
image = docker.kumay.net/$(project):latest
build:
	docker build -t $(image) .

push:
	docker push $(image)

all: build push

.PHONY: build push all