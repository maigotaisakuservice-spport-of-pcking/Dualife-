// 1. 初期設定と変数定義
// =============================================

// WARNING: Do not expose your API keys in client-side code in a production environment.
// These keys are provided for demonstration purposes only.
// Consider using a backend service to manage authentication and API calls securely.
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
        // NOTE: This query requires a composite index in Firestore.
        // If this feature fails, create an index on:
        // Collection: 'thoughts', Fields: 'localUserId' (asc), 'imageUrl' (!= null), 'createdAt' (desc)
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
    const localUserId = localStorage.getItem('localUserId');

    // UIの基本的なアクティブ状態を設定
    document.getElementById('school-mode-btn').classList.add('active');
    document.getElementById('free-mode-btn').classList.remove('active');
    document.getElementById('my-room-btn').classList.remove('active');

    mainContent.innerHTML = `<h2>スクールモード</h2>`;

    const userGroups = JSON.parse(localStorage.getItem('userGroups')) || {};
    const activeGroupId = localStorage.getItem('activeGroupId');

    if (Object.keys(userGroups).length > 0) {
        // グループセレクターのHTMLを生成
        let groupSelectorHTML = '<select id="group-selector">';
        for (const groupId in userGroups) {
            groupSelectorHTML += `<option value="${groupId}" ${groupId === activeGroupId ? 'selected' : ''}>${userGroups[groupId].name}</option>`;
        }
        groupSelectorHTML += '</select>';

        const groupDoc = await db.collection('groups').doc(activeGroupId).get();
        const groupData = groupDoc.exists ? groupDoc.data() : {};
        const isOwner = groupData.createdBy === localUserId;

        mainContent.innerHTML += `
            <div class="group-header">
                ${groupSelectorHTML}
                <button id="add-more-group-btn">+ グループを追加/参加</button>
            </div>
            <div class="school-mode-container">
                <div class="school-mode-tabs">
                    <button id="contact-book-tab" class="active">連絡帳</button>
                    <button id="event-album-tab">イベントアルバム</button>
                    <button id="attendance-check-tab">出欠確認</button>
                </div>
                <div id="school-mode-content"></div>
                <p class="group-info">
                    招待コード: ${activeGroupId}
                    <button id="leave-group-btn">現在のグループを抜ける</button>
                    ${isOwner ? '<button id="settings-btn">設定</button><button id="delete-group-btn" class="danger">グループを削除</button>' : ''}
                </p>
            </div>
        `;

        document.getElementById('group-selector').addEventListener('change', (e) => {
            localStorage.setItem('activeGroupId', e.target.value);
            showSchoolMode(); // 選択が変更されたらUIを再描画
        });

        document.getElementById('add-more-group-btn').addEventListener('click', () => {
            // グループ参加・作成フォームをモーダルなどで表示する（今回は既存のフォームに切り替える簡易実装）
             mainContent.innerHTML += `
                <div id="group-join-form" class="popup-overlay" style="display: flex;">
                    <div class="popup-content">
                         <p>グループに参加するか、新しいグループを作成してください。</p>
                        <input type="text" id="group-code-input" placeholder="招待コードを入力">
                        <button id="join-group-btn">参加</button>
                        <hr>
                        <button id="create-group-btn">新しいグループを作成</button>
                        <button onclick="this.parentElement.parentElement.style.display='none'">キャンセル</button>
                    </div>
                </div>
            `;
            document.getElementById('join-group-btn').addEventListener('click', joinGroup);
            document.getElementById('create-group-btn').addEventListener('click', createGroup);
        });

        document.getElementById('leave-group-btn').addEventListener('click', leaveGroup);
        if (isOwner) {
            document.getElementById('delete-group-btn').addEventListener('click', deleteGroup);
            document.getElementById('settings-btn').addEventListener('click', showGroupSettings);
        }

        const contactBookTab = document.getElementById('contact-book-tab');
        const eventAlbumTab = document.getElementById('event-album-tab');
        const attendanceCheckTab = document.getElementById('attendance-check-tab');

        showContactBook(groupData); // 初期表示

        contactBookTab.addEventListener('click', () => {
            contactBookTab.classList.add('active');
            eventAlbumTab.classList.remove('active');
            attendanceCheckTab.classList.remove('active');
            showContactBook(groupData);
        });
        eventAlbumTab.addEventListener('click', () => {
            eventAlbumTab.classList.add('active');
            contactBookTab.classList.remove('active');
            attendanceCheckTab.classList.remove('active');
            showEventAlbum();
        });
        attendanceCheckTab.addEventListener('click', () => {
            attendanceCheckTab.classList.add('active');
            contactBookTab.classList.remove('active');
            eventAlbumTab.classList.remove('active');
            showAttendanceCheck();
        });

    } else {
        // 参加グループがない場合
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
    const postDiv = document.createElement('div');
    postDiv.className = 'post';

    const nickname = post.nickname || 'ななしさん';
    const text = post.text;
    const imageUrl = post.imageUrl;
    const reactions = post.reactions || {};
    const localUserId = localStorage.getItem('localUserId');

    const timestamp = post.createdAt ? post.createdAt.toDate().toLocaleString('ja-JP') : '...';

    let imageHTML = '';
    if (imageUrl) {
        imageHTML = `<img src="${imageUrl}" alt="投稿画像" class="post-image" onclick="openImageModal('${imageUrl}')">`;
    }

    // 投稿者本人の場合にのみ削除ボタンを表示
    const deleteButtonHTML = post.localUserId === localUserId
        ? `<button class="delete-post-btn" onclick="deletePost('${postId}')">削除</button>`
        : '';

    postDiv.innerHTML = `
        <div class="post-header">
            <strong>${nickname}</strong>
            <div class="post-meta">
                <span class="post-time">${timestamp}</span>
                ${deleteButtonHTML}
            </div>
        </div>
        <p class="post-text">${text}</p>
        ${imageHTML}
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
 * フリーモードの投稿を削除する関数
 * @param {string} postId FirestoreのドキュメントID
 */
function deletePost(postId) {
    showCustomConfirm("この投稿を本当に削除しますか？", async () => {
        try {
            await db.collection('thoughts').doc(postId).delete();
            showCustomAlert("投稿を削除しました。");
            // タイムラインはリアルタイムで更新されるため、手動での再描画は不要
        } catch (error) {
            console.error("投稿の削除に失敗しました:", error);
            showCustomAlert("投稿の削除に失敗しました。");
        }
    });
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
    const groupName = prompt("新しいグループの名前を入力してください：");
    if (!groupName) return;

    const creatorInGroupName = prompt("このグループで使うあなたの名前を入力してください：");
    if (!creatorInGroupName) return;

    const newGroupId = `dual-${Math.random().toString(36).substring(2, 8)}`;
    const localUserId = localStorage.getItem('localUserId');

    try {
        // グループ情報と、作成者のメンバー情報を同時に保存
        const groupRef = db.collection('groups').doc(newGroupId);
        await groupRef.set({
            name: groupName,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdBy: localUserId
        });

        // メンバー情報をサブコレクションに保存
        await groupRef.collection('members').doc(localUserId).set({
            inGroupName: creatorInGroupName,
            joinedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // 複数グループ管理のためにlocalStorageの構造を変更
        let groups = JSON.parse(localStorage.getItem('userGroups')) || {};
        groups[newGroupId] = { name: groupName, inGroupName: creatorInGroupName };
        localStorage.setItem('userGroups', JSON.stringify(groups));

        // 現在アクティブなグループとして設定
        localStorage.setItem('activeGroupId', newGroupId);

        showCustomAlert(`グループ「${groupName}」を作成しました！\n招待コード: ${newGroupId}`);
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
            const groupData = doc.data();
            const inGroupName = prompt(`グループ「${groupData.name}」で使うあなたの名前を入力してください：`);
            if (!inGroupName) return;

            const localUserId = localStorage.getItem('localUserId');
            await groupRef.collection('members').doc(localUserId).set({
                inGroupName: inGroupName,
                joinedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            let groups = JSON.parse(localStorage.getItem('userGroups')) || {};
            groups[groupId] = { name: groupData.name, inGroupName: inGroupName };
            localStorage.setItem('userGroups', JSON.stringify(groups));
            localStorage.setItem('activeGroupId', groupId);

            showCustomAlert(`グループ「${groupData.name}」に参加しました！`);
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
    const activeGroupId = localStorage.getItem('activeGroupId');
    if (!activeGroupId) return;

    showCustomConfirm("本当に現在のグループを抜けますか？", async () => {
        // DBから自分のメンバー情報を削除
        const localUserId = localStorage.getItem('localUserId');
        await db.collection('groups').doc(activeGroupId).collection('members').doc(localUserId).delete();

        // localStorageから該当グループ情報を削除
        let groups = JSON.parse(localStorage.getItem('userGroups')) || {};
        delete groups[activeGroupId];
        localStorage.setItem('userGroups', JSON.stringify(groups));

        // アクティブなグループIDを更新（残っているグループの最初のもの or null）
        const remainingGroupIds = Object.keys(groups);
        if (remainingGroupIds.length > 0) {
            localStorage.setItem('activeGroupId', remainingGroupIds[0]);
        } else {
            localStorage.removeItem('activeGroupId');
        }

        showCustomAlert("グループを抜けました。");
        showSchoolMode(); // UIを更新
    });
}

/**
 * グループを削除する関数（所有者のみ）
 */
async function deleteGroup() {
    const activeGroupId = localStorage.getItem('activeGroupId');
    if (!activeGroupId) return;

    showCustomConfirm("本当にこのグループを削除しますか？\nこのグループに関するすべてのデータが失われます。", async () => {
        try {
            // Firestoreからグループドキュメントを削除（サブコレクションも削除推奨だが、今回は簡易的に本体のみ）
            await db.collection('groups').doc(activeGroupId).delete();

            // localStorageから該当グループ情報を削除
            let groups = JSON.parse(localStorage.getItem('userGroups')) || {};
            delete groups[activeGroupId];
            localStorage.setItem('userGroups', JSON.stringify(groups));

            // アクティブなグループIDを更新
            const remainingGroupIds = Object.keys(groups);
            if (remainingGroupIds.length > 0) {
                localStorage.setItem('activeGroupId', remainingGroupIds[0]);
            } else {
                localStorage.removeItem('activeGroupId');
            }

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
function showContactBook(groupData) {
    const contentArea = document.getElementById('school-mode-content');
    contentArea.innerHTML = `
        <h3>連絡帳</h3>
        <div id="contact-post-form">
            <textarea id="contact-text" placeholder="メッセージを入力..." rows="3"></textarea>
            <div class="message-type-options">
                <label><input type="radio" name="message-type" value="important" checked> 大事な連絡</label>
                <label><input type="radio" name="message-type" value="emergency"> 緊急</label>
            </div>
            <button id="submit-contact-btn">送信</button>
        </div>
        <div id="contact-timeline"></div>
    `;

    document.getElementById('submit-contact-btn').addEventListener('click', submitContactMessage);
    listenForContactMessages(groupData);
}

/**
 * 連絡帳に新しいメッセージを投稿する関数
 */
async function submitContactMessage() {
    const text = document.getElementById('contact-text').value.trim();
    const type = document.querySelector('input[name="message-type"]:checked').value;
    const activeGroupId = localStorage.getItem('activeGroupId');
    const userGroups = JSON.parse(localStorage.getItem('userGroups')) || {};
    const senderInGroupName = userGroups[activeGroupId]?.inGroupName || localStorage.getItem('nickname');

    if (!text || !activeGroupId) return;

    try {
        await db.collection('groups').doc(activeGroupId).collection('messages').add({
            text: text,
            type: type,
            senderId: localStorage.getItem('localUserId'),
            senderInGroupName: senderInGroupName, // グループごとの名前を保存
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
async function listenForContactMessages(groupData) {
    const timeline = document.getElementById('contact-timeline');
    const activeGroupId = localStorage.getItem('activeGroupId');
    const groupOwnerId = groupData.createdBy;
    const localUserId = localStorage.getItem('localUserId');
    if (!timeline || !activeGroupId) return;

    // 先にメンバー情報をすべて取得してMapに格納
    const membersMap = new Map();
    const membersSnapshot = await db.collection('groups').doc(activeGroupId).collection('members').get();
    membersSnapshot.forEach(doc => {
        membersMap.set(doc.id, doc.data().inGroupName);
    });

    db.collection('groups').doc(activeGroupId).collection('messages').orderBy('createdAt', 'desc')
        .onSnapshot(snapshot => {
            timeline.innerHTML = '';
            snapshot.forEach(doc => {
                const message = doc.data();
                const messageId = doc.id;
                const senderName = membersMap.get(message.senderId) || '不明なメンバー';
                const isOwner = message.senderId === groupOwnerId;
                const crownIcon = isOwner ? '👑' : '';

                const messageDiv = document.createElement('div');
                messageDiv.className = `message-item ${message.type}`;

                const deleteButtonHTML = message.senderId === localUserId
                    ? `<button class="delete-post-btn" onclick="deleteContactMessage('${messageId}')">削除</button>`
                    : '';

                messageDiv.innerHTML = `
                    <div class="message-header">
                        <p><strong>${crownIcon}${senderName}</strong></p>
                        ${deleteButtonHTML}
                    </div>
                    <p>${message.text}</p>
                `;
                timeline.appendChild(messageDiv);
            });
        });
}

function deleteContactMessage(messageId) {
    const groupId = localStorage.getItem('groupId');
    if (!groupId) return;

    showCustomConfirm("この連絡を本当に削除しますか？", async () => {
        try {
            await db.collection('groups').doc(groupId).collection('messages').doc(messageId).delete();
            showCustomAlert("連絡を削除しました。");
        } catch (error) {
            console.error("連絡の削除に失敗しました:", error);
            showCustomAlert("連絡の削除に失敗しました。");
        }
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
    const activeGroupId = localStorage.getItem('activeGroupId');
    const userGroups = JSON.parse(localStorage.getItem('userGroups')) || {};
    const uploaderInGroupName = userGroups[activeGroupId]?.inGroupName || localStorage.getItem('nickname');

    if (!file || !activeGroupId) return;

    try {
        const imageUrl = await uploadToCloudinary(file);
        await db.collection('groups').doc(activeGroupId).collection('album').add({
            imageUrl: imageUrl,
            uploaderId: localStorage.getItem('localUserId'),
            uploaderInGroupName: uploaderInGroupName, // グループごとの名前を保存
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
    const localUserId = localStorage.getItem('localUserId');
    if (!gallery || !groupId) return;

    db.collection('groups').doc(groupId).collection('album').orderBy('createdAt', 'desc')
        .onSnapshot(snapshot => {
            gallery.innerHTML = '';
            snapshot.forEach(doc => {
                const imageData = doc.data();
                const imageId = doc.id;

                const itemDiv = document.createElement('div');
                itemDiv.className = 'gallery-item';

                const img = document.createElement('img');
                img.src = imageData.imageUrl;
                img.alt = 'アルバム画像';
                img.onclick = () => openImageModal(imageData.imageUrl);

                itemDiv.appendChild(img);

                if (imageData.uploaderId === localUserId) {
                    const deleteBtn = document.createElement('button');
                    deleteBtn.textContent = '削除';
                    deleteBtn.className = 'delete-album-btn';
                    deleteBtn.onclick = () => deleteAlbumImage(imageId);
                    itemDiv.appendChild(deleteBtn);
                }

                gallery.appendChild(itemDiv);
            });
        });
}

function deleteAlbumImage(imageId) {
    const activeGroupId = localStorage.getItem('activeGroupId');
    if (!activeGroupId) return;

    showCustomConfirm("この画像をアルバムから本当に削除しますか？", async () => {
        try {
            await db.collection('groups').doc(activeGroupId).collection('album').doc(imageId).delete();
            showCustomAlert("画像を削除しました。");
        } catch (error) {
            console.error("アルバム画像の削除に失敗しました:", error);
            showCustomAlert("画像の削除に失敗しました。");
        }
    });
}

// 8. 出欠確認機能
// =============================================

async function showAttendanceCheck() {
    const contentArea = document.getElementById('school-mode-content');
    // First, set a loading state synchronously
    contentArea.innerHTML = `<h3>出欠確認</h3><p>読み込み中...</p>`;

    // Perform async operations
    try {
        const localUserId = localStorage.getItem('localUserId');
        const activeGroupId = localStorage.getItem('activeGroupId');
        const groupDoc = await db.collection('groups').doc(activeGroupId).get();
        if (!groupDoc.exists) {
            contentArea.innerHTML = `<h3>出欠確認</h3><p>グループ情報が見つかりません。</p>`;
            return;
        }
        const groupData = groupDoc.data();
        const permissions = groupData.permissions || {};

        const isOwner = groupData.createdBy === localUserId;
        const canCreate = permissions[localUserId] && permissions[localUserId].canCreateAttendance;

        let formHTML = '';
        if (isOwner || canCreate) {
            formHTML = `
                <div id="create-attendance-form">
                    <input type="text" id="attendance-title" placeholder="イベント名">
                    <button id="create-attendance-btn">新しい出欠確認を作成</button>
                </div>
                <hr>
            `;
        }

        // Now, update the content with the final HTML
        contentArea.innerHTML = `
            <h3>出欠確認</h3>
            ${formHTML}
            <div id="attendance-check-list"></div>
        `;

        if (isOwner || canCreate) {
            document.getElementById('create-attendance-btn').addEventListener('click', createAttendanceCheck);
        }

        listenForAttendanceChecks();
    } catch (error) {
        console.error("出欠確認タブの表示エラー:", error);
        contentArea.innerHTML = `<h3>出欠確認</h3><p>表示に失敗しました。</p>`;
    }
}

async function createAttendanceCheck() {
    const title = document.getElementById('attendance-title').value.trim();
    if (!title) return;

    const activeGroupId = localStorage.getItem('activeGroupId');
    const localUserId = localStorage.getItem('localUserId');

    try {
        await db.collection('groups').doc(activeGroupId).collection('attendanceChecks').add({
            title: title,
            createdBy: localUserId,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            responses: {} // 回答を格納するオブジェクト
        });
        document.getElementById('attendance-title').value = '';
    } catch (error) {
        console.error("出欠確認の作成エラー:", error);
    }
}

async function listenForAttendanceChecks() {
    const listEl = document.getElementById('attendance-check-list');
    const activeGroupId = localStorage.getItem('activeGroupId');
    if (!listEl || !activeGroupId) return;

    db.collection('groups').doc(activeGroupId).collection('attendanceChecks').orderBy('createdAt', 'desc')
        .onSnapshot(async snapshot => {
            // 先にメンバー情報を取得
            const membersMap = new Map();
            const membersSnapshot = await db.collection('groups').doc(activeGroupId).collection('members').get();
            membersSnapshot.forEach(doc => {
                membersMap.set(doc.id, doc.data().inGroupName);
            });

            listEl.innerHTML = '';
            for (const doc of snapshot.docs) {
                const check = doc.data();
                const checkId = doc.id;

                const itemEl = document.createElement('div');
                itemEl.className = 'attendance-item';

                // 回答状況のHTMLを生成
                let responsesHTML = '<ul>';
                for (const userId in check.responses) {
                    responsesHTML += `<li>${membersMap.get(userId) || '不明'}: ${check.responses[userId]}</li>`;
                }
                responsesHTML += '</ul>';

                itemEl.innerHTML = `
                    <h4>${check.title}</h4>
                    <div class="attendance-controls">
                        <button onclick="respondToAttendance('${checkId}', '出席')">出席</button>
                        <button onclick="respondToAttendance('${checkId}', '欠席')">欠席</button>
                        <button onclick="respondToAttendance('${checkId}', '未定')">未定</button>
                    </div>
                    <div class="attendance-responses">
                        <h5>回答状況</h5>
                        ${responsesHTML}
                    </div>
                `;
                listEl.appendChild(itemEl);
            }
        });
}

async function respondToAttendance(checkId, response) {
    const activeGroupId = localStorage.getItem('activeGroupId');
    const localUserId = localStorage.getItem('localUserId');
    if (!activeGroupId) return;

    const responseField = `responses.${localUserId}`;
    try {
        await db.collection('groups').doc(activeGroupId).collection('attendanceChecks').doc(checkId).update({
            [responseField]: response
        });
    } catch (error) {
        console.error("出欠確認の回答エラー:", error);
    }
}

// 9. グループ設定機能
// =============================================

async function showGroupSettings() {
    const activeGroupId = localStorage.getItem('activeGroupId');
    const groupDoc = await db.collection('groups').doc(activeGroupId).get();
    const groupData = groupDoc.data();
    const permissions = groupData.permissions || {};

    const membersSnapshot = await db.collection('groups').doc(activeGroupId).collection('members').get();

    let membersHTML = '<h4>メンバー権限管理</h4>';
    membersSnapshot.forEach(doc => {
        const memberId = doc.id;
        const memberName = doc.data().inGroupName;
        const canCreateAttendance = permissions[memberId] && permissions[memberId].canCreateAttendance;

        membersHTML += `
            <div>
                <label>
                    <input type="checkbox" class="permission-checkbox" data-member-id="${memberId}" ${canCreateAttendance ? 'checked' : ''}>
                    ${memberName}に出欠確認の作成を許可
                </label>
            </div>
        `;
    });

    const popupContent = `
        ${membersHTML}
        <button id="save-permissions-btn">保存</button>
        <button onclick="this.parentElement.parentElement.style.display='none'">閉じる</button>
    `;

    // 既存のポップアップを流用
    const popup = document.getElementById('custom-popup');
    popup.querySelector('.popup-content').innerHTML = popupContent;
    popup.style.display = 'flex';

    document.getElementById('save-permissions-btn').addEventListener('click', updatePermissions);
}

async function updatePermissions() {
    const activeGroupId = localStorage.getItem('activeGroupId');
    const checkboxes = document.querySelectorAll('.permission-checkbox');

    const newPermissions = {};
    checkboxes.forEach(cb => {
        const memberId = cb.dataset.memberId;
        newPermissions[memberId] = {
            canCreateAttendance: cb.checked
        };
    });

    try {
        await db.collection('groups').doc(activeGroupId).update({
            permissions: newPermissions
        });
        showCustomAlert("権限を更新しました。");
        document.getElementById('custom-popup').style.display = 'none';
    } catch (error) {
        console.error("権限の更新エラー:", error);
        showCustomAlert("権限の更新に失敗しました。");
    }
}

// 7. 画像モーダル機能
// =============================================

/**
 * 画像モーダルを開く関数
 * @param {string} imageUrl 表示する画像のURL
 */
function openImageModal(imageUrl) {
    const modal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image-content');

    modalImage.src = imageUrl;
    modal.style.display = 'flex';
}

// モーダルを閉じるためのイベントリスナー
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('image-modal');
    if (modal) {
        modal.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
});
