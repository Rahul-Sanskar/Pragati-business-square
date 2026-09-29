(function () {
  const body = document.body;
  const menu = document.getElementById("mobileMenu");
  const menuToggle = document.querySelector(".menu-toggle");
  const menuClose = document.querySelector(".mobile-menu__close");
  const mobileNavLinks = document.querySelectorAll(".mobile-nav a");
  const universalModal = document.getElementById("universalModal");
  const modalTitle = universalModal.querySelector(".modal__title");
  const modalContent = universalModal.querySelector(".modal__content");
  const formModal = document.getElementById("formModal");
  const formModalBody = document.getElementById("formModalBody");
  const formTemplate = document.getElementById("leadFormTemplate");
  const leadTriggers = document.querySelectorAll("[data-form-trigger]");
  const galleryLightbox = document.getElementById("galleryLightbox");
  const galleryTitle = document.getElementById("galleryTitle");
  const galleryImage = document.querySelector(".lightbox__image");
  const galleryTrack = document.querySelector(".gallery-track");
  const openGalleryBtn = document.getElementById("openGalleryBtn");
  const galleryPrev = document.querySelector(".lightbox__nav--prev");
  const galleryNext = document.querySelector(".lightbox__nav--next");
  const toast = document.getElementById("toast");
  const pageForm = document.querySelector(".enquiry-card .frmContactus");
  const brochureMessage = "Brochure file is not available in the current project assets yet.";
  const galleryImages = [
    {
      src: "public/assets/business-square/gallery/01-main-front-render.png",
      alt: "Business Square main front architectural render — G+29 premium commercial tower main facade, MIDC Nerul Navi Mumbai",
      title: "Main Front Render",
    },
    {
      src: "public/assets/business-square/gallery/02-alternative-exterior.png",
      alt: "Business Square alternative exterior daylight render of the commercial tower facade",
      title: "Alternative Exterior",
    },
    {
      src: "public/assets/business-square/gallery/08-aerial-overview.png",
      alt: "Business Square aerial overview render of G+29 premium commercial development MIDC Nerul",
      title: "Aerial Overview",
    },
    {
      src: "public/assets/business-square/gallery/06-main-entrance.png",
      alt: "Business Square main entrance and grand arrival lobby experience — premium commercial MIDC Nerul",
      title: "Main Entrance & Arrival",
    },
    {
      src: "public/assets/business-square/gallery/05-evening-facade.png",
      alt: "Business Square evening facade and premium lighting design of the commercial tower",
      title: "Evening Facade View",
    },
    {
      src: "public/assets/business-square/gallery/07-tower-wide-shot.png",
      alt: "Business Square wide tower composition — full G+29 commercial tower architectural composition",
      title: "Wide Tower Composition",
    },
  ];

  let activeGalleryIndex = 0;
  let activeDialog = null;
  let pendingLeadAction = null;
  let touchStartX = 0;
  let touchEndX = 0;
  let toastTimeout = null;
  const revealTargets = document.querySelectorAll(
    ".discover, .highlights-grid, .project-intro, .intro-grid, .why-business, .why-cards, .tower-story, .tower-floors, .fp-tabs, .fp-grid, .gallery-slider, .location-card, .invest-card, .cta-banner__content, .site-footer, .floor-plan-grid"
  );
  const staggerTargets = document.querySelectorAll(
    ".discover-grid, .highlights-stats, .intro-stats, .why-cards, .tower-floors, .fp-grid, .location-points, .floor-plan-grid, .footer-links"
  );
  

  function openMenu() {
    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");
    menuToggle.setAttribute("aria-expanded", "true");
    body.classList.add("menu-open");
  }

  function closeMenu() {
    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    menuToggle.setAttribute("aria-expanded", "false");
    body.classList.remove("menu-open");
  }

  function setBodyModalState() {
    const hasOpenDialog =
      universalModal.classList.contains("is-open") ||
      galleryLightbox.classList.contains("is-open") ||
      formModal.classList.contains("is-open");
    body.classList.toggle("modal-open", hasOpenDialog);
  }

  function smoothScrollTo(targetSelector) {
    const target = document.querySelector(targetSelector);
    if (!target) {
      return;
    }

    closeMenu();
    const targetY = target.getBoundingClientRect().top + window.scrollY - 24;
    window.scrollTo({ top: targetY, behavior: "smooth" });
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 2600);
  }

  function closeUniversalModal() {
    universalModal.classList.remove("is-open");
    universalModal.setAttribute("aria-hidden", "true");
    modalContent.innerHTML = "";
    modalTitle.textContent = "";
    activeDialog = null;
    setBodyModalState();
  }

  function closeFormModal() {
    formModal.classList.remove("is-open");
    formModal.setAttribute("aria-hidden", "true");
    formModalBody.innerHTML = "";
    activeDialog = null;
    setBodyModalState();
  }

  function renderGalleryImage(index) {
    const item = galleryImages[index];
    galleryImage.src = item.src;
    galleryImage.alt = item.alt;
    galleryTitle.textContent = item.title;
  }

  function openGallery(index) {
    activeGalleryIndex = index;
    renderGalleryImage(activeGalleryIndex);
    galleryLightbox.classList.add("is-open");
    galleryLightbox.setAttribute("aria-hidden", "false");
    activeDialog = "gallery";
    setBodyModalState();
  }

  function closeGallery() {
    galleryLightbox.classList.remove("is-open");
    galleryLightbox.setAttribute("aria-hidden", "true");
    activeDialog = null;
    setBodyModalState();
  }

  function stepGallery(direction) {
    activeGalleryIndex =
      (activeGalleryIndex + direction + galleryImages.length) % galleryImages.length;
    renderGalleryImage(activeGalleryIndex);
  }

 

  
 function openLeadForm(trigger) {
  pendingLeadAction = trigger || null;

  if (!formTemplate || !formModalBody) {
    return;
  }

  formModalBody.innerHTML = "";

  formModalBody.appendChild(
    formTemplate.content.cloneNode(true)
  );

  formModal.classList.add("is-open");
  formModal.setAttribute("aria-hidden", "false");

  activeDialog = "form";
  setBodyModalState();
}

 
  body.classList.add("is-loaded");

  revealTargets.forEach((element) => {
    element.classList.add("animate-in");
  });

  staggerTargets.forEach((element) => {
    element.classList.add("stagger-children");
  });

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    revealTargets.forEach((element) => revealObserver.observe(element));
    staggerTargets.forEach((element) => revealObserver.observe(element));
  } else {
    revealTargets.forEach((element) => element.classList.add("is-visible"));
    staggerTargets.forEach((element) => element.classList.add("is-visible"));
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", openMenu);
  }

  if (menuClose) {
    menuClose.addEventListener("click", closeMenu);
  }

  menu.addEventListener("click", (event) => {
    if (event.target === menu) {
      closeMenu();
    }
  });

  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", () => closeMenu());
  });

  leadTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      openLeadForm(trigger);
    });
  });

  // ===== DELEGATED LEAD-FORM TRIGGERS (for NEW FP tab buttons, new tower CTA buttons, new section CTAs added via HTML) =====
  document.addEventListener('click', function (evt) {
    var trigger = evt.target && evt.target.closest ? evt.target.closest('[data-form-trigger]') : null;
    if (!trigger) return;
    // Already-bound static triggers won't double-fire since they preventDefault above, but guard anyway:
    if (trigger.dataset.delegationBound) return;
    evt.preventDefault();
    openLeadForm(trigger);
  });

  // ===== SMOOTH SCROLL HANDLER for navigation anchors (.site-header brand, mobile nav, location links, footer quick links) =====
  document.addEventListener('click', function (evt) {
    var a = evt.target && evt.target.closest ? evt.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.length < 2) return;
    // Skip modals, close buttons, gallery lightbox nav (href="#" on non-nav elements)
    var skipClasses = ['lightbox__nav', 'modal__close', 'mobile-menu__close', 'menu-toggle'];
    for (var i = 0; i < skipClasses.length; i++) {
      if (a.classList && a.classList.contains(skipClasses[i])) return;
    }
    if (a.getAttribute('role') === 'button') return;
    var dest = document.querySelector(href);
    if (!dest) return;
    evt.preventDefault();
    closeMenu();
    var destY = dest.getBoundingClientRect().top + window.scrollY - 20;
    window.scrollTo({ top: destY, behavior: 'smooth' });
  });

  // ===== STATIC data-scroll-target (highlights CTA scrolls to gallery) =====
  document.addEventListener('click', function (evt) {
    var el = evt.target && evt.target.closest ? evt.target.closest('[data-scroll-target]') : null;
    if (!el) return;
    var t = document.querySelector(el.getAttribute('data-scroll-target'));
    if (t) {
      evt.preventDefault();
      var y = t.getBoundingClientRect().top + window.scrollY - 20;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  });

  // ===== FLOOR-PLAN MODAL (universalModal reused for data-modal-type=floorplan) =====
  document.addEventListener('click', function (evt) {
    var btn = evt.target && evt.target.closest ? evt.target.closest('[data-modal-type="floorplan"]') : null;
    if (!btn || !universalModal || !modalContent || !modalTitle) return;
    evt.preventDefault();
    var src = btn.getAttribute('data-media-src') || '';
    var title = btn.getAttribute('data-media-title') || 'Floor Plan';
    modalTitle.textContent = title;
    modalContent.innerHTML = (
      '<figure style="margin:0; text-align:center;">' +
        '<img src="' + src.replace(/"/g, '&quot;') + '" ' +
          'alt="' + title.replace(/"/g, '&quot;') + ' (Business Square floor plan — tentative & subject to MIDC approval)" ' +
          'style="max-width:100%; height:auto; max-height:72vh; object-fit:contain; border-radius:4px; border:1px solid rgba(184,149,79,0.3); display:block; margin:0 auto;" />' +
        '<figcaption style="margin-top:20px; padding:16px 20px; background:#FBF8F1; border-left:3px solid #b8954f; border-radius:0 4px 4px 0; color:#4b5a6a; font-size:0.84rem; line-height:1.65; text-align:left;">' +
          '<strong style="color:#0f1f2c;">Disclaimer:</strong> Floor plans are indicative and for illustration only. ' +
          '<strong>Plans are tentative and subject to approval from MIDC.</strong> ' +
          'Contact our team for the latest approved drawings — <a href="tel:8828386497" style="color:#0f1f2c; font-weight:700;">+91 8828386497</a>.' +
        '</figcaption>' +
      '</figure>' +
      '<div style="margin-top:24px; display:flex; gap:12px; flex-wrap:wrap; justify-content:center;">' +
        '<button type="button" class="btn lead-trigger" data-form-trigger style="min-width:220px;">Request Approved Drawings</button> ' +
        '<a href="tel:8828386497" class="btn btn-dark" style="text-decoration:none; display:inline-flex; align-items:center; justify-content:center; min-width:220px;">Call Our Team</a>' +
      '</div>'
    );
    universalModal.classList.add('is-open');
    universalModal.setAttribute('aria-hidden', 'false');
    activeDialog = 'universal';
    setBodyModalState();
  });

  // ===== REVEAL / STAGGER observer rebind for new sections (dynamic query on load)
  if ('IntersectionObserver' in window) {
    // Fallback: if the IntersectionObserver is bound before all elements exist (revealTargets at init),
    // re-scan and observe any unobserved elements now.
    var extraTargets = document.querySelectorAll('.project-intro, .intro-grid, .why-business, .why-cards, .tower-story, .tower-floors, .fp-tabs, .fp-grid, .invest-card');
    extraTargets.forEach(function (el) { el.classList.add('animate-in'); });
  }

  universalModal.addEventListener("click", (event) => {
    if (event.target.hasAttribute("data-close-modal")) {
      closeUniversalModal();
    }
  });

  formModal.addEventListener("click", (event) => {
    if (event.target.hasAttribute("data-close-form-modal")) {
      pendingLeadAction = null;
      closeFormModal();
    }
  });

  if (openGalleryBtn) {
    openGalleryBtn.addEventListener("click", (event) => {
      if (!openGalleryBtn.hasAttribute("data-form-trigger")) {
        event.preventDefault();
        openGallery(0);
      }
    });
  }

  // --- Gallery slider: separated try/catch so failure can't break hero init ---
  try {
    if (galleryTrack && window.jQuery && typeof window.jQuery.fn.slick === "function") {
      window.jQuery(galleryTrack).slick({
        infinite: true,
        slidesToShow: 6,
        slidesToScroll: 1,
        arrows: true,
        dots: false,
        autoplay: false,
        responsive: [
          { breakpoint: 1180, settings: { slidesToShow: 4 } },
          { breakpoint: 860,  settings: { slidesToShow: 2 } },
          {
            breakpoint: 560,
            settings: {
              slidesToShow: 1,
              centerMode: true,
              centerPadding: "24px",
            },
          },
        ],
      });
    }
  } catch (err) {
    // Fail silently for gallery only
    if (window.console && console.warn) console.warn("Gallery slick init skipped:", err);
  }

  // --- Hero carousel (D1/D2/D3 desktop, M1/M2/M3 mobile via <picture>) ---
  function initHeroCarousel() {
    var heroSlider = document.querySelector(".hero-slider");
    if (!heroSlider) return;
    if (!(window.jQuery && typeof window.jQuery.fn.slick === "function")) {
      heroSlider.classList.add("hero-slider--fallback");
      return;
    }

    var $hero = window.jQuery(heroSlider);
    if ($hero.hasClass("slick-initialized")) return;

    var $dotsContainer = document.querySelector(".hero-dots");
    var $prev = document.querySelector(".hero-nav--prev");
    var $next = document.querySelector(".hero-nav--next");

    // Minimal, battle-tested Slick 1.8.1 config that always works with fade
    try {
      $hero.slick({
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        fade: true,
        cssEase: "ease-out",
        speed: 900,
        autoplay: true,
        autoplaySpeed: 6500,
        pauseOnHover: true,
        pauseOnFocus: true,
        arrows: false,
        dots: false,
        draggable: true,
        swipe: true,
        touchThreshold: 12,
        accessibility: true,
        waitForAnimate: true,
        adaptiveHeight: false,
        responsive: [
          {
            breakpoint: 1180,
            settings: { autoplay: true, arrows: false, dots: false },
          },
        ],
      });
    } catch (err) {
      if (window.console && console.warn) console.warn("Hero slick init failed:", err);
      heroSlider.classList.add("hero-slider--fallback");
      return;
    }

    // --- Wire up EXTERNAL custom arrows manually (not inside slick) ---
    if ($prev) {
      $prev.addEventListener("click", function (event) {
        event.preventDefault();
        try { $hero.slick("slickPrev"); } catch (e) {}
      });
    }
    if ($next) {
      $next.addEventListener("click", function (event) {
        event.preventDefault();
        try { $hero.slick("slickNext"); } catch (e) {}
      });
    }

    // --- Build custom dots into the standalone .hero-dots UL (external) ---
    if ($dotsContainer) {
      var totalSlides = 3; // D1/D2/D3 == M1/M2/M3
      $dotsContainer.innerHTML = "";
      for (var i = 0; i < totalSlides; i++) {
        var li = document.createElement("li");
        if (i === 0) li.className = "slick-active";
        var btn = document.createElement("button");
        btn.type = "button";
        btn.setAttribute("role", "tab");
        btn.setAttribute("aria-label", "Go to slide " + (i + 1));
        btn.textContent = String(i + 1);
        (function (idx) {
          btn.addEventListener("click", function (event) {
            event.preventDefault();
            try { $hero.slick("slickGoTo", idx); } catch (e) {}
          });
        })(i);
        li.appendChild(btn);
        $dotsContainer.appendChild(li);
      }

      // Sync active dot on slick change
      $hero.on("beforeChange.heroDots", function (evt, slick, currentSlide, nextSlide) {
        var all = $dotsContainer.querySelectorAll("li");
        for (var d = 0; d < all.length; d++) {
          all[d].classList.toggle("slick-active", d === nextSlide);
        }
      });
    }

    // --- Pause autoplay on touch, resume afterwards ---
    var touchResumeTimer = null;
    heroSlider.addEventListener(
      "touchstart",
      function () {
        try { $hero.slick("slickPause"); } catch (e) {}
      },
      { passive: true }
    );
    heroSlider.addEventListener(
      "touchend",
      function () {
        if (touchResumeTimer) clearTimeout(touchResumeTimer);
        touchResumeTimer = setTimeout(function () {
          try { $hero.slick("slickPlay"); } catch (e) {}
        }, 1200);
      },
      { passive: true }
    );

    // --- Debug visibility to user console (first load only) ---
    try {
      var s1src = document.querySelector('.hero-slide[data-slide="1"] img') || document.querySelector('.hero-slide[data-slide="1"] source');
      var s2src = document.querySelector('.hero-slide[data-slide="2"] img') || document.querySelector('.hero-slide[data-slide="2"] source');
      var s3src = document.querySelector('.hero-slide[data-slide="3"] img') || document.querySelector('.hero-slide[data-slide="3"] source');
      console.log("[Business Square hero carousel] READY", {
        slides: {
          1: s1src ? (s1src.getAttribute("srcset") || s1src.getAttribute("src")) : "missing",
          2: s2src ? (s2src.getAttribute("srcset") || s2src.getAttribute("src")) : "missing",
          3: s3src ? (s3src.getAttribute("srcset") || s3src.getAttribute("src")) : "missing",
        },
        hasSlick: !!window.jQuery.fn.slick,
        init: $hero.hasClass("slick-initialized"),
      });
    } catch (e) {}
  }

  // Run immediately (if DOM & jQuery ready)
  initHeroCarousel();

  // Retry once after 250ms to cover script-order race conditions
  window.setTimeout(initHeroCarousel, 250);

  // Retry after load event as final safety net (in case of deferred jQuery)
  window.addEventListener("load", function () {
    window.setTimeout(initHeroCarousel, 50);
  });

  galleryPrev.addEventListener("click", () => stepGallery(-1));
  galleryNext.addEventListener("click", () => stepGallery(1));

  galleryLightbox.addEventListener("click", (event) => {
    if (event.target.hasAttribute("data-close-gallery")) {
      closeGallery();
    }
  });

  galleryLightbox.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.changedTouches[0].screenX;
    },
    { passive: true }
  );

  galleryLightbox.addEventListener(
    "touchend",
    (event) => {
      touchEndX = event.changedTouches[0].screenX;
      const distance = touchEndX - touchStartX;
      if (Math.abs(distance) >= 40) {
        stepGallery(distance > 0 ? -1 : 1);
      }
    },
    { passive: true }
  );

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (activeDialog === "gallery") {
        closeGallery();
      } else if (activeDialog === "form") {
        pendingLeadAction = null;
        closeFormModal();
      } else if (menu.classList.contains("is-open")) {
        closeMenu();
      }
    }

    if (activeDialog === "gallery") {
      if (event.key === "ArrowLeft") {
        stepGallery(-1);
      }
      if (event.key === "ArrowRight") {
        stepGallery(1);
      }
    }
  });

  // =========================================================
  // FLOOR PLAN TAB FILTER (GROUND / BASEMENT / PODIUM / OFFICE / RECREATIONAL / TERRACE)
  // =========================================================
  const fpTabs = document.querySelectorAll(".fp-tab");
  const fpCards = document.querySelectorAll(".fp-card");
  if (fpTabs.length && fpCards.length) {
    fpTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const cat = tab.getAttribute("data-fp-tab");
        fpTabs.forEach((t) => {
          t.classList.remove("is-active");
          t.setAttribute("aria-selected", "false");
        });
        tab.classList.add("is-active");
        tab.setAttribute("aria-selected", "true");

        fpCards.forEach((card) => {
          const cardCat = card.getAttribute("data-fp-cat");
          if (cat === "all" || cardCat === cat) {
            card.style.display = "";
            card.classList.add("animate-in");
          } else {
            card.style.display = "none";
            card.classList.remove("animate-in");
          }
        });
      });
    });
  }

  // =========================================================
  // BIND FLOATING LEAD TRIGGERS + MODAL CLONE TRIGGERS AFTER FORM OPEN
  // =========================================================
  const origOpenLeadForm = typeof openLeadForm === 'function' ? openLeadForm : null;
  if (origOpenLeadForm) {
    // Replace with wrapped version
    window.openLeadForm = function (trigger) {
      origOpenLeadForm(trigger);
      // After clone, re-bind new submit button inside modal
      setTimeout(function () {
        const modalForms = document.querySelectorAll('#formModal .modal-form');
        modalForms.forEach(function (f) {
          if (!f.dataset.bsBound) {
            f.dataset.bsBound = '1';
          }
        });
      }, 0);
    };
  }

  // Sticky mobile CTA scroll guard — hide when enquiry card already visible, show otherwise
  const stickyCta = document.getElementById('mobileCtaBar');
  const enquiryCard = document.getElementById('enquiry');
  if (stickyCta && enquiryCard && 'IntersectionObserver' in window) {
    const enqObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          stickyCta.classList.remove('is-visible');
        } else {
          stickyCta.classList.add('is-visible');
        }
      });
    }, { threshold: 0.25 });
    enqObs.observe(enquiryCard);
    // Default: show on load (will hide once scrolled to enquiry)
    setTimeout(() => stickyCta.classList.add('is-visible'), 1400);
  } else if (stickyCta) {
    // Fallback — always visible
    setTimeout(() => stickyCta.classList.add('is-visible'), 800);
  }

})();
