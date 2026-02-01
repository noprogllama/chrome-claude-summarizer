// claude.ai上で動作するContent Script
// #autosubmitフラグがある場合、自動的にメッセージを送信

(function() {
  // 自動送信フラグを確認
  if (!window.location.hash.includes("autosubmit")) {
    return;
  }

  // フラグをURLから削除（履歴をきれいに保つ）
  history.replaceState(null, "", window.location.pathname + window.location.search);

  console.log("Claude Summarizer: 自動送信モードを開始");

  // 送信ボタンのセレクター（aria-labelで特定）
  const SEND_BUTTON_SELECTOR = 'button[aria-label="メッセージを送信"]';

  // 入力欄のセレクター（ProseMirrorエディタ）
  const INPUT_SELECTOR = '[data-testid="chat-input"]';

  // 最大待機時間（ミリ秒）
  const MAX_WAIT_TIME = 15000;
  const CHECK_INTERVAL = 300;

  async function waitForEnabledSendButton(timeout = MAX_WAIT_TIME) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const button = document.querySelector(SEND_BUTTON_SELECTOR);

      // ボタンが存在し、disabledでないことを確認
      if (button && !button.disabled && !button.hasAttribute('disabled')) {
        console.log("Claude Summarizer: 送信ボタンが有効になりました");
        return button;
      }

      await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
    }

    console.log("Claude Summarizer: 送信ボタンのタイムアウト");
    return null;
  }

  async function checkInputHasContent() {
    const input = document.querySelector(INPUT_SELECTOR);
    if (!input) return false;

    // ProseMirrorエディタの場合、テキストコンテンツを確認
    const text = input.textContent || input.innerText || "";
    return text.trim().length > 0;
  }

  async function triggerSend() {
    console.log("Claude Summarizer: 送信処理を開始");

    // 入力欄にコンテンツが入るまで少し待機
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 入力欄にコンテンツがあるか確認
    const hasContent = await checkInputHasContent();
    if (!hasContent) {
      console.log("Claude Summarizer: 入力欄にコンテンツがありません。さらに待機...");
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // 送信ボタンが有効になるまで待機
    const sendButton = await waitForEnabledSendButton();

    if (sendButton) {
      console.log("Claude Summarizer: 送信ボタンをクリックします");

      // クリックイベントを発火
      sendButton.click();

      // クリックが効かない場合に備えて、マウスイベントも試す
      setTimeout(() => {
        if (document.querySelector(SEND_BUTTON_SELECTOR)) {
          const mouseEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
          });
          sendButton.dispatchEvent(mouseEvent);
        }
      }, 500);

      return;
    }

    // フォールバック: Enterキーイベントを試す
    console.log("Claude Summarizer: Enterキーで送信を試みます");
    const input = document.querySelector(INPUT_SELECTOR);

    if (input) {
      input.focus();

      // Enterキーイベントを発火（keydown + keyup）
      const keydownEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true
      });

      const keyupEvent = new KeyboardEvent('keyup', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true
      });

      input.dispatchEvent(keydownEvent);
      input.dispatchEvent(keyupEvent);
    }
  }

  // ページ読み込み完了後に実行
  if (document.readyState === 'complete') {
    triggerSend();
  } else {
    window.addEventListener('load', triggerSend);
  }
})();
