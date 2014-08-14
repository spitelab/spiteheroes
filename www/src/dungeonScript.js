(function () {

    this.DungeonScript = {
        run: run
    };


    function run(src, level) {
        this.script = src;

        console.log("Running dungeonScript! Woot woot!");

        // Parse source code into tokens
        var tokens = tokenize(src);
        // Create a compiler and feed it the tokens
        var compiler = new Compiler(tokens);
        // Run the compilation to obtain the Abstract Syntax Tree
        var AST = compiler.run();
        console.log("AST: ", AST);
        // Create a new execution state
        var state = new State(AST, level);
        // Execute the script
        state.run();

    }


    /**
     * Sequence of statements
     * @constructor
     */
    function Sequence(parentStatement) {
        this.statements = [];
        this.push = function(statement) {
            this.statements.push(statement);
        }

    }

    function Statement(parent) {
        this.tokens = [];
        this.children = []; // Child sequence of statements
        this.parent = parent || null; // Parent statement
        this.depth = 0; // Hierarchical depth of this statement

        // Raise depth according to parent statement
        if (this.parent) {
            this.depth = this.parent.depth + 1;
        }

        this.push = function (token) {
            this.tokens.push(token);
        };

        this.exec = function(state) {
            var token;
            var executor;
            for (var i = 0; i < this.tokens.length; i++) {
                token = this.tokens[i];
                executor = tokenExecutors[token.type];
                executor(state);
            }
        };

        /**
         * Spawn a new child statement, add it to stack of children statement and then return it
         * @returns {Statement}
         */
        this.spawn = function () {
            var statement = new Statement(this);
            this.children.push(statement);
            return statement;
        };

        this.toString = function() {
            var str = [];
            var indent = "|---|---|---|---|---|---|---|---|---|---|---|---";
            for (var i = 0; i < this.tokens.length; i++) {
                str.push(this.tokens[i].content);
            }
            return indent.substr(0, this.depth * 4) + str.join("").trim();
        };
    }

    function Compiler(tokens) {
        this.tokens = tokens;
        this.statements = [];
        this.run = function () {
            var compiler = this;
            console.log("Running the compiler!");
            var token;
            var handler;
            var cursor = new CompilerCursor(tokens, onYield);

            function onYield(statement) {
                console.log("Yielded: ", statement.toString());
                compiler.statements.push(statement);
            }

            while (!cursor.end()) cursor.step();

            return this.statements;
        }
    }

    function CompilerCursor (tokens, onYield) {
        this.tokens = tokens;

        // Create the root statement (to contain all others)
        this.statement = new Statement();
        this.rootStatement = this.statement;

        this.pos = 0; // positions in the list of tokens

        // spawn the first child statement for the root
        this.spawn();
//debugger;
        this.step = function () {
            var handler;
            var token = this.token();
            if (token) {
                // If this is the first token of the statement and there is not already a space token
                // an empty one is injected for proper indentation parsing later
                if (token.type !== "space" && this.statement.tokens.length === 0) {
//                    debugger;
//                    this.statement.push(new Token("space", "", token.line));
                    var newToken = new Token("space", "", token.line);
//                    debugger;
                    this.tokens.splice(this.pos, 0, newToken);
//                    this.statement.tokens.push(newToken);
                    return this;
                }

                handler = tokenHandler[token.type];
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

                this.statement = new Statement();
                this.statement.depth = previousStatement.depth;
                this.statement.parent = previousStatement.parent;

                this.statement.parent.children.push(this.statement);
//                console.log("depth: ", this.statement.depth);
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



    var tokenHandler = {
        "comment": function(cursor) {
            cursor.skip();
        },
        "command": function(cursor) {
            cursor.push();
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
//        "inlinebreak": function(cursor) {
//            cursor.yield();
//        },
        "linebreak": function(cursor) {
            cursor.yield();
        },
        "space": function(cursor) {
            // If this is an indentation space
            if (cursor.statement.tokens.length === 0) {
                // If the indentation is proper
                var indentLength = cursor.token().content.length;
                if (indentLength % 4 > 0) throw SyntaxError(cursor.token(), "Bad indentation of " + indentLength + " spaces (it should be a multiple of 4)");

                var depthDiff = (indentLength / 4) - (cursor.statement.depth - 1);

//                console.log("depthDiff: ", depthDiff, "indentLength: ", indentLength);
                // depth has increased of 1
                if (depthDiff === 1) {
                    cursor.spawn();
                } else if (depthDiff > 1) {
                    // depth has increased too much (more than 1, throw exception)
                    throw SyntaxError(cursor.token(), "Indentation went too far. Got " + indentLength + " spaces (should be " + (cursor.statement.depth + 4) +  " or lower)");
                } else if (depthDiff < 0) {
                    cursor.pop(Math.abs(depthDiff));
                }


                // depth has decreased (got back to Nth parent sequence)

                // Else depth has not changed, and nothing needs to be done

            }
            cursor.push();

            // otherwise nothing special to be done

            cursor.skip();
        },
//        "continuation": function(cursor) {
//            // todo: Cancel the next linebreaks.... ??
//            cursor.skip();
//        },
        // End Of File token
        "EOF": function(cursor) {
            cursor.yield();
        }
    };


    var tokenExecutors = {
        "command": function() {
            console.log()
        },
        "string": function() {

        },
        "coordinate": function() {
        },
        "entity": function() {
        },
        "keyword": function(cursor) {
        },
        "number": function(cursor) {
        },
        "space": function(cursor) {
        }
    };


    function State(statements, level) {
        this.level = level;
        this.statements = statements;
        this.frames = new Frames();
        this.position = 0;

        /**
         * Step through the next statement
         */
        this.step = function () {
            var play = true;
            var statement = this.statements[this.position];
            if (statement) {
                play = statement.exec(this);
            } else {
                play = false;
            }
            return play;
        };

        // Create the lowermost frame which contains globals
        this.frames.push();
        this.frames.var("level", level);

        // Create the first available frame for the user
        this.frames.push(0);

        this.run = function() {
            var play = true;
            while (play === true) play = this.step();
        }
    }

    function Frames() {
        this.frames = [];
        this.top = function () {
            var frame = null;
            if (this.frames.length > 0) {
                frame = this.frames[this.frames.length - 1]
            }
            return frame;
        };

        this.var = function (key, value) {
            return this.top().var(key, value);
        };

        // Add a new frame on the frame stack
        this.push = function (position) {
            var parentFrame = this.top();
            this.frames.push(new Frame(position, parentFrame));
        };

        // Remove the topmost frame from the frame stack
        this.pop = function () {
            this.frame.pop();
        }
    }

    function Frame(position, parent) {
        this.position = position || null;
        this.parent = parent || null;
        this.vars = {};
    }

    Frame.prototype.var = function(key, value) {
        var returnValue;

        if (arguments.length > 1) {
            this.vars[key] = value;
        }

        if (this.vars.hasOwnProperty(key)) {
            returnValue = this.vars[key];
        } else {
            if (this.parent) {
                returnValue = parent.var(key);
            }
        }

        return returnValue;
    };

    Frame.prototype.delete = function (key) {
        delete this.vars[key];
    };



    var keywords = {
        "with": function (selection) {
            // Set the selected item on the current frame
            this.state.var("@selected", selection);
        },
        "has": function (key, value) {
            console.log("Selection " + state.var("@selected") + " get attribute '" + key + "' with this value : " + value);
        },
        "is": function () {},
        "go": function () {},
        "place": function () {},
        "path": function () {},
        "when": function () {},
        "win": function () {},
        "loose": function () {},
        "say": function () {}
    };





    function tokenize(src) {

        var tokens = [];

        var cursor = new Cursor(src, onyield);

        while (!cursor.end()) {
            handlers[cursor.token.type](cursor);
            if (cursor.token.type !== "default") cursor.forward();
        }
        // Add the EOF token
        onyield(new Token("EOF", "", cursor.line));

        function onyield(token) {
            var content = token.content;
//            debugger;
            content = content.replace(/\n/g, "\\n")
                .replace(/\r/g, "\\r");
            console.log("  |" + token.type + ":[" + content + "]");
            tokens.push(token);
        }

        return tokens;
    }

    function Token(type, content, line) {

        this.type = type || "default";
        this.content = content || "";
        this.line = line | 0;
        this.position = 0;

        this.append = function(str) {
            this.content = this.content + str;
            return this;
        };

        this.set = function(str) {
            this.content = str;
            return this;
        };

        this.crop = function(charCount) {
            this.content = this.content.substr(0, this.content.length - charCount);
            return this;
        };
    }

    function Cursor(src, onyield) {
        this.src = "" || src;
        this.pos = 0;
        this.line = 1;
        this.token = new Token("default", "", this.line);
        this.char = function () {
            return this.src[this.pos];
        };
        this.match = function (input) {
            var isMatch;
            if (typeof input === 'string') {
                isMatch = (this.char() === input);
            } else {
                isMatch = input.test(this.char());
            }
            return isMatch;
        };
        this.forward = function () {
            this.token.append(this.char());
            this.pos++;
            return this;
        };
        this.rewind = function () {
            this.token.crop(1);
            this.pos--;
            return this;
        };

        // yield a new token and switch type
        this.yield = function (type) {
            if (!(this.token.type === "default" && this.token.content === "")) {
                onyield(this.token);
            }
            this.token = new Token(type || "default", "", this.line);
            return this;
        };

        this.end = function () {
            return (this.pos > this.src.length);
        }
    }

    var handlers = {
        "default": function(cursor) {
            if (cursor.match("/")) {
                // match comments
//                cursor.forward();
                if (!cursor.match("/"))
                    throw SyntaxError(cursor.forward().token);
                cursor
                    .rewind()
                    .yield("comment");
            } else if (cursor.match("!")) {
                // match commands
                cursor.yield("command");
            } else if (cursor.match('"')) {
                // match strings
                cursor.yield("string");
            } else if (cursor.match('@')) {
                // match entities
                cursor.yield("entity");
            } else if (cursor.match(/^[a-z]+$/i)) {
                // match keywords
                cursor.yield("keyword");
            } else if (cursor.match(/^[0-9\-]+$/)) {
                // match numbers
                cursor.yield("number");
            } else if (cursor.match("[")) {
                // match coordinates
                cursor.yield("coordinate");
            } else if (cursor.match(/[\n\r]/)) {
                // Match line break
                cursor.yield("linebreak");
//            } else if (cursor.match(/>/)) {
//                // Match "inline" break
//                cursor.yield("inlinebreak");
//            } else if (cursor.match("_")) {
//                // Match continuation of lines
//                cursor.yield("continuation");
            } else if (cursor.match(/[ \t]/)) {
                // Match spaces
                cursor.yield("space");
            } else {

                throw SyntaxError(cursor.forward().token);
            }

        },
        "comment": function(cursor) {
            if (cursor.match(/[\n\r]/)) {
                cursor.yield();
            }
        },
        "command": function(cursor) {
            if (!cursor.match(/^[a-z0-9]+$/i)) {
                cursor.yield();
            }
        },
        "string": function(cursor) {
            // todo: support apostrophe escaping with \n
            if (cursor.match('"')) {
                cursor.forward().yield();
            }
        },
        "coordinate": function(cursor) {
            if (cursor.match(']')) {
                cursor.forward().yield();
            }
        },
        "entity": function(cursor) {
            if (!cursor.match(/^[a-z0-9]+$/i)) {
                cursor.yield();
            }
        },
        "keyword": function(cursor) {
            if (!cursor.match(/^[a-z0-9]+$/i)) {
                cursor.yield();
            }
        },
        "number": function(cursor) {
            if (!cursor.match(/^[0-9\.]+$/)) {
                cursor.yield();
            }
        },
//        "inlinebreak": function(cursor) {
//            if (!cursor.match(/[>]/)) {
//                cursor.yield();
//            }
//        },
        "linebreak": function(cursor) {
            if (!cursor.match(/[\n\r]/)) {
                cursor.line = cursor.line + cursor.token.content.length;
                cursor.yield();
            }
        },
        "space": function(cursor) {
            if (!cursor.match(/ /)) {
                cursor.yield();
            }
        }
//        "continuation": function(cursor) {
//            cursor.yield();
//        }

    };

    function SyntaxError(token, message) {
        var error = [];
        error.push("Syntax error on line : " + token.line);
        if (message) error.push(message);
        error.push("Bad token was:[" + token.content + "]");
        return error.join("\n");
    }

})();

