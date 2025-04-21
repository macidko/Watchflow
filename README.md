# Watchflow

Electron ile geliştirilmiş bir masaüstü uygulaması.

## Başlangıç

Bu talimatlar, geliştirme ve test amaçları için projenin yerel makinenizde çalışan bir kopyasını almanızı sağlayacaktır.

### Ön Koşullar

Bu uygulamayı çalıştırmak için aşağıdaki yazılımlara ihtiyacınız vardır:

* Node.js (v14 veya üzeri)
* npm (Node.js ile birlikte gelir)

### Kurulum

Projeyi yerel olarak kurmak için aşağıdaki adımları izleyin:

1. Bu repoyu klonlayın
   ```
   git clone https://github.com/kullaniciadi/watchflow.git
   ```

2. Proje dizinine gidin
   ```
   cd watchflow
   ```

3. Gerekli paketleri kurun
   ```
   npm install
   ```

4. Uygulamayı başlatın
   ```
   npm start
   ```

## Dağıtım

Uygulamayı dağıtılabilir bir paket haline getirmek için:

```
npm run build
```

Bu komut, `dist` klasöründe dağıtılabilir dosyalar oluşturacaktır.

## Teknolojiler

* [Electron](https://www.electronjs.org/) - Masaüstü uygulama çerçevesi
* [Node.js](https://nodejs.org/) - JavaScript çalışma zamanı

## Lisans

Bu proje MIT Lisansı altında lisanslanmıştır - ayrıntılar için [LICENSE](LICENSE) dosyasına bakın. 