.PHONY: backend
backend:
	cd backend && make backend

.PHONY: frontend
frontend:
	cd frontend && make frontend

.PHONY: deploy-dev
deploy-dev:
	cd frontend && make build-dev
	rm -rf backend/assets backend/index.html
	cp -r frontend/dist/* backend
	cd backend && sls deploy --stage dev

.PHONY: deploy-prod
deploy-prod:
	cd frontend && make build-prod
	rm -rf backend/assets backend/index.html
	cp -r frontend/dist/* backend
	cd backend && sls deploy --stage prod
