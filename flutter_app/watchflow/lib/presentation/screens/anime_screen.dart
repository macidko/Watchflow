import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:watchflow/config/theme.dart';
import 'package:watchflow/presentation/widgets/watchflow_app_bar.dart';
import 'package:watchflow/presentation/widgets/bottom_nav_bar.dart';
import 'package:watchflow/presentation/widgets/content_slider.dart';

class AnimeScreen extends StatelessWidget {
  final bool showAppBar;
  final bool showBottomNav;

  const AnimeScreen({
    Key? key,
    this.showAppBar = true,
    this.showBottomNav = true,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: showAppBar ? const WatchflowAppBar(title: 'Animeler') : null,
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
                  items: _getWatchingAnimes(),
                ),
                
                const SizedBox(height: 24),
                
                ContentSlider(
                  title: 'İzlenecekler',
                  items: _getWatchlistAnimes(),
                ),
                
                const SizedBox(height: 24),
                
                ContentSlider(
                  title: 'İzlenenler',
                  items: _getWatchedAnimes(),
                ),
              ],
            ),
          ),
        ),
      ),
      bottomNavigationBar: showBottomNav ? const BottomNavBar(currentIndex: 3, onTap: _dummyOnTap) : null,
    );
  }
  
  static void _dummyOnTap(int index) {
    // Boş fonksiyon, RootScreen'de zaten gerçek navigasyon işlemi yapılıyor
  }
  
  // İzleniyor bölümü için 30 örnek anime
  List<Map<String, dynamic>> _getWatchingAnimes() {
    final List<String> titles = [
      'Attack on Titan', 'Demon Slayer', 'Jujutsu Kaisen', 'My Hero Academia',
      'One Punch Man', 'Hunter x Hunter', 'One Piece', 'Dragon Ball Super',
      'Tokyo Revengers', 'Mushoku Tensei', 'Re:Zero', 'The Rising of the Shield Hero',
      'Black Clover', 'Fire Force', 'Mob Psycho 100', 'Blue Lock',
      'Haikyuu!!', 'Dr. Stone', 'That Time I Got Reincarnated as a Slime', 'Bleach: Thousand-Year Blood War',
      'Overlord', 'Classroom of the Elite', 'The Eminence in Shadow', 'Bungou Stray Dogs',
      'Oshi no Ko', 'Hell\'s Paradise', 'Frieren: Beyond Journey\'s End', 'Horimiya',
      'Mashle: Magic and Muscles', 'Goblin Slayer'
    ];
    
    final List<String> images = [
      'https://image.tmdb.org/t/p/w500/aiy35Evcofzl7hNzFdvPGNbk5QU.jpg',
      'https://image.tmdb.org/t/p/w500/wrCVHdkBlBWdJUZPvnJWcBRuhSY.jpg',
      'https://image.tmdb.org/t/p/w500/g1rK2KRgFgTINIh8XO4wQ9X0TOV.jpg',
      'https://image.tmdb.org/t/p/w500/ivOLM47yJt90P19RH1ZilqKxtoI.jpg',
      'https://image.tmdb.org/t/p/w500/iE3s0lG5QVdEHOEZnoAxjmMtvne.jpg',
      'https://image.tmdb.org/t/p/w500/5V0RlHcTA0Ua0yUYgmTfYtfx8C5.jpg',
      'https://image.tmdb.org/t/p/w500/e3NBGiAifW9Xt8xD5tpARskjccO.jpg',
      'https://image.tmdb.org/t/p/w500/qEUMOgX9NENSUiZl7PgP9VaKQHn.jpg',
      'https://image.tmdb.org/t/p/w500/sxchS0jbjdNM2m9YAL6HVFYGlZ0.jpg',
      'https://image.tmdb.org/t/p/w500/fKRbB8riPlPQkL574tmBNkptkb4.jpg',
      'https://image.tmdb.org/t/p/w500/5hAmVRMdvx5dQFKqP44vxAiCTPO.jpg',
      'https://image.tmdb.org/t/p/w500/7khgAKdEGkCQKcFQLHrThFQ1ZSy.jpg',
      'https://image.tmdb.org/t/p/w500/5ZvVqpGGFVx5s4NjJMWTPS7lGxY.jpg',
      'https://image.tmdb.org/t/p/w500/xNfO01ApVEIZKn9UociIbwQAsIy.jpg',
      'https://image.tmdb.org/t/p/w500/3dPB4QT28of5HLUYzYzxr4GrLOK.jpg',
      'https://image.tmdb.org/t/p/w500/us40Lp7HTgsAXIGnKw8mJKrN5a.jpg',
      'https://image.tmdb.org/t/p/w500/sokTOq0ZRe5Oe2liaMbKp5Mrg9p.jpg',
      'https://image.tmdb.org/t/p/w500/yTXYErQoJB53KdisY8QBhMCQPLA.jpg',
      'https://image.tmdb.org/t/p/w500/xeGNZkJYvUPEGKJ6HG4tZJGvCwj.jpg',
      'https://image.tmdb.org/t/p/w500/lr3cYYBvGzHkUD3pLXBExiD7dQI.jpg',
      'https://image.tmdb.org/t/p/w500/fyYbrfS6XQ7M7VkhA8uRZCM31SQ.jpg',
      'https://image.tmdb.org/t/p/w500/g4X0So4JmCIFT5as5KWU3vBebEu.jpg',
      'https://image.tmdb.org/t/p/w500/x3wXGGnJ7n8AAYKmjYJUzFkKnfZ.jpg',
      'https://image.tmdb.org/t/p/w500/5Rw6SYkGRiXlqkWPGHVYYDt9Jic.jpg',
      'https://image.tmdb.org/t/p/w500/cdKnLgGQPegBSWfP1O2ByiM5lKz.jpg',
      'https://image.tmdb.org/t/p/w500/7qnSJ8qUPiFfGdWYYYW8gOTBuRs.jpg',
      'https://image.tmdb.org/t/p/w500/hES2eVAbVt08JJTqg4nCL3dJxgJ.jpg',
      'https://image.tmdb.org/t/p/w500/66NGf8jB8R19tSLBMJEiBUNIxEx.jpg',
      'https://image.tmdb.org/t/p/w500/nTZRdWP5JKlRhd6M4OiU4jWOYQu.jpg',
      'https://image.tmdb.org/t/p/w500/dxVFJ2w8D1C67T2o0fzLRM0gNmc.jpg'
    ];
    
    final List<String> years = [
      '2013', '2019', '2020', '2016',
      '2015', '2011', '1999', '2015',
      '2021', '2021', '2016', '2019',
      '2017', '2019', '2016', '2022',
      '2014', '2019', '2018', '2022',
      '2015', '2017', '2022', '2016',
      '2023', '2023', '2023', '2021',
      '2023', '2018'
    ];
    
    final List<int> seasons = List.generate(30, (index) => (index % 5) + 1);
    final List<int> episodes = List.generate(30, (index) => ((index % 5) + 1) * 12);
    final List<double> ratings = List.generate(30, (index) => 8.0 + (index % 20) / 10);
    final List<int> progresses = List.generate(30, (index) => ((index * 9) % 95) + 5);
    
    List<Map<String, dynamic>> items = [];
    
    for (int i = 0; i < 30; i++) {
      items.add({
        'id': i + 4001,
        'title': titles[i],
        'image': images[i],
        'mediaType': 'anime',
        'year': years[i],
        'rating': ratings[i],
        'seasons': seasons[i],
        'episodes': episodes[i],
        'progress': progresses[i],
      });
    }
    
    return items;
  }
  
  // İzlenecekler bölümü için 30 örnek anime
  List<Map<String, dynamic>> _getWatchlistAnimes() {
    final List<String> titles = [
      'Chainsaw Man', 'Vinland Saga', 'Spy x Family', 'Solo Leveling',
      'Zom 100: Bucket List of the Dead', 'Dandadan', 'Uzumaki', 'Kaguya-sama: Love Is War',
      '86', 'To Your Eternity', 'Made in Abyss', 'Kaiju No. 8',
      'Tower of God', 'Undead Unluck', 'Sousou no Frieren', 'Blue Eye Samurai',
      'Boruto', 'The Ancient Magus\' Bride', 'Fairy Tail: 100 Years Quest', 'Pokémon Horizons', 
      'One Piece Film: Red', 'Pluto', 'Suzume', 'The First Slam Dunk',
      'Perfect Blue', 'Akira', 'Ghost in the Shell', 'Princess Mononoke',
      'Spirited Away', 'Your Name'
    ];
    
    final List<String> images = [
      'https://image.tmdb.org/t/p/w500/npdB6eFzizki0WaZ1OvKcJrWe97.jpg',
      'https://image.tmdb.org/t/p/w500/7Pk8DUbq215OPurJVPJ8QNcemHo.jpg',
      'https://image.tmdb.org/t/p/w500/3r4LkFAJ6RaZdKBjYQ1fomwHwsp.jpg',
      'https://image.tmdb.org/t/p/w500/jLAorksyDNgGViKWfOCZFtl1v6A.jpg',
      'https://image.tmdb.org/t/p/w500/kZHpMIJu9J8b3CCIwzBIU3aVpd9.jpg',
      'https://image.tmdb.org/t/p/w500/hzwvhveZYu5J4FwAY1oxBRkuYCn.jpg',
      'https://image.tmdb.org/t/p/w500/xXXQyG8YViMH9JJTbnCGr6MiMGy.jpg',
      'https://image.tmdb.org/t/p/w500/wbXXQRPTOa7H9mmxkge7gFvbvLF.jpg',
      'https://image.tmdb.org/t/p/w500/nW6Mf57F8wsROmLZrQ91VVMpj7N.jpg',
      'https://image.tmdb.org/t/p/w500/8rX2ambb8BU3BCwCmQlUhfKS5H7.jpg',
      'https://image.tmdb.org/t/p/w500/uzU0yYkpZDvMJpPeYKjx1TzQMBi.jpg',
      'https://image.tmdb.org/t/p/w500/xWaO1dQTT4yHkpUR3aMZrHjnZlY.jpg',
      'https://image.tmdb.org/t/p/w500/5pwXIZuEJdAn8GozIPHdRNXYUWo.jpg',
      'https://image.tmdb.org/t/p/w500/kTdYvZ6IbTjin5hJxvZuMH8dEsL.jpg',
      'https://image.tmdb.org/t/p/w500/hES2eVAbVt08JJTqg4nCL3dJxgJ.jpg',
      'https://image.tmdb.org/t/p/w500/wH3KKWRsqWQmXZIvHge4syhxR2G.jpg',
      'https://image.tmdb.org/t/p/w500/e0B6i48kxdRkMcK4tR4YNfXGWOc.jpg',
      'https://image.tmdb.org/t/p/w500/dahePId8WefDGsrHCqULuBitNmG.jpg',
      'https://image.tmdb.org/t/p/w500/o8bzJZdpZDqRS2M1tDt8QQgXY3.jpg',
      'https://image.tmdb.org/t/p/w500/svnQc0XTue6O9GO7FYJfEUZGYnx.jpg',
      'https://image.tmdb.org/t/p/w500/a2wCQM8SkRmzXk9LXUvbBaraoke.jpg',
      'https://image.tmdb.org/t/p/w500/ryA3Se18qHoFUmsYCjRQt1IvVQJ.jpg',
      'https://image.tmdb.org/t/p/w500/y8l0lUOzpOcgY3RMXHRbvJUQhjw.jpg',
      'https://image.tmdb.org/t/p/w500/4HxvKbYi2LbZi7uEfUGGChMWhfK.jpg',
      'https://image.tmdb.org/t/p/w500/8ZoJxTMBcKZeKUk1yZeJF9zJqOR.jpg',
      'https://image.tmdb.org/t/p/w500/5M58rS0aU5z0eQmkGGwWKTKnbGS.jpg',
      'https://image.tmdb.org/t/p/w500/9gJnLew2ZnkAQG7t36EizKD9Jke.jpg',
      'https://image.tmdb.org/t/p/w500/cHFZA8Tlv03nKTGXhLOYOLtORpI.jpg',
      'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
      'https://image.tmdb.org/t/p/w500/q719jXXEzOoYaps6babgKnONONX.jpg'
    ];
    
    final List<String> years = [
      '2022', '2019', '2022', '2024',
      '2023', '2024', '2024', '2019',
      '2021', '2021', '2017', '2024',
      '2020', '2023', '2023', '2023',
      '2017', '2017', '2024', '2023',
      '2022', '2023', '2022', '2022',
      '1998', '1988', '1995', '1997',
      '2001', '2016'
    ];
    
    final List<int> seasons = List.generate(30, (index) {
      if (index >= 24) return 1; // Filmler için tek sezon
      return (index % 3) + 1;
    });
    
    final List<int> episodes = List.generate(30, (index) {
      if (index >= 24) return 1; // Filmler için tek bölüm
      return ((index % 4) + 1) * 10;
    });
    
    final List<double> ratings = List.generate(30, (index) => 8.2 + (index % 18) / 10);
    
    List<Map<String, dynamic>> items = [];
    
    for (int i = 0; i < 30; i++) {
      final item = {
        'id': i + 5001,
        'title': titles[i],
        'image': images[i],
        'mediaType': i >= 24 ? 'anime_movie' : 'anime',
        'year': years[i],
        'rating': ratings[i],
      };
      
      if (i < 24 || i >= 24) { // Hepsi için geçerli
        item['seasons'] = seasons[i];
        item['episodes'] = episodes[i];
      }
      
      items.add(item);
    }
    
    return items;
  }
  
  // İzlenenler bölümü için 30 örnek anime
  List<Map<String, dynamic>> _getWatchedAnimes() {
    final List<String> titles = [
      'Fullmetal Alchemist: Brotherhood', 'Death Note', 'Bungo Stray Dogs', 'Steins;Gate',
      'Code Geass', 'Cowboy Bebop', 'Neon Genesis Evangelion', 'JoJo\'s Bizarre Adventure',
      'Naruto', 'Dragon Ball Z', 'Bleach', 'Gintama', 
      'Monster', 'Parasyte: The Maxim', 'Erased', 'Your Lie in April',
      'Tokyo Ghoul', 'Violet Evergarden', 'Assassination Classroom', 'Fullmetal Alchemist',
      'Sword Art Online', 'No Game No Life', 'The Promised Neverland', 'One Punch Man',
      'The Seven Deadly Sins', 'Attack on Titan: Junior High', 'The Disastrous Life of Saiki K.', 'Kill la Kill',
      'My Neighbor Totoro', 'Howl\'s Moving Castle'
    ];
    
    final List<String> images = [
      'https://image.tmdb.org/t/p/w500/5ZFUEOULaVml7pQuXxhpR2SmVUw.jpg',
      'https://image.tmdb.org/t/p/w500/g8hHbgxbwxXJECIxGS5kgIcBiQB.jpg',
      'https://image.tmdb.org/t/p/w500/5Rw6SYkGRiXlqkWPGHVYYDt9Jic.jpg',
      'https://image.tmdb.org/t/p/w500/5PUvr3XjcinIkCRGpF4RIIGw9m8.jpg',
      'https://image.tmdb.org/t/p/w500/7mGr5zh6wshFCvoIJe1J1FnXoKV.jpg',
      'https://image.tmdb.org/t/p/w500/xDXUJfuLoRhBAJVkwmXHcJ9lFhe.jpg',
      'https://image.tmdb.org/t/p/w500/k9mJmBk3FGQw2HMJMUvKXyBT0US.jpg',
      'https://image.tmdb.org/t/p/w500/xq3ifrFJOJP5HTH54JIlkOPG2Vj.jpg',
      'https://image.tmdb.org/t/p/w500/xuJ0F9RfKvVSJNDg2usurQ9WvY0.jpg',
      'https://image.tmdb.org/t/p/w500/6VKOfL5ln5reHXgJlSOKAItmX1G.jpg',
      'https://image.tmdb.org/t/p/w500/jLKCX4hDP5DbcsPHpOSs6CMWoNe.jpg',
      'https://image.tmdb.org/t/p/w500/5AX2NdUtsLAUjpFAIXAUGS6fVzF.jpg',
      'https://image.tmdb.org/t/p/w500/4jM8uUZ1oeil3SuzUMHo0VmES6H.jpg',
      'https://image.tmdb.org/t/p/w500/4kkvTyWbmo0dBn2VQQJeaKz2VSA.jpg',
      'https://image.tmdb.org/t/p/w500/noehKR0ZIeQdrcMVTJRSKtgT8live.jpg',
      'https://image.tmdb.org/t/p/w500/iLBMY9XwIHK2dyoE15rQ1Q5Bz1v.jpg',
      'https://image.tmdb.org/t/p/w500/0Idq3CN3r23WRDYozITMUcQMvOR.jpg',
      'https://image.tmdb.org/t/p/w500/ImvHbM4GsJJykarnOzhtpG6ax6.jpg',
      'https://image.tmdb.org/t/p/w500/3nUGetnt2vs1CL6nxeqnVGlY4s0.jpg',
      'https://image.tmdb.org/t/p/w500/iF7durPoGr85ULCWIo11GQjGEVB.jpg',
      'https://image.tmdb.org/t/p/w500/3jG1mHXJNmvlG52HSnEJnvVvvRy.jpg',
      'https://image.tmdb.org/t/p/w500/mZ3dl1SH8IZ4OMWVxZ9ln9QKPR6.jpg',
      'https://image.tmdb.org/t/p/w500/oBgRCpAbtMpk1v8wfdsIph7lPQE.jpg',
      'https://image.tmdb.org/t/p/w500/iE3s0lG5QVdEHOEZnoAxjmMtvne.jpg',
      'https://image.tmdb.org/t/p/w500/eBz8GIZoJiHm6bDrRR9N8MIkSR3.jpg',
      'https://image.tmdb.org/t/p/w500/wtfpgz7okHUuj89lvHsP33NtJpH.jpg',
      'https://image.tmdb.org/t/p/w500/nTZRdWP5JKlRhd6M4OiU4jWOYQu.jpg',
      'https://image.tmdb.org/t/p/w500/yfU3h0QHxHJPHg2kXw5mQhylA5L.jpg',
      'https://image.tmdb.org/t/p/w500/rtGDOeG9LzoerkDGZF9dnVeLppL.jpg',
      'https://image.tmdb.org/t/p/w500/TkTPELv4kC3u1lkloush8skOjE.jpg'
    ];
    
    final List<String> years = [
      '2009', '2006', '2016', '2011',
      '2006', '1998', '1995', '2012',
      '2002', '1989', '2004', '2006',
      '2004', '2014', '2016', '2014',
      '2014', '2018', '2015', '2003',
      '2012', '2014', '2019', '2015',
      '2014', '2015', '2016', '2013',
      '1988', '2004'
    ];
    
    final List<int> seasons = List.generate(30, (index) {
      if (index >= 28) return 1; // Filmler için tek sezon
      return (index % 7) + 1;
    });
    
    final List<int> episodes = List.generate(30, (index) {
      if (index >= 28) return 1; // Filmler için tek bölüm
      return ((index % 10) + 1) * 12;
    });
    
    final List<double> ratings = List.generate(30, (index) => 8.4 + (index % 17) / 10);
    
    List<Map<String, dynamic>> items = [];
    
    for (int i = 0; i < 30; i++) {
      final item = {
        'id': i + 6001,
        'title': titles[i],
        'image': images[i],
        'mediaType': i >= 28 ? 'anime_movie' : 'anime',
        'year': years[i],
        'rating': ratings[i],
        'seasons': seasons[i],
        'episodes': episodes[i],
        'progress': 100, // Hepsi tamamlanmış
      };
      
      items.add(item);
    }
    
    return items;
  }
}
