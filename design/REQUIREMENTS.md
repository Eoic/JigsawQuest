Jigsaw puzzle placement game where user can choose an image or upload their own, and create jigsaw puzzle. Puzzle game be completed solo or with other people in real-time. User may choose some parameters such as jigsaw size, time limits, and so on. The game works in the browser.

1. Live statistics:
    * How many pieces placed.
    * How many puzzles solved.

2. User can create new puzzle placement game with there requirements:
    * Image, from which puzzle will be generated.
    * Number of pieces.
    * Jigsaw pattern.
    * Public or private
        * Public - anyone can join.
        * Private - access by invitation only.
    * Number of participans, which can connect to the same game session.

3. User does not need to login to play the game, but can create and account to save progress.
    * Progress tracking consists of:
        * Number of pieces placed.
        * Number of puzzles solved.
        * Time spent playing.
        * Achievements.
        * Active games.
        * Completed games.
        * Created puzzles.
    * Progress for player without an account is save in local storage.
    * Once player creates and account, local storage cache is cleared, so that when user logs out, it can play as a new user. This allows user to have multiple accounts, but may be subject to change.

4. User form the main page can:
    * Join active public session.
    * Create new game and start game session.
    * Select from existing games and start game session.

5.1. Game session window have these settings:
    * Backgorund color - to change backgorund from existing colors on through color picker.
    * Zoom in and zoom out.
    * Open and hide preview image.
    * Invite participant.
    * Move pieces by group or by single piece.
    * Back to main window.

5.2. Game session window should show this information.
    * Players list and number.
    * Elapsed game time.

6. Puzzle piece movements by all players are visible in real-time. 
    * Puzzle picked by the player has an identifying outline and player's name.
    * Puzzle piece picked by one player cannot be picked by another.
    * Puzzlie piece released by one player can by picked by another.
    * Mouse cursor positions of all player are shown and annotated by player names, altohugh this can be toggled on and off through game session settings.
