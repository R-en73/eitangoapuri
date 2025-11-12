document.addEventListener('DOMContentLoaded', () => {
    const gradeSelectionScreen = document.getElementById('grade-selection-screen');
    const quizScreen = document.getElementById('quiz-screen');
    const resultScreen = document.getElementById('result-screen');
    const gradeButtonsContainer = document.getElementById('grade-buttons');
    const backButton = document.getElementById('back-button');
    const questionDisplay = document.getElementById('question-display');
    const answerOptionsContainer = document.getElementById('answer-options-container');
    const feedbackContainer = document.getElementById('feedback-container');
    const feedbackText = document.getElementById('feedback-text');
    const correctAnswerText = document.getElementById('correct-answer-text');
    const nextWordButton = document.getElementById('next-word-button');
    const progressDisplay = document.getElementById('progress-display');
    const restartButton = document.getElementById('restart-button');
    const homeButton = document.getElementById('home-button');

    let allWords = {};
    let currentGradeWords = [];
    let currentWordIndex = 0;
    let selectedGrade = '';

    // JSONデータを読み込んで処理
    async function loadWords() {
        try {
            const response = await fetch('words.json');
            allWords = await response.json();
            setupGradeSelection();
        } catch (error) {
            console.error('Error loading or parsing JSON file:', error);
            gradeButtonsContainer.textContent = '単語データの読み込みに失敗しました。';
        }
    }

    // 学年選択画面をセットアップ
    function setupGradeSelection() {
        gradeButtonsContainer.innerHTML = '';
        const grades = Object.keys(allWords);
        grades.forEach(grade => {
            const button = document.createElement('button');
            button.textContent = grade;
            button.addEventListener('click', () => startQuiz(grade));
            gradeButtonsContainer.appendChild(button);
        });
    }

    // クイズを開始
    function startQuiz(grade) {
        selectedGrade = grade;
        currentGradeWords = shuffleArray([...allWords[grade]]);
        currentWordIndex = 0;
        
        gradeSelectionScreen.classList.add('hidden');
        resultScreen.classList.add('hidden');
        quizScreen.classList.remove('hidden');
        
        displayQuestion();
    }

    // 問題を表示
    function displayQuestion() {
        if (currentWordIndex < currentGradeWords.length) {
            feedbackContainer.classList.add('hidden');
            nextWordButton.classList.add('hidden');
            answerOptionsContainer.innerHTML = '';

            const correctWordData = currentGradeWords[currentWordIndex];
            questionDisplay.textContent = correctWordData.meaning;

            // 選択肢を生成
            const options = generateOptions(correctWordData);

            options.forEach(optionWord => {
                const button = document.createElement('button');
                button.textContent = optionWord;
                button.classList.add('answer-option');
                button.addEventListener('click', () => checkAnswer(optionWord, correctWordData));
                answerOptionsContainer.appendChild(button);
            });
            
            progressDisplay.textContent = `(${currentWordIndex + 1} / ${currentGradeWords.length})`;
        } else {
            showResultScreen();
        }
    }

    // 選択肢を生成（正解1つ、不正解3つ）
    function generateOptions(correctWordData) {
        const options = [correctWordData.word];
        const allWordsInGrade = [...allWords[selectedGrade]];
        const incorrectWords = allWordsInGrade.filter(word => word.word !== correctWordData.word);
        
        while (options.length < 4 && incorrectWords.length > 0) {
            const randomIndex = Math.floor(Math.random() * incorrectWords.length);
            const randomWord = incorrectWords.splice(randomIndex, 1)[0].word;
            options.push(randomWord);
        }

        return shuffleArray(options);
    }

    // 回答をチェック
    function checkAnswer(selectedWord, correctWordData) {
        feedbackContainer.classList.remove('hidden');
        nextWordButton.classList.remove('hidden');

        const optionButtons = document.querySelectorAll('.answer-option');
        optionButtons.forEach(button => {
            button.disabled = true;
            if (button.textContent === correctWordData.word) {
                button.classList.add('correct');
            }
        });

        if (selectedWord === correctWordData.word) {
            feedbackText.textContent = '正解！';
            feedbackText.style.color = '#28a745';
            correctAnswerText.textContent = '';
        } else {
            feedbackText.textContent = '不正解！';
            feedbackText.style.color = '#dc3545';
            correctAnswerText.textContent = `正解は: ${correctWordData.word}`;
            optionButtons.forEach(button => {
                if (button.textContent === selectedWord) {
                    button.classList.add('incorrect');
                }
            });
        }
    }

    // 結果画面を表示
    function showResultScreen() {
        quizScreen.classList.add('hidden');
        resultScreen.classList.remove('hidden');
    }

    // 配列をシャッフル（Fisher-Yatesアルゴリズム）
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // イベントリスナー
    nextWordButton.addEventListener('click', () => {
        currentWordIndex++;
        displayQuestion();
    });

    backButton.addEventListener('click', () => {
        quizScreen.classList.add('hidden');
        gradeSelectionScreen.classList.remove('hidden');
    });

    restartButton.addEventListener('click', () => {
        startQuiz(selectedGrade);
    });

    homeButton.addEventListener('click', () => {
        resultScreen.classList.add('hidden');
        gradeSelectionScreen.classList.remove('hidden');
    });

    // アプリケーションを初期化
    loadWords();
});
