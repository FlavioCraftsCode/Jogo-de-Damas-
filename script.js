// Criação do tabuleiro
const board = document.getElementById("board");
const squares = [];
const boardSize = 8;
let currentPlayer = "red";
let selectedPiece = null;
let playerPieces = [];
let aiPieces = [];

// Função para criar o tabuleiro e as peças
function createBoard() {
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const square = document.createElement("div");
            square.classList.add("square");

            // Define quadrados pretos e brancos
            if ((row + col) % 2 === 0) {
                square.classList.add("white");
            } else {
                square.classList.add("black");

                // Adiciona peças nas três primeiras e últimas fileiras
                if (row < 3) {
                    const piece = document.createElement("div");
                    piece.classList.add("piece", "black");
                    square.appendChild(piece);
                    aiPieces.push(piece);
                } else if (row > 4) {
                    const piece = document.createElement("div");
                    piece.classList.add("piece", "red");
                    square.appendChild(piece);
                    playerPieces.push(piece);
                }
            }

            // Adiciona o quadrado ao tabuleiro e ao array
            board.appendChild(square);
            squares.push(square);
        }
    }
}

// Função para alternar turnos
function switchTurn() {
    currentPlayer = currentPlayer === "red" ? "black" : "red";

    if (currentPlayer === "black") {
        setTimeout(aiMove, 500); // Delay para a IA agir
    }
}

// Função para selecionar e mover peças do jogador
function addPieceListeners() {
    playerPieces.forEach(piece => {
        piece.addEventListener("click", function () {
            if (piece.classList.contains(currentPlayer)) {
                selectPiece(piece);
            }
        });
    });
}

function selectPiece(piece) {
    // Desmarca peça previamente selecionada, se houver
    if (selectedPiece) {
        selectedPiece.classList.remove("selected");
    }
    // Marca a peça atual como selecionada
    piece.classList.add("selected");
    selectedPiece = piece;
}

// Função de movimento
board.addEventListener("click", function (event) {
    if (selectedPiece && event.target.classList.contains("square")) {
        movePiece(event.target);
    }
});

function movePiece(targetSquare) {
    if (targetSquare.classList.contains("black") && !targetSquare.hasChildNodes()) {
        // Calcula índice de origem e destino
        const originIndex = squares.indexOf(selectedPiece.parentNode);
        const targetIndex = squares.indexOf(targetSquare);
        const difference = Math.abs(targetIndex - originIndex);

        if (difference === 7 || difference === 9) {
            // Movimento simples
            targetSquare.appendChild(selectedPiece);
            selectedPiece.classList.remove("selected");
            selectedPiece = null;
            switchTurn();
        } else if (difference === 14 || difference === 18) {
            // Movimento de captura
            const capturedIndex = (originIndex + targetIndex) / 2;
            const capturedSquare = squares[capturedIndex];
            if (capturedSquare.hasChildNodes()) {
                const capturedPiece = capturedSquare.firstChild;
                if (capturedPiece.classList.contains(currentPlayer === "red" ? "black" : "red")) {
                    capturedSquare.removeChild(capturedPiece);
                    targetSquare.appendChild(selectedPiece);
                    removePiece(capturedPiece);
                    selectedPiece.classList.remove("selected");
                    selectedPiece = null;
                    switchTurn();
                }
            }
        }
    }
}

function removePiece(piece) {
    // Remove visualmente a peça do tabuleiro
    piece.parentNode.removeChild(piece);

    // Remove peça do array correspondente
    if (piece.classList.contains("red")) {
        playerPieces = playerPieces.filter(p => p !== piece);
    } else {
        aiPieces = aiPieces.filter(p => p !== piece);
    }
}

// Lógica de movimento da IA com captura
function aiMove() {
    let moved = false;
    
    // A IA prioriza movimentos de captura
    aiPieces.some(piece => {
        const parentSquare = piece.parentNode;
        const targetSquare = findCaptureMove(parentSquare) || findMove(parentSquare);
        if (targetSquare) {
            targetSquare.appendChild(piece);
            moved = true;
            return true;
        }
        return false;
    });
    
    if (moved) {
        switchTurn();
    } else {
        checkForWinner();
    }
}

// Função para encontrar movimentos normais para a IA
function findMove(square) {
    const index = squares.indexOf(square);
    const possibleMoves = [index + 7, index + 9];
    for (const move of possibleMoves) {
        if (squares[move] && squares[move].classList.contains("black") && !squares[move].hasChildNodes()) {
            return squares[move];
        }
    }
    return null;
}

// Função para encontrar movimentos de captura para a IA
function findCaptureMove(square) {
    const index = squares.indexOf(square);
    const captureMoves = [
        { target: index + 14, capture: index + 7 },
        { target: index + 18, capture: index + 9 },
    ];

    for (const move of captureMoves) {
        if (
            squares[move.target] &&
            squares[move.target].classList.contains("black") &&
            !squares[move.target].hasChildNodes() &&
            squares[move.capture].hasChildNodes() &&
            squares[move.capture].firstChild.classList.contains("red")
        ) {
            const capturedPiece = squares[move.capture].firstChild;
            removePiece(capturedPiece); // Remove peça capturada
            return squares[move.target];
        }
    }
    return null;
}

// Verifica se alguém venceu
function checkForWinner() {
    if (playerPieces.length === 0) {
        showMessage("Você perdeu!");
    } else if (aiPieces.length === 0) {
        showMessage("Parabéns, você ganhou!");
    }
}

function showMessage(message) {
    document.getElementById("message").textContent = message;
}

// Inicializa o tabuleiro e as peças
createBoard();
addPieceListeners();
