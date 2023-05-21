const socket = io()


socket.on("AI_moves_result", (bestMove) => {
    document.getElementById("wait").style.display = "none" 
    if(bestMove === 0) {
        game.pass()
        return redraw(game)
    }
    window.game.play(bestMove)
    redraw(game)
    if (game.endGame()) {
        console.log("Game over")
        end_game(game)
        game.gameOver()
        return 1
    }
})

socket.on("player_moved", (chosen_field) => {
    document.getElementById("wait").style.display = "none" 
    if (chosen_field != null) {
        window.game.play(chosen_field)
    }
    else {
        window.game.pass()
    }
    redraw(game)
    if (game.endGame()) {
        console.log("Game over")
        end_game(game)
        game.gameOver()
        return 1
    }
})  

function draw_moves(game) {
    const moves = game.possibleMoves()[0]
    for (let move of moves) {
        document.getElementById(create_id(move[0],move[1])).className += ' dot'
    }
}


function draw_board(game) {
    const table = document.getElementById("table")
    for (let i = 0; i < BOARD_SIZE; i++) {   
        let tr = document.createElement("tr")
        for(let j = 0; j < BOARD_SIZE; j++) {
            let td = document.createElement("td")
            td.className = "cell" 
            td.setAttribute("id",create_id(i,j))
            let field = [i,j]
            td.addEventListener("click", () => {turn(game, field)})
            tr.appendChild(td)
        }
        table.appendChild(tr)
    }
}

function render_board(game){
    for (let row = 0; row < BOARD_SIZE; row++){
        for (let col = 0; col < BOARD_SIZE; col++) {
            let id = "r" + row + "-" + col
            if (game.board[row][col] === BLACK_STONE) {
                document.getElementById(id).className = 'cell black'
            }
            if (game.board[row][col] === WHITE_STONE) {
                document.getElementById(id).className = 'cell white'
            }
            if (game.board[row][col] === EMPTY_FIELD) {
                document.getElementById(id).className = 'cell'
            }
        }
    }

}

function redraw(game) {
    render_board(game)
    const [white,black] = game.calculate()
    if (game.playing === game.getPlayerById(socket.id)?.stoneColor && game.gameState === GAME_STATE_RUNNING) {
        draw_moves(game)
    }
    if (game.gameState === GAME_STATE_RUNNING) {
        document.getElementById("new_game").style.display = "none"
    }
    current_player(game)
    document.getElementById("white_count").innerHTML = white
    document.getElementById("black_count").innerHTML = black
}

function current_player(game) {
    const actualPlayer = game.getActualPlayer()
    if (game.gameState === GAME_STATE_RUNNING && actualPlayer !== null) {
        document.getElementById("current_player").style.display = "block"

        if (actualPlayer.type === PLAYER_TYPE_LOCAL) {
            document.getElementById("current_player").innerHTML = "Player is on move"
        } else if (actualPlayer.type === PLAYER_TYPE_AI) {
            document.getElementById("current_player").innerHTML = "Computer is on move"
        } else if (actualPlayer.type === PLAYER_TYPE_REMOTE) {
            document.getElementById("current_player").innerHTML = actualPlayer.name + " is on move"
        }

        if (actualPlayer.id !== socket.id) {
            document.getElementById("wait").style.display = "block"
        }
    } else {
        document.getElementById("wait").style.display = "none" 
    }
}


function new_game() {
    document.getElementById("end_game").style.display = "none"
    const board = initial_board()
    player = BLACK_STONE
    redraw(board)
    return board
}

function end_game(game) {
    if(game.getActualPlayer().type === PLAYER_TYPE_REMOTE) {
        document.getElementById("new_game").style.display = "block"
    }
    document.getElementById("current_player").style.display = "none"
    document.getElementById("wait").style.display = "none" 
    document.getElementById("end_game").innerHTML = "Game over. " + game.winner()
    document.getElementById("end_game").style.display = "block" 
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("move").onclick = function(e) {
        e.preventDefault()
        if (game.getActualPlayer().type === 'Local') {
            if (game.skipTurn()) {
                socket.emit("AI_moves", {board:game.board, player:game.playing})
            }
        }
        else {
            if (game.skipTurn()) {   
                socket.emit('player_move', null)
                redraw(game)
                }
        }
    }
    document.getElementById("reset").onclick = function(e) {
        e.preventDefault()
        game.gameReset()
        redraw(game)
        document.getElementById("end_game").style.display = "none" 
    }
})


function turn(game, chosen_field) {
    if (game.gameState !== GAME_STATE_RUNNING || game.playing !== game.getPlayerById(socket.id)?.stoneColor) {
        return 
    }
    
    if (game.play(chosen_field)) {
        if (game.getActualPlayer().type === PLAYER_TYPE_REMOTE) {
            socket.emit('player_move', chosen_field)
        }
        redraw(game)
        if (game.endGame()) {
            console.log("Game over")
            end_game(game)
            game.gameOver()
            return
        }
        if (PLAYER_TYPE_AI === game.getActualPlayer().type) {
            socket.emit("AI_moves", {board:game.board, player:game.playing})
        }   
    }
}

//Helpers:

function create_id(x,y) {
    return "r" + x + "-" + y
}
