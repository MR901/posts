---
layout: page
icon: fas fa-paperclip
order: 4
title: Attachments
---

<link rel="stylesheet" href="{{ '/assets/css/attachments.css' | relative_url }}">

Browse and search through all available attachments organized by category.

<div class="search-wrapper mb-4">
  <input id="attachment-search" type="search" placeholder="Search attachments..." class="form-control" />
</div>

{% assign attachments_base = '/' | append: site.attachments_dir | append: '/' %}
{% assign all_files = site.static_files | where_exp: "file", "file.path contains attachments_base" %}

{% if all_files.size > 0 %}
{% assign images_files = all_files | where_exp: "file", "file.path contains '/images/'" | sort: 'name' %}
{% assign articles_files = all_files | where_exp: "file", "file.path contains '/articles/'" | sort: 'name' %}
{% assign research_files = all_files | where_exp: "file", "file.path contains '/research_papers/'" | sort: 'name' %}

<!-- Tab Navigation -->
<ul class="nav nav-tabs mb-4" id="attachmentTabs" role="tablist">
  {% if images_files.size > 0 %}
  <li class="nav-item" role="presentation">
    <a class="nav-link active" id="images-tab" href="#images-content" role="tab" aria-controls="images-content" aria-selected="true">
      <i class="fas fa-image me-2"></i>Images <span class="badge bg-secondary ms-2">{{ images_files.size }}</span>
    </a>
  </li>
  {% endif %}
  {% if articles_files.size > 0 %}
  <li class="nav-item" role="presentation">
    <a class="nav-link{% unless images_files.size > 0 %} active{% endunless %}" id="articles-tab" href="#articles-content" role="tab" aria-controls="articles-content" aria-selected="{% if images_files.size > 0 %}false{% else %}true{% endif %}">
      <i class="fas fa-file-alt me-2"></i>Articles <span class="badge bg-secondary ms-2">{{ articles_files.size }}</span>
    </a>
  </li>
  {% endif %}
  {% if research_files.size > 0 %}
  <li class="nav-item" role="presentation">
    <a class="nav-link{% unless images_files.size > 0 or articles_files.size > 0 %} active{% endunless %}" id="research-tab" href="#research-content" role="tab" aria-controls="research-content" aria-selected="{% unless images_files.size > 0 or articles_files.size > 0 %}true{% else %}false{% endunless %}">
      <i class="fas fa-graduation-cap me-2"></i>Research <span class="badge bg-secondary ms-2">{{ research_files.size }}</span>
    </a>
  </li>
  {% endif %}
</ul>

<!-- Tab Content -->
<div class="tab-content" id="attachmentTabContent">
  
  {% if images_files.size > 0 %}
  <!-- Images Tab -->
  <div class="tab-pane fade show active" id="images-content" role="tabpanel" aria-labelledby="images-tab">
    <div class="row" id="images-grid">
      {% for file in images_files %}
      {% assign file_path = file.path | replace: site.source, "" %}
      {% assign file_url = file_path | relative_url %}
      <div class="col-sm-6 col-md-4 col-lg-3 mb-3">
        <div class="card h-100 attachment-item" data-search="images {{ file.name }} {{ file.extname }}" data-category="images">
          <div class="card-body p-2 text-center">
            <button type="button" class="btn p-0 mb-2 w-100" onclick="showImageModal('{{ file_url }}', '{{ file.name }}', event)" aria-label="Preview {{ file.name }}">
              <img src="{{ file_path }}" alt="{{ file.name }}" class="img-fluid rounded" style="height: 120px; object-fit: cover; width: 100%;" loading="lazy" />
            </button>
            <h6 class="card-title small mb-1" title="{{ file.name }}">{{ file.name }}</h6>
            <small class="text-muted">{{ file.extname | remove: '.' | upcase }}</small>
          </div>
        </div>
      </div>
      {% endfor %}
    </div>
  </div>
  {% endif %}

  {% if articles_files.size > 0 %}
  <!-- Articles Tab -->
  <div class="tab-pane fade{% unless images_files.size > 0 %} show active{% endunless %}" id="articles-content" role="tabpanel" aria-labelledby="articles-tab">
    <div class="list-group" id="articles-list">
      {% for file in articles_files %}
      {% assign file_path = file.path | replace: site.source, "" %}
      {% assign file_url = file_path | relative_url %}
      <div class="list-group-item attachment-item d-flex justify-content-between align-items-center" data-search="articles {{ file.name }} {{ file.extname }}" data-category="articles">
        <div class="d-flex align-items-center">
          <i class="fas fa-file-pdf text-danger me-3 fs-4"></i>
          <div>
            <h6 class="mb-1">
              <button type="button" class="btn btn-link p-0 text-start" onclick="showPdfModal('{{ file_url }}', '{{ file.name }}', event)">{{ file.name }}</button>
            </h6>
            <small class="attachment-meta">{{ file.extname | remove: '.' | upcase }} file</small>
          </div>
        </div>
        <div class="btn-group" role="group">
          <button type="button" class="btn btn-sm btn-outline-primary" onclick="showPdfModal('{{ file_url }}', '{{ file.name }}', event)">
            <i class="fas fa-eye"></i> Preview
          </button>
          <a href="{{ file_url }}" target="_blank" class="btn btn-sm btn-outline-secondary">
            <i class="fas fa-download"></i> Download
          </a>
        </div>
      </div>
      {% endfor %}
    </div>
  </div>
  {% endif %}

  {% if research_files.size > 0 %}
  <!-- Research Papers Tab -->
  <div class="tab-pane fade{% unless images_files.size > 0 or articles_files.size > 0 %} show active{% endunless %}" id="research-content" role="tabpanel" aria-labelledby="research-tab">
    <div class="list-group" id="research-list">
      {% for file in research_files %}
      {% assign file_path = file.path | replace: site.source, "" %}
      {% assign file_url = file_path | relative_url %}
      <div class="list-group-item attachment-item d-flex justify-content-between align-items-center" data-search="research {{ file.name }} {{ file.extname }}" data-category="research">
        <div class="d-flex align-items-center">
          <i class="fas fa-file-pdf text-success me-3 fs-4"></i>
          <div>
            <h6 class="mb-1">
              <button type="button" class="btn btn-link p-0 text-start" onclick="showPdfModal('{{ file_url }}', '{{ file.name }}', event)">{{ file.name }}</button>
            </h6>
            <small class="attachment-meta">{{ file.extname | remove: '.' | upcase }} file</small>
          </div>
        </div>
        <div class="btn-group" role="group">
          <button type="button" class="btn btn-sm btn-outline-primary" onclick="showPdfModal('{{ file_url }}', '{{ file.name }}', event)">
            <i class="fas fa-eye"></i> Preview
          </button>
          <a href="{{ file_url }}" target="_blank" class="btn btn-sm btn-outline-secondary">
            <i class="fas fa-download"></i> Download
          </a>
        </div>
      </div>
      {% endfor %}
    </div>
  </div>
  {% endif %}

</div>

{% else %}
<div class="alert alert-info" role="alert">
  <i class="fas fa-info-circle me-2"></i>
  No attachments found under <code>{{ site.attachments_dir }}/</code>.
</div>
{% endif %}

<!-- Modal Container -->
<div id="attachment-modal-container"></div>

<script>
// Load attachment data for JavaScript functionality
{% if site.data.attachment_galleries %}
window.attachmentGalleries = {{ site.data.attachment_galleries | jsonify }};
{% else %}
window.attachmentGalleries = {};
{% endif %}

{% if site.data.attachment_references %}
window.attachmentReferences = {{ site.data.attachment_references | jsonify }};
{% else %}
window.attachmentReferences = {};
{% endif %}
</script>
<script defer src="{{ '/assets/js/attachments.js' | relative_url }}"></script>
