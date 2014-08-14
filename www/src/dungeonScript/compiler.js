(function (DungeonScript) {

    function Compiler(tokens) {
        this.tokens = tokens;
        this.run = function () {
            var compiler = this;
            console.log("Running the compiler!");
            var cursor = new CompilerCursor(tokens, onYield);

            function onYield(statement) {
//                console.log(statement.toString());
            }

            while (!cursor.end()) cursor.step();

            return cursor.rootStatement;
        }
    }

    function CompilerCursor (tokens, onYield) {
        this.tokens = tokens;

        // Create the root statement (to contain all others)
        this.statement = new DungeonScript.Statement(null, "root");
        this.rootStatement = this.statement;

        this.pos = 0; // positions in the list of tokens

        // spawn the first child statement for the root
        this.spawn();

        this.step = function () {
            var handler;
            var token = this.token();
            if (token) {
                // If this is the first token of the statement and there is not already a space token
                // an empty one is injected for proper indentation parsing later
                if (token.type !== "space" && this.statement.tokens.length === 0) {
                    var newToken = new DungeonScript.Token("space", "", token.line);
                    this.tokens.splice(this.pos, 0, newToken);
                    return this;
                }

                handler = tokenHandlers[token.type];
                handler(this);
            }
            this.pos++;
            return this;
        };

        this.token = function () {
            return this.tokens[this.pos];
        };

        // Token at current position
        this.pop = function (popCount) {
//            debugger;
            // todo: remove unused empty statement left after pop
            for (var i = 0; i < popCount; i++) {
                this.statement = this.statement.parent;
            }
            this.statement = this.statement.parent;
            this.statement = this.statement.spawn();
            return this;
        };

        this.yield = function () {
            var previousStatement = this.statement
            // Close the current statement and create the next one if it is not empty
            if (this.statement && this.statement.tokens.length > 0) {
                onYield(this.statement);

                this.statement = new DungeonScript.Statement();
                this.statement.depth = previousStatement.depth;
                this.statement.parent = previousStatement.parent;

                this.statement.parent.children.push(this.statement);
            } else {

            }
            return this;
        };

        this.push = function () {
            this.statement.push(this.token());
            return this;
        };

        this.skip = function () {
            // Nothing to do since the incrementor is in the step() function
            return this;
        };

        this.end = function () {
            return this.pos >= this.tokens.length;
        };
    }

    // Spawn child statements
    CompilerCursor.prototype.spawn = function () {
        // spawn the first child statement for the root
        this.statement = this.statement.spawn();
    };



    var tokenHandlers = {
        "comment": function(cursor) {
            cursor.skip();
        },
        "string": function(cursor) {
            cursor.push();
        },
        "coordinate": function(cursor) {
            cursor.push();
        },
        "entity": function(cursor) {
            cursor.push();
        },
        "keyword": function(cursor) {
            cursor.push();
        },
        "number": function(cursor) {
            cursor.push();
        },
        "linebreak": function(cursor) {
            cursor.yield();
        },
        "space": function(cursor) {
            // If this is an indentation space
            if (cursor.statement.tokens.length === 0) {
                // If the indentation is proper
                var indentLength = cursor.token().content.length;
                if (indentLength % 4 > 0) throw DungeonScript.Error.SyntaxError(cursor.token(), "Bad indentation of " + indentLength + " spaces (it should be a multiple of 4)");

                var depthDiff = (indentLength / 4) - (cursor.statement.depth - 1);

                // depth has increased of 1
                if (depthDiff === 1) {
                    cursor.spawn();
                } else if (depthDiff > 1) {
                    // depth has increased too much (more than 1, throw exception)
                    throw DungeonScript.Error.SyntaxError(cursor.token(), "Indentation went too far. Got " + indentLength + " spaces (should be " + (cursor.statement.depth + 4) +  " or lower)");
                } else if (depthDiff < 0) {
                    // depth has decreased (got back to Nth parent sequence)
                    cursor.pop(Math.abs(depthDiff));
                }
                // Else depth has not changed, and nothing needs to be done

            }
            cursor.push();

            // otherwise nothing special to be done

            cursor.skip();
        },
        // End Of File token
        "EOF": function(cursor) {
            cursor.yield();
        }
    };


    DungeonScript.Compiler = Compiler;
    DungeonScript.CompilerCursor = CompilerCursor;
    DungeonScript.tokenHandlers = tokenHandlers;

})(this.DungeonScript);
