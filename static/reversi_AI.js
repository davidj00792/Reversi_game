const {   
    Game,
    get_area, 
    randomNumber,
    EMPTY_FIELD,
    BLACK_STONE,
    WHITE_STONE,
    BOARD_SIZE,
    GAME_STATE_RUNNING,
    GAME_STATE_END
} = require("./lib.js")


function AI_move(game) {
    let best_moves = negamax(game, depth, -1)[0]
    if (best_moves == null) {
        return 0
    }
    return best_moves[randomNumber(0, best_moves.length)]
}


function corners (game) {
    let my_tiles = opp_tiles = 0
    const corners = [game.board[0][0], game.board[0][7], game.board[7][0], game.board[7][7]]
    for (const corner of corners) {
        if (corner === game.playing) {
            my_tiles++ 
        }
        opp_tiles++
    }
    return 25 * (my_tiles - opp_tiles)
}

function corners_closeness (game) {
    let my_tiles = opp_tiles = 0
    const opp_player = game.getOppositePlayer()
    const corners = [[0,0], [7,0], [0,7], [7,7]]
    for (const corner of corners) {
        if (game.board[corner[0]][corner[1]] === EMPTY_FIELD) {
            const corner_neighbours = get_area(corner)
            for (const neighbour of corner_neighbours) {
                if (game.board[neighbour[0]][neighbour[1]] === game.playing) {
                    my_tiles++
                }
                else if (game.board[neighbour[0]][neighbour[1]] === opp_player) {
                    opp_tiles++
                }  
            }
        }
    }
	return -12.5 * (my_tiles - opp_tiles)
}

function mobility(game){
    const opp_player = game.getOppositePlayer()
    const my_tiles = game.possibleMoves()[0].length
	const opp_tiles = game.possibleMoves(opp_player)[0].length
	if(my_tiles > opp_tiles)
		m = (100.0 * my_tiles)/(my_tiles + opp_tiles)
	else if(my_tiles < opp_tiles)
		m = -(100.0 * opp_tiles)/(my_tiles + opp_tiles)
	else m = 0
    return m
}

function stability (game) {
    const opp_player = game.getOppositePlayer()
    let my_tiles = opp_tiles = 0
    let my_front_tiles = 0
    let opp_front_tiles = 0
    let p = f = d = 0
    let V = [
	[99, -3, 11, 8, 8, 11, -3, 99],
    [-3, -7, -4, 1, 1, -4, -7, -3],
    [11, -4,  2, 2, 2,  2, -4, 11],
    [8,   1,  2,-3,-3,  2,  1,  8],
    [8,   1,  2,-3,-3,  2,  1,  8],
    [11, -4,  2, 2, 2,  2, -4, 11],
    [-3, -7, -4, 1, 1, -4, -7, -3],
    [99, -3, 11, 8, 8, 11, -3, 99]]

    for(let i=0; i < BOARD_SIZE; i++) {
        for(let j=0; j < BOARD_SIZE; j++)  {
            if(game.board[i][j] == game.playing)  {
                d += V[i][j]
                my_tiles++
            } 
            else if(game.board[i][j] == opp_player)  {
                d -= V[i][j]
                opp_tiles++
            }
            if(game.board[i][j] != EMPTY_FIELD)   {
                let area = get_area([i,j])
                for(let k=0; k < area.length; k++)  {
                    if(game.board[area[k][0]][area[k][1]] == EMPTY_FIELD) {
                        if(game.board[i][j] == game.playing) my_front_tiles++
                        else opp_front_tiles++
                        break
                    }
                }
            }
        }
    }
    if(my_tiles > opp_tiles){
        p = (100.0 * my_tiles)/(my_tiles + opp_tiles)
    }
    else if(my_tiles < opp_tiles) {
        p = -(100.0 * opp_tiles)/(my_tiles + opp_tiles)
    }
    else {
        p = 0
    }

    if(my_front_tiles > opp_front_tiles){
        f = -(100.0 * my_front_tiles)/(my_front_tiles + opp_front_tiles)
    }
    else if(my_front_tiles < opp_front_tiles) {
        f = (100.0 * opp_front_tiles)/(my_front_tiles + opp_front_tiles)
    }
    else {
        f = 0
    }
    return [p, f, d]
}

function scoring(game) {
    const [p, f, d] = stability(game)
    const c = corners(game)
    const l = corners_closeness(game)
    const m = mobility(game)
    return (10 * p) + (801.724 * c) + (382.026 * l) + (78.922 * m) + (74.396 * f) + (10 * d)
}


//Negamax algorithm with constant depth

const depth = 3
function negamax(game, depth, color) {
    if (depth <= 0) {
        return [null, color * scoring(game)]
    }
    let moves = game.possibleMoves()[0]
    if (moves.length === 0) {
        return [null, color * scoring(game)]
    }
    let value = -Infinity
    let best_moves = []
    for (let move of moves) {
        const child = game.clone()
        child.play(move)
        let child_value = -negamax(child, depth-1,-color)[1]
        if (child_value > value) {
            value = child_value
            best_moves = []
            best_moves.push(move)
        }
        else if (child_value === value) {
            best_moves.push(move)
        }
    }
    return [best_moves, value]
}

exports.AI_move = AI_move