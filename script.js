/**
 * Sergio's Liquor Warehouse - Main JavaScript
 * Vanilla JS, no external dependencies
 */

document.addEventListener('DOMContentLoaded', function () {

  // =========================================================================
  // 1. AGE VERIFICATION MODAL
  //    Shows on first visit per session. User must confirm they are 21+.
  // =========================================================================

  (function initAgeVerification() {
    if (sessionStorage.getItem('ageVerified')) return;

    var overlay = document.getElementById('age-modal-overlay');
    if (!overlay) return;

    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    var confirmBtn = overlay.querySelector('.age-confirm');
    var denyBtn = overlay.querySelector('.age-deny');

    if (confirmBtn) {
      confirmBtn.addEventListener('click', function () {
        sessionStorage.setItem('ageVerified', 'true');
        overlay.style.display = 'none';
        document.body.style.overflow = '';
      });
    }

    if (denyBtn) {
      denyBtn.addEventListener('click', function () {
        window.location.href = 'https://www.google.com';
      });
    }
  })();


  // =========================================================================
  // 2. STICKY HEADER
  //    Adds a class to the header once the user scrolls past a threshold.
  // =========================================================================

  (function initStickyHeader() {
    var header = document.querySelector('header');
    if (!header) return;

    var stickyThreshold = header.offsetHeight;

    window.addEventListener('scroll', function () {
      if (window.scrollY > stickyThreshold) {
        header.classList.add('sticky');
      } else {
        header.classList.remove('sticky');
      }
    });
  })();


  // =========================================================================
  // 3. MOBILE NAV TOGGLE
  //    Hamburger button opens/closes a responsive navigation menu.
  // =========================================================================

  (function initMobileNav() {
    var toggleBtn = document.querySelector('.nav-toggle');
    var navMenu = document.querySelector('.nav-menu');
    if (!toggleBtn || !navMenu) return;

    toggleBtn.addEventListener('click', function () {
      var isOpen = navMenu.classList.toggle('open');
      toggleBtn.classList.toggle('active', isOpen);
      toggleBtn.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when a nav link is clicked
    navMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navMenu.classList.remove('open');
        toggleBtn.classList.remove('active');
        toggleBtn.setAttribute('aria-expanded', 'false');
      });
    });
  })();


  // =========================================================================
  // 4. HERO CAROUSEL
  //    Auto-rotating banners with dot indicators, prev/next arrows,
  //    and pause-on-hover.
  // =========================================================================

  (function initHeroCarousel() {
    var carousel = document.querySelector('.hero-carousel');
    if (!carousel) return;

    var slides = carousel.querySelectorAll('.carousel-slide');
    var dotsContainer = carousel.querySelector('.carousel-dots');
    var prevBtn = carousel.querySelector('.carousel-prev');
    var nextBtn = carousel.querySelector('.carousel-next');

    if (slides.length === 0) return;

    var currentIndex = 0;
    var autoPlayInterval = null;
    var INTERVAL_MS = 5000;

    // Build dot indicators
    if (dotsContainer) {
      slides.forEach(function (_, i) {
        var dot = document.createElement('button');
        dot.classList.add('carousel-dot');
        dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', function () {
          goToSlide(i);
        });
        dotsContainer.appendChild(dot);
      });
    }

    var dots = dotsContainer ? dotsContainer.querySelectorAll('.carousel-dot') : [];

    function goToSlide(index) {
      slides[currentIndex].classList.remove('active');
      if (dots[currentIndex]) dots[currentIndex].classList.remove('active');

      currentIndex = (index + slides.length) % slides.length;

      slides[currentIndex].classList.add('active');
      if (dots[currentIndex]) dots[currentIndex].classList.add('active');
    }

    function nextSlide() {
      goToSlide(currentIndex + 1);
    }

    function prevSlide() {
      goToSlide(currentIndex - 1);
    }

    // Arrow buttons
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);

    // Auto-play
    function startAutoPlay() {
      stopAutoPlay();
      autoPlayInterval = setInterval(nextSlide, INTERVAL_MS);
    }

    function stopAutoPlay() {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
      }
    }

    // Pause on hover
    carousel.addEventListener('mouseenter', stopAutoPlay);
    carousel.addEventListener('mouseleave', startAutoPlay);

    startAutoPlay();
  })();


  // =========================================================================
  // 5. SEARCH BAR
  //    Focus effects and placeholder behavior.
  // =========================================================================

  (function initSearchBar() {
    var searchInput = document.querySelector('.search-input');
    var searchWrap = document.querySelector('.search-bar');
    if (!searchInput) return;

    var defaultPlaceholder = searchInput.getAttribute('placeholder') || 'Search wines, spirits, beer...';

    searchInput.addEventListener('focus', function () {
      searchInput.setAttribute('placeholder', 'Type to search...');
      if (searchWrap) searchWrap.classList.add('focused');
    });

    searchInput.addEventListener('blur', function () {
      searchInput.setAttribute('placeholder', defaultPlaceholder);
      if (searchWrap) searchWrap.classList.remove('focused');
    });
  })();


  // =========================================================================
  // 6. PRODUCT QUANTITY BUTTONS
  //    Increment / decrement quantity in the cart, then recalculate totals.
  // =========================================================================

  function getCartItems() {
    return document.querySelectorAll('.cart-item');
  }

  function bindQuantityButtons() {
    getCartItems().forEach(function (item) {
      var minusBtn = item.querySelector('.qty-minus');
      var plusBtn = item.querySelector('.qty-plus');
      var qtyInput = item.querySelector('.qty-input');
      var priceEl = item.querySelector('.item-price');
      var lineTotalEl = item.querySelector('.item-line-total');

      if (!qtyInput) return;

      function updateLineTotal() {
        var qty = parseInt(qtyInput.value, 10) || 1;
        if (qty < 1) qty = 1;
        qtyInput.value = qty;

        if (priceEl && lineTotalEl) {
          var unitPrice = parseFloat(priceEl.dataset.price || priceEl.textContent.replace(/[^0-9.]/g, ''));
          lineTotalEl.textContent = '$' + (unitPrice * qty).toFixed(2);
        }

        updateCartTotals();
      }

      if (minusBtn) {
        minusBtn.addEventListener('click', function () {
          var current = parseInt(qtyInput.value, 10) || 1;
          if (current > 1) {
            qtyInput.value = current - 1;
            updateLineTotal();
          }
        });
      }

      if (plusBtn) {
        plusBtn.addEventListener('click', function () {
          var current = parseInt(qtyInput.value, 10) || 1;
          qtyInput.value = current + 1;
          updateLineTotal();
        });
      }

      qtyInput.addEventListener('change', updateLineTotal);
    });
  }

  bindQuantityButtons();


  // =========================================================================
  // 7. CART CALCULATIONS
  //    Subtotal, tax (8.25%), member savings (5%), and grand total.
  // =========================================================================

  var TAX_RATE = 0.0825;
  var MEMBER_DISCOUNT = 0.05;

  function updateCartTotals() {
    var items = getCartItems();
    var subtotal = 0;

    items.forEach(function (item) {
      var lineTotalEl = item.querySelector('.item-line-total');
      if (lineTotalEl) {
        subtotal += parseFloat(lineTotalEl.textContent.replace(/[^0-9.]/g, '')) || 0;
      }
    });

    var subtotalEl = document.getElementById('cart-subtotal');
    var taxEl = document.getElementById('cart-tax');
    var savingsEl = document.getElementById('cart-savings');
    var totalEl = document.getElementById('cart-total');

    var tax = subtotal * TAX_RATE;

    // Check if the member discount checkbox is active
    var memberCheckbox = document.getElementById('member-discount');
    var savings = 0;
    if (memberCheckbox && memberCheckbox.checked) {
      savings = subtotal * MEMBER_DISCOUNT;
    }

    // Apply promo discount if present
    var promoDiscount = parseFloat(sessionStorage.getItem('promoDiscount') || '0');
    var promoAmount = subtotal * promoDiscount;
    var promoEl = document.getElementById('cart-promo');

    var total = subtotal + tax - savings - promoAmount;
    if (total < 0) total = 0;

    if (subtotalEl) subtotalEl.textContent = '$' + subtotal.toFixed(2);
    if (taxEl) taxEl.textContent = '$' + tax.toFixed(2);
    if (savingsEl) savingsEl.textContent = '-$' + savings.toFixed(2);
    if (promoEl) promoEl.textContent = '-$' + promoAmount.toFixed(2);
    if (totalEl) totalEl.textContent = '$' + total.toFixed(2);
  }

  // Recalculate when member discount is toggled
  var memberCheckbox = document.getElementById('member-discount');
  if (memberCheckbox) {
    memberCheckbox.addEventListener('change', updateCartTotals);
  }

  // Initial calculation
  updateCartTotals();


  // =========================================================================
  // 8. FILTER SIDEBAR TOGGLE (Mobile)
  //    Show/hide the product filter panel on smaller screens.
  // =========================================================================

  (function initFilterToggle() {
    var filterToggle = document.querySelector('.filter-toggle');
    var filterSidebar = document.querySelector('.filter-sidebar');
    if (!filterToggle || !filterSidebar) return;

    filterToggle.addEventListener('click', function () {
      var isOpen = filterSidebar.classList.toggle('open');
      filterToggle.textContent = isOpen ? 'Hide Filters' : 'Show Filters';
      filterToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close when clicking the overlay or a close button inside
    var closeBtn = filterSidebar.querySelector('.filter-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        filterSidebar.classList.remove('open');
        filterToggle.textContent = 'Show Filters';
        filterToggle.setAttribute('aria-expanded', 'false');
      });
    }
  })();


  // =========================================================================
  // 9. SORT DROPDOWN
  //    Visually reorders product cards based on the selected option.
  // =========================================================================

  (function initSortDropdown() {
    var sortSelect = document.querySelector('.sort-select');
    var productGrid = document.querySelector('.product-grid');
    if (!sortSelect || !productGrid) return;

    sortSelect.addEventListener('change', function () {
      var value = sortSelect.value;
      var cards = Array.from(productGrid.querySelectorAll('.product-card'));

      cards.sort(function (a, b) {
        switch (value) {
          case 'price-low':
            return getPrice(a) - getPrice(b);
          case 'price-high':
            return getPrice(b) - getPrice(a);
          case 'name-az':
            return getName(a).localeCompare(getName(b));
          case 'name-za':
            return getName(b).localeCompare(getName(a));
          default:
            // 'featured' or default — use original DOM order via data attribute
            return (parseInt(a.dataset.order, 10) || 0) - (parseInt(b.dataset.order, 10) || 0);
        }
      });

      // Re-append in new order (moves rather than clones)
      cards.forEach(function (card) {
        productGrid.appendChild(card);
      });
    });

    function getPrice(card) {
      var el = card.querySelector('.product-price');
      return el ? parseFloat(el.textContent.replace(/[^0-9.]/g, '')) || 0 : 0;
    }

    function getName(card) {
      var el = card.querySelector('.product-name');
      return el ? el.textContent.trim().toLowerCase() : '';
    }
  })();


  // =========================================================================
  // 10. FAQ ACCORDION
  //     Toggle open/close for FAQ items on the membership page.
  // =========================================================================

  (function initFaqAccordion() {
    var questions = document.querySelectorAll('.faq-question');
    if (questions.length === 0) return;

    questions.forEach(function (question) {
      question.addEventListener('click', function () {
        var item = question.closest('.faq-item');
        var answer = item ? item.querySelector('.faq-answer') : null;
        if (!item || !answer) return;

        var isOpen = item.classList.toggle('open');
        question.setAttribute('aria-expanded', isOpen);

        // Slide animation via max-height
        if (isOpen) {
          answer.style.maxHeight = answer.scrollHeight + 'px';
        } else {
          answer.style.maxHeight = '0';
        }
      });
    });
  })();


  // =========================================================================
  // 11. TABS (Deals Page)
  //     Category tabs that switch visible content panels.
  // =========================================================================

  (function initTabs() {
    var tabContainers = document.querySelectorAll('.tabs');

    tabContainers.forEach(function (container) {
      var buttons = container.querySelectorAll('.tab-btn');
      var parentSection = container.closest('.tabs-section') || container.parentElement;
      var panels = parentSection.querySelectorAll('.tab-panel');

      buttons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var target = btn.dataset.tab;

          // Deactivate all
          buttons.forEach(function (b) { b.classList.remove('active'); });
          panels.forEach(function (p) { p.classList.remove('active'); });

          // Activate selected
          btn.classList.add('active');
          var targetPanel = parentSection.querySelector('#' + target);
          if (targetPanel) targetPanel.classList.add('active');
        });
      });
    });
  })();


  // =========================================================================
  // 12. ADD TO CART
  //     Button click animation and update cart count badge in the header.
  // =========================================================================

  (function initAddToCart() {
    var cartCount = document.querySelector('.cart-count');
    var currentCount = cartCount ? parseInt(cartCount.textContent, 10) || 0 : 0;

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.add-to-cart');
      if (!btn) return;

      // Animate the button
      btn.classList.add('added');
      var originalText = btn.textContent;
      btn.textContent = 'Added!';

      setTimeout(function () {
        btn.classList.remove('added');
        btn.textContent = originalText;
      }, 1500);

      // Update cart count in header
      currentCount++;
      if (cartCount) {
        cartCount.textContent = currentCount;
        cartCount.classList.add('bump');
        setTimeout(function () {
          cartCount.classList.remove('bump');
        }, 300);
      }
    });
  })();


  // =========================================================================
  // 13. PROMO CODE
  //     Accepts "SERGIO10" for 10% off. Updates cart totals accordingly.
  // =========================================================================

  (function initPromoCode() {
    var promoInput = document.querySelector('.promo-input');
    var promoBtn = document.querySelector('.promo-apply');
    var promoMsg = document.querySelector('.promo-message');
    if (!promoInput || !promoBtn) return;

    promoBtn.addEventListener('click', function () {
      var code = promoInput.value.trim().toUpperCase();

      if (code === 'SERGIO10') {
        sessionStorage.setItem('promoDiscount', '0.10');
        if (promoMsg) {
          promoMsg.textContent = 'Promo applied! 10% off your order.';
          promoMsg.className = 'promo-message success';
        }
        promoBtn.disabled = true;
        promoInput.disabled = true;
      } else if (code === '') {
        if (promoMsg) {
          promoMsg.textContent = 'Please enter a promo code.';
          promoMsg.className = 'promo-message error';
        }
      } else {
        sessionStorage.setItem('promoDiscount', '0');
        if (promoMsg) {
          promoMsg.textContent = 'Invalid promo code. Try again.';
          promoMsg.className = 'promo-message error';
        }
      }

      updateCartTotals();
    });

    // Allow pressing Enter to apply
    promoInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        promoBtn.click();
      }
    });
  })();


  // =========================================================================
  // 14. SMOOTH SCROLL
  //     Smooth scrolling for all anchor links pointing to an on-page ID.
  // =========================================================================

  (function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (targetId === '#' || targetId.length < 2) return;

        var target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Update URL hash without jumping
        if (history.pushState) {
          history.pushState(null, null, targetId);
        }
      });
    });
  })();


  // =========================================================================
  // 15. NEWSLETTER FORM
  //     Basic email validation before submission.
  // =========================================================================

  (function initNewsletter() {
    var form = document.querySelector('.newsletter-form');
    if (!form) return;

    var emailInput = form.querySelector('input[type="email"], .newsletter-email');
    var msgEl = form.querySelector('.newsletter-message');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!emailInput) return;

      var email = emailInput.value.trim();
      var isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!isValid) {
        if (msgEl) {
          msgEl.textContent = 'Please enter a valid email address.';
          msgEl.className = 'newsletter-message error';
        }
        emailInput.focus();
        return;
      }

      // Success state
      if (msgEl) {
        msgEl.textContent = 'Thanks for subscribing! Check your inbox for exclusive deals.';
        msgEl.className = 'newsletter-message success';
      }
      emailInput.value = '';
    });
  })();


  // =========================================================================
  // 16. BACK TO TOP BUTTON
  //     Appears after scrolling down, smooth-scrolls to top on click.
  // =========================================================================

  (function initBackToTop() {
    var btn = document.querySelector('.back-to-top');
    if (!btn) return;

    var SHOW_AFTER_PX = 400;

    window.addEventListener('scroll', function () {
      if (window.scrollY > SHOW_AFTER_PX) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  })();

});
