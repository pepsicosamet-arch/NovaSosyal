# NOVA Sosyal

Üyelikli, telefona kurulabilen sosyal medya uygulaması. Android ve iPhone'da çalışır (PWA: ana ekrana kurulur, tam ekran açılır, kendi simgesi olur).

## Özellikler
- Üye ol / giriş yap (kullanıcı adı + şifre, şifreler scrypt ile şifrelenir)
- Gönderi paylaşma: yazı + fotoğraf (fotoğraf telefonda otomatik küçültülür)
- Beğeni, yorum, gönderi/yorum silme
- Takip etme, "Herkes" ve "Takip ettiklerim" akışı
- Kişi arama ve önerilen kişiler
- Bildirimler (beğeni, yorum, takip) ve okunmamış sayacı
- Profil: fotoğraf, ad, hakkında, şifre değiştirme, hesabı silme
- Açık ve koyu tema (telefon ayarını izler), çevrimdışı açılış

## Gereken tek şey
**Node.js 22.13 veya üstü.** Dış paket yok, `npm install` gerekmez. Veritabanı Node'un yerleşik SQLite'ıdır.

## Bilgisayarda çalıştırma
```
node server.js
```
Tarayıcıda `http://localhost:3000` adresini aç.

Aynı Wi-Fi'deki telefondan denemek için bilgisayarın yerel IP'sini kullan (ör. `http://192.168.1.20:3000`).
Not: Telefona **kurma** özelliği yalnızca HTTPS adresinde çalışır; bu yüzden gerçek kullanım için internete yayınla.

## İnternete yayınlama (herkes kullanabilsin)
Uygulama tek bir Node sunucusudur; Node destekleyen her yerde çalışır.

**Render.com (ücretsiz başlangıç):**
1. Bu klasörü bir GitHub deposuna yükle.
2. Render → New → Web Service → depoyu seç.
3. Build command: boş bırak · Start command: `node server.js`
4. Verilerin silinmemesi için bir **Persistent Disk** ekle (ör. `/var/data`) ve ortam değişkeni olarak `DATA_DIR=/var/data` ver.

**Railway / Fly.io / kendi VPS'in:** aynı şekilde `node server.js` çalıştır, `PORT` ve `DATA_DIR` ortam değişkenlerini ayarla. VPS'te HTTPS için önüne Caddy veya Nginx koy.

## Telefona kurulum (kullanıcılar için)
- **Android (Chrome):** Siteyi aç → akışın üstündeki "Kur" düğmesi ya da ⋮ menüsü → "Uygulamayı yükle".
- **iPhone (Safari):** Siteyi aç → Paylaş düğmesi → "Ana Ekrana Ekle".
Uygulama içinde Profil → ⚙ → "Uygulamayı telefona kur" de aynı adımları gösterir.

## Android APK
Proje, APK'yı GitHub'ın sunucularında otomatik derleyen hazır bir iş akışı içerir (`android/` klasörü + `.github/workflows/android-apk.yml`).

1. Önce sunucuyu yayınla (yukarıdaki "İnternete yayınlama"). APK bu adresi açar; sunucu kapalıysa uygulama "Bağlanılamadı" der.
2. Bu klasörün tamamını GitHub'da yeni bir depoya yükle (gizli `.github` klasörü de dahil).
3. Depoda **Actions** sekmesi → **NOVA Sosyal APK** → **Run workflow** → sunucu adresini yaz (ör. `https://nova-sosyal.onrender.com`) → **Run workflow**.
4. Yaklaşık 5 dakika sonra APK, deponun **Releases** bölümünde hazır olur. Telefondan aç, indir, kur (ilk kurulumda "bilinmeyen kaynaklara izin ver" sorulur).

Adresi her seferinde yazmamak için: Settings → Secrets and variables → Actions → **Variables** → `NOVA_URL` ekle. Sonra `android/` klasöründe yaptığın her değişiklikte APK kendiliğinden yeniden derlenir.

Uygulamada: fotoğraf seçme, telefonun paylaş menüsü, geri tuşu, açık/koyu tema ve bağlantı yokken "Tekrar dene" ekranı çalışır. Dış bağlantılar telefonun tarayıcısında açılır.

APK'lar `android/nova.keystore` anahtarıyla imzalanır; böylece yeni sürüm eskisinin üzerine kurulur. Play Store'a koyacaksan kendi gizli anahtarını oluştur ve bu dosyayı herkese açık depoda paylaşma.

## Play Store'a koymak istersen
Yayındaki HTTPS adresini **PWABuilder.com**'a ver; Android paketi (AAB) üretir. Bu paket Play Console'a yüklenebilir.

## Dosyalar
- `server.js` — API, veritabanı, dosya sunucusu
- `public/` — uygulama arayüzü (`index.html`, `app.js`, `style.css`, `sw.js`, `manifest.webmanifest`, `icons/`)
- `data/` — ilk çalıştırmada oluşur: `nova.db` ve yüklenen fotoğraflar (`uploads/`). Yedeklemek için bu klasörü kopyala.
