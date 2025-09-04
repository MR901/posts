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
  };

  // Configuration
  var config = {
    modalZIndex: 9999,
    backdropZIndex: 9998,
    animationDuration: 300,
    categories: ['images', 'articles', 'research'],
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

    // Clean up any theme interference
    cleanupThemeInterference();

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
    config.categories.forEach(function (category) {
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

    var modalContent = createImageModalContent(src, name);
    openModal(modalContent);
  }

  function showPdfModal(src, name, event) {
    if (event) event.preventDefault();

    var modalContent = createPdfModalContent(src, name);
    openModal(modalContent);
  }

  function createImageModalContent(src, name) {
    var content = document.createElement('div');
    content.className = 'modal-content-wrapper';
    content.style.cssText = [
      'position: relative',
      'max-width: 90vw',
      'max-height: 90vh',
      'margin: 5vh auto',
      'background: white',
      'border-radius: 8px',
      'overflow: hidden',
      'box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3)',
    ].join(';');

    content.innerHTML = [
      '<div class="modal-header" style="padding: 15px 20px; border-bottom: 1px solid #dee2e6; display: flex; justify-content: space-between; align-items: center;">',
      '<h5 style="margin: 0; font-size: 1.25rem; color: #212529;">' +
        escapeHtml(name) +
        '</h5>',
      '<button type="button" class="modal-close" style="background: none; border: none; font-size: 24px; cursor: pointer; padding: 0; color: #6c757d;" aria-label="Close">&times;</button>',
      '</div>',
      '<div class="modal-body" style="padding: 20px; text-align: center; max-height: 70vh; overflow: auto;">',
      '<img src="' +
        escapeHtml(src) +
        '" alt="' +
        escapeHtml(name) +
        '" style="max-width: 100%; height: auto; border-radius: 4px;" loading="lazy" />',
      '</div>',
      '<div class="modal-footer" style="padding: 15px 20px; border-top: 1px solid #dee2e6; display: flex; justify-content: space-between; align-items: center;">',
      '<button type="button" class="btn btn-primary modal-download" style="background-color: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">',
      '<i class="fas fa-download" style="margin-right: 8px;"></i>Download',
      '</button>',
      '<button type="button" class="btn btn-secondary modal-close" style="background-color: #6c757d; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Close</button>',
      '</div>',
    ].join('');

    // Add event listeners
    var closeButtons = content.querySelectorAll('.modal-close');
    Array.prototype.forEach.call(closeButtons, function (btn) {
      btn.addEventListener('click', closeModal);
    });

    var downloadButton = content.querySelector('.modal-download');
    if (downloadButton) {
      downloadButton.addEventListener('click', function () {
        window.open(src, '_blank');
      });
    }

    return content;
  }

  function createPdfModalContent(src, name) {
    var content = document.createElement('div');
    content.className = 'modal-content-wrapper';
    content.style.cssText = [
      'position: relative',
      'width: 95vw',
      'height: 90vh',
      'margin: 5vh auto',
      'background: white',
      'border-radius: 8px',
      'overflow: hidden',
      'box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3)',
    ].join(';');

    content.innerHTML = [
      '<div class="modal-header" style="padding: 15px 20px; border-bottom: 1px solid #dee2e6; display: flex; justify-content: space-between; align-items: center;">',
      '<h5 style="margin: 0; font-size: 1.25rem; color: #212529;">' +
        escapeHtml(name) +
        '</h5>',
      '<button type="button" class="modal-close" style="background: none; border: none; font-size: 24px; cursor: pointer; padding: 0; color: #6c757d;" aria-label="Close">&times;</button>',
      '</div>',
      '<div class="modal-body" style="padding: 0; height: calc(90vh - 120px);">',
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
      '<div class="modal-footer" style="padding: 15px 20px; border-top: 1px solid #dee2e6; display: flex; justify-content: space-between; align-items: center;">',
      '<button type="button" class="btn btn-primary modal-download" style="background-color: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">',
      '<i class="fas fa-external-link-alt" style="margin-right: 8px;"></i>Open in New Tab',
      '</button>',
      '<button type="button" class="btn btn-secondary modal-close" style="background-color: #6c757d; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Close</button>',
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
      downloadButton.addEventListener('click', function () {
        window.open(src, '_blank');
      });
    }

    if (fallbackButton) {
      fallbackButton.addEventListener('click', function () {
        window.open(src, '_blank');
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
    container.style.alignItems = 'flex-start';
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
    }
  }

  /**
   * Theme Interference Cleanup
   */
  function cleanupThemeInterference() {
    // Remove any theme-generated lightbox wrappers
    var buttons = document.querySelectorAll('.attachment-item button[onclick]');
    Array.prototype.forEach.call(buttons, function (button) {
      var links = button.querySelectorAll('a.popup, a.img-link');
      Array.prototype.forEach.call(links, function (link) {
        var img = link.querySelector('img');
        if (img) {
          button.insertBefore(img, link);
          link.remove();
        }
      });
    });
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
