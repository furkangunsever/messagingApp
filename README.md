# Socket Chat Uygulaması

React Native ve Socket.IO kullanarak oluşturulmuş gerçek zamanlı sohbet uygulaması.

## Özellikler

- Gerçek zamanlı mesajlaşma
- Sohbet odaları
- Oda oluşturma
- Kullanıcı kimlik doğrulama
- Çevrimdışı mesaj desteği
- Responsive tasarım

## Başlangıç

### Önkoşullar

- Node.js (>= 14.x)
- npm veya yarn
- React Native CLI
- Android Studio veya Xcode (iOS için)

### Kurulum

1. Projeyi klonlayın:

```bash
cd socket-chat-app
```

2. Bağımlılıkları yükleyin:

```bash
npm install
# veya
yarn install
```

3. Sunucu bağımlılıklarını yükleyin:

```bash
cd server
npm install
# veya
yarn install
```

### Çalıştırma

1. Önce sunucuyu başlatın:

```bash
cd server
npm start
# veya
yarn start
```

2. Ardından React Native uygulamasını başlatın:

```bash
# Ana dizine geri dönün
cd ..

# Android için
npx react-native run-android

# iOS için
npx react-native run-ios
```

**Not:** Sunucuyu kendi IP adresinizle çalıştırdığınızdan emin olun. `src/config/constants.ts` dosyasındaki `API_URL` değişkenini kendi yerel IP adresinize göre güncelleyin.

## Proje Yapısı

```
socket-chat-app/
├── android/              # Android native kodu
├── ios/                  # iOS native kodu
├── server/               # Socket.IO sunucusu
├── src/
│   ├── assets/           # Resimler, fontlar vb.
│   ├── components/       # Yeniden kullanılabilir bileşenler
│   ├── config/           # Yapılandırma dosyaları
│   ├── redux/            # Redux store ve slice'lar
│   ├── routes/           # Navigasyon
│   ├── screens/          # Uygulama ekranları
│   ├── service/          # Harici servisler (Socket.IO vb.)
│   ├── types/            # TypeScript tip tanımlamaları
│   └── utils/            # Yardımcı fonksiyonlar
└── App.tsx               # Ana uygulama bileşeni
```

## Teknolojiler

- React Native (0.76.5)
- TypeScript
- Socket.IO
- Redux Toolkit
- React Navigation
- AsyncStorage

## Sunucu Hakkında

`server/` dizininde basit bir Socket.IO sunucusu bulunmaktadır. Bu, geliştirme amaçlıdır ve gerçek bir üretim ortamı için kullanılmamalıdır. Sunucu, bellek içinde veri saklar ve oturum yönetimi için basit bir token mekanizması kullanır.

Daha fazla bilgi için `server/README.md` dosyasına bakın.
