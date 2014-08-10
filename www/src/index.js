// create an new instance of a pixi stage
var stage = new PIXI.Stage(0x52b352);

// create a renderer instance.
var renderer = PIXI.autoDetectRenderer(1200, 500);

// add the renderer view element to the DOM
document.body.appendChild(renderer.view);

requestAnimFrame( animate );

// Set the base texture for a scaling mode suitable for pixel-art
PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST;

// create a texture from an image path
var texture = PIXI.Texture.fromImage("src/assets/character-skeleton.png");
// create a new Sprite using the texture
var bunny = new PIXI.Sprite(texture);

// center the sprites anchor point
bunny.anchor.x = 0.5;
bunny.anchor.y = 0.5;

bunny.width = 96;
bunny.height = 96;

// move the sprite t the center of the screen
bunny.position.x = 200;
bunny.position.y = 150;

stage.addChild(bunny);



function animate() {

    requestAnimFrame( animate );

    // just for fun, lets rotate mr rabbit a little
    bunny.rotation += 0.1;
    // render the stage
    renderer.render(stage);
}




