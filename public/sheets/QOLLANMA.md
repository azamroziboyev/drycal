# Google Sheets orqali Login va Parollarni tekshirish tizimi (Qo'llanma)

Bu qo'llanma orqali Google Sheets jadvalingizni static saytingiz uchun bepul va xavfsiz foydalanuvchilar bazasiga aylantirishingiz mumkin.

---

## 1. Google Sheets jadvali tuzilishi

Yangi Google Sheets jadvali oching va uning birinchi varag'ini quyidagicha to'ldiring:

| Ustun | Katak | Sarlavha nomi | Misol qiymat |
| :---: | :---: | :--- | :--- |
| **A** | 1-ustun | **№** | `1` |
| **B** | 2-ustun | **Ism familiya** | `G'aibnazarov Boburjon` |
| **C** | 3-ustun | **Username (Login)** | `boburjon` |
| **D** | 4-ustun | **Parol** | `12345` |
| **E** | 5-ustun | **Lavozim** | `Yetakchi muhandis-metrolog` |

> **Eslatma:** Sarlavhalarni qo'lda kiritmasdan, Apps Script dagi `setupSheet` funksiyasini 1 marta bosib yuborsangiz, o'zi avtomatik chiroyli qilib rang berib, chiziqlar chizib tayyorlab beradi.

---

## 2. Apps Script kodini o'rnatish (2 daqiqa)

1. Google Sheets jadvalingiz yuqori menyusidan:
   - **Kengaytmalar (Расширения / Extensions)** ➡️ **Apps Script** tugmasini bosing.
2. Ochilgan tahrirlagichdagi mavjud kodni o'chiring va o'rniga ushbu papkadagi **`Code.gs`** fayli ichidagi barcha kodni nusxalab (Ctrl+A, Ctrl+C) joylashtiring (Ctrl+V).
3. Yuqoridagi diskcha belgisini (Ctrl+S) bosib loyihani saqlang (masalan nomiga `Kalibrlash Auth API` deb yozing).
4. Funksiyalar ro'yxatidan **`setupSheet`** ni tanlab, **Run (Выполнить)** tugmasini bosing:
   - Birinchi marta Google ruxsat so'rashi mumkin (*Review Permissions* ➡️ O'z akkauntingizni tanlang ➡️ *Advanced* ➡️ *Go to ... (unsafe)* ➡️ *Allow*).
   - Jadvalingizga qarasangiz, 1-qator ko'k sarlavhalar va 4 ta namunaviy foydalanuvchi paydo bo'ladi.

---

## 3. Web App sifatida internetga chiqarish (Deploy)

1. Apps Script oynasining yuqori o'ng burchagidagi ko'k **Deploy (Развернуть / Внедрить)** ➡️ **New deployment (Новое развертывание)** tugmasini bosing.
2. Chap tomondagi tishli g'ildirakcha (⚙️) belgisini bosib, **Web app (Веб-приложение)** ni tanlang.
3. Sozlamalarni quyidagicha qiling:
   - **Description (Описание):** `Login API v1`
   - **Execute as (Запуск от имени):** `Me` (*Mening nomimdan*)
   - **Who has access (У кого есть доступ):** `Anyone` (*Hamma / Все*) ⚠️ **(Bu juda muhim, aks holda sayt kira olmaydi)**
4. **Deploy** tugmasini bosing.
5. Ekrandagi **Web app URL** manzilini nusxalab oling (U quyidagicha ko'rinishda bo'ladi):
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```

---

## 4. Static saytingizdan (React / JavaScript) murojaat qilish

Saytingizdan foydalanuvchi login va parolini tekshirish uchun quyidagi 10 qatorli oddiy kod ishlatiladi:

```typescript
// Google Apps Script Web App URL manzili
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/SIZNING_URLINGIZ/exec";

async function loginUser(username: string, password: string) {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      // text/plain orqali yuborish brauzerda CORS xatolarini oldini oladi
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "login",
        username: username,
        password: password,
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      console.log("Muvaffaqiyatli kirdi:", data.user);
      // data.user tarkibida: { id, fullName, username, role } bo'ladi
      return data.user;
    } else {
      alert("Xatolik: " + data.message);
      return null;
    }
  } catch (error) {
    console.error("Tarmoq xatosi:", error);
    alert("Server bilan bog'lanishda xatolik yuz berdi!");
    return null;
  }
}
```

---

## 5. Natijada nimalar beradi?
- **Muvaffaqiyatli kirganda (`data.success: true`):**
  ```json
  {
    "success": true,
    "message": "Tizimga muvaffaqiyatli kirildi!",
    "user": {
      "id": 1,
      "fullName": "G'aibnazarov Boburjon",
      "username": "boburjon",
      "role": "Yetakchi muhandis-metrolog"
    }
  }
  ```

- **Xato parol kiritilganda (`data.success: false`):**
  ```json
  {
    "success": false,
    "message": "Kiritilgan parol noto‘g‘ri!"
  }
  ```

Jadvalga yangi xodim qo'shmoqchi bo'lsangiz, shunchaki Google Sheets jadvalingizni ochib, keyingi qatorga yangi odamning ismi, logini va parolini yozib qo'yishingiz kifoya!
