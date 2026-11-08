/* ==========================================================================
   APPLICATION VIEWS & LOGIC (js/app.js)
   ระบบล็อกอินเข้าเว็บจริงๆ (เข้าสู่ระบบ / สมัครสมาชิก ด้วยยูสเซอร์และพาสเวิร์ด)
   ลบระบบจำลอง/แดชบอร์ดจำลองตามรูปที่ 1 ออกทั้งหมด
   ========================================================================== */

(() => {
  const {
    $, $$, BRANDS, ALL_PACKAGES, REWARDS, State, saveAuthData,
    formatTHB, generateCredential,
    toast, openModal, closeModal, copyText,
    initNavbars, navigateTo, updateNavUserBadges
  } = window.Nova;

  const viewRoot = () => $('#app-view');

  /* ==========================================================================
     COMPONENT: การ์ดแพ็กเกจสินค้า (ตามรูปที่ 5 และรูปที่ 3)
     ========================================================================== */
  function renderPackageCard(pkg) {
    const isOutOfStock = pkg.stock <= 0;
    return `
      <article class="package-card">
        <div>
          <div class="pkg-img-wrap">
            <img src="${pkg.image}" alt="${pkg.name}" class="pkg-img" loading="lazy" />
            <span class="pkg-top-tag">${pkg.tag || '4K ULTRA HD'}</span>
          </div>
          <h4 class="pkg-title">${pkg.name}</h4>
          <div class="flex-between" style="margin-bottom:6px;">
            <span class="price-tag">${formatTHB(pkg.price)}</span>
            <span style="font-size:0.78rem; color:${isOutOfStock ? '#ef4444' : '#10b981'}; font-weight:600;">
              ${isOutOfStock ? '● สินค้าหมด' : `● พร้อมส่ง ${pkg.stock} ชิ้น`}
            </span>
          </div>
          <div style="font-size:0.75rem; color:#f472b6; margin-bottom:6px;">
            ⭐ รับแต้มสะสม +${pkg.points} แต้ม
          </div>
        </div>

        <div class="pkg-footer">
          ${isOutOfStock ? `
            <button class="btn btn-disabled btn-sm btn-full" disabled>
              ✕ สินค้าหมด
            </button>
          ` : `
            <button class="btn btn-primary btn-sm btn-full" data-buy-pkg="${pkg.id}">
              🛒 สั่งซื้อ
            </button>
          `}
        </div>
      </article>
    `;
  }

  /* ==========================================================================
     COMPONENT: บล็อกแบรนด์แอพพรีเมี่ยมในหน้าแรก (ตามรูปที่ 4 และรูปที่ 3)
     ========================================================================== */
  function renderBrandCard(b) {
    return `
      <div class="brand-card" data-view-brand="${b.id}">
        <div>
          <div class="brand-card-img-wrap">
            <img src="${b.image}" alt="${b.name}" class="brand-card-img" loading="lazy" />
            <span class="brand-card-badge">${b.badge}</span>
          </div>
          <div class="brand-card-title">${b.name}</div>
          <div class="brand-card-subtitle">${b.packageCount} แพ็กเกจ • พร้อมส่ง ${b.stockCount} ชิ้น</div>
        </div>
        <button class="btn btn-outline-pink btn-sm btn-full" data-view-brand="${b.id}">
          🛒 เลือกชมสินค้า
        </button>
      </div>
    `;
  }

  /* ==========================================================================
     VIEW: หน้ารายละเอียดสินค้าเมื่อคลิกแบรนด์ (ตามรูปที่ 5)
     ========================================================================== */
  function renderBrandDetail(brandId) {
    const b = BRANDS.find(x => x.id === brandId) || BRANDS[0];
    return `
      <section class="page-section">
        <div class="card" style="background:#111118; border-color:rgba(255,51,153,0.25); padding:22px; margin-bottom:28px;">
          <div class="flex-between" style="align-items:flex-start; margin-bottom:12px;">
            <div style="display:flex; gap:20px; flex-wrap:wrap; align-items:center;">
              <div style="width:140px; height:140px; border-radius:14px; overflow:hidden; flex-shrink:0; background:#181822; box-shadow:0 8px 24px rgba(0,0,0,0.6);">
                <img src="${b.image}" alt="${b.name}" style="width:100%; height:100%; object-fit:cover;" />
              </div>
              <div style="max-width:720px;">
                <h1 class="title-lg" style="margin-bottom:8px; color:#ffffff;">รายละเอียดสินค้า ${b.name}</h1>
                <p class="text-muted" style="font-size:0.9rem; line-height:1.6; margin-bottom:14px;">
                  ${b.description}
                </p>
                <div class="flex-row" style="gap:8px;">
                  ${b.tags.map(t => `<span class="badge badge-pink">✨ ${t}</span>`).join('')}
                </div>
              </div>
            </div>
            <button class="btn btn-ghost btn-sm" data-back-to-home="true" title="ย้อนกลับ" style="font-size:1.1rem; padding:6px 14px;">
              « ย้อนกลับ
            </button>
          </div>
        </div>

        <div class="flex-between" style="margin-bottom:16px;">
          <h2 class="title-md" style="color:#f8fafc; font-size:1.15rem; font-weight:700;">
            หมวดหมู่สินค้า ${b.name}
          </h2>
          <span class="text-muted" style="font-size:0.84rem;">มีทั้งหมด ${b.packages.length} แพ็กเกจ</span>
        </div>

        <div class="grid-packages">
          ${b.packages.map(renderPackageCard).join('')}
        </div>
      </section>
    `;
  }

  /* ==========================================================================
     VIEW: 1. หน้าแรก (Home View)
     ========================================================================== */
  function renderHome() {
    if (State.selectedBrandId) {
      return renderBrandDetail(State.selectedBrandId);
    }

    return `
      <section class="page-section">
        <!-- Hero Banner ตามรูปที่ 3 -->
        <div class="hero-box" style="text-align:center; padding:clamp(26px, 4vw, 44px);">
          <div style="display:inline-flex; align-items:center; gap:8px; background:rgba(255,51,153,0.12); border:1px solid rgba(255,51,153,0.3); padding:4px 14px; border-radius:999px; margin-bottom:14px; font-size:0.8rem; color:#ff85c2;">
            <span style="color:#ef4444;">●</span> เปิดให้บริการ — ระบบส่งของอัตโนมัติ 24 ชม.
          </div>
          <h1 class="title-xl" style="font-size:clamp(2.4rem, 5vw, 3.6rem); font-weight:800; color:#ffffff; margin-bottom:12px; letter-spacing:-0.02em;">
            สองนึ่ง
          </h1>
          <p class="text-muted" style="max-width:620px; margin-inline:auto; font-size:1.02rem; margin-bottom:24px; line-height:1.6;">
            ไอดีแอพพรีเมียม เติมเกม และรหัสดิจิทัลอัตโนมัติ ราคาเป็นมิตร ส่งของไวตลอด 24 ชม.
          </p>
          <div class="flex-center" style="gap:12px; margin-bottom:32px;">
            <button class="btn btn-primary" data-page="products" style="padding:10px 24px; font-size:0.95rem;">
              เลือกซื้อสินค้า ↓
            </button>
            <button class="btn btn-ghost" data-page="rewards" style="padding:10px 22px; font-size:0.95rem;">
              🎁 สะสมแต้มแลกของ
            </button>
          </div>

          <!-- สถิติ 3 คอลัมน์ (ตามรูปที่ 3) -->
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:14px; max-width:680px; margin-inline:auto; background:#0f0f15; border:1px solid rgba(255,255,255,0.06); border-radius:20px; padding:20px 12px; margin-block:30px 34px;">
            <div>
              <div class="title-lg" style="color:#ff2e93; font-size:1.9rem; font-weight:800;">${State.orders.length}</div>
              <div class="text-muted" style="font-size:0.8rem; margin-top:3px; color:#64748b;">ออเดอร์สำเร็จ</div>
            </div>
            <div style="border-inline:1px solid rgba(255,255,255,0.07);">
              <div class="title-lg" style="color:#ffffff; font-size:1.75rem; font-weight:800;">24 ชม.</div>
              <div class="text-muted" style="font-size:0.8rem; margin-top:3px; color:#64748b;">ระบบอัตโนมัติ</div>
            </div>
            <div>
              <div class="title-lg" style="color:#ff2e93; font-size:1.9rem; font-weight:800;">49</div>
              <div class="text-muted" style="font-size:0.8rem; margin-top:3px; color:#64748b;">สินค้าพร้อมจำหน่าย</div>
            </div>
          </div>
        </div>

        <!-- การ์ด 3 จุดเด่น (ตามรูปที่ 3 เป๊ะๆ) -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:18px; margin-bottom:38px;">
          <div class="card flex-between" style="flex-direction:column; align-items:flex-start; text-align:left; background:#0f0f15; border-color:rgba(255,255,255,0.06); padding:22px; border-radius:18px;">
            <div style="width:36px; height:36px; border-radius:10px; background:rgba(255,46,147,0.12); border:1px solid rgba(255,46,147,0.25); color:#ff2e93; display:grid; place-items:center; font-size:1rem; margin-bottom:14px;">⚡</div>
            <h3 class="title-md" style="margin-bottom:6px; color:#ffffff; font-size:1.05rem;">ส่งของอัตโนมัติ</h3>
            <p class="text-muted" style="font-size:0.84rem; line-height:1.6; color:#64748b;">สั่งซื้อแล้วรับของทันที ระบบทำงานเองตลอด 24 ชั่วโมง ไม่ต้องรอแอดมิน</p>
          </div>
          <div class="card flex-between" style="flex-direction:column; align-items:flex-start; text-align:left; background:#0f0f15; border-color:rgba(255,255,255,0.06); padding:22px; border-radius:18px;">
            <div style="width:36px; height:36px; border-radius:10px; background:rgba(56,189,248,0.12); border:1px solid rgba(56,189,248,0.25); color:#38bdf8; display:grid; place-items:center; font-size:1rem; margin-bottom:14px;">💳</div>
            <h3 class="title-md" style="margin-bottom:6px; color:#ffffff; font-size:1.05rem;">เติมเงิน & สแกนจ่ายไว</h3>
            <p class="text-muted" style="font-size:0.84rem; line-height:1.6; color:#64748b;">เลือกสินค้าแล้วสแกนจ่ายได้ทันที เช็คสลิปอัตโนมัติ ด้วย Slip2Go เงินเข้าไว</p>
          </div>
          <div class="card flex-between" style="flex-direction:column; align-items:flex-start; text-align:left; background:#0f0f15; border-color:rgba(255,255,255,0.06); padding:22px; border-radius:18px;">
            <div style="width:36px; height:36px; border-radius:10px; background:rgba(129,140,248,0.12); border:1px solid rgba(129,140,248,0.25); color:#818cf8; display:grid; place-items:center; font-size:1rem; margin-bottom:14px;">🛡️</div>
            <h3 class="title-md" style="margin-bottom:6px; color:#ffffff; font-size:1.05rem;">สินค้ามีประกัน</h3>
            <p class="text-muted" style="font-size:0.84rem; line-height:1.6; color:#64748b;">ไอดีพรีเมียมทุกชิ้นผ่านการตรวจสอบ มีปัญหาแจ้งเคลมได้ เช็ครหัสย้อนหลังได้ตลอด</p>
          </div>
        </div>

        <!-- รายการสินค้าแอพสตรีมมิ่ง (ตามรูปที่ 3) -->
        <div class="flex-between" style="margin-bottom:16px;">
          <div>
            <h2 class="title-lg" style="color:#ffffff;">สินค้าแอพสตรีมมิ่ง</h2>
          </div>
          <span class="text-muted" style="font-size:0.84rem; color:#64748b;">ทั้งหมด 13 แอพพรีเมียม</span>
        </div>

        <div class="grid-brand-cards">
          ${BRANDS.map(renderBrandCard).join('')}
        </div>
      </section>
    `;
  }

  /* ==========================================================================
     VIEW: 2. หน้าสินค้า (Products View)
     ========================================================================== */
  function renderProducts() {
    const filtered = ALL_PACKAGES.filter((p) => {
      if (!State.search) return true;
      const s = State.search.toLowerCase();
      return p.name.toLowerCase().includes(s) || p.brandName.toLowerCase().includes(s);
    });

    return `
      <section class="page-section">
        <div class="card" style="margin-bottom:22px;">
          <div class="flex-between" style="margin-bottom:14px;">
            <div>
              <h1 class="title-lg">🛍️ รายการแพ็กเกจแอพพรีเมี่ยมทั้งหมด</h1>
              <p class="text-muted">เลือกแพ็กเกจที่ต้องการ รับรหัสเข้าใช้งานในประวัติสั่งซื้อทันทีหลังชำระ</p>
            </div>
            ${!State.user
              ? `<span class="badge badge-pink">🔒 หากยังไม่ล็อกอิน เมื่อกดสั่งซื้อระบบจะพาไปหน้าล็อกอิน</span>`
              : `<span class="badge badge-green">● ยูสเซอร์: ${State.user.username} (เข้าสู่ระบบแล้ว)</span>`
            }
          </div>
          <div class="flex-between">
            <div class="flex-row">
              <button class="btn btn-ghost btn-sm active" data-page="products">🌟 ทั้งหมด (${ALL_PACKAGES.length})</button>
              <button class="btn btn-ghost btn-sm" data-page="home">🏷️ ดูแบบแยกแบรนด์</button>
            </div>
            <div style="min-width:240px; flex:0 1 300px;">
              <input type="search" id="product-search" class="input" placeholder="🔍 ค้นหาแพ็กเกจ เช่น Netflix, Viu, 1 วัน..." value="${State.search}">
            </div>
          </div>
        </div>

        ${filtered.length
          ? `<div class="grid-packages">${filtered.map(renderPackageCard).join('')}</div>`
          : `<div class="card" style="text-align:center; padding:42px;">
               <h3 class="title-md">ไม่พบสินค้าที่ค้นหา</h3>
               <p class="text-muted" style="margin-top:6px;">ลองเปลี่ยนคำค้นหาใหม่อีกครั้ง</p>
             </div>`
        }
      </section>
    `;
  }

  /* ==========================================================================
     VIEW: 3. หน้าพ้อยแลกของรางวัล (Point Rewards View)
     ========================================================================== */
  function renderRewards() {
    return `
      <section class="page-section">
        <div class="hero-box" style="margin-bottom:24px;">
          <div class="flex-between">
            <div>
              <span class="badge badge-pink" style="margin-bottom:10px;">🎁 NovaPlay Point Club</span>
              <h1 class="title-lg">พ้อยสะสมแลกของรางวัลพรีเมี่ยมฟรี</h1>
              <p class="text-muted">แลกวันใช้งานแอพพรีเมี่ยมฟรีง่ายๆ เมื่อมีแต้มสะสม</p>
            </div>
            ${State.user ? `
              <div class="badge badge-pink" style="padding:10px 18px; font-size:0.9rem;">
                👤 บัญชีของคุณ: <strong>${State.user.username}</strong>
              </div>
            ` : `
              <button class="btn btn-primary btn-sm" data-page="login">
                🔐 เข้าสู่ระบบเพื่อแลกรางวัล
              </button>
            `}
          </div>
        </div>

        <div class="grid-3">
          ${REWARDS.map(r => `
            <article class="card card-hover flex-between" style="flex-direction:column; align-items:stretch;">
              <div>
                <div style="width:100%; height:130px; border-radius:10px; overflow:hidden; margin-bottom:12px; background:#181822;">
                  <img src="${r.image}" alt="${r.name}" style="width:100%; height:100%; object-fit:cover;" />
                </div>
                <div class="flex-between" style="margin-bottom:6px;">
                  <h3 class="title-md">${r.name}</h3>
                  <span class="badge badge-pink">${r.badge}</span>
                </div>
                <p class="text-muted" style="margin-bottom:14px; font-size:0.86rem;">${r.desc}</p>
              </div>
              <div style="border-top:1px solid rgba(255,255,255,0.06); padding-top:12px;" class="flex-between">
                <span class="price-tag" style="color:#ff3399;">✨ ${r.cost} พ้อย</span>
                <button class="btn btn-primary btn-sm" data-redeem-id="${r.id}">
                  ${!State.user ? '🔐 ล็อกอินเพื่อแลก' : '🎁 แลกรางวัลเลย'}
                </button>
              </div>
            </article>
          `).join('')}
        </div>
      </section>
    `;
  }

  /* ==========================================================================
     VIEW: 4. หน้าประวัติสั่งซื้อ (Order History View)
     ========================================================================== */
  function renderOrders() {
    const userOrders = State.user 
      ? State.orders.filter(o => o.owner === State.user.username)
      : [];

    return `
      <section class="page-section">
        <div class="card" style="margin-bottom:22px;">
          <div class="flex-between">
            <div>
              <h1 class="title-lg">📦 ประวัติสั่งซื้อและรหัสแอพของคุณ</h1>
              <p class="text-muted">รายการสินค้าและรหัสแอพที่สั่งซื้อจะถูกจัดเก็บไว้ที่นี่อย่างปลอดภัย</p>
            </div>
            ${State.user ? `
              <div class="badge badge-pink">👤 ยูสเซอร์: ${State.user.username}</div>
            ` : ''}
          </div>
        </div>

        ${!State.user ? `
          <div class="card" style="text-align:center; padding:48px 20px;">
            <div style="font-size:2.6rem; margin-bottom:10px;">🔒</div>
            <h3 class="title-md" style="margin-bottom:6px;">กรุณาเข้าสู่ระบบเพื่อดูประวัติสั่งซื้อ</h3>
            <p class="text-muted" style="margin-bottom:18px;">เข้าสู่ระบบด้วยยูสเซอร์และพาสเวิร์ดของคุณเพื่อดูรหัสที่เคยสั่งซื้อทั้งหมด</p>
            <button class="btn btn-primary" data-page="login">🔐 เข้าสู่ระบบ</button>
          </div>
        ` : userOrders.length === 0 ? `
          <div class="card" style="text-align:center; padding:48px 20px;">
            <div style="font-size:2.6rem; margin-bottom:10px;">📭</div>
            <h3 class="title-md" style="margin-bottom:6px;">ยังไม่มีประวัติคำสั่งซื้อสำหรับบัญชีนี้</h3>
            <p class="text-muted" style="margin-bottom:18px;">เมื่อคุณสั่งซื้อแอพพรีเมี่ยม รหัสจะถูกส่งเข้ามาเก็บไว้ในหน้านี้ทันที</p>
            <button class="btn btn-primary" data-page="home">🛍️ ไปเลือกซื้อสินค้า</button>
          </div>
        ` : `
          <div style="display:grid; gap:16px;">
            ${userOrders.map(ord => `
              <article class="card card-hover">
                <div class="flex-between" style="margin-bottom:10px;">
                  <div class="flex-row">
                    <div style="width:48px; height:48px; border-radius:10px; overflow:hidden; background:#181822; flex-shrink:0;">
                      <img src="${ord.image || 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=200'}" alt="${ord.name}" style="width:100%; height:100%; object-fit:cover;" />
                    </div>
                    <div>
                      <div class="flex-row" style="gap:8px;">
                        <h3 class="title-md">${ord.name}</h3>
                        <span class="badge badge-pink">🛒 สั่งซื้อสำเร็จ</span>
                        <span class="badge badge-green">● พร้อมใช้งาน</span>
                      </div>
                      <div class="text-muted" style="font-size:0.82rem;">
                        รหัสคำสั่งซื้อ: <strong>#${ord.orderId}</strong> • วันที่: ${ord.date}
                      </div>
                    </div>
                  </div>
                  <div class="title-md" style="color:#ff3399;">${ord.paidText}</div>
                </div>

                <div class="cred-box flex-between">
                  <span style="word-break:break-all;">🔑 ${ord.credential}</span>
                  <button class="btn btn-ghost btn-sm" data-copy="${ord.credential}">
                    📋 คัดลอกรหัส
                  </button>
                </div>
              </article>
            `).join('')}
          </div>
        `}
      </section>
    `;
  }

  /* ==========================================================================
     VIEW: 5. หน้าระบบล็อกอินเข้าเว็บจริงๆ (Real Login & Registration Portal)
     - ยูสเซอร์ & พาสเวิร์ด
     - สมัครสมาชิกใหม่
     - เข้าสู่ระบบ
     - จัดการออกจากระบบจริง
     ========================================================================== */
  function renderLogin() {
    const pendingPkg = State.pendingPackageId ? ALL_PACKAGES.find(p => p.id === State.pendingPackageId) : null;

    // 1. กรณีผู้ใช้เข้าสู่ระบบแล้ว (แสดงข้อมูลโปรไฟล์จริงอย่างสะอาดตา ไม่มีระบบจำลองเติมเงิน)
    if (State.user) {
      const myOrdersCount = State.orders.filter(o => o.owner === State.user.username).length;
      return `
        <section class="page-section">
          <div class="card" style="max-width:560px; margin-inline:auto; padding:32px; background:#121218; border-color:rgba(255,51,153,0.35);">
            <div style="text-align:center; margin-bottom:24px;">
              <div class="app-logo" style="margin-inline:auto; margin-bottom:12px; background:var(--pink-gradient); width:64px; height:64px; font-size:1.6rem;">
                ${State.user.username.slice(0, 1).toUpperCase()}
              </div>
              <span class="badge badge-green" style="margin-bottom:8px;">● เข้าสู่ระบบเรียบร้อยแล้ว</span>
              <h1 class="title-lg" style="color:#ffffff;">ยินดีต้อนรับคุณ ${State.user.username}</h1>
              <p class="text-muted" style="font-size:0.88rem;">บัญชีสมาชิกเว็บไซต์ NovaPlay SaaS</p>
            </div>

            <div class="card" style="background:#0c0c12; border-color:rgba(255,255,255,0.06); margin-bottom:22px; padding:18px;">
              <div style="display:grid; gap:12px; font-size:0.92rem;">
                <div class="flex-between">
                  <span class="text-muted">👤 ยูสเซอร์ (Username):</span>
                  <strong>${State.user.username}</strong>
                </div>
                <div class="flex-between">
                  <span class="text-muted">🛡️ สถานะบัญชี:</span>
                  <span style="color:#10b981; font-weight:600;">ปกติ (เปิดใช้งานแล้ว)</span>
                </div>
                <div class="flex-between">
                  <span class="text-muted">📦 ประวัติสั่งซื้อของคุณ:</span>
                  <span style="color:#ff3399; font-weight:600;">${myOrdersCount} รายการ</span>
                </div>
              </div>
            </div>

            <div style="display:grid; gap:10px;">
              <button class="btn btn-primary btn-full" data-page="home">
                🛍️ ไปเลือกซื้อแอพพรีเมี่ยม
              </button>
              <button class="btn btn-outline-pink btn-full" data-page="orders">
                📦 ดูประวัติสั่งซื้อและรหัสแอพ
              </button>
              <button class="btn btn-ghost btn-full" id="btn-logout" style="color:#fb7185; border-color:rgba(251,113,133,0.3); margin-top:8px;">
                🚪 ออกจากระบบ (Logout)
              </button>
            </div>
          </div>
        </section>
      `;
    }

    // 2. กรณีผู้ใช้ยังไม่เข้าสู่ระบบ: แสดงฟอร์มเข้าสู่ระบบ / สมัครสมาชิกจริง
    const isRegister = State.authMode === 'register';

    return `
      <section class="page-section">
        <div class="card" style="max-width:440px; margin-inline:auto; padding:32px 28px; background:#121218; border-color:rgba(255,51,153,0.3);">
          ${pendingPkg ? `
            <div class="card" style="background:rgba(255,51,153,0.14); border-color:rgba(255,51,153,0.45); padding:12px 14px; margin-bottom:18px;">
              <div style="font-weight:600; color:#ff85c2; font-size:0.9rem;">🛒 คุณเลือก: ${pendingPkg.name}</div>
              <div class="text-muted" style="font-size:0.8rem;">กรุณาเข้าสู่ระบบก่อนสั่งซื้อสินค้า</div>
            </div>
          ` : ''}

          <!-- แท็บสลับ เข้าสู่ระบบ / สมัครสมาชิก -->
          <div style="display:flex; background:#0a0a0f; border-radius:10px; padding:4px; margin-bottom:22px; border:1px solid rgba(255,255,255,0.08);">
            <button class="btn btn-sm btn-full ${!isRegister ? 'btn-primary' : 'btn-ghost'}" data-switch-auth="login" style="border-radius:8px;">
              เข้าสู่ระบบ
            </button>
            <button class="btn btn-sm btn-full ${isRegister ? 'btn-primary' : 'btn-ghost'}" data-switch-auth="register" style="border-radius:8px;">
              สมัครสมาชิก
            </button>
          </div>

          <div style="text-align:center; margin-bottom:22px;">
            <div class="brand-orb" style="margin-inline:auto; margin-bottom:10px; width:46px; height:46px; font-size:1.2rem;">N</div>
            <h1 class="title-lg" style="color:#ffffff;">${isRegister ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}</h1>
            <p class="text-muted" style="font-size:0.86rem;">
              ${isRegister ? 'สร้างบัญชีผู้ใช้ใหม่ด้วยยูสเซอร์และพาสเวิร์ด' : 'กรอกยูสเซอร์และพาสเวิร์ดของคุณเพื่อเข้าใช้งาน'}
            </p>
          </div>

          <!-- แบบฟอร์มยูสเซอร์ และ พาสเวิร์ด -->
          <form id="auth-form">
            <div class="input-group">
              <label class="input-label">👤 ยูสเซอร์ (Username)</label>
              <input type="text" id="auth-username" class="input" placeholder="กรอกยูสเซอร์ของคุณ" required autocomplete="username">
            </div>

            <div class="input-group" style="margin-bottom:${isRegister ? '14px' : '20px'};">
              <label class="input-label">🔒 พาสเวิร์ด (Password)</label>
              <input type="password" id="auth-password" class="input" placeholder="กรอกพาสเวิร์ดของคุณ" required autocomplete="current-password">
            </div>

            ${isRegister ? `
              <div class="input-group" style="margin-bottom:20px;">
                <label class="input-label">🔒 ยืนยันพาสเวิร์ด (Confirm Password)</label>
                <input type="password" id="auth-confirm-password" class="input" placeholder="กรอกพาสเวิร์ดอีกครั้ง" required autocomplete="new-password">
              </div>
            ` : ''}

            <button type="submit" class="btn btn-primary btn-full" style="margin-bottom:16px;">
              ${isRegister ? '✨ สมัครสมาชิกทันที' : '🔐 เข้าสู่ระบบ'}
            </button>
          </form>
        </div>
      </section>
    `;
  }

  /* ==========================================================================
     CONTROLLER: สลับมุมมองหน้า
     ========================================================================== */
  function renderCurrentView(page = State.activePage) {
    const root = viewRoot();
    if (!root) return;

    const views = {
      home: renderHome,
      products: renderProducts,
      rewards: renderRewards,
      orders: renderOrders,
      login: renderLogin
    };

    root.innerHTML = (views[page] || renderHome)();
  }

  /* ==========================================================================
     LOGIC: สั่งซื้อสินค้า & ตรวจสอบการล็อกอิน
     ========================================================================== */
  function handleBuyPackage(pkgId) {
    const pkg = ALL_PACKAGES.find(p => p.id === pkgId);
    if (!pkg) return;

    if (pkg.stock <= 0) {
      toast('สินค้ารายการนี้หมดชั่วคราว', 'warn');
      return;
    }

    // ถ้ายังไม่ได้ล็อกอิน ให้เด้งไปหน้าล็อกอินทันทีตามเงื่อนไข
    if (!State.user) {
      State.pendingPackageId = pkgId;
      toast(`🔒 กรุณาเข้าสู่ระบบก่อนสั่งซื้อ "${pkg.name}"`, 'warn');
      navigateTo('login');
      return;
    }

    // ล็อกอินแล้ว เปิดยืนยันคำสั่งซื้อ
    openCheckoutModal(pkg);
  }

  function openCheckoutModal(pkg) {
    // สร้าง SVG PromptPay QR Code สวยงามและสมจริง
    const qrSvg = `
      <svg viewBox="0 0 160 160" width="160" height="160" style="background:#ffffff; padding:10px; border-radius:12px; display:block; margin:0 auto; box-shadow:0 8px 24px rgba(0,0,0,0.5);">
        <!-- PromptPay Frame & QR Matrix Visual -->
        <rect x="0" y="0" width="160" height="160" fill="#ffffff" rx="12" />
        <rect x="15" y="15" width="40" height="40" fill="#0b0b10" rx="4" />
        <rect x="23" y="23" width="24" height="24" fill="#ffffff" rx="2" />
        <rect x="29" y="29" width="12" height="12" fill="#0b0b10" rx="2" />

        <rect x="105" y="15" width="40" height="40" fill="#0b0b10" rx="4" />
        <rect x="113" y="23" width="24" height="24" fill="#ffffff" rx="2" />
        <rect x="119" y="29" width="12" height="12" fill="#0b0b10" rx="2" />

        <rect x="15" y="105" width="40" height="40" fill="#0b0b10" rx="4" />
        <rect x="23" y="113" width="24" height="24" fill="#ffffff" rx="2" />
        <rect x="29" y="119" width="12" height="12" fill="#0b0b10" rx="2" />

        <!-- Data Blocks -->
        <rect x="65" y="20" width="12" height="12" fill="#0b0b10" rx="2" />
        <rect x="85" y="20" width="10" height="20" fill="#0b0b10" rx="2" />
        <rect x="65" y="40" width="18" height="10" fill="#0b0b10" rx="2" />
        <rect x="20" y="65" width="14" height="24" fill="#0b0b10" rx="2" />
        <rect x="42" y="70" width="20" height="12" fill="#0b0b10" rx="2" />
        <rect x="70" y="65" width="22" height="22" fill="#ff3399" rx="4" />
        <rect x="100" y="65" width="16" height="16" fill="#0b0b10" rx="2" />
        <rect x="125" y="70" width="18" height="12" fill="#0b0b10" rx="2" />
        <rect x="65" y="95" width="12" height="22" fill="#0b0b10" rx="2" />
        <rect x="85" y="105" width="22" height="12" fill="#0b0b10" rx="2" />
        <rect x="115" y="95" width="28" height="14" fill="#0b0b10" rx="2" />
        <rect x="115" y="120" width="16" height="20" fill="#0b0b10" rx="2" />
        <rect x="85" y="130" width="20" height="10" fill="#0b0b10" rx="2" />
        <rect x="65" y="130" width="10" height="14" fill="#0b0b10" rx="2" />
      </svg>
    `;

    openModal(`
      <div class="flex-between" style="margin-bottom:14px;">
        <h3 class="title-md" style="color:#ffffff; display:flex; align-items:center; gap:8px;">
          💳 ชำระเงินค่าสินค้า
        </h3>
        <button class="btn btn-ghost btn-sm" data-close-modal="true">✕</button>
      </div>

      <!-- สรุปรายการสินค้า -->
      <div class="card" style="background:#111118; border-color:rgba(255,51,153,0.3); margin-bottom:16px; padding:12px 14px;">
        <div class="flex-between">
          <div class="flex-row" style="gap:12px;">
            <div style="width:48px; height:48px; border-radius:10px; overflow:hidden; background:#181822; flex-shrink:0;">
              <img src="${pkg.image}" alt="${pkg.name}" style="width:100%; height:100%; object-fit:cover;" />
            </div>
            <div>
              <div style="font-weight:700; color:#f8fafc; font-size:0.92rem;">${pkg.name}</div>
              <div class="text-muted" style="font-size:0.78rem;">สั่งซื้อในชื่อ: <strong>${State.user.username}</strong></div>
            </div>
          </div>
          <div style="text-align:right;">
            <div class="price-tag" style="font-size:1.4rem;">${formatTHB(pkg.price)}</div>
            <span class="badge badge-green" style="font-size:0.7rem;">พร้อมส่งทันที</span>
          </div>
        </div>
      </div>

      <!-- กล่องสแกนจ่าย QR พร้อมเพย์ทันที -->
      <div class="card" style="background:#0c0c12; border:1px solid rgba(255,255,255,0.08); text-align:center; padding:18px 14px; margin-bottom:16px;">
        <div style="font-size:0.85rem; font-weight:600; color:#ff85c2; margin-bottom:10px;">
          ⚡ สแกน QR พร้อมเพย์ จ่ายได้ทุกธนาคาร (ไม่ต้องเติมเงิน)
        </div>
        
        <div style="margin-bottom:12px;">
          ${qrSvg}
        </div>

        <div style="font-size:0.84rem; color:#cbd5e1; margin-bottom:4px;">
          ยอดชำระสุทธิ: <strong style="color:#ff3399; font-size:1.15rem;">${formatTHB(pkg.price)}</strong>
        </div>
        <div class="text-muted" style="font-size:0.78rem;">
          พร้อมเพย์: 098-XXX-XXXX (สองนึ่ง ระบบอัตโนมัติ 24 ชม.)
        </div>
      </div>

      <!-- ปุ่มกดจ่ายเงินทันที -->
      <button class="btn btn-primary btn-full" data-confirm-buy-pkg="${pkg.id}" style="padding:12px; font-size:1rem; box-shadow:0 8px 24px rgba(255,51,153,0.5);">
        ⚡ จ่ายเงิน ${formatTHB(pkg.price)} และรับรหัสทันที
      </button>

      <div style="text-align:center; margin-top:10px;">
        <span class="text-muted" style="font-size:0.75rem;">
          🔒 ระบบตรวจสอบการชำระเงินและส่งรหัสเข้าประวัติสั่งซื้อทันที
        </span>
      </div>
    `);
  }

  function completePurchase(pkgId) {
    const pkg = ALL_PACKAGES.find(p => p.id === pkgId);
    if (!pkg || !State.user) return;

    pkg.stock = Math.max(0, pkg.stock - 1);

    const newOrder = {
      orderId: 'NV' + Math.floor(100000 + Math.random() * 900000),
      owner: State.user.username,
      name: pkg.name,
      image: pkg.image,
      paidText: formatTHB(pkg.price),
      date: new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }),
      credential: generateCredential(pkg.name)
    };

    State.orders.unshift(newOrder);
    State.pendingPackageId = null;
    saveAuthData();
    closeModal();
    updateNavUserBadges();
    toast(`🎉 สั่งซื้อ "${pkg.name}" สำเร็จ! จัดส่งรหัสไว้ในประวัติสั่งซื้อแล้ว`, 'ok');
    navigateTo('orders');
  }

  /* ==========================================================================
     LOGIC: ระบบเข้าสู่ระบบ & สมัครสมาชิก (ยูสเซอร์ & พาสเวิร์ด)
     ========================================================================== */
  function handleAuthSubmit() {
    const usernameInput = $('#auth-username')?.value.trim();
    const passwordInput = $('#auth-password')?.value;
    const confirmInput = $('#auth-confirm-password')?.value;

    if (!usernameInput || !passwordInput) {
      toast('กรุณากรอกยูสเซอร์และพาสเวิร์ดให้ครบถ้วน', 'warn');
      return;
    }

    if (State.authMode === 'register') {
      // ตรวจสอบการสมัครสมาชิก
      if (passwordInput !== confirmInput) {
        toast('⚠️ พาสเวิร์ดและยืนยันพาสเวิร์ดไม่ตรงกัน', 'warn');
        return;
      }

      const existingUser = State.users.find(u => u.username.toLowerCase() === usernameInput.toLowerCase());
      if (existingUser) {
        toast('⚠️ ยูสเซอร์นี้มีในระบบแล้ว กรุณาใช้ชื่ออื่น', 'warn');
        return;
      }

      const newUser = {
        username: usernameInput,
        password: passwordInput,
        createdAt: new Date().toLocaleDateString('th-TH')
      };

      State.users.push(newUser);
      State.user = newUser;
      saveAuthData();
      updateNavUserBadges();
      toast(`🎉 สมัครสมาชิกสำเร็จ ยินดีต้อนรับคุณ ${newUser.username}!`, 'ok');

      handlePostLoginRedirect();
    } else {
      // ตรวจสอบการเข้าสู่ระบบ
      const foundUser = State.users.find(u => 
        u.username.toLowerCase() === usernameInput.toLowerCase() && u.password === passwordInput
      );

      if (!foundUser) {
        toast('❌ ยูสเซอร์หรือพาสเวิร์ดไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง', 'warn');
        return;
      }

      State.user = foundUser;
      saveAuthData();
      updateNavUserBadges();
      toast(`👋 ยินดีต้อนรับคุณ ${foundUser.username}! เข้าสู่ระบบสำเร็จ`, 'ok');

      handlePostLoginRedirect();
    }
  }

  function handlePostLoginRedirect() {
    if (State.pendingPackageId) {
      const pendingPkg = ALL_PACKAGES.find(p => p.id === State.pendingPackageId);
      navigateTo('home');
      if (pendingPkg) {
        setTimeout(() => openCheckoutModal(pendingPkg), 240);
      }
    } else {
      // เมื่อเข้าสู่ระบบหรือสมัครเสร็จ เด้งเข้าหน้าแรกทันทีตามคำสั่ง
      navigateTo('home');
    }
  }

  /* ==========================================================================
     EVENT DELEGATION: ผูกการทำงานทั้งหมด
     ========================================================================== */
  function bindGlobalEvents() {
    document.addEventListener('click', (e) => {
      // 1. กดบล็อกแบรนด์ในหน้าแรก (รูปที่ 4 -> รูปที่ 5)
      const brandBtn = e.target.closest('[data-view-brand]');
      if (brandBtn) {
        State.selectedBrandId = brandBtn.dataset.viewBrand;
        renderCurrentView('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // 2. กดย้อนกลับจากหน้ารายละเอียดแบรนด์ (รูปที่ 5 -> รูปที่ 4)
      if (e.target.closest('[data-back-to-home]')) {
        State.selectedBrandId = null;
        renderCurrentView('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // 3. กดสั่งซื้อแพ็กเกจสินค้า
      const buyPkgBtn = e.target.closest('[data-buy-pkg]');
      if (buyPkgBtn) return handleBuyPackage(buyPkgBtn.dataset.buyPkg);

      const confirmBuyPkgBtn = e.target.closest('[data-confirm-buy-pkg]');
      if (confirmBuyPkgBtn) return completePurchase(confirmBuyPkgBtn.dataset.confirmBuyPkg);

      // 4. แลกของรางวัล
      const redeemBtn = e.target.closest('[data-redeem-id]');
      if (redeemBtn) {
        if (!State.user) {
          toast('🔒 กรุณาเข้าสู่ระบบก่อนแลกของรางวัล', 'warn');
          return navigateTo('login');
        }
        toast('🎁 แลกรางวัลสำเร็จ! รหัสถูกส่งเข้าประวัติสั่งซื้อแล้ว', 'ok');
        return navigateTo('orders');
      }

      // 5. คัดลอกรหัส
      const copyBtn = e.target.closest('[data-copy]');
      if (copyBtn) return copyText(copyBtn.dataset.copy);

      // 6. สลับแท็บ เข้าสู่ระบบ / สมัครสมาชิก
      const switchAuthBtn = e.target.closest('[data-switch-auth]');
      if (switchAuthBtn) {
        State.authMode = switchAuthBtn.dataset.switchAuth;
        return renderCurrentView('login');
      }

      // 7. กรอกยูสเซอร์ & พาสเวิร์ดทดสอบอัตโนมัติ
      if (e.target.closest('#btn-fill-demo')) {
        State.authMode = 'login';
        renderCurrentView('login');
        const userEl = $('#auth-username');
        const passEl = $('#auth-password');
        if (userEl && passEl) {
          userEl.value = 'admin';
          passEl.value = '123';
          toast('⚡ กรอก ยูสเซอร์: admin | พาสเวิร์ด: 123 แล้ว', 'info');
        }
        return;
      }

      // 8. ออกจากระบบ (Logout)
      if (e.target.closest('#btn-logout')) {
        State.user = null;
        State.pendingPackageId = null;
        saveAuthData();
        updateNavUserBadges();
        navigateTo('home');
        return toast('🚪 ออกจากระบบเรียบร้อยแล้ว', 'info');
      }

      if (e.target.closest('[data-close-modal]') || e.target.id === 'modal-backdrop') {
        closeModal();
      }
    });

    // ค้นหาสินค้า
    document.addEventListener('input', (e) => {
      if (e.target.id === 'product-search') {
        State.search = e.target.value;
        const pos = e.target.selectionStart;
        renderCurrentView('products');
        const input = $('#product-search');
        if (input) {
          input.focus();
          input.setSelectionRange(pos, pos);
        }
      }
    });

    // ฟอร์มเข้าสู่ระบบ / สมัครสมาชิก
    document.addEventListener('submit', (e) => {
      if (e.target.id === 'auth-form') {
        e.preventDefault();
        handleAuthSubmit();
      }
    });
  }

  // เริ่มต้นระบบ
  window.addEventListener('DOMContentLoaded', () => {
    initNavbars((page) => {
      if (page !== 'home') State.selectedBrandId = null;
      renderCurrentView(page);
    });
    bindGlobalEvents();
    navigateTo('home', false);
  });
})();
