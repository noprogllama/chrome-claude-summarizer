// デフォルトのプロンプト
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

const DEFAULT_MODEL = 'claude-sonnet-4-5-20250929';

// DOM要素
const modelSelect = document.getElementById('model');
const promptTextarea = document.getElementById('prompt');
const saveButton = document.getElementById('save');
const resetButton = document.getElementById('reset');
const statusDiv = document.getElementById('status');

// 設定を読み込み
async function loadSettings() {
  const result = await chrome.storage.sync.get({
    model: DEFAULT_MODEL,
    prompt: DEFAULT_PROMPT
  });

  modelSelect.value = result.model;
  promptTextarea.value = result.prompt;
}

// 設定を保存
async function saveSettings() {
  const settings = {
    model: modelSelect.value,
    prompt: promptTextarea.value
  };

  try {
    await chrome.storage.sync.set(settings);
    showStatus('設定を保存しました', 'success');
  } catch (error) {
    showStatus('保存に失敗しました: ' + error.message, 'error');
  }
}

// デフォルトに戻す
async function resetSettings() {
  modelSelect.value = DEFAULT_MODEL;
  promptTextarea.value = DEFAULT_PROMPT;
  await saveSettings();
}

// ステータス表示
function showStatus(message, type) {
  statusDiv.textContent = message;
  statusDiv.className = 'status ' + type;

  setTimeout(() => {
    statusDiv.className = 'status';
  }, 3000);
}

// イベントリスナー
saveButton.addEventListener('click', saveSettings);
resetButton.addEventListener('click', resetSettings);

// 初期化
loadSettings();
