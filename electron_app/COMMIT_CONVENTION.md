# Commit Mesajı Kuralları

Bu projede commit mesajları için [Conventional Commits](https://www.conventionalcommits.org/) standardını kullanıyoruz. Bu, otomatik sürüm numaralandırma ve CHANGELOG oluşturma için önemlidir.

## Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

## Türler (Types)

- `feat`: Yeni bir özellik
- `fix`: Hata düzeltmesi
- `docs`: Sadece dokümantasyon değişiklikleri
- `style`: Kod mantığını etkilemeyen değişiklikler (format, boşluk, vb.)
- `refactor`: Hata düzeltmeyen ve yeni özellik eklemeyen kod değişikliği
- `perf`: Performansı artıran değişiklikler
- `test`: Test ekleme veya düzeltme
- `chore`: Yapı süreçleri veya yardımcı araçlar ile ilgili değişiklikler

## Örnekler

```
feat(medya-arama): medya sorgulama arayüzü eklendi
```

```
fix(izleme-listesi): kategori güncellemesi sorunu düzeltildi
```

```
docs(readme): kurulum talimatları güncellendi
```

```
refactor(watchlist-manager): kod modülerliği artırıldı
``` 