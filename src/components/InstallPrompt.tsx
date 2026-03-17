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

  useEffect(() => {
    // すでに閉じたことがある場合は表示しない
    if (sessionStorage.getItem('pwa-banner-dismissed')) return;

    // すでにインストール済みの場合は表示しない
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (isStandalone) return;

    // iOS Safari の判定
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isSafari = /safari/i.test(navigator.userAgent) && !/chrome/i.test(navigator.userAgent);
    if (isIOS && isSafari) {
      // 少し遅延してから表示
      const timer = setTimeout(() => setShowIOSBanner(true), 3000);
      return () => clearTimeout(timer);
    }

    // Android / Chrome の beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowAndroidBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowAndroidBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowAndroidBanner(false);
    setShowIOSBanner(false);
    sessionStorage.setItem('pwa-banner-dismissed', '1');
  };

  if (dismissed) return null;

  // Android / Chrome 用バナー
  if (showAndroidBanner) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl px-4 py-4 flex items-center gap-3 safe-area-bottom">
        <div className="flex-shrink-0 w-12 h-12 bg-black rounded-xl flex items-center justify-center">
          <span className="text-white font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>R</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900">RePawをインストール</p>
          <p className="text-xs text-gray-500">ホーム画面に追加してアプリとして使えます</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleInstall}
            className="px-4 py-2 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            追加する
          </button>
          <button
            onClick={handleDismiss}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>
      </div>
    );
  }

  // iOS Safari 用バナー
  if (showIOSBanner) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl px-4 py-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <span className="text-white font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>R</span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">RePawをホーム画面に追加</p>
              <p className="text-xs text-gray-500">アプリのように使えます</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-3 text-xs text-gray-700">
            <div className="w-6 h-6 flex items-center justify-center bg-blue-100 rounded-md flex-shrink-0">
              <i className="ri-share-line text-blue-600 text-sm"></i>
            </div>
            <span><span className="font-semibold">1.</span> 画面下の「共有」ボタン（<i className="ri-share-line"></i>）をタップ</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-700">
            <div className="w-6 h-6 flex items-center justify-center bg-blue-100 rounded-md flex-shrink-0">
              <i className="ri-add-box-line text-blue-600 text-sm"></i>
            </div>
            <span><span className="font-semibold">2.</span>「ホーム画面に追加」を選択してください</span>
          </div>
        </div>
        {/* iOS の矢印インジケーター */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0" style={{
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '8px solid white',
        }}></div>
      </div>
    );
  }

  return null;
}
