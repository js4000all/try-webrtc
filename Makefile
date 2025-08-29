DEV_PORT ?= 5173

.PHONY: setup dev build lint test

setup:
	@echo "No setup needed."

dev:
	@echo "Serving ./public on http://localhost:$(DEV_PORT)"
	cd public && python3 -m http.server $(DEV_PORT)

build:
	rm -rf dist
	mkdir -p dist
	cp -R public/* dist/
	@echo "Built to ./dist"

lint:
	@echo "No linters configured yet."

test:
	@echo "No tests available."

