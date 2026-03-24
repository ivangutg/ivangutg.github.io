# 🌮 Los Consentidos — Práctica 3.1

**Instituto Politécnico Nacional** | **Escuela Superior de Cómputo (ESCOM)** 
**Ingeniería en Sistemas Computacionales / 2020** 
**Unidad de Aprendizaje:** Bases de Datos 
**Práctica 3.1:** Alojamiento Gratuito de Bases de Datos y Aplicaciones Web 

## 📋 Portada 

* **Nombre del proyecto:** Los Consentidos 
* **Integrantes del equipo:**
* Gutiérrez Gómez Iván
* Manjarrez Váquez Ángel Ian
* Márquez Romero David
* Sosa Jiménez Arturo
* **Fecha de entrega:** Lunes 23 de marzo de 2026 
* **URL de la versión estática (GitHub Pages):** [ivangutg.github.io] 
* **URL del repositorio de código:** [https://github.com/ivangutg/ivangutg.github.io] 

---

## 🛠️ Decisión de Tecnologías 

Para el desarrollo de "Sabor & Fuego", se seleccionó el siguiente stack tecnológico:

* **Base de Datos - MongoDB Atlas (512MB - NoSQL):** Elegimos MongoDB Atlas debido a la flexibilidad de su esquema NoSQL, lo cual es ideal para manejar estructuras de datos dinámicas como los platillos de una orden (almacenados como subdocumentos en el modelo `Orden`). Además, su integración nativa con Node.js a través de Mongoose acelera el desarrollo.
* **Plataforma de Hosting Backend - Render:** Optamos por Render sobre alternativas como PythonAnywhere porque nuestro backend está construido en Node.jsRender permite un despliegue directo desde GitHub y soporta nativamente la inyección de variables de entorno para proteger nuestras credenciales.
* **Frontend:** Vanilla JavaScript, HTML5 y CSS3.

---

## 🏗️ Arquitectura de la Solución 

Implementamos una arquitectura híbrida recomendada para superar las limitaciones de sitios estáticos. 

* **Frontend:** Alojado en GitHub Pages, sirve los archivos estáticos (HTML, CSS, JS). Toda la lógica se ejecuta en el navegador y realiza peticiones `fetch()` hacia el servidor.
* **Backend:** Alojado en Render, expone una API REST que gestiona la lógica de negocio y la conexión a la base de datos.
* **Base de Datos:** MongoDB Atlas en la nube.

### Modelo de Datos 
El sistema se compone de los siguientes modelos principales interrelacionados:
* `Empleado` y `Mesa` (Relación 1:N).
* `Orden` y `Platillo` (Relación N:M a través de un arreglo de subdocumentos en la Orden).
* `Proveedor` e `Ingrediente` (Relación 1:N para el control de inventario).
* Control de flujo de caja con `Presupuesto`, `Ingreso` y `Egreso`.


)*

---

## 🚀 Proceso de Implementación 

1. **Configuración de la base de datos:** Se creó un cluster gratuito en MongoDB Atlas. Se configuró el acceso de red (IP Access List) para permitir conexiones y se generó un usuario de base de datos para obtener la cadena de conexión (URI).
2. **Conexión entre aplicación y base de datos** En el archivo `server.js`, utilizamos `mongoose.connect(process.env.MONGODB_URI)` para establecer el puente de comunicación. Se incluyó una función `seedDemoData()` para poblar la base si está vacía.
3. **Despliegue de la aplicación (Backend):** Se vinculó el repositorio de GitHub con un Web Service en Render. Render detecta el entorno Node.js gracias al `package.json`.
4. **Configuración de variables de entorno :** En el panel de control de Render, se configuró la variable `MONGODB_URI` para evitar exponer credenciales en el código fuente público, cumpliendo con las mejores prácticas de seguridad.
5. **Problemas encontrados:** *(Ejemplo: Se presentó un problema de CORS al intentar consumir la API de Render desde GitHub Pages. Se solucionó instalando e implementando el middleware `cors` en Express dentro de `server.js`)*.

)*

---

## 💻 Instrucciones de Uso 

1. **Acceso:** Navega a la URL pública de GitHub Pages proporcionada en la portada.
2.**Funcionalidades principales:**
   * **Menú:** Visualiza el catálogo y agrega nuevos platillos.
   * **Órdenes:** Crea nuevas órdenes seleccionando platillos y asigando una mesa. Puedes ver el total calculado y cerrar la orden al finalizar.
   * **Inventario:** Revisa alertas visuales de stock bajo o agotado. Permite editar existencias o eliminar insumos.
3. **Credenciales:** No se requiere inicio de sesión para esta versión de demostración. La base de datos se autocompleta con datos semilla en el primer arranque.

---

## 📊 Comparativa: GitHub Pages vs Render 

| Característica | GitHub Pages | Render |
| :--- | :--- | :--- |
| **Tipo de contenido** | Solo estático (HTML/CSS/JS) | Estático y dinámico (backend completo) |
| **Backend** | No soportado | Sí (Node.js, Python, Go, Ruby, etc.) |
| **Conexión a base de datos** | No soportada directamente | Sí (PostgreSQL, MongoDB, Redis, etc.) |
| **Variables de entorno** | No soportadas en servidor | Sí, configurables en el panel |
| **Velocidad de despliegue** | Muy rápido (~segundos) | Más lento (~minutos, cold start en tier gratuito) |
| **Disponibilidad (gratuito)** | 24/7 sin restricciones | Se duerme tras inactividad (tier gratuito) |
| **Caso de uso ideal** | Portafolios, documentación, landing pages | APIs REST, apps full-stack con base de datos |

**Conclusión:** GitHub Pages es excelente y ultrarrápido para alojar interfaces visuales, pero carece de procesamiento backend. Render es ideal para la lógica robusta y conexión a bases de datos. Al combinarlos, obtenemos lo mejor de ambos mundos: un frontend rápido y siempre disponible que se comunica de forma asíncrona con un servidor potente.

---
