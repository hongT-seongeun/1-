// 1. 문제 데이터 후보군 정의
const primeCandidates = [2, 3, 5, 7, 11, 13, 17, 19];

const compositeCandidates = [
    { number: 12, factors: [2, 2, 3], expression: "2² × 3", explanation: "12 = 2 × 2 × 3 = 2² × 3입니다." },
    { number: 18, factors: [2, 3, 3], expression: "2 × 3²", explanation: "18 = 2 × 3 × 3 = 2 × 3²입니다." },
    { number: 20, factors: [2, 2, 5], expression: "2² × 5", explanation: "20 = 2 × 2 × 5 = 2² × 5입니다." },
    { number: 24, factors: [2, 2, 2, 3], expression: "2³ × 3", explanation: "24 = 2 × 2 × 2 × 3 = 2³ × 3입니다." },
    { number: 28, factors: [2, 2, 7], expression: "2² × 7", explanation: "28 = 2 × 2 × 7 = 2² × 7입니다." },
    { number: 30, factors: [2, 3, 5], expression: "2 × 3 × 5", explanation: "30 = 2 × 3 × 5입니다." },
    { number: 36, factors: [2, 2, 3, 3], expression: "2² × 3²", explanation: "36 = 2 × 2 × 3 × 3 = 2² × 3²입니다." },
    { number: 40, factors: [2, 2, 2, 5], expression: "2³ × 5", explanation: "40 = 2 × 2 × 2 × 5 = 2³ × 5입니다." },
    { number: 45, factors: [3, 3, 5], expression: "3² × 5", explanation: "45 = 3 × 3 × 5 = 3² × 5입니다." },
    { number: 60, factors: [2, 2, 3, 5], expression: "2² × 3 × 5", explanation: "60 = 2 × 2 × 3 × 5 = 2² × 3 × 5입니다." },
    { number: 72, factors: [2, 2, 2, 3, 3], expression: "2³ × 3²", explanation: "72 = 2 × 2 × 2 × 3 × 3 = 2³ × 3²입니다." },
    { number: 84, factors: [2, 2, 3, 7], expression: "2² × 3 × 7", explanation: "84 = 2 × 2 × 3 × 7 = 2² × 3 × 7입니다." },
    { number: 90, factors: [2, 3, 3, 5], expression: "2 × 3² × 5", explanation: "90 = 2 × 3 × 3 × 5 = 2 × 3² × 5입니다." },
    { number: 100, factors: [2, 2, 5, 5], expression: "2² × 5²", explanation: "100 = 2 × 2 × 5 × 5 = 2² × 5²입니다." }
];

// 2. 게임 상태 관리 변수들
let gameQuestions = [];       // 전체 10문제 저장 배열
let currentQuestionIndex = 0; // 현재 문제 인덱스 (0~9)
let score = 0;                // 현재 누적 점수
let correctCount = 0;         // 완벽히 정답을 맞힌 항목 수
let caughtCount = 0;          // 포획 성공한 몬스터 수
let wrongClickCount = 0;      // 잘못된 소수로 나누려 한 횟수

// 한 문제 내에서의 내부 세부 단계 스코어 및 상태
let currentStep = "type-selection"; // type-selection, division, final-answer
let currentNumber = 0;        // 현재 실시간으로 나누어지고 있는 동적 값
let selectedDivisors = [];    // ㄴ자 나눗셈에서 성공적으로 나눈 소인수 목록
let divisionHistory = [];     // 나눗셈 히스토리 보관 (되돌리기 및 렌더링용)
let finalAnswerFactors = [];  // 방식 B: 사용자가 제출용으로 하단에서 클릭한 소인수 목록

// 3. DOM 요소 캐싱
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const resultScreen = document.getElementById("result-screen");

const btnStart = document.getElementById("btn-start");
const btnBackToLobby = document.getElementById("btn-back-to-lobby");
const btnGoToStart = document.getElementById("btn-go-to-start");
const btnResetGame = document.getElementById("btn-reset-game");
const btnSelectPrime = document.getElementById("btn-select-prime");
const btnSelectComposite = document.getElementById("btn-select-composite");
const btnUndo = document.getElementById("btn-undo");
const btnClearAnswer = document.getElementById("btn-clear-answer");
const btnSubmitAnswer = document.getElementById("btn-submit-answer");
const btnNext = document.getElementById("btn-next");
const btnRestart = document.getElementById("btn-restart");
const btnGoHome = document.getElementById("btn-go-home");

const currentQuestionNumDisp = document.getElementById("current-question-num");
const currentScoreDisp = document.getElementById("current-score");
const monsterChar = document.getElementById("monster-char");
const monsterNumberDisp = document.getElementById("monster-number-display");
const questionText = document.getElementById("question-text");
const feedbackMessage = document.getElementById("feedback-message");

const panelTypeSelection = document.getElementById("panel-type-selection");
const panelFactorization = document.getElementById("panel-factorization");
const divisionBoard = document.getElementById("division-board");
const divisionStatus = document.getElementById("division-status");
const finalAnswerSection = document.getElementById("final-answer-section");
const monsterNumPrefix = document.getElementById("monster-num-prefix");
const finalAnswerDisplay = document.getElementById("final-answer-display");

// 4. 이벤트 리스너 등록
window.addEventListener("DOMContentLoaded", () => {
    btnStart.addEventListener("click", startGame);
    btnBackToLobby.addEventListener("click", () => {
        window.location.href = "../index.html";
    });
    btnGoToStart.addEventListener("click", () => confirmAndGoToStart());
    btnResetGame.addEventListener("click", () => confirmAndRestart());
    btnSelectPrime.addEventListener("click", () => checkMonsterType(true));
    btnSelectComposite.addEventListener("click", () => checkMonsterType(false));
    btnUndo.addEventListener("click", handleUndo);
    btnClearAnswer.addEventListener("click", clearFinalAnswer);
    btnSubmitAnswer.addEventListener("click", checkFinalAnswer);
    btnNext.addEventListener("click", moveToNextQuestion);
    btnRestart.addEventListener("click", startGame);
    btnGoHome.addEventListener("click", showStartScreen);

    // 소수 카드 버튼들에 대한 이벤트 위임 설정
    document.querySelectorAll(".btn-prime-card").forEach(button => {
        button.addEventListener("click", () => {
            const primeValue = parseInt(button.getAttribute("data-prime"));
            handlePrimeCardClick(primeValue);
        });
    });
});

// 5. 화면 전환 함수
function updateTopNav(activeScreen) {
    const showGameButtons = activeScreen !== startScreen;
    btnBackToLobby.classList.toggle("hidden", showGameButtons);
    btnGoToStart.classList.toggle("hidden", !showGameButtons);
    btnResetGame.classList.toggle("hidden", !showGameButtons);

    if (showGameButtons) {
        btnGoToStart.textContent = "📋 시작화면으로";
        btnResetGame.textContent = "🔄 처음으로";
    }
}

function showScreen(screenToShow) {
    [startScreen, gameScreen, resultScreen].forEach(screen => {
        screen.classList.remove("active");
    });
    screenToShow.classList.add("active");
    updateTopNav(screenToShow);
}

function confirmAndGoToStart() {
    const confirmed = window.confirm("시작화면으로 이동하겠습니까?");
    if (confirmed) {
        showStartScreen();
    }
}

function confirmAndRestart() {
    const confirmed = window.confirm("처음으로 이동하겠습니까?");
    if (confirmed) {
        startGame();
    }
}

function showStartScreen() {
    showScreen(startScreen);
}

// 6. 게임 시작 및 문제 빌드 함수
function startGame() {
    // 스코어 및 통계 수치 초기화
    score = 0;
    currentQuestionIndex = 0;
    correctCount = 0;
    caughtCount = 0;
    wrongClickCount = 0;

    // 문제 배열 구성: 소수 3문제, 합성수 7문제 선별
    const shuffledPrimes = [...primeCandidates].sort(() => 0.5 - Math.random());
    const shuffledComposites = [...compositeCandidates].sort(() => 0.5 - Math.random());

    const selectedPrimes = shuffledPrimes.slice(0, 3).map(num => ({
        number: num,
        isPrime: true,
        factors: [num],
        explanation: `${num}은 1과 자기 자신만 약수로 가지는 소수입니다. 더 이상 분해되지 않으므로 바로 포획할 수 있습니다.`
    }));

    const selectedComposites = shuffledComposites.slice(0, 7).map(item => ({
        ...item,
        isPrime: false
    }));

    // 두 그룹을 섞어 총 10개의 문제 배열로 제작
    gameQuestions = [...selectedPrimes, ...selectedComposites].sort(() => 0.5 - Math.random());

    // 첫 문제 렌더링 및 화면 전환
    showScreen(gameScreen);
    displayQuestion();
}

// 7. 문제 표시 함수 (매 라운드마다 호출)
function displayQuestion() {
    const currentQuestion = gameQuestions[currentQuestionIndex];
    
    // UI 초기화
    feedbackMessage.classList.add("hidden");
    feedbackMessage.className = "feedback-box hidden";
    btnNext.classList.add("hidden");
    
    // 상단 스태이터스 업데이트
    currentQuestionNumDisp.textContent = currentQuestionIndex + 1;
    currentScoreDisp.textContent = score;

    // 몬스터 캐릭터 설정 변경
    monsterNumberDisp.textContent = currentQuestion.number;
    monsterChar.className = "monster"; // 효과 클래스 제거
    if (currentQuestion.isPrime) {
        monsterChar.classList.add("type-prime");
    } else {
        monsterChar.classList.add("type-composite");
    }

    // 1단계 상태로 시작
    currentStep = "type-selection";
    questionText.textContent = `${currentQuestion.number} 몬스터가 나타났다! 이 몬스터는 어떤 몬스터일까?`;
    
    panelTypeSelection.classList.add("active");
    panelFactorization.classList.remove("active");

    // 합성수 분해용 내부 상태 변수 초기화
    currentNumber = currentQuestion.number;
    selectedDivisors = [];
    divisionHistory = [];
    finalAnswerFactors = [];
    
    // ㄴ자 나눗셈 보드판 비우기
    divisionBoard.innerHTML = "";
    divisionStatus.textContent = "";
    finalAnswerDisplay.textContent = "소수 카드를 클릭하여 채우세요";
    finalAnswerDisplay.className = "empty-answer";
    finalAnswerSection.classList.add("disabled");
}

// 8. 1단계: 소수/합성수 몬스터 종류 판별 처리
function checkMonsterType(userSelectedPrime) {
    const currentQuestion = gameQuestions[currentQuestionIndex];
    const isActualPrime = currentQuestion.isPrime;

    panelTypeSelection.classList.remove("active");

    if (userSelectedPrime === isActualPrime) {
        // 정답인 경우
        monsterChar.classList.add("sparkle"); // 반짝임 효과 추가
        
        if (isActualPrime) {
            // 소수 몬스터를 올바르게 맞춤 -> 바로 10점 획득 후 포획 성공
            score += 10;
            correctCount++;
            caughtCount++;
            showFeedback(true, `정답! ${currentQuestion.number}은(는) 소수 몬스터입니다!<br>${currentQuestion.explanation}`);
            btnNext.classList.remove("hidden");
        } else {
            // 합성수 몬스터를 올바르게 판별함 -> 3점 획득 후 2단계(나눗셈)로 진입
            score += 3;
            showFeedback(true, `정답! ${currentQuestion.number}은(는) 합성수 몬스터입니다. 이제 연구 노트에서 소인수분해를 시작해 주세요!`);
            enterFactorizationStep();
        }
    } else {
        // 오답인 경우
        monsterChar.classList.add("shake"); // 흔들림 오답 애니메이션
        
        if (isActualPrime) {
            // 실제론 소수인데 합성수라고 한 경우 -> 0점 처리 및 다음 버튼 활성화
            showFeedback(false, `분석 실패! ${currentQuestion.number}은(는) 1과 자기 자신만을 약수로 가지는 소수 몬스터입니다.`);
            btnNext.classList.remove("hidden");
        } else {
            // 실제론 합성수인데 소수라고 한 경우 -> 판별 점수 0점이지만, 학습을 위해 나눗셈 단계로 강제 진입 유도
            showFeedback(false, `분석 실패! ${currentQuestion.number}은(는) 합성수 몬스터입니다. 직접 분해해 보며 약점을 분석해 봅시다.`);
            enterFactorizationStep();
        }
    }
    
    currentScoreDisp.textContent = score;
}

// 9. 2단계: 소인수분해 단계 화면 전환
function enterFactorizationStep() {
    currentStep = "division";
    panelFactorization.classList.add("active");
    
    // 처음에 숫자 하나만 표시
    renderDivisionBoard();
    
    questionText.textContent = "왼쪽 연구 노트에서 소수 카드를 사용해 숫자를 1이 될 때까지 나누어 보세요.";
}

// 10. 소수 카드 버튼 클릭 통합 처리기
function handlePrimeCardClick(primeValue) {
    if (currentStep === "division") {
        // ㄴ자 나눗셈 진행 중인 경우
        handleDivisionProgress(primeValue);
    } else if (currentStep === "final-answer") {
        // 나눗셈이 모두 끝나고 정답 제출 칸을 채우는 중인 경우
        handleFinalAnswerInput(primeValue);
    }
}

// 11. 실시간 ㄴ자 나눗셈 계산 처리
function handleDivisionProgress(primeValue) {
    // 나누어떨어지는지 확인
    if (currentNumber % primeValue === 0) {
        const previousNumber = currentNumber;
        currentNumber = currentNumber / primeValue;
        
        // 기록 추가
        selectedDivisors.push(primeValue);
        divisionHistory.push({
            dividend: previousNumber,
            divisor: primeValue,
            quotient: currentNumber
        });
        
        // 피드백 초기화 (이전 오답 문구 지우기)
        feedbackMessage.classList.add("hidden");
        
        // 보드판 새로 그리기
        renderDivisionBoard();
        
        // 1에 도달하면 분해 완료 처리
        if (currentNumber === 1) {
            currentStep = "final-answer";
            score += 4; // 나눗셈 완료 보너스 4점 추가
            currentScoreDisp.textContent = score;
            
            monsterChar.classList.remove("shake");
            monsterChar.classList.add("sparkle");
            
            divisionStatus.textContent = "🎉 분해 완료!";
            questionText.textContent = "최종 소인수분해 결과를 완성하여 정답 확인을 누르세요!";
            
            // 최종 답안 제출 판넬 활성화
            finalAnswerSection.classList.remove("disabled");
            monsterNumPrefix.textContent = gameQuestions[currentQuestionIndex].number;
        }
    } else {
        // 나누어떨어지지 않는 소수를 누른 경우
        wrongClickCount++;
        showFeedback(false, `💡 ${currentNumber}은(는) ${primeValue}(으)로 나누어떨어지지 않습니다. 다른 소수를 선택해 보세요.`, true);
    }
}

// 12. ㄴ자 나눗셈 시각화 렌더링 함수
function renderDivisionBoard() {
    divisionBoard.innerHTML = "";
    
    // 히스토리를 기반으로 ㄴ자 나눗셈 라인 생성
    divisionHistory.forEach(step => {
        const row = document.createElement("div");
        row.className = "div-row";
        
        row.innerHTML = `
            <div class="div-divisor">${step.divisor}</div>
            <div class="div-structure">ㄴ ${step.dividend}</div>
        `;
        divisionBoard.appendChild(row);
    });
    
    // 맨 하단에 현재 남은 수 표시
    const finalRow = document.createElement("div");
    finalRow.className = "div-quotient-only";
    finalRow.textContent = currentNumber;
    divisionBoard.appendChild(finalRow);
}

// 13. 되돌리기(Undo) 기능 구현
function handleUndo() {
    // 나눗셈 단계거나 이미 완료했더라도 아직 최종 제출 안 했으면 취소 가능하게 처리
    if (divisionHistory.length === 0) return;
    
    // 마지막 히스토리 탈착
    const lastStep = divisionHistory.pop();
    selectedDivisors.pop();
    
    // 현재 수 복원
    currentNumber = lastStep.dividend;
    
    // 만약 완료 상태에서 취소한 경우 상태 원복
    if (currentStep === "final-answer") {
        currentStep = "division";
        score -= 4; // 지급했던 나눗셈 완료 점수 회수
        currentScoreDisp.textContent = score;
        divisionStatus.textContent = "";
        questionText.textContent = "왼쪽 연구 노트에서 소수 카드를 사용해 숫자를 1이 될 때까지 나누어 보세요.";
        finalAnswerSection.classList.add("disabled");
        clearFinalAnswer();
    }
    
    // UI 리렌더링
    renderDivisionBoard();
    feedbackMessage.classList.add("hidden");
}

// 14. 방식 B: 최종 답안 칸 소수 입력 처리
function handleFinalAnswerInput(primeValue) {
    finalAnswerFactors.push(primeValue);
    updateFinalAnswerDisplay();
}

// 최종 답안 칸 초기화
function clearFinalAnswer() {
    finalAnswerFactors = [];
    updateFinalAnswerDisplay();
}

// 지수 표현 변환 함수 및 화면 업데이트
function updateFinalAnswerDisplay() {
    if (finalAnswerFactors.length === 0) {
        finalAnswerDisplay.textContent = "소수 카드를 클릭하여 채우세요";
        finalAnswerDisplay.className = "empty-answer";
        return;
    }
    
    finalAnswerDisplay.className = "";
    finalAnswerDisplay.innerHTML = formatFactors(finalAnswerFactors);
}

// 문제 조건에 명시된 지수 표현 변환 함수 (formatFactors)
function formatFactors(factors) {
    if (!factors || factors.length === 0) return "";
    
    // 작은 소수부터 정렬
    const sorted = [...factors].sort((a, b) => a - b);
    
    // 각 소인수 빈도수 측정
    const counts = {};
    sorted.forEach(f => {
        counts[f] = (counts[f] || 0) + 1;
    });
    
    // 거듭제곱(지수) 문자열 포맷팅
    const parts = Object.keys(counts).map(prime => {
        const count = counts[prime];
        if (count > 1) {
            // 지수를 상첨자(유니코드 기호)로 치환하여 표현
            return `${prime}${getSuperscript(count)}`;
        }
        return `${prime}`;
    });
    
    return parts.join(" × ");
}

// 숫자를 유니코드 상첨자(지수 표현용)로 바꿔주는 헬퍼 함수
function getSuperscript(num) {
    const superscripts = {
        '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
        '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
    };
    return num.toString().split('').map(digit => superscripts[digit] || digit).join('');
}

// 15. 최종 정답 확인 (방식 B 검증)
function checkFinalAnswer() {
    if (currentStep !== "final-answer") return;
    
    const currentQuestion = gameQuestions[currentQuestionIndex];
    
    // 오답/정답 판별 기준: 나눗셈 기록에서 얻은 소수 목록과 최종 입력 소수 목록이 같은지 비교 (순서 무관)
    const systemFactors = [...selectedDivisors].sort((a, b) => a - b);
    const userFactors = [...finalAnswerFactors].sort((a, b) => a - b);
    
    // 원본 정답 배열과도 최종 교차 매칭 검증
    const correctFactors = [...currentQuestion.factors].sort((a, b) => a - b);

    const isMatchWithHistory = JSON.stringify(systemFactors) === JSON.stringify(userFactors);
    const isMatchWithAnswer = JSON.stringify(correctFactors) === JSON.stringify(userFactors);
    
    panelFactorization.classList.add("disabled-pointer"); // 임시 비활성화 느낌
    
    if (isMatchWithHistory && isMatchWithAnswer) {
        // 완벽하게 소인수분해를 성공한 경우
        score += 3; // 최종 답안 보너스 3점 추가
        correctCount++;
        caughtCount++;
        
        monsterChar.className = "monster sparkle"; // 완벽 칭찬 애니메이션
        showFeedback(true, `🎯 포획 성공!<br>${currentQuestion.number} = ${currentQuestion.explanation}<br>합성수 몬스터의 약점 코드를 정확히 찾았습니다!`);
    } else {
        // 오답인 경우
        monsterChar.className = "monster shake";
        showFeedback(false, `❌ 분석 실패!<br>ㄴ자 나눗셈 연구 노트에서 찾은 소수들을 다시 정확하게 조합해 보세요.<br><strong>정답 해설:</strong> ${currentQuestion.explanation}`);
    }
    
    currentScoreDisp.textContent = score;
    
    // 컨트롤 비활성화 및 다음 버튼 활성화
    btnNext.classList.remove("hidden");
    // 최종 확인 후 다시 수정하지 못하도록 고정
    finalAnswerSection.classList.add("disabled");
    btnUndo.style.display = "none";
}

// 16. 알림 피드백 박스 출력 유틸리티
function showFeedback(isSuccess, message, isSticky = false) {
    feedbackMessage.classList.remove("hidden");
    feedbackMessage.innerHTML = message;
    
    if (isSuccess) {
        feedbackMessage.className = "feedback-box success";
    } else {
        feedbackMessage.className = "feedback-box wrong";
    }
}

// 17. 다음 문제로 이동 핸들러
function moveToNextQuestion() {
    btnUndo.style.style = ""; // undo 활성화 원복
    btnUndo.style.display = "inline-flex";
    
    currentQuestionIndex++;
    
    if (currentQuestionIndex < 10) {
        displayQuestion();
    } else {
        showResultScreen();
    }
}

// 18. 게임 결과 스크린 출력
function showResultScreen() {
    showScreen(resultScreen);
    
    // 통계치 출력
    document.getElementById("res-score").textContent = score;
    document.getElementById("res-correct-count").textContent = `${correctCount} / 10`;
    document.getElementById("res-caught-count").textContent = `${caughtCount}마리`;
    document.getElementById("res-wrong-clicks").textContent = `${wrongClickCount}회`;
    
    // 점수대별 맞춤 평가 문구 제공
    const evaluationDisp = document.getElementById("res-evaluation");
    if (score >= 90) {
        evaluationDisp.textContent = "🏆 소인수분해 마스터!";
    } else if (score >= 70) {
        evaluationDisp.textContent = "⭐ 훌륭한 몬스터 연구원!";
    } else if (score >= 50) {
        evaluationDisp.textContent = "👍 조금만 더 연습하면 완벽해요!";
    } else {
        evaluationDisp.textContent = "📚 소수와 합성수부터 다시 복습해 봅시다!";
    }
}
