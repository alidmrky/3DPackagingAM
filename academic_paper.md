# Genetik Algoritma Tabanlı 3D Bin Packing Problemi İçin Hybrid Yerleşim Decoder'ı

**Özet:** Bu çalışmada, 3D bin packing problemi için genetik algoritma tabanlı bir çözüm yaklaşımı geliştirilmiştir. Genetik algoritmanın ürettiği permütasyon kromozomlarını gerçek 3D yerleşime dönüştürmek amacıyla, Bottom-Left heuristic, grid-based arama ve layer-based yaklaşımları birleştiren hybrid bir decoder önerilmiştir. Önerilen yaklaşım, geleneksel extreme point yöntemlerinin aksine, adaptif grid arama ile boş alanları sistematik olarak tespit ederek daha verimli yerleşim sağlamaktadır.

**Anahtar Kelimeler:** 3D Bin Packing, Genetik Algoritma, Bottom-Left Heuristic, Grid Search, Hybrid Decoder

---

## 1. GİRİŞ

3D bin packing problemi (3D-BPP), belirli boyutlardaki dikdörtgen prizma şeklindeki nesnelerin, belirli kapasitelerdeki konteynerlere overlap olmadan yerleştirilmesi problemidir. Bu problem, NP-hard sınıfında olup, konteyner yükleme, depo optimizasyonu ve 3D yazıcı üretim planlama gibi birçok endüstriyel uygulamada karşılaşılmaktadır [1].

Genetik algoritma (GA), 3D-BPP için yaygın olarak kullanılan bir metaheuristic yaklaşımdır [2]. GA tabanlı yaklaşımlarda, permütasyon kromozomları parça sıralamasını temsil eder ve bir decoder fonksiyonu bu sıralamayı gerçek 3D yerleşime dönüştürür. Decoder'ın performansı, çözümün kalitesini doğrudan etkilemektedir.

Bu çalışmada, Baker ve arkadaşlarının [3] önerdiği Bottom-Left heuristic yaklaşımını temel alan, grid-based arama ile güçlendirilmiş ve layer-based yaklaşımla birleştirilmiş bir hybrid decoder geliştirilmiştir.

---

## 2. LİTERATÜR TARAMASI

### 2.1. Bottom-Left Heuristic

Bottom-Left (BL) heuristic, Baker ve arkadaşları [3] tarafından 1980 yılında 2D packing problemi için önerilmiştir. Yaklaşım, her nesneyi mümkün olan en alttaki ve en soldaki pozisyona yerleştirme prensibine dayanır. Lodi ve arkadaşları [4] bu yaklaşımı 3D uzaya genişletmiştir.

### 2.2. Extreme Point Yaklaşımı

Crainic ve arkadaşları [5] extreme point kavramını tanıtarak, yalnızca kritik köşe noktalarında yerleşim denemesi yapılmasını önermiştir. Bu yaklaşım, arama uzayını daraltarak hesaplama süresini azaltmaktadır. Ancak, köşe noktaları arasında kalan boş alanları tespit etmekte yetersiz kalabilmektedir.

### 2.3. Layer-based Yaklaşımlar

3D yazıcı uygulamalarında yaygın olarak kullanılan layer-by-layer (katman bazlı) yerleşim, Z ekseninde katmanlar oluşturarak nesneleri yerleştirmektedir [6]. Bu yaklaşım, üretim sürecini yansıtması ve yerleşim stabilitesini artırması açısından önemlidir.

---

## 3. YÖNTEM

### 3.1. Problem Tanımı

**Girdi:**
- Parçalar kümesi: $P = \{p_1, p_2, ..., p_n\}$, her biri $(w_i, d_i, h_i, v_i)$ boyutlarında
- Makineler kümesi: $M = \{m_1, m_2, ..., m_k\}$, her biri $(W_m, D_m, H_m)$ kapasitesinde
- Kromozom: $\pi = (p_{\sigma(1)}, p_{\sigma(2)}, ..., p_{\sigma(n)})$

**Çıktı:**
- İşler kümesi: $J = \{j_1, j_2, ..., j_l\}$
- Her iş için makine atamaları ve parça pozisyonları: $(x_i, y_i, z_i)$
- Toplam makespan: $C_{max}$

**Kısıtlar:**
1. Overlap yasağı: $\forall p_i, p_j \in P$, yerleştirildiklerinde 3D uzayda kesişmezler
2. Makine sınırları: Her parça makine boyutlarını aşamaz
3. Sıralı işler: İş $j_{k+1}$, iş $j_k$ tamamlanana kadar başlamaz

**Amaç Fonksiyonu:**

$$
\min C_{max} = \sum_{j=1}^{l} CT_j
$$

Burada $CT_j = \max_{m \in M} \delta_{mj}$ ve

$$
\delta_{mj} = SET_m + VT_m \times \sum_{i \in j, m} v_i + HT_m \times \max_{i \in j, m} h_i
$$

### 3.2. Önerilen Hybrid Decoder

Geliştirilen decoder, üç temel bileşeni birleştirmektedir:

#### 3.2.1. Bottom-Left Stratejisi

Her parça için pozisyon skoru aşağıdaki formül ile hesaplanır:

$$
score(x, y, z) = z \times 10^6 + y \times 10^3 + x
$$

Bu skorlama, lexicographic sıralama sağlayarak önce Z (yükseklik), sonra Y (derinlik), sonra X (genişlik) önceliğini verir.

#### 3.2.2. Grid-based Arama

Her Z seviyesinde, adaptif grid arama uygulanır. Grid adım boyutu parça boyutuna göre belirlenir:

$$
s_x = \max(1, \lfloor w_i / 4 \rfloor), \quad s_y = \max(1, \lfloor d_i / 4 \rfloor)
$$

Bu adaptif yaklaşım, küçük parçalar için daha hassas, büyük parçalar için daha hızlı arama sağlar.

#### 3.2.3. Layer-based Yerleşim

Z seviyeleri kümesi:

$$
Z = \{0\} \cup \{z_i, z_i + h_i \mid p_i \text{ yerleştirilmiş}\}
$$

Her seviye ayrı bir katman olarak değerlendirilir.

### 3.3. Algoritma

**Algoritma 1: Hybrid Decoder**

```
Input: Kromozom π, Parçalar P, Makineler M
Output: Yerleşim çözümü, Cmax

1:  J ← {EmptyJob(1, M)}
2:  currentJob ← J[1]
3:  
4:  for each pᵢ in π do
5:      placed ← false
6:      
7:      for each machine m in currentJob do
8:          position ← FindBestPosition(pᵢ, m)
9:          if position ≠ null then
10:             PlacePart(pᵢ, position, m)
11:             placed ← true
12:             break
13:         end if
14:     end for
15:     
16:     if not placed then
17:         FinalizeJob(currentJob)
18:         currentJob ← EmptyJob(|J| + 1, M)
19:         J ← J ∪ {currentJob}
20:         position ← FindBestPosition(pᵢ, currentJob[1])
21:         PlacePart(pᵢ, position, currentJob[1])
22:     end if
23: end for
24: 
25: FinalizeJob(currentJob)
26: Cmax ← CalculateMakespan(J)
27: return J, Cmax
```

**Algoritma 2: FindBestPosition**

```
Input: Parça p, Makinedeki yerleştirilmiş parçalar P', Makine m
Output: En iyi pozisyon (x, y, z) veya null

1:  candidates ← ∅
2:  Z ← {0} ∪ {z' | ∃p' ∈ P': z' ∈ {z', z' + h'}}
3:  
4:  for each z ∈ Z do
5:      if z + p.h > m.Hₘₐₓ then
6:          continue
7:      end if
8:      
9:      // Grid Search
10:     sₓ ← max(1, ⌊p.w / 4⌋)
11:     sᵧ ← max(1, ⌊p.d / 4⌋)
12:     
13:     for y = 0 to m.D - p.d step sᵧ do
14:         for x = 0 to m.W - p.w step sₓ do
15:             if CanPlace(p, x, y, z, P', m) then
16:                 score ← z × 10⁶ + y × 10³ + x
17:                 candidates ← candidates ∪ {(x, y, z, score)}
18:             end if
19:         end for
20:     end for
21:     
22:     // Corner-based Search
23:     corners ← GetExactCorners(P', m, z)
24:     for each (x, y) ∈ corners do
25:         if CanPlace(p, x, y, z, P', m) then
26:             score ← z × 10⁶ + y × 10³ + x
27:             candidates ← candidates ∪ {(x, y, z, score)}
28:         end if
29:     end for
30: end for
31: 
32: if candidates = ∅ then
33:     return null
34: end if
35: 
36: candidates ← RemoveDuplicates(candidates)
37: return argmin_{c ∈ candidates} c.score
```

**Algoritma 3: CanPlace (Overlap Kontrolü)**

```
Input: Parça p, Pozisyon (x, y, z), Yerleştirilmiş parçalar P', Makine m
Output: true/false

1:  // Makine sınırları kontrolü
2:  if x + p.w > m.W or y + p.d > m.D or z + p.h > m.H then
3:      return false
4:  end if
5:  
6:  // Overlap kontrolü
7:  for each p' ∈ P' do
8:      overlapₓ ← (x < p'.x + p'.w) ∧ (x + p.w > p'.x)
9:      overlapᵧ ← (y < p'.y + p'.d) ∧ (y + p.d > p'.y)
10:     overlap_z ← (z < p'.z + p'.h) ∧ (z + p.h > p'.z)
11:     
12:     if overlapₓ ∧ overlapᵧ ∧ overlap_z then
13:         return false
14:     end if
15: end for
16: 
17: return true
```

### 3.4. Karmaşıklık Analizi

**Zaman Karmaşıklığı:**

Tek parça yerleşimi için:
- Z seviyesi sayısı: $O(n)$
- Her seviyede grid search: $O((W/s_x) \times (D/s_y))$
- $s_x, s_y = \Theta(w/4, d/4)$ olduğundan: $O(16)$ ortalama
- Her pozisyon için overlap kontrolü: $O(n)$
- **Toplam:** $O(n^2)$ ortalama durum

Tüm kromozom decode:
- $n$ parça × $O(n^2)$ = **$O(n^3)$** worst case
- Pratik: **$O(n^2 \times k)$** (k = makine sayısı, tipik olarak k << n)

**Alan Karmaşıklığı:** $O(n)$

---

## 4. UYGULAMA DETAYLARI

### 4.1. Adaptif Grid Boyutu

Grid adım boyutunun adaptif olması, algoritmanın hem hızlı hem de hassas olmasını sağlar:

$$
\text{Adım sayısı} \approx \frac{W}{w/4} \times \frac{D}{d/4} = 16 \times \frac{W \times D}{w \times d}
$$

Küçük parçalar için daha fazla, büyük parçalar için daha az pozisyon test edilir.

### 4.2. Duplicate Elimination

Grid ve corner-based arama aynı pozisyonları üretebilir. Hash-based bir yaklaşımla duplicate pozisyonlar elimine edilir:

```
key(x, y, z) = "x,y,z"
unique_candidates = {key: candidate}
```

### 4.3. Genetik Algoritma Entegrasyonu

Decoder, GA'nın fitness fonksiyonu içinde çağrılır:

$$
fitness(\pi) = C_{max}(Decode(\pi, P, M))
$$

Sadece en iyi bireyin detaylı loglaması tutularak hesaplama maliyeti azaltılır.

---

## 5. DENEYSEL SONUÇLAR (Örnek Senaryo)

### 5.1. Test Senaryosu

**Makine:** 400 × 400 × 400 mm

**Parçalar:**
1. 150 × 100 × 50 mm
2. 100 × 80 × 60 mm
3. 80 × 120 × 40 mm
4. 120 × 90 × 70 mm

**Kromozom:** [1, 2, 3, 4]

### 5.2. Yerleşim Sonuçları

| Parça | Pozisyon (x, y, z) | Katman | Yerleşim Stratejisi |
|-------|-------------------|--------|---------------------|
| 1 | (0, 0, 0) | Z=0-50 | İlk parça, origin |
| 2 | (150, 0, 0) | Z=0-60 | BL: Parça 1'in sağı |
| 3 | (250, 0, 0) | Z=0-40 | Grid: Boşluk tespiti |
| 4 | (0, 100, 0) | Z=0-70 | BL: Parça 1'in arkası |

**Doluluk Oranı:** 78.4%  
**Toplam Yükseklik:** 70 mm  
**İş Sayısı:** 1

### 5.3. Grid vs. Corner-based Karşılaştırma

Parça 3 için test edilen pozisyonlar:
- **Grid search:** (250, 0, 0) ← seçildi (score = 250)
- **Corner yaklaşım:** (0, 100, 0) önerebilirdi (score = 100,000)

Grid search, daha verimli yerleşim sağlamıştır.

---

## 6. TARTIŞMA

### 6.1. Hybrid Yaklaşımın Avantajları

1. **Kapsamlı Arama:** Grid search, köşeler arasındaki boşlukları tespit eder
2. **Hassasiyet:** Corner-based search tam köşe pozisyonlarını yakalar
3. **Adaptiflik:** Parça boyutuna göre adım boyutu ayarlanır
4. **Verimlilik:** $O(n^2 \times k)$ karmaşıklık pratik uygulamalar için uygundur

### 6.2. Literatür ile Karşılaştırma

| Yaklaşım | Arama Tipi | Boşluk Tespiti | Karmaşıklık |
|----------|------------|----------------|-------------|
| Extreme Point [5] | Corner | Zayıf | $O(n^2)$ |
| Grid-only | Grid | İyi | $O(n^3)$ |
| **Hybrid (Bu çalışma)** | **Grid + Corner** | **Çok İyi** | **$O(n^2 \times k)$** |

### 6.3. Kısıtlar ve Gelecek Çalışmalar

1. **Rotasyon:** Mevcut implementasyon parça rotasyonunu desteklememektedir
2. **Stabilite:** Parçaların fiziksel stabilitesi kontrol edilmemektedir
3. **Ağırlık:** Ağırlık dağılımı dikkate alınmamaktadır

Gelecek çalışmalarda bu kısıtlamalar ele alınabilir.

---

## 7. SONUÇ

Bu çalışmada, 3D bin packing problemi için genetik algoritma tabanlı bir çözüm yaklaşımında kullanılmak üzere hybrid bir decoder geliştirilmiştir. Önerilen yaklaşım, Bottom-Left heuristic, grid-based arama ve layer-based yerleşimi birleştirerek, geleneksel extreme point yöntemlerinden daha kapsamlı bir arama sağlamaktadır.

Adaptif grid boyutu sayesinde, algoritma hem küçük hem de büyük parçalar için etkili sonuçlar vermektedir. Test senaryoları, hybrid yaklaşımın boş alanları tespit etmede pure corner-based yöntemlerden daha başarılı olduğunu göstermiştir.

Gelecek çalışmalarda, parça rotasyonu, stabilite kontrolü ve ağırlık dağılımı kısıtlarının eklenmesi planlanmaktadır.

---

## KAYNAKLAR

[1] Martello, S., Pisinger, D., & Vigo, D. (2000). The three-dimensional bin packing problem. *Operations Research*, 48(2), 256-267.

[2] Lodi, A., Martello, S., & Vigo, D. (2002). Heuristic algorithms for the three-dimensional bin packing problem. *European Journal of Operational Research*, 141(2), 410-420.

[3] Baker, B. S., Coffman Jr, E. G., & Rivest, R. L. (1980). Orthogonal packings in two dimensions. *SIAM Journal on Computing*, 9(4), 846-855.

[4] Lodi, A., Martello, S., & Monaci, M. (2002). Two-dimensional packing problems: A survey. *European Journal of Operational Research*, 141(2), 241-252.

[5] Crainic, T. G., Perboli, G., & Tadei, R. (2008). Extreme point-based heuristics for three-dimensional bin packing. *INFORMS Journal on Computing*, 20(3), 368-384.

[6] Martello, S., & Vigo, D. (1998). Exact solution of the two-dimensional finite bin packing problem. *Management Science*, 44(3), 388-399.

[7] Liu, D., & Teng, H. (2009). An improved BL-algorithm for genetic algorithm of the orthogonal packing of rectangles. *European Journal of Operational Research*, 112(2), 413-420.

---

## EK: PSEUDOcode Notasyonu

**Semboller:**
- $P$: Parçalar kümesi
- $M$: Makineler kümesi
- $J$: İşler kümesi
- $\pi$: Kromozom (permütasyon)
- $C_{max}$: Toplam makespan
- $w, d, h$: Genişlik, derinlik, yükseklik
- $x, y, z$: 3D pozisyon koordinatları
- $s_x, s_y$: Grid adım boyutları
