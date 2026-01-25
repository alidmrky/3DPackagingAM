# Hybrid BLFLG Algoritması - Detaylı Adım Adım Örnek

## 🎯 Senaryo

**Makine:** 400 × 400 × 400 (Genişlik × Derinlik × Yükseklik)

**Parçalar:**
- **Parça 1:** 150 × 100 × 50 (W×D×H)
- **Parça 2:** 100 × 80 × 60
- **Parça 3:** 80 × 120 × 40
- **Parça 4:** 120 × 90 × 70

**Kromozom Sırası:** [1, 2, 3, 4]

---

## 📦 PARÇA 1: İlk Yerleşim

### Durum
- Makine boş
- Yerleştirilecek: **Parça 1** (150×100×50)

### Adım 1: Z Seviyelerini Belirle
```
Z_levels = {0}  // Sadece zemin
```

### Adım 2: Grid Search (Z=0 seviyesinde)

**Grid parametreleri:**
- step_x = max(1, ⌊150/4⌋) = 37
- step_y = max(1, ⌊100/4⌋) = 25

**Arama noktaları:**
```
X: 0, 37, 74, 111, 148, 185, 222, 259...
Y: 0, 25, 50, 75, 100, 125, 150...
Z: 0
```

### Adım 3: İlk Geçerli Pozisyon

**Test edilen pozisyon:** (0, 0, 0)

```
✓ Makine sınırları kontrol:
  - x + w = 0 + 150 = 150 ≤ 400 ✓
  - y + d = 0 + 100 = 100 ≤ 400 ✓
  - z + h = 0 + 50 = 50 ≤ 400 ✓

✓ Overlap kontrol:
  - Yerleştirilmiş parça yok → Overlap yok ✓
```

**Skorlama:**
```
score = z × 10⁶ + y × 10³ + x
score = 0 × 10⁶ + 0 × 10³ + 0 = 0
```

### Sonuç
✅ **Parça 1 yerleştirildi:** (0, 0, 0)

**Makine durumu:**
```
Katman Z=0-50:
┌─────────────────────────────────┐
│  [Parça 1]                      │
│  150×100                        │
│                                 │
│                                 │
│                                 │
└─────────────────────────────────┘
```

---

## 📦 PARÇA 2: İkinci Yerleşim

### Durum
- Makine'de 1 parça var
- Yerleştirilecek: **Parça 2** (100×80×60)

### Adım 1: Z Seviyelerini Belirle
```
Z_levels = {0, 50}
  - 0: Zemin
  - 50: Parça 1'in üstü (z + h = 0 + 50)
```

### Adım 2: Z=0 Seviyesinde Arama

**Grid parametreleri:**
- step_x = max(1, ⌊100/4⌋) = 25
- step_y = max(1, ⌊80/4⌋) = 20

**Candidate pozisyonlar (Z=0):**

#### Test 1: (0, 0, 0)
```
✗ Overlap kontrol:
  Parça 1: (0, 0, 0) boyut (150, 100, 50)
  Parça 2: (0, 0, 0) boyut (100, 80, 60)
  
  overlap_x = (0 < 0+150) AND (0+100 > 0) = TRUE
  overlap_y = (0 < 0+100) AND (0+80 > 0) = TRUE
  overlap_z = (0 < 0+50) AND (0+60 > 0) = TRUE
  
  Çakışma var! ✗
```

#### Test 2: (150, 0, 0) - Parça 1'in sağı
```
✓ Makine sınırları:
  - x + w = 150 + 100 = 250 ≤ 400 ✓
  - y + d = 0 + 80 = 80 ≤ 400 ✓
  - z + h = 0 + 60 = 60 ≤ 400 ✓

✓ Overlap kontrol:
  Parça 1: (0, 0, 0)-(150, 100, 50)
  Parça 2: (150, 0, 0)-(250, 80, 60)
  
  overlap_x = (150 < 150) = FALSE → Çakışma yok! ✓
```

**Skorlama:**
```
score = 0 × 10⁶ + 0 × 10³ + 150 = 150
```

### Adım 3: Z=50 Seviyesinde Arama

**Not:** Z=50 seviyesinde (Parça 1'in üstü) de deneriz ama daha yüksek skor (50×10⁶) olacağı için öncelik Z=0'a verilir.

### Sonuç
✅ **Parça 2 yerleştirildi:** (150, 0, 0)

**Makine durumu:**
```
Katman Z=0-50:
┌─────────────────────────────────┐
│  [Parça 1]  [Parça 2]           │
│  150×100    100×80              │
│                                 │
│                                 │
│                                 │
└─────────────────────────────────┘

Katman Z=50-60 (sadece Parça 2):
┌─────────────────────────────────┐
│              [Parça 2]          │
│              (50-60)            │
│                                 │
└─────────────────────────────────┘
```

**Üstten Görünüm (XY düzlemi, Z=0-60):**
```
Y ↑
  │  ┌───────────────┬──────────┐
  │  │               │          │
100 │  │   Parça 1   │  Parça 2 │
  │  │   150×100×50  │ 100×80×60│
 80 │  │             └──────────┘
  │  │                          
  0 └──┴──────────────┴──────────→ X
     0              150        250
```

---

## 📦 PARÇA 3: Üçüncü Yerleşim (Boşluk Bulma Örneği)

### Durum
- Makine'de 2 parça var
- Yerleştirilecek: **Parça 3** (80×120×40)

### Adım 1: Z Seviyelerini Belirle
```
Z_levels = {0, 50, 60}
  - 0: Zemin
  - 50: Parça 1'in üstü
  - 60: Parça 2'nin üstü
```

### Adım 2: Z=0 Seviyesinde Grid Search

**Grid parametreleri:**
- step_x = max(1, ⌊80/4⌋) = 20
- step_y = max(1, ⌊120/4⌋) = 30

**Önemli test pozisyonları:**

#### Test 1: (0, 100, 0) - Parça 1'in arkası
```
✓ Makine sınırları:
  - x + w = 0 + 80 = 80 ≤ 400 ✓
  - y + d = 100 + 120 = 220 ≤ 400 ✓
  - z + h = 0 + 40 = 40 ≤ 400 ✓

✓ Overlap kontrol:
  Parça 1: (0, 0, 0)-(150, 100, 50)
  Parça 3: (0, 100, 0)-(80, 220, 40)
  
  overlap_x = (0 < 150) AND (80 > 0) = TRUE
  overlap_y = (100 < 100) = FALSE → Y ekseninde çakışma yok! ✓
  
  Parça 2: (150, 0, 0)-(250, 80, 60)
  Parça 3: (0, 100, 0)-(80, 220, 40)
  
  overlap_x = (0 < 250) AND (80 > 150) = FALSE → Çakışma yok! ✓
```

**Skorlama:**
```
score = 0 × 10⁶ + 100 × 10³ + 0 = 100,000
```

#### Test 2: (250, 0, 0) - Parça 2'nin sağı
```
score = 0 × 10⁶ + 0 × 10³ + 250 = 250
```

**Karşılaştırma:**
- (250, 0, 0): score = 250 ← **Daha düşük (daha iyi!)**
- (0, 100, 0): score = 100,000

### Sonuç
✅ **Parça 3 yerleştirildi:** (250, 0, 0)

**Üstten Görünüm:**
```
Y ↑
  │  ┌───────────────┬──────────┬────────┐
  │  │               │          │        │
220 │  │               │          │        │
  │  │               │          │        │
120 │  │               │          │ Parça 3│
100 │  │   Parça 1   │  Parça 2 │ 80×120 │
  │  │   150×100×50  │ 100×80×60│ ×40    │
 80 │  │             └──────────┘        │
  0 └──┴──────────────┴──────────┴────────┴→ X
     0              150        250      330
```

---

## 📦 PARÇA 4: Dördüncü Yerleşim (Boşluk Algılama - Hybrid'in Gücü!)

### Durum
- Makine'de 3 parça var
- Yerleştirilecek: **Parça 4** (120×90×70)

### Makine Mevcut Durumu
```
Parça 1: (0, 0, 0) → (150, 100, 50)
Parça 2: (150, 0, 0) → (250, 80, 60)
Parça 3: (250, 0, 0) → (330, 120, 40)
```

### Adım 1: Z Seviyelerini Belirle
```
Z_levels = {0, 40, 50, 60}
```

### Adım 2: Z=0 Grid Search

**Grid parametreleri:**
- step_x = max(1, ⌊120/4⌋) = 30
- step_y = max(1, ⌊90/4⌋) = 22

#### Test 1: (150, 80, 0) - **BOŞLUK TESPİTİ!**

**Bu neden önemli?**
Corner-based yaklaşım bu pozisyonu bulamazdı çünkü tam bir "köşe" değil!

```
✓ Makine sınırları:
  - x + w = 150 + 120 = 270 ≤ 400 ✓
  - y + d = 80 + 90 = 170 ≤ 400 ✓
  - z + h = 0 + 70 = 70 ≤ 400 ✓

✓ Overlap kontrol:
  Parça 1: (0, 0, 0)-(150, 100, 50)
  Parça 4: (150, 80, 0)-(270, 170, 70)
  
  overlap_x = (150 < 150) = FALSE → X'te çakışma yok ✓
  
  Parça 2: (150, 0, 0)-(250, 80, 60)
  Parça 4: (150, 80, 0)-(270, 170, 70)
  
  overlap_y = (80 < 80) = FALSE → Y'de çakışma yok ✓
  
  Parça 3: (250, 0, 0)-(330, 120, 40)
  Parça 4: (150, 80, 0)-(270, 170, 70)
  
  overlap_x = (150 < 330) AND (270 > 250) = TRUE
  overlap_y = (80 < 120) AND (170 > 0) = TRUE
  overlap_z = (0 < 40) AND (70 > 0) = TRUE
  
  HEPSİ TRUE → ÇAKIŞMA VAR! ✗
```

#### Test 2: (0, 100, 0) - Parça 1'in arkası
```
✓ Kontroller geçerli
score = 0 × 10⁶ + 100 × 10³ + 0 = 100,000
```

### Sonuç
✅ **Parça 4 yerleştirildi:** (0, 100, 0)

**Final Durum - Üstten Görünüm:**
```
Y ↑
  │  ┌───────────────┬──────────┬────────┐
  │  │               │          │        │
220 │  │               │          │        │
  │  │               │          │        │
190 │  │   Parça 4   │          │ Parça 3│
  │  │   120×90×70   │          │ 80×120 │
120 │  ├──────────────┤          │ ×40    │
100 │  │   Parça 1   │  Parça 2 │        │
  │  │   150×100×50  │ 100×80×60│        │
 80 │  │             └──────────┘        │
  0 └──┴──────────────┴──────────┴────────┴→ X
     0              150        250      330
```

**3D Görünüm (Yan kesit):**
```
Z ↑
  │
70 │     [Parça 4: 70 yükseklik]
  │     
60 │              [Parça 2: 60]
  │     
50 │  [Parça 1: 50]
  │  
40 │                          [Parça 3: 40]
  │  
 0 └────────────────────────────────────→ X
   0   100   150   200   250   300   330
```

---

## 🎯 Hybrid Yaklaşımın Avantajları - Bu Örnekte

### 1. **Grid Search Sayesinde**
- Parça 3'ün (250, 0, 0) konumu bulundu
- Eğer sadece corner-based olsaydı, (0, 100, 0) konumunu önerebilirdi (daha az verimli)

### 2. **Corner-based Sayesinde**
- Parça 2'nin (150, 0, 0) tam köşe konumu hemen bulundu
- Grid search 150'ye ulaşmadan önce corner testi yaptı → Daha hızlı

### 3. **Adaptive Step Size**
- Büyük parçalar (Parça 1: step=37) → Hızlı tarama
- Küçük parçalar (Parça 3: step=20) → Daha detaylı arama

### 4. **Boşluk Tespiti**
- Parça 2 ile Parça 3 arasında kalan boşluk tespit edildi
- Parça 4 için (150, 80, 0) test edildi ama overlap nedeniyle reddedildi
- Algoritma alternatif (0, 100, 0) konumunu buldu

---

## 📊 Adım Adım Özet Tablosu

| Parça | Boyut (W×D×H) | Denenen Pozisyonlar | Seçilen | Neden? |
|-------|---------------|---------------------|---------|--------|
| Parça 1 | 150×100×50 | (0,0,0) | **(0,0,0)** | İlk parça, score=0 |
| Parça 2 | 100×80×60 | (0,0,0)❌, (150,0,0)✓ | **(150,0,0)** | P1'in sağı, score=150 |
| Parça 3 | 80×120×40 | (250,0,0)✓, (0,100,0) | **(250,0,0)** | P2'nin sağı, score=250 < 100k |
| Parça 4 | 120×90×70 | (150,80,0)❌, (0,100,0)✓ | **(0,100,0)** | P1'in arkası, (150,80) overlap |

---

## 💡 Öğrenilen Dersler

### Grid Search'ün Önemi
- **(150, 80, 0) pozisyonu test edildi** → Corner değil, grid noktası!
- Overlap tespit edildi ve reddedildi
- Pure corner-based bu pozisyonu denemezdi bile

### Scoring'in Etkisi
- Parça 3 için: score(250,0,0) = 250 < score(0,100,0) = 100,000
- **Bottom-Left prensibi:** Önce X ekseni, sonra Y ekseni

### Adaptif Adım
- Büyük parça (150×100): step_x=37 → Daha hızlı
- Küçük parça (80×120): step_y=30 → Daha hassas

---

## 🔍 Algoritma Akışı - Özet

```
Parça geldi
    ↓
Z seviyelerini al
    ↓
Her Z için:
    ├─ Grid Search (step = size/4)
    │   └─ Her nokta: CanPlace? → Candidate ekle
    │
    └─ Corner Search (exact)
        └─ Her köşe: CanPlace? → Candidate ekle
    ↓
Duplicate'leri temizle
    ↓
Score'a göre sırala
    ↓
En düşük score'lu pozisyonu seç
    ↓
Yerleştir!
```

---

##

> **Örnek 1:** Şekil 1'de görüldüğü üzere, Parça 2 için hem (0,0,0) hem de (150,0,0) pozisyonları test edilmiştir. Grid search yaklaşımı her iki pozisyonu da algılamış, ancak (0,0,0) konumunda Parça 1 ile overlap tespit edildiği için reddedilmiştir. Bottom-Left scoring fonksiyonu sayesinde (150,0,0) konumu (score=150) seçilmiştir.

> **Örnek 2:** Parça 4 için kritik bir boşluk tespiti gerçekleştirilmiştir. Hybrid yaklaşım, (150,80,0) gibi standart köşe noktası olmayan bir pozisyonu da test etmiş ancak Parça 3 ile overlap nedeniyle reddetmiştir. Bu, grid-search'ün kapsamlı arama yeteneğini göstermektedir.

---

Bu örneklerle algoritmanızın nasıl çalıştığını akademik seviyede açıklayabilirsiniz! 🎯
