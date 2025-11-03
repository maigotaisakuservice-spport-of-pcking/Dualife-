// 1. 初期設定と変数定義
// =============================================

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyC0whVaW_DeLNhCnr9sRuxqMrTtEJSPchM",
    authDomain: "dualife-pdg-group.firebaseapp.com",
    projectId: "dualife-pdg-group",
    storageBucket: "dualife-pdg-group.appspot.com",
    messagingSenderId: "419383730263",
    appId: "1:419383730263:web:e2fa87f1773f78be24c312"
};

// Firebaseの初期化
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Cloudinary Configuration
const CLOUDINARY_CLOUD_NAME = 'dwse8vdhp';
const CLOUDINARY_UPLOAD_PRESET = 'dualife-post-image-upload';


// 2. ユーザー識別と情報管理
// =============================================

// アプリケーションの初期化処理をDOMの読み込み完了後に行う
document.addEventListener('DOMContentLoaded', () => {
    initializeUser();
    initializeTermsPopup();
    initializeModeSwitcher();
});

/**
 * ユーザーIDとニックネームを初期化する関数
 * LocalStorageに情報がなければ新規作成し、保存する
 */
function initializeUser() {
    let localUserId = localStorage.getItem('localUserId');
    let nickname = localStorage.getItem('nickname');

    if (!localUserId) {
        localUserId = generateUniqueId();
        localStorage.setItem('localUserId', localUserId);
        console.log('新規ユーザーIDを生成しました:', localUserId);
    } else {
        console.log('既存のユーザーID:', localUserId);
    }

    if (!nickname) {
        nickname = generateRandomNickname();
        localStorage.setItem('nickname', nickname);
        console.log('新規ニックネームを生成しました:', nickname);
    } else {
        console.log('既存のニックネーム:', nickname);
    }
}

/**
 * ユニークなIDを生成する簡単な関数
 * @returns {string} タイムスタンプと乱数を組み合わせた文字列
 */
function generateUniqueId() {
    return 'user_' + Date.now() + Math.random().toString(36).substring(2, 9);
}

/**
 * ランダムなニックネームを生成する関数
 * @returns {string} 形容詞 + 名詞 の組み合わせ
 */
function generateRandomNickname() {
    const adjectives = ['水色の', '眠い', 'きらきらの', '夢見る', 'ごきげんな', 'さみしい', '静かな', '朝焼けの'];
    const nouns = ['ラムネ', 'ネコ', 'ドロップ', 'ココア', 'イルカ', 'オオカミ', '雨音', '海'];

    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];

    return `${adj}${noun}`;
}


// 3. 外部サービス連携
// =============================================

/**
 * 外部APIからユーザーのIPアドレスを取得する関数
 * @returns {Promise<string|null>} IPアドレス or 取得失敗時にnull
 */
async function getIpAddress() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        if (!response.ok) {
            throw new Error('IPアドレスの取得に失敗しました。');
        }
        const data = await response.json();
        console.log('IPアドレスを取得しました:', data.ip);
        return data.ip;
    } catch (error) {
        console.error(error);
        return null; // エラー時はnullを返す
    }
}

// 動作テスト
getIpAddress();


// 4. UI制御
// =============================================

/**
 * カスタムアラートを表示する関数
 * @param {string} message 表示するメッセージ
 */
function showCustomAlert(message) {
    const popup = document.getElementById('custom-popup');
    const messageEl = document.getElementById('custom-popup-message');
    const okBtn = document.getElementById('custom-popup-ok');
    const confirmBtn = document.getElementById('custom-popup-confirm');
    const cancelBtn = document.getElementById('custom-popup-cancel');

    messageEl.textContent = message;

    okBtn.style.display = 'inline-block';
    confirmBtn.style.display = 'none';
    cancelBtn.style.display = 'none';

    popup.style.display = 'flex';

    okBtn.onclick = () => popup.style.display = 'none';
}

/**
 * カスタム確認ダイアログを表示する関数
 * @param {string} message 表示するメッセージ
 * @param {function} onConfirm 「はい」がクリックされたときに実行されるコールバック
 */
function showCustomConfirm(message, onConfirm) {
    const popup = document.getElementById('custom-popup');
    const messageEl = document.getElementById('custom-popup-message');
    const okBtn = document.getElementById('custom-popup-ok');
    const confirmBtn = document.getElementById('custom-popup-confirm');
    const cancelBtn = document.getElementById('custom-popup-cancel');

    messageEl.textContent = message;

    okBtn.style.display = 'none';
    confirmBtn.style.display = 'inline-block';
    cancelBtn.style.display = 'inline-block';

    popup.style.display = 'flex';

    confirmBtn.onclick = () => {
        popup.style.display = 'none';
        onConfirm();
    };
    cancelBtn.onclick = () => popup.style.display = 'none';
}


/**
 * 利用規約同意ポップアップを初期化する関数
 */
function initializeTermsPopup() {
    const popup = document.getElementById('terms-popup');
    const closeBtn = document.getElementById('close-popup-btn');
    const termsAccepted = localStorage.getItem('termsAccepted');

    if (!termsAccepted) {
        popup.style.display = 'flex';
    }

    closeBtn.addEventListener('click', () => {
        popup.style.display = 'none';
        localStorage.setItem('termsAccepted', 'true');
    });
}

/**
 * モード切替機能を初期化する関数
 */
function initializeModeSwitcher() {
    const freeModeBtn = document.getElementById('free-mode-btn');
    const myRoomBtn = document.getElementById('my-room-btn');
    const schoolModeBtn = document.getElementById('school-mode-btn');

    // 初期表示はフリーモード
    showFreeMode();

    freeModeBtn.addEventListener('click', showFreeMode);
    myRoomBtn.addEventListener('click', showMyRoom);
    schoolModeBtn.addEventListener('click', showSchoolMode);
}

// 4.1. 画面表示関数 (グローバルスコープに移動)
// =============================================

function showFreeMode() {
    const mainContent = document.getElementById('main-content');
    const freeModeBtn = document.getElementById('free-mode-btn');
    const myRoomBtn = document.getElementById('my-room-btn');
    const schoolModeBtn = document.getElementById('school-mode-btn');

    mainContent.innerHTML = `
        <h2>フリーモード</h2>
        <div id="post-form">
            <textarea id="post-text" placeholder="いまどうしてる？" rows="4"></textarea>
            <input type="file" id="post-image" accept="image/*">
            <button id="submit-post-btn">投稿する</button>
        </div>
        <div id="timeline">
            <!-- タイムラインはここに表示される -->
        </div>
    `;
    freeModeBtn.classList.add('active');
    myRoomBtn.classList.remove('active');
    schoolModeBtn.classList.remove('active');

    // 投稿ボタンにイベントリスナーを追加
    document.getElementById('submit-post-btn').addEventListener('click', submitPost);

    // タイムラインのリアルタイム監視を開始
    listenForPosts();
}

async function showMyRoom() {
    const mainContent = document.getElementById('main-content');
    const freeModeBtn = document.getElementById('free-mode-btn');
    const myRoomBtn = document.getElementById('my-room-btn');
    const schoolModeBtn = document.getElementById('school-mode-btn');
    const localUserId = localStorage.getItem('localUserId');

    mainContent.innerHTML = `
        <h2>推し活マイルーム</h2>
        <div id="my-room-gallery" class="gallery-grid"></div>
    `;
    myRoomBtn.classList.add('active');
    freeModeBtn.classList.remove('active');
    schoolModeBtn.classList.remove('active');

    const gallery = document.getElementById('my-room-gallery');
    gallery.innerHTML = '<p>読み込み中...</p>';

    try {
        const snapshot = await db.collection('thoughts')
            .where('localUserId', '==', localUserId)
            .where('imageUrl', '!=', null)
            .orderBy('createdAt', 'desc')
            .get();

        gallery.innerHTML = '';
        if (snapshot.empty) {
            gallery.innerHTML = '<p>まだ画像が投稿されていません。</p>';
            return;
        }
        snapshot.forEach(doc => {
            const post = doc.data();
            const img = document.createElement('img');
            img.src = post.imageUrl;
            img.alt = '投稿画像';
            gallery.appendChild(img);
        });
    } catch (error) {
        console.error("マイルームの画像取得エラー:", error);
        gallery.innerHTML = '<p>画像の読み込みに失敗しました。</p>';
    }
}

async function showSchoolMode() {
    const mainContent = document.getElementById('main-content');
    const freeModeBtn = document.getElementById('free-mode-btn');
    const myRoomBtn = document.getElementById('my-room-btn');
    const schoolModeBtn = document.getElementById('school-mode-btn');
    const groupId = localStorage.getItem('groupId');
    const localUserId = localStorage.getItem('localUserId');

    mainContent.innerHTML = `<h2>スクールモード</h2>`;
    schoolModeBtn.classList.add('active');
    freeModeBtn.classList.remove('active');
    myRoomBtn.classList.remove('active');

    if (groupId) {
        // グループ情報を取得して所有者かどうかを判断
        const groupDoc = await db.collection('groups').doc(groupId).get();
        const groupData = groupDoc.exists ? groupDoc.data() : {};
        const isOwner = groupData.createdBy === localUserId;

        mainContent.innerHTML += `
            <div class="school-mode-container">
                <div class="school-mode-tabs">
                    <button id="contact-book-tab" class="active">連絡帳</button>
                    <button id="event-album-tab">イベントアルバム</button>
                </div>
                <div id="school-mode-content"></div>
                <p class="group-info">
                    招待コード: ${groupId}
                    <button id="leave-group-btn">グループを抜ける</button>
                    ${isOwner ? '<button id="delete-group-btn" class="danger">グループを削除</button>' : ''}
                </p>
            </div>
        `;
        document.getElementById('leave-group-btn').addEventListener('click', leaveGroup);
        if (isOwner) {
            document.getElementById('delete-group-btn').addEventListener('click', deleteGroup);
        }

        const contactBookTab = document.getElementById('contact-book-tab');
        const eventAlbumTab = document.getElementById('event-album-tab');

        // グループ情報を渡して連絡帳を表示
        showContactBook(groupData);

        contactBookTab.addEventListener('click', () => {
            contactBookTab.classList.add('active');
            eventAlbumTab.classList.remove('active');
            showContactBook(groupData);
        });
        eventAlbumTab.addEventListener('click', () => {
            eventAlbumTab.classList.add('active');
            contactBookTab.classList.remove('active');
            showEventAlbum();
        });

    } else {
        mainContent.innerHTML += `
            <div id="group-join-form">
                <p>グループに参加するか、新しいグループを作成してください。</p>
                <input type="text" id="group-code-input" placeholder="招待コードを入力">
                <button id="join-group-btn">参加</button>
                <hr>
                <button id="create-group-btn">新しいグループを作成</button>
            </div>
        `;
        document.getElementById('join-group-btn').addEventListener('click', joinGroup);
        document.getElementById('create-group-btn').addEventListener('click', createGroup);
    }
}


// 5. フリーモード機能
// =============================================

/**
 * 投稿をCloudinaryとFirestoreに送信する関数
 */
async function submitPost() {
    const postTextInput = document.getElementById('post-text');
    const postImageInput = document.getElementById('post-image');
    const text = postTextInput.value.trim();

    if (!text) {
        showCustomAlert('テキストを入力してください。');
        return;
    }

    const file = postImageInput.files[0];
    const localUserId = localStorage.getItem('localUserId');
    const nickname = localStorage.getItem('nickname');

    try {
        // IPアドレスを取得
        const ipAddress = await getIpAddress();
        if (!ipAddress) {
            showCustomAlert('IPアドレスが取得できませんでした。投稿できません。');
            return;
        }

        let imageUrl = null;
        // 画像があればCloudinaryにアップロード
        if (file) {
            imageUrl = await uploadToCloudinary(file);
        }

        // Firestoreに保存するデータを作成
        const postData = {
            text: text,
            imageUrl: imageUrl,
            localUserId: localUserId,
            nickname: nickname,
            ipAddress: ipAddress,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            // 24時間後のDateオブジェクトをexpireAtフィールドに設定
            expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        };

        // Firestoreにデータを追加
        await db.collection('thoughts').add(postData);

        // フォームをクリア
        postTextInput.value = '';
        postImageInput.value = '';

        showCustomAlert('投稿しました！');

    } catch (error) {
        console.error('投稿エラー:', error);
        showCustomAlert('投稿に失敗しました。');
    }
}

/**
 * ファイルをCloudinaryにアップロードするヘルパー関数
 * @param {File} file アップロードするファイル
 * @returns {Promise<string>} アップロードされた画像のURL
 */
function uploadToCloudinary(file) {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        // 公式ドキュメントに基づき、Fetch APIを使用してアップロードを実行
        fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            // ネットワークエラーだけでなく、Cloudinaryからのエラーレスポンスも考慮
            if (!response.ok) {
                // response.json()を待ってからエラーをrejectする
                return response.json().then(errorData => {
                    throw new Error(errorData.error.message || 'Cloudinary APIエラー');
                });
            }
            return response.json();
        })
        .then(data => {
            // secure_urlが存在し、有効なURLであることを確認
            if (data.secure_url) {
                console.log('Cloudinaryへのアップロード成功:', data.secure_url);
                resolve(data.secure_url);
            } else {
                // データは取得できたが、期待したURLが含まれていない場合
                console.error('Cloudinaryからのレスポンスエラー:', data);
                reject(new Error('アップロード後のURL取得に失敗しました。'));
            }
        })
        .catch(error => {
            // ネットワークエラーや上記でthrowされたエラーをキャッチ
            console.error('Cloudinaryへのアップロード中にエラーが発生しました:', error);
            reject(error); // エラーオブジェクトをそのまま次のcatchに渡す
        });
    });
}

/**
 * Firestoreの投稿をリアルタイムで監視し、タイムラインに表示する関数
 */
function listenForPosts() {
    const timeline = document.getElementById('timeline');
    if (!timeline) return;

    db.collection('thoughts').orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
        timeline.innerHTML = ''; // 既存の表示をクリア
        snapshot.forEach(doc => {
            const post = doc.data();
            const postId = doc.id; // ドキュメントIDを取得
            const postElement = renderPost(post, postId); // IDをrenderPostに渡す
            timeline.appendChild(postElement);
        });
    }, (error) => {
        console.error("タイムラインの取得に失敗しました:", error);
    });
}

/**
 * 1つの投稿データからHTML要素を生成するヘルパー関数
 * @param {object} post 投稿データ
 * @param {string} postId FirestoreのドキュメントID
 * @returns {HTMLElement} 投稿を表すdiv要素
 */
function renderPost(post, postId) {
    // この関数は変更しない
    const postDiv = document.createElement('div');
    postDiv.className = 'post';

    const nickname = post.nickname || 'ななしさん';
    const text = post.text;
    const imageUrl = post.imageUrl;
    const reactions = post.reactions || {}; // スタンプの数

    // タイムスタンプをフォーマット
    const timestamp = post.createdAt ? post.createdAt.toDate().toLocaleString('ja-JP') : '...';

    postDiv.innerHTML = `
        <div class="post-header">
            <strong>${nickname}</strong>
            <span class="post-time">${timestamp}</span>
        </div>
        <p class="post-text">${text}</p>
        ${imageUrl ? `<img src="${imageUrl}" alt="投稿画像" class="post-image">` : ''}
        <div class="post-footer">
            <button onclick="updateStampCount('${postId}', 'wakaru')">わかる</button>
            <span id="stamp-wakaru-${postId}">${reactions.wakaru || 0}</span>
            <button onclick="updateStampCount('${postId}', 'donmai')">ドンマイ</button>
            <span id="stamp-donmai-${postId}">${reactions.donmai || 0}</span>
        </div>
    `;

    return postDiv;
}

/**
 * 共感スタンプのカウントを更新する関数
 * @param {string} postId FirestoreのドキュメントID
 * @param {string} stampType スタンプの種類 ('wakaru', 'donmai' 등)
 */
function updateStampCount(postId, stampType) {
    const postRef = db.collection('thoughts').doc(postId);
    const fieldToUpdate = `reactions.${stampType}`;

    postRef.update({
        [fieldToUpdate]: firebase.firestore.FieldValue.increment(1)
    }).catch(error => {
        console.error("スタンプの更新に失敗しました:", error);
    });
}


// 6. スクールモード機能
// =============================================

/**
 * 新しいグループを作成する関数
 */
async function createGroup() {
    const newGroupId = `dual-${Math.random().toString(36).substring(2, 8)}`;

    try {
        await db.collection('groups').doc(newGroupId).set({
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdBy: localStorage.getItem('localUserId')
        });

        localStorage.setItem('groupId', newGroupId);
        showCustomAlert(`グループを作成しました！\n招待コード: ${newGroupId}`);
        showSchoolMode(); // UIを更新
    } catch (error) {
        console.error("グループの作成に失敗しました:", error);
        showCustomAlert("グループの作成に失敗しました。");
    }
}

/**
 * 招待コードを使ってグループに参加する関数
 */
async function joinGroup() {
    const input = document.getElementById('group-code-input');
    const groupId = input.value.trim();

    if (!groupId) {
        showCustomAlert("招待コードを入力してください。");
        return;
    }

    try {
        const groupRef = db.collection('groups').doc(groupId);
        const doc = await groupRef.get();

        if (doc.exists) {
            localStorage.setItem('groupId', groupId);
            showCustomAlert("グループに参加しました！");
            showSchoolMode(); // UIを更新
        } else {
            showCustomAlert("その招待コードを持つグループは存在しません。");
        }
    } catch (error) {
        console.error("グループの参加に失敗しました:", error);
        showCustomAlert("グループへの参加に失敗しました。");
    }
}

/**
 * 現在参加しているグループから脱退する関数
 */
function leaveGroup() {
    showCustomConfirm("本当にグループを抜けますか？", () => {
        localStorage.removeItem('groupId');
        showCustomAlert("グループを抜けました。");
        showSchoolMode(); // UIを更新
    });
}

/**
 * グループを削除する関数（所有者のみ）
 */
async function deleteGroup() {
    const groupId = localStorage.getItem('groupId');
    if (!groupId) return;

    showCustomConfirm("本当にこのグループを削除しますか？\n連絡帳やアルバムのデータもすべて失われ、元に戻すことはできません。", async () => {
        try {
            // Firestoreからグループドキュメントを削除
            await db.collection('groups').doc(groupId).delete();

            // ※注：サブコレクション(messages, album)は自動では削除されないが、
            // グループ本体がなくなるため、実質的にアクセス不能になる。

            localStorage.removeItem('groupId');
            showCustomAlert("グループを削除しました。");
            showSchoolMode(); // UIを更新
        } catch (error) {
            console.error("グループの削除に失敗しました:", error);
            showCustomAlert("グループの削除に失敗しました。");
        }
    });
}

/**
 * スクールモードの連絡帳UIを表示・制御する関数
 */
function showContactBook(groupData) { // groupDataを受け取る
    const contentArea = document.getElementById('school-mode-content');
    contentArea.innerHTML = `
        <h3>連絡帳</h3>
        <div id="contact-post-form">
            <textarea id="contact-text" placeholder="メッセージを入力..." rows="3"></textarea>
            <label><input type="radio" name="message-type" value="important" checked> 大事な連絡</label>
            <label><input type="radio" name="message-type" value="chat"> 雑談</label>
            <button id="submit-contact-btn">送信</button>
        </div>
        <div id="contact-timeline"></div>
    `;

    document.getElementById('submit-contact-btn').addEventListener('click', submitContactMessage);
    listenForContactMessages(groupData); // groupDataを渡す
}

/**
 * 連絡帳に新しいメッセージを投稿する関数
 */
async function submitContactMessage() {
    const text = document.getElementById('contact-text').value.trim();
    const type = document.querySelector('input[name="message-type"]:checked').value;
    const groupId = localStorage.getItem('groupId');
    if (!text || !groupId) return;

    try {
        await db.collection('groups').doc(groupId).collection('messages').add({
            text: text,
            type: type,
            senderId: localStorage.getItem('localUserId'),
            senderNickname: localStorage.getItem('nickname'),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        document.getElementById('contact-text').value = '';
    } catch (error) {
        console.error("連絡帳への投稿エラー:", error);
        showCustomAlert("メッセージの送信に失敗しました。");
    }
}

/**
 * 連絡帳のメッセージをリアルタイムで監視・表示する関数
 */
function listenForContactMessages(groupData) { // groupDataを受け取る
    const timeline = document.getElementById('contact-timeline');
    const groupId = localStorage.getItem('groupId');
    const groupOwnerId = groupData.createdBy; // グループ作成者のIDを取得
    if (!timeline || !groupId) return;

    db.collection('groups').doc(groupId).collection('messages').orderBy('createdAt', 'desc')
        .onSnapshot(snapshot => {
            timeline.innerHTML = '';
            snapshot.forEach(doc => {
                const message = doc.data();
                const isOwner = message.senderId === groupOwnerId; // 送信者が作成者か判定
                const crownIcon = isOwner ? '👑' : ''; // 作成者なら王冠アイコンを表示

                const messageDiv = document.createElement('div');
                messageDiv.className = `message-item ${message.type}`; // 'important' or 'chat'
                messageDiv.innerHTML = `
                    <p><strong>${crownIcon}${message.senderNickname || 'ななしさん'}</strong></p>
                    <p>${message.text}</p>
                `;
                timeline.appendChild(messageDiv);
            });
        });
}


/**
 * スクールモードのイベントアルバムUIを表示・制御する関数
 */
function showEventAlbum() {
    const contentArea = document.getElementById('school-mode-content');
    contentArea.innerHTML = `
        <h3>イベントアルバム</h3>
        <input type="file" id="album-image-input" accept="image/*">
        <div id="album-gallery" class="gallery-grid"></div>
    `;

    document.getElementById('album-image-input').addEventListener('change', uploadAlbumImage);
    listenForAlbumImages();
}

/**
 * アルバムに画像をアップロードする関数
 * @param {Event} e input要素のchangeイベント
 */
async function uploadAlbumImage(e) {
    const file = e.target.files[0];
    const groupId = localStorage.getItem('groupId');
    if (!file || !groupId) return;

    try {
        const imageUrl = await uploadToCloudinary(file);
        await db.collection('groups').doc(groupId).collection('album').add({
            imageUrl: imageUrl,
            uploaderId: localStorage.getItem('localUserId'),
            uploaderNickname: localStorage.getItem('nickname'),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error("アルバムへの画像アップロードエラー:", error);
        showCustomAlert("画像のアップロードに失敗しました。");
    }
}

/**
 * アルバムの画像をリアルタイムで監視・表示する関数
 */
function listenForAlbumImages() {
    const gallery = document.getElementById('album-gallery');
    const groupId = localStorage.getItem('groupId');
    if (!gallery || !groupId) return;

    db.collection('groups').doc(groupId).collection('album').orderBy('createdAt', 'desc')
        .onSnapshot(snapshot => {
            gallery.innerHTML = '';
            snapshot.forEach(doc => {
                const imageData = doc.data();
                const img = document.createElement('img');
                img.src = imageData.imageUrl;
                img.alt = 'アルバム画像';
                gallery.appendChild(img);
            });
        });
}
