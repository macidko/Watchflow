import 'dart:convert';
import 'package:flutter/services.dart';
import 'package:flutter/material.dart';

class SliderConfig {
  final String id;
  final String title;
  final Color color;

  SliderConfig({required this.id, required this.title, required this.color});

  factory SliderConfig.fromJson(Map<String, dynamic> json) {
    return SliderConfig(
      id: json['id'],
      title: json['title'],
      color: _parseColor(json['color']),
    );
  }

  static Color _parseColor(String hex) {
    hex = hex.replaceAll('#', '');
    if (hex.length == 6) hex = 'FF$hex';
    return Color(int.parse(hex, radix: 16));
  }
}

class ConfigService {
  static final ConfigService _instance = ConfigService._internal();
  factory ConfigService() => _instance;
  ConfigService._internal();

  Map<String, List<SliderConfig>> slidersByTab = {};
  Map<String, dynamic> appConfig = {};

  Future<void> loadConfigs() async {
    final slidersJson = await rootBundle.loadString('assets/config/sliders_config.json');
    final slidersData = json.decode(slidersJson);
    slidersByTab = (slidersData['sliders'] as Map<String, dynamic>).map(
      (tab, sliders) => MapEntry(
        tab,
        (sliders as List).map((e) => SliderConfig.fromJson(e)).toList(),
      ),
    );

    final appConfigJson = await rootBundle.loadString('assets/config/app_config.json');
    appConfig = json.decode(appConfigJson);
  }

  List<SliderConfig> getSlidersForTab(String tab) => slidersByTab[tab] ?? [];
  dynamic getAppConfig(String key) => appConfig[key];
}
