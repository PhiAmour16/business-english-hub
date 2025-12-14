/**
 * storage.js
 * 負責處理瀏覽器 localStorage 的讀取、寫入與管理。
 */

// ----------------------
// A. 單字本 (Word Bank) 相關功能
// ----------------------

/**
 * 從 localStorage 取得單字本資料。
 * @returns {Array} 單字物件陣列。
 */
function getWordBank() {
    const data = localStorage.getItem('wordBank');
    return data ? JSON.parse(data) : [];
}

/**
 * 將單字加入單字本。
 * @param {string} word - 單字本身。
 * @param {string} partOfSpeech - 詞性。
 * @param {string} definition - 簡短定義。
 * @param {string} example - 例句。
 * @param {string} source - 出處 (例如：Video 1)。
 */
function addToWordBank(word, partOfSpeech, definition, example, source) {
    let wordBank = getWordBank();
    const newWord = { word, partOfSpeech, definition, example, source, dateAdded: new Date().toISOString() };

    // 檢查單字是否已存在，避免重複加入
    if (!wordBank.some(item => item.word.toLowerCase() === word.toLowerCase())) {
        wordBank.push(newWord);
        localStorage.setItem('wordBank', JSON.stringify(wordBank));
        console.log(`單字 "${word}" 已加入單字本。`);
        return true; // 成功加入
    } else {
        console.log(`單字 "${word}" 已存在於單字本中。`);
        return false; // 已存在
    }
}

/**
 * 清空單字本資料。
 */
function clearWordBank() {
    if (confirm('確定要清空整個單字本嗎？此操作無法復原。')) {
        localStorage.removeItem('wordBank');
        console.log('單字本已清空。');
        // 可選：重新載入頁面以更新顯示
        if (document.getElementById('word-bank-list')) {
            window.location.reload();
        }
        alert('單字本已清空！');
    }
}


// ----------------------
// B. 錯題本 (Error Review) 相關功能
// ----------------------

/**
 * 從 localStorage 取得錯題本資料。
 * @returns {Array} 錯題物件陣列。
 */
function getErrorReview() {
    const data = localStorage.getItem('errorReview');
    return data ? JSON.parse(data) : [];
}

/**
 * 紀錄錯誤題目到錯題本。
 * @param {string} questionId - 題目在頁面上的唯一 ID (例如：q1)。
 * @param {string} questionText - 題目文字。
 * @param {string} userAnswer - 使用者選擇的答案。
 * @param {string} correctAnswer - 正確答案。
 * @param {string} source - 出處 (例如：Video 1)。
 */
function recordError(questionId, questionText, userAnswer, correctAnswer, source) {
    let errorReview = getErrorReview();

    // 錯題物件
    const newError = {
        id: questionId,
        question: questionText,
        userAnswer: userAnswer,
        correctAnswer: correctAnswer,
        source: source,
        dateRecorded: new Date().toISOString()
    };

    // 為了避免重複記錄同一道錯題，我們檢查 ID 是否已存在
    // (注意：在生產環境中，可能需要更複雜的檢查邏輯)
    if (!errorReview.some(item => item.id === questionId)) {
        errorReview.push(newError);
        localStorage.setItem('errorReview', JSON.stringify(errorReview));
        console.log(`錯題 "${questionId}" 已記錄。`);
    }
}
// 添加到 assets/js/storage.js 中

/**
 * 清空錯題本資料。
 */
function clearErrorReview() {
    if (confirm('確定要清空所有錯題紀錄嗎？此操作無法復原。')) {
        localStorage.removeItem('errorReview');
        console.log('錯題本已清空。');
        
        // 重新載入頁面以更新顯示
        if (document.getElementById('error-review-list')) {
            window.location.reload();
        }
        alert('所有錯題紀錄已清空！');
    }
}

// ----------------------
// C. 學習工具區頁面顯示功能 (供 vocabulary.html / errors.html 使用)
// ----------------------

/**
 * 渲染單字本頁面內容 (供 vocabulary.html 載入)
 */
function renderWordBankPage() {
    const listContainer = document.getElementById('word-bank-list');
    if (!listContainer) return;

    const wordBank = getWordBank();
    listContainer.innerHTML = ''; // 清空載入訊息

    if (wordBank.length === 0) {
        listContainer.innerHTML = '<p style="text-align: center; margin-top: 30px; color: var(--light-text-color);">您的單字本目前是空的。在課程頁面點擊「加入單字本」按鈕來新增詞彙吧！</p>';
        return;
    }

    wordBank.forEach((item, index) => {
        const itemHtml = `
            <div class="word-item">
                <input type="checkbox" id="word-${index}" ${item.isMastered ? 'checked' : ''} onchange="toggleMastered('${item.word}')">
                <label for="word-${index}">
                    <strong>${item.word}</strong> (${item.partOfSpeech}) - ${item.definition}
                    <span class="source">出處：${item.source}</span>
                    <p class="example-sentence example">${item.example}</p>
                </label>
            </div>
        `;
        listContainer.innerHTML += itemHtml;
    });
}

/**
 * 渲染錯題本頁面內容 (供 errors.html 載入)
 */
function renderErrorReviewPage() {
    const listContainer = document.getElementById('error-review-list');
    if (!listContainer) return;

    const errorReview = getErrorReview();
    listContainer.innerHTML = ''; // 清空載入訊息

    if (errorReview.length === 0) {
        listContainer.innerHTML = '<p style="text-align: center; margin-top: 30px; color: var(--light-text-color);">太棒了！您目前沒有錯誤紀錄。</p>';
        return;
    }

    errorReview.forEach(item => {
        const itemHtml = `
            <div class="error-item">
                <h4>${item.source}: ${item.question}</h4>
                <p class="user-answer">您的答案：${item.userAnswer}</p>
                <p class="correct-answer">正確答案：${item.correctAnswer}</p>
                <p class="explanation">紀錄於：${new Date(item.dateRecorded).toLocaleDateString()}</p>
            </div>
        `;
        listContainer.innerHTML += itemHtml;
    });
}

/**
 * 切換單字是否已熟悉 (Word Bank 頁面用)
 * @param {string} word - 要切換的單字。
 */
function toggleMastered(word) {
    let wordBank = getWordBank();
    const index = wordBank.findIndex(item => item.word === word);
    if (index !== -1) {
        // 切換 isMastered 狀態，若不存在則設為 true
        wordBank[index].isMastered = !wordBank[index].isMastered; 
        localStorage.setItem('wordBank', JSON.stringify(wordBank));
        console.log(`${word} 的熟悉狀態已切換。`);
    }
}

// ----------------------
// D. 頁面載入時的呼叫
// ----------------------

// 根據當前頁面的 URL 來判斷需要渲染哪個工具頁
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    if (path.includes('vocabulary.html')) {
        renderWordBankPage();
    } else if (path.includes('errors.html')) {
        renderErrorReviewPage();
    }
});