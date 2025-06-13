// script.js

// --- DOM Elements ---
const countrySelectionScreen = document.getElementById('country-selection');
const challengeScreen = document.getElementById('challenge-screen');
const resultScreen = document.getElementById('result-screen');
const infoScreen = document.getElementById('info-screen');
const leaderboardScreen = document.getElementById('leaderboard-screen');

const countryGrid = document.querySelector('.country-grid');
// 注意：以下兩個變數在 HTML 中已移除各自的獨立按鈕，改由事件代理處理
// const startChallengeBtns = document.querySelectorAll('.start-challenge-btn');
// const viewInfoBtns = document.querySelectorAll('.view-info-btn');
const leaderboardBtn = document.getElementById('leaderboard-btn');

const questionNumberElem = document.getElementById('question-number');
const questionTextElem = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
// 注意：選項按鈕在 HTML 中已移除固定的 class="option-btn"，改為動態生成
// const optionBtns = document.querySelectorAll('.option-btn');
const feedbackTextElem = document.getElementById('feedback-text');
const nextQuestionBtn = document.getElementById('next-question-btn');
const endChallengeBtn = document.getElementById('end-challenge-btn');
const currentScoreElem = document.getElementById('current-score');

const finalScoreElem = document.getElementById('final-score');
const playerNameInput = document.getElementById('player-name');
const submitScoreBtn = document.getElementById('submit-score-btn');
const rechallengeBtn = document.getElementById('rechallenge-btn');
const backToHomeBtn = document.getElementById('back-to-home-btn');

const infoCountryNameElem = document.getElementById('info-country-name');
const visaInfoElem = document.getElementById('visa-info');
const vaccineInfoElem = document.getElementById('vaccine-info');
const cultureTaboosElem = document.getElementById('culture-taboos');
const prohibitedItemsElem = document.getElementById('prohibited-items');
const backFromInfoBtn = document.getElementById('back-from-info-btn');
const startChallengeFromInfoBtn = document.getElementById('start-challenge-from-info-btn');

const leaderboardList = document.getElementById('leaderboard-list');
const backFromLeaderboardBtn = document.getElementById('back-from-leaderboard-btn');


// --- Global Variables ---
let currentCountry = '';
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let quizActive = false; // To prevent multiple clicks during feedback
const questionsPerChallenge = 8; // 定義每場挑戰的題目數

// --- Gemini API Configuration ---
// IMPORTANT: In a real-world app, you should proxy API requests through your backend
// to prevent exposing your API key directly on the client-side.
// For this example, we'll keep it client-side for simplicity, but be aware of the security implications.
const GEMINI_API_KEY = "AIzaSyDtotXYUpUDmu5fEfHxrYEoqfxnhrza0so"; // <<-- 替換為您的 Gemini API Key
const GEMINI_API_ENDPOINT = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`;

// --- Functions ---

// Function to switch screens
function showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
}

// Function to fetch questions from Gemini API
async function fetchQuestions(country) {
    // 您提供的 promptText 已經是完整的，直接使用
    const promptText = `你是一位專業的出國旅遊嚮導，熟悉各國的文化、風俗和旅遊資訊。

請為「${country}自由行」產生 ${questionsPerChallenge} 題關於當地入境規則、文化禁忌、紅眼班機須知及省錢妙招的選擇題。

請以 JSON 格式輸出，包含以下欄位：
- "q": 題目 (字串)
- "a": 選項 (包含四個字串的陣列)
- "correct": 正確答案的索引 (整數，0 表示第一個選項，依此類推)
- "explain": 說明 (字串，解釋正確答案的原因)

範例：
[
  {
    "q": "從2025年4月開始，以下哪種止痛藥在韓國被禁止攜帶入境？",
    "a": ["普拿疼", "EVE", "阿斯匹靈", " ibuprofen"],
    "correct": 1,
    "explain": "由於含有在韓國被視為管制藥品的成分，特定品牌的EVE止痛藥從2025年4月起禁止攜帶入境。"
  },
  {
    "q": "關於在飛機上使用行動電源充電，以下哪個敘述是正確的？",
    "a": ["所有行動電源都可以在飛機上充電。", "只有韓國航空禁止使用行動電源充電。", "行動電源必須絕緣且妥善存放。", "只要經過空服員同意，任何行動電源都可以充電。"],
    "correct": 3,
    "explain": "文章提到，對於飛機上攜帶行動電源有相關規定，像是需要絕緣包裝好等等。"
  },
  {
    "q": "韓國的電子入境卡（e-Arrival Card）可以在出發前多久申請？",
    "a": ["24小時內", "72小時內", "一週前", "一個月前"],
    "correct": 2,
    "explain": "電子入境卡可以在出發前72小時於官網免費申請。"
  },
  {
    "q": "申請韓國電子入境卡（e-Arrival Card）時，需要上傳以下哪種文件照片？",
    "a": ["護照內頁有簽證的照片", "身分證正面照片", "護照資料頁照片", "機票訂購證明"],
    "correct": 2,
    "explain": "申請流程中需要上傳護照資料頁的照片。"
  },
  {
    "q": "使用電子入境卡（e-Arrival Card）入境韓國有什麼好處？",
    "a": ["可以免費升等機艙", "加快入境審查速度，無需出示其他文件", "獲得韓國旅遊折扣", "享有免稅優惠"],
    "correct": 2,
    "explain": "使用電子入境卡可以讓護照資訊直接登錄系統，入境時不用再出示其他文件。"
  }
]

請注意：
- 請設計一些大學生常會在旅遊規劃遇到的問題並且資訊要越新且正確。
- 說明應簡潔明瞭。
- 每個問題的選項應該是隨機排列的，並且正確答案的索引應該是從0開始計算。
-優先出那個國家相比其他國家更特別的入境規則、文化禁忌、紅眼班機須知及省錢妙招。

格式：{\"q\": \"題目\", \"a\": [\"選項1\", \"選項2\", \"選項3\", \"選項4\"], \"correct\": 整數, \"explain\": \"說明\"}`;


    try {
        const response = await fetch(GEMINI_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: promptText
                    }]
                }]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Gemini API Error Response:", errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        // Gemini API responses can sometimes be wrapped in text that needs trimming.
        // Look for the JSON block within the 'text' field.
        const textResponse = data.candidates[0]?.content?.parts[0]?.text;

        if (!textResponse) {
            throw new Error("Gemini API response is empty or malformed.");
        }

        console.log("Gemini Raw Response:", textResponse);

        // Attempt to extract JSON string from the text and parse it
        // This regex tries to find a JSON block enclosed by ```json ... ``` or just {...}
        let jsonStringMatch = textResponse.match(/```json\s*([\s\S]*?)```/);
        let jsonString;

        if (jsonStringMatch && jsonStringMatch[1]) {
            jsonString = jsonStringMatch[1].trim();
        } else {
            // If no ```json``` block, try to parse the whole response as JSON
            jsonString = textResponse.trim();
        }
        
        // Sometimes Gemini might add comments or extra text outside the JSON.
        // Try to find the first '[' and last ']' to ensure valid JSON array.
        const startIndex = jsonString.indexOf('[');
        const endIndex = jsonString.lastIndexOf(']');
        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
            jsonString = jsonString.substring(startIndex, endIndex + 1);
        } else {
            console.warn("Could not find a valid JSON array structure. Attempting to parse raw response.");
        }


        // Final parse attempt
        const parsedQuestions = JSON.parse(jsonString);

        // Validate the structure of parsed questions
        if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
            throw new Error("Parsed questions are not an array or are empty.");
        }
        // Further validation (optional but recommended): Check if each question has q, a, correct, explain
        parsedQuestions.forEach(q => {
            if (!q.q || !Array.isArray(q.a) || q.a.length !== 4 || typeof q.correct !== 'number' || typeof q.explain !== 'string') {
                console.error("Malformed question object received from Gemini:", q);
                throw new Error("Received malformed question from Gemini API.");
            }
        });

        return parsedQuestions;

    } catch (error) {
        console.error("Error fetching questions from Gemini API:", error);
        alert(`無法載入題目，請稍後再試。錯誤：${error.message}`);
        return [];
    }
}

// Function to start the challenge
async function startChallenge(country) {
    currentCountry = country;
    score = 0;
    currentQuestionIndex = 0;
    currentScoreElem.textContent = `分數：${score}`;
    feedbackTextElem.textContent = '';
    nextQuestionBtn.classList.add('hidden');
    endChallengeBtn.classList.add('hidden');
    playerNameInput.value = ''; // Clear player name input

    showScreen(challengeScreen);
    quizActive = false; // Reset for new challenge

    // Show a loading indicator
    questionTextElem.textContent = "載入題目中，請稍候...";
    optionsContainer.innerHTML = ''; // Clear options

    // Fetch questions and then display
    currentQuestions = await fetchQuestions(country);

    if (currentQuestions.length === 0) {
        alert("未能成功獲取題目，請嘗試其他國家或稍後再試。");
        showScreen(countrySelectionScreen); // Go back to selection if no questions
        return;
    }
    // Shuffle questions and take the first `questionsPerChallenge` (though prompt asks for it already)
    // This local shuffle ensures uniqueness if API sometimes gives same order
    currentQuestions = shuffleArray(currentQuestions).slice(0, questionsPerChallenge);
    displayQuestion();
}

// Fisher-Yates (Knuth) shuffle algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Function to display current question
function displayQuestion() {
    quizActive = true;
    const question = currentQuestions[currentQuestionIndex];
    if (!question) {
        endChallenge();
        return;
    }

    questionNumberElem.textContent = `第 ${currentQuestionIndex + 1} 題`;
    questionTextElem.textContent = question.q; // Changed from question.question to question.q

    // Clear previous options and feedback
    optionsContainer.innerHTML = '';
    feedbackTextElem.textContent = '';
    nextQuestionBtn.classList.add('hidden');
    endChallengeBtn.classList.add('hidden');

    // Create and append option buttons
    // The 'a' field in your JSON is an array, not an object with A,B,C,D keys
    const options = question.a; // Use question.a which is an array
    options.forEach((optionText, index) => {
        const button = document.createElement('button');
        button.classList.add('option-btn');
        // Map index to A, B, C, D for data-option, or just use index
        const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
        button.dataset.option = optionLetter; // Store letter as data-option
        button.dataset.optionIndex = index; // Store index for comparison with correct answer
        button.textContent = `${optionLetter}. ${optionText}`;
        button.addEventListener('click', handleOptionClick);
        optionsContainer.appendChild(button);
    });

    // Enable all options
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('correct', 'incorrect');
    });
}

// Function to handle option click
function handleOptionClick(event) {
    if (!quizActive) return; // Prevent double clicking

    quizActive = false; // Disable further clicks until next question

    const selectedOptionIndex = parseInt(event.target.dataset.optionIndex); // Get the index
    const currentQuestion = currentQuestions[currentQuestionIndex];

    // Disable all options after selection
    document.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);

    if (selectedOptionIndex === currentQuestion.correct) { // Compare index with correct
        score += 10; // Assuming 10 points per correct answer
        feedbackTextElem.textContent = `答對了！${currentQuestion.explain}`; // Use question.explain
        event.target.classList.add('correct');
    } else {
        feedbackTextElem.textContent = `答錯了。正確答案是 ${String.fromCharCode(65 + currentQuestion.correct)}：${currentQuestion.a[currentQuestion.correct]}。${currentQuestion.explain}`;
        event.target.classList.add('incorrect');
        // Highlight correct answer
        // Find the button by its data-optionIndex
        document.querySelector(`.option-btn[data-option-index="${currentQuestion.correct}"]`).classList.add('correct');
    }

    currentScoreElem.textContent = `分數：${score}`;

    if (currentQuestionIndex < questionsPerChallenge - 1) {
        nextQuestionBtn.classList.remove('hidden');
    } else {
        endChallengeBtn.classList.remove('hidden');
    }
}

// Function to go to the next question
function goToNextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questionsPerChallenge) {
        displayQuestion();
    } else {
        endChallenge();
    }
}

// Function to end the challenge
function endChallenge() {
    showScreen(resultScreen);
    finalScoreElem.textContent = score;
    playerNameInput.value = ''; // Clear for new input
}

// Function to submit score to Firebase
async function submitScore() {
    const playerName = playerNameInput.value.trim();
    if (!playerName) {
        alert("請輸入您的暱稱！");
        return;
    }

    try {
        await db.collection('leaderboard').add({
            name: playerName,
            score: score,
            country: currentCountry, // Record the country for context
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        alert("分數已提交！");
        playerNameInput.value = ''; // Clear input after submission
        showLeaderboard(); // Show leaderboard after submission
    } catch (error) {
        console.error("Error writing document: ", error);
        alert("提交分數失敗，請稍後再試。");
    }
}

// Function to fetch and display leaderboard
async function showLeaderboard() {
    showScreen(leaderboardScreen);
    leaderboardList.innerHTML = '<li>載入排行榜中...</li>';

    try {
        const snapshot = await db.collection('leaderboard')
                                 .orderBy('score', 'desc')
                                 .orderBy('timestamp', 'asc') // Secondary sort for tie-breaking
                                 .limit(10) // Display top 10
                                 .get();

        leaderboardList.innerHTML = ''; // Clear loading text
        if (snapshot.empty) {
            leaderboardList.innerHTML = '<li>目前沒有分數。</li>';
            return;
        }

        snapshot.forEach((doc, index) => {
            const data = doc.data();
            const listItem = document.createElement('li');
            // Format timestamp for display (optional)
            const date = data.timestamp ? new Date(data.timestamp.toDate()).toLocaleString() : 'N/A';
            listItem.innerHTML = `
                <span>${index + 1}. <strong>${data.name}</strong> (${data.country})</span>
                <span>分數: ${data.score} (${date})</span>
            `;
            leaderboardList.appendChild(listItem);
        });

    } catch (error) {
        console.error("Error getting leaderboard: ", error);
        leaderboardList.innerHTML = '<li>載入排行榜失敗。</li>';
    }
}

// Function to fetch and display country info (dummy data for now)
function displayCountryInfo(country) {
    infoCountryNameElem.textContent = country;
    // In a real app, you would fetch this data from an API or a database
    // For now, using a simple switch case or object lookup
    const info = {
        Japan: {
            visa: "免簽證",
            vaccine: "無特殊要求，建議常規疫苗接種",
            culture: "進入室內要脫鞋，不邊走邊吃，大眾運輸工具上避免大聲喧嘩。",
            prohibited: "新鮮蔬果、肉類製品、動植物產品等。"
        },
        SouthKorea: {
            visa: "免簽證",
            vaccine: "無特殊要求，建議常規疫苗接種",
            culture: "長幼有序，接受物品時用雙手，餐桌禮儀注重，不在公共場合大聲喧嘩。",
            prohibited: "未經檢疫的農產品、肉類、活體動植物等。"
        },
        HongKong: {
            visa: "免簽證（最長90天）",
            vaccine: "無特殊要求，建議常規疫苗接種",
            culture: "搭乘電梯時靠右站，避免在公共場所大聲喧嘩，尊重排隊秩序。",
            prohibited: "新鮮蔬果、肉類、活體動植物、危險品等。"
        },
        Philippines: {
            visa: "免簽證（最長14天）",
            vaccine: "建議接種A型肝炎、B型肝炎、傷寒等疫苗",
            culture: "尊重長輩，避免公開場合親密舉止，穿著得體。",
            prohibited: "毒品、未經申報的現金超過限額、槍械彈藥、色情物品等。"
        },
        Vietnam: {
            visa: "免簽證（最長14天）",
            vaccine: "建議接種A型肝炎、B型肝炎、傷寒等疫苗",
            culture: "進入寺廟需脫鞋，穿著端莊，避免觸摸他人頭部。",
            prohibited: "毒品、武器、色情刊物、未經檢疫的動植物產品等。"
        },
        Australia: {
            visa: "需申請電子簽證（ETA）",
            vaccine: "無特殊要求，建議常規疫苗接種",
            culture: "守時，尊重個人空間，公共場合勿大聲喧嘩。",
            prohibited: "新鮮蔬果、肉類、乳製品、蜂蜜、種子、動植物等。"
        },
        Thailand: {
            visa: "免簽證（最長30天）",
            vaccine: "建議接種A型肝炎、B型肝炎、傷寒等疫苗",
            culture: "進入寺廟需脫鞋，勿觸摸僧侶，頭部視為神聖部位勿隨意碰觸。",
            prohibited: "毒品、電子煙、未經檢疫的動植物產品、色情物品等。"
        },
        NewZealand: {
            visa: "需申請NZeTA電子旅行授權",
            vaccine: "無特殊要求，建議常規疫苗接種",
            culture: "重視環保與禮貌，進入室內可脫鞋，與人交談時保持適當距離。",
            prohibited: "新鮮蔬果、肉類、乳製品、蜂蜜、種子、未經申報的動植物產品等。"
        }
        // Add more countries as needed
    };

    const countryData = info[country] || {
        visa: "查無資料",
        vaccine: "查無資料",
        culture: "查無資料",
        prohibited: "查無資料"
    };

    visaInfoElem.textContent = countryData.visa;
    vaccineInfoElem.textContent = countryData.vaccine;
    cultureTaboosElem.textContent = countryData.culture;
    prohibitedItemsElem.textContent = countryData.prohibited;

    // Set a data attribute to the info screen so "Start Challenge" button knows which country
    infoScreen.dataset.country = country;
    showScreen(infoScreen);
}


// --- Event Listeners ---

// Country selection (using event delegation for efficiency)
countryGrid.addEventListener('click', (event) => {
    const target = event.target;
    const countryCard = target.closest('.country-card'); // Find the closest parent with .country-card

    if (countryCard) {
        const country = countryCard.dataset.country;
        if (target.classList.contains('start-challenge-btn')) {
            startChallenge(country);
        } else if (target.classList.contains('view-info-btn')) {
            displayCountryInfo(country);
        }
    }
});

leaderboardBtn.addEventListener('click', showLeaderboard);

// Challenge screen
nextQuestionBtn.addEventListener('click', goToNextQuestion);
endChallengeBtn.addEventListener('click', endChallenge);

// Result screen
submitScoreBtn.addEventListener('click', submitScore);
rechallengeBtn.addEventListener('click', () => startChallenge(currentCountry)); // Rechallenge for the same country
backToHomeBtn.addEventListener('click', () => showScreen(countrySelectionScreen));

// Info screen
backFromInfoBtn.addEventListener('click', () => showScreen(countrySelectionScreen));
startChallengeFromInfoBtn.addEventListener('click', () => {
    const country = infoScreen.dataset.country; // Get country from the data attribute
    if (country) {
        startChallenge(country);
    } else {
        alert("無法識別國家，請返回首頁重新選擇。");
        showScreen(countrySelectionScreen);
    }
});

// Leaderboard screen
backFromLeaderboardBtn.addEventListener('click', () => showScreen(countrySelectionScreen));

// Initial screen load
showScreen(countrySelectionScreen);


