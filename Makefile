### -----------------------
# --- Make variables
### -----------------------

# Common infos
MODULE_NAME := ms-fe-report
MODULE_VERSION := $(shell git describe --tags)

# Debian infos
DEB_REGISTRY ?= https://deb.registry.vn/app
DEB_USER ?= admin
DEB_PASSWORD ?= admin
DEB_PACKAGE ?= ${MODULE_NAME}
DEB_VERSION ?= ${MODULE_VERSION}
DEB_ARCHITECTURE ?= amd64
DEB_MAINTAINER ?= Huy Le <huylq142@viettel.com.vn>
DEB_PRE_DEPENDS ?= nginx
DEB_DEPENDS ?=
DEB_RECOMMENDS ?=
DEB_DESCRIPTION ?= Service for managing ${DEB_PACKAGE}

# Docker infos
DOCKER_REGISTRY ?= lqh2307
DOCKER_PROJECT ?= app
DOCKER_USER ?= admin
DOCKER_PASSWORD ?= admin
DOCKER_IMAGE_NAME ?= ${MODULE_NAME}
DOCKER_IMAGE_VERSION ?= ${MODULE_VERSION}
DOCKER_IMAGE := ${DOCKER_REGISTRY}/${DOCKER_PROJECT}/${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_VERSION}

# Service infos
SERVER_HOST ?= localhost
SERVER_PORT ?= 30000

### -----------------------
# --- End variables
### -----------------------

### -----------------------
# --- Start buildings
### -----------------------

build:
	@echo "building..."

	@npm run build

### -----------------------
# --- End buildings
### -----------------------

### -----------------------
# --- Start dockers
### -----------------------

login-docker-registry:
	@echo 'logining docker to registry "${DOCKER_REGISTRY}"...'

	docker login \
		${DOCKER_REGISTRY} \
		-u ${DOCKER_USER} \
		-p ${DOCKER_PASSWORD}

build-docker-image:
	@echo 'building docker image "${DOCKER_IMAGE}"...'

	docker build \
		-t ${DOCKER_IMAGE} \
		-f ./Dockerfile .

push-docker-image:
	@echo 'pushing docker image "${DOCKER_IMAGE}"...'

	docker push \
		${DOCKER_IMAGE}

clean-docker-image:
	@echo 'cleaning docker image "${DOCKER_IMAGE}"...'

	docker rmi -f \
		${DOCKER_IMAGE}

release-docker-image:
	@echo 'releasing docker image "${DOCKER_IMAGE}"...'

	@make login-docker-registry
	@make build-docker-image
	@make push-docker-image
	@make clean-docker-image

### -----------------------
# --- End dockers
### -----------------------

### -----------------------
# --- Start debians
### -----------------------

build-debian:
	@echo "building debian package..."

	@make build

	$(eval DEB_ROOT_FOLDER = deb/$(DEB_PACKAGE)-$(DEB_ARCHITECTURE)-$(DEB_VERSION))
	$(eval DEB_FOLDER = $(DEB_ROOT_FOLDER)/DEBIAN)
	$(eval DEB_SHARE_FOLDER = $(DEB_ROOT_FOLDER)/usr/share/nginx/$(DEB_PACKAGE))
	$(eval DEB_CONFIG_FOLDER = $(DEB_ROOT_FOLDER)/etc/nginx/conf.d)

	$(eval DEB_CONFIG_FILE = $(DEB_CONFIG_FOLDER)/$(DEB_PACKAGE).conf)
	$(eval DEB_CONTROL_FILE = $(DEB_FOLDER)/control)
	$(eval DEB_POSTINST_FILE = $(DEB_FOLDER)/postinst)
	$(eval DEB_PRERM_FILE = $(DEB_FOLDER)/prerm)

	@mkdir -p \
		${DEB_ROOT_FOLDER} \
		${DEB_FOLDER} \
		${DEB_SHARE_FOLDER} \
		${DEB_CONFIG_FOLDER}

	@cp deb_template/name-arch-version/DEBIAN/* ${DEB_FOLDER}

	@cp -r build/* ${DEB_SHARE_FOLDER}/
	@cp etc/nginx/nginx.conf ${DEB_CONFIG_FILE}

	@sed -i 's#SERVER_HOST#${SERVER_HOST}#g' ${DEB_CONFIG_FILE}
	@sed -i 's#SERVER_PORT#${SERVER_PORT}#g' ${DEB_CONFIG_FILE}
	@sed -i 's#DEB_PACKAGE#${DEB_PACKAGE}#g' ${DEB_CONFIG_FILE}

	@sed -i 's#DEB_PACKAGE#${DEB_PACKAGE}#g' ${DEB_CONTROL_FILE}
	@sed -i 's#DEB_VERSION#${DEB_VERSION}#g' ${DEB_CONTROL_FILE}
	@sed -i 's#DEB_ARCHITECTURE#${DEB_ARCHITECTURE}#g' ${DEB_CONTROL_FILE}
	@sed -i 's#DEB_MAINTAINER#${DEB_MAINTAINER}#g' ${DEB_CONTROL_FILE}
	@sed -i 's#DEB_PRE_DEPENDS#${DEB_PRE_DEPENDS}#g' ${DEB_CONTROL_FILE}
	@sed -i 's#DEB_DEPENDS#${DEB_DEPENDS}#g' ${DEB_CONTROL_FILE}
	@sed -i 's#DEB_RECOMMENDS#${DEB_RECOMMENDS}#g' ${DEB_CONTROL_FILE}
	@sed -i 's#DEB_DESCRIPTION#${DEB_DESCRIPTION}#g' ${DEB_CONTROL_FILE}

	@sed -i 's#DEB_PACKAGE#${DEB_PACKAGE}#g' ${DEB_POSTINST_FILE}
	@sed -i 's#DEB_PACKAGE#${DEB_PACKAGE}#g' ${DEB_PRERM_FILE}

	@chmod -R 775 ${DEB_ROOT_FOLDER}

	@dpkg-deb --build --root-owner-group $(DEB_ROOT_FOLDER)

push-debian:
	$(eval DEB_FILE = deb/$(DEB_PACKAGE)-$(DEB_ARCHITECTURE)-$(DEB_VERSION).deb)

	@echo 'pushing debian package "${DEB_FILE}"...'

	@curl -u "${DEB_USER}:${DEB_PASSWORD}" -H "Content-Type: multipart/form-data" --data-binary "@./${DEB_FILE}" "${DEB_REGISTRY}"

release-debian:
	$(eval DEB_FILE = deb/$(DEB_PACKAGE)-$(DEB_ARCHITECTURE)-$(DEB_VERSION).deb)

	@echo 'releasing debian "${DEB_FILE}"...'

	@make build-debian
	@make push-debian

### -----------------------
# --- End debians
### -----------------------

### -----------------------
# --- Start devs
### -----------------------

server:
	@echo "starting server..."

	@npm run start

### -----------------------
# --- End devs
### -----------------------
