const EMPTY_FIELD = 0
const BLACK_STONE = 1
const WHITE_STONE = 2
const BOARD_SIZE = 8

const GAME_STATE_WAIT = -1
const GAME_STATE_RUNNING = 0
const GAME_STATE_END = 1

const PLAYER_TYPE_AI = "AI"
const PLAYER_TYPE_LOCAL = "Local"
const PLAYER_TYPE_REMOTE = "Remote"

class Game {
    constructor(playing, board, gameState) {
        this.player1 = null
        this.player2 = null
        this.playing = playing || BLACK_STONE
        this.board = board || this.initialBoard()
        this.gameState = gameState || GAME_STATE_WAIT
    }
    setPlayers(player1, player2) {
        this.player1 = player1
        this.player2 = player2
    }
    getOppositePlayer(player) {
        return getOppositePlayer(player || this.playing)
    }
    getPlayerByStoneColor(stone) {
        if (this.player1 !== null && this.player1.stoneColor === stone) {
            return this.player1
        }
        if (this.player1 !== null && this.player2.stoneColor === stone) {
            return this.player2
        }
    }
    getActualPlayer() {
        return this.getPlayerByStoneColor(this.playing)
    }
    getPlayerById(ID) {
        if (this.player1 !== null && this.player1.id === ID) {
            return this.player1
        }
        else if (this.player2 !== null && this.player2.id === ID) {
            return this.player2
        }
        else {return null}
    }
    initialBoard() {
        const middle = BOARD_SIZE / 2
        const board = []
        for (let i = 0; i < BOARD_SIZE; i++) {
            board.push((new Array(BOARD_SIZE)).fill(EMPTY_FIELD))
        } 
        board[middle][middle] = WHITE_STONE
        board[middle-1][middle-1] = WHITE_STONE
        board[middle-1][middle] = BLACK_STONE
        board[middle][middle-1] = BLACK_STONE
        return board
    }
    possibleMoves(player) {
        player = player || this.playing
        const opositePlayer = this.getOppositePlayer(player)
        const moves = []
        const stones_to_turn = []
        for (let row = 0; row < BOARD_SIZE; row++){
            for (let col = 0; col < BOARD_SIZE; col++) {
                if (this.board[row][col] === EMPTY_FIELD) {
                    const area = get_area([row, col])
                    const turn_stones_field = [] 
                    for (let [x,y] of area) {
                        if (this.board[x][y] === opositePlayer) {
                            let vector = [x-row, y-col]
                            let next_stone = [row + vector[0], col + vector[1]]
                            let turn_stones_direction = [[next_stone[0],next_stone[1]]]
                            let field_content = this.board[next_stone[0]][next_stone[1]]
                            while (field_content === opositePlayer) {
                                if (next_stone[0]+vector[0] < 0 || next_stone[0]+vector[0] === BOARD_SIZE) {
                                    turn_stones_direction = []    
                                    break
                                }
                                next_stone[0] = next_stone[0]+vector[0]
    
                                if (next_stone[1]+vector[1] < 0 || next_stone[1]+vector[1] === BOARD_SIZE){
                                    turn_stones_direction = []
                                    break
                                }
                                next_stone[1] = next_stone[1]+vector[1]
    
                                field_content = this.board[next_stone[0]][next_stone[1]]
                                if (field_content === EMPTY_FIELD) {
                                    turn_stones_direction = []
                                    break
                                }
                                else if (field_content === player) {
                                    let unique = true
                                    for (let i = 0; i < moves.length; i++) {
                                        if (moves[i][0] === row && moves[i][1] === col) {
                                            unique = false
                                            break
                                        }                              
                                    }
                                    if (unique) {
                                        moves.push([row, col])
                                        var dict ={}
                                        var key = [row, col]
                                        dict[key] = turn_stones_field
                                        stones_to_turn.push(dict)
                                    }
                                    break
                                }
                                turn_stones_direction.push([next_stone[0],next_stone[1]])
                            }
                            turn_stones_field.push.apply(turn_stones_field, turn_stones_direction)
                        }
                    }
                }
            }
        }
        return [moves, stones_to_turn]
    }
    play(chosen_field) {
        let allowed_moves = this.possibleMoves()
        let check = 0
        for (let i = 0; i < allowed_moves[0].length; i++) {
            if (chosen_field[0] === allowed_moves[0][i][0] && chosen_field[1] === allowed_moves[0][i][1]) {
                check += 1
                break
            }
        }
        if (check !== 1) {
            return false
        }
        const chosen = chosen_field.toString()
        for (let element = 0; element < allowed_moves[0].length; element++) {
            if (Object.keys(allowed_moves[1][element])[0] === chosen) {
                const change = allowed_moves[1][element][chosen]
                for (let field = 0; field < change.length; field++) {
                    this.board[change[field][0]][change[field][1]] = this.playing
                }
                this.board[chosen_field[0]][chosen_field[1]] = this.playing 
                break
            }     
        }
        this.playing = this.getOppositePlayer()
        return true
    }
    startGame() {
        this.gameState = GAME_STATE_RUNNING
    }
    endGame() {
        const oppPlayer = this.getOppositePlayer()
        return this.possibleMoves()[0].length === 0 && this.possibleMoves(oppPlayer)[0].length === 0
    }
    gameOver() {
        this.gameState = GAME_STATE_END
    }
    winner() {
        const stones = this.calculate()
        if (stones[0] > stones[1]) {
            return "Player white wins"
        }
        else if (stones[1] > stones[0]) {
            return "Player black wins"
            }
        else {
            return "How is this possible? Is is tie!"
        }
    }
    calculate(){
        let white = 0
        let black = 0
        for (let row = 0; row < BOARD_SIZE; row++){
            for (let col = 0; col < BOARD_SIZE; col++) {
                if (this.board[row][col] === WHITE_STONE) {
                    white += 1
                }
                else if (this.board[row][col] === BLACK_STONE) {
                    black += 1
                }
            }
        }
        return [white,black]
    }
    clone() {
        return new Game(
            this.playing,
            JSON.parse(JSON.stringify(this.board)),
            this.gameState,
        )
    }
    skipTurn() {
        if (this.possibleMoves()[0].length > 0) {
            return false
        }
        else {
            if (this.getActualPlayer().id === socket.id) {
                this.playing = this.getOppositePlayer()
                return true
            }
            return false
        }
    }
    gameReset (gameState) {
        this.playing = BLACK_STONE
        this.board = this.initialBoard()
        this.gameState = gameState || GAME_STATE_RUNNING
    }
    pass() {
        this.playing = this.getOppositePlayer()
    }
}

//Helpers:

function getOppositePlayer(player) {
    return player === WHITE_STONE ? BLACK_STONE : WHITE_STONE
}


function get_area([x, y]) {
    const area = []
    for (let row = -1; row < 2; row++){
        for (let col = -1; col < 2; col++){
            if ((row == 0 && col == 0) || x + row < 0 || y + col < 0 || x + row >= BOARD_SIZE || y + col >= BOARD_SIZE) {
                continue
            }
            area.push([x + row, y + col])
        }
    }
    return area
}


function randomNumber(min, max) { 
    return Math.floor(Math.random() * (max - min) + min);
} 


module.exports = {
    Game,
    get_area, 
    randomNumber,
    getOppositePlayer,
    EMPTY_FIELD,
    BLACK_STONE,
    WHITE_STONE,
    BOARD_SIZE,
    GAME_STATE_RUNNING,
    GAME_STATE_END,
    PLAYER_TYPE_AI,
    PLAYER_TYPE_LOCAL,
    PLAYER_TYPE_REMOTE,
}