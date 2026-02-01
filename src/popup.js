document.getElementById("summarize").addEventListener("click", async () => {
  const button = document.getElementById("summarize");
  const errorDiv = document.getElementById("error");

  button.disabled = true;
  button.textContent = "処理中...";
  errorDiv.textContent = "";

  try {
    const response = await chrome.runtime.sendMessage({ action: "summarize" });

    if (response.success) {
      window.close();
    } else {
      errorDiv.textContent = response.error || "エラーが発生しました";
      button.disabled = false;
      button.textContent = "Claudeで要約";
    }
  } catch (error) {
    errorDiv.textContent = error.message || "エラーが発生しました";
    button.disabled = false;
    button.textContent = "Claudeで要約";
  }
});
