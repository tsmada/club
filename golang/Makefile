.PHONY: install build all lint run

all: build coverage

install:
	curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s v1.27.0

build:
	go build ./cmd/club

fakes:
	go generate ./...

test:
	go test ./...

coverage:
	go test -v -coverprofile cover.out ./...
	go tool cover -html=cover.out -o cover.html
	open cover.html

coverage-ci:
	go test -v -coverprofile cover.out ./...
	go tool cover -func=cover.out

lint:
	./bin/golangci-lint run

ci: install lint build test coverage-ci

run: build
	ENV=prod ./club

run-debug: build
	ENV=dev ./club
