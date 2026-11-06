const games = [
  {
    id: "tic-tac-toe",
    title: "Tic-Tac-Toe",
    tag: "Classic",
    icon: "✖️",
    description: "Take turns and line up three marks to win a fast round.",
  },
  {
    id: "memory",
    title: "Memory Match",
    tag: "Puzzle",
    icon: "🧠",
    description: "Flip cards and match pairs to beat the board.",
  },
  {
    id: "reaction",
    title: "Reaction Test",
    tag: "Arcade",
    icon: "⚡",
    description: "Wait for the right moment and click as fast as you can.",
  },
];

const gameGrid = document.getElementById("game-grid");

function renderGameCards() {
  gameGrid.innerHTML = games
    .map(
      (game) => `
        <article class="game-card">
          <div class="game-card-header">
            <div class="game-icon">${game.icon}</div>
            <span class="tag">${game.tag}</span>
          </div>
          <div>
            <h4>${game.title}</h4>
          </div>
          <p>${game.description}</p>
          <button class="card-btn" data-game-id="${game.id}">Play</button>
        </article>
      `,
    )
    .join("");

  gameGrid.querySelectorAll(".card-btn").forEach((button) => {
    button.addEventListener("click", () => {
      renderGamePanel(button.dataset.gameId);
      window.location.hash = `#${button.dataset.gameId}`;
    });
  });
}

function renderGamePanel(gameId) {
  const activeGame = games.find((game) => game.id === gameId);
  if (!activeGame) return;

  const panel = document.createElement("section");
  panel.id = activeGame.id;
  panel.className = "game-shell";

  const toolbar = document.createElement("div");
  toolbar.className = "game-toolbar";
  toolbar.innerHTML = `
    <h4>${activeGame.title}</h4>
    <button class="secondary-btn" id="close-game">Close</button>
  `;

  const area = document.createElement("div");
  area.className = "game-area";

  let gameMarkup = "";

  if (activeGame.id === "tic-tac-toe") {
    gameMarkup = `
      <div class="tic-tac-toe-board" aria-label="Tic tac toe board">
        ${Array.from({ length: 9 }, (_, idx) => `<button class="cell" data-index="${idx}" aria-label="Cell ${idx + 1}"></button>`).join("")}
      </div>
    `;
  }

  if (activeGame.id === "memory") {
    const symbols = ["🍉", "🍋", "🍇", "🍓", "🍒", "🍊", "🍎", "🍏"];
    const deck = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
    gameMarkup = `
      <div class="memory-grid" data-deck="${deck.join(",")}">
        ${deck
          .map(
            (symbol, index) => `
              <button class="memory-card" data-index="${index}" aria-label="Memory card ${index + 1}"></button>
            `,
          )
          .join("")}
      </div>
    `;
  }

  if (activeGame.id === "reaction") {
    gameMarkup = `
      <div class="reaction-box" id="reaction-box">Press start to play</div>
    `;
  }

  area.innerHTML = gameMarkup;

  const status = document.createElement("div");
  status.className = "status-line";
  status.id = `status-${activeGame.id}`;

  panel.appendChild(toolbar);
  panel.appendChild(area);
  panel.appendChild(status);

  const existing = document.querySelector(".game-shell");
  if (existing) {
    existing.remove();
  }

  gameGrid.insertAdjacentElement("afterend", panel);

  const closeButton = document.getElementById("close-game");
  closeButton.addEventListener("click", () => panel.remove());

  if (gameId === "tic-tac-toe") initializeTicTacToe();
  if (gameId === "memory") initializeMemoryGame();
  if (gameId === "reaction") initializeReactionGame();
}

function initializeTicTacToe() {
  const cells = [...document.querySelectorAll(".cell")];
  const status = document.getElementById("status-tic-tac-toe");
  let currentPlayer = "X";
  let board = Array(9).fill("");
  const winningLines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  status.textContent = "Player X's turn";

  cells.forEach((cell) => {
    cell.addEventListener("click", () => {
      const index = Number(cell.dataset.index);
      if (board[index] || status.dataset.finished === "true") return;

      board[index] = currentPlayer;
      cell.textContent = currentPlayer;

      const winner = winningLines.find((line) => line.every((i) => board[i] === currentPlayer));
      if (winner) {
        status.textContent = `Player ${currentPlayer} wins!`;
        status.dataset.finished = "true";
        return;
      }

      if (board.every(Boolean)) {
        status.textContent = "Draw!";
        status.dataset.finished = "true";
        return;
      }

      currentPlayer = currentPlayer === "X" ? "O" : "X";
      status.textContent = `Player ${currentPlayer}'s turn`;
    });
  });
}

function initializeMemoryGame() {
  const cards = [...document.querySelectorAll(".memory-card")];
  const deck = document.querySelector(".memory-grid").dataset.deck.split(",");
  const status = document.getElementById("status-memory");
  let firstCard = null;
  let secondCard = null;
  let lockBoard = false;

  cards.forEach((card, index) => {
    card.textContent = deck[index];
    card.addEventListener("click", () => {
      if (lockBoard || card.classList.contains("revealed") || card.classList.contains("matched")) return;

      card.classList.add("revealed");
      card.textContent = deck[index];

      if (!firstCard) {
        firstCard = card;
        return;
      }

      secondCard = card;
      if (firstCard.textContent === secondCard.textContent) {
        firstCard.classList.add("matched");
        secondCard.classList.add("matched");
        status.textContent = "Match found!";
        firstCard = null;
        secondCard = null;

        if ([...document.querySelectorAll(".memory-card.matched")].length === cards.length) {
          status.textContent = "You won!";
        }
        return;
      }

      lockBoard = true;
      status.textContent = "Not a match — try again";
      setTimeout(() => {
        firstCard.classList.remove("revealed");
        secondCard.classList.remove("revealed");
        firstCard.textContent = "";
        secondCard.textContent = "";
        firstCard = null;
        secondCard = null;
        lockBoard = false;
        status.textContent = "Keep going!";
      }, 700);
    });
  });
}

function initializeReactionGame() {
  const reactionBox = document.getElementById("reaction-box");
  const status = document.getElementById("status-reaction");
  let timer = null;
  let active = false;
  let startTime = 0;
  let waiting = false;

  reactionBox.addEventListener("click", () => {
    if (!active) {
      active = true;
      waiting = false;
      reactionBox.textContent = "Wait for green...";
      reactionBox.classList.remove("ready", "warn");
      status.textContent = "Stay ready";
      const delay = 2000 + Math.random() * 2000;
      timer = setTimeout(() => {
        waiting = true;
        startTime = performance.now();
        reactionBox.textContent = "CLICK!";
        reactionBox.classList.add("ready");
        status.textContent = "Tap now!";
      }, delay);
      return;
    }

    if (waiting) {
      const reactionSpeed = Math.round(performance.now() - startTime);
      status.textContent = `Your reaction time: ${reactionSpeed}ms`;
      reactionBox.textContent = "Play again";
      reactionBox.classList.remove("ready", "warn");
      clearTimeout(timer);
      active = false;
      waiting = false;
      return;
    }

    if (!waiting) {
      clearTimeout(timer);
      reactionBox.textContent = "Too soon!";
      reactionBox.classList.add("warn");
      status.textContent = "Wait for green before clicking";
      active = false;
      waiting = false;
    }
  });
}

renderGameCards();
