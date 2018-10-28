.PHONY: build
ensure::
	yarn install

.PHONY: build
build::
	npm run build

.PHONY: run
run:: build
	node ./bin/index.js
