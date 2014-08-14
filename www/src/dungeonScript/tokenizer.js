(function (DungeonScript) {



    function tokenize(src) {

        var tokens = [];

        var cursor = new Cursor(src, onyield);

        while (!cursor.end()) {
            tokenHandlers[cursor.token.type](cursor);
            if (cursor.token.type !== "default") cursor.forward();
        }
        // Add the EOF token
        onyield(new Token("EOF", "", cursor.line));

        function onyield(token) {
            var content = token.content;
            content = content.replace(/\n/g, "\\n")
                .replace(/\r/g, "\\r");
//            console.log("  |" + token.type + ":[" + content + "]");
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

    var tokenHandlers = {
        "default": function(cursor) {
            if (cursor.match("/")) {
                // match comments
                if (!cursor.match("/"))
                    throw DungeonScript.Error.SyntaxError(cursor.forward().token);
                cursor
                    .rewind()
                    .yield("comment");
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
            } else if (cursor.match(/[ \t]/)) {
                // Match spaces
                cursor.yield("space");
            } else {

                throw DungeonScript.Error.SyntaxError(cursor.forward().token);
            }

        },
        "comment": function(cursor) {
            if (cursor.match(/[\n\r]/)) {
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
    };

    DungeonScript.tokenize = tokenize;
    DungeonScript.Token = Token;
    DungeonScript.tokenHandlers = tokenHandlers;
    DungeonScript.Cursor = Cursor;

})(this.DungeonScript);
