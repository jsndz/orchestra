# Orchestra Workflow Templates Gallery

This directory contains pre-configured Orchestra `.yaml` workflow templates for popular local development stacks. You can import any template directly into the Orchestra desktop application or load it via MCP.

---

## 📦 Available Templates

1. **[Next.js + Prisma + PostgreSQL](nextjs-prisma-pg.yaml)**
   - Spins up PostgreSQL in Docker on port 5432.
   - Pushes Prisma migrations.
   - Launches Next.js dev server on port 3000.

2. **[Django + Celery + Redis](django-celery-redis.yaml)**
   - Starts Redis cache container on port 6379.
   - Executes Django database migrations.
   - Launches Celery worker daemon and Django development server on port 8000.

3. **[Turborepo / Monorepo Stacks](monorepo-turborepo.yaml)**
   - Installs root workspace dependencies.
   - Compiles core shared packages.
   - Launches backend API microservice (`apps/api`) and web client (`apps/web`).

---

## 📥 How to Import a Template

In the Orchestra Desktop Command Hub:
1. Click **⌘O** or **Open Existing YAML**.
2. Select any template file from this directory.
3. Orchestra will parse the DAG tasks, ready checks, and dependencies instantly.
