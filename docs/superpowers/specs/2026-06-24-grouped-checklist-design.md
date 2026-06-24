# Especificación de Diseño: Categorización Visual del Checklist de Auditoría

Este documento detalla la especificación del diseño visual para la pantalla de detalle de expedientes (`detalle.html`), clasificando la revisión de acuerdo a las categorías oficiales del checklist.

## Contexto y Objetivos
El usuario solicitó clasificar visualmente la revisión de auditoría del expediente agrupando los resultados en categorías (Autorizaciones Iniciales, Adjudicación, Licitación, etc.). Se prefiere un diseño tipo **Tarjetas por Categorías (Option A)**, donde:
1. Cada categoría se presenta en un panel/tarjeta individual.
2. Cada tarjeta muestra un porcentaje de cumplimiento y una barra de progreso visual de esa categoría.
3. Se muestra una tabla al frente de cada categoría con el desglose de sus criterios evaluados, su estatus (Localizado / Faltante / Parcial), el nombre del archivo coincidente (si está presente) y las observaciones.
4. El análisis se realiza de forma puramente determinista sin llamadas a la IA por el momento, para garantizar estabilidad offline y velocidad.

## Estructura de Categorías
El backend (`app/main.py`) agrupa los resultados en las siguientes categorías en base al campo `criterio.tipo` de la base de datos:
* **Autorizaciones** (Requisitos 1 al 5)
* **Adjudicación** (Requisitos 6.1 al 6.3)
* **Licitación** (Requisitos 7 al 9.4)
* **Propuestas** (Requisitos 10 al 11.3)
* **Fallo** (Requisitos 12 al 13.1)
* **Contrato** (Requisitos 14 al 16)
* **Proveedor** (Requisitos 17.1 al 17.10)
* **Trámite de Pago** (Requisitos 18.1 al 18.5)
* **Entrega** (Requisitos 19 al 19.6)
* **Evidencia** (Requisito 20)

## Detalles del Diseño UI (detalle.html)
Se reemplazará el listado plano actual de la pestaña "Auditoría Semántica" por una estructura de tarjetas en cuadrícula/lista usando clases responsivas de Bootstrap 5:
* **Header de Tarjeta**:
  - Título de la categoría (con iconos descriptivos de Bootstrap Icons).
  - Avance del checklist calculado dinámicamente en formato `X / Y Localizados` y barra de progreso animada de Bootstrap (`progress-bar bg-success`).
* **Tabla de Criterios (Checlist)**:
  - Columnas:
    1. **Criterio / Documento Esperado**: Nombre del criterio en negrita y el término de búsqueda de archivo como texto secundario.
    2. **Estatus**: Badge visual según el estado del resultado:
       - `Cumple` -> Badge verde con checkmark: `<span class="badge badge-success"><i class="bi bi-check-circle-fill"></i> Localizado</span>`
       - `No cumple` -> Badge rojo con equis: `<span class="badge badge-danger"><i class="bi bi-x-circle-fill"></i> Faltante</span>`
       - `Cumple parcialmente` -> Badge amarillo: `<span class="badge badge-warning"><i class="bi bi-exclamation-circle-fill"></i> Parcial</span>`
    3. **Detalle / Evidencia**:
       - Si está localizado: Nombre del archivo detectado en color de acento (`text-primary` o `text-indigo`), tipo de archivo e indicación de dónde fue encontrado (e.g. en la raíz o subcarpetas).
       - Si es faltante: Mensaje en rojo indicando que no se identificó el término de búsqueda en la carpeta.

## Pruebas y Validación
* **Prueba manual**: Cargar la pantalla de detalles de un expediente y confirmar la visualización agrupada.
* **Prueba de Reanálisis**: Dar clic en "Reanalizar" y comprobar que todos los estados se actualicen al instante por categorías en base a las búsquedas deterministas.
