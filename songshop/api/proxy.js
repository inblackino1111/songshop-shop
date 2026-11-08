/* ==========================================================================
   API PROXY SERVER (/api/proxy.js)
   รองรับ:
   1. รันบน Vercel Serverless Function 100% (/api/proxy)
   2. รันบนเครื่องคอมพิวเตอร์ของคุณเองผ่าน Node.js (Port 3000)
   3. แก้อาการ CORS Policy กับแม่ข่าย baimon24hr.online และ Slip2Go
   ========================================================================== */

export default async function handler(req, res) {
  // 1. ตั้งค่า Headers สำหรับ CORS ให้หน้าเว็บเรียกข้ามโดเมนได้อิสระ
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, PATCH, DELETE, POST, PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, apikey'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let parsedBody = req.body;
    if (typeof parsedBody === 'string') {
      try {
        parsedBody = JSON.parse(parsedBody);
      } catch {
        parsedBody = {};
      }
    }
    parsedBody = parsedBody || {};

    let { targetUrl, url, method = 'POST', headers = {}, body = null, slipBase64, imageBase64 } = parsedBody;
    let finalUrl = targetUrl || url;

    if (!finalUrl) {
      return res.status(400).json({ ok: false, status: 400, message: 'Missing targetUrl parameter' });
    }

    // 2. ป้องกันปัญหาพิมพ์ตัวอักษรท้าย URL ตกหล่นของเว็บแม่ข่าย
    if (finalUrl.endsWith('/api/mone')) {
      finalUrl = 'https://baimon24hr.online/api/money';
    }
    if (finalUrl.endsWith('/api/apibuy_produc')) {
      finalUrl = 'https://baimon24hr.online/api/apibuy_product';
    }
    if (finalUrl.endsWith('/api/api_produc')) {
      finalUrl = 'https://baimon24hr.online/api/api_product';
    }

    const safeHeaders = { ...headers };
    if (!safeHeaders['User-Agent'] && !safeHeaders['user-agent']) {
      safeHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    }

    // 3. กรณีส่งรูปสลิปไปตรวจสอบที่ Slip2Go (แปลง Base64 กลับเป็น Binary FormData)
    const rawImage = slipBase64 || imageBase64;
    if (finalUrl.includes('slip2go') && rawImage) {
      const cleanB64 = rawImage.replace(/^data:image\/[^;]+;base64,/, '');
      const buffer = Buffer.from(cleanB64, 'base64');
      const blob = new Blob([buffer], { type: 'image/png' });
      
      const formData = new FormData();
      // แนบทั้ง 'file' และ 'files' เพื่อป้องกัน API ปฏิเสธชื่อฟิลด์
      formData.append('file', blob, 'slip.png');
      formData.append('files', blob, 'slip.png');

      const authHeader = safeHeaders['Authorization'] || safeHeaders['authorization'] || '';
      const slipResponse = await fetch(finalUrl, {
        method: 'POST',
        headers: {
          'Authorization': authHeader
        },
        body: formData
      });

      const slipData = await slipResponse.json().catch(() => ({}));
      return res.status(slipResponse.status).json(slipData);
    }

    // 4. กรณียิง API ปกติ (เช็คยอดเงินแม่ข่าย / เบิกรหัสสินค้า / ดึงรายการสินค้า)
    const fetchOptions = {
      method: (method || 'POST').toUpperCase(),
      headers: {
        'Accept': 'application/json, text/plain, */*',
        ...safeHeaders
      },
      redirect: 'follow'
    };

    if (fetchOptions.method !== 'GET' && fetchOptions.method !== 'HEAD') {
      const payload = body !== null ? body : parsedBody.body;
      if (payload !== undefined && payload !== null) {
        fetchOptions.body = typeof payload === 'string' ? payload : JSON.stringify(payload);
        if (!fetchOptions.headers['Content-Type'] && !fetchOptions.headers['content-type']) {
          fetchOptions.headers['Content-Type'] = 'application/json';
        }
      }
    }

    const response = await fetch(finalUrl, fetchOptions);
    const contentType = response.headers.get('content-type') || '';
    let data;

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }
    }

    // คืนค่ารูปแบบโครงสร้างที่หน้าบ้านรองรับทั้งสองแบบ
    return res.status(response.status).json({
      ok: response.ok,
      status: response.status,
      data: data,
      ...data
    });

  } catch (err) {
    return res.status(500).json({
      ok: false,
      status: 500,
      message: err.message || 'Proxy Request Failed'
    });
  }
}