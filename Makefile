.PHONY: help start start-dev stop clean logs build test

# 🎯 ARXIS - Makefile para facilitar comandos

help: ## Mostrar esta ajuda
	@echo "🎯 ARXIS - Sistema de Gerenciamento de Obras"
	@echo ""
	@echo "Comandos disponíveis:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

start: ## Iniciar aplicação em modo PRODUÇÃO
	@echo "🏗️  Iniciando ARXIS em modo PRODUÇÃO..."
	docker-compose up --build -d
	@echo ""
	@echo "✅ Aplicação rodando!"
	@echo "🌐 Frontend: http://localhost:3000"
	@echo "🔌 API: http://localhost:5000"
	@echo "📚 Swagger: http://localhost:5000/swagger"

start-dev: ## Iniciar aplicação em modo DESENVOLVIMENTO (com hot-reload)
	@echo "🔧 Iniciando ARXIS em modo DESENVOLVIMENTO..."
	docker-compose -f docker-compose.dev.yml up --build
	@echo ""
	@echo "✅ Aplicação rodando!"
	@echo "🌐 Frontend: http://localhost:5173"
	@echo "🔌 API: http://localhost:5000"
	@echo "📚 Swagger: http://localhost:5000/swagger"

stop: ## Parar todos os containers
	@echo "🛑 Parando containers..."
	docker-compose down
	docker-compose -f docker-compose.dev.yml down
	@echo "✅ Containers parados"

clean: ## Limpar tudo (containers, volumes, imagens)
	@echo "🧹 Limpando tudo..."
	docker-compose down -v --rmi all
	docker-compose -f docker-compose.dev.yml down -v --rmi all
	@echo "✅ Limpeza concluída"

logs: ## Ver logs de todos os serviços
	docker-compose logs -f

logs-api: ## Ver logs da API
	docker-compose logs -f api

logs-web: ## Ver logs do Frontend
	docker-compose logs -f web

logs-redis: ## Ver logs do Redis
	docker-compose logs -f redis

build: ## Build da aplicação sem iniciar
	docker-compose build

test: ## Rodar testes
	@echo "🧪 Rodando testes..."
	dotnet test

health: ## Verificar saúde da aplicação
	@echo "❤️  Verificando saúde..."
	@curl -s http://localhost:5000/health | jq '.' || echo "API não está rodando"

ps: ## Listar containers rodando
	docker-compose ps

restart: stop start ## Reiniciar aplicação

restart-api: ## Reiniciar apenas API
	docker-compose restart api

restart-web: ## Reiniciar apenas Frontend
	docker-compose restart web

shell-api: ## Abrir shell no container da API
	docker exec -it arxis-api bash

shell-web: ## Abrir shell no container do Frontend
	docker exec -it arxis-web sh

setup: ## Configuração inicial (copiar .env.example)
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "✅ Arquivo .env criado. Ajuste os valores conforme necessário."; \
	else \
		echo "⚠️  Arquivo .env já existe."; \
	fi

prune: ## Limpar cache do Docker (liberar espaço)
	docker builder prune -f
	docker system prune -f
