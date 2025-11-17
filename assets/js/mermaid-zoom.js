/**
 * Mermaid Diagram Zoom & Pan Enhancement
 * Adds click-to-zoom modal with drag-to-pan and wheel-zoom functionality
 */

(function () {
  'use strict';

  // Configuration
  const config = {
    minZoom: 0.5,
    maxZoom: 5,
    zoomStep: 0.2,
    transitionDuration: 300,
    hoverIndicatorDelay: 200,
  };

  // State management
  let activeModal = null;
  let transform = { x: 0, y: 0, scale: 1 };
  let isDragging = false;
  let dragStart = { x: 0, y: 0 };
  let lastTransform = { x: 0, y: 0 };

  /**
   * Initialize zoom functionality for all Mermaid diagrams
   */
  function initMermaidZoom() {
    // Wait for Mermaid to render
    waitForMermaid(() => {
      const diagrams = document.querySelectorAll('.language-mermaid svg');
      diagrams.forEach((svg) => {
        makeZoomable(svg);
      });
    });
  }

  /**
   * Wait for Mermaid diagrams to be rendered
   */
  function waitForMermaid(callback) {
    const checkInterval = setInterval(() => {
      const svgs = document.querySelectorAll('.language-mermaid svg');
      if (svgs.length > 0) {
        clearInterval(checkInterval);
        callback();
      }
    }, 100);

    // Timeout after 10 seconds
    setTimeout(() => clearInterval(checkInterval), 10000);
  }

  /**
   * Make a diagram zoomable by adding click handler and indicator
   */
  function makeZoomable(svg) {
    const wrapper = svg.closest('.mermaid-wrapper') || svg.parentElement;

    // Add zoom indicator class
    wrapper.classList.add('mermaid-zoomable');

    // Add zoom indicator icon
    const indicator = createZoomIndicator();
    wrapper.style.position = 'relative';
    wrapper.appendChild(indicator);

    // Add click handler
    wrapper.style.cursor = 'pointer';
    wrapper.addEventListener('click', (e) => {
      e.preventDefault();
      openZoomModal(svg);
    });

    // Show indicator on hover
    let hoverTimeout;
    wrapper.addEventListener('mouseenter', () => {
      hoverTimeout = setTimeout(() => {
        indicator.classList.add('visible');
      }, config.hoverIndicatorDelay);
    });

    wrapper.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimeout);
      indicator.classList.remove('visible');
    });
  }

  /**
   * Create zoom indicator icon
   */
  function createZoomIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'mermaid-zoom-indicator';
    indicator.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
        <line x1="11" y1="8" x2="11" y2="14"/>
        <line x1="8" y1="11" x2="14" y2="11"/>
      </svg>
    `;
    indicator.title = 'Click to zoom and pan';
    return indicator;
  }

  /**
   * Open zoom modal with the diagram
   */
  function openZoomModal(originalSvg) {
    // Clone the SVG
    const svgClone = originalSvg.cloneNode(true);

    // Reset transform state
    transform = { x: 0, y: 0, scale: 1 };
    isDragging = false;

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'mermaid-zoom-modal';
    modal.innerHTML = `
      <div class="mermaid-zoom-backdrop"></div>
      <div class="mermaid-zoom-content">
        <div class="mermaid-zoom-controls">
          <button class="mermaid-zoom-btn" data-action="zoom-in" title="Zoom In (Scroll Up)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
              <line x1="11" y1="8" x2="11" y2="14"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>
          <button class="mermaid-zoom-btn" data-action="zoom-out" title="Zoom Out (Scroll Down)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>
          <button class="mermaid-zoom-btn" data-action="reset" title="Reset View">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
            </svg>
          </button>
          <button class="mermaid-zoom-btn mermaid-zoom-close" data-action="close" title="Close (ESC)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="mermaid-zoom-hint">
          💡 Drag to pan • Scroll to zoom • ESC to close
        </div>
        <div class="mermaid-zoom-viewport">
          <div class="mermaid-zoom-container">
          </div>
        </div>
      </div>
    `;

    // Add cloned SVG to container
    const container = modal.querySelector('.mermaid-zoom-container');
    container.appendChild(svgClone);

    // Add to document
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    activeModal = modal;

    // Trigger animation
    requestAnimationFrame(() => {
      modal.classList.add('active');
    });

    // Setup event listeners
    setupModalEvents(modal, container);
  }

  /**
   * Setup event listeners for the modal
   */
  function setupModalEvents(modal, container) {
    const viewport = modal.querySelector('.mermaid-zoom-viewport');

    // Close button
    modal
      .querySelector('[data-action="close"]')
      .addEventListener('click', closeModal);

    // Zoom controls
    modal
      .querySelector('[data-action="zoom-in"]')
      .addEventListener('click', () => zoom(config.zoomStep));
    modal
      .querySelector('[data-action="zoom-out"]')
      .addEventListener('click', () => zoom(-config.zoomStep));
    modal
      .querySelector('[data-action="reset"]')
      .addEventListener('click', resetZoom);

    // Backdrop click to close
    modal
      .querySelector('.mermaid-zoom-backdrop')
      .addEventListener('click', closeModal);

    // ESC key to close
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    document.addEventListener('keydown', escHandler);
    modal.dataset.escHandler = 'attached';

    // Mouse wheel zoom
    viewport.addEventListener('wheel', handleWheel, { passive: false });

    // Mouse drag to pan
    viewport.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);

    // Touch support
    let touchStartDistance = 0;
    let touchStartScale = 1;

    viewport.addEventListener(
      'touchstart',
      (e) => {
        if (e.touches.length === 2) {
          // Pinch zoom
          touchStartDistance = getTouchDistance(e.touches);
          touchStartScale = transform.scale;
          e.preventDefault();
        } else if (e.touches.length === 1) {
          // Pan
          startDrag({
            clientX: e.touches[0].clientX,
            clientY: e.touches[0].clientY,
          });
        }
      },
      { passive: false }
    );

    viewport.addEventListener(
      'touchmove',
      (e) => {
        if (e.touches.length === 2) {
          // Pinch zoom
          const currentDistance = getTouchDistance(e.touches);
          const scaleDelta = currentDistance / touchStartDistance;
          transform.scale = Math.max(
            config.minZoom,
            Math.min(config.maxZoom, touchStartScale * scaleDelta)
          );
          applyTransform(container);
          e.preventDefault();
        } else if (e.touches.length === 1 && isDragging) {
          // Pan
          drag({
            clientX: e.touches[0].clientX,
            clientY: e.touches[0].clientY,
          });
        }
      },
      { passive: false }
    );

    viewport.addEventListener('touchend', endDrag);
  }

  /**
   * Get distance between two touch points
   */
  function getTouchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Handle mouse wheel zoom
   */
  function handleWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -config.zoomStep : config.zoomStep;
    zoom(delta, e.clientX, e.clientY);
  }

  /**
   * Zoom in/out
   */
  function zoom(delta, originX, originY) {
    const container = activeModal.querySelector('.mermaid-zoom-container');
    const viewport = activeModal.querySelector('.mermaid-zoom-viewport');
    const oldScale = transform.scale;

    // Calculate new scale
    transform.scale = Math.max(
      config.minZoom,
      Math.min(config.maxZoom, transform.scale + delta)
    );

    // If zoom origin provided, adjust pan to zoom towards that point
    if (originX !== undefined && originY !== undefined) {
      const rect = viewport.getBoundingClientRect();
      const x = originX - rect.left;
      const y = originY - rect.top;

      // Adjust pan to keep the point under cursor fixed
      const scaleDiff = transform.scale - oldScale;
      transform.x -= (x - transform.x) * (scaleDiff / oldScale);
      transform.y -= (y - transform.y) * (scaleDiff / oldScale);
    }

    applyTransform(container);
  }

  /**
   * Reset zoom and pan
   */
  function resetZoom() {
    const container = activeModal.querySelector('.mermaid-zoom-container');
    transform = { x: 0, y: 0, scale: 1 };

    // Animate reset
    container.style.transition = `transform ${config.transitionDuration}ms ease`;
    applyTransform(container);
    setTimeout(() => {
      container.style.transition = '';
    }, config.transitionDuration);
  }

  /**
   * Start dragging
   */
  function startDrag(e) {
    isDragging = true;
    dragStart = {
      x: e.clientX - transform.x,
      y: e.clientY - transform.y,
    };
    lastTransform = { ...transform };

    const viewport = activeModal.querySelector('.mermaid-zoom-viewport');
    viewport.style.cursor = 'grabbing';
  }

  /**
   * Handle drag movement
   */
  function drag(e) {
    if (!isDragging) return;

    e.preventDefault();
    const container = activeModal.querySelector('.mermaid-zoom-container');

    transform.x = e.clientX - dragStart.x;
    transform.y = e.clientY - dragStart.y;

    applyTransform(container);
  }

  /**
   * End dragging
   */
  function endDrag() {
    if (!isDragging) return;

    isDragging = false;
    const viewport = activeModal?.querySelector('.mermaid-zoom-viewport');
    if (viewport) {
      viewport.style.cursor = 'grab';
    }
  }

  /**
   * Apply transform to container
   */
  function applyTransform(container) {
    container.style.transform = `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`;
  }

  /**
   * Close the modal
   */
  function closeModal() {
    if (!activeModal) return;

    // Animate out
    activeModal.classList.remove('active');

    // Remove after animation
    setTimeout(() => {
      if (activeModal) {
        activeModal.remove();
        activeModal = null;
        document.body.style.overflow = '';

        // Clean up drag state
        isDragging = false;
      }
    }, config.transitionDuration);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMermaidZoom);
  } else {
    initMermaidZoom();
  }
})();
