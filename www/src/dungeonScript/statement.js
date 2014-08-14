(function (DungeonScript) {

    function Statement(parent, type) {
        this.tokens = [];
        this.children = []; // Child sequence of statements
        this.parent = parent || null; // Parent statement
        this.depth = 0; // Hierarchical depth of this statement
        this.type = type || ""; // Statement Type (only methods for now)
        this.arguments = [];

        // Raise depth according to parent statement
        if (this.parent) {
            this.depth = this.parent.depth + 1;
        }

    }

    Statement.prototype.push = function (token) {
        // If the type is not already defined
        if (this.type === "") {
            if (token.type === "keyword") {
                this.type = "method";
                this.arguments.push(token);
            } else if (token.type === "space") {
                // Nothing to do! Except not throwing an exception
            } else {
                throw SyntaxError(token, "Statements must start with a keyword. Ex.: the, when, loose, say.");
            }
        } else {
            // If not, and it isnt a space, add it as an argument
            if (token.type !== "space") {
                this.arguments.push(token);
            }
        }

        // either way, add it on the tokens stack
        this.tokens.push(token);
    };

    Statement.prototype.exec = function(state) {
        var token;
        var executor;
        for (var i = 0; i < this.tokens.length; i++) {
            token = this.tokens[i];
            executor = DungeonScript.tokenExecutors[token.type];
            executor(state);
        }
    };

    /**
     * Spawn a new child statement, add it to stack of children statement and then return it
     * @returns {Statement}
     */
    Statement.prototype.spawn = function () {
        var statement = new Statement(this);
        this.children.push(statement);
        return statement;
    };

    Statement.prototype.toString = function() {
        var str = [];
        var indent = "|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---";
        for (var i = 0; i < this.tokens.length; i++) {
            str.push(this.tokens[i].content);
        }
        return indent.substr(0, this.depth * 4) + str.join("").trim();
    };

    DungeonScript.Statement = Statement;

})(this.DungeonScript);
