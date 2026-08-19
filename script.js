/* Generic panel-click modal: any element with data-modal-target opens the
   matching <template>, clones its content into the shared modal, and shows it.
   Uses event delegation (listens on document) rather than binding each
   trigger individually — that way triggers cloned into the modal later
   (e.g. a story list inside a "more" template) work too, without needing
   their own listeners. Figures inside the modal can be clicked to view
   them larger in a lightbox layered on top. Safe to include on pages
   without these elements — it just no-ops. */
(function () {
  var overlay = document.getElementById('modal-overlay');
  var body = document.getElementById('modal-body');
  var closeBtn = document.getElementById('modal-close');
  var lightbox = document.getElementById('lightbox-overlay');
  var lightboxImg = document.getElementById('lightbox-img');
  var lightboxClose = document.getElementById('lightbox-close');
  if (!overlay || !body || !closeBtn) return;

  function openModal(templateId) {
    var template = document.getElementById(templateId);
    if (!template) return;
    body.innerHTML = '';
    body.appendChild(template.content.cloneNode(true));
    body.scrollTop = 0;
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeModal() {
    overlay.hidden = true;
    document.body.style.overflow = '';
  }

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-modal-target]');
    if (trigger) openModal(trigger.dataset.modalTarget);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var trigger = e.target.closest('[data-modal-target]');
    if (!trigger) return;
    e.preventDefault();
    openModal(trigger.dataset.modalTarget);
  });

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeModal();
  });

  // Lightbox: click any figure inside the modal to view it larger
  if (lightbox && lightboxImg && lightboxClose) {
    function openLightbox(img) {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.hidden = false;
    }

    function closeLightbox() {
      lightbox.hidden = true;
      lightboxImg.src = '';
    }

    body.addEventListener('click', function (e) {
      var img = e.target.closest('.modal-figures img');
      if (img) openLightbox(img);
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (lightbox && !lightbox.hidden) {
      lightbox.hidden = true;
      lightboxImg.src = '';
    } else if (!overlay.hidden) {
      closeModal();
    }
  });
})();
