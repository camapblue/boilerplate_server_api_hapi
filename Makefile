ENV ?= qc
DOCKER_CONTAINERS = $(shell docker ps -q -f 'status=exited')
DOCKER_IMAGES = $(shell docker images -q -f "dangling=true")

setup-env:
	# yarn
	echo "Start setup Environment"
	cp ./environments/$(ENV)/.env .env

install:
	make setup-env

start:
	cross-env NODE_ENV=development node server

free-docker-space:
ifneq ($(strip $(DOCKER_CONTAINERS)),)
	docker rm $(DOCKER_CONTAINERS)
endif
ifneq ($(strip $(DOCKER_IMAGES)),)
	docker rmi $(DOCKER_IMAGES)
endif

deploy-dev:
	firebase use dev
	firebase target:clear hosting server_api
	firebase target:apply hosting server_api bbfootball-web-dev
	make setup-env
	npm run build:clean
	firebase deploy --only hosting

deploy-pro:
	firebase use production
	firebase target:clear hosting server_api
	firebase target:apply hosting server_api bb-football-web
	make setup-env
	npm run build:clean
	firebase deploy --only hosting
