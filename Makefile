# The BlackCat: one entry point for humans and agents.  `make help` lists targets.
HUGO ?= hugo
PY   ?= python3

.PHONY: help serve build check lint lint-changed css contrast test shots og clean
help:            ## list targets
	@awk -F':.*## ' '/^[a-z0-9-]+:.*## /{printf "  %-14s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

serve:           ## live-reloading dev server (drafts on)
	$(HUGO) server -D --disableFastRender

build:           ## production build into ./public (fails on any template warning)
	$(HUGO) --gc --minify --panicOnWarning

lint:            ## check ALL of content/ against the AGENTS.md contract (old debt included)
	$(PY) scripts/lint_content.py

lint-changed:    ## check only content files changed vs HEAD/main: what a PR is held to
	@files="$$( (git diff --name-only HEAD -- 'content/*.md'; git ls-files -o --exclude-standard -- 'content/*.md') | sort -u | tr '\n' ' ')"; \
	if [ -n "$$files" ]; then $(PY) scripts/lint_content.py $$files; else echo "no content changes"; fi

css:             ## every class a template/JS emits must exist in the stylesheet
	$(PY) scripts/check_css.py

contrast:        ## WCAG contrast of every colour-token pair, light and dark
	$(PY) scripts/contrast.py

check: build lint-changed css contrast   ## everything that needs no browser
	@echo "ok"

test: check      ## + browser behaviour and axe (needs: pip install playwright pyyaml; npm i axe-core)
	./scripts/test.sh

shots:           ## screenshots of key pages into ./shots (light/dark, mobile/desktop)
	$(PY) scripts/shots.py

og:              ## regenerate the social card static/og.png
	$(PY) scripts/og.py

clean:           ## remove build output
	rm -rf public resources/_gen shots
