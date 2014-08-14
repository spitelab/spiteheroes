(function (DungeonScript) {

    function State(rootStatement, level) {
        this.level = level;
        this.statements = rootStatement.children;
        this.frames = new DungeonScript.Frames();
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


    var tokenExecutors = {
        "method": function() {
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


    DungeonScript.State = State;
    DungeonScript.tokenExecutors = tokenExecutors;
    DungeonScript.keywords = keywords;

})(this.DungeonScript);
