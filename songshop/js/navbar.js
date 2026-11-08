/* ==========================================================================
   NAVBAR CONTROLLER (js/navbar.js)
   ควบคุมเมนูด้านบนและเมนูด้านล่าง ให้เหมือนรูปเป๊ะๆ (Pixel Perfect):
   - ด้านขวาบน: 🛒 ตะกร้า 0 | ⭐ @username • 0 แต้ม | [-> ออกจากระบบ
   ========================================================================== */

(() => {
  const { $, $$, State } = window.Nova;
  let renderViewCallback = null;

  function initNavbars(onRenderView) {
    renderViewCallback = onRenderView;

    // ผูก Event คลิกสลับหน้า
    document.addEventListener('click', (e) => {
      const navTrigger = e.target.closest('[data-page]');
      if (navTrigger) {
        e.preventDefault();
        navigateTo(navTrigger.dataset.page);
        return;
      }

      // กดปุ่มเข้าสู่ระบบ หรือ สมัครสมาชิก ที่มุมขวาบน
      const authBtn = e.target.closest('[data-action-auth]');
      if (authBtn) {
        e.preventDefault();
        State.authMode = authBtn.dataset.actionAuth;
        navigateTo('login');
      }
    });

    // เอฟเฟกต์เลื่อนแถบ .indicator ตามเมาส์เวลาชี้เมนูด้านบน
    const topLinks = $$('.navbar ul li a');
    const topUl = $('.navbar ul');

    topLinks.forEach((link) => {
      link.addEventListener('mouseenter', () => moveTopIndicator(link));
    });

    topUl?.addEventListener('mouseleave', () => {
      const activeLink = $(`.navbar ul li a[data-page="${State.activePage}"]`);
      if (activeLink) moveTopIndicator(activeLink);
    });

    window.addEventListener('resize', () => {
      syncNavPositions(State.activePage);
    });
  }

  function navigateTo(page, smoothScroll = true) {
    State.activePage = page;
    if (renderViewCallback) renderViewCallback(page);
    updateNavUserBadges();
    requestAnimationFrame(() => syncNavPositions(page));
    if (smoothScroll) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* เลื่อนแถบเรืองแสง .indicator ของเมนูด้านบน */
  function moveTopIndicator(targetLink) {
    const indicator = $('.navbar .indicator');
    if (!indicator || !targetLink) return;
    const li = targetLink.parentElement;
    indicator.style.width = `${li.offsetWidth}px`;
    indicator.style.transform = `translateX(${li.offsetLeft}px)`;
  }

  /* ซิงค์ตำแหน่งทั้งเมนูด้านบนและเมนูด้านล่าง (ตามรูป) */
  function syncNavPositions(page) {
    // 1. เมนูด้านบน
    $$('.navbar ul li a').forEach((a) => {
      a.classList.toggle('active', a.dataset.page === page);
    });
    const activeTop = $(`.navbar ul li a[data-page="${page}"]`);
    if (activeTop) {
      moveTopIndicator(activeTop);
      $('.navbar .indicator')?.style.setProperty('opacity', '1');
    } else {
      $('.navbar .indicator')?.style.setProperty('opacity', '0');
    }

    // 2. เมนูด้านล่าง (4 ปุ่มตามรูป)
    $$('.bottom-item').forEach((item) => {
      item.classList.toggle('active', item.dataset.page === page);
    });
  }

  /* อัปเดตตะกร้า และแถบขวาบน ⭐ @username • 0 แต้ม + ปุ่มออก [-> เป๊ะๆ */
  function updateNavUserBadges() {
    const cartBadge = $('#cart-count-badge');
    const authSlot = $('#auth-actions-slot');

    const userOrdersCount = State.user 
      ? State.orders.filter(o => o.owner === State.user.username).length
      : 0;

    if (cartBadge) {
      cartBadge.textContent = userOrdersCount;
    }

    if (authSlot) {
      if (State.user) {
        // ตามรูปภาพเป๊ะๆ: ⭐ @inblackino123 • 0 แต้ม  และปุ่มไอคอนออกจากระบบ [->
        const userPoints = State.user.points || 0;
        authSlot.innerHTML = `
          <div class="user-badge-pill" data-page="rewards" title="แต้มสะสมของคุณ">
            <span class="user-badge-star">⭐</span>
            <span>@${State.user.username} • ${userPoints} แต้ม</span>
          </div>
          <button class="btn-header-logout" id="btn-logout" title="ออกจากระบบ">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        `;
      } else {
        authSlot.innerHTML = `
          <button class="btn-header-login" data-action-auth="login">เข้าสู่ระบบ</button>
          <button class="btn-header-register" data-action-auth="register">สมัครสมาชิก</button>
        `;
      }
    }
  }

  Object.assign(window.Nova, {
    initNavbars,
    navigateTo,
    syncNavPositions,
    updateNavUserBadges
  });
})();
