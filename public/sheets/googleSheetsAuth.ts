/**
 * ============================================================================
 * GOOGLE SHEETS AUTH CLIENT (TypeScript / React)
 * Ushbu modul static React saytidan Google Sheets Apps Script API ga so'rov
 * yuborish va login/parolni tekshirish uchun xizmat qiladi.
 * ============================================================================
 */

export interface GoogleSheetsUser {
  id: number | string;
  fullName: string;
  username: string;
  role: string;
}

export interface GoogleSheetsAuthResponse {
  success: boolean;
  message: string;
  user?: GoogleSheetsUser;
}

/**
 * Google Apps Script Web App URL manzili.
 * Deploy qilganingizdan so'ng o'zingizning Web App URL manzilingizni shu yerga qo'ying:
 */
export const GOOGLE_APPS_SCRIPT_WEBAPP_URL = 
  'https://script.google.com/macros/s/AKfycby4V2FnlC0bdOoallfg0stiSTptiA_xPXmRG66AnXVbsfcSZJY7h3dNWhz4qNfCVUmq8g/exec';

/**
 * Google Sheets orqali foydalanuvchini autentifikatsiya qilish
 * 
 * @param username Foydalanuvchi logini
 * @param password Foydalanuvchi paroli
 * @param webAppUrl Ixtiyoriy Web App URL manzili (agar default url ishlatilmasa)
 */
export async function authenticateWithGoogleSheets(
  username: string,
  password: string,
  webAppUrl: string = GOOGLE_APPS_SCRIPT_WEBAPP_URL
): Promise<GoogleSheetsAuthResponse> {
  const cleanUsername = username.trim();
  const cleanPassword = password.trim();

  if (!cleanUsername || !cleanPassword) {
    return {
      success: false,
      message: 'Login va parol kiritilishi shart!',
    };
  }

  try {
    // text/plain orqali yuborish brauzerda noxush CORS preflight xatolarining oldini oladi
    const response = await fetch(webAppUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'login',
        username: cleanUsername,
        password: cleanPassword,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server javob kodi: ${response.status}`);
    }

    const data: GoogleSheetsAuthResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error('Google Sheets Auth xatosi:', error);
    
    // Zaxira: GET metodi orqali sinab ko'rish
    try {
      const getUrl = `${webAppUrl}?action=login&username=${encodeURIComponent(cleanUsername)}&password=${encodeURIComponent(cleanPassword)}`;
      const getResponse = await fetch(getUrl);
      if (getResponse.ok) {
        const getData: GoogleSheetsAuthResponse = await getResponse.json();
        return getData;
      }
    } catch (fallbackError) {
      console.warn('GET zaxira xatosi:', fallbackError);
    }

    return {
      success: false,
      message: 'Google Sheets serveriga ulanishda xatolik yuz berdi. Internet aloqasi yoki URL manzilni tekshiring.',
    };
  }
}
