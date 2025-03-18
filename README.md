# GraphQL User Management System

Bu proje, kullanıcı yönetimi için GraphQL tabanlı bir API sunar. Sistem, farklı roller (SUPER_ADMIN, ADMIN, USER) ile kullanıcı yönetimini destekler.

## Özellikler

- Kullanıcı kaydı ve girişi
- JWT tabanlı kimlik doğrulama
- Rol tabanlı yetkilendirme
- Kullanıcı yönetimi (oluşturma, güncelleme, silme, listeleme)
- Refresh token desteği

## Gereksinimler

- Node.js (v14 veya üzeri)
- MongoDB (v4.4 veya üzeri)
- npm veya yarn

## Kurulum

1. Projeyi klonlayın:
```bash
git clone https://github.com/yourusername/graphqluc.git
cd graphqluc
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. `.env` dosyasını oluşturun ve gerekli değişkenleri ayarlayın:
```env
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
MONGODB_URI=mongodb://localhost:27017/graphqluc
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

4. Uygulamayı başlatın:
```bash
# Geliştirme modu
npm run start:dev

# Prodüksiyon modu
npm start
```

## API Endpoints

GraphQL endpoint: `http://localhost:4000/graphql`

### Mutations

#### SUPER_ADMIN Kaydı (İlk Kurulum İçin)
```graphql
mutation {
  superAdminRegister(input: {
    firstName: "Super"
    lastName: "Admin"
    email: "superadmin@example.com"
    password: "123456"
  }) {
    accessToken
    refreshToken
    user {
      id
      firstName
      lastName
      email
      role
      isActive
      createdAt
      updatedAt
    }
  }
}
```

#### ADMIN Kaydı (Sadece SUPER_ADMIN Tarafından)
```graphql
mutation {
  adminRegister(input: {
    firstName: "Admin"
    lastName: "User"
    email: "admin@example.com"
    password: "123456"
  }) {
    accessToken
    refreshToken
    user {
      id
      firstName
      lastName
      email
      role
      isActive
      createdAt
      updatedAt
    }
  }
}
```

#### Normal Kullanıcı Kaydı (SUPER_ADMIN veya ADMIN Tarafından)
```graphql
mutation {
  register(input: {
    firstName: "Normal"
    lastName: "User"
    email: "user@example.com"
    password: "123456"
    role: USER
  }) {
    accessToken
    refreshToken
    user {
      id
      firstName
      lastName
      email
      role
      isActive
      createdAt
      updatedAt
    }
  }
}
```

#### Kullanıcı Girişi
```graphql
mutation {
  login(email: "user@example.com", password: "123456") {
    accessToken
    refreshToken
    user {
      id
      firstName
      lastName
      email
      role
      isActive
      createdAt
      updatedAt
    }
  }
}
```

#### Token Yenileme
```graphql
mutation {
  refreshToken(refreshToken: "YOUR_REFRESH_TOKEN") {
    accessToken
    refreshToken
  }
}
```

#### Çıkış Yapma
```graphql
mutation {
  logout
}
```

#### Kullanıcı Silme
```graphql
mutation {
  deleteUser(id: "USER_ID")
}
```

### Queries

#### Tüm Kullanıcıları Listele (SUPER_ADMIN: Tüm Kullanıcılar, ADMIN: Sadece USER'lar)
```graphql
query {
  users {
    id
    firstName
    lastName
    email
    role
    isActive
    createdAt
    updatedAt
  }
}
```

#### Kullanıcı Detayı (SUPER_ADMIN: Herkes, ADMIN: Sadece USER'lar)
```graphql
query {
  user(id: "USER_ID") {
    id
    firstName
    lastName
    email
    role
    isActive
    createdAt
    updatedAt
  }
}
```

## Yetkilendirme

### SUPER_ADMIN
- Tüm kullanıcıları görebilir
- Tüm kullanıcıları güncelleyebilir
- Tüm kullanıcıları silebilir
- ADMIN kullanıcıları oluşturabilir
- Kullanıcı rollerini değiştirebilir

### ADMIN
- Sadece USER rolündeki kullanıcıları görebilir
- Sadece USER rolündeki kullanıcıları güncelleyebilir
- Sadece USER rolündeki kullanıcıları silebilir
- Yeni USER kullanıcıları oluşturabilir
- SUPER_ADMIN veya diğer ADMIN'leri göremez, güncelleyemez veya silemez

### USER
- Sadece kendi bilgilerini görebilir
- Başka kullanıcıları göremez, güncelleyemez veya silemez

## Güvenlik

- JWT tabanlı kimlik doğrulama
- Şifre hashleme (bcrypt)
- CORS koruması
- Rol tabanlı yetkilendirme
- Rate limiting

## Hata Yönetimi

Sistem, aşağıdaki hata türlerini destekler:

- AUTHENTICATION_ERROR: Kimlik doğrulama hataları
- AUTHORIZATION_ERROR: Yetkilendirme hataları
- VALIDATION_ERROR: Veri doğrulama hataları
- NOT_FOUND_ERROR: Kaynak bulunamadı hataları
- DATABASE_ERROR: Veritabanı hataları
- NETWORK_ERROR: Ağ hataları
- UNKNOWN_ERROR: Bilinmeyen hatalar

## Lisans

MIT 