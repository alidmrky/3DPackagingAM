# Akademik Makale Test Verileri

Bu dosyalar, akademik makaledeki tam değerleri içerir.

## Makineler (machines2.json)

**Table 1. Specifications of the AM machines**

| Parametre | k₁ | k₂ |
|-----------|----|----|
| VT_m (hour/cm³) | 0.030864 | 0.030864 |
| HT_m (hour/cm) | 1 | 1 |
| SET_m (hour) | 2 | 1 |
| MH_m (cm) | 32.5 | 32.5 |
| MA_m (cm²) | 625 | 625 |

**Not:** MA_m = 625 cm² → 25cm × 25cm

## Parçalar (parts2.json)

**Table 2. Part specifications**

| Part | Height (cm) | Area (cm²) | Volume (cm³) | Release Date (hr) | Due Date (hr) |
|------|-------------|------------|--------------|-------------------|---------------|
| 1 | 16.7 | 300.8 | 1573.8 | 6.3 | 305.9 |
| 2 | 8.8 | 152.8 | 421.5 | 7.3 | 282.2 |
| 3 | 20.3 | 19.5 | 147.8 | 9.8 | 378.3 |
| 4 | 7.4 | 84.2 | 285.2 | 20.9 | 214.7 |
| 5 | 27.3 | 61.1 | 583.3 | 36.5 | 149.0 |
| 6 | 25.8 | 299.3 | 3282.5 | 51.5 | 211.6 |
| 7 | 14.5 | 148.7 | 1265.5 | 56.3 | 240.4 |
| 8 | 3.5 | 376.4 | 723.3 | 69.9 | 576.2 |
| 9 | 20.4 | 20.5 | 278.5 | 75.0 | 330.9 |
| 10 | 23.3 | 91.1 | 1051.8 | 86.0 | 388.0 |

**Not:** Kenar1 ve Kenar2 değerleri, Area'dan hesaplanmıştır (kare taban varsayımı ile: √Area).

## Beklenen Sonuç

Makaledeki sonuç: **Min OBJ = 85.2 hr**

Senin algoritmanın bu değere yakın veya daha iyi bir sonuç bulması beklenir.

## Test Etmek İçin

1. Makineler sayfasından `machines2.json` dosyasını import et
2. Parçalar sayfasından `parts2.json` dosyasını import et
3. Optimizasyon sayfasında optimize et
4. Sonucu 85.2 hr ile karşılaştır
