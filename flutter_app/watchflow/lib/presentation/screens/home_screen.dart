import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../config/theme.dart';
import '../../utils/theme_service.dart';
import 'package:watchflow/presentation/controllers/home_controller.dart';
import 'package:watchflow/presentation/widgets/content_slider.dart';
import 'package:watchflow/presentation/widgets/app_drawer.dart';
import 'package:watchflow/presentation/widgets/watchflow_app_bar.dart';
import 'package:watchflow/presentation/widgets/bottom_nav_bar.dart';

class HomeScreen extends StatelessWidget {
  final bool showAppBar;
  final bool showBottomNav;

  const HomeScreen({
    super.key,
    this.showAppBar = true,
    this.showBottomNav = true,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: showAppBar ? const WatchflowAppBar() : null,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
          padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ContentSlider(
              title: 'İzleniyor',
                  items: _getWatchingItems(),
            ),
                
            const SizedBox(height: 24),
                
            ContentSlider(
              title: 'İzlenecekler',
                  items: _getWatchlistItems(),
            ),
                
            const SizedBox(height: 24),
                
            ContentSlider(
              title: 'İzlenenler',
                  items: _getWatchedItems(),
                ),
              ],
            ),
          ),
        ),
      ),
      bottomNavigationBar: showBottomNav ? const BottomNavBar(currentIndex: 0, onTap: _dummyOnTap) : null,
    );
  }
  
  static void _dummyOnTap(int index) {
    // Boş fonksiyon, RootScreen'de zaten gerçek navigasyon işlemi yapılıyor
  }
  
  // İzleniyor bölümü için 30 örnek veri
  List<Map<String, dynamic>> _getWatchingItems() {
    final List<String> titles = [
      'Breaking Bad', 'Game of Thrones', 'Bungo Stray Dogs', 'Stranger Things',
      'The Mandalorian', 'Dark', 'Westworld', 'The Boys', 'True Detective',
      'Black Mirror', 'The Witcher', 'Attack on Titan', 'Naruto', 'One Piece',
      'Daredevil', 'The Office', 'Friends', 'House of Cards', 'Ozark',
      'Fargo', 'Better Call Saul', 'Chernobyl', 'Peaky Blinders', 'Mindhunter',
      'Succession', 'The Crown', 'Boardwalk Empire', 'Sherlock', 'The Expanse', 'Mr Robot'
    ];
    
    final List<String> images = [
      'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
      'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
      'https://image.tmdb.org/t/p/w500/7vjaCdMw15FEbXyLQTVa04URsPm.jpg',
      'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
      'https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg',
      'https://image.tmdb.org/t/p/w500/apbrbWs8M9lyOpJYU5WXrpFbk1Z.jpg',
      'https://image.tmdb.org/t/p/w500/8MK0yFuB8HRd3yYpMeenNQp3Xvx.jpg',
      'https://image.tmdb.org/t/p/w500/stTEycfG9928HYGEISBFaG1ngjM.jpg',
      'https://image.tmdb.org/t/p/w500/bbSx3Dm4gHJuTfcv4EUUmA7OjNq.jpg',
      'https://image.tmdb.org/t/p/w500/7PRddO7z7mcPi21nGvJBgGgkBoj.jpg',
      'https://image.tmdb.org/t/p/w500/7vjaCdMw15FEbXyLQTVa04URsPm.jpg',
      'https://image.tmdb.org/t/p/w500/8C8NGSzNtmN08tM8mYWyHV2Vyb1.jpg',
      'https://image.tmdb.org/t/p/w500/xuJ0F9RfKvVSJNDg2usurQ9WvY0.jpg',
      'https://image.tmdb.org/t/p/w500/e3NBGiAifW9Xt8xD5tpARskjccO.jpg',
      'https://image.tmdb.org/t/p/w500/QWbPaDxiB6LW2LjASknzYsqGjwA.jpg',
      'https://image.tmdb.org/t/p/w500/d8McQ2Du16. . . truncated',
      'https://image.tmdb.org/t/p/w500/f496cm9enuEsZkSPzCwnTESEK5s.jpg',
      'https://image.tmdb.org/t/p/w500/8Wny8cAlg2Mjo2oy9phDxRlEpZ.jpg',
      'https://image.tmdb.org/t/p/w500/daSFbrt8QCXV2hSwB0hqYjbj681.jpg',
      'https://image.tmdb.org/t/p/w500/wSa3QGQN6zAxBaLlLyN1RprZTfo.jpg',
      'https://image.tmdb.org/t/p/w500/duHywYaWwc2cByaXf48AdDAZxCJ.jpg',
      'https://image.tmdb.org/t/p/w500/hRAXGNNmj0BrjYQXbhlxZHYBOAL.jpg',
      'https://image.tmdb.org/t/p/w500/d9j6LmzN1Y0RmBTbnLe3UD3RJHa.jpg',
      'https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHP5H2uc133NK.jpg',
      'https://image.tmdb.org/t/p/w500/6Wwdl4N5SDzVqtVLXH8VRl1mSz3.jpg',
      'https://image.tmdb.org/t/p/w500/g5iMxAzc2rJ3NA4QnfbfYa4HfQP.jpg',
      'https://image.tmdb.org/t/p/w500/jVc2JAkvj5UvC5R5zGz8HERBFue.jpg',
      'https://image.tmdb.org/t/p/w500/etteMQVoYAGb9IdfhOpsGrDmqWq.jpg',
      'https://image.tmdb.org/t/p/w500/1bhFpYHQfYoJxT1USCg5Spq5QEX.jpg',
      'https://image.tmdb.org/t/p/w500/k3RbNzPEPW0cmkfkn1xVCTk3Qde.jpg'
    ];
    
    final List<String> years = [
      '2008', '2011', '2016', '2016',
      '2019', '2017', '2016', '2019', '2014',
      '2011', '2019', '2013', '2002', '1999',
      '2015', '2005', '1994', '2013', '2017',
      '2014', '2015', '2019', '2013', '2017',
      '2018', '2016', '2010', '2010', '2015', '2015'
    ];
    
    final List<String> mediaTypes = List.generate(30, (index) {
      if (index % 3 == 0) return 'tv';
      if (index % 3 == 1) return 'anime';
      return 'tv';
    });
    
    final List<int> seasons = List.generate(30, (index) => (index % 5) + 1);
    final List<int> episodes = List.generate(30, (index) => ((index % 5) + 1) * 10);
    final List<double> ratings = List.generate(30, (index) => 7.0 + (index % 30) / 10);
    final List<int> progresses = List.generate(30, (index) => ((index * 7) % 100) + 1);
    
    List<Map<String, dynamic>> items = [];
    
    for (int i = 0; i < 30; i++) {
      items.add({
        'id': i + 1,
        'title': titles[i],
        'image': images[i],
        'mediaType': mediaTypes[i],
        'year': years[i],
        'rating': ratings[i],
        'seasons': seasons[i],
        'episodes': episodes[i],
        'progress': progresses[i],
      });
    }
    
    return items;
  }
  
  // İzlenecekler bölümü için 30 örnek veri
  List<Map<String, dynamic>> _getWatchlistItems() {
    final List<String> titles = [
      'The Last of Us', 'Wednesday', 'House of the Dragon', 'The Sandman',
      'Arcane', 'Ted Lasso', 'Severance', 'Yellowstone', 'Barry',
      'The Bear', 'The White Lotus', 'Only Murders in the Building', 'Reservation Dogs', 'Andor',
      'The Lord of the Rings: The Rings of Power', 'Pachinko', 'Bad Sisters', 'Heartstopper',
      'Tokyo Vice', 'The Old Man', 'Slow Horses', 'Hacks', 'The Patient',
      'This Is Going to Hurt', 'We Own This City', 'Outer Range', 'Under the Banner of Heaven', 'The Dropout', 'Pam & Tommy', 'The Offer'
    ];
    
    final List<String> images = [
      'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg',
      'https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg',
      'https://image.tmdb.org/t/p/w500/z2yahl2uefxDCl0nogcRBstwruJ.jpg',
      'https://image.tmdb.org/t/p/w500/q54qEgagGOYCq5D1903eBVMNkbo.jpg',
      'https://image.tmdb.org/t/p/w500/xQ6GijOFnxTyUzqiwGpVxgfcgqI.jpg',
      'https://image.tmdb.org/t/p/w500/g8V3koyY4YPBlRsC8CnmdH6WYgd.jpg',
      'https://image.tmdb.org/t/p/w500/8Uv8aATtvFbVHuFcDgkUYftUkAU.jpg',
      'https://image.tmdb.org/t/p/w500/peNC0eyc3TQJa6x4TdKcBPNP4t0.jpg',
      'https://image.tmdb.org/t/p/w500/6PmhzEX4pUbSut7VwudaRCNiTfb.jpg',
      'https://image.tmdb.org/t/p/w500/raZ2QG34nRwJ4I3zCvmyqRdOvaY.jpg',
      'https://image.tmdb.org/t/p/w500/cO4TfkDbFSHgzncG9P1g0A84uYm.jpg',
      'https://image.tmdb.org/t/p/w500/5AX2NdUtsLAUjpFAIXAUGS6fVzF.jpg',
      'https://image.tmdb.org/t/p/w500/vQrZQy0beRVoqIzXPkN2cP1jCDe.jpg',
      'https://image.tmdb.org/t/p/w500/59SVNwLfoMnZPPB6932X9OUVBnO.jpg',
      'https://image.tmdb.org/t/p/w500/mYLOqiStMxDK3fYZFirgrMt8z5d.jpg',
      'https://image.tmdb.org/t/p/w500/qixCvG2c7sCuoZj9lfZvWxTcXHm.jpg',
      'https://image.tmdb.org/t/p/w500/tasFF2NIxsgn1MePm4jAIZ0YW0I.jpg',
      'https://image.tmdb.org/t/p/w500/nF7cmrxH7YhIeBXgJ25FrOEjva4.jpg',
      'https://image.tmdb.org/t/p/w500/srYwFfBYWDFUGX1qTD2nW6wqsAJ.jpg',
      'https://image.tmdb.org/t/p/w500/al4xA7VXIPFaQj64DF8V2iEFwp.jpg',
      'https://image.tmdb.org/t/p/w500/ztEUMx128JWqnbRFHHFKMnR6v40.jpg',
      'https://image.tmdb.org/t/p/w500/9sOKDL0W3HeUQwY8zYzXiKOFQp9.jpg',
      'https://image.tmdb.org/t/p/w500/2SxQwQcQjhGZYQlYFEQCBoY8i3m.jpg',
      'https://image.tmdb.org/t/p/w500/mPIgMTmhkvtP0vCxE6VzVJJvVN8.jpg',
      'https://image.tmdb.org/t/p/w500/k6DhV8g5mLzQjulC1xXOYxkSejo.jpg',
      'https://image.tmdb.org/t/p/w500/pyMGhuAWC7nYyolBgXGS6J8qYZ0.jpg',
      'https://image.tmdb.org/t/p/w500/hzuAXw7YG5RE74a9nYt0SUyNd6E.jpg',
      'https://image.tmdb.org/t/p/w500/3xnBvYr1vSIRjFfuqWI9HJdLVys.jpg',
      'https://image.tmdb.org/t/p/w500/do4GnigAxxd6Xxg591N6CZ3yWH0.jpg',
      'https://image.tmdb.org/t/p/w500/8s2gd1BwQSyqCoeKS0ha9wDZCzJ.jpg'
    ];
    
    final List<String> years = [
      '2023', '2022', '2022', '2022',
      '2021', '2020', '2022', '2018', '2018',
      '2022', '2021', '2021', '2021', '2022',
      '2022', '2022', '2022', '2022',
      '2022', '2022', '2022', '2021', '2022',
      '2022', '2022', '2022', '2022', '2022', '2022', '2022'
    ];
    
    final List<String> mediaTypes = List.generate(30, (index) {
      if (index % 3 == 0) return 'tv';
      if (index % 3 == 1) return 'movie';
      return 'tv';
    });
    
    final List<int> seasons = List.generate(30, (index) => (index % 4) + 1);
    final List<int> episodes = List.generate(30, (index) => ((index % 6) + 1) * 8);
    final List<double> ratings = List.generate(30, (index) => 7.5 + (index % 25) / 10);
    
    List<Map<String, dynamic>> items = [];
    
    for (int i = 0; i < 30; i++) {
      final item = {
        'id': i + 101,
        'title': titles[i],
        'image': images[i],
        'mediaType': mediaTypes[i],
        'year': years[i],
        'rating': ratings[i],
      };
      
      // Eğer dizi ise sezon ve bölüm bilgisi ekle
      if (mediaTypes[i] == 'tv' || mediaTypes[i] == 'anime') {
        item['seasons'] = seasons[i];
        item['episodes'] = episodes[i];
      }
      
      items.add(item);
    }
    
    return items;
  }
  
  // İzlenenler bölümü için 30 örnek veri
  List<Map<String, dynamic>> _getWatchedItems() {
    final List<String> titles = [
      'Inception', 'The Dark Knight', 'Parasite', 'The Shawshank Redemption', 
      'Pulp Fiction', 'The Godfather', 'Interstellar', 'The Matrix',
      'Spirited Away', 'Your Name', 'A Silent Voice', 'Demon Slayer: Mugen Train',
      'Avengers: Endgame', 'Spider-Man: No Way Home', 'The Batman', 'Mad Max: Fury Road',
      'Everything Everywhere All at Once', 'Dune', 'Blade Runner 2049', 'Arrival',
      'Get Out', 'Whiplash', 'La La Land', 'Jojo Rabbit',
      'The Grand Budapest Hotel', 'Soul', 'Inside Out', 'Coco', 'The Social Network', 'Joker'
    ];
    
    final List<String> images = [
      'https://image.tmdb.org/t/p/w500/f496cm9enuEsZkSPzCwnTESEK5s.jpg',
      'https://image.tmdb.org/t/p/w500/qWnJzyZhyy74gjpSjIXWmuk0ifX.jpg',
      'https://image.tmdb.org/t/p/w500/7WTsnHkbA0FaG6R9hAiIVrZjwUf.jpg',
      'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
      'https://image.tmdb.org/t/p/w500/suaEOtk1N1sgg2QM528GgbHGgK8.jpg',
      'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
      'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
      'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
      'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
      'https://image.tmdb.org/t/p/w500/q719jXXEzOoYaps6babgKnONONX.jpg',
      'https://image.tmdb.org/t/p/w500/drlyoSKDOY0tgMR7eczObfwfWj.jpg',
      'https://image.tmdb.org/t/p/w500/h8Rb9gBr48ODIwYUttZNYeMWeUU.jpg',
      'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
      'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
      'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg',
      'https://image.tmdb.org/t/p/w500/hA2ple9q4qnwxp3hKVNhPmktXGy.jpg',
      'https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg',
      'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
      'https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
      'https://image.tmdb.org/t/p/w500/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg',
      'https://image.tmdb.org/t/p/w500/i0vmc3db93qrWQnrkEcqQZQOwvU.jpg',
      'https://image.tmdb.org/t/p/w500/oPxnRhyAIzJKGUEdSiwTJQBa3NM.jpg',
      'https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg',
      'https://image.tmdb.org/t/p/w500/7GsM4mtM0worCtIVeiQt28HieeN.jpg',
      'https://image.tmdb.org/t/p/w500/fOdgPfixk1jJw5cr2ZJ2cj2QpaG.jpg',
      'https://image.tmdb.org/t/p/w500/hm58Jw4Lw8OIeJprziMgbbiCnEN.jpg',
      'https://image.tmdb.org/t/p/w500/r6LkqNuVRDgiFV3TqfkgKg8jcYb.jpg',
      'https://image.tmdb.org/t/p/w500/gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg',
      'https://image.tmdb.org/t/p/w500/13YWkDYqKDL2sE0nYJ9Uu4NKFuo.jpg',
      'https://image.tmdb.org/t/p/w500/uMlKGDc5WGBDro07u4JfcuBrG2P.jpg'
    ];
    
    final List<String> years = [
      '2010', '2008', '2019', '1994',
      '1994', '1972', '2014', '1999',
      '2001', '2016', '2016', '2020',
      '2019', '2021', '2022', '2015',
      '2022', '2021', '2017', '2016',
      '2017', '2014', '2016', '2019',
      '2014', '2020', '2015', '2017', '2010', '2019'
    ];
    
    final List<String> mediaTypes = List.generate(30, (index) {
      if (index >= 8 && index <= 11) return 'anime';
      return 'movie';
    });
    
    final List<double> ratings = List.generate(30, (index) => 8.0 + (index % 20) / 10);
    
    List<Map<String, dynamic>> items = [];
    
    for (int i = 0; i < 30; i++) {
      items.add({
        'id': i + 201,
        'title': titles[i],
        'image': images[i],
        'mediaType': mediaTypes[i],
        'year': years[i],
        'rating': ratings[i],
        'progress': 100, // Hepsi tamamlanmış
      });
    }
    
    return items;
  }
} 