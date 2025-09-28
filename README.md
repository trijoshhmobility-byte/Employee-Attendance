# TRIJOSHH Employee Attendance Tracker 🚀

> A comprehensive, offline-first employee attendance tracking system built specifically for TRIJOSHH, operating independently without Google API dependencies.

![TRIJOSHH](https://img.shields.io/badge/TRIJOSHH-Attendance%20System-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production%20Ready-green?style=for-the-badge)
![No Google APIs](https://img.shields.io/badge/Google%20API-Independent-red?style=for-the-badge)

## ✨ Features

### 🔐 **Advanced Authentication**
- Employee ID-based authentication (TRJ001-TRJ005)
- Role-based access control (Admin, Manager, HR, Employee)
- Secure session management with auto-logout
- Quick-access demo buttons for testing

### 📍 **Smart Location Tracking**
- **100% Google API Independent** - Uses browser geolocation API
- Multi-tier fallback system (GPS → IP-based location → Last known)
- Geofenced work locations with customizable radius
- Location accuracy validation (< 50m for precise tracking)
- Visual location display using OpenStreetMap

### 💾 **Robust Data Persistence**
- **Offline-First Architecture** with IndexedDB primary storage
- Automatic fallback to LocalStorage when IndexedDB unavailable
- Real-time data synchronization across browser sessions
- Comprehensive backup and restore functionality
- Data export in CSV format for reporting

### 📊 **Comprehensive Dashboard**
- Real-time attendance statistics
- Department-wise attendance overview
- Recent activity timeline
- Employee working hours tracking with overtime detection
- Late arrival and early departure monitoring

### 🛡️ **Enterprise-Grade Security**
- Input sanitization to prevent XSS attacks
- Data validation for all user inputs
- Location-based access control
- Error logging and monitoring
- Secure data storage with encryption-ready architecture

### 📱 **Responsive Design**
- TRIJOSHH-branded UI with gradient themes
- Mobile-first responsive design
- Dark/Light mode support
- Intuitive user experience with loading states
- Accessibility-compliant interface

## 👥 TRIJOSHH Employee Database

| Employee ID | Name | Role | Department | Status |
|-------------|------|------|------------|--------|
| TRJ001 | Rahul Sharma | Employee | Engineering | Active |
| TRJ002 | Priya Patel | HR | Human Resources | Active |
| TRJ003 | Amit Kumar | Manager | Sales | Active |
| TRJ004 | Admin User | Admin | Administration | Active |
| TRJ005 | Sneha Reddy | Employee | Marketing | Active |

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Modern web browser with geolocation support
- No external API keys required!

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Access the Application
1. Open http://localhost:3000
2. Use quick access buttons:
   - **Employee**: TRJ001 (Rahul Sharma)
   - **Admin**: TRJ004 (Admin User)

## 🎯 Core Functionality

### Employee Clock In/Out Flow
1. **Login** with TRIJOSHH Employee ID
2. **Location Verification** - System validates you're at authorized location
3. **Clock In** - Records timestamp and precise location
4. **Work Session** - Track active working hours
5. **Clock Out** - Complete attendance record with location

### Admin Features
- View all employee attendance in real-time
- Generate department-wise reports
- Export attendance data to CSV
- Manage employee database
- System backup and restore

## 📱 Mobile Support

The system is fully responsive and works seamlessly on:
- 📱 Mobile phones (iOS/Android)
- 📱 Tablets
- 💻 Desktop computers
- 🖥️ Kiosks and terminals

## 🔧 Technical Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS with custom TRIJOSHH theme
- **Storage**: IndexedDB (primary) + LocalStorage (fallback)
- **Mapping**: OpenStreetMap (no Google dependency)
- **Location**: Browser Geolocation API + IP fallback
- **Build**: Vite for fast development and building

## 📊 Testing

Run comprehensive system tests in browser console:

```javascript
// Open browser DevTools Console and run:
TrijoshhTests.runAllTests();

// Individual test categories:
TrijoshhTests.testEmployeeAuthentication();
TrijoshhTests.testLocationValidation();
TrijoshhTests.testValidationService();
TrijoshhTests.testAttendanceFlow();
TrijoshhTests.testSystemIntegration();
```

## 🔐 Security Features

- **XSS Protection**: All user inputs are sanitized
- **Location Security**: Geofenced attendance areas
- **Data Validation**: Comprehensive input validation
- **Session Management**: Secure login/logout flow
- **Error Handling**: Graceful error management
- **Audit Trail**: Complete activity logging

## 🌍 Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📁 Project Structure

```
copy-of-employee-attendance-tracker/
├── components/           # React components
│   ├── Login.tsx        # Authentication interface
│   ├── Dashboard.tsx    # Employee dashboard
│   ├── AdminPanel.tsx   # Admin interface
│   └── TrijoshhDashboard.tsx # Enhanced analytics
├── services/            # Business logic
│   ├── employeeService.ts    # Employee management
│   ├── databaseService.ts    # Data persistence
│   ├── backupService.ts      # Backup/restore
│   └── validationService.ts  # Data validation
├── hooks/               # React hooks
│   └── useGeolocation.ts # Location services
├── types.ts            # TypeScript definitions
├── App.tsx             # Main application
└── tests/              # Test files
```

## 🔧 Configuration

### Location Settings
- **Delhi HQ**: 28.6139°N, 77.2090°E (100m radius)
- **Mumbai Branch**: 19.0760°N, 72.8777°E (100m radius)
- **Bangalore Branch**: 12.9716°N, 77.5946°E (100m radius)

### Working Hours
- **Standard**: 9:00 AM - 6:00 PM
- **Grace Period**: 15 minutes late arrival
- **Overtime Threshold**: > 8 hours/day

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run preview
```

### Deploy to Any Web Server
1. Build the project: `npm run build`
2. Upload `dist/` folder to your web server
3. Configure HTTPS for geolocation to work
4. No server-side setup required!

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📞 Support

For TRIJOSHH employees:
- 📧 Email: it-support@trijoshh.com
- 📱 Phone: +91-XXXX-XXXX
- 🎫 Internal Ticket System

## 📄 License

© 2024 TRIJOSHH. All rights reserved.

---

<div align="center">
  <strong>Built with ❤️ for TRIJOSHH Team</strong><br>
  <em>Reliable • Secure • Independent • Scalable</em>
</div>
