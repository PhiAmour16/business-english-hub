/**
 * lesson.js
 * 負責處理單一課程頁面 (lesson-template.html) 的所有互動。
 * 假設每個課程頁面都有一個 data-lesson-id 屬性來識別課程，例如：
 * <main data-lesson-id="Video 1">...</main>
 * 且課程中所有單字和題目都已硬編碼在 HTML 中。
 */

// 確保 storage.js 的函數在此腳本中是可用的
// 如果您在 HTML 中是分開引入的，則此處不需要再次定義或引入。

document.addEventListener('DOMContentLoaded', () => {
    // 取得當前課程 ID
    const lessonContainer = document.querySelector('main');
    const lessonId = lessonContainer ? lessonContainer.dataset.lessonId : 'Unknown Source';

    // 1. 設定單字本加入按鈕的事件監聽
    setupVocabularyButtons(lessonId);

    // 2. 設定測驗檢查按鈕的事件監聽
    setupQuizChecking(lessonId);
});


// ----------------------
// A. 單字本按鈕功能
// ----------------------

function setupVocabularyButtons(lessonId) {
    // 選擇所有帶有 data-add-word 屬性的按鈕
    document.querySelectorAll('.btn-add-word').forEach(button => {
        button.addEventListener('click', function() {
            // 從按鈕的 data 屬性中提取單字資訊
            const word = this.dataset.word;
            const pos = this.dataset.pos;
            const definition = this.dataset.definition;
            const example = this.dataset.example;

            if (word && addToWordBank(word, pos, definition, example, lessonId)) {
                // 如果成功加入，可以給予視覺回饋
                this.textContent = '已加入 ✅';
                this.disabled = true;
                setTimeout(() => {
                    alert(`${word} 已成功加入您的單字本！`);
                }, 100);
            } else if (word) {
                 alert(`單字 "${word}" 已經在單字本中了。`);
            }
        });
    });
}

// ----------------------
// B. 理解測驗功能
// ----------------------

function setupQuizChecking(lessonId) {
    const checkButton = document.getElementById('check-answers');
    if (!checkButton) return;

    checkButton.addEventListener('click', function() {
        let correctCount = 0;
        let totalCount = 0;

        // 遍歷所有測驗題目容器
        document.querySelectorAll('.question').forEach(quizDiv => {
            totalCount++;
            const questionId = quizDiv.id;
            const questionText = quizDiv.querySelector('p').textContent.trim();
            const feedbackDiv = quizDiv.querySelector('.feedback');
            
            // 找到被選中的答案
            const selectedInput = quizDiv.querySelector('input:checked');
            const isCorrect = selectedInput && selectedInput.dataset.correct === 'true';

            // 重設樣式
            feedbackDiv.textContent = '';
            quizDiv.querySelectorAll('label').forEach(label => {
                label.style.backgroundColor = 'transparent';
            });
            
            if (isCorrect) {
                // 答對邏輯
                feedbackDiv.textContent = 'Correct! 🎉';
                feedbackDiv.style.color = 'green';
                correctCount++;
            } else {
                // 答錯邏輯
                let userAnswer = selectedInput ? selectedInput.value : '未選擇';
                let correctAnswerElement = quizDiv.querySelector('[data-correct="true"]');
                let correctAnswer = correctAnswerElement ? correctAnswerElement.value : '無';

                feedbackDiv.textContent = `Incorrect. The correct answer is highlighted below.`;
                feedbackDiv.style.color = 'red';
                
                // 標註正確答案
                if (correctAnswerElement) {
                    correctAnswerElement.closest('label').style.backgroundColor = 'rgba(138, 43, 226, 0.1)'; // 淺紫色背景
                }

                // 呼叫 storage.js 紀錄錯誤 (如果不是簡答題且有選擇)
                if (quizDiv.dataset.type !== 'short-answer' && selectedInput) {
                     recordError(questionId, questionText, userAnswer, correctAnswer, lessonId);
                }
            }
        });
        
        // 顯示總成績
        alert(`測驗完成！您答對了 ${correctCount} 題，總共 ${totalCount} 題。`);
    });
}

// 添加到 assets/js/lesson.js 文件末尾

// ----------------------
// C. 筆記與答案下載功能
// ----------------------

document.addEventListener('DOMContentLoaded', () => {
    // 確保這裡的事件監聽器在 DOM 載入後運行
    const downloadButton = document.getElementById('download-notes');
    if (downloadButton) {
        downloadButton.addEventListener('click', generateAndDownloadNotes);
    }
    
    // (原有 5W1H 筆記的自動載入/儲存邏輯...)
});


/**
 * 收集 5W1H 筆記和 Short Answer 答案，並生成文字內容。
 * @returns {string} 格式化後的筆記文本。
 */
function collectNotesAsText() {
    const lessonId = document.querySelector('main').dataset.lessonId || 'Lesson_Record';
    let text = `--- Learning Record for: ${lessonId} ---\n\n`;
    text += `Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n\n`;
    
    // 1. 收集 5W1H 筆記
    text += "====================\n";
    text += "I. 5W1H Notes:\n";
    text += "====================\n";
    
    // 遍歷所有 5W1H 輸入欄位，並從 localStorage 讀取或直接從 input 讀取
    const fields = ['who', 'what', 'when', 'where', 'why', 'how'];
    const lessonPrefix = `5w1h-${lessonId}`;
    
    fields.forEach(field => {
        const inputElement = document.getElementById(field);
        // 為了確保準確性，從當前頁面輸入框讀取 (如果 input 已經有最新的值)
        const value = inputElement ? inputElement.value : (localStorage.getItem(`${lessonPrefix}-${field}`) || '');
        text += `${field.toUpperCase()}: ${value}\n`;
    });

    // 2. 收集 Short Answer 答案
    text += "\n====================\n";
    text += "II. Short Answer Question:\n";
    text += "====================\n";
    
    const shortAnswerInput = document.getElementById('short-answer-q5'); // 假設 Q5 是簡答題
    const shortAnswerValue = shortAnswerInput ? shortAnswerInput.value : '';
    
    if (shortAnswerValue) {
        text += "Q5: Why does the passage emphasize that being organized is not about achieving perfection?\n";
        text += `Your Answer: ${shortAnswerValue}\n`;
    } else {
        text += "Q5: No short answer provided.\n";
    }

    // 您可以選擇在這裡加入選擇題/是非題的答案，但需要複雜的邏輯來判斷用戶選擇和正確答案。
    // 這裡我們專注於用戶輸入的文字內容。

    return text;
}

/**
 * 觸發瀏覽器下載文字檔案。
 */
function generateAndDownloadNotes() {
    const textContent = collectNotesAsText();
    const lessonId = document.querySelector('main').dataset.lessonId.replace(/[^a-zA-Z0-9]/g, '_'); // 淨化檔名
    const filename = `${lessonId}_Notes.txt`;

    // 創建一個 Blob 物件來存儲文字內容
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });

    // 創建一個下載連結 (a 標籤)
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename; // 設定下載時的檔名
    
    // 模擬點擊下載
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // 釋放 URL 物件
    
    alert(`筆記已下載為 ${filename}！`);
}