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
  let mutationObserver = null;
  let modalEventListeners = [];
  let diagramEventListeners = new WeakMap(); // Track listeners per diagram wrapper

  /**
   * Initialize zoom functionality for all Mermaid diagrams
   */
  function initMermaidZoom() {
    // Wait for Mermaid to render
    waitForMermaid(() => {
      // Find all rendered Mermaid SVGs (multiple possible locations)
      const diagrams = document.querySelectorAll(
        [
          // Classic code-block based renderers
          '.language-mermaid svg',
          'pre.language-mermaid + svg',
          'pre[class*="mermaid"] svg',
          // Custom wrapper used by our RST directive
          '.mermaid-wrapper svg',
          // Fallback for themes/plugins that render <div class="mermaid"><svg>…</svg></div>
          '.mermaid svg',
        ].join(', ')
      );

      console.log(`Mermaid Zoom: Found ${diagrams.length} diagrams to enhance`);

      diagrams.forEach((svg) => {
        makeZoomable(svg);
      });
    });
  }

  /**
   * Wait for Mermaid diagrams to be rendered
   */
  function waitForMermaid(callback) {
    // Check multiple possible selectors where Mermaid might render SVGs
    const checkInterval = setInterval(() => {
      const svgs = document.querySelectorAll(
        [
          '.language-mermaid svg',
          'pre.language-mermaid + svg',
          'pre[class*="mermaid"] svg',
          '.mermaid-wrapper svg',
          '.mermaid svg',
        ].join(', ')
      );

      if (svgs.length > 0) {
        clearInterval(checkInterval);
        // Small delay to ensure all diagrams are fully rendered
        setTimeout(() => callback(), 100);
      }
    }, 100);

    // Timeout after 10 seconds
    setTimeout(() => clearInterval(checkInterval), 10000);
  }

  /**
   * Apply custom sizing from RST directive options (data attributes)
   */
  function applyCustomSizing(wrapper, svg) {
    // Check multiple potential sources for data attributes
    let width = wrapper.dataset.mermaidWidth;
    let height = wrapper.dataset.mermaidHeight;
    let scale = wrapper.dataset.mermaidScale;

    // If not found on wrapper, check parent .mermaid-wrapper
    if (!width && !height && !scale) {
      const parentWrapper = wrapper.closest('.mermaid-wrapper');
      if (parentWrapper) {
        width = parentWrapper.dataset.mermaidWidth || width;
        height = parentWrapper.dataset.mermaidHeight || height;
        scale = parentWrapper.dataset.mermaidScale || scale;
      }
    }

    // Also check if wrapper is a pre tag and has attributes directly
    if (!width && !height && !scale && wrapper.tagName === 'PRE') {
      // Attributes might be on the pre tag itself (if Mermaid preserved them)
      width = wrapper.getAttribute('data-mermaid-width') || width;
      height = wrapper.getAttribute('data-mermaid-height') || height;
      scale = wrapper.getAttribute('data-mermaid-scale') || scale;
    }

    console.log('[Mermaid Zoom] Checking custom sizing...', {
      wrapper,
      wrapperTag: wrapper.tagName,
      wrapperClasses: wrapper.className,
      svg,
      width,
      height,
      scale,
      hasParentWrapper: !!wrapper.closest('.mermaid-wrapper'),
    });

    if (width) {
      console.log(`[Mermaid Zoom] Applying custom width: ${width}`);
      svg.style.setProperty('width', width, 'important');
      svg.style.setProperty('max-width', 'none', 'important');
      svg.style.setProperty('min-width', '0', 'important');
      // Also remove the CSS transform that might interfere
      svg.style.setProperty('transform', 'none', 'important');
    }

    if (height) {
      console.log(`[Mermaid Zoom] Applying custom height: ${height}`);
      svg.style.setProperty('height', height, 'important');
      svg.style.setProperty('min-height', '0', 'important');
    }

    if (scale) {
      console.log(`[Mermaid Zoom] Applying custom scale: ${scale}`);
      svg.style.setProperty('transform', `scale(${scale})`, 'important');
      svg.style.setProperty('transform-origin', 'center top', 'important');
    }

    // If any custom sizing is applied, log success and verify
    if (width || height || scale) {
      console.log(`[Mermaid Zoom] ✅ Custom sizing applied!`);
      console.log('SVG computed styles:', {
        width: window.getComputedStyle(svg).width,
        height: window.getComputedStyle(svg).height,
        transform: window.getComputedStyle(svg).transform,
        maxWidth: window.getComputedStyle(svg).maxWidth,
        minWidth: window.getComputedStyle(svg).minWidth,
      });
    }
  }

  /**
   * Make a diagram zoomable by adding click handler and indicator
   * BUG FIX: Prevents duplicate event listeners
   * NEW: Applies custom sizing from data attributes
   */
  function makeZoomable(svg) {
    // Skip if already zoomable for this SVG
    if (svg.dataset.zoomEnabled) {
      return;
    }
    svg.dataset.zoomEnabled = 'true';

    // ================================
    // 1) Find the visible click target
    // ================================
    // Chirpy theme hides the original .mermaid-wrapper (adds .d-none) and
    // inserts a new <pre class="mermaid"> (later converted to <div.mermaid>).
    // Users interact with that visible .mermaid element, not the wrapper.
    let clickTarget =
      svg.closest('.mermaid') || // Chirpy's visible container
      svg.closest('.mermaid-wrapper') || // Fallback for older markup
      svg.parentElement; // Last resort

    if (!clickTarget) {
      console.warn(
        '[Mermaid Zoom] Could not find a visible click target for SVG',
        svg
      );
      return;
    }

    // Avoid double-binding handlers on the same click target
    if (diagramEventListeners.has(clickTarget)) {
      console.log('[Mermaid Zoom] Click target already enhanced, skipping');
      return;
    }

    // ============================================
    // 2) Locate sizing wrapper (may be hidden div)
    // ============================================
    // We still want to respect :width/:height/:scale options coming from RST.
    // These live on the hidden <div class="mermaid-wrapper"> that precedes the
    // visible .mermaid element.
    let sizingWrapper = svg.closest('.mermaid-wrapper');

    // Look backwards for the nearest preceding .mermaid-wrapper or data-mermaid-* pre
    if (!sizingWrapper) {
      const candidates = document.querySelectorAll(
        '.mermaid-wrapper, pre[data-mermaid-width], pre[data-mermaid-height], pre[data-mermaid-scale]'
      );

      let best = null;
      candidates.forEach((candidate) => {
        const relation = candidate.compareDocumentPosition(svg);
        const isBefore =
          relation & Node.DOCUMENT_POSITION_FOLLOWING ||
          relation & Node.DOCUMENT_POSITION_CONTAINED_BY;

        if (isBefore) {
          if (!best) {
            best = candidate;
          } else {
            const bestRelation = best.compareDocumentPosition(candidate);
            const candidateIsAfterBest =
              bestRelation & Node.DOCUMENT_POSITION_FOLLOWING ||
              bestRelation & Node.DOCUMENT_POSITION_CONTAINED_BY;
            if (candidateIsAfterBest) {
              best = candidate;
            }
          }
        }
      });

      if (best) {
        sizingWrapper = best;
      }
    }

    // Fallback: try to find the original <pre> (ancestor or previous sibling)
    if (!sizingWrapper) {
      const preTag = svg.closest('pre') || svg.previousElementSibling;
      if (preTag && preTag.tagName === 'PRE') {
        sizingWrapper = preTag.closest('.mermaid-wrapper') || preTag;
      }
    }

    if (sizingWrapper) {
      applyCustomSizing(sizingWrapper, svg);
    }

    console.log('[Mermaid Zoom] Making diagram zoomable:', {
      svg,
      clickTarget,
      sizingWrapper,
    });

    // Add zoom indicator & hover styling on the visible element
    clickTarget.classList.add('mermaid-zoomable');

    // Add zoom indicator icon (always visible for better discoverability)
    const indicator = createZoomIndicator();
    clickTarget.style.position = 'relative';
    clickTarget.appendChild(indicator);
    indicator.classList.add('visible'); // Make indicator persistent/always visible

    console.log(
      '[Mermaid Zoom] Indicator created and appended on visible diagram container.'
    );

    // Create event handlers
    const clickHandler = (e) => {
      console.log('[Mermaid Zoom] ✨ Diagram clicked! Opening zoom modal...');
      e.preventDefault();
      e.stopPropagation();
      openZoomModal(svg);
    };

    // Add event listeners
    clickTarget.style.cursor = 'pointer';
    clickTarget.addEventListener('click', clickHandler);

    // Store handlers for potential cleanup (using WeakMap - auto garbage collected)
    diagramEventListeners.set(clickTarget, {
      clickHandler,
      indicator,
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
   * BUG FIX: Closes existing modal before opening new one
   */
  function openZoomModal(originalSvg) {
    // Close existing modal if open (prevent multiple modals)
    if (activeModal) {
      console.log(
        '[Mermaid Zoom] Closing existing modal before opening new one'
      );
      closeModal();
      // Wait for close animation to complete
      setTimeout(
        () => openZoomModal(originalSvg),
        config.transitionDuration + 50
      );
      return;
    }

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
   * MEMORY SAFE: Tracks all listeners for cleanup
   */
  function setupModalEvents(modal, container) {
    const viewport = modal.querySelector('.mermaid-zoom-viewport');

    // Clear previous listeners array
    modalEventListeners = [];

    // Helper to register listeners for cleanup
    const addListener = (element, event, handler, options) => {
      element.addEventListener(event, handler, options);
      modalEventListeners.push({ element, event, handler, options });
    };

    // ESC key to close
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    addListener(document, 'keydown', escHandler);

    // Close button
    const closeBtn = modal.querySelector('[data-action="close"]');
    addListener(closeBtn, 'click', closeModal);

    // Zoom controls
    const zoomInHandler = () => zoom(config.zoomStep);
    const zoomOutHandler = () => zoom(-config.zoomStep);
    addListener(
      modal.querySelector('[data-action="zoom-in"]'),
      'click',
      zoomInHandler
    );
    addListener(
      modal.querySelector('[data-action="zoom-out"]'),
      'click',
      zoomOutHandler
    );
    addListener(
      modal.querySelector('[data-action="reset"]'),
      'click',
      resetZoom
    );

    // Backdrop click to close
    const backdrop = modal.querySelector('.mermaid-zoom-backdrop');
    addListener(backdrop, 'click', closeModal);

    // Mouse wheel zoom
    addListener(viewport, 'wheel', handleWheel, { passive: false });

    // Mouse drag to pan
    addListener(viewport, 'mousedown', startDrag);
    addListener(document, 'mousemove', drag);
    addListener(document, 'mouseup', endDrag);

    // Touch support
    let touchStartDistance = 0;
    let touchStartScale = 1;

    const touchStartHandler = (e) => {
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
    };

    const touchMoveHandler = (e) => {
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
    };

    addListener(viewport, 'touchstart', touchStartHandler, { passive: false });
    addListener(viewport, 'touchmove', touchMoveHandler, { passive: false });
    addListener(viewport, 'touchend', endDrag);
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
   * BUG FIX: Added null check for activeModal
   */
  function zoom(delta, originX, originY) {
    if (!activeModal) return;

    const container = activeModal.querySelector('.mermaid-zoom-container');
    const viewport = activeModal.querySelector('.mermaid-zoom-viewport');
    const oldScale = transform.scale;

    // Calculate new scale
    transform.scale = Math.max(
      config.minZoom,
      Math.min(config.maxZoom, transform.scale + delta)
    );

    // If zoom origin provided, adjust pan to zoom towards that point
    if (originX !== undefined && originY !== undefined && oldScale > 0) {
      const rect = viewport.getBoundingClientRect();
      const x = originX - rect.left;
      const y = originY - rect.top;

      // Adjust pan to keep the point under cursor fixed (prevent division by zero)
      const scaleDiff = transform.scale - oldScale;
      transform.x -= (x - transform.x) * (scaleDiff / oldScale);
      transform.y -= (y - transform.y) * (scaleDiff / oldScale);
    }

    applyTransform(container);
  }

  /**
   * Reset zoom and pan
   * BUG FIX: Added null check for activeModal
   */
  function resetZoom() {
    if (!activeModal) return;

    const container = activeModal.querySelector('.mermaid-zoom-container');
    if (!container) return;

    transform = { x: 0, y: 0, scale: 1 };

    // Animate reset
    container.style.transition = `transform ${config.transitionDuration}ms ease`;
    applyTransform(container);
    setTimeout(() => {
      if (container && container.style) {
        container.style.transition = '';
      }
    }, config.transitionDuration);
  }

  /**
   * Start dragging
   * BUG FIX: Added null check for activeModal
   */
  function startDrag(e) {
    if (!activeModal) return;

    isDragging = true;
    dragStart = {
      x: e.clientX - transform.x,
      y: e.clientY - transform.y,
    };

    const viewport = activeModal.querySelector('.mermaid-zoom-viewport');
    if (viewport) {
      viewport.style.cursor = 'grabbing';
    }
  }

  /**
   * Handle drag movement
   * BUG FIX: Added null check for activeModal
   */
  function drag(e) {
    if (!isDragging || !activeModal) return;

    e.preventDefault();
    const container = activeModal.querySelector('.mermaid-zoom-container');
    if (!container) return;

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
   * MEMORY SAFE: Properly cleans up all event listeners and DOM elements
   */
  function closeModal() {
    if (!activeModal) return;

    console.log('[Mermaid Zoom] Closing modal and cleaning up resources...');

    // Animate out
    activeModal.classList.remove('active');

    // Remove after animation
    setTimeout(() => {
      if (activeModal) {
        // Remove all tracked event listeners
        modalEventListeners.forEach(({ element, event, handler, options }) => {
          element.removeEventListener(event, handler, options);
        });
        modalEventListeners = [];

        // Find and remove the cloned SVG to free memory
        const svgClone = activeModal.querySelector(
          '.mermaid-zoom-container svg'
        );
        if (svgClone) {
          svgClone.remove();
        }

        // Remove modal from DOM
        activeModal.remove();
        activeModal = null;
        document.body.style.overflow = '';

        // Clean up drag state
        isDragging = false;

        console.log('[Mermaid Zoom] Cleanup complete - all resources freed');
      }
    }, config.transitionDuration);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMermaidZoom);
  } else {
    initMermaidZoom();
  }

  // Also try after a short delay in case Mermaid initializes late
  setTimeout(initMermaidZoom, 1000);

  // Watch for dynamic changes (in case diagrams load asynchronously)
  // MEMORY SAFE: Stops observing after 10 seconds to prevent memory leaks
  if (typeof MutationObserver !== 'undefined') {
    let observerTimeout;

    mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          for (const node of mutation.addedNodes) {
            if (
              node.tagName === 'SVG' ||
              (node.querySelector && node.querySelector('svg'))
            ) {
              console.log('[Mermaid Zoom] Detected new SVG, re-initializing');
              initMermaidZoom();
              break;
            }
          }
        }
      }
    });

    // Start observing after a short delay
    setTimeout(() => {
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });

      // Stop observing after 10 seconds to prevent indefinite memory monitoring
      observerTimeout = setTimeout(() => {
        if (mutationObserver) {
          console.log(
            '[Mermaid Zoom] Stopping DOM observer after 10s (memory optimization)'
          );
          mutationObserver.disconnect();
          mutationObserver = null;
        }
      }, 10000);
    }, 500);
  }

  // Cleanup on page unload (for SPAs)
  window.addEventListener('beforeunload', () => {
    if (mutationObserver) {
      mutationObserver.disconnect();
      mutationObserver = null;
    }
    if (activeModal) {
      closeModal();
    }
  });
})();
