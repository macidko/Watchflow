import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:watchflow/config/theme.dart';
import 'package:watchflow/presentation/widgets/watchflow_app_bar.dart';
import 'package:watchflow/presentation/widgets/bottom_nav_bar.dart';
import 'package:watchflow/presentation/widgets/content_slider.dart';

class TvScreen extends StatelessWidget {
  final bool showAppBar;
  final bool showBottomNav;

  const TvScreen({
    Key? key,
    this.showAppBar = true,
    this.showBottomNav = true,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: showAppBar ? const WatchflowAppBar(title: 'Diziler') : null,
      backgroundColor: Colors.black,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ContentSlider(
                  title: 'İzleniyor',
                  items: _getWatchingTvShows(),
                ),
                
                const SizedBox(height: 24),
                
                ContentSlider(
                  title: 'İzlenecekler',
                  items: _getWatchlistTvShows(),
                ),
                
                const SizedBox(height: 24),
                
                ContentSlider(
                  title: 'İzlenenler',
                  items: _getWatchedTvShows(),
                ),
              ],
            ),
          ),
        ),
      ),
      bottomNavigationBar: showBottomNav ? const BottomNavBar(currentIndex: 2, onTap: _dummyOnTap) : null,
    );
  }
  
  static void _dummyOnTap(int index) {
    // Boş fonksiyon, RootScreen'de zaten gerçek navigasyon işlemi yapılıyor
  }
  
  // İzleniyor bölümü için 30 örnek dizi
  List<Map<String, dynamic>> _getWatchingTvShows() {
    final List<String> titles = [
      'House of the Dragon', 'The Last of Us', 'Succession', 'The Bear',
      'Yellowjackets', 'Ted Lasso', 'The White Lotus', 'Andor',
      'Abbott Elementary', 'Better Call Saul', 'Beef', 'The Boys',
      'Reservation Dogs', 'Barry', 'The Mandalorian', 'Shrinking',
      'Yellowstone', 'The Crown', 'Stranger Things', 'Wednesday',
      'The Good Doctor', 'Grey\'s Anatomy', 'Squid Game', 'Money Heist',
      'Only Murders in the Building', 'Euphoria', 'The Morning Show', 'Loki',
      'The Handmaid\'s Tale', 'Black Mirror'
    ];
    
    final List<String> images = [
      'https://image.tmdb.org/t/p/w500/z2yahl2uefxDCl0nogcRBstwruJ.jpg',
      'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg',
      'https://image.tmdb.org/t/p/w500/1EX0Brd1kJAoJw8RA5zZwE5LMAC.jpg',
      'https://image.tmdb.org/t/p/w500/3XsYWH6NgQ0xJKSiNH4wuYgHmVh.jpg',
      'https://image.tmdb.org/t/p/w500/n4XqJ7dTkJAUXVBEuWqBL1RT7q6.jpg',
      'https://image.tmdb.org/t/p/w500/g8V3koyY4YPBlRsC8CnmdH6WYgd.jpg',
      'https://image.tmdb.org/t/p/w500/cO4TfkDbFSHgzncG9P1g0A84uYm.jpg',
      'https://image.tmdb.org/t/p/w500/59SVNwLfoMnZPPB6932X9OUVBnO.jpg',
      'https://image.tmdb.org/t/p/w500/w4cGDmdJu9Ky1W4oHvr0H7ihns9.jpg',
      'https://image.tmdb.org/t/p/w500/fC2HDm5t0kHl7mTm7jxMR31b7by.jpg',
      'https://image.tmdb.org/t/p/w500/vNaZ9eoCShuak1QzZ4TmPMs4tTw.jpg',
      'https://image.tmdb.org/t/p/w500/stTEycfG9928HYGEISBFaG1ngjM.jpg',
      'https://image.tmdb.org/t/p/w500/vQrZQy0beRVoqIzXPkN2cP1jCDe.jpg',
      'https://image.tmdb.org/t/p/w500/6PmhzEX4pUbSut7VwudaRCNiTfb.jpg',
      'https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg',
      'https://image.tmdb.org/t/p/w500/cPMsHMG8nVHZ0JTs6CN0Dq1XN1U.jpg',
      'https://image.tmdb.org/t/p/w500/peNC0eyc3TQJa6x4TdKcBPNP4t0.jpg',
      'https://image.tmdb.org/t/p/w500/g5iMxAzc2rJ3NA4QnfbfYa4HfQP.jpg',
      'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
      'https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg',
      'https://image.tmdb.org/t/p/w500/y5HOEk0HCn3qAvD86uX0ag5AKTX.jpg',
      'https://image.tmdb.org/t/p/w500/9VkPrQl68QzcSZ1Va8yERJq9y1X.jpg',
      'https://image.tmdb.org/t/p/w500/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg',
      'https://image.tmdb.org/t/p/w500/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg',
      'https://image.tmdb.org/t/p/w500/5AX2NdUtsLAUjpFAIXAUGS6fVzF.jpg',
      'https://image.tmdb.org/t/p/w500/jtnfNzqZwN4E32FGGxx1YZaBWWf.jpg',
      'https://image.tmdb.org/t/p/w500/6UH52Fmau8RPsMAbQbjwN3wJSCj.jpg',
      'https://image.tmdb.org/t/p/w500/rqDRC5Z9jgcv4LWLgCX0VSzX1mU.jpg',
      'https://image.tmdb.org/t/p/w500/hIZFG7MK4leU4axRFKJWqrjEXcz.jpg',
      'https://image.tmdb.org/t/p/w500/7PRddO7z7mcPi21nGvJBgGgkBoj.jpg'
    ];
    
    final List<String> years = [
      '2022', '2023', '2018', '2022',
      '2021', '2020', '2021', '2022',
      '2021', '2015', '2023', '2019',
      '2021', '2018', '2019', '2023',
      '2018', '2016', '2016', '2022',
      '2017', '2005', '2021', '2017',
      '2021', '2019', '2019', '2021',
      '2017', '2011'
    ];
    
    final List<int> seasons = List.generate(30, (index) => (index % 10) + 1);
    final List<int> episodes = List.generate(30, (index) => ((index % 10) + 1) * 8);
    final List<double> ratings = List.generate(30, (index) => 8.0 + (index % 20) / 10);
    final List<int> progresses = List.generate(30, (index) => ((index * 13) % 95) + 5);
    
    List<Map<String, dynamic>> items = [];
    
    for (int i = 0; i < 30; i++) {
      items.add({
        'id': i + 1001,
        'title': titles[i],
        'image': images[i],
        'mediaType': 'tv',
        'year': years[i],
        'rating': ratings[i],
        'seasons': seasons[i],
        'episodes': episodes[i],
        'progress': progresses[i],
      });
    }
    
    return items;
  }
  
  // İzlenecekler bölümü için 30 örnek dizi
  List<Map<String, dynamic>> _getWatchlistTvShows() {
    final List<String> titles = [
      'The Rings of Power', 'The Witcher', 'Severance', 'Secret Invasion',
      'Based on a True Story', 'Silo', 'The Night Agent', 'Gen V',
      'Hijack', 'Black Mirror', 'The Diplomat', 'Platonic',
      'Drops of God', 'The Big Door Prize', 'Saint X', 'Dead Ringers',
      'Mrs. Davis', 'Citadel', 'A Small Light', 'Class of \'09',
      'From', 'The Power', 'Lucky Hank', 'The Company You Keep',
      'Will Trent', 'The Way Home', 'Mayfair Witches', 'The Ark',
      'Night Court', 'That \'90s Show'
    ];
    
    final List<String> images = [
      'https://image.tmdb.org/t/p/w500/mYLOqiStMxDK3fYZFirgrMt8z5d.jpg',
      'https://image.tmdb.org/t/p/w500/7vjaCdMw15FEbXyLQTVa04URsPm.jpg',
      'https://image.tmdb.org/t/p/w500/8C9fqkiJUCFTMIKsvbT0kK4Uj7f.jpg',
      'https://image.tmdb.org/t/p/w500/f5ZMzzCvt2IzVwYOHT9QUC8Qp6S.jpg',
      'https://image.tmdb.org/t/p/w500/rXQJyGmwTiLyNuc3QOhwWpKKRS8.jpg',
      'https://image.tmdb.org/t/p/w500/zBx1X06G1KjTkqCiZ3355veCMlX.jpg',
      'https://image.tmdb.org/t/p/w500/qZsOgVVyAtJ0f2rYEzdbxupzSYY.jpg',
      'https://image.tmdb.org/t/p/w500/s9YtyawOevV0NtGn72dM8nU5Zv3.jpg',
      'https://image.tmdb.org/t/p/w500/uhOgDNsXfrWZRZC3vJUtjkHb964.jpg',
      'https://image.tmdb.org/t/p/w500/5iqJCUZgFLJML0zhQhkgSJ3olS2.jpg',
      'https://image.tmdb.org/t/p/w500/6UDrR6jVXP7GW9xXQMjW9Jg3430.jpg',
      'https://image.tmdb.org/t/p/w500/nXuCHI508NgtfnfvBhusFODpCEz.jpg',
      'https://image.tmdb.org/t/p/w500/iTQGpRuOFzRZvKIEilQmGjvHykG.jpg',
      'https://image.tmdb.org/t/p/w500/oiow0OBm1cDZcC446rwPPUiKYJK.jpg',
      'https://image.tmdb.org/t/p/w500/2kXCYYIZKIbX9aIVbWvP3NWDtmJ.jpg',
      'https://image.tmdb.org/t/p/w500/f74JQcBdKMPhFjp63s0BRXvfv9C.jpg',
      'https://image.tmdb.org/t/p/w500/lmaBihHI8Z4Ka0iepZ5NxGXTBTV.jpg',
      'https://image.tmdb.org/t/p/w500/8MBYpLpKjXBSEDXKdCpMWh4hcSw.jpg',
      'https://image.tmdb.org/t/p/w500/yWBXyqwOFZaRuDJvhZAjE0OvuhC.jpg',
      'https://image.tmdb.org/t/p/w500/4TLn84uyLMQilNS1a8fCJBnSbGW.jpg',
      'https://image.tmdb.org/t/p/w500/qbt16NCvsATucU0CQQtK8l9NZt3.jpg',
      'https://image.tmdb.org/t/p/w500/nGfjgDtKD7D9QKY4RHolp9Qjwqj.jpg',
      'https://image.tmdb.org/t/p/w500/3Jzz7GZEUwhTyQFJgr5MT3lgJST.jpg',
      'https://image.tmdb.org/t/p/w500/ycgvIFYQQQjT5QVyO8SOJJGXGlZ.jpg',
      'https://image.tmdb.org/t/p/w500/ouYg84SxZ77xPyXvLA0RPDqDBOU.jpg',
      'https://image.tmdb.org/t/p/w500/5kI500K7kJb4P9PI4wJKs7R2LBv.jpg',
      'https://image.tmdb.org/t/p/w500/xzOOjm13z6NPo4JXyp1N9X34Hdr.jpg',
      'https://image.tmdb.org/t/p/w500/5LHkBEwHV1QNqiYhaJdZYJLEbon.jpg',
      'https://image.tmdb.org/t/p/w500/hf7X3iUB4AWpGB9I5YyJ2VB3gOS.jpg',
      'https://image.tmdb.org/t/p/w500/rOQYj9LGajj6MwgIJwliJ9pwY9m.jpg'
    ];
    
    final List<String> years = [
      '2022', '2019', '2022', '2023',
      '2023', '2023', '2023', '2023',
      '2023', '2011', '2023', '2023',
      '2023', '2023', '2023', '2023',
      '2023', '2023', '2023', '2023',
      '2022', '2023', '2023', '2023',
      '2023', '2023', '2023', '2023',
      '2023', '2023'
    ];
    
    final List<int> seasons = List.generate(30, (index) => (index % 5) + 1);
    final List<int> episodes = List.generate(30, (index) => ((index % 5) + 1) * 6);
    final List<double> ratings = List.generate(30, (index) => 7.5 + (index % 25) / 10);
    
    List<Map<String, dynamic>> items = [];
    
    for (int i = 0; i < 30; i++) {
      items.add({
        'id': i + 2001,
        'title': titles[i],
        'image': images[i],
        'mediaType': 'tv',
        'year': years[i],
        'rating': ratings[i],
        'seasons': seasons[i],
        'episodes': episodes[i],
      });
    }
    
    return items;
  }
  
  // İzlenenler bölümü için 30 örnek dizi
  List<Map<String, dynamic>> _getWatchedTvShows() {
    final List<String> titles = [
      'Breaking Bad', 'Game of Thrones', 'Chernobyl', 'The Wire',
      'Band of Brothers', 'The Sopranos', 'True Detective', 'Seinfeld',
      'The Office', 'Friends', 'Fargo', 'Mindhunter',
      'Sherlock', 'Peaky Blinders', 'Dark', 'Narcos',
      'The Queen\'s Gambit', 'Mr. Robot', 'Westworld', 'Better Call Saul',
      'Stranger Things', 'The Crown', 'The Handmaid\'s Tale', 'Fleabag',
      'Mad Men', 'Deadwood', 'Twin Peaks', 'Six Feet Under',
      'The Leftovers', 'Lost'
    ];
    
    final List<String> images = [
      'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
      'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
      'https://image.tmdb.org/t/p/w500/hlLXt2tOPT6RRnjiUmoxyG1LTFi.jpg',
      'https://image.tmdb.org/t/p/w500/blRTC0wYO5K5nR1KdXwe4Ec6x8Z.jpg',
      'https://image.tmdb.org/t/p/w500/zReOJYste13Qq3T3J6kpPSJUcgb.jpg',
      'https://image.tmdb.org/t/p/w500/6VjREUvmAQVSKqFoU3KO80yRLUC.jpg',
      'https://image.tmdb.org/t/p/w500/mdQnCiiQ5gE93qJBUUJP9O3qnz.jpg',
      'https://image.tmdb.org/t/p/w500/aCw8ONfyz3AhngVQa1E2Ss4KSUQ.jpg',
      'https://image.tmdb.org/t/p/w500/qWnJzyZhyy74gjpSjIXWmuk0ifX.jpg',
      'https://image.tmdb.org/t/p/w500/f496cm9enuEsZkSPzCwnTESEK5s.jpg',
      'https://image.tmdb.org/t/p/w500/gAEZitvNudXr9aQL7sSrXzITl5X.jpg',
      'https://image.tmdb.org/t/p/w500/fbKE87mojpIETWepSbD5Qt741fp.jpg',
      'https://image.tmdb.org/t/p/w500/7WTsnHkbA0FaG6R9hAiIVrZjwUf.jpg',
      'https://image.tmdb.org/t/p/w500/bGZn5RVzMMXju4HrcoY7tnpsoLl.jpg',
      'https://image.tmdb.org/t/p/w500/hDDP1LvzB8F1OUMf6E3nOGPoIRF.jpg',
      'https://image.tmdb.org/t/p/w500/um6RKUkkkzgBVOuHSz0gHj3O7Xw.jpg',
      'https://image.tmdb.org/t/p/w500/zU0htwkhNvBQdVSwuYze4xvlIIE.jpg',
      'https://image.tmdb.org/t/p/w500/oKIBhzZzDX07SoE2bOLhq2EE8rf.jpg',
      'https://image.tmdb.org/t/p/w500/8MK0yFuB8HRd3yYpMeenNQp3Xvx.jpg',
      'https://image.tmdb.org/t/p/w500/8eoNEKKJ9gRR7OWYvK9GY8upaHc.jpg',
      'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
      'https://image.tmdb.org/t/p/w500/g5iMxAzc2rJ3NA4QnfbfYa4HfQP.jpg',
      'https://image.tmdb.org/t/p/w500/hADUPGm1Gt1W7mX86ZGZ5weVAHm.jpg',
      'https://image.tmdb.org/t/p/w500/2DpMZHxP9jn2uOVJc7UtAiIAM7w.jpg',
      'https://image.tmdb.org/t/p/w500/xguLt0hirbjgbnLhFZ1jEwMwrIh.jpg',
      'https://image.tmdb.org/t/p/w500/kRQHlJQhOWwz3ybZ8vTiGKLgVWL.jpg',
      'https://image.tmdb.org/t/p/w500/xwhsOw7HkO7nxZMm0BqYcUpXy1C.jpg',
      'https://image.tmdb.org/t/p/w500/e3qKckPJc9FP1kqSbJGHHSQ7136.jpg',
      'https://image.tmdb.org/t/p/w500/ka9UkZXQsY4hIf8pYPzCp4lyGrG.jpg',
      'https://image.tmdb.org/t/p/w500/og6S0aTZU6YUJAbqxeKjCa3kY1E.jpg'
    ];
    
    final List<String> years = [
      '2008', '2011', '2019', '2002',
      '2001', '1999', '2014', '1989',
      '2005', '1994', '2014', '2017',
      '2010', '2013', '2017', '2015',
      '2020', '2015', '2016', '2015',
      '2016', '2016', '2017', '2016',
      '2007', '2004', '1990', '2001',
      '2014', '2004'
    ];
    
    final List<int> seasons = List.generate(30, (index) => (index % 9) + 1);
    final List<int> episodes = List.generate(30, (index) => ((index % 10) + 1) * 10);
    final List<double> ratings = List.generate(30, (index) => 8.5 + (index % 15) / 10);
    
    List<Map<String, dynamic>> items = [];
    
    for (int i = 0; i < 30; i++) {
      items.add({
        'id': i + 3001,
        'title': titles[i],
        'image': images[i],
        'mediaType': 'tv',
        'year': years[i],
        'rating': ratings[i],
        'seasons': seasons[i],
        'episodes': episodes[i],
        'progress': 100, // Hepsi tamamlanmış
      });
    }
    
    return items;
  }
}
