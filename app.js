const express = require('express')
const path = require('path')
const {Server} = require("socket.io")
const http = require("http")
const {AI_move} = require("./static/reversi_AI")
const session = require('express-session')
const bodyParser = require('body-parser')
const {Game, PLAYER_TYPE_REMOTE, getOppositePlayer,BLACK_STONE, WHITE_STONE,randomNumber} = require('./static/lib')

const port = process.env.PORT || 3000
const secret = "reversi hello play"

const app = express()
const server = http.createServer(app)
const io = new Server(server, {cors: "*"})

const users = {}
const waiting_players = []
const players = {}
const paired_players = {}

app.set('view engine', 'ejs')

app.use(express.static(path.join(__dirname, 'static')))

app.use(bodyParser.urlencoded({extended:true}))


app.use(session({ secret, resave: false, saveUninitialized: true}))

app.get('/', (req,res) => {
  res.render('pages/index')
})
app.get('/reversi/game', (req, res) => {
  if(req.session.id in users) {
    res.render('pages/game', {user:users[req.session.id], type:'multiplayer'})}
  else {
    console.log("session not found")
    res.redirect('/')
  }    
})
app.get('/reversi/game-ai', (req, res) => {
  res.render('pages/game', {type: 'AI'})
})
app.get('/reversi/logged', (req, res) => {
  if(req.session.id in users) {
    res.render('pages/logged', {user:users[req.session.id]})
  }
  else {
    console.log("session not found")
    res.render('pages/index')
  }    
})

app.post('/reversi/log', (req, res) => {
  const {user} = req.body
  users[req.session.id] = {user}
  res.redirect('/reversi/logged')
})


io.on("connection", (socket) => {
  socket.on("AI_moves", ({board, player}) => {
  const game = new Game(player, board)
  game.startGame()
  const bestMove = AI_move(game)
  socket.emit("AI_moves_result", bestMove)
  })

  const move = () => {
    if (waiting_players.length >= 1) {
      const second_player_id = waiting_players.shift()
      const firstPlayer = {name: players[socket.id].name, type: PLAYER_TYPE_REMOTE, id: socket.id, stoneColor: [WHITE_STONE, BLACK_STONE][randomNumber(0, 1)]}
      const secondPlayer = {name: players[second_player_id].name, type: PLAYER_TYPE_REMOTE, id: second_player_id, stoneColor: getOppositePlayer(firstPlayer.stoneColor)}
      paired_players[socket.id] = second_player_id 
      paired_players[second_player_id] = socket.id
      socket.emit('gameStart', {firstPlayer, secondPlayer})
      players[second_player_id].socket.emit('gameStart', {firstPlayer, secondPlayer})
    }
    else {
      waiting_players.push(socket.id)
    }
  }

  socket.on("create", (name) => {
    players[socket.id] = {name, socket}
    move()
  })

  socket.on("recreate", () => {
    move()
  })

  socket.on('player_move', (chosen_field) => {
    const opposite_id = paired_players[socket.id]
    players[opposite_id].socket.emit('player_moved', chosen_field)
  })

  socket.on('disconnect', () => {
    if (socket.id in paired_players) {
      const opponentId = paired_players[socket.id]
      players[opponentId].socket.emit('lost_connection')
      delete paired_players[socket.id]
      delete paired_players[opponentId]
    }
    waiting_players.splice([waiting_players.indexOf(socket.id)], 1)
    delete players[socket.id]
  })
})


server.listen(port, () => {
  console.log(`App listening at port ${port}`)
})