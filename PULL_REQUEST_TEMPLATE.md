**PLEASE READ AND DELETE THE CAPITALIZED TEXT, THE TITLE SECTION
AND THE SECTION THAT DOESN'T APPLY BEFORE SUBMITTING.**

DO NOT CLOSE AND REOPEN NEW PRS, UPDATE THE FIRST ONE YOU MADE.

READ CAREFULLY ALL THE FOLLOWING POINTS TO MAKE SURE YOUR PR
ADHERES TO THE STANDARD TO AVOID UNNECESSARY BACK AND FORTH.

**FAILURE TO READ BASIC INSTRUCTIONS WILL EVENTUALLY GET YOU
BLOCKED FROM THE REPO.**

### Title

The title of your PR should be `[CHAIN] Add NAME (SYMBOL)` or `Update NAME (SYMBOL)`.
For example: `[zilliqa] Add Zilstream (STREAM)`.

### Adding a token

- [ ] Create a folder in the chain assets directory named after your contract address
- [ ] Your logo must be either SVG or PNG min 100x100 max 500x500 and named `logo.<extension>`
- [ ] Your logo should be a square (same width and height)
- [ ] Use your best judgement to see if you need to add padding or background transparency depending on your design
- [ ] A PNG should **always** use tinypng.com to compress it
- [ ] An SVG should use svgminify.com to remove useless props and be the same width/height ratio. Do not embed PNG data in them, use a PNG instead.
- [ ] Maximum file size is 30kb but < 15kb is prefered
- [ ] Add information of your project in `meta.json`, **USE** jsonlint.com to check validity following the spec from the README.

### Updating a token

- [ ] Make sure to rebase or clean your history
- [ ] PR doesn't have any merge conflict
- [ ] In case you are migrating a token, delete the old folder in the same PR
