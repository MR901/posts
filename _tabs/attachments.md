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
        <i class="fas fa-image mr-2"></i>Images <span class="badge badge-secondary ml-1">{{ images_files.size }}</span>
      </a>
    </li>
    {% endif %}
    {% if articles_files.size > 0 %}
    <li class="nav-item" role="presentation">
      <a class="nav-link{% unless images_files.size > 0 %} active{% endunless %}" id="articles-tab" href="#articles-content" role="tab" aria-controls="articles-content" aria-selected="{% if images_files.size > 0 %}false{% else %}true{% endif %}">
        <i class="fas fa-file-alt mr-2"></i>Articles <span class="badge badge-secondary ml-1">{{ articles_files.size }}</span>
      </a>
    </li>
    {% endif %}
    {% if research_files.size > 0 %}
    <li class="nav-item" role="presentation">
      <a class="nav-link{% unless images_files.size > 0 or articles_files.size > 0 %} active{% endunless %}" id="research-tab" href="#research-content" role="tab" aria-controls="research-content" aria-selected="{% unless images_files.size > 0 or articles_files.size > 0 %}true{% else %}false{% endunless %}">
        <i class="fas fa-graduation-cap mr-2"></i>Research <span class="badge badge-secondary ml-1">{{ research_files.size }}</span>
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
      {% assign file_url = file.path | remove_first: site.baseurl | relative_url %}
      {% assign file_rel = file.path | remove_first: '/' %}
      {% assign file_abs = file.path | absolute_url %}
      <div class="col-sm-6 col-md-4 col-lg-3 mb-3">
        <div class="card attachment-item" data-search="images {{ file.name }} {{ file.extname }}" data-category="images">
          <div class="card-body p-2">
            <div class="text-center mb-2">
              <button type="button" class="btn p-0 border-0 bg-transparent" onclick="showImageModal('{{ file_abs }}', '{{ file.name }}', event)">
                <img src="{{ file_abs }}" alt="{{ file.name }}" class="img-fluid rounded attachment-thumbnail no-lightbox" style="max-height: 120px; object-fit: cover; cursor: pointer;" loading="lazy" />
              </button>
            </div>
            <div class="text-center">
              <small class="text-muted d-block text-truncate" title="{{ file.name }}">{{ file.name }}</small>
              <small class="text-muted">{{ file.extname | remove: '.' | upcase }}</small>
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
        <div class="d-flex align-items-center">
          <i class="fas fa-file-pdf text-danger mr-3" style="font-size: 1.5rem;"></i>
          <div class="flex-grow-1">
            <h6 class="mb-1">
              <button type="button" class="btn btn-link text-decoration-none p-0" onclick="showPdfModal('{{ file_url }}', '{{ file.name }}', event)">{{ file.name }}</button>
            </h6>
            <small class="text-muted">{{ file.extname | remove: '.' | upcase }} file</small>
          </div>
          <div class="btn-group" role="group">
            <button type="button" class="btn btn-sm btn-outline-primary" onclick="showPdfModal('{{ file_url }}', '{{ file.name }}', event)">
              <i class="fas fa-eye mr-1"></i>Preview
            </button>
            <a href="{{ file_url }}" target="_blank" class="btn btn-sm btn-outline-secondary">
              <i class="fas fa-download mr-1"></i>Download
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
        <div class="d-flex align-items-center">
          <i class="fas fa-file-pdf text-success mr-3" style="font-size: 1.5rem;"></i>
          <div class="flex-grow-1">
            <h6 class="mb-1">
              <button type="button" class="btn btn-link text-decoration-none p-0" onclick="showPdfModal('{{ file_url }}', '{{ file.name }}', event)">{{ file.name }}</button>
            </h6>
            <small class="text-muted">{{ file.extname | remove: '.' | upcase }} file</small>
          </div>
          <div class="btn-group" role="group">
            <button type="button" class="btn btn-sm btn-outline-success" onclick="showPdfModal('{{ file_url }}', '{{ file.name }}', event)">
              <i class="fas fa-eye mr-1"></i>Preview
            </button>
            <a href="{{ file_url }}" target="_blank" class="btn btn-sm btn-outline-secondary">
              <i class="fas fa-download mr-1"></i>Download
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

<!-- Image Modal -->
<div class="modal fade" id="imageModal" tabindex="-1" aria-labelledby="imageModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="imageModalLabel">Image Preview</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body text-center">
        <div id="modalImage" class="img-fluid"></div>
      </div>
      <div class="modal-footer">
        <button id="modalImageDownload" type="button" class="btn btn-primary">
          <i class="fas fa-download mr-1"></i>Download
        </button>
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>

<!-- PDF Modal -->
<div class="modal fade" id="pdfModal" tabindex="-1" aria-labelledby="pdfModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-xl modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="pdfModalLabel">PDF Preview</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
              <div class="modal-body p-1" style="height: 70vh;">
          <object id="modalPdf" data="" width="100%" height="100%" type="application/pdf" style="min-height: 500px;">
            <div class="p-4 text-center">
              <i class="fas fa-file-pdf text-muted mb-3" style="font-size: 3rem;"></i>
              <p class="mb-3">PDF preview unavailable in this browser.</p>
              <button id="pdfFallbackLink" type="button" class="btn btn-primary">
                <i class="fas fa-external-link-alt mr-2"></i>Open PDF in New Tab
              </button>
            </div>
          </object>
        </div>
      <div class="modal-footer">
        <button id="modalPdfDownload" type="button" class="btn btn-primary">
          <i class="fas fa-external-link-alt mr-1"></i>Open in New Tab
        </button>
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>

<style>
#attachmentTabContent > .tab-pane { display: none !important; }
#attachmentTabContent > .tab-pane.active.show { display: block !important; }
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
}

.attachment-tabs .nav-link i {
  font-size: 1.05em;
}

.attachment-tabs .nav-link .badge {
  margin-left: 6px;
  padding: 0.25em 0.5em;
  font-size: 0.78em;
  border-radius: 10px;
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

.attachment-tabs .badge {
  background-color: var(--text-muted-color);
}

.attachment-thumbnail:hover {
  transform: scale(1.05);
  transition: transform 0.2s ease;
}

.list-group-item:hover {
  background-color: var(--card-bg);
}

/* Prevent theme lightbox from interfering */
.attachment-item .no-lightbox {
  pointer-events: auto !important;
}

.attachment-item button[onclick] {
  position: relative;
  z-index: 10;
}

/* Override theme's automatic image wrapping */
.attachment-item .popup.img-link {
  pointer-events: none !important;
  cursor: default !important;
}

/* Ensure modals overlay theme panels on Pages */
.modal,
.modal-backdrop {
  z-index: 2000 !important;
}

@media (max-width: 768px) {
  .attachment-tabs .nav-link {
    padding: 10px 14px;
    font-size: 0.95rem;
    gap: 6px;
  }
  
  .btn-group .btn {
    font-size: 0.85em;
    padding: 0.25rem 0.5rem;
  }
}
</style>

<script defer src="{{ '/assets/js/attachments.js' | relative_url }}"></script>
