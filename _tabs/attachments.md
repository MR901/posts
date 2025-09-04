---
layout: page
icon: fas fa-paperclip
order: 4
title: Attachments
---

## Attachments

Browse and search through all available attachments organized by category.

<div class="search-wrapper mb-4">
  <input id="attachment-search" type="search" placeholder="Search attachments..." class="form-control" />
</div>

{% assign all_files = site.static_files | where_exp: "file", "file.path contains '/assets/attachments/'" %}

{% if all_files.size > 0 %}
{% assign images_files = all_files | where_exp: "file", "file.path contains '/assets/attachments/images/'" | sort: 'name' %}
{% assign articles_files = all_files | where_exp: "file", "file.path contains '/assets/attachments/articles/'" | sort: 'name' %}
{% assign research_files = all_files | where_exp: "file", "file.path contains '/assets/attachments/research_papers/'" | sort: 'name' %}

<!-- Horizontal Tab Navigation -->
<div class="attachment-tabs mb-4">
  <ul class="nav nav-tabs" id="attachmentTabs" role="tablist">
    {% if images_files.size > 0 %}
    <li class="nav-item" role="presentation">
      <a class="nav-link active" id="images-tab" href="#images-content" role="tab" aria-controls="images-content" aria-selected="true">
        <i class="fas fa-image"></i>Images <span class="badge badge-secondary">{{ images_files.size }}</span>
      </a>
    </li>
    {% endif %}
    {% if articles_files.size > 0 %}
    <li class="nav-item" role="presentation">
      <a class="nav-link{% unless images_files.size > 0 %} active{% endunless %}" id="articles-tab" href="#articles-content" role="tab" aria-controls="articles-content" aria-selected="{% if images_files.size > 0 %}false{% else %}true{% endif %}">
        <i class="fas fa-file-alt"></i>Articles <span class="badge badge-secondary">{{ articles_files.size }}</span>
      </a>
    </li>
    {% endif %}
    {% if research_files.size > 0 %}
    <li class="nav-item" role="presentation">
      <a class="nav-link{% unless images_files.size > 0 or articles_files.size > 0 %} active{% endunless %}" id="research-tab" href="#research-content" role="tab" aria-controls="research-content" aria-selected="{% unless images_files.size > 0 or articles_files.size > 0 %}true{% else %}false{% endunless %}">
        <i class="fas fa-graduation-cap"></i>Research <span class="badge badge-secondary">{{ research_files.size }}</span>
      </a>
    </li>
    {% endif %}
  </ul>
</div>

<!-- Tab Content -->
<div class="tab-content" id="attachmentTabContent">
  
  {% if images_files.size > 0 %}
  <!-- Images Tab -->
  <div class="tab-pane fade show active" id="images-content" role="tabpanel" aria-labelledby="images-tab">
    <div class="row" id="images-grid">
      {% for file in images_files %}
      {% assign file_abs = file.path | absolute_url %}
      <div class="col-sm-6 col-md-4 col-lg-3 mb-3">
        <div class="card attachment-item" data-search="images {{ file.name }} {{ file.extname }}" data-category="images">
          <div class="card-body p-2">
            <div class="text-center mb-2">
              <button type="button" class="attachment-preview-btn" onclick="showImageModal('{{ file_abs }}', '{{ file.name }}', event)" aria-label="Preview {{ file.name }}">
                <img src="{{ file_abs }}" alt="{{ file.name }}" class="attachment-thumbnail" loading="lazy" />
              </button>
            </div>
            <div class="text-center">
              <small class="attachment-filename" title="{{ file.name }}">{{ file.name }}</small>
              <small class="attachment-type">{{ file.extname | remove: '.' | upcase }}</small>
            </div>
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
      {% assign file_url = file.path | remove_first: site.baseurl | relative_url %}
      <div class="list-group-item attachment-item" data-search="articles {{ file.name }} {{ file.extname }}" data-category="articles">
        <div class="attachment-file-row">
          <div class="attachment-icon">
            <i class="fas fa-file-pdf text-danger"></i>
          </div>
          <div class="attachment-info">
            <h6 class="attachment-title">
              <button type="button" class="attachment-link-btn" onclick="showPdfModal('{{ file_url }}', '{{ file.name }}', event)">{{ file.name }}</button>
            </h6>
            <small class="attachment-meta">{{ file.extname | remove: '.' | upcase }} file</small>
          </div>
          <div class="attachment-actions">
            <button type="button" class="btn btn-sm btn-outline-primary" onclick="showPdfModal('{{ file_url }}', '{{ file.name }}', event)">
              <i class="fas fa-eye"></i>Preview
            </button>
            <a href="{{ file_url }}" target="_blank" class="btn btn-sm btn-outline-secondary">
              <i class="fas fa-download"></i>Download
            </a>
          </div>
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
      {% assign file_url = file.path | remove_first: site.baseurl | relative_url %}
      <div class="list-group-item attachment-item" data-search="research {{ file.name }} {{ file.extname }}" data-category="research">
        <div class="attachment-file-row">
          <div class="attachment-icon">
            <i class="fas fa-file-pdf text-success"></i>
          </div>
          <div class="attachment-info">
            <h6 class="attachment-title">
              <button type="button" class="attachment-link-btn" onclick="showPdfModal('{{ file_url }}', '{{ file.name }}', event)">{{ file.name }}</button>
            </h6>
            <small class="attachment-meta">{{ file.extname | remove: '.' | upcase }} file</small>
          </div>
          <div class="attachment-actions">
            <button type="button" class="btn btn-sm btn-outline-success" onclick="showPdfModal('{{ file_url }}', '{{ file.name }}', event)">
              <i class="fas fa-eye"></i>Preview
            </button>
            <a href="{{ file_url }}" target="_blank" class="btn btn-sm btn-outline-secondary">
              <i class="fas fa-download"></i>Download
            </a>
          </div>
        </div>
      </div>
      {% endfor %}
    </div>
  </div>
  {% endif %}

</div>

{% else %}
<div class="alert alert-info" role="alert">
  <i class="fas fa-info-circle mr-2"></i>
  No attachments found under <code>assets/attachments/</code>.
</div>
{% endif %}

<style>
/* ================================
   ATTACHMENT SYSTEM STYLES
   ================================ */

/* Tab Navigation */
.attachment-tabs .nav-tabs {
  border-bottom: 2px solid var(--border-color);
}

.attachment-tabs .nav-link {
  border: none;
  border-bottom: 3px solid transparent;
  color: var(--text-muted-color);
  font-weight: 600;
  padding: 14px 22px;
  line-height: 1.2;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 1.02rem;
  text-decoration: none;
  transition: all 0.2s ease;
}

.attachment-tabs .nav-link i {
  font-size: 1.05em;
}

.attachment-tabs .nav-link .badge {
  margin-left: 6px;
  padding: 0.25em 0.5em;
  font-size: 0.78em;
  border-radius: 10px;
  background-color: var(--text-muted-color);
}

.attachment-tabs .nav-link.active {
  background-color: transparent;
  border-bottom-color: var(--link-color);
  color: var(--text-color);
}

.attachment-tabs .nav-link:hover {
  background-color: var(--card-bg);
  border-color: transparent;
  color: var(--text-color);
}

/* Tab Content */
#attachmentTabContent > .tab-pane {
  display: none;
}

#attachmentTabContent > .tab-pane.active.show {
  display: block;
}

/* Image Grid */
.attachment-preview-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: block;
  width: 100%;
}

.attachment-preview-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.attachment-thumbnail {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  transition: transform 0.2s ease;
}

.attachment-preview-btn:hover .attachment-thumbnail {
  transform: scale(1.05);
}

.attachment-filename {
  display: block;
  color: var(--text-color);
  font-weight: 500;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.attachment-type {
  color: var(--text-muted-color);
  font-size: 0.85em;
  font-weight: 500;
}

/* File List */
.attachment-file-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
}

.attachment-icon {
  flex-shrink: 0;
}

.attachment-icon i {
  font-size: 2rem;
}

.attachment-info {
  flex: 1;
  min-width: 0;
}

.attachment-title {
  margin: 0 0 4px 0;
  font-size: 1.1rem;
}

.attachment-link-btn {
  background: none;
  border: none;
  color: var(--link-color);
  text-decoration: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  transition: color 0.2s ease;
}

.attachment-link-btn:hover {
  color: var(--link-hover-color);
  text-decoration: underline;
}

.attachment-meta {
  color: var(--text-muted-color);
  font-size: 0.9em;
}

.attachment-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* List Items */
.list-group-item {
  border: 1px solid var(--border-color);
  background-color: var(--card-bg);
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.list-group-item:hover {
  background-color: var(--card-header-bg);
  transform: translateY(-1px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .attachment-tabs .nav-link {
    padding: 10px 14px;
    font-size: 0.95rem;
    gap: 6px;
  }
  
  .attachment-file-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .attachment-actions {
    width: 100%;
    justify-content: stretch;
  }
  
  .attachment-actions .btn {
    flex: 1;
    font-size: 0.85em;
    padding: 0.25rem 0.5rem;
  }
}

@media (max-width: 576px) {
  .attachment-tabs .nav-link {
    padding: 8px 12px;
    font-size: 0.9rem;
  }
  
  .attachment-tabs .nav-link i {
    display: none;
  }
}

/* Focus Management for Accessibility */
.attachment-preview-btn:focus,
.attachment-link-btn:focus {
  outline: 2px solid var(--link-color);
  outline-offset: 2px;
}

/* Loading States */
.attachment-thumbnail[loading] {
  background: var(--card-bg);
  background-image: linear-gradient(45deg, transparent 35%, rgba(255,255,255,0.1) 50%, transparent 65%);
  background-size: 200% 100%;
  animation: loading-shimmer 1.5s infinite;
}

@keyframes loading-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style>

<script defer src="{{ '/assets/js/attachments.js' | relative_url }}"></script>
