# 🌮 Sabor & Fuego — Práctica 3.1

[cite_start]**Instituto Politécnico Nacional** [cite: 2] | [cite_start]**Escuela Superior de Cómputo (ESCOM)** [cite: 3, 7]
[cite_start]**Ingeniería en Sistemas Computacionales / 2020** [cite: 5]
[cite_start]**Unidad de Aprendizaje:** Bases de Datos [cite: 8, 9]
[cite_start]**Práctica 3.1:** Alojamiento Gratuito de Bases de Datos y Aplicaciones Web 

## [cite_start]📋 Portada [cite: 19]

* [cite_start]**Nombre del proyecto:** Los Consentidos [cite: 20]
* [cite_start]**Integrantes del equipo:** Gutiérrez Gómez Iván
* Manjarrez Váquez Ángel Ian
* Márquez Romero David
* Sosa Jiménez Arturo
*  [cite: 21]
* [cite_start]**Fecha de entrega:** Lunes 23 de marzo de 2026 [cite: 22, 109]
* [cite_start]**URL de la versión estática (GitHub Pages):** [ivangutg.github.io] [cite: 25]
* [cite_start]**URL del repositorio de código:** [https://github.com/ivangutg/ivangutg.github.io] [cite: 24]

---

## [cite_start]🛠️ Decisión de Tecnologías [cite: 26]

[cite_start]Para el desarrollo de "Sabor & Fuego", se seleccionó el siguiente stack tecnológico[cite: 30]:

* [cite_start]**Base de Datos - MongoDB Atlas (512MB - NoSQL)[cite: 53]:** Elegimos MongoDB Atlas debido a la flexibilidad de su esquema NoSQL, lo cual es ideal para manejar estructuras de datos dinámicas como los platillos de una orden (almacenados como subdocumentos en el modelo `Orden`). [cite_start]Además, su integración nativa con Node.js a través de Mongoose acelera el desarrollo[cite: 28].
* [cite_start]**Plataforma de Hosting Backend - Render [cite: 61][cite_start]:** Optamos por Render sobre alternativas como PythonAnywhere porque nuestro backend está construido en Node.js[cite: 29, 61]. [cite_start]Render permite un despliegue directo desde GitHub y soporta nativamente la inyección de variables de entorno para proteger nuestras credenciales[cite: 41, 46].
* **Frontend:** Vanilla JavaScript, HTML5 y CSS3.

---

## [cite_start]🏗️ Arquitectura de la Solución [cite: 33]

[cite_start]Implementamos una arquitectura híbrida recomendada para superar las limitaciones de sitios estáticos[cite: 91, 92]. 

* [cite_start]**Frontend:** Alojado en GitHub Pages, sirve los archivos estáticos (HTML, CSS, JS)[cite: 93]. [cite_start]Toda la lógica se ejecuta en el navegador y realiza peticiones `fetch()` hacia el servidor[cite: 79, 95].
* [cite_start]**Backend:** Alojado en Render, expone una API REST que gestiona la lógica de negocio y la conexión a la base de datos[cite: 94].
* **Base de Datos:** MongoDB Atlas en la nube.

### [cite_start]Modelo de Datos [cite: 35]
El sistema se compone de los siguientes modelos principales interrelacionados:
* `Empleado` y `Mesa` (Relación 1:N).
* `Orden` y `Platillo` (Relación N:M a través de un arreglo de subdocumentos en la Orden).
* `Proveedor` e `Ingrediente` (Relación 1:N para el control de inventario).
* Control de flujo de caja con `Presupuesto`, `Ingreso` y `Egreso`.

[cite_start][cite: 35, 98])*

---

## [cite_start]🚀 Proceso de Implementación [cite: 36]

1. [cite_start]**Configuración de la base de datos[cite: 38]:** Se creó un cluster gratuito en MongoDB Atlas. Se configuró el acceso de red (IP Access List) para permitir conexiones y se generó un usuario de base de datos para obtener la cadena de conexión (URI).
2. [cite_start]**Conexión entre aplicación y base de datos[cite: 39]:** En el archivo `server.js`, utilizamos `mongoose.connect(process.env.MONGODB_URI)` para establecer el puente de comunicación. Se incluyó una función `seedDemoData()` para poblar la base si está vacía.
3. [cite_start]**Despliegue de la aplicación (Backend)[cite: 40]:** Se vinculó el repositorio de GitHub con un Web Service en Render. Render detecta el entorno Node.js gracias al `package.json`.
4. [cite_start]**Configuración de variables de entorno [cite: 41][cite_start]:** En el panel de control de Render, se configuró la variable `MONGODB_URI` para evitar exponer credenciales en el código fuente público, cumpliendo con las mejores prácticas de seguridad[cite: 46, 82, 83].
5. [cite_start]**Problemas encontrados[cite: 42]:** *(Ejemplo: Se presentó un problema de CORS al intentar consumir la API de Render desde GitHub Pages. Se solucionó instalando e implementando el middleware `cors` en Express dentro de `server.js`)*.

[cite_start]* [cite: 43, 44, 45, 46])*

---

## [cite_start]💻 Instrucciones de Uso [cite: 47]

1. [cite_start]**Acceso[cite: 48]:** Navega a la URL pública de GitHub Pages proporcionada en la portada.
2. [cite_start]**Funcionalidades principales[cite: 49]:**
   * **Menú:** Visualiza el catálogo y agrega nuevos platillos.
   * **Órdenes:** Crea nuevas órdenes seleccionando platillos y asigando una mesa. Puedes ver el total calculado y cerrar la orden al finalizar.
   * **Inventario:** Revisa alertas visuales de stock bajo o agotado. Permite editar existencias o eliminar insumos.
3. [cite_start]**Credenciales[cite: 50]:** No se requiere inicio de sesión para esta versión de demostración. La base de datos se autocompleta con datos semilla en el primer arranque.

---

## [cite_start]📊 Comparativa: GitHub Pages vs Render [cite: 88, 100]

| Característica | GitHub Pages | Render |
| :--- | :--- | :--- |
| **Tipo de contenido** | Solo estático (HTML/CSS/JS) | Estático y dinámico (backend completo) |
| **Backend** | No soportado | Sí (Node.js, Python, Go, Ruby, etc.) |
| **Conexión a base de datos** | No soportada directamente | Sí (PostgreSQL, MongoDB, Redis, etc.) |
| **Variables de entorno** | No soportadas en servidor | Sí, configurables en el panel |
| **Velocidad de despliegue** | Muy rápido (~segundos) | Más lento (~minutos, cold start en tier gratuito) |
| **Disponibilidad (gratuito)** | 24/7 sin restricciones | Se duerme tras inactividad (tier gratuito) |
| **Caso de uso ideal** | Portafolios, documentación, landing pages | APIs REST, apps full-stack con base de datos |

**Conclusión:** GitHub Pages es excelente y ultrarrápido para alojar interfaces visuales, pero carece de procesamiento backend. Render es ideal para la lógica robusta y conexión a bases de datos. [cite_start]Al combinarlos, obtenemos lo mejor de ambos mundos: un frontend rápido y siempre disponible que se comunica de forma asíncrona con un servidor potente[cite: 89, 90].

---
