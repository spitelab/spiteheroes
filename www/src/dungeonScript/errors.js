(function (DungeonScript) {


    function SyntaxError(token, message) {
        var error = [];
        error.push("Syntax error on line : " + token.line);
        if (message) error.push(message);
        error.push("Bad token was:[" + token.content + "]");
        return error.join("\n");
    }

    DungeonScript.Errors = {
        Syntax: SyntaxError
    }


})(this.DungeonScript);
