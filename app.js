document.addEventListener('DOMContentLoaded', () => {
    // グローバル変数
    let testUser = null;
    

    // DOM要素
    const selectionScreen = document.getElementById('selection-screen');
    const authScreens = document.getElementById('auth-screens');
    const authButtons = document.querySelectorAll('.auth-btn');
    const backButtons = document.querySelectorAll('.back-btn');

    /**
     * ユーザーデータを読み込み、デコードする
     */
    async function loadUserData() {
        try {
            const response = await fetch('userdata.txt');
            if (!response.ok) {
                throw new Error('ユーザーデータの読み込みに失敗しました。');
            }
            const base64Data = await response.text();
            // Base64デコード (atob) して、JSONとしてパースする
            testUser = JSON.parse(atob(base64Data));
            console.log('テストユーザー情報を読み込みました:', testUser);
        } catch (error) {
            console.error(error);
            alert('致命的なエラー: ユーザー情報が取得できません。');
        }
    }

    /**
     * 指定された画面に切り替える
     * @param {string | null} screenId 表示する画面のID。nullの場合は選択画面を表示
     */
    function switchScreen(screenId) {
        // 全てのスクリーンを非表示に
        selectionScreen.classList.remove('active');
        document.querySelectorAll('.screen').forEach(screen => {
            if (screen.id !== 'selection-screen') { // selection-screen自体はauth-screensの外にあるので個別対応
                 screen.classList.remove('active');
            }
        });

        if (screenId) {
            const targetScreen = document.getElementById(screenId);
            if (targetScreen) {
                targetScreen.classList.add('active');
            }
        } else {
            selectionScreen.classList.add('active');
        }
    }

    /**
     * 認証成功時の処理
     */
    function authenticationSuccess() {
        console.log('認証に成功しました。');
        // TODO: 遷移先のページはここで変更可能です
        window.location.href = 'maindata.html';
    }

    // --- イベントリスナー ---

    // グローバル変数 (カメラストリーム管理用)
    let currentStream = null;

    // 認証方法選択ボタン
    authButtons.forEach(button => {
        button.addEventListener('click', () => {
            const layer = button.dataset.layer;
            switchScreen(`layer-${layer}-screen`);
            // 各レイヤーの初期化処理
            if (layer === '1') {
                initializeLayer1();
            } else if (layer === '2') {
                initializeLayer2();
            } else if (layer === '3') {
                initializeLayer3();
            } else if (layer === '4') {
                initializeLayer4();
            }
        });
    });

    // 戻るボタン
    backButtons.forEach(button => {
        button.addEventListener('click', () => {
            switchScreen(null);
            // カメラを使っているレイヤーの場合、ストリームを停止する
            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop());
                currentStream = null;
            }
        });
    });


    // --- 各レイヤーの処理 ---

    /**
     * レイヤー2: パスワード認証の初期化とロジック
     */
    function initializeLayer2() {
        const loginBtn = document.getElementById('login-btn');
        const userIdInput = document.getElementById('user-id');
        const userPwInput = document.getElementById('user-pw');
        const errorMessage = document.getElementById('login-error');

        errorMessage.textContent = ''; // エラーメッセージをクリア
        userIdInput.value = '';
        userPwInput.value = '';

        // NOTE: イベントリスナーが重複して登録されるのを防ぐため、一度古いリスナーを削除する
        const newLoginBtn = loginBtn.cloneNode(true);
        loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);

        newLoginBtn.addEventListener('click', () => {
            const id = userIdInput.value;
            const pw = userPwInput.value;

            if (testUser && id === testUser.id && pw === testUser.pw) {
                authenticationSuccess();
            } else {
                errorMessage.textContent = 'ユーザーIDまたはパスワードが正しくありません。';
                userIdInput.value = '';
                userPwInput.value = '';
            }
        });
    }

    // --- 初期化処理 ---

    // アプリケーションの初期化
    async function initialize() {
        await loadUserData();
        // 初期画面を表示
        switchScreen(null);
    }

    /**
     * レイヤー1: QRコード認証の初期化とロジック
     */
    async function initializeLayer1() {
        const video = document.getElementById('qr-video');
        const canvasElement = document.getElementById('qr-canvas');
        const canvas = canvasElement.getContext('2d');
        const noCameraFallback = document.getElementById('qr-no-camera');
        let animationFrameId;

        try {
            // カメラアクセス
            currentStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            video.srcObject = currentStream;
            video.setAttribute("playsinline", true); // iOS Safari対策
            video.play();
            animationFrameId = requestAnimationFrame(tick);
        } catch (err) {
            console.error("カメラアクセスエラー:", err);
            noCameraFallback.style.display = 'block';

            // 代替QRコードの生成
            const qrCodeContainer = document.getElementById('fallback-qr-code');
            qrCodeContainer.innerHTML = ''; // 既存のQRコードをクリア
            new QRCode(qrCodeContainer, {
                text: "https://example.com/auth_success?user=" + testUser.id,
                width: 128,
                height: 128,
            });

            // ダミーのポーリング処理で認証をシミュレート
            setTimeout(() => {
                authenticationSuccess();
            }, 5000); // 5秒後に自動で成功
        }

        function tick() {
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                canvasElement.height = video.videoHeight;
                canvasElement.width = video.videoWidth;
                canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
                const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: "dontInvert",
                });

                if (code) {
                    // QRコードを検出したらストリームを停止し、認証成功
                    cancelAnimationFrame(animationFrameId);
                    currentStream.getTracks().forEach(track => track.stop());
                    currentStream = null;
                    authenticationSuccess();
                    return;
                }
            }
            animationFrameId = requestAnimationFrame(tick);
        }
    }

    /**
     * レイヤー3: 多要素認証の初期化とロジック
     */
    function initializeLayer3() {
        const step1 = document.getElementById('mfa-step-1');
        const step2 = document.getElementById('mfa-step-2');
        const loginBtn = document.getElementById('mfa-login-btn');
        const userIdInput = document.getElementById('mfa-user-id');
        const userPwInput = document.getElementById('mfa-user-pw');
        const errorMessage = document.getElementById('mfa-error');
        const patternContainer = document.getElementById('pattern-lock-container');

        // 初期状態にリセット
        step1.style.display = 'block';
        step2.style.display = 'none';
        errorMessage.textContent = '';
        userIdInput.value = '';
        userPwInput.value = '';

        // パスワード認証
        loginBtn.onclick = () => {
            if (testUser && userIdInput.value === testUser.id && userPwInput.value === testUser.pw) {
                step1.style.display = 'none';
                step2.style.display = 'block';
                createPatternLock();
            } else {
                errorMessage.textContent = 'ユーザーIDまたはパスワードが正しくありません。';
            }
        };

        // パターンロックの生成とロジック
        function createPatternLock() {
            patternContainer.innerHTML = '';
            let selectedDots = [];
            const correctPattern = '1-2-3-6-9';

            for (let i = 1; i <= 9; i++) {
                const dot = document.createElement('div');
                dot.className = 'pattern-dot';
                dot.dataset.id = i;
                dot.addEventListener('mousedown', () => {
                    if (!selectedDots.includes(i)) {
                        dot.classList.add('active');
                        selectedDots.push(i);
                    }
                });
                patternContainer.appendChild(dot);
            }

            // パターン入力完了（マウスボタンを離したとき）
            document.body.onmouseup = () => {
                if (selectedDots.length > 0) {
                    const enteredPattern = selectedDots.join('-');
                    if (enteredPattern === correctPattern) {
                        authenticationSuccess();
                    } else {
                        errorMessage.textContent = 'パターンが正しくありません。';
                        // UIをリセット
                        setTimeout(() => {
                           initializeLayer3();
                        }, 500);
                    }
                    selectedDots = [];
                }
                 // イベントリスナーを一度きりにするため解除
                document.body.onmouseup = null;
            };
        }
    }

    /**
     * レイヤー4: 顔・虹彩認証の初期化とロジック
     */
    let faceApiModelsLoaded = false;
    async function loadFaceApiModels() {
        if (faceApiModelsLoaded) return;
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights';
        try {
            await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
            await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
            console.log('FaceAPIモデルの読み込み完了');
            faceApiModelsLoaded = true;
        } catch (error) {
            console.error('FaceAPIモデルの読み込みに失敗しました:', error);
        }
    }

    async function initializeLayer4() {
        await loadFaceApiModels();
        if (!faceApiModelsLoaded) {
            alert('顔認証ライブラリの読み込みに失敗しました。');
            return;
        }

        const video = document.getElementById('face-video');
        const canvas = document.getElementById('face-canvas');
        const statusEl = document.getElementById('face-status');
        const noCameraFallback = document.getElementById('face-no-camera');
        const context = canvas.getContext('2d');
        let intervalId;

        statusEl.textContent = 'カメラを起動中...';

        try {
            currentStream = await navigator.mediaDevices.getUserMedia({ video: {} });
            video.srcObject = currentStream;
            video.play();
        } catch (err) {
            console.error("カメラアクセスエラー:", err);
            noCameraFallback.style.display = 'block';
             // 代替QRコードの生成
            const qrCodeContainer = document.getElementById('fallback-qr-code-face');
            qrCodeContainer.innerHTML = '';
            new QRCode(qrCodeContainer, {
                text: "https://example.com/auth_success?user=" + testUser.id,
                width: 128,
                height: 128,
            });
            setTimeout(() => {
                authenticationSuccess();
            }, 5000);
            return;
        }

        video.addEventListener('play', () => {
            const displaySize = { width: video.clientWidth, height: video.clientHeight };
            faceapi.matchDimensions(canvas, displaySize);

            let scanStep = 'face'; // 'face', 'scar', 'iris'
            statusEl.textContent = '顔をカメラに向けてください';

            intervalId = setInterval(async () => {
                const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
                context.clearRect(0, 0, canvas.width, canvas.height);

                if (detections) {
                    const resizedDetections = faceapi.resizeResults(detections, displaySize);
                    faceapi.draw.drawDetections(canvas, resizedDetections);

                    if (scanStep === 'face') {
                        statusEl.textContent = '顔を認識しました... 傷をスキャン中...';
                        scanStep = 'scar';
                        // 傷スキャン演出
                        setTimeout(() => {
                            if (scanStep === 'scar') {
                                const landmarks = resizedDetections.landmarks;
                                const nose = landmarks.getNose();
                                // 額の中心あたりにスキャンアニメーションを描画
                                context.fillStyle = 'rgba(0, 255, 255, 0.5)';
                                context.fillRect(nose[0]._x - 20, nose[0]._y - 50, 40, 10);

                                statusEl.textContent = '虹彩をスキャン中...';
                                scanStep = 'iris';

                                // 虹彩スキャン演出
                                setTimeout(() => {
                                    if(scanStep === 'iris') {
                                        const leftEye = landmarks.getLeftEye();
                                        const rightEye = landmarks.getRightEye();
                                        context.beginPath();
                                        context.arc(leftEye[0]._x, leftEye[0]._y, 10, 0, 2 * Math.PI);
                                        context.arc(rightEye[3]._x, rightEye[3]._y, 10, 0, 2 * Math.PI);
                                        context.strokeStyle = 'cyan';
                                        context.lineWidth = 2;
                                        context.stroke();

                                        // 認証成功
                                        clearInterval(intervalId);
                                        if (currentStream) {
                                            currentStream.getTracks().forEach(track => track.stop());
                                            currentStream = null;
                                        }
                                        authenticationSuccess();
                                    }
                                }, 1500); // 1.5秒後に虹彩スキャン完了
                            }
                        }, 1500); // 1.5秒後に傷スキャン完了
                    }
                }
            }, 100);
        });

        // 戻るボタンが押されたときのために、intervalIdをグローバルで管理
        const backBtn = document.querySelector('#layer-4-screen .back-btn');
        backBtn.addEventListener('click', () => {
            clearInterval(intervalId);
        }, { once: true });
    }

    initialize();
});
