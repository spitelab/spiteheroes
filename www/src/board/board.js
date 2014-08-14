((function () {

    // Global Spite namespace
    var Spite = {};


    Spite.Level = function () {
        var paths = {};
        this.paths =  _.chain(paths);

        var entities = {};
        this.entities = _.chain(entities);

        this.script = "";
    };

    Spite.Level.prototype.runScript = function (src) {
        run(src, this);
    };

    Spite.TileLayer = function () {
        this.tiles = {};
    };


    Spite.Tile = function (type, x, y) {
        this.type = type || null;
        this.pos = new Spite.Position(x, y);
    };

    Spite.Position = function (x, y) {
        this.x = x;
        this.y = y;
    };

    Spite.PathType = function (id, label, openings, symbol) {
        this.id = id;
        this.label = label || "";
        this.openings = openings || "000000000"; // An empty tile by default
    };

    /*
        Directions codes go from 0 to 8 clockwise, 1 being north, 7 being northwest, 8 being the center.

     */
    Spite.tileTypes = {
        "pathNone": new TileType("pathNone", "Empty path", "000000000"),
        "pathClosed": new TileType("pathClosed", "Closed off path", "000000001"),
        "pathStrHor": new TileType("pathStrHor", "Straight horizontal path", "001000101"),
        "pathStrVer": new TileType("pathStrVer", "Straight vertical path", "100010001"),
        "pathCross": new TileType("pathStrVer", "Crossroad path", "101010101"),
        "pathTurnNorthEast": new TileType("pathTurnNorthEast", "Turn North-East path ", "101000001"),
        "pathTurnNorthWest": new TileType("pathTurnNorthWest", "Turn North-West path ", "100000101"),
        "pathTurnSouthEast": new TileType("pathTurnSouthEast", "Turn South-East path ", "001010001"),
        "pathTurnSouthWest": new TileType("pathTurnSouthWest", "Turn South-West path ", "000010101"),
        "pathForkNorth": new TileType("pathForkNorth", "Fork North path ", "101000101"),
        "pathForkEast": new TileType("pathForkEast", "Fork East path ", "101010001"),
        "pathForkSouth": new TileType("pathForkSouth", "Fork South path ", "001010101"),
        "pathForkWest": new TileType("pathForkWest", "Fork West path ", "100010101"),
        "pathDeadendNorth": new TileType("pathDeadendNorth", "Deadend North path ", "100000001"),
        "pathDeadendEast": new TileType("pathDeadendEast", "Deadend East path ", "001000001"),
        "pathDeadendSouth": new TileType("pathDeadendSouth", "Deadend South path ", "000010001"),
        "pathDeadendWest": new TileType("pathDeadendWest", "Deadend West path ", "000000101")
    };

    /*
    The layout language for the dungeon maps is inspired by the concept of "Turtle Graphics"

    - ! is for commands. ex.: !path, !place, !face, !tun
    - # is for coordinates. ex.: @12-32
    - @ is for names entities (objects and monsters). ex.: @goldkey
    - = is for type of entities. Ex.: @goldkey !is =key
    - n, e, s, w, ne, nw, se, sw are for cardinal directions
    - f and b are for directions (forward, backward)
    - cw and ccw is for turning (clockwise and counter clockwise)
    -

    */



})();
