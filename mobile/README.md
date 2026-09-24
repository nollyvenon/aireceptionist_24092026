# GLACIER AI Receptionist - Mobile App

Cross-platform mobile application for GLACIER AI Receptionist built with Flutter.

## Features

- ✅ User authentication with biometric support
- ✅ View and manage customers
- ✅ Schedule and manage appointments
- ✅ Real-time notifications
- ✅ Payment processing
- ✅ Customer analytics
- ✅ Offline support with local sync
- ✅ Dark mode support

## Tech Stack

- **Flutter 3.13+** - Cross-platform framework
- **Dart 3.0+** - Programming language
- **Riverpod** - State management
- **Dio** - HTTP client
- **GoRouter** - Navigation
- **Firebase** - Analytics & Push notifications
- **Stripe** - Payment processing
- **Hive** - Local storage
- **Table Calendar** - Calendar widget

## Project Structure

```
lib/
├── main.dart                # App entry point
├── config/                  # Configuration
│   ├── app_config.dart
│   └── routes.dart
├── data/                    # Data layer
│   ├── models/             # Data models
│   ├── repositories/       # API repositories
│   └── providers/          # Riverpod providers
├── presentation/            # UI layer
│   ├── screens/            # App screens
│   ├── widgets/            # Reusable widgets
│   └── theme/              # Theme configuration
└── utils/                   # Utility functions
    ├── extensions/
    ├── constants/
    └── helpers/
```

## Getting Started

### Prerequisites

- Flutter 3.13 or higher
- Dart 3.0 or higher
- Android SDK 21 or higher
- iOS 11.0 or higher
- Xcode 14+ (for iOS)

### Installation

1. **Clone Repository**
```bash
git clone https://github.com/nollyvenon/aireceptionist_24092026.git
cd aireceptionist_24092026/mobile
```

2. **Install Dependencies**
```bash
flutter pub get
```

3. **Generate Code**
```bash
flutter pub run build_runner build
```

4. **Set Environment Variables**

Create `.env`:
```
API_URL=http://localhost:8000/api/v1
APP_NAME=GLACIER AI
APP_VERSION=1.0.0
```

5. **Run App**

Android:
```bash
flutter run -d android
```

iOS:
```bash
flutter run -d ios
```

## Architecture

### MVVM Pattern

- **Model**: Data models and entities
- **View**: UI screens and widgets
- **ViewModel**: Business logic and state management

### Dependency Injection

Using Riverpod for DI and state management:

```dart
final apiRepositoryProvider = Provider((ref) {
  return ApiRepository();
});

final customersProvider = FutureProvider((ref) async {
  final repository = ref.watch(apiRepositoryProvider);
  return repository.getCustomers();
});
```

## Core Features

### Authentication

```dart
class AuthService {
  Future<bool> login(String email, String password) async {
    // API call + token storage
  }
  
  Future<void> logout() async {
    // Clear token + local data
  }
  
  Future<bool> isAuthenticated() async {
    // Check token validity
  }
}
```

### Customer Management

```dart
// Get all customers
final customers = ref.watch(customersProvider);

// Create customer
final createCustomer = ref.watch(createCustomerProvider);
await createCustomer.state({
  'first_name': 'John',
  'last_name': 'Doe',
  'email': 'john@example.com',
});
```

### Appointments

```dart
// Get appointments
final appointments = ref.watch(appointmentsProvider);

// Create appointment
final createAppointment = ref.watch(createAppointmentProvider);
```

### Notifications

Local notifications triggered by Firebase Cloud Messaging:

```dart
NotificationService.initialize();
NotificationService.showNotification(
  title: 'Appointment Reminder',
  body: 'Your appointment with John Doe is in 1 hour',
);
```

## State Management

Using Riverpod for reactive state:

```dart
// Simple state
final counterProvider = StateProvider((ref) => 0);

// Async state
final customersProvider = FutureProvider((ref) async {
  return fetchCustomers();
});

// Complex state
final authStateProvider = StateNotifierProvider((ref) {
  return AuthNotifier(ref.watch(apiRepositoryProvider));
});
```

## Navigation

Using GoRouter for type-safe routing:

```dart
final router = GoRouter(
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => HomeScreen(),
      routes: [
        GoRoute(
          path: 'customers/:id',
          builder: (context, state) {
            final id = state.pathParameters['id']!;
            return CustomerDetailScreen(customerId: id);
          },
        ),
      ],
    ),
  ],
);
```

## API Integration

Retrofit for type-safe API calls:

```dart
@RestApi(baseUrl: "http://localhost:8000/api/v1")
abstract class ApiClient {
  factory ApiClient(Dio dio) = _ApiClient;

  @GET('/customers')
  Future<List<Customer>> getCustomers();

  @POST('/customers')
  Future<Customer> createCustomer(@Body() Customer customer);
}
```

## Local Storage

Using Hive for efficient local storage:

```dart
// Store customer
final box = await Hive.openBox<Customer>('customers');
box.put('customer_1', customer);

// Retrieve customer
final customer = box.get('customer_1');

// Sync with API
await syncCustomers();
```

## Testing

### Unit Tests

```bash
flutter test
```

### Integration Tests

```bash
flutter test integration_test/
```

### Coverage

```bash
flutter test --coverage
```

## Building

### Android Release

```bash
flutter build apk --release
flutter build appbundle --release
```

### iOS Release

```bash
flutter build ipa --release
```

### App Signing

Configure app signing in `android/app/build.gradle`:

```gradle
signingConfigs {
  release {
    keyAlias keyProperties['keyAlias']
    keyPassword keyProperties['keyPassword']
    storeFile file(keyProperties['storeFile'])
    storePassword keyProperties['storePassword']
  }
}
```

## Performance Optimization

- **Lazy Loading**: Load screens on-demand
- **Image Caching**: CachedNetworkImage plugin
- **Offline Support**: Hive local storage + sync
- **Pagination**: Infinite scroll with Riverpod
- **Debouncing**: API calls on search

## Security

- **Secure Storage**: flutter_secure_storage for tokens
- **SSL Pinning**: Certificate pinning via Dio
- **Input Validation**: Form validation with Formz
- **Biometric Auth**: Local authentication

## Troubleshooting

### Build Issues

```bash
# Clean build
flutter clean
flutter pub get
flutter pub run build_runner clean
flutter pub run build_runner build

# Rebuild
flutter run
```

### Network Issues

```dart
// Check connectivity
final connectivity = ref.watch(connectivityProvider);
if (connectivity == ConnectivityStatus.offline) {
  // Show offline message
}
```

### State Issues

```dart
// Invalidate cache
ref.refresh(customersProvider);
```

## Contributing

1. Create feature branch
2. Make changes and test
3. Run analysis: `flutter analyze`
4. Format: `dart format lib/`
5. Commit and push
6. Create pull request

## Deployment

### Android Play Store

1. Create signed APK/AAB
2. Upload to Google Play Console
3. Complete store listing
4. Submit for review

### iOS App Store

1. Create signed IPA
2. Upload with Transporter
3. Complete app information
4. Submit for review

## Roadmap

- [ ] Biometric authentication
- [ ] Offline-first architecture
- [ ] Video call integration
- [ ] Voice message support
- [ ] Advanced analytics
- [ ] Multi-language support

## Support

- Issues: https://github.com/nollyvenon/aireceptionist_24092026/issues
- Email: support@glacierai.com
