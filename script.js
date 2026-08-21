/* Generic panel-click modal: any element with data-modal-target opens the
   matching <template>, clones its content into the shared modal, and shows it.
   Uses event delegation (listens on document) rather than binding each
   trigger individually — that way triggers cloned into the modal later
   (e.g. a story list inside a "more" template) work too, without needing
   their own listeners.

   If the page has #modal-prev/#modal-next buttons, opening one of the
   "update" templates also shows prev/next controls to step to the
   adjacent update, in the same order as the #modal-all-updates archive
   list — so adding a new update there automatically extends the sequence.

   Figures inside the modal can be clicked to view them larger in a
   lightbox layered on top, with its own prev/next buttons to step
   through the other figures in that same .modal-figures group.

   Safe to include on pages without any of these elements — it just no-ops
   the parts that don't apply. */
(function () {
  var overlay = document.getElementById('modal-overlay');
  var body = document.getElementById('modal-body');
  var closeBtn = document.getElementById('modal-close');
  var modalPrev = document.getElementById('modal-prev');
  var modalNext = document.getElementById('modal-next');
  var lightbox = document.getElementById('lightbox-overlay');
  var lightboxImg = document.getElementById('lightbox-img');
  var lightboxClose = document.getElementById('lightbox-close');
  var lightboxPrev = document.getElementById('lightbox-prev');
  var lightboxNext = document.getElementById('lightbox-next');
  if (!overlay || !body || !closeBtn) return;

  // Build the update sequence from the archive list's own trigger order,
  // so it stays in sync automatically as updates are added/reordered there.
  var updateSequence = [];
  var archiveTemplate = document.getElementById('modal-all-updates');
  if (archiveTemplate) {
    updateSequence = Array.from(archiveTemplate.content.querySelectorAll('[data-modal-target]'))
      .map(function (el) { return el.dataset.modalTarget; });
  }

  function updateModalNav(templateId) {
    if (!modalPrev || !modalNext) return;
    var index = updateSequence.indexOf(templateId);
    if (index === -1) {
      modalPrev.hidden = true;
      modalNext.hidden = true;
      return;
    }
    var hasMultiple = updateSequence.length > 1;
    modalPrev.hidden = !hasMultiple;
    modalNext.hidden = !hasMultiple;
    modalPrev.dataset.targetTemplate = updateSequence[(index - 1 + updateSequence.length) % updateSequence.length];
    modalNext.dataset.targetTemplate = updateSequence[(index + 1) % updateSequence.length];
  }

  function openModal(templateId) {
    var template = document.getElementById(templateId);
    if (!template) return;
    body.innerHTML = '';
    body.appendChild(template.content.cloneNode(true));
    body.scrollTop = 0;
    updateModalNav(templateId);
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeModal() {
    overlay.hidden = true;
    document.body.style.overflow = '';
    if (modalPrev) modalPrev.hidden = true;
    if (modalNext) modalNext.hidden = true;
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
  if (modalPrev) modalPrev.addEventListener('click', function () { openModal(modalPrev.dataset.targetTemplate); });
  if (modalNext) modalNext.addEventListener('click', function () { openModal(modalNext.dataset.targetTemplate); });

  // Lightbox: click any figure inside the modal to view it larger
  var lightboxGroup = [];
  var lightboxIndex = -1;

  if (lightbox && lightboxImg && lightboxClose) {
    function showLightboxImage(index) {
      if (!lightboxGroup.length) return;
      lightboxIndex = (index + lightboxGroup.length) % lightboxGroup.length;
      var img = lightboxGroup[lightboxIndex];
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
    }

    function openLightbox(img) {
      var figuresGroup = img.closest('.modal-figures');
      lightboxGroup = figuresGroup ? Array.from(figuresGroup.querySelectorAll('img')) : [img];
      var hasMultiple = lightboxGroup.length > 1;
      if (lightboxPrev) lightboxPrev.hidden = !hasMultiple;
      if (lightboxNext) lightboxNext.hidden = !hasMultiple;
      showLightboxImage(lightboxGroup.indexOf(img));
      lightbox.hidden = false;
    }

    function closeLightbox() {
      lightbox.hidden = true;
      lightboxImg.src = '';
      lightboxGroup = [];
      lightboxIndex = -1;
    }

    body.addEventListener('click', function (e) {
      var img = e.target.closest('.modal-figures img');
      if (img) openLightbox(img);
    });

    lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', function () { showLightboxImage(lightboxIndex - 1); });
    if (lightboxNext) lightboxNext.addEventListener('click', function () { showLightboxImage(lightboxIndex + 1); });
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (lightbox && !lightbox.hidden) {
      if (e.key === 'Escape') {
        lightbox.hidden = true;
        lightboxImg.src = '';
      } else if (e.key === 'ArrowLeft' && lightboxGroup.length > 1) {
        lightboxIndex = (lightboxIndex - 1 + lightboxGroup.length) % lightboxGroup.length;
        lightboxImg.src = lightboxGroup[lightboxIndex].src;
        lightboxImg.alt = lightboxGroup[lightboxIndex].alt;
      } else if (e.key === 'ArrowRight' && lightboxGroup.length > 1) {
        lightboxIndex = (lightboxIndex + 1) % lightboxGroup.length;
        lightboxImg.src = lightboxGroup[lightboxIndex].src;
        lightboxImg.alt = lightboxGroup[lightboxIndex].alt;
      }
      return;
    }
    if (!overlay.hidden) {
      if (e.key === 'Escape') {
        closeModal();
      } else if (e.key === 'ArrowLeft' && modalPrev && !modalPrev.hidden) {
        openModal(modalPrev.dataset.targetTemplate);
      } else if (e.key === 'ArrowRight' && modalNext && !modalNext.hidden) {
        openModal(modalNext.dataset.targetTemplate);
      }
    }
  });
})();
