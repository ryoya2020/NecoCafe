/* jshint curly:true, debug:true */
/* globals $, firebase */

let currentUID;
let uid = currentUID
let dbdata = {};
/**
 * -------------------
 * 書籍一覧画面関連の関数
 * -------------------
 */


// 書籍の表紙画像をダウンロードする
const downloadBookImage = bookImageLocation => firebase
  .storage()
  .ref(bookImageLocation)
  .getDownloadURL() // book-images/abcdef のようなパスから画像のダウンロードURLを取得
  .catch((error) => {
    console.error('写真のダウンロードに失敗:', error);
  });

// 書籍の表紙画像を表示する
const displayBookImage = ($divTag, url) => {
  $divTag.find('.book-item__image').attr({
    src: url,
  });
};

// Realtime Database の books から書籍を削除する
const deleteBook = (bookId) => {
  // TODO: books から該当の書籍データを削除
  firebase
    .database()
    .ref(`books/${bookId}`)
    .remove();
}


// 書籍の表示用のdiv（jQueryオブジェクト）を作って返す
const createBookDiv = (bookId, bookData) => {
  // HTML内のテンプレートからコピーを作成する
  const $divTag = $('#book-template > .book-item').clone();

  // 書籍タイトルを表示する
  $divTag.find('.book-item__title').text(bookData.bookTitle);

  // 書籍の表紙画像をダウンロードして表示する
  
  //ここにDOM生成をするためのループ処理
  downloadBookImage(bookData.bookImageLocation).then((url) => {
    displayBookImage($divTag, url);
  });

  // id属性をセット
  $divTag.attr('id', `book-id-${bookId}`);

  if(currentUID === bookData.uid){
  // 削除ボタンのイベントハンドラを登録
    const $deleteButton = $divTag.find('.book-item__delete');
    $deleteButton.on('click', () => {
      deleteBook(bookId);
    });
  }else{
    $divTag.find('#delet-btn').addClass('delete-btn');
  }
  return $divTag;
};

// 書籍一覧画面内の書籍データをクリア
const resetBookshelfView = () => {
  $('#book-list').empty();
};

// 書籍一覧画面に書籍データを表示する
const addBook = (bookId, bookData) => {
  const $divTag = createBookDiv(bookId, bookData);
  $divTag.appendTo('#book-list');
};

// 書籍一覧画面の初期化、イベントハンドラ登録処理
const loadBookshelfView = () => {
  resetBookshelfView();

  // 書籍データを取得
  const booksRef = firebase
    .database()
    .ref('books')
    .orderByChild('createdAt');

  // 過去に登録したイベントハンドラを削除
  booksRef.off('child_removed');
  booksRef.off('child_added');

  // books の child_removedイベントハンドラを登録
  // （データベースから書籍が削除されたときの処理）
  booksRef.on('child_removed', (bookSnapshot) => {
    const bookId = bookSnapshot.key;
    const $book = $(`#book-id-${bookId}`);
    // TODO: 書籍一覧画面から該当の書籍データを削除する
    $book.remove();
    
    
  });

  

  // books の child_addedイベントハンドラを登録
  // （データベースに書籍が追加保存されたときの処理）
  booksRef.on('child_added', (bookSnapshot) => {
    const bookId = bookSnapshot.key;
    const bookData = bookSnapshot.val();

    // 書籍一覧画面に書籍データを表示する
    addBook(bookId, bookData);
  });
};

/**
 * ----------------------
 * すべての画面共通で使う関数
 * ----------------------
 */

// ビュー（画面）を変更する
const showView = (id) => {
  $('.view').hide();
  $(`#${id}`).fadeIn();

  if (id === 'bookshelf') {
    loadBookshelfView();
  }
};



/**
 * -------------------------
 * ログイン・ログアウト関連の関数
 * -------------------------
 */
const onWeakPassword = () => {
  resetLoginForm();
  $('#login__password').addClass('has-error');
  $('#login__help')
    .text('6文字以上のパスワードを入力してください')
    .fadeIn();
};
// その他のログインエラーの場合に呼ばれる
const onOtherLoginError = () => {
  resetLoginForm();
  $('#login__help')
    .text('ログインに失敗しました')
    .fadeIn();
};

// ユーザ作成に失敗したことをユーザに通知する
const catchErrorOnCreateUser = (error) => {
  // 作成失敗
  console.error('ユーザ作成に失敗:', error);
  if (error.code === 'auth/weak-password') {
    onWeakPassword();
  } else {
    // その他のエラー
    onOtherLoginError(error);
  }
};

// ログインフォームを初期状態に戻す
const resetLoginForm = () => {
  $('#login__help').hide();
  $('#login__submit-button')
    .prop('disabled', false)
    .text('ログイン');
};

// ログインした直後に呼ばれる
const onLogin = () => {
  console.log('ログイン完了');

  // 書籍一覧画面を表示
  showView('bookshelf');
};

// ログアウトした直後に呼ばれる
const onLogout = () => {
  const booksRef = firebase.database().ref('books');

  // 過去に登録したイベントハンドラを削除
  booksRef.off('child_removed');
  booksRef.off('child_added');

  showView('login');
};

const onWrongPassword = () => {
  resetLoginForm();
  $('#login__password').addClass('has-error');
  $('#login__help')
    .text('正しいパスワードを入力してください')
    .fadeIn();
};

const onTooManyRequests = () => {
  resetLoginForm();
  $('#login__submit-button').prop('disabled', true);
  $('#login__help')
    .text('試行回数が多すぎます。後ほどお試しください。')
    .fadeIn();
};

const onInvalidEmail = () => {
  resetLoginForm();
  $('#login__email').addClass('has-error');
  $('#login__help')
    .text('メールアドレスを正しく入力してください')
    .fadeIn();
};


const catchErrorOnSignIn = (error) => {
  if (error.code === 'auth/wrong-password') {
    // パスワードの間違い
    onWrongPassword();
  } else if (error.code === 'auth/too-many-requests') {
    // 試行回数多すぎてブロック中
    onTooManyRequests();
  } else if (error.code === 'auth/invalid-email') {
    // メールアドレスの形式がおかしい
    onInvalidEmail();
  } else {
    // その他のエラー
    onOtherLoginError(error);
  }
};

/**
 * ------------------
 * イベントハンドラの登録
 * ------------------
 */

// ログイン状態の変化を監視する
firebase.auth().onAuthStateChanged((user) => {
  // ログイン状態が変化した

  if (user) {
    // ログイン済
    currentUID = user.uid;
    onLogin();
  } else {
    // 未ログイン
    currentUID = null;
    onLogout();
  }
});

// ログインフォームが送信されたらログインする
$('#login-form').on('submit', (e) => {
  e.preventDefault();

  const $loginButton = $('#login__submit-button');
  $loginButton.text('送信中…');

  const email = $('#login-email').val();
  const password = $('#login-password').val();

  // ログインを試みる
  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .catch((error) => {
      console.log('ログイン失敗:', error);
      if (error.code === 'auth/user-not-found') {
        // 該当ユーザが存在しない場合は新規作成する
        firebase
          .auth()
          .createUserWithEmailAndPassword(email, password)
          .then(() => {
            // 作成成功
            console.log('ユーザを作成しました');
          })
          .catch(catchErrorOnCreateUser);
      } else {
        catchErrorOnSignIn(error);
      }
    });
});

// ログアウトボタンが押されたらログアウトする
$('.logout-button').on('click', () => {
  firebase
    .auth()
    .signOut()
    .catch((error) => {
      console.error('ログアウトに失敗:', error);
    });
});


/**
 * -------------------------
 * 書籍情報追加モーダル関連の処理
 * -------------------------
 */

// 書籍の登録モーダルを初期状態に戻す
const resetAddBookModal = () => {
  $('#book-form')[0].reset();
  $('#add-book-image-label').text('');
  $('#submit_add_book')
    .prop('disabled', false)
    .text('保存する');
};

// 選択した表紙画像の、ファイル名を表示する
$('#add-book-image').on('change', (e) => {
  const input = e.target;
  const $label = $('#add-book-image-label');
  const file = input.files[0];

  if (file != null) {
    $label.text(file.name);
  } else {
    $label.text('ファイルを選択');
  }
});

// 書籍の登録処理
$('#book-form').on('submit', (e) => {
  e.preventDefault();

  // 書籍の登録ボタンを押せないようにする
  $('#submit_add_book')
    .prop('disabled', true)
    .text('送信中…');

  // 書籍タイトル
  const bookTitle = $('#add-book-title').val();

  const $bookImage = $('#add-book-image');
  const { files } = $bookImage[0];

  if (files.length === 0) {
    // ファイルが選択されていないなら何もしない
    return;
  }

  const file = files[0]; // 表紙画像ファイル
  
  const bookImageLocations = [];
  
  const uid = currentUID
  
  const promises = [];

  for (var i = 0; i < files.length; i++) {
    const filename = files[i].name; // 画像ファイル名
    const bookImageLocation = `book-images/${filename}`; // 画像ファイルのアップロード先
    promises.push(firebase
      .storage()
      .ref(bookImageLocation) // 画像ファイルのアップロード先
      .put(files[i])
    );
    bookImageLocations.push(bookImageLocation);
  }
    
  Promise.all(promises).then(() => {
    // Storageへのアップロードに成功したら、Realtime Databaseに書籍データを保存する
    const bookData = {
      bookTitle,
      bookImageLocations,// 複数のロケーション受け取るようにする。
      uid,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
    };
    return firebase
      .database()
      .ref('books')
      .push(bookData);
  })
    .then(() => {
      // 書籍一覧画面の書籍の登録モーダルを閉じて、初期状態に戻す
      $('#add-book-modal').modal('hide');
      resetAddBookModal();
    })
    .catch((error) => {
      // 失敗したとき
      console.error('エラー', error);
      resetAddBookModal();
      $('#add-book__help')
        .text('保存できませんでした。')
        .fadeIn();
    });
});
