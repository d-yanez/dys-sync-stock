# dys-sync-stock

Microservicio para sincronizar inventario desde una hoja de Google Sheets a MongoDB Atlas, registrar variaciones diarias y enviar notificaciones vía Telegram. Sigue principios de **Clean Architecture** y se despliega en **Cloud Run** con CI/CD en **Cloud Build**.

---

## Tabla de contenidos

1. [Descripción](#descripción)  
2. [Prerrequisitos](#prerrequisitos)  
3. [Configuración](#configuración)  
4. [Variables de entorno](#variables-de-entorno)  
5. [Instalación y ejecución local](#instalación-y-ejecución-local)  
6. [Docker](#docker)  
7. [CI/CD con Cloud Build](#cicd-con-cloud-build)  
8. [Despliegue en Cloud Run](#despliegue-en-cloud-run)  
9. [Programación con Cloud Scheduler](#programación-con-cloud-scheduler)  
10. [Endpoints disponibles](#endpoints-disponibles)  
11. [Estructura del proyecto](#estructura-del-proyecto)  
12. [Buenas prácticas](#buenas-prácticas)  

---

## Descripción

Este servicio realiza:

- Lectura periódica de la hoja `rev_stock_full` en Google Sheets  
- Bulk upsert de stock (`sku`, `title`, `stock`, `location`) en MongoDB Atlas  
- Cálculo de variación diaria global de stock  
- Persistencia de ese resumen en la colección `summaryChangeStock`  
- Envío de informe formateado vía Telegram  

---

## Prerrequisitos

- Node.js ≥ 20  
- Docker (opcional para contenedor)  
- Cuenta de Google Cloud con:
  - Proyecto habilitado
  - APIs: Sheets, Cloud Run, Cloud Build, Artifact Registry/Container Registry, Scheduler
  - Service Account `sa-dys-sync-stock@…` con roles:
    - `roles/run.admin`
    - `roles/iam.serviceAccountUser`
    - `roles/artifactregistry.writer`
    - `roles/storage.admin`
- Hoja de Google compartida con la SA
- Clúster MongoDB Atlas accesible desde GCP
- Bot de Telegram y chat (grupo/canal) configurados

---

## Configuración

1. Clona el repositorio:
   ```bash
   git clone https://github.com/TU_USUARIO/dys-sync-stock.git
   cd dys-sync-stock

2. Instalación y ejecución local
  ```bash
   npm install
   npm run dev
   curl -X POST http://localhost:8080/sync-stock

