# Visual Categorization Checklist Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modify the detail view template (`detalle.html`) to group and display the audit results visually by category in a cards-based grid layout (Option A).

**Architecture:** Use Jinja2 looping to iterate over the `grouped_results` passed by the FastAPI router. Within each category card, dynamically compute progress (percentage of localized items) and render the checklist items in a table layout with appropriate icons, badges, and matching file details.

**Tech Stack:** FastAPI, Jinja2, Bootstrap 5 CSS, Bootstrap Icons.

---

### Task 1: Update the Detail Template UI Layout

**Files:**
- Modify: `auditor-expedientes/app/templates/detalle.html:80-124`

- [ ] **Step 1: Replace the flat loop with a categorized grouped results card layout**

Replace the current template loop for `resultados` with a loop over `grouped_results.items()`. Add logic to count complied items (`r.estado == 'Cumple'`) and calculate the percentage of compliance dynamically for each category card. Add a Bootstrap 5 table for checklist items within each card.

```html
    <div class="row g-3">
      {% if not grouped_results %}
      <div class="col-12">
        <div class="glass-panel text-center py-5">
          <i class="bi bi-clipboard-x display-3 text-muted"></i>
          <h5 class="fw-bold mt-3">Sin resultados de auditoría</h5>
          <p class="text-muted">Presiona el botón **Reanalizar** arriba a la derecha para iniciar la auditoría semántica sobre este expediente.</p>
        </div>
      </div>
      {% else %}
        {% for category, results in grouped_results.items() %}
        {% set total_items = results|length %}
        {% set complies = namespace(count=0) %}
        {% for r in results %}
          {% if r.estado == 'Cumple' %}
            {% set complies.count = complies.count + 1 %}
          {% endif %}
        {% endfor %}
        {% set percent = (complies.count / total_items * 100)|round|int if total_items > 0 else 0 %}
        
        <div class="col-12 mb-4">
          <div class="glass-panel-solid shadow-sm">
            <!-- Header de Categoría -->
            <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <div class="d-flex align-items-center gap-2">
                <span class="fs-4">
                  {% if category == 'Autorizaciones' %}📋
                  {% elif category == 'Adjudicación' %}🤝
                  {% elif category == 'Licitación' %}📢
                  {% elif category == 'Propuestas' %}📂
                  {% elif category == 'Fallo' %}⚖️
                  {% elif category == 'Contrato' %}✍️
                  {% elif category == 'Proveedor' %}👤
                  {% elif category == 'Trámite de Pago' %}💳
                  {% elif category == 'Entrega' %}📦
                  {% elif category == 'Evidencia' %}🔍
                  {% else %}📝{% endif %}
                </span>
                <h5 class="fw-bold m-0 text-dark-emphasis">{{ category }}</h5>
              </div>
              <div class="d-flex align-items-center gap-3">
                <div class="progress" style="width: 100px; height: 8px;">
                  <div class="progress-bar {% if percent == 100 %}bg-success{% elif percent >= 50 %}bg-warning{% else %}bg-danger{% endif %}" role="progressbar" style="width: {{ percent }}%;" aria-valuenow="{{ percent }}" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
                <span class="small fw-bold {% if percent == 100 %}text-success{% elif percent >= 50 %}text-warning{% else %}text-danger{% endif %}">{{ percent }}% ({{ complies.count }}/{{ total_items }})</span>
              </div>
            </div>
            
            <!-- Tabla de checklist -->
            <div class="table-responsive">
              <table class="table align-middle table-hover m-0">
                <thead>
                  <tr class="table-light">
                    <th style="width: 45%;">Criterio / Documento Esperado</th>
                    <th style="width: 15%; text-align: center;">Estatus</th>
                    <th style="width: 40%;">Archivo Identificado / Observación</th>
                  </tr>
                </thead>
                <tbody>
                  {% for r in results %}
                  <tr>
                    <td>
                      <div class="fw-bold text-dark-emphasis" style="font-size: 0.9rem;">{{ r.criterio.criterio }}</div>
                      <div class="text-muted small mt-1">Palabra clave: <code class="bg-light px-1 rounded">{{ r.criterio.documento_esperado }}</code></div>
                    </td>
                    <td class="text-center">
                      {% if r.estado == 'Cumple' %}
                      <span class="badge badge-success d-inline-flex align-items-center gap-1"><i class="bi bi-check-circle-fill"></i> Localizado</span>
                      {% elif r.estado == 'Cumple parcialmente' %}
                      <span class="badge badge-warning d-inline-flex align-items-center gap-1"><i class="bi bi-exclamation-circle-fill"></i> Parcial</span>
                      {% else %}
                      <span class="badge badge-danger d-inline-flex align-items-center gap-1"><i class="bi bi-x-circle-fill"></i> Faltante</span>
                      {% endif %}
                    </td>
                    <td>
                      {% if r.estado == 'Cumple' or r.estado == 'Cumple parcialmente' %}
                        {% if r.evidencia_documento %}
                        <div class="fw-bold text-primary"><i class="bi bi-file-earmark-text"></i> {{ r.evidencia_documento }}</div>
                        <div class="text-muted small mt-1">{{ r.observacion }}</div>
                        {% else %}
                        <div class="text-muted small">{{ r.observacion }}</div>
                        {% endif %}
                      {% else %}
                        <div class="text-danger small"><i class="bi bi-x-circle"></i> {{ r.observacion }}</div>
                      {% endif %}
                    </td>
                  </tr>
                  {% endfor %}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {% endfor %}
      {% endif %}
    </div>
```

- [ ] **Step 2: Commit template changes**

Commit the modified template to git:
```bash
git add auditor-expedientes/app/templates/detalle.html
git commit -m "feat: implement grouped visual checklist by categories in detail view"
```

---

### Task 2: Verify Checklist Layout Locally

- [ ] **Step 1: Open detail view for an audited folder**
Access `http://127.0.0.1:8000/expediente/1` in the browser. Confirm that the cards are rendered correctly, show accurate progress percentages, and list the 49 criteria divided into their respective categories.

- [ ] **Step 2: Run a re-analysis**
Click on **Reanalizar** and verify that the audit runs instantly using the deterministic keyword service and re-renders the visual checklist cards accurately.
