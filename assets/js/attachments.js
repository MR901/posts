document.addEventListener('DOMContentLoaded', function () {
  var searchInput = document.getElementById('attachment-search');

  (function preventThemeLightboxInterference() {
    var buttons = document.querySelectorAll('.attachment-item button[onclick]');
    buttons.forEach(function (button) {
      var anchors = button.querySelectorAll('a.popup.img-link');
      anchors.forEach(function (anchor) {
        var img = anchor.querySelector('img');
        if (img) {
          button.insertBefore(img, anchor);
          anchor.remove();
        }
      });
    });

    var el = document.getElementById('modalImage');
    if (el && el.tagName && el.tagName.toLowerCase() === 'a') {
      var href = el.getAttribute('href') || '';
      if (!href || href === '/posts/src') {
        var div = document.createElement('div');
        div.id = 'modalImage';
        div.className = 'img-fluid';
        el.replaceWith(div);
      }
    }
  })();

  (function initTabs() {
    var tabLinks = Array.prototype.slice.call(
      document.querySelectorAll('#attachmentTabs a.nav-link')
    );
    var panes = Array.prototype.slice.call(
      document.querySelectorAll('#attachmentTabContent .tab-pane')
    );
    if (tabLinks.length === 0 || panes.length === 0) return;

    function showPane(targetSelector) {
      var targetPane = targetSelector
        ? document.querySelector(targetSelector)
        : null;
      if (!targetPane) return;
      panes.forEach(function (p) {
        p.classList.remove('active', 'show');
      });
      targetPane.classList.add('active', 'show');
    }

    function setActiveLink(link) {
      tabLinks.forEach(function (l) {
        l.classList.remove('active');
        l.setAttribute('aria-selected', 'false');
      });
      link.classList.add('active');
      link.setAttribute('aria-selected', 'true');
    }

    function activateByHash() {
      var h = window.location.hash;
      if (!h) return false;
      var link = null;
      for (var i = 0; i < tabLinks.length; i++) {
        if (tabLinks[i].getAttribute('href') === h) {
          link = tabLinks[i];
          break;
        }
      }
      if (!link) return false;
      setActiveLink(link);
      showPane(h);
      return true;
    }

    var activeLink = null;
    for (var i = 0; i < tabLinks.length; i++) {
      if (tabLinks[i].classList.contains('active')) {
        activeLink = tabLinks[i];
        break;
      }
    }
    if (!activeLink && tabLinks.length > 0) activeLink = tabLinks[0];
    tabLinks.forEach(function (l) {
      if (l === activeLink) {
        l.classList.add('active');
        l.setAttribute('aria-selected', 'true');
      } else {
        l.classList.remove('active');
        l.setAttribute('aria-selected', 'false');
      }
    });

    panes.forEach(function (p) {
      p.classList.remove('active', 'show');
    });
    if (!activateByHash()) {
      showPane(
        activeLink
          ? activeLink.getAttribute('href')
          : panes[0]
          ? '#' + panes[0].id
          : null
      );
    }

    tabLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setActiveLink(link);
        var target = link.getAttribute('href');
        if (history && history.replaceState) {
          history.replaceState(null, '', target);
        } else {
          window.location.hash = target;
        }
        showPane(target);
      });
    });

    window.addEventListener('hashchange', activateByHash);
  })();

  function updateResults() {
    var rawInput = searchInput && searchInput.value ? searchInput.value : '';

    function normalizeText(s) {
      if (!s) return '';
      try {
        s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      } catch (e) {}
      return s
        .toLowerCase()
        .replace(/[_-]+/g, ' ')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    function tokenize(s) {
      var n = normalizeText(s);
      return n
        ? n.split(' ').filter(function (w) {
            return !!w;
          })
        : [];
    }

    function editDistanceLTE1(a, b) {
      if (a === b) return true;
      var la = a.length,
        lb = b.length;
      if (Math.abs(la - lb) > 1) return false;
      var i = 0,
        j = 0,
        edits = 0;
      while (i < la && j < lb) {
        if (a.charAt(i) === b.charAt(j)) {
          i++;
          j++;
          continue;
        }
        edits++;
        if (edits > 1) return false;
        if (la > lb) i++;
        else if (lb > la) j++;
        else {
          i++;
          j++;
        }
      }
      if (la - i + (lb - j) > 0) edits++;
      return edits <= 1;
    }

    function isFuzzyMatch(hayWord, qWord) {
      if (!qWord) return true;
      if (hayWord.indexOf(qWord) !== -1) return true;
      if (qWord.length >= 3 && qWord.indexOf(hayWord) !== -1) return true;
      return editDistanceLTE1(hayWord, qWord);
    }

    function matches(hay, queryRaw) {
      var qTokens = tokenize(queryRaw);
      if (qTokens.length === 0) return true;
      var hTokens = tokenize(hay);
      if (hTokens.length === 0) return false;
      for (var i = 0; i < qTokens.length; i++) {
        var qt = qTokens[i];
        var found = false;
        for (var j = 0; j < hTokens.length; j++) {
          if (isFuzzyMatch(hTokens[j], qt)) {
            found = true;
            break;
          }
        }
        if (!found) return false;
      }
      return true;
    }

    var items = document.querySelectorAll('.attachment-item');
    items.forEach(function (item) {
      var hay = item.getAttribute('data-search') || '';
      var visible = matches(hay, rawInput);
      item.style.display = visible ? '' : 'none';
    });

    updateTabBadges(normalizeText(rawInput));
  }

  function updateTabBadges(query) {
    var categories = ['images', 'articles', 'research'];
    for (var c = 0; c < categories.length; c++) {
      var category = categories[c];
      var tab = document.getElementById(category + '-tab');
      if (!tab) continue;
      var items = document.querySelectorAll(
        '.attachment-item[data-category="' + category + '"]'
      );
      var visibleCount = 0;
      for (var i = 0; i < items.length; i++) {
        if (items[i].style.display !== 'none') {
          visibleCount++;
        }
      }
      var badge = tab.querySelector('.badge');
      if (badge) {
        var totalCount = items.length;
        badge.textContent = query
          ? visibleCount + '/' + totalCount
          : totalCount;
        badge.style.opacity = query && visibleCount === 0 ? '0.5' : '1';
      }
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', updateResults);
  }

  window.showImageModal = function (src, name, ev) {
    var modal = document.getElementById('imageModal');
    var modalImage = document.getElementById('modalImage');
    var modalLabel = document.getElementById('imageModalLabel');
    var modalDownload = document.getElementById('modalImageDownload');
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
      modalDownload.onclick = function () {
        window.open(src, '_blank');
      };
    }
    // Force vanilla modal to avoid theme/Bootstrap overlay issues on Pages
    openModal('imageModal');
    if (ev) ev.preventDefault();
  };

  window.showPdfModal = function (src, name, ev) {
    var modal = document.getElementById('pdfModal');
    var modalPdf = document.getElementById('modalPdf');
    var modalLabel = document.getElementById('pdfModalLabel');
    var modalDownload = document.getElementById('modalPdfDownload');
    var pdfFallbackLink = document.getElementById('pdfFallbackLink');
    if (modalLabel) modalLabel.textContent = name;
    if (modalDownload) {
      modalDownload.onclick = function () {
        window.open(src, '_blank');
      };
    }
    if (pdfFallbackLink) {
      pdfFallbackLink.onclick = function () {
        window.open(src, '_blank');
      };
    }
    if (modalPdf) {
      modalPdf.setAttribute('data', src);
    }
    // Force vanilla modal to avoid theme/Bootstrap overlay issues on Pages
    openModal('pdfModal');
    if (ev) ev.preventDefault();
  };
});

function openModal(id) {
  var el = document.getElementById(id);
  if (!el) return;

  // Move to body and force high z-index only
  if (el.parentNode && el.parentNode !== document.body) {
    document.body.appendChild(el);
  }
  el.style.zIndex = '2050';

  el.classList.add('show');
  el.style.display = 'block';
  el.removeAttribute('aria-hidden');
  document.body.classList.add('modal-open');

  var existing = document.querySelector(
    '.modal-backdrop[data-for="' + id + '"]'
  );
  if (!existing) {
    var backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop fade show';
    backdrop.setAttribute('data-for', id);
    backdrop.style.zIndex = '2040';
    backdrop.addEventListener('click', function () {
      closeModal(id);
    });
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
  var backdrop = document.querySelector(
    '.modal-backdrop[data-for="' + id + '"]'
  );
  if (backdrop && backdrop.parentNode)
    backdrop.parentNode.removeChild(backdrop);
}

if (typeof $ === 'undefined') {
  document.addEventListener('click', function (e) {
    var target = e.target;
    if (!target) return;
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
