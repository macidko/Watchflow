import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:watchflow/config/theme.dart';
import 'package:watchflow/presentation/controllers/home_controller.dart';
import 'package:watchflow/presentation/widgets/watchflow_app_bar.dart';
import 'package:watchflow/presentation/widgets/bottom_nav_bar.dart';
import 'package:watchflow/presentation/widgets/content_slider.dart';

class MovieScreen extends StatelessWidget {
  final bool showAppBar;
  final bool showBottomNav;

  const MovieScreen({
    Key? key,
    this.showAppBar = true,
    this.showBottomNav = true,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: showAppBar ? const WatchflowAppBar(title: 'Filmler') : null,
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
                  items: _getWatchingMovies(),
                ),
                
                const SizedBox(height: 24),
                
                ContentSlider(
                  title: 'İzlenecekler',
                  items: _getWatchlistMovies(),
                ),
                
                const SizedBox(height: 24),
                
                ContentSlider(
                  title: 'İzlenenler',
                  items: _getWatchedMovies(),
                ),
              ],
            ),
          ),
        ),
      ),
      bottomNavigationBar: showBottomNav ? const BottomNavBar(currentIndex: 1, onTap: _dummyOnTap) : null,
    );
  }
  
  static void _dummyOnTap(int index) {
    // Boş fonksiyon, RootScreen'de zaten gerçek navigasyon işlemi yapılıyor
  }

  // İzleniyor bölümü için 30 örnek film
  List<Map<String, dynamic>> _getWatchingMovies() {
    final List<String> titles = [
      'Dune', 'The Batman', 'No Time to Die', 'Black Widow',
      'Shang-Chi and the Legend of the Ten Rings', 'Free Guy', 'Venom: Let There Be Carnage', 'Eternals',
      'The Suicide Squad', 'Godzilla vs. Kong', 'Wonder Woman 1984', 'Tenet',
      'Soul', 'Cruella', 'Luca', 'Raya and the Last Dragon',
      'Mortal Kombat', 'Space Jam: A New Legacy', 'The Conjuring: The Devil Made Me Do It', 'A Quiet Place Part II',
      'F9', 'Jungle Cruise', 'The King\'s Man', 'The Matrix Resurrections',
      'Spider-Man: No Way Home', 'Ghostbusters: Afterlife', 'Last Night in Soho', 'The French Dispatch',
      'House of Gucci', 'Don\'t Look Up'
    ];

    final List<String> images = [
      'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
      'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg',
      'https://image.tmdb.org/t/p/w500/iUgygt3fscRoKWCV1d0C7FbM9TP.jpg',
      'https://image.tmdb.org/t/p/w500/qAZ0pzat24kLdO3o8ejmbLxyOac.jpg',
      'https://image.tmdb.org/t/p/w500/1BIoJGKbXjdFDAqUEiA2VHqkK1Z.jpg',
      'https://image.tmdb.org/t/p/w500/xmbU4JTUm8rsdtn7Y3Fcm30GpeT.jpg',
      'https://image.tmdb.org/t/p/w500/rjkmN1dniUHVYAtwuV3Tji7FsDO.jpg',
      'https://image.tmdb.org/t/p/w500/bcCBq9N1EMo3C9zCJqPduaQR5YG.jpg',
      'https://image.tmdb.org/t/p/w500/kb4s0ML0iVZlG6wAKbbs9NAm6X.jpg',
      'https://image.tmdb.org/t/p/w500/pgqgaUx1cJb5oZQQ5v0tNARCeBp.jpg',
      'https://image.tmdb.org/t/p/w500/8UlWHLMpgZm9bx6QYh0NFoq67TZ.jpg',
      'https://image.tmdb.org/t/p/w500/9hfJ7QySCNJB7GFFKfExbObsHwb.jpg',
      'https://image.tmdb.org/t/p/w500/hm58Jw4Lw8OIeJprziMgbbiCnEN.jpg',
      'https://image.tmdb.org/t/p/w500/wToO8opxkGwKgSfJ1JK8tGvkG6U.jpg',
      'https://image.tmdb.org/t/p/w500/jTswp6KyDYKtvC52GbHagrZbGvD.jpg',
      'https://image.tmdb.org/t/p/w500/lPsD10PP4rgUGiGR4CCXA6iY0QQ.jpg',
      'https://image.tmdb.org/t/p/w500/nkayOAUBUu4mMvyNf9iHSUiPjF1.jpg',
      'https://image.tmdb.org/t/p/w500/5bFK5d3mVNO1knX0fOZaQM3zRQ.jpg',
      'https://image.tmdb.org/t/p/w500/xbSuFiJbbBWCkyCCKIMfuDCA4yV.jpg',
      'https://image.tmdb.org/t/p/w500/4q2hz2m8hubgvijz8Ez0T2Os2Yv.jpg',
      'https://image.tmdb.org/t/p/w500/bOFaAXmWWXC3Rbv4u4uM9ZSzRXP.jpg',
      'https://image.tmdb.org/t/p/w500/9dKCd55IuTT5QRs989m9Qlb7d2B.jpg',
      'https://image.tmdb.org/t/p/w500/aq4Pwv5Xeuvj6HZKtxyd23e6bE9.jpg',
      'https://image.tmdb.org/t/p/w500/8c4a8kE7PizaGQQnditMmI1xbRp.jpg',
      'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
      'https://image.tmdb.org/t/p/w500/ghostbusters_afterlife.jpg',
      'https://image.tmdb.org/t/p/w500/last_night_in_soho.jpg',
      'https://image.tmdb.org/t/p/w500/the_french_dispatch.jpg',
      'https://image.tmdb.org/t/p/w500/house_of_gucci.jpg',
      'https://image.tmdb.org/t/p/w500/dont_look_up.jpg'
    ];

    final List<String> years = [
      '2021', '2022', '2021', '2021',
      '2021', '2021', '2021', '2021',
      '2021', '2021', '2020', '2020',
      '2020', '2021', '2021', '2021',
      '2021', '2021', '2021', '2021',
      '2021', '2021', '2021', '2021',
      '2021', '2021', '2021', '2021',
      '2021', '2021'
    ];

    final List<double> ratings = List.generate(30, (index) => 7.0 + (index % 25) / 10);
    final List<int> progresses = List.generate(30, (index) => ((index * 11) % 95) + 5);

    List<Map<String, dynamic>> items = [];

    for (int i = 0; i < 30; i++) {
      items.add({
        'id': i + 101,
        'title': titles[i],
        'image': images[i],
        'mediaType': 'movie',
        'year': years[i],
        'rating': ratings[i],
        'progress': progresses[i],
      });
    }

    return items;
  }

  // İzlenecekler bölümü için 30 örnek film
  List<Map<String, dynamic>> _getWatchlistMovies() {
    final List<String> titles = [
      'Oppenheimer', 'Barbie', 'Mission: Impossible - Dead Reckoning', 'The Flash',
      'Indiana Jones and the Dial of Destiny', 'Guardians of the Galaxy Vol. 3', 'Fast X', 'John Wick: Chapter 4',
      'The Super Mario Bros. Movie', 'Ant-Man and the Wasp: Quantumania', 'Creed III', 'Scream VI',
      'The Little Mermaid', 'Transformers: Rise of the Beasts', 'Elemental', 'The Marvels',
      'Aquaman and the Lost Kingdom', 'The Hunger Games: The Ballad of Songbirds and Snakes', 'Wonka', 'Blue Beetle',
      'Killers of the Flower Moon', 'Napoleon', 'Ferrari', 'Maestro',
      'Asteroid City', 'The Color Purple', 'Poor Things', 'Saltburn',
      'Priscilla', 'Challengers'
    ];

    final List<String> images = [
      'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
      'https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg',
      'https://image.tmdb.org/t/p/w500/NNxYkU70HPurnNCSiCjYAmacwm.jpg',
      'https://image.tmdb.org/t/p/w500/rktDFPbfHfUbArZ6OOOKsXcv0Bm.jpg',
      'https://image.tmdb.org/t/p/w500/Af4bXE63pVsb2FtbW8uYIyPBadD.jpg',
      'https://image.tmdb.org/t/p/w500/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg',
      'https://image.tmdb.org/t/p/w500/fiVW06jE7z9YnO4trhaMEdclSiC.jpg',
      'https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg',
      'https://image.tmdb.org/t/p/w500/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg',
      'https://image.tmdb.org/t/p/w500/qnqGbB22YJ7dSs4o6M7exTpNxPz.jpg',
      'https://image.tmdb.org/t/p/w500/cvsXj3I9Q2iyyIo95AecSd1tad7.jpg',
      'https://image.tmdb.org/t/p/w500/wDWwtvkRRlgTiUr6TyLSMX8FCuZ.jpg',
      'https://image.tmdb.org/t/p/w500/ym1dxyOk4jFcSl4Q2zmRrA5BEEN.jpg',
      'https://image.tmdb.org/t/p/w500/gPbM0MK8CP8A174rmUwGsADNYKD.jpg',
      'https://image.tmdb.org/t/p/w500/4Y1WNkWHaQ1i4eJhBxxeAKTj5Hb.jpg',
      'https://image.tmdb.org/t/p/w500/tUtgLOESpCx7ue4BaeCTqp3vn1b.jpg',
      'https://image.tmdb.org/t/p/w500/y8NtM6q3PzntqyNRNw6wgicwRYl.jpg',
      'https://image.tmdb.org/t/p/w500/mBaXZ95R2OxueZhvQbcEWy2DqyO.jpg',
      'https://image.tmdb.org/t/p/w500/qtWd7KNCsvQRE5UVHUnGHpL0gKk.jpg',
      'https://image.tmdb.org/t/p/w500/mXLOHHc1Zeuwsl4xYKjKh2280oL.jpg',
      'https://image.tmdb.org/t/p/w500/fCn0GV1RG3TdWhgmgU47eKmrPSL.jpg',
      'https://image.tmdb.org/t/p/w500/jE5o7y9K6pZtWNNMEw3IdpHuncR.jpg',
      'https://image.tmdb.org/t/p/w500/aZXYzxdBiRpKsQsC9T8e70lbwYg.jpg',
      'https://image.tmdb.org/t/p/w500/lpqoY7o9gGRJdKvsMwfbwXvCpJL.jpg',
      'https://image.tmdb.org/t/p/w500/qdLklSj5wmPqwbwGRXJgmaAZrjN.jpg',
      'https://image.tmdb.org/t/p/w500/bpnelTRGi22BBUzU1pXuXQKGikK.jpg',
      'https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg',
      'https://image.tmdb.org/t/p/w500/zrR6ljHBQ8LhG2p9VDPmz3HiXBs.jpg',
      'https://image.tmdb.org/t/p/w500/h3lkZHP14RmkWhyHOiYQMCKhQqj.jpg',
      'https://image.tmdb.org/t/p/w500/bVMGMvtod0CJ9HENNQJdSUUXbfC.jpg'
    ];

    final List<String> years = [
      '2023', '2023', '2023', '2023',
      '2023', '2023', '2023', '2023',
      '2023', '2023', '2023', '2023',
      '2023', '2023', '2023', '2023',
      '2023', '2023', '2023', '2023',
      '2023', '2023', '2023', '2023',
      '2023', '2023', '2023', '2023',
      '2023', '2023'
    ];

    final List<double> ratings = List.generate(30, (index) => 7.5 + (index % 25) / 10);

    List<Map<String, dynamic>> items = [];

    for (int i = 0; i < 30; i++) {
      items.add({
        'id': i + 201,
        'title': titles[i],
        'image': images[i],
        'mediaType': 'movie',
        'year': years[i],
        'rating': ratings[i],
      });
    }

    return items;
  }

  // İzlenenler bölümü için 30 örnek film
  List<Map<String, dynamic>> _getWatchedMovies() {
    final List<String> titles = [
      'Inception', 'The Dark Knight', 'Interstellar', 'The Shawshank Redemption',
      'Pulp Fiction', 'The Godfather', 'Fight Club', 'Forrest Gump',
      'The Matrix', 'Goodfellas', 'The Lord of the Rings: The Return of the King', 'Star Wars: Episode V - The Empire Strikes Back',
      'The Silence of the Lambs', 'Se7en', 'Saving Private Ryan', 'The Green Mile',
      'Spirited Away', 'Parasite', 'The Lion King', 'The Departed',
      'Gladiator', 'The Prestige', 'Whiplash', 'The Usual Suspects',
      'Alien', 'American History X', 'Braveheart', 'Good Will Hunting',
      'Raiders of the Lost Ark', 'The Truman Show'
    ];

    final List<String> images = [
      'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
      'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
      'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
      'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
      'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
      'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
      'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
      'https://image.tmdb.org/t/p/w500/saHP97rTPS5eLmrLQEcANmKrsFl.jpg',
      'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
      'https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg',
      'https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg',
      'https://image.tmdb.org/t/p/w500/2l05cFWJacyIsTpsqSgH0wQXe4V.jpg',
      'https://image.tmdb.org/t/p/w500/rplLJ2hPcOQmkFhTqUte0Ql0G0j.jpg',
      'https://image.tmdb.org/t/p/w500/6yoghtyTpznpBik8EngEmJskVUO.jpg',
      'https://image.tmdb.org/t/p/w500/1wY4psJ5NVEhCuOYROwLH2XExM2.jpg',
      'https://image.tmdb.org/t/p/w500/velWPhVMQeQKcxggNEU8YmIo52R.jpg',
      'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
      'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
      'https://image.tmdb.org/t/p/w500/sKCr78MXSLixF2VGDa0GoE2wqKj.jpg',
      'https://image.tmdb.org/t/p/w500/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg',
      'https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg',
      'https://image.tmdb.org/t/p/w500/bA4NUSJ3AIwt7bSXQTKjugbLoif.jpg',
      'https://image.tmdb.org/t/p/w500/oPxnRhyAIzJKGUEdSiwTJQBa3NM.jpg',
      'https://image.tmdb.org/t/p/w500/wnRPVGc3C9czfk19wWUDeIEW5mR.jpg',
      'https://image.tmdb.org/t/p/w500/vfrQk5IPloGg1v9Rzbh2Eg3VGyM.jpg',
      'https://image.tmdb.org/t/p/w500/fIE3lAGcZDV1G6XM5KmuWnNsPp1.jpg',
      'https://image.tmdb.org/t/p/w500/or1gBugydmjToAEq7OZY0owwFk.jpg',
      'https://image.tmdb.org/t/p/w500/3TsVX4sATXnJRWNaQWPPUXG225L.jpg',
      'https://image.tmdb.org/t/p/w500/awUGN4ZJdHB3j0JBYVTl7ccMSTM.jpg',
      'https://image.tmdb.org/t/p/w500/kyojCLNr9yHF1nvoN4wUCXGcU0x.jpg'
    ];

    final List<String> years = [
      '2010', '2008', '2014', '1994',
      '1994', '1972', '1999', '1994',
      '1999', '1990', '2003', '1980',
      '1991', '1995', '1998', '1999',
      '2001', '2019', '1994', '2006',
      '2000', '2006', '2014', '1995',
      '1979', '1998', '1995', '1997',
      '1981', '1998'
    ];

    final List<double> ratings = List.generate(30, (index) => 8.0 + (index % 20) / 10);

    List<Map<String, dynamic>> items = [];

    for (int i = 0; i < 30; i++) {
      items.add({
        'id': i + 301,
        'title': titles[i],
        'image': images[i],
        'mediaType': 'movie',
        'year': years[i],
        'rating': ratings[i],
        'progress': 100, // Hepsi tamamlanmış
      });
    }

    return items;
  }
}
