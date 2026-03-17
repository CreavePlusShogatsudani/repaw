import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showAndroidBanner, setShowAndroidBanner] = useState(false);
  const [showIOSBanner, setShowIOSBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('pwa-banner-dismissed')) return;

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (isStandalone) return;

    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isSafari = /safari/i.test(navigator.userAgent) && !/chrome/i.test(navigator.userAgent);
    if (isIOS && isSafari) {
      const timer = setTimeout(() => {
        setShowIOSBanner(true);
        setTimeout(() => setVisible(true), 50);
      }, 3000);
      return () => clearTimeout(timer);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowAndroidBanner(true);
      setTimeout(() => setVisible(true), 50);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') handleDismiss();
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => {
      setDismissed(true);
      setShowAndroidBanner(false);
      setShowIOSBanner(false);
    }, 300);
    sessionStorage.setItem('pwa-banner-dismissed', '1');
  };

  if (dismissed) return null;
  if (!showAndroidBanner && !showIOSBanner) return null;

  return (
    <>
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 z-40 bg-black/40 transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
        onClick={handleDismiss}
      />

      {/* バナー本体 */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out"
        style={{ transform: visible ? 'translateY(0)' : 'translateY(100%)' }}
      >
        <div className="bg-white rounded-t-3xl shadow-2xl overflow-hidden">
          {/* オレンジアクセントライン */}
          <div className="h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400" />

          <div className="px-6 pt-6 pb-8">
            {/* ヘッダー */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                {/* アイコン */}
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <span
                    className="text-white font-bold text-3xl"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    R
                  </span>
                </div>
                <div>
                  <p
                    className="text-xl font-bold text-gray-900 leading-tight"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    RePaw
                  </p>
                  <p className="text-xs text-orange-500 font-medium tracking-wider mt-0.5">
                    犬服のリユースプラットフォーム
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors mt-1"
              >
                <i className="ri-close-line text-2xl" />
              </button>
            </div>

            {showAndroidBanner && (
              <>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  ホーム画面に追加すると、アプリとしてすばやく起動できます。
                </p>
                {/* 特徴リスト */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { icon: 'ri-flashlight-line', label: '高速起動' },
                    { icon: 'ri-notification-3-line', label: '通知対応' },
                    { icon: 'ri-wifi-off-line', label: 'オフライン' },
                  ].map((f) => (
                    <div key={f.label} className="flex flex-col items-center gap-1.5 bg-gray-50 rounded-xl py-3">
                      <i className={`${f.icon} text-xl text-orange-500`} />
                      <span className="text-xs text-gray-600 font-medium">{f.label}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleInstall}
                  className="w-full py-4 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 active:bg-gray-900 transition-colors tracking-wide"
                >
                  ホーム画面に追加する
                </button>
              </>
            )}

            {showIOSBanner && (
              <>
                <p className="text-sm text-gray-600 leading-relaxed mb-5">
                  Safari のメニューからホーム画面に追加すると、アプリとして使えます。
                </p>
                {/* ステップ */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-4 bg-gray-50 rounded-xl px-4 py-3">
                    <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-900">「共有」ボタンをタップ</p>
                      <p className="text-xs text-gray-500 mt-0.5">ブラウザ下部の <i className="ri-share-line" /> アイコン</p>
                    </div>
                    <i className="ri-share-line text-2xl text-orange-500 flex-shrink-0" />
                  </div>
                  <div className="flex items-center gap-4 bg-gray-50 rounded-xl px-4 py-3">
                    <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-900">「ホーム画面に追加」を選択</p>
                      <p className="text-xs text-gray-500 mt-0.5">リストをスクロールして探してください</p>
                    </div>
                    <i className="ri-add-box-line text-2xl text-orange-500 flex-shrink-0" />
                  </div>
                </div>
                <button
                  onClick={handleDismiss}
                  className="w-full py-4 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  閉じる
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
