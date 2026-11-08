/* ==========================================================================
   HOMEPAGE CONTROLLER (js/pages/home.js)
   เชื่อมต่อโครงสร้างใหม่จาก 5 ไฟล์ Desktop:
   - โหลด header.html และ footer.html
   - แสดงผล Brand Cards (บล็อกแอพตามสไตล์รูปที่ 1)
   - แสดงผล Brand Detail & Packages (ตามสไตล์รูปที่ 2)
   - แสดงสถิติและข้อมูลร้านค้า
   - ควบคุมการสแกนจ่าย QR พร้อมเพย์ และการจัดส่งรหัสสินค้าทันที
   - อัปเดตเมนูด้านล่าง Gooey Dock 406px
   ========================================================================== */

import { BRANDS, ALL_PACKAGES, State, saveAuthData, formatTHB, generateCredential, toast } from '../core.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadHeaderAndFooter();
  initStoreInfo();
  renderBrandCatalog();
  initBottomDock();
  initCheckoutSystem();
  updateTopNavAuth();
});

/* 1. โหลด Header และ Footer จากไฟล์ HTML */
async function loadHeaderAndFooter() {
  const headerContainer = document.getElementById('app-header');
  const footerContainer = document.getElementById('app-footer');

  try {
    const [hRes, fRes] = await Promise.all([
      fetch('/header.html'),
      fetch('/footer.html')
    ]);

    if (hRes.ok && headerContainer) {
      headerContainer.innerHTML = await hRes.text();
    }
    if (fRes.ok && footerContainer) {
      footerContainer.innerHTML = await fRes.text();
    }
  } catch (err) {
    console.warn('Load header/footer fallback:', err);
  }
}

/* 2. กำหนดข้อมูลร้านค้าและสถิติ */
function initStoreInfo() {
  const storeName = 'FRIENDBOOSTER';
  const subTitle = 'ไอดีแอพพรีเมียม เติมเกม และรหัสดิจิทัลอัตโนมัติ ราคาเป็นมิตร ส่งของไวตลอด 24 ชม.';

  const headerStore = document.getElementById('header-store-name');
  if (headerStore) headerStore.textContent = storeName;

  const heroStore = document.getElementById('hero-store-name');
  if (heroStore) heroStore.textContent = storeName;

  const heroSub = document.getElementById('hero-store-sub');
  if (heroSub) heroSub.textContent = subTitle;

  const footerStore = document.getElementById('footer-store-name');
  if (footerStore) footerStore.textContent = storeName;

  const statOrders = document.getElementById('stat-orders');
  if (statOrders) statOrders.textContent = State.orders.length;

  const statCatalog = document.getElementById('stat-catalog');
  if (statCatalog) statCatalog.textContent = ALL_PACKAGES.length;

  const brandBadge = document.getElementById('brand-count-badge');
  if (brandBadge) brandBadge.textContent = `ทั้งหมด ${BRANDS.length} แอพพรีเมียม`;
}

/* 3. แสดงผลตารางบล็อกแอพ (รูปที่ 1) และ หน้ารายละเอียด (รูปที่ 2) */
function renderBrandCatalog() {
  const brandGrid = document.getElementById('brand-grid');
  if (!brandGrid) return;

  brandGrid.innerHTML = BRANDS.map(b => `
    <div class="brand-card" data-brand-id="${b.id}">
      <div class="brand-thumb-wrap">
        <img src="${b.image}" alt="${b.name}" class="brand-thumb" loading="lazy" />
        <span class="brand-badge-float">${b.badge || 'VIP'}</span>
      </div>
      <div class="brand-card-name">${b.name}</div>
      <div class="brand-card-meta">${b.packageCount || b.packages.length} แพ็กเกจ • พร้อมส่ง ${b.stockCount || 10} ชิ้น</div>
      <button type="button" class="btn-select-app" data-brand-id="${b.id}">
        🛒 เลือกชมสินค้า
      </button>
    </div>
  `).join('');

  // Event เมื่อกดเลือกดูแบรนด์
  brandGrid.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-brand-id]');
    if (trigger) {
      showBrandDetail(trigger.dataset.brandId);
    }
  });
}

function showBrandDetail(brandId) {
  const brand = BRANDS.find(b => b.id === brandId);
  if (!brand) return;

  const gridView = document.getElementById('brand-grid-view');
  const detailView = document.getElementById('brand-detail-view');
  const heroBox = document.getElementById('brand-hero-box');
  const pkgTitle = document.getElementById('brand-packages-title');
  const pkgGrid = document.getElementById('brand-packages-grid');

  if (!gridView || !detailView || !heroBox || !pkgGrid) return;

  gridView.classList.add('hidden');
  detailView.classList.remove('hidden');

  // กล่องหัวเรื่องรายละเอียดแอพ (สไตล์รูปที่ 2)
  heroBox.innerHTML = `
    <img src="${brand.image}" alt="${brand.name}" class="brand-hero-poster" />
    <div class="brand-hero-info">
      <div class="brand-hero-top">
        <h2 class="brand-hero-title">รายละเอียดสินค้า ${brand.name}</h2>
        <button type="button" class="brand-btn-back" id="btn-back-to-brands" title="ย้อนกลับ">«</button>
      </div>
      <p class="brand-hero-desc">${brand.description}</p>
      <div class="brand-hero-tags">
        ${(brand.tags || ['4K ULTRA HD', 'ส่งรหัสอัตโนมัติ 24 ชม.', 'รับประกันตลอดการใช้งาน']).map(t => `
          <span class="brand-tag-pill">✨ ${t}</span>
        `).join('')}
      </div>
    </div>
  `;

  if (pkgTitle) {
    pkgTitle.innerHTML = `<span>หมวดหมู่สินค้า ${brand.name}</span>`;
  }

  // แสดงแพ็กเกจย่อยของแอพนั้นๆ
  pkgGrid.innerHTML = brand.packages.map(p => {
    const isOut = p.stock <= 0;
    return `
      <div class="pkg-card">
        <div class="pkg-thumb-wrap">
          <img src="${p.image || brand.image}" alt="${p.name}" class="pkg-thumb" loading="lazy" />
          <span class="pkg-badge-float">${p.tag || brand.badge || '4K ULTRA HD'}</span>
        </div>
        <div class="pkg-body">
          <div class="pkg-title">${p.name}</div>
          <div class="pkg-prices-row">
            <span class="pkg-price-main">${formatTHB(p.price)}</span>
            <span class="pkg-price-sub">${isOut ? 'หมดชั่วคราว' : `พร้อมส่ง ${p.stock} ชิ้น`}</span>
          </div>
          <div class="pkg-stock-bar">
            <span>⭐ รับแต้มสะสม +${p.points || 1} แต้ม</span>
          </div>
          <button type="button" class="btn-pkg-buy" data-buy-id="${p.id}" ${isOut ? 'disabled' : ''}>
            ${isOut ? '✕ สินค้าหมด' : '🛒 สั่งซื้อ'}
          </button>
        </div>
      </div>
    `;
  }).join('');

  // ปุ่มย้อนกลับ
  document.getElementById('btn-back-to-brands')?.addEventListener('click', () => {
    detailView.classList.add('hidden');
    gridView.classList.remove('hidden');
    document.getElementById('brand-catalog-section')?.scrollIntoView({ behavior: 'smooth' });
  });

  // เลื่อนหน้าจอมายังรายละเอียด
  heroBox.scrollIntoView({ behavior: 'smooth' });
}

/* 4. ระบบสั่งซื้อ ชำระเงินทันที และส่งมอบรหัส (Direct QR Checkout) */
let currentCheckoutPkg = null;

function initCheckoutSystem() {
  document.addEventListener('click', (e) => {
    const buyBtn = e.target.closest('[data-buy-id]');
    if (buyBtn) {
      const pkgId = buyBtn.dataset.buyId;
      const pkg = ALL_PACKAGES.find(p => p.id === pkgId);
      if (pkg) openDirectCheckout(pkg);
    }
  });

  // ปุ่มปิด Modal ชำระเงิน
  document.getElementById('co-close')?.addEventListener('click', closeCheckoutModal);

  // ปุ่มยืนยันชำระเงินและรับรหัสทันที
  document.getElementById('btn-confirm-slip')?.addEventListener('click', confirmPaymentAndDeliver);

  // ปุ่มปิด Delivery Modal
  document.getElementById('deliv-close')?.addEventListener('click', () => {
    document.getElementById('delivery-modal')?.classList.add('hidden');
  });

  // ปุ่มคัดลอกเลขพร้อมเพย์
  document.getElementById('btn-copy-pp')?.addEventListener('click', () => {
    const pp = document.getElementById('co-promptpay-id')?.textContent || '098-XXX-XXXX';
    navigator.clipboard.writeText(pp);
    toast('📋 คัดลอกเลขพร้อมเพย์แล้ว!', 'ok');
  });
}

function openDirectCheckout(pkg) {
  if (!State.user) {
    toast('🔒 กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อสินค้า', 'warn');
    window.location.href = '/auth.html';
    return;
  }

  currentCheckoutPkg = pkg;
  const modal = document.getElementById('checkout-modal');
  if (!modal) return;

  const itemsList = document.getElementById('co-items-list');
  const totalPrice = document.getElementById('co-total-price');
  const earnPoints = document.getElementById('co-earn-points');
  const qrWrap = document.getElementById('co-qr-wrap');
  const ppId = document.getElementById('co-promptpay-id');
  const accName = document.getElementById('co-acc-name');

  if (itemsList) {
    itemsList.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;padding:8px 0;">
        <img src="${pkg.image}" style="width:46px;height:46px;border-radius:8px;object-fit:cover;" />
        <div style="flex:1;">
          <div style="font-weight:700;font-size:0.88rem;color:#ffffff;">${pkg.name}</div>
          <div style="font-size:0.75rem;color:var(--text-muted);">จำนวน: 1 ชิ้น</div>
        </div>
        <div style="font-weight:800;color:var(--pink);">${formatTHB(pkg.price)}</div>
      </div>
    `;
  }

  if (totalPrice) totalPrice.textContent = formatTHB(pkg.price);
  if (earnPoints) earnPoints.textContent = `⭐ รับแต้มสะสม +${pkg.points || 1} แต้ม`;
  if (ppId) ppId.textContent = '098-765-4321';
  if (accName) accName.textContent = 'บัญชี: FRIENDBOOSTER (ระบบอัตโนมัติ 24 ชม.)';

  // สร้าง QR Code พร้อมเพย์
  if (qrWrap) {
    qrWrap.innerHTML = `
      <svg viewBox="0 0 140 140" width="140" height="140">
        <rect width="140" height="140" fill="#ffffff" rx="8" />
        <rect x="10" y="10" width="36" height="36" fill="#000" rx="3" />
        <rect x="16" y="16" width="24" height="24" fill="#fff" rx="2" />
        <rect x="22" y="22" width="12" height="12" fill="#000" rx="1" />
        <rect x="94" y="10" width="36" height="36" fill="#000" rx="3" />
        <rect x="100" y="16" width="24" height="24" fill="#fff" rx="2" />
        <rect x="106" y="22" width="12" height="12" fill="#000" rx="1" />
        <rect x="10" y="94" width="36" height="36" fill="#000" rx="3" />
        <rect x="16" y="100" width="24" height="24" fill="#fff" rx="2" />
        <rect x="22" y="106" width="12" height="12" fill="#000" rx="1" />
        <rect x="58" y="15" width="24" height="15" fill="#000" />
        <rect x="58" y="45" width="24" height="24" fill="#ff2d78" rx="3" />
        <rect x="15" y="58" width="30" height="24" fill="#000" />
        <rect x="95" y="58" width="30" height="24" fill="#000" />
        <rect x="58" y="80" width="24" height="45" fill="#000" />
        <rect x="90" y="90" width="36" height="36" fill="#000" />
      </svg>
    `;
  }

  modal.classList.remove('hidden');
}

function closeCheckoutModal() {
  document.getElementById('checkout-modal')?.classList.add('hidden');
}

function confirmPaymentAndDeliver() {
  if (!currentCheckoutPkg || !State.user) return;

  const pkg = currentCheckoutPkg;
  const credential = generateCredential(pkg.name);

  // บันทึกคำสั่งซื้อ
  const newOrder = {
    orderId: 'FB' + Math.floor(100000 + Math.random() * 900000),
    owner: State.user.username,
    name: pkg.name,
    image: pkg.image,
    paidText: formatTHB(pkg.price),
    date: new Date().toLocaleString('th-TH'),
    credential: credential
  };

  State.orders.unshift(newOrder);
  saveAuthData();

  closeCheckoutModal();

  // เปิด Delivery Modal มอบรหัสทันที
  const delivModal = document.getElementById('delivery-modal');
  const credBox = document.getElementById('deliv-cred-container');
  const meta = document.getElementById('deliv-meta');

  if (meta) meta.textContent = `ออเดอร์ #${newOrder.orderId} • ${newOrder.name}`;

  if (credBox) {
    credBox.innerHTML = `
      <div class="cred-box">
        <div style="font-size:0.8rem;color:var(--text-dim);margin-bottom:6px;">รหัสเข้าใช้งานของคุณ:</div>
        <div class="cred-val" style="color:#ffffff;font-size:0.95rem;margin-bottom:12px;">${credential}</div>
        <button type="button" class="btn btn-primary btn-full btn-sm" id="btn-copy-deliv">
          📋 คัดลอกรหัสเข้าใช้งาน
        </button>
      </div>
    `;

    document.getElementById('btn-copy-deliv')?.addEventListener('click', () => {
      navigator.clipboard.writeText(credential);
      toast('📋 คัดลอกรหัสเข้าใช้งานเรียบร้อยแล้ว!', 'ok');
    });
  }

  if (delivModal) delivModal.classList.remove('hidden');

  toast('🎉 ชำระเงินสำเร็จ! จัดส่งรหัสสินค้าเข้าประวัติเรียบร้อยแล้ว', 'ok');
  updateTopNavAuth();
}

/* 5. อัปเดตสถานะเมนูบน (Header Auth & Cart) */
function updateTopNavAuth() {
  setTimeout(() => {
    const guestBox = document.getElementById('nav-guest');
    const userBox = document.getElementById('nav-user');
    const navUser = document.getElementById('nav-username');
    const navPoints = document.getElementById('nav-points-balance');
    const navCartCount = document.getElementById('nav-cart-count');

    const userOrders = State.user 
      ? State.orders.filter(o => o.owner === State.user.username)
      : [];

    if (navCartCount) navCartCount.textContent = userOrders.length;

    if (State.user) {
      guestBox?.classList.add('hidden');
      userBox?.classList.remove('hidden');
      if (navUser) navUser.textContent = `@${State.user.username}`;
      if (navPoints) navPoints.textContent = `${State.user.points || 0} แต้ม`;
    } else {
      userBox?.classList.add('hidden');
      guestBox?.classList.remove('hidden');
    }

    document.getElementById('btn-logout')?.addEventListener('click', () => {
      State.user = null;
      saveAuthData();
      updateTopNavAuth();
      toast('🚪 ออกจากระบบเรียบร้อยแล้ว', 'info');
    });
  }, 100);
}

/* 6. แถบด็อกเมนูด้านล่าง Gooey Dock 406px */
function initBottomDock() {
  setTimeout(() => {
    const items = document.querySelectorAll('.bnav-item');
    items.forEach(item => {
      if (item.getAttribute('data-nav') === 'home') {
        item.classList.add('active');
      }
      item.addEventListener('click', () => {
        items.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      });
    });
  }, 100);
}
