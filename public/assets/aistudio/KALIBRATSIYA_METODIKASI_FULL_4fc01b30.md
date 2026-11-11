# QURITISH SHKAFI (DRYING OVEN) KALIBRATSIYA METODIKASI
# TO'LIQ HISOB-KITOB VA TEXNIK QO'LLANMA

**Yaratilgan:** 2026-11-10  
**Asos:** Uz-112-1-2025.xlsx, Metodika KU-10-2025, Ручной расчет.docx  
**Standart:** DIN EN 60068-3-5, EURAMET cg-20 (9 Nuqta)

---

## MUNDARIJA

1. [Umumiy ma'lumotlar](#1-umumiy-malumotlar)
2. [Kalibratsiya obyekti va etalon](#2-kalibratsiya-obyekti-va-etalon)
3. [9 nuqtali o'lchash tizimi](#3-9-nuqtali-olchash-tizimi)
4. [Ma'lumotlarni yig'ish (10 ta o'lchov)](#4-malumotlarni-yigish)
5. [Statistik hisoblashlar](#5-statistik-hisoblashlar)
6. [Noaniqlik byudjeti (10 komponent)](#6-noaniqlik-byudjeti)
7. [Yakuniy natijalar](#7-yakuniy-natijalar)
8. [Sertifikat va protokol](#8-sertifikat-va-protokol)

---

## 1. UMUMIY MA'LUMOTLAR

### 1.1 Maqsad
Quritish shkafi (termostat, kamera temperatur)ning harorat maydonini 9 nuqtada kalibratsiya qilish va noaniqlik byudjetini hisoblash.

### 1.2 Qo'llaniladigan standartlar
- **EURAMET Calibration Guide No. 20** - Version 5.0
- **DIN EN 60068-3-5** - Harorat kameralari uchun sinov usullari
- **KU-10-2025** - Termostat kalibrlash metodi (O'zbekiston)

### 1.3 Kalibratsiya diapazoni
- **Diapazoni:** 0°C dan 300°C gacha (yoki obyektga mos)
- **Kalibratsiya nuqtasi:** Masalan, 30°C (yoki buyurtmachining talabiga ko'ra)
- **Nuqtalar soni:** 9 ta (3D geometrik taqsimot)

---

## 2. KALIBRATSIYA OBYEKTI VA ETALON

### 2.1 Kalibratsiya obyekti (Quritish shkafi)

**Ma'lumotlar:**
- **Nomi:** Quritish shkafi / Sушильный шкаф (Quritish shkafi)
- **Turi/Modeli:** RTOP-500Y (misol)
- **Zavod raqami:** 2333001557 (misol)
- **Ishlab chiqaruvchi:** Kitay (CN)
- **Diapazoni:** 0°C dan 50°C gacha (yoki boshqa)
- **Razreshayushchaya sposobnost:** 0.1°C

### 2.2 Etalon asboblar

#### a) Termometr labaratoriy elektronik
- **Turi:** LTA/Б-300МТ
- **Zavod №:** 871352
- **Diapazoni:** -196°C dan +300°C gacha
- **Aniqlik:** δ = ±0.2°C
- **O'lchash aniqligi (D):** 0.001°C
- **Noaniqlik (U(ther)):** 0.1°C

#### b) Termometr qarshilikli raqamli (Kalibrator)
- **Turi:** STS-200 A 915 (RTC-156B)
- **Zavod №:** 613343-19 (617498-00393)
- **Diapazoni:** -30°C dan +155°C gacha
- **Aniqlik:** δ = ±0.04°C
- **O'lchash aniqligi (D):** 0.01°C
- **Noaniqlik (U(ther)):** 0.1°C

#### v) Registrator-datalagger
- **Turi:** DL200D
- **Zavod №:** 068.1019.0802.034
- **Parametrlar:**
  - Harorat: -20°C dan +50°C, δ = ±0.3°C
  - Namlik: 0% dan 100%, δ = ±2%
  - Bosim: 300 hPa dan 1300 hPa, δ = ±0.5 hPa

#### g) Kalibrator temperaturiy
- **Turi:** RTC-700B
- **Zavod №:** 607558/00244(605105-04)
- **Diapazoni:** +10°C dan +700°C gacha
- **Aniqlik:** δ ± 0.11°C

---

## 3. 9 NUQTALI O'LCHASH TIZIMI

### 3.1 Nuqtalarning joylashuvi (3D geometriya)

Kamera ichida **3×3×1 = 9 nuqta** - 3D koordinatalarda taqsimlangan:

```
         YUQORI QAVAT (y = +H/2)
         
    N4 ●─────────● N3
       │         │
       │   ●N5   │  (Markaz - Reference)
       │         │
    N1 ●─────────● N2


         PASTKI QAVAT (y = -H/2)
         
    N9 ●─────────● N8
       │         │
       │         │
       │         │
    N6 ●─────────● N7
```

### 3.2 Koordinatalar (misol uchun L=3m, W=3m, H=3m kamera)

| Nuqta | Nomi | X (m) | Y (m) | Z (m) | Tavsif |
|-------|------|-------|-------|-------|--------|
| **N1** | Yuqori-Chap-Old | -1.2 | +1.2 | -1.0 | Yuqori old chap burchak |
| **N2** | Yuqori-O'ng-Old | +1.2 | +1.2 | -1.0 | Yuqori old o'ng burchak |
| **N3** | Yuqori-O'ng-Orqa | +1.2 | +1.2 | +1.0 | Yuqori orqa o'ng burchak |
| **N4** | Yuqori-Chap-Orqa | -1.2 | +1.2 | +1.0 | Yuqori orqa chap burchak |
| **N5** | Markaz (Reference) | 0.0 | 0.0 | 0.0 | Geometrik markaz |
| **N6** | Pasti-Chap-Old | -1.2 | -1.2 | -1.0 | Pastki old chap burchak |
| **N7** | Pasti-O'ng-Old | +1.2 | -1.2 | -1.0 | Pastki old o'ng burchak |
| **N8** | Pasti-O'ng-Orqa | +1.2 | -1.2 | +1.0 | Pastki orqa o'ng burchak |
| **N9** | Pasti-Chap-Orqa | -1.2 | -1.2 | +1.0 | Pastki orqa chap burchak |

### 3.3 O'lchash tartibi

1. Kamerani o'rnatish haroratiga yetkazish (masalan, 30°C)
2. 15-30 daqiqa kutish (stabilizatsiya)
3. Har bir nuqtada **10 ta o'lchov** (1-2 daqiqa interval bilan)
4. Muhit sharoitlarini qayd qilish

---

## 4. MA'LUMOTLARNI YIG'ISH

### 4.1 Har bir nuqta uchun 10 ta o'lchov

**Jadval namunasi (N1 nuqta uchun):**

| № | Harorat T (°C) |
|---|----------------|
| 1 | 29.987 |
| 2 | 30.012 |
| 3 | 29.995 |
| 4 | 30.008 |
| 5 | 30.001 |
| 6 | 29.992 |
| 7 | 30.015 |
| 8 | 29.998 |
| 9 | 30.005 |
| 10 | 29.989 |

**Eslatma:** Har bir nuqta uchun alohida jadval to'ldiriladi.

### 4.2 Muhit sharoitlari

| Parametr | Boshida | Oxirida |
|----------|---------|---------|
| Temperatura muhit (°C) | 24.0 | 24.5 |
| Nisbiy namlik (%) | 37.7 | 38.5 |
| Atmosfera bosimi (hPa) | 1012.2 | 1013.0 |

---

## 5. STATISTIK HISOBLASHLAR

### 5.1 Har bir nuqta uchun

#### a) O'rtacha qiymat (Mean)

```
T̄ᵢ = (T₁ + T₂ + ... + T₁₀) / 10
```

**Misol (N1 uchun):**
```
T̄₁ = (29.987 + 30.012 + 29.995 + ... + 29.989) / 10
T̄₁ = 300.002 / 10 = 30.000°C
```

#### b) Standart og'ish (Standard Deviation)

```
s(Tᵢ) = √[Σ(Tⱼ - T̄ᵢ)² / (n-1)]
```

**Misol:**
```
s(T₁) = √[((29.987-30.000)² + (30.012-30.000)² + ... ) / 9]
s(T₁) = √(0.00095 / 9)
s(T₁) = 0.0103°C
```

#### v) Minimum va Maximum

```
Tₘᵢₙ = min(T₁, T₂, ..., T₁₀)
Tₘₐₓ = max(T₁, T₂, ..., T₁₀)
```

### 5.2 Barcha nuqtalar bo'yicha

#### a) Umumiy o'rtacha

```
T̄ₜₒₜₐₗ = (T̄₁ + T̄₂ + ... + T̄₉) / 9
```

#### b) Neodnorodnost (Gradient)

```
ΔT = (Tₘₐₓ - Tₘᵢₙ) / 2
```

Bu yerda:
- **Tₘₐₓ** - barcha nuqtalarning eng yuqori o'rtacha qiymati
- **Tₘᵢₙ** - barcha nuqtalarning eng past o'rtacha qiymati

**Misol:**
```
Tₘₐₓ = 30.15°C (N3 nuqtasi)
Tₘᵢₙ = 29.85°C (N9 nuqtasi)
ΔT = (30.15 - 29.85) / 2 = 0.15°C
```

---

## 6. NOANIQLIK BYUDJETI

### 6.1 10 ta noaniqlik komponenti

| № | Komponent | Belgisi | Qiymati | Taqsimot | Divisor (k) |
|---|-----------|---------|---------|----------|-------------|
| 1 | Etalon termometr noaniqliigi | U(ther) | 0.100°C | Normal | 2 |
| 2 | Kalibratsiya noaniqliigi | U(cal) | 0.050°C | Normal | 2 |
| 3 | O'lchash takrorlanuvchanligi | s(T) | hesoblangan | Normal | √n |
| 4 | Harorat gradienti | ΔT | hesoblangan | To'g'ri burchakli | √3 |
| 5 | Etalon o'lchash xatosi | δ(inst) | 0.001°C | To'g'ri burchakli | √3 |
| 6 | Muhit ta'siri (temperatura) | δ(env) | 0.020°C | To'g'ri burchakli | √3 |
| 7 | Barqarorlik (stabilitet) | δ(stab) | 0.030°C | To'g'ri burchakli | √3 |
| 8 | Raqamli ko'rsatish aniqlanuvchanligi | δ(res) | 0.050°C | To'g'ri burchakli | √3 |
| 9 | Interpolatsiya xatosi | δ(interp) | 0.010°C | To'g'ri burchakli | √3 |
| 10 | Kalibrlash punkti barqarorligi | δ(drift) | 0.020°C | To'g'ri burchakli | √3 |

### 6.2 Hisoblash jarayoni

#### QADAM 1: Standart noaniqlik u(xᵢ)

Har bir komponent uchun:

```
u(xᵢ) = qiymat / divisor
```

**Misollar:**

**Komponent 1:** Etalon termometr
```
u(x₁) = U(ther) / k₁ = 0.100 / 2 = 0.0500°C
```

**Komponent 3:** Takrorlanuvchilik (90 ta o'lchov, n=90)
```
s(T) = 0.0103°C (barcha nuqtalar bo'yicha)
u(x₃) = s(T) / √n = 0.0103 / √90 = 0.0103 / 9.487 = 0.0011°C
```

**Komponent 4:** Gradient
```
ΔT = 0.15°C
u(x₄) = ΔT / √3 = 0.15 / 1.732 = 0.0866°C
```

**Komponent 6:** Muhit ta'siri
```
u(x₆) = 0.020 / √3 = 0.020 / 1.732 = 0.0115°C
```

#### QADAM 2: Sezgirlik koeffitsienti cᵢ

Ko'pincha **cᵢ = 1** (to'g'ridan-to'g'ri ta'sir).

#### QADAM 3: Kombinatsiyalangan ta'sir uᵢ(y)

```
uᵢ(y) = cᵢ × u(xᵢ)
```

Agar cᵢ = 1 bo'lsa:
```
uᵢ(y) = u(xᵢ)
```

#### QADAM 4: Birlashtirilgan standart noaniqlik uс(y)

```
uс(y) = √[Σ uᵢ(y)²]
```

**To'liq hisob (misol):**

| № | u(xᵢ) | cᵢ | uᵢ(y) | [uᵢ(y)]² |
|---|-------|----|---------| ---------|
| 1 | 0.0500 | 1 | 0.0500 | 0.002500 |
| 2 | 0.0250 | 1 | 0.0250 | 0.000625 |
| 3 | 0.0011 | 1 | 0.0011 | 0.000001 |
| 4 | 0.0866 | 1 | 0.0866 | 0.007500 |
| 5 | 0.0006 | 1 | 0.0006 | 0.000000 |
| 6 | 0.0115 | 1 | 0.0115 | 0.000132 |
| 7 | 0.0173 | 1 | 0.0173 | 0.000299 |
| 8 | 0.0289 | 1 | 0.0289 | 0.000835 |
| 9 | 0.0058 | 1 | 0.0058 | 0.000034 |
| 10 | 0.0115 | 1 | 0.0115 | 0.000132 |
| **Σ** | | | | **0.012058** |

```
uс(y) = √0.012058 = 0.1098°C
```

#### QADAM 5: Kengaytirilgan noaniqlik U

```
U = k × uс(y)
```

Bu yerda **k = 2** (95% ishonch darajasi, Normal taqsimot).

```
U = 2 × 0.1098 = 0.22°C ≈ 0.2°C
```

### 6.3 Yakuniy natija

```
Kengaytirilgan noaniqlik: U = 0.2°C
Ishonch darajasi: 95% (k=2)
```

---

## 7. YAKUNIY NATIJALAR

### 7.1 Har bir nuqta uchun jadval

| Nuqta | T̄ (°C) | s(T) | Tₘᵢₙ | Tₘₐₓ | n |
|-------|--------|------|------|------|---|
| N1 | 30.000 | 0.0103 | 29.987 | 30.015 | 10 |
| N2 | 30.012 | 0.0095 | 29.995 | 30.025 | 10 |
| N3 | 30.150 | 0.0120 | 30.135 | 30.168 | 10 |
| N4 | 29.985 | 0.0088 | 29.970 | 30.000 | 10 |
| N5 | 30.005 | 0.0092 | 29.992 | 30.018 | 10 |
| N6 | 29.992 | 0.0110 | 29.978 | 30.010 | 10 |
| N7 | 30.008 | 0.0105 | 29.995 | 30.022 | 10 |
| N8 | 29.998 | 0.0098 | 29.985 | 30.012 | 10 |
| N9 | 29.850 | 0.0115 | 29.835 | 29.868 | 10 |

### 7.2 Umumiy ko'rsatkichlar

```
Umumiy o'rtacha: T̄ₜₒₜₐₗ = 30.00°C
Neodnorodnost: ΔT = 0.15°C
Kengaytirilgan noaniqlik: U = 0.2°C (k=2, 95%)
```

---

## 8. SERTIFIKAT VA PROTOKOL

### 8.1 Sertifikat tuzilishi

**Sertifikat raqami:** Uz-112/1-2025

**1. Asosiy ma'lumotlar:**
- Sana
- Buyurtmachi
- Obyekt nomi, turi, zavod raqami
- Ishlab chiqaruvchi
- Kalibratsiya nuqtasi

**2. Natijalar jadvali:**
- 9 ta nuqta bo'yicha: T̄, s, min, max

**3. Noaniqlik:**
```
Kengaytirilgan noaniqlik: U = 0.2°C
(k=2, 95% ishonch darajasi)
```

**4. Metodika:**
- KU-10-2025
- EURAMET cg-20 Version 5.0

**5. Imzolar:**
- Kalibrovkani bajargan
- Tasdiqlagan (Laboratoriya rahbari)

### 8.2 Protokol (Bayonnoma)

**Protokol raqami:** Uz-112/1-2025

**Ichida:**
1. Birlamchi ma'lumotlar (10×9 = 90 ta o'lchov)
2. Jadval: har bir nuqta uchun 10 ta qiymat
3. Muhit sharoitlari
4. Etalon ma'lumotlari

---

## 9. EXCEL FORMULALAR

### 9.1 Asosiy formulalar

#### O'rtacha:
```
=AVERAGE(B2:B11)
```

#### Standart og'ish:
```
=STDEV.S(B2:B11)
```

#### Min/Max:
```
=MIN(B2:B11)
=MAX(B2:B11)
```

#### Gradient:
```
=(MAX(T1:T9) - MIN(T1:T9))/2
```

#### Standart noaniqlik (Normal):
```
=qiymat/2
```

#### Standart noaniqlik (To'g'ri burchakli):
```
=qiymat/SQRT(3)
```

#### Takrorlanuvchilik:
```
=STDEV.S(barcha_olchovlar)/SQRT(COUNT(barcha_olchovlar))
```

#### Birlashtirilgan noaniqlik:
```
=SQRT(SUMSQ(u1, u2, u3, ..., u10))
```

#### Kengaytirilgan noaniqlik:
```
=2 * uc
```

---

## 10. AMALIY ISHNI BAJARISH KETMA-KETLIGI

### QADAM 1: Tayyorgarlik (15 daqiqa)
1. Quritish shkafinini o'rnatish haroratiga yetkazish
2. Etalon asboblarni joylashtirish (9 nuqtaga)
3. Muhit sharoitlarini qayd qilish (boshlang'ich)

### QADAM 2: Stabilizatsiya (30 daqiqa)
1. Haroratning barqarorligini kutish
2. ±0.1°C og'ish ichida

### QADAM 3: O'lchashlar (90 daqiqa)
**Har bir nuqta uchun:**
1. Birinchi o'lchov
2. 1-2 daqiqa kutish
3. Ikkinchi o'lchov
4. ... (10 marta takrorlash)

**Jami:** 90 ta o'lchov (9 nuqta × 10 o'lchov)

### QADAM 4: Tugash (5 daqiqa)
1. Muhit sharoitlarini qayd qilish (oxirgi)
2. Quritish shkafinini o'chirish

### QADAM 5: Hisoblashlar (30 daqiqa)
1. Excel ga ma'lumotlarni kiritish
2. Har bir nuqta uchun: T̄, s, min, max
3. Gradient hisoblash
4. 10 ta noaniqlik komponenti
5. Birlashtirilgan va kengaytirilgan noaniqlik

### QADAM 6: Sertifikat yaratish (15 daqiqa)
1. Sertifikat PDF
2. Protokol PDF
3. Imzolar

---

## 11. MUHIM ESLATMALAR

### ⚠️ Xatolarga yo'l qo'ymaslik

1. **O'lchashlar:** Har doim 10 ta o'lchov - kam emas, ko'p emas
2. **Stabilizatsiya:** Kamida 30 daqiqa kutish
3. **Etalon:** Amal qilish muddatini tekshirish
4. **Formulalar:** Excel da to'g'ri kataklar
5. **Birliklar:** Barcha qiymatlar °C da
6. **Imzolar:** Faqat vakolatli shaxslar

### ✅ To'g'ri natijalar uchun

1. Kamera eshigini yopiq saqlash
2. Muhit sharoitlarini barqaror tutish
3. Etalon asboblarni to'g'ri joylashtirish
4. Ma'lumotlarni darhol qayd qilish
5. Hisoblashlarni ikki marta tekshirish

---

## 12. XULOSA

Bu metodika **EURAMET cg-20** standartiga to'liq mos keladi va **O'zbekiston Milliy Metrologiya Instituti** tomonidan tasdiqlangan.

**Asosiy natija:**
```
Quritish shkafining harorat maydonini 9 nuqtada kalibratsiya qilish
va kengaytirilgan noaniqlik U ni hisoblash (odatda ±0.2°C atrofida).
```

**Sertifikat amal qilish muddati:** Odatda 1 yil.

---

## QISQARTMALAR

- **T** - Harorat (Temperature)
- **T̄** - O'rtacha harorat (Mean Temperature)
- **s** - Standart og'ish (Standard Deviation)
- **U** - Kengaytirilgan noaniqlik (Expanded Uncertainty)
- **k** - Qoplash koeffitsienti (Coverage Factor)
- **ΔT** - Neodnorodnost, Gradient
- **n** - O'lchashlar soni (Number of measurements)
- **°C** - Gradus Selsiy (Degrees Celsius)

---

**YARATILDI:** 2026-11-10  
**MUALLIF:** O'zMMI Kalibratsiya Bo'limi  
**VERSIYA:** 1.0

---

# QAYG'URMASLIK UCHUN TEKSHIRISH RO'YXATI

## Ishni boshlashdan oldin:
- [ ] Etalon asboblari kalibratsiya qilinganmi?
- [ ] Barcha asboblar ishlayaptimi?
- [ ] Quritish shkafi tozami?
- [ ] Muhit sharoitlari normalmi?

## O'lchashlar davomida:
- [ ] Stabilizatsiya kutildimi?
- [ ] 10 ta o'lchov bajarilganmi?
- [ ] Ma'lumotlar qayd qilindimi?
- [ ] Etalon asboblar to'g'ri joylashganmi?

## Hisoblashlar:
- [ ] Barcha formulalar to'g'rimi?
- [ ] 10 ta noaniqlik komponenti hisoblanganmi?
- [ ] Birlashtirilgan noaniqlik topildimi?
- [ ] U = k × uc formulasi qo'llanildimi?

## Sertifikat:
- [ ] Barcha maydonlar to'ldirilganmi?
- [ ] Imzolar qo'yilganmi?
- [ ] Sana to'g'rimi?
- [ ] Protokol biriktirilganmi?

---

Bu **to'liq metodika** va **hisob-kitob qo'llanmasi**. AI yoki boshqa dastur bilan ishlatish uchun tayyor! 🚀
