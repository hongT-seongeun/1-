const games = [
  {
    unit: '소인수분해',
    title: '소수 몬스터 잡기',
    description:
      '소수 몬스터와 합성수 몬스터를 구분하고, 합성수를 소인수분해해 퇴치하는 게임',
    emoji: '🧩',
    status: 'playable',
    buttonText: '입장하기',
    pagePath: './prime_factorization_game/index.html'
  },
  {
    unit: '정수와 유리수',
    title: '상어 잡기 게임',
    description:
      '정수와 유리수의 개념을 이용해 상어를 잡으며 움직이는 바다 속 수학 미션 게임',
    emoji: '🦈',
    status: 'playable',
    buttonText: '입장하기',
    pagePath: './SHARK_GAME/index.html'
  },
  {
    unit: '문자의 사용과 식',
    title: '수학 상점 계산 미션',
    description:
      '문자를 사용해 식을 만들고 식의 값을 계산하는 게임',
    emoji: '🛒',
    status: 'coming-soon',
    buttonText: '준비중'
  },
  {
    unit: '일차방정식',
    title: '방정식 탈출 미션',
    description:
      '방정식을 풀어 잠긴 문을 열고 단계별 미션을 해결하는 게임',
    emoji: '🔐',
    status: 'coming-soon',
    buttonText: '준비중'
  },
  {
    unit: '좌표평면과 그래프',
    title: '박스 좌표 배송',
    description:
      '좌표를 읽고 그래프 위의 점을 찾아 박스를 정확한 위치로 배송하는 게임',
    emoji: '📦',
    status: 'playable',
    buttonText: '입장하기',
    pagePath: './BOX_GAME/index.html'
  }
];

const gameList = document.getElementById('game-list');
const modal = document.getElementById('info-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const closeModalButton = document.getElementById('close-modal');

function renderGames() {
  if (!gameList) return;

  gameList.innerHTML = '';

  games.forEach((game, index) => {
    const card = document.createElement('article');
    card.className = 'game-card';

    const isPlayable = game.status === 'playable';
    const statusClass = isPlayable ? 'status-playable' : 'status-coming-soon';
    const statusText = isPlayable ? '입장 가능' : '준비중';

    card.innerHTML = `
      <div class="card-top">
        <div class="emoji-circle">${game.emoji}</div>
        <span class="status-badge ${statusClass}">${statusText}</span>
      </div>
      <div class="card-body">
        <p class="unit-name">${game.unit}</p>
        <h3>${game.title}</h3>
        <p class="card-description">${game.description}</p>
      </div>
      <button type="button" class="game-action ${game.status}" data-index="${index}">
        ${game.buttonText}
      </button>
    `;

    gameList.appendChild(card);
  });

  const actionButtons = gameList.querySelectorAll('.game-action');
  actionButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const game = games[Number(button.dataset.index)];

      if (game.status === 'playable' && game.pagePath) {
        window.location.assign(game.pagePath);
        return;
      }

      openModal('알림', '이 게임은 아직 준비중입니다.');
    });
  });
}

function openModal(title, message) {
  if (!modal || !modalTitle || !modalMessage) return;

  modalTitle.textContent = title;
  modalMessage.textContent = message;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  if (!modal) return;

  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

if (closeModalButton) {
  closeModalButton.addEventListener('click', closeModal);
}

if (modal) {
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modal?.classList.contains('open')) {
    closeModal();
  }
});

renderGames();
