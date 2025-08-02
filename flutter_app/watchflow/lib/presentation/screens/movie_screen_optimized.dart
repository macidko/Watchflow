import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:watchflow/presentation/widgets/content_slider.dart';
import 'package:watchflow/presentation/widgets/watchflow_app_bar.dart';
import 'package:watchflow/presentation/widgets/bottom_nav_bar.dart';
import 'package:hive/hive.dart';
import 'package:watchflow/utils/slider_utils_optimized.dart';

class MovieScreen extends StatefulWidget {
  final bool showAppBar;
  final bool showBottomNav;

  const MovieScreen({
    Key? key,
    this.showAppBar = true,
    this.showBottomNav = true,
  }) : super(key: key);

  @override
  State<MovieScreen> createState() => _MovieScreenState();
}

class _MovieScreenState extends State<MovieScreen> {
  // İçerik yüklenme durumu
  bool _isLoading = true;
  
  // Slider yapılandırmaları ve içerikler
  List<SliderConfig> _sliders = [];
  List<Map<String, dynamic>> _movies = [];
  
  @override
  void initState() {
    super.initState();
    _loadData();
  }
  
  // Tüm verileri yükle
  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
    });
    
    try {
      // Slider yapılandırmalarını yükle
      _sliders = await getSlidersForTab('movie');
      
      // Filmleri Hive'dan yükle
      _movies = await _getMoviesFromHive();
      
      print('Loaded ${_sliders.length} sliders and ${_movies.length} movies');
    } catch (e) {
      print('Error loading data: $e');
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }
  
  // Hive'dan film verilerini al
  Future<List<Map<String, dynamic>>> _getMoviesFromHive() async {
    try {
      var box = await Hive.openBox<String>('movieBox');
      return box.values.map((e) => json.decode(e) as Map<String, dynamic>).toList();
    } catch (e) {
      print('Error loading movies from Hive: $e');
      return [];
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: widget.showAppBar ? const WatchflowAppBar(title: 'Filmler') : null,
      backgroundColor: Colors.black,
      body: SafeArea(
        child: _buildBody(),
      ),
      bottomNavigationBar: widget.showBottomNav 
          ? const BottomNavBar(currentIndex: 1, onTap: _dummyOnTap) 
          : null,
    );
  }
  
  Widget _buildBody() {
    // Yükleme durumunda
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }
    
    // Slider yapılandırmaları boşsa
    if (_sliders.isEmpty) {
      return const Center(
        child: Text(
          'Slider yapılandırması bulunamadı',
          style: TextStyle(color: Colors.white),
        ),
      );
    }
    
    // İçerik yoksa
    if (_movies.isEmpty) {
      return const Center(
        child: Text(
          'Film bulunamadı',
          style: TextStyle(color: Colors.white),
        ),
      );
    }
    
    // Slider'ları ve filmleri göster
    return _buildSliderList();
  }
  
  Widget _buildSliderList() {
    return RefreshIndicator(
      onRefresh: _loadData,
      child: ListView.separated(
        padding: const EdgeInsets.all(24),
        itemCount: _sliders.length,
        separatorBuilder: (_, __) => const SizedBox(height: 24),
        itemBuilder: (context, index) {
          final slider = _sliders[index];
          
          // Bu slider ID'sine sahip filmleri filtrele
          final sliderMovies = filterContentBySlider(_movies, slider);
          
          return ContentSlider(
            title: slider.title,
            items: sliderMovies,
          );
        },
      ),
    );
  }

  static void _dummyOnTap(int index) {}
}
