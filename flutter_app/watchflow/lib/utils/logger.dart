import 'package:logger/logger.dart';
import 'package:flutter/foundation.dart';

/// Uygulama genelinde kullanılan logger sınıfı
class AppLogger {
  static final Logger _logger = Logger(
    printer: PrettyPrinter(
      methodCount: 0,
      errorMethodCount: 8,
      lineLength: 120,
      colors: true,
      printEmojis: true,
      printTime: true,
    ),
    output: ConsoleOutput(),
    level: kDebugMode ? Level.verbose : Level.warning,
  );

  /// Debug log
  static void d(dynamic message) {
    _logger.d(message);
    // Debug modda konsola da yaz
    if (kDebugMode) {
      print('[DEBUG] $message');
    }
  }

  /// Info log
  static void i(dynamic message) {
    _logger.i(message);
    // Debug modda konsola da yaz
    if (kDebugMode) {
      print('[INFO] $message');
    }
  }

  /// Warning log
  static void w(dynamic message) {
    _logger.w(message);
    // Debug modda konsola da yaz
    if (kDebugMode) {
      print('[WARNING] $message');
    }
  }

  /// Error log
  static void e(dynamic message, [dynamic error, StackTrace? stackTrace]) {
    _logger.e(message, error: error, stackTrace: stackTrace);
    // Debug modda konsola da yaz
    if (kDebugMode) {
      print('[ERROR] $message');
      if (error != null) print('Error details: $error');
      if (stackTrace != null) print('Stack trace: $stackTrace');
    }
  }

  /// WTF log - gerçekten anormal durumlar için
  static void wtf(dynamic message) {
    _logger.f(message);
    // Debug modda konsola da yaz
    if (kDebugMode) {
      print('[CRITICAL] $message');
    }
  }
} 