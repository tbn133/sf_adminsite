# Smart Farming Admin Site

Admin site cho hệ thống Smart Farming IoT được xây dựng bằng Vue 3 + Quasar.

## 📋 Tính năng

- **Dashboard**: Tổng quan hệ thống với thống kê và biểu đồ
- **Quản lý thiết bị**: Xem danh sách, chi tiết, logs của thiết bị
- **Quản lý lịch trình**: Tạo và quản lý lịch trình trồng cây
- **Quản lý Rules**: Tạo và quản lý rule engine (IF-THEN)
- **Xuất dữ liệu**: Export CSV và xem thống kê
- **Real-time updates**: WebSocket integration cho real-time data

## 🚀 Cài đặt

### Yêu cầu

- Node.js 16+
- npm hoặc yarn

### Cài đặt dependencies

```bash
cd smart_farming/admin_site
npm install
```

### Cấu hình

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Chỉnh sửa các biến trong `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_ADMIN_API_KEY=your-secret-admin-api-key-here
VITE_WS_URL=ws://localhost:8000/api/realtime
```

## ▶️ Chạy ứng dụng

### Development mode

```bash
npm run dev
```

Truy cập: http://localhost:3000

### Build production

```bash
npm run build
```

Output sẽ ở trong thư mục `dist/`.

## 📁 Cấu trúc dự án

```
admin_site/
├── src/
│   ├── views/              # Các trang chính
│   │   ├── Dashboard.vue
│   │   ├── Devices.vue
│   │   ├── DeviceDetail.vue
│   │   ├── Schedules.vue
│   │   ├── Rules.vue
│   │   └── Export.vue
│   ├── services/           # API và WebSocket services
│   │   ├── api.js
│   │   └── websocket.js
│   ├── stores/             # Pinia stores
│   │   └── app.js
│   ├── router/             # Vue Router
│   │   └── index.js
│   ├── App.vue             # Root component
│   └── main.js             # Entry point
├── package.json
├── vite.config.js
└── README.md
```

## 🎨 UI Components

Admin site sử dụng **Quasar Framework** với:
- Material Design components
- Responsive layout
- Dark mode support (có thể thêm)
- Icons: Material Icons

## 🔌 API Integration

Admin site giao tiếp với backend qua:
- **REST API**: Tất cả các endpoints từ `/admin/*` và `/api/*`
- **WebSocket**: Real-time updates từ `/api/realtime`

### Authentication

Admin API yêu cầu API key trong header:
```
X-API-Key: your-secret-admin-api-key-here
```

API key được config trong `.env` file.

## 📱 Các trang chính

### 1. Dashboard
- Thống kê tổng quan (tổng thiết bị, online/offline, cảnh báo)
- Danh sách thiết bị gần đây
- Quick actions

### 2. Quản lý thiết bị
- Danh sách tất cả thiết bị
- Tìm kiếm và lọc
- Điều khiển nhanh từ bảng
- Xem chi tiết thiết bị

### 3. Chi tiết thiết bị
- 3 tabs: Tổng quan, Logs, Điều khiển
- Dữ liệu cảm biến mới nhất
- Lịch sử logs
- Gửi lệnh điều khiển
- Reset device

### 4. Quản lý lịch trình
- Tạo, chỉnh sửa, xóa lịch trình
- Gán lịch cho thiết bị

### 5. Quản lý Rules
- Tạo, chỉnh sửa, xóa rules
- Bật/tắt rules
- Xem rules theo thiết bị

### 6. Xuất dữ liệu
- Xuất CSV cho sensor data
- Xem thống kê chi tiết

## 🔄 Real-time Updates

Admin site sử dụng WebSocket để nhận real-time updates:
- Sensor data updates
- Control command updates
- Alert notifications

WebSocket tự động kết nối khi app khởi động và tự động reconnect khi mất kết nối.

## 🛠️ Development

### Thêm component mới

1. Tạo component trong `src/components/`
2. Import và sử dụng trong views

### Thêm API endpoint mới

1. Thêm function vào `src/services/api.js`
2. Sử dụng trong stores hoặc components

### Thêm page mới

1. Tạo view trong `src/views/`
2. Thêm route vào `src/router/index.js`
3. Thêm navigation link vào `src/App.vue`

## 📄 License

MIT

