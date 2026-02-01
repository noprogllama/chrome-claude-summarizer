// デフォルト設定
const DEFAULT_MODEL = 'claude-sonnet-4-5-20250929';
const DEFAULT_PROMPT = `「{pageTitle}」の要約

以下のURLのページを要約してください。
{url}

【重要：ウェブサイトの取得方法】
必ずweb fetch toolを使用してページの内容を取得してください。これは絶対に省略しないでください。
アクセスできなさそうに見えても、必ず一度はweb fetch tool（raw=true オプション）での取得を試みてください。
推測や既存の知識だけで要約せず、実際にページを取得してから要約を行ってください。

【要約のルール】
1. 要約の最初に、ページ内で使われているアルファベット略語（例: CSS, API, MVCCなど）の用語集を作成してください。各用語について以下を記載：
   - 略語
   - フルネーム（正式名称）
   - 簡単な意味の説明

2. 難しい概念は図（アスキーアートやその他あなたが表現できる図の出力方法）を使って視覚的に説明してください。

3. 小学生でも理解できるよう、なるべく平易な言葉で説明してください。専門用語を使う場合は必ず噛み砕いた説明を添えてください。

4. 最後に、この文脈でもっと知るべきであることがあれば、それをサジェストしてください。その際、番号を振って、ユーザーが選びやすいようにして提供すること。`;

// ショートカットキーのリスナー
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "summarize-page") {
    await summarizeCurrentPage();
  }
});

// ポップアップからのメッセージリスナー
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "summarize") {
    summarizeCurrentPage().then(() => {
      sendResponse({ success: true });
    }).catch((error) => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // 非同期レスポンスを示す
  }
});

async function summarizeCurrentPage() {
  // 現在のアクティブタブを取得
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab || !tab.url) {
    throw new Error("タブのURLを取得できませんでした");
  }

  // claude.ai自体のURLは除外
  if (tab.url.startsWith("https://claude.ai")) {
    throw new Error("claude.aiのページは要約できません");
  }

  // 設定を読み込み
  const settings = await chrome.storage.sync.get({
    model: DEFAULT_MODEL,
    prompt: DEFAULT_PROMPT
  });

  // ページタイトルを取得（なければURLのホスト名を使用）
  const pageTitle = tab.title || new URL(tab.url).hostname;

  // プロンプト内の変数を置換
  const prompt = settings.prompt
    .replace(/\{pageTitle\}/g, pageTitle)
    .replace(/\{url\}/g, tab.url);

  // URLエンコードしてclaude.aiのURLを構築
  // model パラメータで選択されたモデルを指定
  // #autosubmit フラグを追加して自動送信を指示
  const claudeUrl = `https://claude.ai/new?model=${settings.model}&q=${encodeURIComponent(prompt)}#autosubmit`;

  // 新しいタブでclaude.aiを開く
  await chrome.tabs.create({ url: claudeUrl });
}
