// Flickr API key
const apiKey = '0007939d8e238aa187e9ec8971a5f7a0';

// Flickr画像データのURLを返す
const getFlickrImageURL = (photo, size) => {
  let url = `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${
    photo.secret
  }`;
  if (size) {
    // サイズ指定ありの場合
    url += `_${size}`;
  }
  url += '.jpg';
  return url;
};

// Flickr画像の元ページのURLを返す
const getFlickrPageURL = photo => `https://www.flickr.com/photos/${photo.owner}/${photo.id}`;

// Flickr画像のaltテキストを返す
const getFlickrText = (photo) => {
  let text = `"${photo.title}" by ${photo.ownername}`;
  if (photo.license === '4') {
    // Creative Commons Attribution（CC BY）ライセンス
    text += ' / CC BY';
  }
  return text;
};

///text:'animal'　const animals(animal) =>{animaru('cat') animaru('dog')}

// リクエストパラメータを作る
const dogparameters = $.param({
  method: 'flickr.photos.search',
  api_key: apiKey,
  text: 'dog', // 検索テキスト
  sort: 'interestingness-desc', // 興味深さ順
  per_page: 4, // 取得件数
  license: '4', // Creative Commons Attributionのみ
  extras: 'owner_name,license', // 追加で取得する情報
  format: 'json', // レスポンスをJSON形式に
  nojsoncallback: 1, // レスポンスの先頭に関数呼び出しを含めない
});
const dogurl = `https://api.flickr.com/services/rest/?${dogparameters}`;
console.log('dogurl' ,dogurl);


$.getJSON(dogurl, (data) => {
  console.log(data);

  // データが取得できなかった場合
  if (data.stat !== 'ok') {
    console.error('データの取得に失敗しました。');
    return;
  }

  // 空の<div>を作る
  const $div = $('<div>');

  // ヒット件数
  $div.append(`<div>${data.photos.total} photos in total</div>`);

  for (let i = 0; i < data.photos.photo.length; i++) {
    const photo = data.photos.photo[i];
    const photoText = getFlickrText(photo);

    // $divに <a href="..." ...><img src="..." ...></a> を追加する
    $div.append(
      $('<div>', {
        class: 'image-gallery__item',
      }).append(
        $('<a>', {
          href: getFlickrPageURL(photo),
          class: 'd-inline-block',
          target: '_blank', // リンクを新規タブで開く
          'data-toggle': 'tooltip',
          'data-placement': 'bottom',
          title: photoText,
        }).append(
          $('<img>', {
            src: getFlickrImageURL(photo, 'q'),
            width: 150,
            height: 150,
            alt: photoText,
          }),
        ),
      ),
    );
  };
  // $divを#mainに追加する
  $div.appendTo('.image-gallery');

  // BootstrapのTooltipを適用
  $('[data-toggle="tooltip"]').tooltip();
});

// リクエストパラメータを作る
const parameters = $.param({
  method: 'flickr.photos.search',
  api_key: apiKey,
  text: 'cat', // 検索テキスト
  sort: 'interestingness-desc', // 興味深さ順
  per_page: 4, // 取得件数
  license: '4', // Creative Commons Attributionのみ
  extras: 'owner_name,license', // 追加で取得する情報
  format: 'json', // レスポンスをJSON形式に
  nojsoncallback: 1, // レスポンスの先頭に関数呼び出しを含めない
});
const url = `https://api.flickr.com/services/rest/?${parameters}`;
console.log('url', url);

// 猫の画像を検索して表示
$.getJSON(url, (data) => {
  console.log(data);

  // データが取得できなかった場合
  if (data.stat !== 'ok') {
    console.error('データの取得に失敗しました。');
    return;
  }

  // 空の<div>を作る
  const $div = $('<div>');

  // ヒット件数
  $div.append(`<div>${data.photos.total} photos in total</div>`);

  for (let i = 0; i < data.photos.photo.length; i++) {
    const photo = data.photos.photo[i];
    const photoText = getFlickrText(photo);

    // $divに <a href="..." ...><img src="..." ...></a> を追加する
    $div.append(
      $('<div>', {
        class: 'image-gallery__item',
      }).append(
        $('<a>', {
          href: getFlickrPageURL(photo),
          class: 'd-inline-block',
          target: '_blank', // リンクを新規タブで開く
          'data-toggle': 'tooltip',
          'data-placement': 'bottom',
          title: photoText,
        }).append(
          $('<img>', {
            src: getFlickrImageURL(photo, 'q'),
            width: 150,
            height: 150,
            alt: photoText,
          }),
        ),
      ),
    );
  }
  // $divを#mainに追加する
  
  $div.appendTo('.image-gallery');

  // BootstrapのTooltipを適用
  $('[data-toggle="tooltip"]').tooltip();
});
/* global $ MobileDetect */

// モバイルブラウザかどうか判定
const isMobile = !!new MobileDetect(window.navigator.userAgent).mobile();

/**
 * ----------------------
 * 指定された名前のタブを表示
 * ----------------------
 */
const showTab = (tabName) => {
  // すでに表示されている場合は何もせずに終了
  if ($(`#${tabName}`).is(':visible')) {
    return;
  }

  const tabsContainer = $(`a[href='#${tabName}']`).closest('.tabs');
  // .tabs__menu liのうちtabNameに該当するものにだけactiveクラスを付ける
  tabsContainer.find('.tabs__menu li').removeClass('active');
  tabsContainer
    .find(`.tabs__menu a[href='#${tabName}']`)
    .parent('li')
    .addClass('active');

  // .tabs__contentの直下の要素をすべて非表示
  tabsContainer.find('.tabs__content > *').css({ display: 'none' });
  // #<tabName>と.tabs__content .<tabName>を表示
  tabsContainer
    .find(`#${tabName}, .tabs__content .${tabName}`)
    .css({
      display: 'block',
      opacity: 0.7,
    })
    .animate(
      {
        opacity: 1,
      },
      400,
    );
};

/**
 * -------------
 * パララックス関連
 * -------------
 */

// 背景画像のスクロール速度。数字が小さいほど速い。
const parallaxXSpeed = 12;
const parallaxYSpeed = 3;
const parallaxXSpeedSmall = 5;
const parallaxYSpeedSmall = 1;

// パララックスを適用する関数
const showParallax = () => {
  const scrollTop = $(window).scrollTop();

  // 背景画像の位置をスクロールに合わせて変える
  const offsetX = Math.round(scrollTop / parallaxXSpeed);
  const offsetY = Math.round(scrollTop / parallaxYSpeed);
  const offsetXSmall = Math.round(scrollTop / parallaxXSpeedSmall);
  const offsetYSmall = Math.round(scrollTop / parallaxYSpeedSmall);

  $('.store').css({
    'background-position':
      // 一番上
      `${-offsetX}px ${-offsetY}px, ${
        // 上から2番目
        offsetXSmall
      }px ${-offsetYSmall}px, `
      // 一番下
      + '0% 0%',
  });

  $('.cats').css({
    'background-position':
      // 一番上
      `${offsetX}px ${-offsetY}px, ${
        // 上から2番目
        -offsetXSmall
      }px ${-offsetYSmall}px, `
      // 一番下
      + '0% 0%',
  });

  $('.access').css({
    'background-position':
      // 一番上
      `${-offsetX}px ${-offsetY}px, ${
        // 上から2番目
        offsetXSmall
      }px ${-offsetYSmall}px, `
      // 一番下
      + '0% 0%',
  });
};

// パララックスを初期化する関数
const initParallax = () => {
  $(window).off('scroll', showParallax);
  // スクロールのたびにshowParallax関数を呼ぶ
  $(window).on('scroll', showParallax);
};


/**
 * ------------------
 * イベントハンドラの登録
 * ------------------
 */

/**
 * animatedクラスを持つ要素が画面内に入ったら
 * Animate.cssのfadeInUpエフェクトを適用
 */
$('.animated').waypoint({
  handler(direction) {
    if (direction === 'down') {
      $(this.element).addClass('fadeInUp');
      this.destroy();
    }
  },
  /**
   * 要素の上端が画面のどの位置に来たときにhandlerメソッドを呼び出すか指定
   * 0%なら画面の一番上、100%なら画面の一番下に来たときに呼び出される
   */
  offset: '100%',
});

$(window).on('resize', () => {
  // ウインドウがリサイズされるとここが実行される
  initParallax();
});

// タブがクリックされたらコンテンツを表示
$('.tabs__menu a').on('click', (e) => {
  const tabName = $(e.currentTarget).attr('href');

  // hrefにページ遷移しない
  e.preventDefault();

  if (tabName[0] === '#') {
    // hrefの先頭の#を除いた���のをshowTab()関数に渡す
    showTab(tabName.substring(1));
  }
});

/**
 * ナビゲーションバーのリンクをクリックしたら、
 * スムーズにスクロールしながら対象位置に移動
 */
$('.nav-link').on('click', (e) => {
  const destination = $(e.target).attr('href');

  // 本来のクリックイベントは処理しない
  e.preventDefault();

  $('html, body').animate(
    {
      scrollTop: $(destination).offset().top,
    },
    1000,
  );

  // ハンバーガーメニューが開いている場合は閉じる
  $('.navbar-toggler:visible').trigger('click');
});

// d-inline-blockクラスの付いた要素にMagnific Popupを適用
$('.d-inline-block').magnificPopup({
  type: 'image',
  gallery: { enabled: true },

  /**
   * ポップアップに適用されるクラス。
   * ここではフェードイン・アウト用のmfp-fadeクラスを適用。
   */
  mainClass: 'mfp-fade',

  // ポップアップが非表示になるまでの待ち時間
  removalDelay: 300,
});

/**
 * ---------------------------------------
 * ページの読み込みが完了したタイミングで行うDOM操作
 * ---------------------------------------
 */

// モバイルブラウザでは静止画を表示し、それ以外では動画を表示
if (isMobile) {
  $('.top__bg').css({
    'background-image': 'url(video/top-video-still.jpg)',
  });
} else {
  $('.top__video').css({ display: 'block' });
}

// 初期状態として1番目のタブを表示
showTab('store-1');
showTab('cats-1');

// パララックスを初期化する
initParallax();

$(function(){
  $(".fade-img img:not(:first-child)").hide();
  setInterval(function() {
    $(".fade-img img:first-child").fadeOut("slow").next("img").fadeIn("slow").end().appendTo(".fade-img");
  },5000);
});
