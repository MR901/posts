/**
 * Bulletproof Attachment System
 * Theme-agnostic, environment-consistent modal implementation
 */

(function () {
  'use strict';

  // Global state management
  var state = {
    currentModal: null,
    searchInput: null,
    initialized: false,
    gallery: {
      items: [],
      currentIndex: -1,
      category: null,
      isGalleryMode: false,
    },
  };

  // Configuration
  var config = {
    modalZIndex: 9999,
    backdropZIndex: 9998,
    animationDuration: 300,
  };

  /**
   * Initialize the attachment system
   */
  function init() {
    if (state.initialized) return;

    // Cache DOM elements
    state.searchInput = document.getElementById('attachment-search');

    // Initialize components
    initTabs();
    initSearch();
    initModals();

    // Clean up any theme interference aggressively
    runPeriodicCleanup();

    state.initialized = true;
  }

  /**
   * Tab Management System
   */
  function initTabs() {
    var tabLinks = document.querySelectorAll('#attachmentTabs a.nav-link');
    var tabPanes = document.querySelectorAll('#attachmentTabContent .tab-pane');

    if (!tabLinks.length || !tabPanes.length) return;

    // Set initial state
    setInitialTabState(tabLinks, tabPanes);

    // Add click handlers
    Array.prototype.forEach.call(tabLinks, function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        var targetId = this.getAttribute('href').substring(1);
        activateTab(this, targetId, tabLinks, tabPanes);

        // Update URL hash without scrolling
        updateHash(this.getAttribute('href'));
      });
    });

    // Handle hash changes
    window.addEventListener('hashchange', function () {
      handleHashChange(tabLinks, tabPanes);
    });
  }

  function setInitialTabState(tabLinks, tabPanes) {
    // Hide all panes first
    Array.prototype.forEach.call(tabPanes, function (pane) {
      pane.classList.remove('active', 'show');
      pane.style.display = 'none';
    });

    // Check for hash or activate first tab
    var hash = window.location.hash;
    var activeLink = null;

    if (hash) {
      activeLink = document.querySelector('a[href="' + hash + '"]');
    }

    if (!activeLink) {
      activeLink = tabLinks[0];
    }

    if (activeLink) {
      var targetId = activeLink.getAttribute('href').substring(1);
      activateTab(activeLink, targetId, tabLinks, tabPanes);
    }
  }

  function activateTab(activeLink, targetId, tabLinks, tabPanes) {
    // Update tab links
    Array.prototype.forEach.call(tabLinks, function (link) {
      link.classList.remove('active');
      link.setAttribute('aria-selected', 'false');
    });
    activeLink.classList.add('active');
    activeLink.setAttribute('aria-selected', 'true');

    // Update tab panes
    Array.prototype.forEach.call(tabPanes, function (pane) {
      pane.classList.remove('active', 'show');
      pane.style.display = 'none';
    });

    var targetPane = document.getElementById(targetId);
    if (targetPane) {
      targetPane.classList.add('active', 'show');
      targetPane.style.display = 'block';
    }
  }

  function handleHashChange(tabLinks, tabPanes) {
    var hash = window.location.hash;
    if (!hash) return;

    var targetLink = document.querySelector('a[href="' + hash + '"]');
    if (targetLink) {
      var targetId = hash.substring(1);
      activateTab(targetLink, targetId, tabLinks, tabPanes);
    }
  }

  function updateHash(hash) {
    if (history && history.replaceState) {
      history.replaceState(null, '', hash);
    } else {
      window.location.hash = hash;
    }
  }

  /**
   * Search System with Advanced Fuzzy Matching
   */
  function initSearch() {
    if (!state.searchInput) return;

    state.searchInput.addEventListener('input', performSearch);
  }

  function performSearch() {
    var query = state.searchInput.value.toLowerCase().trim();
    var items = document.querySelectorAll('.attachment-item');

    Array.prototype.forEach.call(items, function (item) {
      var searchData = item.getAttribute('data-search') || '';
      var isVisible =
        query === '' || fuzzyMatch(searchData.toLowerCase(), query);

      item.style.display = isVisible ? '' : 'none';
    });

    updateTabBadges(query);
  }

  function fuzzyMatch(haystack, needle) {
    if (!needle) return true;

    var haystackWords = haystack.split(/\s+/);
    var needleWords = needle.split(/\s+/);

    return needleWords.every(function (needleWord) {
      return haystackWords.some(function (haystackWord) {
        return (
          haystackWord.indexOf(needleWord) !== -1 ||
          editDistance(haystackWord, needleWord) <= 1
        );
      });
    });
  }

  function editDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    if (Math.abs(a.length - b.length) > 1) return 2; // Early exit for performance

    var matrix = [];
    for (var i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (var j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (i = 1; i <= b.length; i++) {
      for (j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  function updateTabBadges(query) {
    // Get categories dynamically from gallery data
    var galleries = window.attachmentGalleries || {};
    var categories = Object.keys(galleries);
    categories.forEach(function (category) {
      var tab = document.getElementById(category + '-tab');
      if (!tab) return;

      var items = document.querySelectorAll(
        '.attachment-item[data-category="' + category + '"]'
      );
      var totalCount = items.length;
      var visibleCount = 0;

      Array.prototype.forEach.call(items, function (item) {
        if (item.style.display !== 'none') {
          visibleCount++;
        }
      });

      var badge = tab.querySelector('.badge');
      if (badge) {
        badge.textContent = query
          ? visibleCount + '/' + totalCount
          : totalCount;
        badge.style.opacity = query && visibleCount === 0 ? '0.5' : '1';
      }
    });
  }

  /**
   * Pure Modal System - No Bootstrap Dependency
   */
  function initModals() {
    // Create modal container if it doesn't exist
    createModalContainer();

    // Set up global modal functions
    window.showImageModal = showImageModal;
    window.showPdfModal = showPdfModal;
  }

  function createModalContainer() {
    var container = document.getElementById('attachment-modal-container');
    if (container) return;

    container = document.createElement('div');
    container.id = 'attachment-modal-container';
    container.style.cssText = [
      'position: fixed',
      'top: 0',
      'left: 0',
      'width: 100%',
      'height: 100%',
      'z-index: ' + config.modalZIndex,
      'display: none',
      'background: rgba(0, 0, 0, 0.8)',
      'backdrop-filter: blur(2px)',
      'opacity: 0',
      'transition: opacity ' + config.animationDuration + 'ms ease',
      'padding: 20px',
      'box-sizing: border-box',
    ].join(';');

    // Close on backdrop click
    container.addEventListener('click', function (e) {
      if (e.target === container) {
        closeModal();
      }
    });

    document.body.appendChild(container);
  }

  function showImageModal(src, name, event) {
    if (event) event.preventDefault();

    // Initialize gallery state for images
    initializeGallery('images', src);

    var modalContent = createImageModalContent(src, name);
    openModal(modalContent);
  }

  function showPdfModal(src, name, event) {
    if (event) event.preventDefault();

    // Initialize gallery state for PDFs using dynamic category detection
    initializePdfGallery(src);

    var modalContent = createPdfModalContent(src, name);
    openModal(modalContent);
  }
  // More robust PDF gallery initialization: find by filename across all categories
  function initializePdfGallery(currentSrc) {
    var galleries = window.attachmentGalleries || {};
    var filename = '';
    try {
      filename = currentSrc.split('/').pop();
    } catch (e) {}

    var matchedCategory = null;
    var matchedIndex = -1;

    Object.keys(galleries).forEach(function (category) {
      var items = galleries[category] || [];
      for (var i = 0; i < items.length; i++) {
        if (items[i].filename === filename) {
          matchedCategory = category;
          matchedIndex = i;
          break;
        }
      }
    });

    if (matchedCategory != null && matchedIndex >= 0) {
      state.gallery = {
        items: galleries[matchedCategory] || [],
        currentIndex: matchedIndex,
        category: matchedCategory,
        isGalleryMode: true,
      };
      return true;
    }

    // Fallback to default logic if not found
    return (
      initializeGallery('articles', currentSrc) ||
      initializeGallery('research', currentSrc)
    );
  }

  function createImageModalContent(src, name) {
    var content = document.createElement('div');
    content.className = 'modal-content-wrapper';
    content.style.cssText = [
      'position: relative',
      'width: 90vw',
      'height: 85vh',
      'max-width: 1200px',
      'margin: 0 auto',
      'background: white',
      'border-radius: 8px',
      'overflow: hidden',
      'box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3)',
      'display: flex',
      'flex-direction: column',
    ].join(';');

    // Build navigation controls
    var navControls = '';
    var galleryCounter = '';
    if (state.gallery.isGalleryMode && state.gallery.items.length > 1) {
      navControls = [
        '<button type="button" class="gallery-nav gallery-prev" style="position: absolute; left: 20px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 18px; z-index: 10;" aria-label="Previous">&larr;</button>',
        '<button type="button" class="gallery-nav gallery-next" style="position: absolute; right: 20px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 18px; z-index: 10;" aria-label="Next">&rarr;</button>',
      ].join('');

      galleryCounter =
        '<span class="gallery-counter" style="color: #6c757d; font-size: 0.9em;">' +
        (state.gallery.currentIndex + 1) +
        ' / ' +
        state.gallery.items.length +
        '</span>';
    }

    content.innerHTML = [
      '<div class="modal-header" style="padding: 15px 20px; border-bottom: 1px solid #dee2e6; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">',
      '<div style="display: flex; flex-direction: column; align-items: flex-start;">',
      '<h5 class="modal-title" style="margin: 0; font-size: 1.25rem; color: #212529;">' +
        escapeHtml(name) +
        '</h5>',
      galleryCounter,
      '</div>',
      '<div style="display: flex; align-items: center; gap: 10px;">',
      '<button type="button" class="modal-download" style="background: none; border: none; font-size: 20px; cursor: pointer; padding: 8px; color: #6c757d; border-radius: 4px; transition: background-color 0.2s;" aria-label="Download" title="Download">',
      '<i class="fas fa-download"></i>',
      '</button>',
      '<button type="button" class="modal-close" style="background: none; border: none; font-size: 24px; cursor: pointer; padding: 8px; color: #6c757d; border-radius: 4px; transition: background-color 0.2s;" aria-label="Close" title="Close">&times;</button>',
      '</div>',
      '</div>',
      '<div class="modal-body" style="padding: 0; text-align: center; flex: 1; overflow: auto; position: relative; display: flex; align-items: center; justify-content: center; min-height: 0;">',
      navControls,
      '<img src="' +
        escapeHtml(src) +
        '" alt="' +
        escapeHtml(name) +
        "\" style=\"max-width: 100%; max-height: 100%; object-fit: contain; display: block; margin: auto;\" loading=\"lazy\" onerror=\"this.style.display='none'; this.parentNode.innerHTML+='<div style=\\'padding: 40px; text-align: center; color: #6c757d; background: #f8f9fa;\\'><i class=\\'fas fa-image\\' style=\\'font-size: 2rem; margin-bottom: 10px; display: block;\\'></i>Image not found<br><small>" +
        escapeHtml(name) +
        '</small></div>\'" />',
      '</div>',
      '<div class="references-panel" style="padding: 15px 20px; border-top: 1px solid #dee2e6; height: 120px; min-height: 120px; overflow-y: auto; background-color: #f8f9fa; flex-shrink: 0;">',
      '<div class="references-loading">Loading references...</div>',
      '</div>',
    ].join('');

    // Add event listeners
    var closeButtons = content.querySelectorAll('.modal-close');
    Array.prototype.forEach.call(closeButtons, function (btn) {
      btn.addEventListener('click', closeModal);
      // Add hover effects
      btn.addEventListener('mouseenter', function () {
        this.style.backgroundColor = '#f8f9fa';
      });
      btn.addEventListener('mouseleave', function () {
        this.style.backgroundColor = 'transparent';
      });
    });

    var downloadButton = content.querySelector('.modal-download');
    if (downloadButton) {
      downloadButton.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        window.open(src, '_blank');
      });
      // Add hover effects
      downloadButton.addEventListener('mouseenter', function () {
        this.style.backgroundColor = '#f8f9fa';
      });
      downloadButton.addEventListener('mouseleave', function () {
        this.style.backgroundColor = 'transparent';
      });
    }

    // Add navigation event listeners
    var prevButton = content.querySelector('.gallery-prev');
    var nextButton = content.querySelector('.gallery-next');

    if (prevButton) {
      prevButton.addEventListener('click', function () {
        navigateGallery(-1);
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        navigateGallery(1);
      });
    }

    // Load references data
    var referencesPanel = content.querySelector('.references-panel');
    if (referencesPanel) {
      loadReferences(referencesPanel, name);
    }

    return content;
  }

  function createPdfModalContent(src, name) {
    var content = document.createElement('div');
    content.className = 'modal-content-wrapper';
    content.style.cssText = [
      'position: relative',
      'width: 90vw',
      'height: 85vh',
      'max-width: 1200px',
      'margin: 0 auto',
      'background: white',
      'border-radius: 8px',
      'overflow: hidden',
      'box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3)',
      'display: flex',
      'flex-direction: column',
    ].join(';');

    // Build navigation controls and counter (same as images)
    var navControls = '';
    var galleryCounter = '';
    if (state.gallery.isGalleryMode && state.gallery.items.length > 1) {
      navControls = [
        '<button type="button" class="gallery-nav gallery-prev" style="position: absolute; left: 20px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 18px; z-index: 10;" aria-label="Previous">&larr;</button>',
        '<button type="button" class="gallery-nav gallery-next" style="position: absolute; right: 20px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 18px; z-index: 10;" aria-label="Next">&rarr;</button>',
      ].join('');

      galleryCounter =
        '<span class="gallery-counter" style="color: #6c757d; font-size: 0.9em;">' +
        (state.gallery.currentIndex + 1) +
        ' / ' +
        state.gallery.items.length +
        '</span>';
    }

    content.innerHTML = [
      '<div class="modal-header" style="padding: 15px 20px; border-bottom: 1px solid #dee2e6; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">',
      '<div style="display: flex; flex-direction: column; align-items: flex-start;">',
      '<h5 class="modal-title" style="margin: 0; font-size: 1.25rem; color: #212529;">' +
        escapeHtml(name) +
        '</h5>',
      galleryCounter,
      '</div>',
      '<div style="display: flex; align-items: center; gap: 10px;">',
      '<button type="button" class="modal-download" style="background: none; border: none; font-size: 20px; cursor: pointer; padding: 8px; color: #6c757d; border-radius: 4px; transition: background-color 0.2s;" aria-label="Download" title="Download">',
      '<i class="fas fa-download"></i>',
      '</button>',
      '<button type="button" class="modal-close" style="background: none; border: none; font-size: 24px; cursor: pointer; padding: 8px; color: #6c757d; border-radius: 4px; transition: background-color 0.2s;" aria-label="Close" title="Close">&times;</button>',
      '</div>',
      '</div>',
      '<div class="modal-body" style="padding: 0; text-align: center; flex: 1; overflow: auto; position: relative; display: flex; align-items: center; justify-content: center; min-height: 0;">',
      navControls,
      '<object data="' +
        escapeHtml(src) +
        '" type="application/pdf" style="width: 100%; height: 100%;">',
      '<div style="padding: 40px; text-align: center; color: #6c757d;">',
      '<i class="fas fa-file-pdf" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>',
      '<p style="margin-bottom: 16px;">PDF preview unavailable in this browser.</p>',
      '<button type="button" class="btn btn-primary pdf-fallback" style="background-color: #007bff; color: white; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer;">',
      '<i class="fas fa-external-link-alt" style="margin-right: 8px;"></i>Open PDF in New Tab',
      '</button>',
      '</div>',
      '</object>',
      '</div>',
      '<div class="references-panel" style="padding: 15px 20px; border-top: 1px solid #dee2e6; height: 120px; min-height: 120px; overflow-y: auto; background-color: #f8f9fa; flex-shrink: 0;">',
      '<div class="references-loading">Loading references...</div>',
      '</div>',
    ].join('');

    // Add event listeners
    var closeButtons = content.querySelectorAll('.modal-close');
    Array.prototype.forEach.call(closeButtons, function (btn) {
      btn.addEventListener('click', closeModal);
    });

    var downloadButton = content.querySelector('.modal-download');
    var fallbackButton = content.querySelector('.pdf-fallback');

    if (downloadButton) {
      downloadButton.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        window.open(src, '_blank');
      });
      downloadButton.addEventListener('mouseenter', function () {
        this.style.backgroundColor = '#f8f9fa';
      });
      downloadButton.addEventListener('mouseleave', function () {
        this.style.backgroundColor = 'transparent';
      });
    }

    if (fallbackButton) {
      fallbackButton.addEventListener('click', function () {
        window.open(src, '_blank');
      });
    }

    // Load references
    var referencesPanel = content.querySelector('.references-panel');
    if (referencesPanel) {
      loadReferences(referencesPanel, name);
    }

    // Add navigation event listeners for PDFs
    var prevButton = content.querySelector('.gallery-prev');
    var nextButton = content.querySelector('.gallery-next');
    if (prevButton) {
      prevButton.addEventListener('click', function () {
        navigateGallery(-1);
      });
    }
    if (nextButton) {
      nextButton.addEventListener('click', function () {
        navigateGallery(1);
      });
    }

    return content;
  }

  function openModal(content) {
    var container = document.getElementById('attachment-modal-container');
    if (!container) return;

    // Clear previous content
    container.innerHTML = '';
    container.appendChild(content);

    // Show modal with animation
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.padding = '0';

    // Trigger animation
    setTimeout(function () {
      container.style.opacity = '1';
    }, 10);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Focus management for accessibility
    var firstFocusable = content.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (firstFocusable) {
      firstFocusable.focus();
    }

    // Keyboard handling
    document.addEventListener('keydown', handleModalKeydown);

    state.currentModal = container;
  }

  function closeModal() {
    var container =
      state.currentModal ||
      document.getElementById('attachment-modal-container');
    if (!container) return;

    // Animate out
    container.style.opacity = '0';

    setTimeout(function () {
      container.style.display = 'none';
      container.innerHTML = '';
    }, config.animationDuration);

    // Restore body scroll
    document.body.style.overflow = '';

    // Remove keyboard handler
    document.removeEventListener('keydown', handleModalKeydown);

    state.currentModal = null;
  }

  function handleModalKeydown(e) {
    if (e.key === 'Escape') {
      closeModal();
    } else if (e.key === 'ArrowLeft') {
      navigateGallery(-1);
    } else if (e.key === 'ArrowRight') {
      navigateGallery(1);
    } else if (e.key === 'Home') {
      jumpToGalleryItem(0);
    } else if (e.key === 'End') {
      jumpToGalleryItem(state.gallery.items.length - 1);
    }
  }

  function jumpToGalleryItem(index) {
    if (!state.gallery.isGalleryMode || !state.gallery.items.length) return;
    if (index < 0 || index >= state.gallery.items.length) return;

    var item = state.gallery.items[index];
    state.gallery.currentIndex = index;

    if (state.gallery.category === 'images') {
      updateImageModal(item);
    } else {
      updatePdfModal(item);
    }
  }

  /**
   * References System
   */
  function loadReferences(panel, filename) {
    // Get references data from Jekyll
    var references = window.attachmentReferences || {};
    var fileRefs = references[filename];

    if (!fileRefs || (!fileRefs.posts.length && !fileRefs.pages.length)) {
      panel.innerHTML =
        '<div style="color: #6c757d; font-style: italic;">This attachment isn\'t referenced in any posts or pages yet.</div>';
      return;
    }

    var html = [
      '<div style="font-weight: 600; margin-bottom: 10px; color: #212529;"><i class="fas fa-link" style="margin-right: 8px;"></i>Referenced in:</div>',
    ];

    // Add post references
    if (fileRefs.posts && fileRefs.posts.length > 0) {
      fileRefs.posts.forEach(function (post) {
        html.push(
          '<div style="margin-bottom: 6px;">',
          '<a href="' +
            escapeHtml(post.url) +
            '" style="color: #007bff; text-decoration: none; font-weight: 500;">',
          '<i class="fas fa-file-alt" style="margin-right: 6px; color: #6c757d;"></i>',
          escapeHtml(post.title),
          '</a>',
          post.date
            ? '<span style="color: #6c757d; font-size: 0.85em; margin-left: 8px;">(' +
                post.date +
                ')</span>'
            : '',
          '</div>'
        );
      });
    }

    // Add page references
    if (fileRefs.pages && fileRefs.pages.length > 0) {
      fileRefs.pages.forEach(function (page) {
        html.push(
          '<div style="margin-bottom: 6px;">',
          '<a href="' +
            escapeHtml(page.url) +
            '" style="color: #007bff; text-decoration: none; font-weight: 500;">',
          '<i class="fas fa-file" style="margin-right: 6px; color: #6c757d;"></i>',
          escapeHtml(page.title),
          '</a>',
          '</div>'
        );
      });
    }

    // Add total count
    var totalRefs =
      (fileRefs.posts || []).length + (fileRefs.pages || []).length;
    if (totalRefs > 1) {
      html.push(
        '<div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 0.85em;">Total: ' +
          totalRefs +
          ' reference' +
          (totalRefs === 1 ? '' : 's') +
          '</div>'
      );
    }

    panel.innerHTML = html.join('');
  }

  function updateReferencesPanel(panel, filename) {
    loadReferences(panel, filename);
  }

  /**
   * Gallery Navigation System
   */
  function initializeGallery(category, currentSrc) {
    // Get gallery data from Jekyll
    var galleries = window.attachmentGalleries || {};
    var items = galleries[category] || [];

    if (!items.length) return false;

    // Find current item index
    var currentIndex = -1;
    for (var i = 0; i < items.length; i++) {
      if (currentSrc.indexOf(items[i].filename) !== -1) {
        currentIndex = i;
        break;
      }
    }

    if (currentIndex === -1) return false;

    // Update gallery state
    state.gallery = {
      items: items,
      currentIndex: currentIndex,
      category: category,
      isGalleryMode: true,
    };

    return true;
  }

  function navigateGallery(direction) {
    if (!state.gallery.isGalleryMode || !state.gallery.items.length) return;

    var newIndex = state.gallery.currentIndex + direction;

    // Wrap around
    if (newIndex >= state.gallery.items.length) {
      newIndex = 0;
    } else if (newIndex < 0) {
      newIndex = state.gallery.items.length - 1;
    }

    var newItem = state.gallery.items[newIndex];
    state.gallery.currentIndex = newIndex;

    // Update modal content
    if (state.gallery.category === 'images') {
      updateImageModal(newItem);
    } else {
      updatePdfModal(newItem);
    }
  }

  function updateImageModal(item) {
    var container = state.currentModal;
    if (!container) return;

    var img = container.querySelector('.modal-body img');
    var title = container.querySelector('.modal-title');
    var downloadBtn = container.querySelector('.modal-download');
    var counter = container.querySelector('.gallery-counter');
    var referencesPanel = container.querySelector('.references-panel');

    if (img) {
      img.src = item.absolute_url || item.url;
      img.alt = item.name;

      // Add error handling for broken images
      img.onerror = function () {
        this.style.display = 'none';
        var errorDiv = document.createElement('div');
        errorDiv.style.cssText =
          'padding: 40px; text-align: center; color: #6c757d; background: #f8f9fa; border-radius: 4px;';
        errorDiv.innerHTML =
          '<i class="fas fa-image" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>Image not found<br><small>' +
          escapeHtml(item.filename) +
          '</small>';
        this.parentNode.insertBefore(errorDiv, this);
      };
    }

    if (title) {
      title.textContent = item.filename;
    }

    if (downloadBtn) {
      downloadBtn.onclick = function () {
        window.open(item.absolute_url, '_blank');
      };
    }

    if (counter) {
      counter.textContent =
        state.gallery.currentIndex + 1 + ' / ' + state.gallery.items.length;
    }

    if (referencesPanel) {
      updateReferencesPanel(referencesPanel, item.filename);
    }
  }

  function updatePdfModal(item) {
    var container = state.currentModal;
    if (!container) return;

    var pdfObject = container.querySelector('.modal-body object');
    var title = container.querySelector('.modal-title');
    var downloadBtn = container.querySelector('.modal-download');
    var fallbackBtn = container.querySelector('.pdf-fallback');
    var counter = container.querySelector('.gallery-counter');
    var referencesPanel = container.querySelector('.references-panel');

    if (pdfObject) {
      pdfObject.setAttribute('data', item.absolute_url || item.url);
    }

    if (title) {
      title.textContent = item.filename;
    }

    if (downloadBtn) {
      downloadBtn.onclick = function () {
        window.open(item.absolute_url || item.url, '_blank');
      };
    }

    if (fallbackBtn) {
      fallbackBtn.onclick = function () {
        window.open(item.absolute_url || item.url, '_blank');
      };
    }

    if (counter) {
      counter.textContent =
        state.gallery.currentIndex + 1 + ' / ' + state.gallery.items.length;
    }

    if (referencesPanel) {
      updateReferencesPanel(referencesPanel, item.filename);
    }
  }

  /**
   * Theme Interference Cleanup
   */
  function cleanupThemeInterference() {
    // Aggressive cleanup of theme-generated lightbox wrappers and URL fixes
    var buttons = document.querySelectorAll('.attachment-item button[onclick]');
    Array.prototype.forEach.call(buttons, function (button) {
      // Extract correct URL from onclick attribute
      var correctSrc = button.getAttribute('onclick');
      var correctUrl = '';
      if (correctSrc) {
        var match = correctSrc.match(/showImageModal\(['"]([^'"]+)['"]/);
        if (match && match[1]) {
          correctUrl = match[1];
        }
      }

      // Remove all auto-generated anchor wrappers
      var links = button.querySelectorAll('a');
      Array.prototype.forEach.call(links, function (link) {
        var img = link.querySelector('img');
        if (img) {
          // Fix the image src with correct URL
          if (correctUrl) {
            img.src = correctUrl;
          }
          // Move image out of anchor and remove anchor
          button.insertBefore(img, link);
          link.remove();
        }
      });

      // Fix any remaining images with wrong URLs
      var images = button.querySelectorAll('img');
      Array.prototype.forEach.call(images, function (img) {
        if (
          correctUrl &&
          (img.src.includes('/posts/posts/') || !img.src.includes('/posts/'))
        ) {
          img.src = correctUrl;
        }
      });
    });
  }

  function runPeriodicCleanup() {
    // Run cleanup multiple times to catch theme interference
    cleanupThemeInterference();
    setTimeout(cleanupThemeInterference, 100);
    setTimeout(cleanupThemeInterference, 500);
    setTimeout(cleanupThemeInterference, 1000);
  }

  /**
   * Utility Functions
   */
  function escapeHtml(text) {
    var map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, function (m) {
      return map[m];
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
