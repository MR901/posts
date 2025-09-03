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
      <a class="nav-link active" id="images-tab" data-toggle="tab" href="#images-content" role="tab" aria-controls="images-content" aria-selected="true">
        <i class="fas fa-image mr-2"></i>Images <span class="badge badge-secondary ml-1">{{ images_files.size }}</span>
      </a>
    </li>
    {% endif %}
    {% if articles_files.size > 0 %}
    <li class="nav-item" role="presentation">
      <a class="nav-link{% unless images_files.size > 0 %} active{% endunless %}" id="articles-tab" data-toggle="tab" href="#articles-content" role="tab" aria-controls="articles-content" aria-selected="{% if images_files.size > 0 %}false{% else %}true{% endif %}">
        <i class="fas fa-file-alt mr-2"></i>Articles <span class="badge badge-secondary ml-1">{{ articles_files.size }}</span>
      </a>
    </li>
    {% endif %}
    {% if research_files.size > 0 %}
    <li class="nav-item" role="presentation">
      <a class="nav-link{% unless images_files.size > 0 or articles_files.size > 0 %} active{% endunless %}" id="research-tab" data-toggle="tab" href="#research-content" role="tab" aria-controls="research-content" aria-selected="{% unless images_files.size > 0 or articles_files.size > 0 %}true{% else %}false{% endunless %}">
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
      <div class="col-sm-6 col-md-4 col-lg-3 mb-3">
        <div class="card attachment-item" data-search="images {{ file.name }} {{ file.extname }}" data-category="images">
          <div class="card-body p-2">
            <div class="text-center mb-2">
              <button type="button" class="btn p-0 border-0 bg-transparent" onclick="showImageModal('{{ file_rel }}', '{{ file.name }}', event)">
                <img src="{{ file_rel }}" alt="{{ file.name }}" class="img-fluid rounded attachment-thumbnail" style="max-height: 120px; object-fit: cover; cursor: pointer;" loading="lazy" />
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
<div class="modal fade" id="imageModal" tabindex="-1" aria-labelledby="imageModalLabel" aria-hidden="true" style="display: none;">
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
<div class="modal fade" id="pdfModal" tabindex="-1" aria-labelledby="pdfModalLabel" aria-hidden="true" style="display: none;">
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
  font-weight: 500;
  padding: 12px 20px;
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
  font-size: 0.75em;
}

.attachment-thumbnail:hover {
  transform: scale(1.05);
  transition: transform 0.2s ease;
}

.list-group-item:hover {
  background-color: var(--card-bg);
}

@media (max-width: 768px) {
  .attachment-tabs .nav-link {
    padding: 8px 12px;
    font-size: 0.9em;
  }
  
  .btn-group .btn {
    font-size: 0.8em;
    padding: 0.25rem 0.5rem;
  }
}
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
  // Search functionality
  const searchInput = document.getElementById('attachment-search');

  // Undo theme auto-wrap for modal image (prevents bogus anchors in HTML checks)
  // Ensure modal image container has no auto-wrapped anchor
  (function sanitizeModalImageContainer(){
    var el = document.getElementById('modalImage');
    if (!el) return;
    if (el.tagName && el.tagName.toLowerCase() === 'a') {
      var href = el.getAttribute('href') || '';
      if (!href || href === '/posts/src') {
        var div = document.createElement('div');
        div.id = 'modalImage';
        div.className = 'img-fluid';
        el.replaceWith(div);
      }
    }
  })();
  
  // Vanilla JS tab switching (no Bootstrap JS dependency)
  (function initTabs() {
    var tabLinks = Array.prototype.slice.call(document.querySelectorAll('#attachmentTabs a.nav-link'));
    var panes = Array.prototype.slice.call(document.querySelectorAll('#attachmentTabContent .tab-pane'));
    if (tabLinks.length === 0 || panes.length === 0) return;

    function showPane(targetSelector) {
      var targetPane = targetSelector ? document.querySelector(targetSelector) : null;
      if (!targetPane) return;
      panes.forEach(function(p) {
        p.classList.remove('active', 'show');
      });
      targetPane.classList.add('active', 'show');
    }

    // Initialize display state based on active tab or default to first
    var activeLink = tabLinks.find(function(l){ return l.classList.contains('active'); }) || tabLinks[0];
    tabLinks.forEach(function(l){
      if (l === activeLink) {
        l.classList.add('active');
        l.setAttribute('aria-selected', 'true');
      } else {
        l.classList.remove('active');
        l.setAttribute('aria-selected', 'false');
      }
    });
    // Ensure exactly one pane is visible on load
    panes.forEach(function(p){ p.classList.remove('active','show'); });
    showPane(activeLink ? activeLink.getAttribute('href') : panes[0] ? '#' + panes[0].id : null);

    // Click handlers
    tabLinks.forEach(function(link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        tabLinks.forEach(function(l){
          l.classList.remove('active');
          l.setAttribute('aria-selected', 'false');
        });
        link.classList.add('active');
        link.setAttribute('aria-selected', 'true');
        showPane(link.getAttribute('href'));
      });
    });
  })();
  
  function updateResults() {
    const raw = searchInput.value || '';
    const items = document.querySelectorAll('.attachment-item');

    // Helper: normalize text (case, underscores, hyphens, punctuation, diacritics)
    function normalizeText(s) {
      if (!s) return '';
      try { s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); } catch(e) {}
      return s.toLowerCase()
        .replace(/[_-]+/g, ' ')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    // Tokenize into words
    function tokenize(s) {
      const n = normalizeText(s);
      return n ? n.split(' ').filter(Boolean) : [];
    }

    // Fast edit-distance <= 1 checker
    function editDistanceLTE1(a, b) {
      if (a === b) return true;
      const la = a.length, lb = b.length;
      if (Math.abs(la - lb) > 1) return false;
      let i = 0, j = 0, edits = 0;
      while (i < la && j < lb) {
        if (a[i] === b[j]) { i++; j++; continue; }
        edits++; if (edits > 1) return false;
        if (la > lb) i++; else if (lb > la) j++; else { i++; j++; }
      }
      if ((la - i) + (lb - j) > 0) edits++;
      return edits <= 1;
    }

    function isFuzzyMatch(hayWord, qWord) {
      if (!qWord) return true;
      if (hayWord.indexOf(qWord) !== -1) return true;
      if (qWord.length >= 3 && qWord.indexOf(hayWord) !== -1) return true;
      return editDistanceLTE1(hayWord, qWord);
    }

    function matches(hay, queryRaw) {
      const qTokens = tokenize(queryRaw);
      if (qTokens.length === 0) return true;
      const hTokens = tokenize(hay);
      if (hTokens.length === 0) return false;
      return qTokens.every(function(qt) {
        return hTokens.some(function(hw) { return isFuzzyMatch(hw, qt); });
      });
    }

    items.forEach(function(item) {
      const hay = item.getAttribute('data-search') || '';
      const visible = matches(hay, raw);
      item.style.display = visible ? '' : 'none';
    });

    // Update tab badges with visible counts
    updateTabBadges(raw);
  }
  
  function updateTabBadges(query) {
    const categories = ['images', 'articles', 'research'];
    
    categories.forEach(function(category) {
      const tab = document.getElementById(category + '-tab');
      if (!tab) return;
      
      const items = document.querySelectorAll('.attachment-item[data-category="' + category + '"]');
      let visibleCount = 0;
      
      items.forEach(function(item) {
        if (item.style.display !== 'none') {
          visibleCount++;
        }
      });
      
      const badge = tab.querySelector('.badge');
      if (badge) {
        const totalCount = items.length;
        badge.textContent = query ? visibleCount + '/' + totalCount : totalCount;
        badge.style.opacity = query && visibleCount === 0 ? '0.5' : '1';
      }
    });
  }
  
  if (searchInput) {
    searchInput.addEventListener('input', updateResults);
  }
  
  // Modal functions - make them global
  window.showImageModal = function(src, name, ev) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalLabel = document.getElementById('imageModalLabel');
    const modalDownload = document.getElementById('modalImageDownload');
    
    if (modalImage) {
      modalImage.innerHTML = '';
      var imgEl = document.createElement('img');
      imgEl.src = src;
      imgEl.alt = name || '';
      imgEl.className = 'img-fluid';
      imgEl.loading = 'lazy';
      modalImage.appendChild(imgEl);
    }
    if (modalLabel) modalLabel.textContent = name;
    if (modalDownload) {
      modalDownload.onclick = function(){ window.open(src, '_blank'); };
    }
    // Show the modal (jQuery if available, else vanilla fallback)
    if (typeof $ !== 'undefined') {
      $('#imageModal').modal('show');
    } else {
      openModal('imageModal');
    }
    
    // Prevent default link behavior
    if (ev) ev.preventDefault();
  };
  
  window.showPdfModal = function(src, name, ev) {
    const modal = document.getElementById('pdfModal');
    const modalPdf = document.getElementById('modalPdf');
    const modalLabel = document.getElementById('pdfModalLabel');
    const modalDownload = document.getElementById('modalPdfDownload');
    const pdfFallbackLink = document.getElementById('pdfFallbackLink');
    
    console.log('Opening PDF:', src, 'Name:', name);
    
    // Set modal title and links
    if (modalLabel) modalLabel.textContent = name;
    if (modalDownload) {
      modalDownload.onclick = function(){ window.open(src, '_blank'); };
    }
    if (pdfFallbackLink) {
      pdfFallbackLink.onclick = function(){ window.open(src, '_blank'); };
    }
    
    // Set PDF source using object tag (like the working example)
    if (modalPdf) {
      modalPdf.setAttribute('data', src);
      console.log('Set PDF data attribute to:', src);
    }
    
    // Show the modal (jQuery if available, else vanilla fallback)
    if (typeof $ !== 'undefined') {
      $('#pdfModal').modal('show');
    } else {
      openModal('pdfModal');
    }
    
    // Prevent default link behavior
    if (ev) ev.preventDefault();
  };
});

// Vanilla modal fallback helpers (used when Bootstrap JS/jQuery isn't present)
function openModal(id) {
  var el = document.getElementById(id);
  if (!el) return;
  el.classList.add('show');
  el.style.display = 'block';
  el.removeAttribute('aria-hidden');
  document.body.classList.add('modal-open');
  // backdrop
  var existing = document.querySelector('.modal-backdrop[data-for="' + id + '"]');
  if (!existing) {
    var backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop fade show';
    backdrop.setAttribute('data-for', id);
    backdrop.addEventListener('click', function(){ closeModal(id); });
    document.body.appendChild(backdrop);
  }
}

function closeModal(id) {
  var el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('show');
  el.style.display = 'none';
  el.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  var backdrop = document.querySelector('.modal-backdrop[data-for="' + id + '"]');
  if (backdrop && backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
}

// Wire up close buttons when Bootstrap JS isn't available
if (typeof $ === 'undefined') {
  document.addEventListener('click', function(e){
    var target = e.target;
    if (!target) return;
    // handle <button data-dismiss="modal"> and its child <span>
    var btn = target.closest('[data-dismiss="modal"]');
    if (btn) {
      var modal = btn.closest('.modal');
      if (modal && modal.id) {
        e.preventDefault();
        closeModal(modal.id);
      }
    }
  });
}
</script>
