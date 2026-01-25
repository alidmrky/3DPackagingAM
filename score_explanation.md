# Score Sistemi Açıklaması

## Score Nedir?

**Score**, yerleşim algoritmasında hangi pozisyonun **daha iyi** olduğunu belirleyen bir **öncelik numarası**dır.

### Temel Prensip
```
En DÜŞÜK score = En İYİ pozisyon
```

---

## Formül

```
score = z × 1,000,000 + y × 1,000 + x
```

### Bileşenler

| Bileşen | Anlamı | Ağırlık | Öncelik |
|---------|--------|---------|---------|
| **z** | Yükseklik (Z ekseni) | 1,000,000 | 1. (En önemli) |
| **y** | Derinlik (Y ekseni) | 1,000 | 2. |
| **x** | Genişlik (X ekseni) | 1 | 3. (En az önemli) |

---

## Nasıl Çalışır?

### Örnek 1: Aynı Z Seviyesinde

```
Pozisyon A: (10, 5, 0)
score_A = 0 × 1,000,000 + 5 × 1,000 + 10 = 5,010

Pozisyon B: (150, 0, 0)
score_B = 0 × 1,000,000 + 0 × 1,000 + 150 = 150

Pozisyon C: (0, 100, 0)
score_C = 0 × 1,000,000 + 100 × 1,000 + 0 = 100,000
```

**Sıralama (en iyiden en kötüye):**
1. ✅ **Pozisyon B** (score = 150) ← KAZANAN!
2. Pozisyon A (score = 5,010)
3. Pozisyon C (score = 100,000)

**Neden B kazandı?**
- Hepsi Z=0'da (aynı yükseklikte)
- B, Y=0'da (en önde)
- A ve C daha arkada (Y > 0)

---

### Örnek 2: Farklı Z Seviyeleri

```
Pozisyon A: (0, 0, 0)    - Zemin seviyesi
score_A = 0 × 1,000,000 + 0 × 1,000 + 0 = 0

Pozisyon B: (0, 0, 50)   - 50 birim yükseklikte
score_B = 50 × 1,000,000 + 0 × 1,000 + 0 = 50,000,000

Pozisyon C: (200, 200, 0) - Zemin ama çok uzakta
score_C = 0 × 1,000,000 + 200 × 1,000 + 200 = 200,200
```

**Sıralama:**
1. ✅ **Pozisyon A** (score = 0) ← KAZANAN!
2. Pozisyon C (score = 200,200)
3. Pozisyon B (score = 50,000,000)

**Neden A kazandı?**
- Z=0 (en altta) → Bu çok önemli!
- B yukarda olduğu için (Z=50), X ve Y'si ne olursa olsun kaybediyor

---

## Bottom-Left Prensibi

Score formülü **Bottom-Left heuristic**'i uygular:

```
1. Önce EN ALTA yerleştir (Z minimize et)
2. Sonra EN ÖNE yerleştir (Y minimize et)
3. Son olarak EN SOLA yerleştir (X minimize et)
```

### Görsel Örnek

```
         Y (derinlik)
         ↑
       100│     C (0,100,0)
         │     score = 100,000
         │
        50│   A (10,5,0)
         │   score = 5,010
         │
         0├─────B (150,0,0)────→ X (genişlik)
         0    150              score = 150
                               ← KAZANAN!
```

---

## Neden Bu Ağırlıklar?

### Lexicographic Ordering (Sözlük Sıralaması)

Ağırlıklar şöyle seçildi ki:
- **Bir Z artışı**, Y ve X'in maksimum değerlerinden bile öncelikli olsun
- **Bir Y artışı**, X'in maksimum değerinden öncelikli olsun

### Matematiksel Garanti

```
Z farkı = 1
Z'nin katkısı = 1 × 1,000,000 = 1,000,000

Y'nin maksimum katkısı (örn. Y=999):
999 × 1,000 = 999,000 < 1,000,000 ✓

Sonuç: Z her zaman öncelikli!
```

Aynı şekilde:
```
Y farkı = 1
Y'nin katkısı = 1 × 1,000 = 1,000

X'in maksimum katkısı (örn. X=999):
999 × 1 = 999 < 1,000 ✓

Sonuç: Y her zaman X'ten öncelikli!
```

---

## Gerçek Bir Örnekle

### Senaryo: 400×400×400 mm Makine

**Test edilen pozisyonlar:**

| # | Pozisyon | Z | Y | X | Score | Açıklama |
|---|----------|---|---|---|-------|----------|
| 1 | (0, 0, 0) | 0 | 0 | 0 | **0** | ✅ En iyi - Zemin, en ön, en sol |
| 2 | (150, 0, 0) | 0 | 0 | 150 | **150** | Zemin, en ön, biraz sağda |
| 3 | (0, 100, 0) | 0 | 100 | 0 | **100,000** | Zemin, arkada, en sol |
| 4 | (150, 100, 0) | 0 | 100 | 150 | **100,150** | Zemin, arkada, sağda |
| 5 | (0, 0, 50) | 50 | 0 | 0 | **50,000,000** | Yüksekte - kötü! |
| 6 | (100, 50, 25) | 25 | 50 | 100 | **25,050,100** | Orta yükseklikte - orta |

**Algoritma seçimi:** Pozisyon #1 (score = 0)

---

## JSON Output'ta Score

Artık JSON dosyasında her attempt için score bilgisi de var:

```json
{
  "stepNumber": 2,
  "partId": 12,
  "attempts": [
    {
      "machineId": 1,
      "success": false,
      "testedZLevels": [0, 50],
      "totalPositionsTested": 245,
      "reason": "All positions have overlap"
    },
    {
      "machineId": 2,
      "success": true,
      "position": {"x": 150, "y": 0, "z": 0},
      "score": 150,
      "testedZLevels": [0, 40, 60],
      "totalPositionsTested": 187
    }
  ],
  "finalPlacement": {
    "machineId": 2,
    "position": {"x": 150, "y": 0, "z": 0}
  }
}
```

---

## Özet

✅ **Score = Öncelik numarası**  
✅ **Düşük score = İyi pozisyon**  
✅ **Z > Y > X önceliği** (Bottom-Left)  
✅ **Lexicographic ordering** garantisi  
✅ **Akademik olarak geçerli** (Baker 1980)  

Bu sistem sayesinde algoritma her zaman önce altta, sonra önde, sonra solda yer arıyor! 🎯
