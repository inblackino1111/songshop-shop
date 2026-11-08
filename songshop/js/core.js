/* ==========================================================================
   CORE MODULE (js/core.js)
   ศูนย์กลางข้อมูลแบรนด์แอพ (Brands), แพ็กเกจย่อย (Packages), และระบบสมาชิกจริง
   ธีม: ดำ-ชมพู สบายตาทันสมัย
   ========================================================================== */

window.Nova = (() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const formatTHB = (n) => `฿${Number(n).toLocaleString('th-TH')}`;

  /* --- ล้าง State จำลองเดิมที่เคยค้างไว้ --- */
  try {
    localStorage.removeItem('novaplay_saas_state_v1');
    localStorage.removeItem('novaplay_saas_state_v2');
  } catch {}

  /* --- ข้อมูลแบรนด์แอพพรีเมี่ยมยอดฮิต (ตามรูปที่ 4) --- */
  const BRANDS = [
    {
      id: 'netflix',
      name: 'NETFLIX',
      badge: '4K ULTRA HD',
      packageCount: 10,
      stockCount: 4,
      image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&auto=format&fit=crop&q=80',
      description: 'Netflix นำเสนอโลกของความบันเทิงระดับโลกที่คุณไม่ควรพลาด ด้วยการให้บริการเนื้อหาภาพยนตร์ ซีรีส์ และสารคดีที่หลากหลาย รองรับความละเอียดคมชัดสูงสุดระดับ Ultra HD 4K ใช้งานได้ทั้งมือถือ แท็บเล็ต คอมพิวเตอร์ และ Smart TV รับรหัสไว ดูได้ทันที พร้อมรับประกันตลอดการใช้งาน',
      tags: ['4K ULTRA HD', 'ส่งรหัสอัตโนมัติ 24 ชม.', 'รับประกันตลอดการใช้งาน'],
      packages: [
        {
          id: 'nf-1d-mobile',
          name: 'Netflix 1 วัน (มือถือ) แอคนอก รับเคลม !',
          price: 16,
          stock: 3,
          points: 1,
          tag: '4K ULTRA HD',
          image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&auto=format&fit=crop&q=80',
          desc: 'รับชมบนมือถือและแท็บเล็ต 1 วัน ความชัด 4K HDR มีระบบดูแลตลอดการใช้งาน'
        },
        {
          id: 'nf-1d-tv',
          name: 'Netflix 1 วัน (TV) แอคนอก รับเคลม !',
          price: 26,
          stock: 1,
          points: 1,
          tag: '4K ULTRA HD',
          image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&auto=format&fit=crop&q=80',
          desc: 'รับชมบน Smart TV / Android Box / จอใหญ่ 1 วันเต็ม คมชัด 4K'
        },
        {
          id: 'nf-7d-mobile',
          name: 'Netflix 7 วัน (มือถือ) แอคนอก หากเมลโดนปิดดูไม่ได้ รับเคลม1รอบ !',
          price: 56,
          stock: 0,
          points: 3,
          tag: '4K ULTRA HD',
          image: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=500&auto=format&fit=crop&q=80',
          desc: 'แพ็กเกจ 7 วันสุดคุ้ม ดูต่อเนื่องไม่มีสะดุด จอส่วนตัว'
        },
        {
          id: 'nf-7d-tv',
          name: 'Netflix 7วัน (TV) แอคนอก หากเมลโดนปิดดูไม่ได้ เคลม1รอบ !',
          price: 66,
          stock: 0,
          points: 4,
          tag: '4K ULTRA HD',
          image: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=500&auto=format&fit=crop&q=80',
          desc: 'สำหรับรับชมบนทีวีและอุปกรณ์จอใหญ่ 7 วัน คมชัดระดับพรีเมี่ยม'
        },
        {
          id: 'nf-30d-private',
          name: 'Netflix 30 วัน (จอส่วนตัว มี PIN) รับประกันเต็มเดือน',
          price: 99,
          stock: 8,
          points: 15,
          tag: '4K ULTRA HD',
          image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&auto=format&fit=crop&q=80',
          desc: 'จอส่วนตัวล็อก PIN ได้ ดูได้ทุกอุปกรณ์ ทั้ง TV มือถือ คอมพิวเตอร์'
        }
      ]
    },
    {
      id: 'youtube',
      name: 'YOUTUBE',
      badge: 'NO ADS + MUSIC',
      packageCount: 1,
      stockCount: 2,
      image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&auto=format&fit=crop&q=80',
      description: 'YouTube Premium ไร้โฆษณากวนใจทั้งบนวิดีโอและเพลง พร้อม YouTube Music ดาวน์โหลดดูออฟไลน์ เล่นพื้นหลังขณะปิดหน้าจอได้',
      tags: ['NO ADS', 'YOUTUBE MUSIC', 'เล่นพื้นหลังได้'],
      packages: [
        {
          id: 'yt-30d',
          name: 'YouTube Premium 30 วัน (ต่อเมลตัวเองได้)',
          price: 49,
          stock: 2,
          points: 5,
          tag: 'NO ADS + MUSIC',
          image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&auto=format&fit=crop&q=80',
          desc: 'ดึงเข้าครอบครัวเมลส่วนตัว ดูไม่มีโฆษณาคั่น ฟังเพลงปิดหน้าจอได้'
        }
      ]
    },
    {
      id: 'viu',
      name: 'VIU',
      badge: 'K-DRAMA & ANIME',
      packageCount: 8,
      stockCount: 70,
      image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80',
      description: 'ศูนย์รวมซีรีส์เกาหลี วาไรตี้ อนิเมะ พากย์ไทย และซับไทยแปลไวที่สุด สตรีมมิ่งความละเอียด Full HD รับประกันตลอดอายุการใช้งาน',
      tags: ['FULL HD', 'ซับไทยไวสุด', 'พากย์ไทยครบ'],
      packages: [
        {
          id: 'viu-30d',
          name: 'Viu Premium 30 วัน (หาร 4 จอส่วนตัว)',
          price: 29,
          stock: 45,
          points: 3,
          tag: 'K-DRAMA VIP',
          image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80',
          desc: 'ดูซีรีส์เกาหลีไม่มีโฆษณา ภาพคมชัด Full HD โหลดเก็บไว้ดูออฟไลน์ได้'
        },
        {
          id: 'viu-90d',
          name: 'Viu Premium 90 วันสุดคุ้ม',
          price: 79,
          stock: 25,
          points: 8,
          tag: '3 เดือน VIP',
          image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80',
          desc: 'ดูยาวๆ 3 เดือนเต็ม การันตีใช้งานได้ต่อเนื่องตลอดแพ็กเกจ'
        }
      ]
    },
    {
      id: 'iqiyi',
      name: 'iQIYI',
      badge: 'VIP 4K DOLBY',
      packageCount: 6,
      stockCount: 23,
      image: 'https://images.unsplash.com/photo-1578022761797-b8636ac1773c?w=500&auto=format&fit=crop&q=80',
      description: 'iQIYI VIP สตรีมมิ่งซีรีส์จีน อนิเมะ ละครไทยระดับบล็อกบัสเตอร์ พร้อมระบบเสียง Dolby Atmos และภาพคมชัดสูงสุด',
      tags: ['4K DOLBY', 'ซีรีส์จีน VIP', 'ข้ามโฆษณา'],
      packages: [
        {
          id: 'iqiyi-30d',
          name: 'iQIYI VIP 30 วัน (มาตรฐาน)',
          price: 39,
          stock: 23,
          points: 4,
          tag: 'VIP 4K DOLBY',
          image: 'https://images.unsplash.com/photo-1578022761797-b8636ac1773c?w=500&auto=format&fit=crop&q=80',
          desc: 'ดูตอนใหม่ก่อนใคร สิทธิ์ VIP ดูฟรีทุกเรื่อง เสียงพากย์ไทยคมชัด'
        }
      ]
    },
    {
      id: 'wetv',
      name: 'WeTV',
      badge: 'VIP STREAMING',
      packageCount: 5,
      stockCount: 31,
      image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80',
      description: 'WeTV VIP คลังความบันเทิงเอเชียยอดนิยม ซีรีส์จีน มินิซีรีส์ และการ์ตูนอนิเมชั่นระดับพรีเมี่ยม',
      tags: ['VIP PASS', 'FULL HD', 'ดูตอนพิเศษ'],
      packages: [
        {
          id: 'wetv-30d',
          name: 'WeTV VIP 30 วัน (สิทธิ์ Fast Track)',
          price: 39,
          stock: 31,
          points: 4,
          tag: 'VIP STREAMING',
          image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80',
          desc: 'ปลดล็อกทุกตอน ดูสดข้ามโฆษณา พร้อมระบบแปลไทยคุณภาพ'
        }
      ]
    },
    {
      id: 'ch7on',
      name: 'CH7ON',
      badge: 'CH7 HD EXCLUSIVE',
      packageCount: 8,
      stockCount: 78,
      image: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=500&auto=format&fit=crop&q=80',
      description: 'Bugaboo Inter / CH7 HD รวมละครดังช่อง 7HD ย้อนหลังแบบเต็มเรื่อง ชัดแจ๋วระดับ HD ไม่มีโฆษณาคั่น',
      tags: ['ละครย้อนหลัง', 'NO ADS', 'HD QUALITY'],
      packages: [
        {
          id: 'ch7-30d',
          name: 'Bugaboo Inter (CH7) 30 วัน',
          price: 35,
          stock: 78,
          points: 3,
          tag: 'EXCLUSIVE HD',
          image: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=500&auto=format&fit=crop&q=80',
          desc: 'ดูละครช่อง 7 ครบทุกเรื่อง ชัดระดับ Full HD ไม่มีโฆษณา'
        }
      ]
    },
    {
      id: 'canva',
      name: 'CANVA',
      badge: 'PRO + AI STUDIO',
      packageCount: 2,
      stockCount: 13,
      image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=500&auto=format&fit=crop&q=80',
      description: 'Canva Pro สิทธิ์โปรดึงเข้าทีมเมลส่วนตัว ปลดล็อกเทมเพลต พรีเมี่ยม AI Magic Studio และฟอนต์ภาษาไทยกว่า 1,000 แบบ',
      tags: ['AI STUDIO', 'เทมเพลต 100M+', 'เมลส่วนตัว'],
      packages: [
        {
          id: 'canva-30d',
          name: 'Canva Pro 30 วัน (ดึงเข้าทีมเมลส่วนตัว)',
          price: 39,
          stock: 13,
          points: 5,
          tag: 'PRO + AI STUDIO',
          image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=500&auto=format&fit=crop&q=80',
          desc: 'ใช้งานฟีเจอร์โปรครบทุกอย่าง ลบพื้นหลังอัตโนมัติ ไม่จำกัดการดาวน์โหลด'
        }
      ]
    },
    {
      id: 'trueid',
      name: 'TRUEID',
      badge: 'FULL HD + SPORTS',
      packageCount: 1,
      stockCount: 10,
      image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=80',
      description: 'TrueID+ รวมหนังฮิต ซีรีส์ดัง การ์ตูน และการถ่ายทอดสดกีฬาระดับโลก ภาพคมชัดเต็มตา',
      tags: ['กีฬาพรีเมียร์', 'FULL HD', 'ช่องสด'],
      packages: [
        {
          id: 'trueid-30d',
          name: 'TrueID+ Premium 30 วัน',
          price: 49,
          stock: 10,
          points: 5,
          tag: 'FULL HD + SPORTS',
          image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=80',
          desc: 'ดูหนัง ซีรีส์ และกีฬาผ่านแอพ TrueID รองรับมือถือและกล่อง TrueID TV'
        }
      ]
    },
    {
      id: 'youku',
      name: 'YOUKU',
      badge: 'VIP EXCLUSIVE',
      packageCount: 3,
      stockCount: 10,
      image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=500&auto=format&fit=crop&q=80',
      description: 'YOUKU VIP สตรีมมิ่งซีรีส์จีนย้อนยุค โรแมนติกคอมเมดี้ ภาพคมชัด 1080p 60fps ซับไทยแปลแม่นยำ',
      tags: ['VIP EXCLUSIVE', '1080P 60FPS', 'ซับไทย'],
      packages: [
        {
          id: 'youku-30d',
          name: 'YOUKU VIP 30 วัน (จอเดี่ยว)',
          price: 35,
          stock: 10,
          points: 4,
          tag: 'VIP EXCLUSIVE',
          image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=500&auto=format&fit=crop&q=80',
          desc: 'เพลิดเพลินกับซีรีส์จีนสุดฮิต ไม่มีโฆษณาคั่น'
        }
      ]
    },
    {
      id: 'max',
      name: 'MAX',
      badge: 'HBO ORIGINAL 4K',
      packageCount: 1,
      stockCount: 10,
      image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80',
      description: 'Max (HBO Max) คลังหนังและซีรีส์คุณภาพระดับรางวัล Game of Thrones, House of the Dragon, และจักรวาล DC',
      tags: ['HBO 4K', 'WARNER BROS', 'DOLBY VISION'],
      packages: [
        {
          id: 'max-30d',
          name: 'Max (HBO Max) Standard 4K 30 วัน',
          price: 79,
          stock: 10,
          points: 8,
          tag: 'HBO ORIGINAL 4K',
          image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80',
          desc: 'รับชมภาพยนตร์และซีรีส์ระดับโลกจาก HBO และ Warner Bros คมชัด 4K HDR'
        }
      ]
    }
  ];

  /* สร้าง Flat List ของสินค้าทั้งหมด */
  const ALL_PACKAGES = [];
  BRANDS.forEach(b => {
    b.packages.forEach(p => {
      ALL_PACKAGES.push({
        ...p,
        brandId: b.id,
        brandName: b.name
      });
    });
  });

  /* --- ข้อมูลของรางวัลใช้พ้อยแลก (Point Rewards) --- */
  const REWARDS = [
    {
      id: 'rw-netflix-7d',
      name: 'Netflix Premium 4K ฟรี 7 วัน',
      cost: 60,
      type: 'item',
      badge: 'ยอดนิยม',
      image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&auto=format&fit=crop&q=80',
      desc: 'แลกรับรหัสเข้าชม Netflix 4K Ultra HD ฟรีทันที 7 วันเต็ม'
    },
    {
      id: 'rw-canva-30d',
      name: 'Canva Pro ฟรี 30 วัน',
      cost: 90,
      type: 'item',
      badge: 'คุ้มค่ามาก',
      image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=500&auto=format&fit=crop&q=80',
      desc: 'แลกรับลิงก์เชิญเข้าทีม Canva Pro เมลตัวเองฟรี 30 วัน'
    },
    {
      id: 'rw-youtube-30d',
      name: 'YouTube Premium ฟรี 30 วัน',
      cost: 110,
      type: 'item',
      badge: 'ไม่มีโฆษณา',
      image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&auto=format&fit=crop&q=80',
      desc: 'แลกรับสิทธิ์ YouTube Premium + Music ฟังเพลงปิดหน้าจอฟรี 1 เดือน'
    }
  ];

  /* --- ระบบฐานข้อมูลสมาชิกจริง (Real Authentication Database) --- */
  const USERS_DB_KEY = 'novaplay_real_users_v3';
  const CURRENT_USER_KEY = 'novaplay_active_session_v3';
  const ORDERS_DB_KEY = 'novaplay_real_orders_v3';

  // บัญชีเริ่มต้นที่มีในระบบ
  const INITIAL_ACCOUNTS = [
    { username: 'admin', password: '123', name: 'Admin', createdAt: '07/11/2026' },
    { username: 'user', password: '123', name: 'Member User', createdAt: '07/11/2026' }
  ];

  function getRegisteredUsers() {
    try {
      const data = localStorage.getItem(USERS_DB_KEY);
      if (!data) {
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(INITIAL_ACCOUNTS));
        return INITIAL_ACCOUNTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_ACCOUNTS;
    }
  }

  function getActiveUser() {
    try {
      const data = localStorage.getItem(CURRENT_USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  function getSavedOrders() {
    try {
      const data = localStorage.getItem(ORDERS_DB_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  const State = {
    activePage: 'home',
    selectedBrandId: null,
    authMode: 'login', // 'login' | 'register'
    search: '',
    orderFilter: 'all',
    pendingPackageId: null,
    users: getRegisteredUsers(),
    user: getActiveUser(),
    orders: getSavedOrders()
  };

  function saveAuthData() {
    try {
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(State.users));
      if (State.user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(State.user));
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
      localStorage.setItem(ORDERS_DB_KEY, JSON.stringify(State.orders));
    } catch {}
  }

  function generateCredential(itemName) {
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
    const pin = Math.floor(1000 + Math.random() * 9000);
    return `USER: ${rand.toLowerCase()}@novaplay.app | PASS: Nv#${rand}88 | PIN: ${pin} (${itemName})`;
  }

  function toast(msg, type = 'info') {
    const wrap = $('#toast-wrap');
    if (!wrap) return;
    const el = document.createElement('div');
    el.className = `toast-item ${type}`;
    el.innerHTML = msg;
    wrap.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 220);
    }, 3200);
  }

  function openModal(htmlContent) {
    const backdrop = $('#modal-backdrop');
    const body = $('#modal-body');
    if (!backdrop || !body) return;
    body.innerHTML = htmlContent;
    backdrop.classList.add('open');
  }

  function closeModal() {
    $('#modal-backdrop')?.classList.remove('open');
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast('📋 คัดลอกรหัสการใช้งานเรียบร้อยแล้ว!', 'ok');
    } catch {
      toast('คัดลอกรหัสสำเร็จ: ' + text, 'ok');
    }
  }

  return {
    $, $$, formatTHB, BRANDS, ALL_PACKAGES, REWARDS,
    State, saveAuthData, generateCredential,
    toast, openModal, closeModal, copyText
  };
})();
