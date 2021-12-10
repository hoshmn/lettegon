lettegon

CREATION MODE

UI:

- sliders to set sideCount range and sideSize range
- simple text input, allows letters and "," (after min word length*) -- after "," same letter must begin next word* (deletion must take into account...)
- below, show all boards with filters for sideSize, sideCount, !!completed

LOGIC:
as user types, all possible lettegons are generated with every keystroke (limited by range settings)
(start with case of each letter coming subsequently, vs pasted word?)
each lettegon has

- id: `axy_|bclm|z___|____`
- config: [[,x,y,a],[c,m,l,b],[,,z,],[,,,,]] // starts as straightforward split('|'),split('') of id, but can be edited (see below)
- completed

generating lettegons:
track prevSide (side the prev letter was added to)
for each added letter:

- if letter is contained on prevSide, that board no longer valid
- if letter is contained in another existing side, board valid, unchanged (update prevSide)
- else, add BRANCHES (all new valid boards):
  - for each non-empty side that isn't prevSide:
    - if side isn't full, add letter BRANCH
    - else sideSize++, add letter BRANCH
  - if empty side exists, add letter (to one) BRANCH
  - else sideCount++ add letter to it BRANCH
- indicate whether each new branch is full (to highlight completed boards)

- each completed board shows list of "solutions"

EDIT MODE
non-mutating (double alphabetized id stays the same, config updated):

- shuffle of sides
- shuffle letters on indiv side
  mutating (id & config update):
  ? if dragging letters to different sides is allowed in creation, must find the equiv id board that is essentially being swapped (and replace it with the edited board, pre-mutation)

\*if !!ENFORCE_RULES

PLAY MODE

tech to incorporate:
Ruby, db, \_ (memoize af),
svg help: https://stackoverflow.com/questions/30120898/working-with-svg-polygon-defined-by-user
checking words: https://github.com/dwyl/english-words
filter by ~12 letters used: https://nedbatchelder.com/blog/202004/letter_boxed.html#comment_16151
trie to search list: https://calebrob.com/algorithms/2019/01/15/nytimes-letter-boxed.html
drawing arbitrary n-sided polygon and placing letters (python): https://outsiderdata.netlify.app/post/solving-the-letterboxed-puzzle-in-the-new-york-times/

Later developments:

GHOST IN THE BOX
like the game of ghost, but the players involved are creating a lettegon. if you add letter that leads to no possible valid words (use trie), you lose.
? as you add letter, do you select board config? all options open?
? penalize/disallow ending word if longer exists
