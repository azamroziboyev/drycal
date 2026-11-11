/**
 * GOOGLE SHEETS AUTHENTICATION SERVICE
 * Live Web App URL: https://script.google.com/macros/s/AKfycby4V2FnlC0bdOoallfg0stiSTptiA_xPXmRG66AnXVbsfcSZJY7h3dNWhz4qNfCVUmq8g/exec
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

export const GOOGLE_APPS_SCRIPT_WEBAPP_URL =
  'https://script.google.com/macros/s/AKfycby4V2FnlC0bdOoallfg0stiSTptiA_xPXmRG66AnXVbsfcSZJY7h3dNWhz4qNfCVUmq8g/exec';

/**
 * Authenticates user credentials against the live Google Sheets Apps Script API.
 * Uses GET with encoded parameters or POST (with text/plain) to avoid browser CORS issues with Google Apps Script redirects.
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

  // Google Apps Script redirects (302) work most reliably from browsers via GET query params
  try {
    const queryUrl = `${webAppUrl}?action=login&username=${encodeURIComponent(cleanUsername)}&password=${encodeURIComponent(cleanPassword)}`;
    const response = await fetch(queryUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Server status: ${response.status}`);
    }

    const data: GoogleSheetsAuthResponse = await response.json();
    return data;
  } catch (err: any) {
    console.warn('GET so‘rovda xatolik, POST orqali sinab ko‘rilmoqda...', err);

    try {
      const postResponse = await fetch(webAppUrl, {
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

      const postData: GoogleSheetsAuthResponse = await postResponse.json();
      return postData;
    } catch (postErr: any) {
      console.error('Auth request failed:', postErr);
      return {
        success: false,
        message: 'Google Sheets bilan bog‘lanishda xatolik yuz berdi. Internet aloqasini tekshiring.',
      };
    }
  }
}
