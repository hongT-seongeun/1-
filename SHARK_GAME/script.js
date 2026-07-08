/* 배경 물방울 자동 배치 시스템 */
function createBubbleDeco() {
  const bubbleLayer = document.getElementById('bubble-layer');
  bubbleLayer.innerHTML = '';
  for (let i = 0; i < 22; i++) {
    const bubble = document.createElement('div');
    bubble.className = 'bubble-bg';
    const size = Math.random() * 30 + 8;
    bubble.style.width = size + 'px';
    bubble.style.height = size + 'px';
    bubble.style.left = Math.random() * 100 + '%';
    bubble.style.animationDelay = Math.random() * 9 + 's';
    bubble.style.animationDuration = (Math.random() * 6 + 5) + 's';
    bubbleLayer.appendChild(bubble);
  }
}
createBubbleDeco();

/* 게임 코어 변수 */
const oceanTank = document.getElementById('ocean-tank');
const timerDisplay = document.getElementById('timer-display');
const scoreDisplay = document.getElementById('score-display');
const heartsContainer = document.getElementById('hearts-container');

const numpadOverlay = document.getElementById('numpad-overlay');
const numpadQuestionText = document.getElementById('numpad-question-text');
const numpadDisplayText = document.getElementById('numpad-display-text');
const hintBox = document.getElementById('hint-box');

const startScreen = document.getElementById('start-screen');
const playArea = document.getElementById('play-area');
const gameoverScreen = document.getElementById('gameover-screen');
const btnBackToLobby = document.getElementById('btn-back-to-lobby');
const btnGoToStart = document.getElementById('btn-go-to-start');
const btnResetGame = document.getElementById('btn-reset-game');

btnBackToLobby.addEventListener('click', () => {
  window.location.href = '../index.html';
});
btnGoToStart.addEventListener('click', confirmAndGoToStart);
btnResetGame.addEventListener('click', confirmAndRestart);

let sharks = [];
let currentScore = 0;
let killedSharksCount = 0;
let timeLeft = 60;
let hearts = 5;
let gameTimerInterval = null;
let gameLoopRequest = null;
let activeSharkForNumpad = null;
let currentInputString = '';
let isGameRunning = false;

function updateTopNav(activeScreen) {
  const showGameButtons = activeScreen !== startScreen;
  btnBackToLobby.classList.toggle('hidden', showGameButtons);
  btnGoToStart.classList.toggle('hidden', !showGameButtons);
  btnResetGame.classList.toggle('hidden', !showGameButtons);
}

function showScreen(screenElement) {
  document.querySelectorAll('.screen').forEach((screen) => {
    screen.classList.remove('active');
    screen.classList.add('hidden');
  });

  screenElement.classList.remove('hidden');
  screenElement.classList.add('active');
  updateTopNav(screenElement);
}

function confirmAndGoToStart() {
  const confirmed = window.confirm('시작화면으로 이동하겠습니까?');
  if (confirmed) {
    showScreen(startScreen);
  }
}

function confirmAndRestart() {
  const confirmed = window.confirm('처음으로 이동하겠습니까?');
  if (confirmed) {
    initAndStartGame();
  }
}

function generateMathProblem() {
  const operators = ['+', '-', '×', '÷'];
  const op = operators[Math.floor(Math.random() * operators.length)];

  let n1 = Math.floor(Math.random() * 16) - 8;
  if (n1 === 0) n1 = 3;
  let n2 = Math.floor(Math.random() * 16) - 8;
  if (n2 === 0) n2 = -2;

  let question = '';
  let answer = 0;

  const format = (num) => (num < 0 ? `(${num})` : `${num}`);

  switch (op) {
    case '+':
      question = `${format(n1)} + ${format(n2)}`;
      answer = n1 + n2;
      break;
    case '-':
      question = `${format(n1)} - ${format(n2)}`;
      answer = n1 - n2;
      break;
    case '×':
      question = `${format(n1)} × ${format(n2)}`;
      answer = n1 * n2;
      break;
    case '÷': {
      let qVal = Math.floor(Math.random() * 8) - 4;
      if (qVal === 0) qVal = 2;
      answer = qVal;
      n1 = qVal * n2;
      question = `${format(n1)} ÷ ${format(n2)}`;
      break;
    }
  }

  return { question, answer, op, n1, n2 };
}

function initAndStartGame() {
  showScreen(playArea);
  numpadOverlay.classList.add('hidden');
  hintBox.style.display = 'none';

  currentScore = 0;
  killedSharksCount = 0;
  timeLeft = 60;
  hearts = 5;
  isGameRunning = true;
  activeSharkForNumpad = null;
  currentInputString = '';

  sharks.forEach((s) => s.element.remove());
  sharks = [];

  updateUI();

  for (let i = 0; i < 8; i += 1) {
    spawnShark();
  }

  clearInterval(gameTimerInterval);
  gameTimerInterval = setInterval(() => {
    if (isGameRunning && !activeSharkForNumpad) {
      timeLeft -= 1;
      updateUI();

      if (timeLeft <= 0) {
        endGame(true);
      }

      if (sharks.length < 6 && Math.random() < 0.6) {
        spawnShark();
      }
    }
  }, 1000);

  cancelAnimationFrame(gameLoopRequest);
  gameLoopRequest = requestAnimationFrame(updateGameLoop);
}

function spawnShark() {
  const problem = generateMathProblem();
  const sharkEl = document.createElement('div');
  sharkEl.className = 'shark';

  const bubble = document.createElement('div');
  bubble.className = 'math-bubble';
  bubble.innerText = problem.question;
  sharkEl.appendChild(bubble);

  const body = document.createElement('div');
  body.className = 'shark-body';
  body.innerText = '🦈';
  sharkEl.appendChild(body);

  oceanTank.appendChild(sharkEl);

  const newShark = {
    element: sharkEl,
    question: problem.question,
    answer: problem.answer,
    op: problem.op,
    n1: problem.n1,
    n2: problem.n2,
    x: Math.random() * (oceanTank.clientWidth - 170) + 10,
    y: Math.random() * (oceanTank.clientHeight - 220) + 80,
    vx: (Math.random() * 2.2 + 1.2) * (Math.random() > 0.5 ? 1 : -1),
    vy: (Math.random() * 1.0 + 0.4) * (Math.random() > 0.5 ? 1 : -1),
    swimOffset: Math.random() * 100,
    isPaused: false
  };

  sharkEl.addEventListener('click', () => {
    if (!isGameRunning) return;
    openNumpad(newShark);
  });

  sharks.push(newShark);
}

function updateGameLoop() {
  if (isGameRunning) {
    sharks.forEach((shark) => {
      if (shark.isPaused) return;

      shark.x += shark.vx;
      shark.y += shark.vy;

      const maxX = oceanTank.clientWidth - 150;
      const maxY = oceanTank.clientHeight - 130;
      const minY = 70;

      if (shark.x <= 0) {
        shark.x = 0;
        shark.vx *= -1;
      } else if (shark.x >= maxX) {
        shark.x = maxX;
        shark.vx *= -1;
      }

      if (shark.y <= minY) {
        shark.y = minY;
        shark.vy *= -1;
      } else if (shark.y >= maxY) {
        shark.y = maxY;
        shark.vy *= -1;
      }

      const swimWiggle = Math.sin(Date.now() * 0.01 + shark.swimOffset) * 10;
      const sharkBodyEl = shark.element.querySelector('.shark-body');

      if (shark.vx > 0) {
        sharkBodyEl.style.transform = `scaleX(-1) rotate(${swimWiggle}deg)`;
      } else {
        sharkBodyEl.style.transform = `scaleX(1) rotate(${swimWiggle}deg)`;
      }

      shark.element.style.left = shark.x + 'px';
      shark.element.style.top = shark.y + 'px';
    });
  }
  gameLoopRequest = requestAnimationFrame(updateGameLoop);
}

function openNumpad(shark) {
  activeSharkForNumpad = shark;
  shark.isPaused = true;
  currentInputString = '';

  numpadQuestionText.innerText = `${shark.question} = ?`;
  numpadDisplayText.innerText = '?';
  hintBox.style.display = 'none';
  numpadOverlay.classList.remove('hidden');
}

function closeNumpad() {
  if (activeSharkForNumpad) {
    activeSharkForNumpad.isPaused = false;
  }
  activeSharkForNumpad = null;
  numpadOverlay.classList.add('hidden');
}

function pressKey(val) {
  if (val === 'C') {
    currentInputString = '';
  } else if (val === 'back') {
    currentInputString = currentInputString.slice(0, -1);
  } else if (val === '-') {
    if (currentInputString.startsWith('-')) {
      currentInputString = currentInputString.slice(1);
    } else {
      currentInputString = '-' + currentInputString;
    }
  } else {
    if (currentInputString.length < 6) {
      currentInputString += val;
    }
  }

  numpadDisplayText.innerText = currentInputString === '' ? '?' : currentInputString;
}

function getInstructionHint(n1, n2, op, correctAns, studentAns) {
  const correctSign = correctAns >= 0 ? '+' : '-';
  const studentSign = studentAns >= 0 ? '+' : '-';

  const isSignWrong = correctSign !== studentSign;
  const isValueWrong = Math.abs(correctAns) !== Math.abs(studentAns);

  let signHint = '';
  let valHint = '';

  switch (op) {
    case '+':
      if (n1 >= 0 && n2 >= 0) {
        signHint = '양수(+)끼리의 덧셈 결과는 항상 양수(+)가 됩니다.';
      } else if (n1 < 0 && n2 < 0) {
        signHint = '음수(-)끼리의 덧셈 결과는 항상 음수(-)가 됩니다.';
      } else {
        const abs1 = Math.abs(n1);
        const abs2 = Math.abs(n2);
        const dominantNum = abs1 > abs2 ? n1 : n2;
        signHint = `절댓값이 더 큰 수인 ${dominantNum < 0 ? '음수(-)' : '양수(+)'}의 부호를 따라가야 합니다.`;
      }
      break;
    case '-':
      signHint = '정수의 뺄셈은 빼는 수의 부호를 반대로 바꾸어 덧셈으로 바꿔서 생각해 보세요.';
      break;
    case '×':
    case '÷':
      if ((n1 >= 0 && n2 >= 0) || (n1 < 0 && n2 < 0)) {
        signHint = '같은 부호끼리의 곱셈/나눗셈 결과는 항상 양수(+)입니다.';
      } else {
        signHint = '서로 다른 부호끼리의 곱셈/나눗셈 결과는 항상 음수(-)입니다.';
      }
      break;
  }

  switch (op) {
    case '+':
      if ((n1 >= 0 && n2 >= 0) || (n1 < 0 && n2 < 0)) {
        valHint = `부호가 같으므로 두 수의 절댓값 크기(${Math.abs(n1)}와 ${Math.abs(n2)})를 더해 줘야 합니다.`;
      } else {
        valHint = `부호가 다르므로 절댓값이 큰 수에서 작은 수의 절댓값을 빼야 합니다. (${Math.max(Math.abs(n1), Math.abs(n2))} - ${Math.min(Math.abs(n1), Math.abs(n2))})`;
      }
      break;
    case '-':
      valHint = '뺄셈은 빼는 수의 부호를 바꾼 뒤 덧셈으로 바꾸어 계산해 보세요.';
      break;
    case '×':
      valHint = `두 수의 절댓값 곱셈 계산(${Math.abs(n1)} × ${Math.abs(n2)})을 다시 확인해 보세요.`;
      break;
    case '÷':
      valHint = `두 수의 절댓값 나눗셈 계산(${Math.abs(n1)} ÷ ${Math.abs(n2)})을 다시 천천히 확인해 보세요.`;
      break;
  }

  if (isSignWrong && !isValueWrong) {
    return `🎯 아까워요! 숫자의 크기는 맞았지만 부호가 틀렸습니다.\n📌 부호 힌트: ${signHint}`;
  }
  if (!isSignWrong && isValueWrong) {
    return `🎯 부호는 맞았지만, 계산된 숫자가 틀렸습니다.\n📌 숫자 힌트: ${valHint}`;
  }
  return `🔍 부호와 숫자가 모두 일치하지 않습니다.\n📌 부호 확인: ${signHint}\n📌 계산법 확인: ${valHint}`;
}

function submitAnswer() {
  if (!activeSharkForNumpad) return;

  const correctAns = activeSharkForNumpad.answer;
  const studentAns = parseInt(currentInputString, 10);

  if (Number.isNaN(studentAns)) {
    alert('숫자를 완성한 후 정답 확인을 눌러주세요!');
    return;
  }

  if (studentAns === correctAns) {
    currentScore += 100;
    killedSharksCount += 1;
    timeLeft = Math.min(timeLeft + 5, 120);

    const hitShark = activeSharkForNumpad;
    hitShark.element.style.opacity = '0';
    setTimeout(() => {
      hitShark.element.remove();
    }, 300);

    sharks = sharks.filter((s) => s !== hitShark);

    closeNumpad();
    updateUI();

    if (sharks.length === 0) {
      for (let i = 0; i < 6; i += 1) spawnShark();
    } else if (sharks.length < 5) {
      spawnShark();
    }
  } else {
    hearts -= 1;
    updateUI();

    const windowEl = document.querySelector('.numpad-window');
    windowEl.style.animation = 'shake 0.3s ease';
    setTimeout(() => {
      windowEl.style.animation = '';
    }, 300);

    const customHint = getInstructionHint(
      activeSharkForNumpad.n1,
      activeSharkForNumpad.n2,
      activeSharkForNumpad.op,
      correctAns,
      studentAns
    );
    hintBox.innerText = customHint;
    hintBox.style.display = 'block';

    currentInputString = '';
    numpadDisplayText.innerText = '?';

    if (hearts <= 0) {
      closeNumpad();
      endGame(false);
    }
  }
}

function endGame(isTimeOut) {
  isGameRunning = false;
  clearInterval(gameTimerInterval);
  cancelAnimationFrame(gameLoopRequest);

  const heartBonus = hearts * 200;
  const timeBonus = Math.max(0, timeLeft) * 10;
  const finalScore = currentScore + heartBonus + timeBonus;

  document.getElementById('final-score-val').innerText = finalScore;
  document.getElementById('final-stats-info').innerText =
    `기본 점수: ${currentScore}점 | 격파한 상어: ${killedSharksCount}마리\n(체력 보너스(하트당 200점): +${heartBonus}점 / 시간 보너스: +${timeBonus}점)`;

  let commentText = '조금 더 연습해 볼까요? 사칙연산의 규칙을 차근차근 다져봐요!';
  if (finalScore >= 2500) {
    commentText = '🏆 대단합니다! 정수와 유리수 사칙연산을 완벽히 격파한 바다의 수학 전사로 등극하셨습니다!';
  } else if (finalScore >= 1500) {
    commentText = '✨ 실력이 뛰어납니다! 부호 계산을 완벽하게 해내시는 수학 마법사시네요!';
  }
  document.getElementById('final-comment').innerText = commentText;

  const resultTitle = document.getElementById('game-result-title');
  if (hearts <= 0) {
    resultTitle.innerText = '😭 아쉽습니다! (체력 소진)';
    resultTitle.style.color = 'var(--accent)';
  } else {
    resultTitle.innerText = '⏱️ 제한 시간 끝!';
    resultTitle.style.color = '#ffd166';
  }

  showScreen(gameoverScreen);
}

function updateUI() {
  heartsContainer.innerHTML = '';
  for (let i = 0; i < 5; i += 1) {
    const h = document.createElement('i');
    if (i < hearts) {
      h.className = 'fa-solid fa-heart heart-icon';
      h.style.color = 'var(--accent)';
    } else {
      h.className = 'fa-regular fa-heart heart-icon';
      h.style.color = '#8b949e';
    }
    heartsContainer.appendChild(h);
  }

  timerDisplay.innerText = `시간: ${timeLeft}s`;
  scoreDisplay.innerText = `점수: ${currentScore}점`;
}

const styleSheet = document.createElement('style');
styleSheet.innerText = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-8px); }
    40%, 80% { transform: translateX(8px); }
  }
`;
document.head.appendChild(styleSheet);
