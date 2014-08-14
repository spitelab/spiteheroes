/*

Todos:
- Line continuations "_"
- Inline break and sub statements ">"

 */

(function (global) {

    var DungeonScript = global.DungeonScript = {
        run: run
    };

    function run(src, level) {
        this.script = src;

        console.log("Testing dungeonScript! Woot woot!");

        // Parse source code into tokens
        var tokens = DungeonScript.tokenize(src);
        // Create a compiler and feed it the tokens
        var compiler = new DungeonScript.Compiler(tokens);
        // Run the compilation to obtain the Abstract Syntax Tree
        var AST = compiler.run();
        console.log("AST: ", AST);
        // Create a new execution state
        var state = new DungeonScript.State(AST, level);
        // Execute the script
        state.run();

    }

})(this);

