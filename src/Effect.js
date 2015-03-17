/**
 * Created by abyss http://www.abyssss.com
 *
 * use to create the Effect of Speak-or-Think content.
 * simply, create a sprite or a sprite system.
 *
 * I think to define the 'Effect' in Rei's world as 'a effect implement with sprite(system)'
 * is better for understanding.
 *
 * more effects may be achieved in future.
 *
 */

WW.Effect = function () {

    this._effects = [];
};

WW.Effect.prototype = {

    constructor: WW.Effect,

    add: function(effectObject)
    {
        this._effects.push(effectObject);
    },

    getEffectByName: function(name) {

        for(var i = 0, j = this._effects.length; i < j; i++)
        {
            if(this._effects[i]._name == name)
            {
                return this._effects[i];
            }
        }
        return null;
    }
}


WW.Speak = function(parameters) {

    this._parameters = parameters;
    this._isAddedToScene = false;
    this._isDeleteFromScene = false;
    this._name = parameters.name;
}


WW.Speak.prototype = {

    constructor: WW.Speak,

    makeBillboard: function() {
        var message = this._parameters.message;
        var name = this._parameters.name;
        return this.createBillboard(message,name);
    },

    makeSprite: function() {
        var message = this._parameters.message;
        var name = this._parameters.name;
        return this.createSprite(message,name);
    },

    makeFrame: function(context, width, height, r)
    {
        context.beginPath();
        context.moveTo(r,0);//A
        context.lineTo(r + width, 0);//B
        context.quadraticCurveTo(r + width + r, 0, r + width + r, r);//C
        context.lineTo(width + 2 * r, height + r);//D
        context.quadraticCurveTo(width + 2 * r, height + 2 * r, width + r, height + 2 * r);//E
        context.lineTo(r, height + 2 * r);//F
        context.quadraticCurveTo(0, height + 2 * r, 0, height + r);//G
        context.lineTo(0, r);//H
        context.quadraticCurveTo(0, 0, r, 0);//A again
        context.closePath();
        context.fill();
        context.stroke();
    },

    //didn't finish
    getInfoOFMessage: function(message){
        var height = 32;
        var width = 320;//256
        var messageProcessed ={value:message,height:height,width:width};
        return messageProcessed;
    },

    getTexture: function (messageProcessed) {

        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');

        context.strokeStyle = "rgba(0,255,0,1.0)";
        context.fillStyle = "rgba(255,255,255,1.0)";
        context.lineWidth = 3;

        var width = messageProcessed.width;
        var height = messageProcessed.height;
        var message = messageProcessed.value;

        this.makeFrame(context,width,height,10);

        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "24pt Arial";
        context.fillStyle = "black";
        context.fillText(message, width/2, height/2);

        var texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        return texture;
    },

    createBillboard: function(message,name){

        var messageProcessed = this.getInfoOFMessage(message);

        var texture = this.getTexture(messageProcessed);

        var billboardMaterial = new THREE.MeshBasicMaterial( { map : texture, side : THREE.DoubleSide} );//
        var billboardGeometry = new THREE.PlaneGeometry(30, 5, 1, 1);

        var billboard = new THREE.Mesh(billboardGeometry, billboardMaterial);

        billboard.name = name;

        return billboard;
    },

    createSprite : function(message,name) {

        var messageProcessed = this.getInfoOFMessage(message);

        var texture = this.getTexture(messageProcessed);

        var material = new THREE.SpriteMaterial({
            map: texture
        });

        var sprite = new THREE.Sprite(material);

        sprite.name = name;
        sprite.scale.set(10,5);
        return sprite;
    }
};