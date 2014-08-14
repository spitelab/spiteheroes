
window.onload = function() {

    var game = new Phaser.Game(800, 600, Phaser.AUTO, '', {
        preload: preload,
        create: create,
        update: update
    });

    var level;

    function preload () {

        game.load.atlasJSONHash('path', 'assets/sprites/sprites.png', 'assets/sprites/sprites.json');
        game.load.text('levelScript', 'assets/level-1.txt');

    }

    function create () {
        level = new Spite.level();

        // Start by loading and running the level script
        var levelScript = game.getAsset("levelScript");
        level.runScript(levelScript);

        // Create the tiles layer for path

        // Create the tiles layer for entities

        // Add mouse events or UI for ZoomIn/Ou

        // Add mouse event to move board around

        // Constraint board movement to boundaries

//        skeleton = game.add.tileSprite(0, 0, 800, 600, 'path', 'character-skeleton.png');



    }



    function update() {


        updatePathTiles(level);
        updateEntities(level);

    }

    /**
     * Draw path tiles according to the new level state
     */
    function updatePathTiles(level) {

    }

    /**
     * Draw entities according to the new level state
     */
    function updateEntities(level) {

    }

};
