Currently working on: trying to make the score chart work properly. There's a bug which causes the y-axis values to not be rendered properly (they're probably not the correct type).


* Incentivize player to time travel: build a game board completely filled except for one column, then shuffle the moves to create it, then provide the necessery tall-blocks to clear all lines. The player should rearrange the shuffled almost-filled board, then drop the tall-blocks and win. see https://en.wikipedia.org/wiki/Exact_cover#Pentomino_tiling and https://github.com/taylorjg/pentominoes
* Friendlier UI for time travel - maybe show more moves in a single board? (use colors and gradients)
* Fix layout
  * center things properly
  * game is jiggly. why is there a scrollbar? it causes pressing the down/up keys to move the screen.
  * use grid? might help in the future with features like the score graph
  * responsiveness (I think currently the board and scores have a fixed size)
    * mobile support. consider putting the game board, timeline and graph in seperate "tabs".
* Meta-score (the score you gained only because of time travel)
* Time travelling to first move is buggy (the piece is wrong).
* Player can't move a piece below some other piece. Decide if there's a way to fix it while still making the time travel make sense.