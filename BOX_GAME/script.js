const screenHome = document.getElementById('screen-home');
const screenPlay = document.getElementById('screen-play');
const introModal = document.getElementById('intro-modal');
const helpModal = document.getElementById('help-modal');
const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');

const missionTitleEl = document.getElementById('mission-title');
const missionBoxEl = document.getElementById('mission-box');
const phaseLabelEl = document.getElementById('phase-label');
const missionClueEl = document.getElementById('mission-clue');
const selectedPointEl = document.getElementById('selected-point');
const progressBarEl = document.getElementById('progress-bar');
const scoreEl = document.getElementById('score');
const comboEl = document.getElementById('combo');
const timerEl = document.getElementById('timer');
const levelEl = document.getElementById('level');
const feedbackEl = document.getElementById('feedback');
const coordInputsEl = document.getElementById('coord-inputs');
const xInput = document.getElementById('x-input');
const yInput = document.getElementById('y-input');
const deliverButton = document.getElementById('deliver-button');
const actionRowEl = deliverButton.closest('.button-grid');

const missions = [
  {
    title: '1단계: 교실 앞 배송 요청',
    requestPoint: { x: 2, y: 3 },
    destination: { x: -1, y: 4 }
  },
  {
    title: '2단계: 운동장 배송 요청',
    requestPoint: { x: -4, y: 1 },
    destination: { x: 3, y: -2 }
  },
  {
    title: '3단계: 도서관 배송 요청',
    requestPoint: { x: 0, y: -3 },
    destination: { x: -5, y: -1 }
  },
  {
    title: '4단계: 급식실 배송 요청',
    requestPoint: { x: 4, y: 0 },
    destination: { x: -2, y: 2 }
  },
  {
    title: '5단계: 과학실 배송 요청',
    requestPoint: { x: -3, y: -4 },
    destination: { x: 5, y: 3 }
  }
];

const gameState = {
  score: 0,
  combo: 0,
  time: 90,
  missionIndex: 0,
  phase: 'accept',
  selected: null,
  timerId: null,
  animationId: null,
  startTime: 0
};

function startGame() {
  introModal.classList.remove('hidden');
}

function startActualGame() {
  introModal.classList.add('hidden');
  screenHome.classList.add('hidden');
  screenPlay.classList.remove('hidden');

  gameState.score = 0;
  gameState.combo = 0;
  gameState.time = 90;
  gameState.missionIndex = 0;
  gameState.phase = 'accept';
  gameState.selected = null;
  gameState.startTime = performance.now();

  window.clearInterval(gameState.timerId);
  gameState.timerId = window.setInterval(tickTimer, 1000);

  resizeCanvas();
  loadMission();
  startAnimation();
}

function goToHome() {
  stopGameLoops();
  screenPlay.classList.add('hidden');
  screenHome.classList.remove('hidden');
  introModal.classList.add('hidden');
  helpModal.classList.add('hidden');
}

function openHelpModal() {
  helpModal.classList.remove('hidden');
}

function closeHelpModal() {
  helpModal.classList.add('hidden');
}

function stopGameLoops() {
  window.clearInterval(gameState.timerId);
  window.cancelAnimationFrame(gameState.animationId);
}

function tickTimer() {
  gameState.time -= 1;
  timerEl.textContent = String(gameState.time);

  if (gameState.time > 0) return;

  stopGameLoops();
  setFeedback('시간 종료! 홈에서 다시 시작할 수 있어요.', 'bad');
  deliverButton.disabled = true;
}

function startAnimation() {
  window.cancelAnimationFrame(gameState.animationId);

  function frame(now) {
    gameState.startTime = gameState.startTime || now;
    drawBoard(now);
    gameState.animationId = window.requestAnimationFrame(frame);
  }

  gameState.animationId = window.requestAnimationFrame(frame);
}

function loadMission() {
  const mission = currentMission();
  gameState.phase = 'accept';
  gameState.selected = null;
  deliverButton.disabled = false;
  deliverButton.textContent = '요청 수락';
  deliverButton.classList.remove('hidden');
  actionRowEl.classList.remove('delivery-mode');
  missionBoxEl.classList.remove('letter-message');
  coordInputsEl.classList.remove('hidden', 'disabled');
  xInput.disabled = false;
  yInput.disabled = false;
  xInput.value = '';
  yInput.value = '';

  missionTitleEl.textContent = mission.title;
  phaseLabelEl.textContent = '배송 요청';
  missionClueEl.textContent =
    '지도에서 반짝이는 점을 확인하고, 그 점의 순서쌍을 입력해 배송요청을 수락하세요.';
  levelEl.textContent = String(gameState.missionIndex + 1);
  scoreEl.textContent = String(gameState.score);
  comboEl.textContent = String(gameState.combo);
  timerEl.textContent = String(gameState.time);
  progressBarEl.style.width = `${(gameState.missionIndex / missions.length) * 100}%`;
  updateSelectedText();
  setFeedback('반짝이는 배송요청 지점의 순서쌍을 (x, y) 순서로 입력하세요.', '');
  xInput.focus();
}

function currentMission() {
  return missions[gameState.missionIndex];
}

function resizeCanvas() {
  if (screenPlay.classList.contains('hidden')) return;

  const rect = canvas.getBoundingClientRect();
  const size = Math.max(280, Math.floor(Math.min(rect.width, rect.height || rect.width)));
  const ratio = window.devicePixelRatio || 1;
  canvas.width = size * ratio;
  canvas.height = size * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  canvas.style.height = `${size}px`;
  drawBoard(performance.now());
}

function metrics() {
  const size = canvas.getBoundingClientRect().width;
  const padding = Math.max(34, size * 0.08);
  const unit = (size - padding * 2) / 10;
  return { size, padding, unit, origin: size / 2 };
}

function toCanvas(point) {
  const { origin, unit } = metrics();
  return {
    x: origin + point.x * unit,
    y: origin - point.y * unit
  };
}

function fromCanvas(x, y) {
  const { origin, unit } = metrics();
  return {
    x: Math.round((x - origin) / unit),
    y: Math.round((origin - y) / unit)
  };
}

function drawBoard(now = performance.now()) {
  if (screenPlay.classList.contains('hidden')) return;

  const { size, padding, unit, origin } = metrics();
  ctx.clearRect(0, 0, size, size);

  ctx.fillStyle = '#f8fbff';
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = '#dbeafe';
  ctx.lineWidth = 1;
  ctx.fillStyle = '#64748b';
  ctx.font = '700 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let value = -5; value <= 5; value += 1) {
    const pos = padding + (value + 5) * unit;
    ctx.beginPath();
    ctx.moveTo(pos, padding);
    ctx.lineTo(pos, size - padding);
    ctx.moveTo(padding, pos);
    ctx.lineTo(size - padding, pos);
    ctx.stroke();

    if (value !== 0) {
      ctx.fillText(String(value), pos, origin + 18);
      ctx.fillText(String(-value), origin - 18, pos);
    }
  }

  drawAxis(padding, size, origin);
  drawPoint({ x: 0, y: 0 }, '#64748b', '원점');

  if (gameState.phase === 'accept') {
    drawRequestPoint(currentMission().requestPoint, now);
  }

  if (gameState.phase === 'deliver') {
    drawAcceptedPoint(currentMission().requestPoint);
  }

  if (gameState.selected) {
    drawPoint(gameState.selected, '#f97316', '선택');
  }
}

function drawAxis(padding, size, origin) {
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(padding, origin);
  ctx.lineTo(size - padding, origin);
  ctx.moveTo(origin, size - padding);
  ctx.lineTo(origin, padding);
  ctx.stroke();

  ctx.fillStyle = '#1e293b';
  ctx.font = '900 15px sans-serif';
  ctx.fillText('x', size - padding + 14, origin);
  ctx.fillText('y', origin, padding - 14);
}

function drawRequestPoint(point, now) {
  const canvasPoint = toCanvas(point);
  const pulse = 0.5 + Math.sin(now / 180) * 0.5;
  const glowRadius = 16 + pulse * 14;

  ctx.save();
  ctx.fillStyle = `rgba(251, 191, 36, ${0.16 + pulse * 0.18})`;
  ctx.beginPath();
  ctx.arc(canvasPoint.x, canvasPoint.y, glowRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(canvasPoint.x, canvasPoint.y, 11 + pulse * 3, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(canvasPoint.x, canvasPoint.y, 8, 0, Math.PI * 2);
  ctx.fill();

  drawBubble(canvasPoint.x + 16, canvasPoint.y - 42, '배송요청');
  ctx.restore();
}

function drawAcceptedPoint(point) {
  drawPoint(point, '#16a34a', '수락완료');
}

function drawBubble(x, y, text) {
  ctx.font = '900 15px sans-serif';
  const width = ctx.measureText(text).width + 24;
  const height = 32;
  const radius = 12;

  ctx.fillStyle = '#ef4444';
  roundRect(x, y, width, height, radius);
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + width / 2, y + height / 2);
}

function roundRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawPoint(point, color, label) {
  const canvasPoint = toCanvas(point);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(canvasPoint.x, canvasPoint.y, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.font = '900 13px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, canvasPoint.x + 11, canvasPoint.y - 12);
}

function selectPoint(point) {
  if (point.x < -5 || point.x > 5 || point.y < -5 || point.y > 5) return;

  gameState.selected = point;
  updateSelectedText();
}

function updateSelectedText() {
  selectedPointEl.textContent = gameState.selected
    ? `선택 좌표: (${gameState.selected.x}, ${gameState.selected.y})`
    : '선택 좌표: 없음';
}

function handleMainAction() {
  if (gameState.phase === 'accept') {
    acceptRequest();
    return;
  }

  if (gameState.phase === 'deliver') {
    setFeedback('편지지 배송메시지에 적힌 순서쌍을 보고, 좌표평면 위의 점을 클릭하세요.', '');
  }
}

function acceptRequest() {
  const answer = readPairInput();

  if (!answer) {
    setFeedback('반짝이는 점의 x좌표와 y좌표를 정수로 입력하세요.', 'bad');
    return;
  }

  const requestPoint = currentMission().requestPoint;
  const correct = answer.x === requestPoint.x && answer.y === requestPoint.y;

  if (!correct) {
    gameState.combo = 0;
    comboEl.textContent = '0';
    setFeedback('요청 수락 실패! 반짝이는 점의 순서쌍을 다시 확인하세요.', 'bad');
    return;
  }

  gameState.phase = 'deliver';
  gameState.selected = null;
  deliverButton.classList.add('hidden');
  actionRowEl.classList.add('delivery-mode');
  missionBoxEl.classList.add('letter-message');
  coordInputsEl.classList.add('hidden');
  xInput.disabled = true;
  yInput.disabled = true;
  xInput.value = '';
  yInput.value = '';
  phaseLabelEl.textContent = '배송 요청 메시지';
  missionClueEl.textContent = `배송요청이 수락되었습니다. 박스를 (${currentMission().destination.x}, ${currentMission().destination.y})(으)로 배송해 주세요.`;
  updateSelectedText();
  setFeedback('입력칸은 사라졌습니다. 편지지에 적힌 순서쌍의 점을 지도에서 클릭하세요.', 'good');
}

function checkDeliveryPoint(point) {
  const destination = currentMission().destination;
  const correct = point.x === destination.x && point.y === destination.y;

  if (!correct) {
    gameState.combo = 0;
    comboEl.textContent = '0';
    setFeedback('아직 배송지가 아니에요. 메시지에 나온 순서쌍을 다시 확인하세요.', 'bad');
    return;
  }

  gameState.combo += 1;
  gameState.score += 120 + gameState.combo * 30;
  scoreEl.textContent = String(gameState.score);
  comboEl.textContent = String(gameState.combo);
  setFeedback('배송완료! 다음 배송 요청을 확인하세요.', 'good');

  if (gameState.missionIndex === missions.length - 1) {
    progressBarEl.style.width = '100%';
    stopGameLoops();
    setFeedback(`모든 배송완료! 최종 점수 ${gameState.score}점`, 'good');
    return;
  }

  window.setTimeout(() => {
    gameState.missionIndex += 1;
    loadMission();
  }, 900);
}

function setFeedback(message, type) {
  feedbackEl.textContent = message;
  feedbackEl.className = type ? `feedback ${type}` : 'feedback';
}

canvas.addEventListener('click', (event) => {
  if (gameState.phase === 'deliver') {
    const rect = canvas.getBoundingClientRect();
    const point = fromCanvas(event.clientX - rect.left, event.clientY - rect.top);
    selectPoint(point);
    checkDeliveryPoint(point);
    return;
  }

  event.preventDefault();
  setFeedback('먼저 반짝이는 배송요청 지점의 순서쌍을 입력해 요청을 수락하세요.', '');
});

deliverButton.addEventListener('click', handleMainAction);

xInput.addEventListener('input', () => {
  if (isValidCoordinateValue(xInput.value)) {
    yInput.focus();
    yInput.select();
  }
});

xInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    yInput.focus();
    yInput.select();
  }
});

yInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    handleMainAction();
  }
});

window.addEventListener('resize', resizeCanvas);

function readPairInput() {
  if (!isValidCoordinateValue(xInput.value) || !isValidCoordinateValue(yInput.value)) {
    return null;
  }

  return {
    x: Number(xInput.value),
    y: Number(yInput.value)
  };
}

function isValidCoordinateValue(value) {
  if (value === '') return false;

  const numberValue = Number(value);
  return Number.isInteger(numberValue) && numberValue >= -5 && numberValue <= 5;
}
