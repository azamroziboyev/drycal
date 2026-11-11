/**
 * ============================================================================
 * GOOGLE APPS SCRIPT: GOOGLE SHEETS LOGIN & AUTHENTICATION XIZMATI
 * Loyiha: Quritish shkaflari kalibrlash tizimi (O'zMMI)
 * ============================================================================
 * 
 * JADVAL TARKIBI (1-QATOR SARLAVHALAR):
 * 1-ustun (A): № (Tartib raqam)
 * 2-ustun (B): Ism familiya
 * 3-ustun (C): Username (Login)
 * 4-ustun (D): Parol
 * 5-ustun (E): Lavozim
 * 
 * SOZLANISHI:
 * 1. Ushbu kodni Google Sheets -> Kengaytmalar (Extensions) -> Apps Script oynasiga joylang.
 * 2. "setupSheet" funksiyasini 1 marta ishga tushiring (jadval avtomatik chiroyli qilib sozlanadi).
 * 3. Deploy (Внедрить) -> New deployment (Новое развертывание) -> Web app (Веб-приложение)
 *    - Execute as (Запуск от имени): Me (Mening nomimdan)
 *    - Who has access (У кого есть доступ): Anyone (Hamma)
 * 4. Chiqqan "Web App URL" manzilini nusxalab oling.
 */

// Boshlang'ich konfiguratsiya
const CONFIG = {
  SHEET_NAME: 'Foydalanuvchilar', // Varaq nomi
  COL_ID: 0,       // 1-ustun (A) - Tartib raqam
  COL_NAME: 1,     // 2-ustun (B) - Ism familiya
  COL_USERNAME: 2, // 3-ustun (C) - Username (Login)
  COL_PASSWORD: 3, // 4-ustun (D) - Parol
  COL_ROLE: 4,     // 5-ustun (E) - Lavozim
};

/**
 * 1. Jadvalni avtomatik sozlash va sinov foydalanuvchilarini kiritish funksiyasi
 * Apps Script oynasida "setupSheet" ni tanlab "Run" (Выполнить) tugmasini bosing.
 */
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
  }
  
  // 1-qator sarlavhalari
  const headers = ['№', 'Ism familiya', 'Username (Login)', 'Parol', 'Lavozim'];
  
  sheet.getRange(1, 1, 1, 5).setValues([headers]);
  
  // Sarlavha dizayni: to'q ko'k rang, oq qalin matn, markazda
  const headerRange = sheet.getRange(1, 1, 1, 5);
  headerRange.setBackground('#1a365d');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(11);
  headerRange.setHorizontalAlignment('center');
  headerRange.setVerticalAlignment('middle');
  sheet.setRowHeight(1, 35);
  
  // Namuna foydalanuvchilar (agar jadval bo'sh bo'lsa)
  if (sheet.getLastRow() <= 1) {
    const sampleUsers = [
      [1, "G'aibnazarov Boburjon", 'boburjon', '12345', 'Yetakchi muhandis-metrolog'],
      [2, 'Yuldoshev M.', 'yuldoshev', '12345', 'Bosh mutaxassis'],
      [3, 'Admin Foydalanuvchi', 'admin', 'admin2025', 'Administrator'],
      [4, 'Laborant Xodim', 'laborant', 'lab2025', 'Laborant'],
    ];
    
    sheet.getRange(2, 1, sampleUsers.length, 5).setValues(sampleUsers);
  }
  
  // Ustun kengliklarini moslash
  sheet.setColumnWidth(1, 60);  // A: №
  sheet.setColumnWidth(2, 240); // B: Ism familiya
  sheet.setColumnWidth(3, 160); // C: Username
  sheet.setColumnWidth(4, 140); // D: Parol
  sheet.setColumnWidth(5, 200); // E: Lavozim
  
  // Qatorlarni markazlashtirish va chegaralar
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 1).setHorizontalAlignment('center'); // №
    sheet.getRange(2, 3, lastRow - 1, 1).setHorizontalAlignment('center'); // Username
    sheet.getRange(2, 4, lastRow - 1, 1).setHorizontalAlignment('center'); // Parol
    sheet.getRange(2, 5, lastRow - 1, 1).setHorizontalAlignment('left');   // Lavozim
    
    // Yengil katak chiziqlari (borders)
    sheet.getRange(1, 1, lastRow, 5).setBorder(
      true, true, true, true, true, true, 
      '#cbd5e1', SpreadsheetApp.BorderStyle.SOLID
    );
  }
  
  Logger.log('Jadval muvaffaqiyatli sozlandi!');
}

/**
 * 2. POST so'rovlarini qabul qilish (Saytdan login qilganda)
 */
function doPost(e) {
  try {
    let requestData = {};
    
    // So'rov ma'lumotlarini o'qish (JSON yoki form-data)
    if (e && e.postData && e.postData.contents) {
      try {
        requestData = JSON.parse(e.postData.contents);
      } catch (err) {
        requestData = e.parameter || {};
      }
    } else if (e && e.parameter) {
      requestData = e.parameter;
    }
    
    const action = requestData.action || 'login';
    
    if (action === 'login') {
      const username = (requestData.username || '').toString().trim();
      const password = (requestData.password || '').toString().trim();
      
      const result = authenticateUser(username, password);
      return createJsonResponse(result);
    }
    
    return createJsonResponse({
      success: false,
      message: "Noma'lum amal: " + action
    });
    
  } catch (error) {
    return createJsonResponse({
      success: false,
      message: 'Serverda xatolik yuz berdi: ' + error.toString()
    });
  }
}

/**
 * 3. GET so'rovlarini qabul qilish (Brauzer orqali tekshirish yoki zaxira usul)
 */
function doGet(e) {
  try {
    const params = e ? e.parameter : {};
    const action = params.action || 'ping';
    
    // Sog'lomlik tekshiruvi (Health check)
    if (action === 'ping') {
      return createJsonResponse({
        status: 'online',
        service: 'Quritish shkaflari kalibrlash tizimi Auth API',
        timestamp: new Date().toISOString()
      });
    }
    
    // GET orqali login qilish (zaxira varianti)
    if (action === 'login') {
      const username = (params.username || '').toString().trim();
      const password = (params.password || '').toString().trim();
      
      const result = authenticateUser(username, password);
      return createJsonResponse(result);
    }
    
    return createJsonResponse({
      success: false,
      message: "Noma'lum amal"
    });
    
  } catch (error) {
    return createJsonResponse({
      success: false,
      message: 'Serverda xatolik: ' + error.toString()
    });
  }
}

/**
 * 4. Google Sheets jadvalidan foydalanuvchini qidirish va tekshirish
 */
function authenticateUser(username, password) {
  if (!username || !password) {
    return {
      success: false,
      message: 'Login va parol kiritilishi shart!'
    };
  }
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  
  // Agar varaq nomi topilmasa, birinchi varaqdan o'qiydi
  if (!sheet) {
    sheet = ss.getSheets()[0];
  }
  
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return {
      success: false,
      message: "Jadvalda hech qanday foydalanuvchi ma'lumoti topilmadi!"
    };
  }
  
  // Sarlavhalardan keyingi barcha qatorlarni o'qish (2-qatordan oxirigacha)
  const range = sheet.getRange(2, 1, lastRow - 1, 5);
  const rows = range.getValues();
  
  const cleanUsername = username.toLowerCase();
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const id = row[CONFIG.COL_ID];
    const fullName = (row[CONFIG.COL_NAME] || '').toString().trim();
    const sheetUsername = (row[CONFIG.COL_USERNAME] || '').toString().trim().toLowerCase();
    const sheetPassword = (row[CONFIG.COL_PASSWORD] || '').toString().trim();
    const role = (row[CONFIG.COL_ROLE] || '').toString().trim();
    
    // Login mos kelsa
    if (sheetUsername === cleanUsername) {
      // Parolni tekshirish
      if (sheetPassword === password) {
        return {
          success: true,
          message: 'Tizimga muvaffaqiyatli kirildi!',
          user: {
            id: id || (i + 1),
            fullName: fullName || username,
            username: sheetUsername,
            role: role || 'Foydalanuvchi',
          }
        };
      } else {
        return {
          success: false,
          message: 'Kiritilgan parol noto‘g‘ri!'
        };
      }
    }
  }
  
  return {
    success: false,
    message: 'Bunday login bilan foydalanuvchi topilmadi!'
  };
}

/**
 * 5. Standart JSON javob qaytarish funksiyasi (CORS mosligi bilan)
 */
function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
