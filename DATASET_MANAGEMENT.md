# Dataset Yönetimi

## 📁 Nasıl Çalışır?

Artık hangi dataset'i kullanacağını **tek bir yerden** kontrol edebilirsin!

### 🎯 Dataset Değiştirme

**Dosya:** `src/config/datasetConfig.ts`

```typescript
export const DATASET_CONFIG = {
    // Buradan dataset seçimi yap:
    ACTIVE_DATASET: 'academic',  // 'default' veya 'academic' veya 'custom1'
    
    DATASETS: {
        default: {
            machines: '../data/machines.json',
            parts: '../data/parts.json',
            description: 'Varsayılan test verileri'
        },
        academic: {
            machines: '../data/machines2.json',
            parts: '../data/parts2.json',
            description: 'Akademik makale verileri (10 parça, 2 makine)'
        },
    }
}
```

### ➕ Yeni Dataset Ekleme

1. **JSON dosyalarını oluştur:**
   ```
   src/data/machines_custom1.json
   src/data/parts_custom1.json
   ```

2. **Config'e ekle:**
   ```typescript
   DATASETS: {
       default: { ... },
       academic: { ... },
       custom1: {  // YENİ!
           machines: '../data/machines_custom1.json',
           parts: '../data/parts_custom1.json',
           description: 'Özel senaryo 1 - 20 parça, 3 makine'
       },
   }
   ```

3. **Aktif dataset'i değiştir:**
   ```typescript
   ACTIVE_DATASET: 'custom1',  // Buradan seç!
   ```

4. **Sayfayı yenile** - Otomatik yeni dataset yüklenecek!

### 📊 Mevcut Dataset'ler

| Dataset | Makineler | Parçalar | Açıklama |
|---------|-----------|----------|----------|
| `default` | machines.json | parts.json | Varsayılan test verileri |
| `academic` | machines2.json | parts2.json | Akademik makale (85.2 hr hedef) |

### 🎨 Özellikler

✅ **Tek yerden kontrol** - Sadece `ACTIVE_DATASET` değiştir  
✅ **Otomatik yükleme** - Tüm sayfalar otomatik güncellenir  
✅ **Dataset bilgisi** - Sayfalarda aktif dataset gösterilir  
✅ **Kolay genişletme** - Yeni dataset eklemek çok kolay  

### 🚀 Örnek Kullanım

**Senaryo 1:** Akademik makaleyi test et
```typescript
ACTIVE_DATASET: 'academic'
```

**Senaryo 2:** Kendi verilerini test et
```typescript
ACTIVE_DATASET: 'custom1'
```

**Senaryo 3:** Varsayılana dön
```typescript
ACTIVE_DATASET: 'default'
```

### 💡 İpuçları

- Her dataset için JSON dosyaları aynı formatta olmalı
- Dataset değiştirdikten sonra sayfayı yenile
- localStorage'daki eski veriler silinmez, import et butonuyla güncelleyebilirsin
