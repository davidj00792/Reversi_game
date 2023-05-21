# Reversi 2023

#### Author: David Janča 1992, Czech Republic, Brno
#### [Introdution-video](https://youtu.be/1kUNnJyopHQ)

### Introduction
For my final project, I chose (as a true programmer) a game. Reversi is a logic game similar to criss-cross, but a little more sophisticated. [Reversi](https://en.wikipedia.org/wiki/Reversi).

Simply: 2 players, white and black. 64 fields. You are putting stones on the board and trying to control it. A player with more stones in the end wins!


### Basic logic
You can put stones by clicking on dots on the board (displayed available moves). 
You can play only when it is your turn.
If you don´t have any available moves, you must press Pass! button. This will pass your turn to another player so the game can continue.
If both players don't have an available move (or the board is full), the game is over and stones are calculated. The winner is displayed.
During the game, the current score and current playing player are displayed. 


### Functions

#### AI
You can play against AI or another player. The AI is a bit clever. It calculates possibilities by ***Negamax algorithm ***, but just to the depth of 3. For every possible move, it calculates a score for that move by running ***4 heuristic functions***. You can reset the game anytime by pressing the button Reset.

#### Multiplayer
You can play online by signing in only by entering a username. When joining a game, the server will pick the first available player and connect him. When you wait for his turn, the waiting icon is displayed. When you leave the game, the game ends automatically for both players. 

### Used tools
***Node*** is used for creating the server. The client passes actions to the server, the server runs processes and calculations, and results are returned to the client. 

***Express*** is used as a framework for building the server, and in which is the app designed. The code is written in ***Javascript along with HTML and CSS*** for graphics. 

Because it can be quite difficult to work with Javascript(the language is single-threaded), when we want to run some functions along with handling events, ***Sockets (Socket IO)*** are used for communication between a client and the server. For handling connections and passing information between 2 players through the server. Also for AI calculations, so calculations can run on server while HTML renders new elements. 


### Files
#### app.js
Handles the server side of the application. Contains important modules and sockets.
#### reversi_AI.js
Handles AI logic. Contains the negamax algorithm and heuristic functions for scoring all possible moves. The top layer function returns the best possible move for AI turn.
#### views/index.ejs
Simple index page.
#### views/logged.ejs
Updated index page with updated buttons after logging in. 
#### views/game.ejs
Renders the whole game. Also contains logic for recognizing the type of game (AI/multiplayer) and for an event, when one player disconnects.
#### static/lib.js
Contains the object Game, which defines the state of the game and checking (board, player...), and a few helper functions. Both are used in reversi.js and reversi_AI.js.
#### static/reversi.js
Contains the rest of the logic, handling actions, and rendering HTML content.
#### static/styles.css
Contains all styles for whole site.

### Potential TODO:
* Adding database. A database could improve handling users and keep information about them. Log in credentials, history of games, etc.
* For AI, we can add alpha beta pruning for the Negamax algorithm. This can optimize running time and give us the ability to increase the calculated depth and therefore difficulty.
* Refactoring. Even though the app was refactored already few times, there is still potential for improving code design (e.g. naming of functions and variables...)