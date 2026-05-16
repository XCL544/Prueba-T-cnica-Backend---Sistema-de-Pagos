# Prueba Técnica Backend - Sistema de Pagos

Este proyecto implementa una solución de microservicios para un sistema de pagos. Consta de una API principal construida puramente en **Node.js (sin frameworks como Express o NestJS)** y un microservicio simulador de procesamiento de pagos construido en **Python (FastAPI)**. Todo está respaldado por una base de datos **PostgreSQL**.

## 🚀 Arquitectura del Proyecto

- **api-node/**: API principal desarrollada con el módulo nativo `http` de Node.js y TypeScript. Maneja la creación de usuarios, tokenización (registro) de tarjetas de crédito y orquestación de pagos.
- **processor-python/**: Microservicio en FastAPI que simula la pasarela de pagos (aprobando o rechazando transacciones de forma aleatoria).
- **database/**: Scripts SQL para inicializar el esquema de base de datos.

## 📋 Requisitos Previos

Asegúrate de tener instalado en tu entorno local:

- [Node.js](https://nodejs.org/) (v18 o superior recomendado)
- [Python](https://www.python.org/) (v3.9 o superior)
- [PostgreSQL](https://www.postgresql.org/) (v13 o superior)

---

## 🛠️ Instrucciones de Instalación y Ejecución

### 1. Configuración de Base de Datos (PostgreSQL)

1. Inicia sesión en tu servidor PostgreSQL.
2. Crea una base de datos (por ejemplo, `payment_db`).
3. Ejecuta el script de inicialización para crear las tablas necesarias:

   ```bash
   psql -U tu_usuario -d payment_db -f database/schema.sql
   ```

*(Nota: El script activa automáticamente la extensión `uuid-ossp` requerida para las claves primarias).*

### 2. Configuración de la API Principal (Node.js)

1. Navega al directorio de la API:

   ```bash
   cd api-node
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Configura las variables de entorno. Renombra `.env.example` a `.env` (o crea un archivo `.env`) y ajusta las credenciales de tu base de datos:

   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=tu_password
   DB_NAME=payment_db
   PYTHON_SERVICE_URL=http://localhost:8000/process
   ```

4. Levanta el servidor en modo desarrollo:

   ```bash
   npm run dev
   ```

   *El servidor Node.js estará corriendo en `http://localhost:3000`*.

### 3. Configuración del Procesador de Pagos (Python)

1. Abre **una nueva terminal** y navega al directorio del servicio Python:

   ```bash
   cd processor-python
   ```

2. Crea y activa un entorno virtual:

   ```bash
   python -m venv venv
   ```

- En Windows:

   ```bash
   venv\Scripts\activate
   ```

- En macOS/Linux:

   ```bash
   source venv/bin/activate
   ```

3. Instala las dependencias:

   ```bash
   pip install -r requirements.txt
   ```

4. Levanta el servicio de FastAPI:

   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

   *El servicio Python estará corriendo en `http://localhost:8000`*.

---

## 🧪 Pruebas Unitarias (Testing)

La API en Node.js cuenta con una suite completa de pruebas unitarias implementadas con **Jest**, cubriendo todos los comportamientos y validaciones al 100%.

Para ejecutar las pruebas:

```bash
cd api-node
npm test
```

---

## 📍 Endpoints Principales del API

- `GET /health`: Verifica la salud de la API y la conexión a la base de datos.
- `POST /users`: Registra un nuevo usuario (requiere email válido y contraseña segura).
- `POST /cards`: Registra y asocia una nueva tarjeta a un usuario.
- `POST /payments`: Inicia el procesamiento de un pago contra el microservicio Python.
- `GET /payments/:userId`: Lista el historial de pagos de un usuario específico.

*(Consulta la colección de Postman adjunta para ver ejemplos de payloads y probar rápidamente la API).*

---

## 📬 ¿Cómo importar y usar la Colección de Postman?

El archivo `PaymentSystem_Postman_Collection.json` ubicado en la raíz del proyecto contiene todas las peticiones preparadas para probar el flujo completo de la aplicación.

### Pasos para Importar la Colección

1. Abre la aplicación de **Postman**.
2. **Método A (Arrastrar y Soltar):** Toma el archivo `PaymentSystem_Postman_Collection.json` desde el explorador de archivos y arrástralo directamente dentro de la ventana de Postman.
3. **Método B (Menú de Importación):**
   - Haz clic en el botón **Import** ubicado en la esquina superior izquierda (al lado de tu Workspace).
   - Haz clic en **Select Files** y selecciona el archivo `PaymentSystem_Postman_Collection.json` de la raíz del proyecto.
   - Haz clic en **Import** para confirmar.

Verás aparecer una nueva colección llamada **"Payment System API"** en tu barra lateral izquierda.

### Flujo Recomendado de Pruebas

1. **Health Check (`GET /health`)**: Ejecútalo para certificar que tu API de Node.js está levantada y conectada de forma exitosa a PostgreSQL.
2. **Crear Usuario (`POST /users`)**: Crea un usuario enviando el JSON. Copia el valor del campo `id` (el UUID devuelto por el servidor).
3. **Registrar Tarjeta (`POST /cards`)**: Pega el UUID copiado en el campo `user_id` del JSON y ejecuta la petición para registrar la tarjeta de crédito de prueba. Copia el campo `id` de la tarjeta resultante.
4. **Procesar Pago (`POST /payments`)**: Reemplaza el `user_id` y el `card_id` en el JSON con los UUIDs generados previamente y realiza el cobro.
5. **Historial de Pagos (`GET /payments/:userId`)**: Reemplaza `:userId` en la URL con tu `user_id` para listar el historial completo de cobros e intentos de cobros de ese usuario.
