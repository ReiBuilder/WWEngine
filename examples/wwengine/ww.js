/**
 * @author abyss / http://www.abyssss.com/
 */

////////////////////////////////////////////
//            File:src/ww.js              //
////////////////////////////////////////////
var WW = { REVISION: '1' };

WW.ResourceBasePath = "assets/";

////////////////////////////////////////////
//          File:src/Actors.js            //
////////////////////////////////////////////
WW.Actors = function (parameters) {

    this.studioPointer = parameters.studio;
    this._actors = [];
};


WW.Actors.prototype = {

    constructor: WW.Actors,

    getActorByName: function (name) {
        return this.studioPointer.scene.getChildByName(name);
    },

    createNewActor: function (name) {

        var $this = this;
        var meshAnim;
        this.studioPointer.loader.load('http://7xj8al.com1.z0.glb.clouddn.com/android-animations.js',
            function (geometry, materials) {
                for (var i = 0; i < materials.length; i++) {
                    materials[i].morphTargets = true;
                }
                var material = new THREE.MeshFaceMaterial(materials);
                meshAnim = new THREE.MorphAnimMesh(geometry, material);
                meshAnim.name = name;
                $this._actors.push(name);
                $this.studioPointer.scene.add(meshAnim);
            }
        );
    }
};


////////////////////////////////////////////
//         File:src/Controls.js           //
////////////////////////////////////////////
WW.Controls = function (parameters) {

    this.control = new THREE.OrbitControls( parameters.camera,
        parameters.renderer.domElement );
};

WW.Controls.prototype = {

    constructor: WW.Controls,

    updateControls: function() {
        this.control.update();
    }
};



////////////////////////////////////////////
//         File:src/Effect.js             //
////////////////////////////////////////////
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

////////////////////////////////////////////
//          File:src/Process.js           //
////////////////////////////////////////////
WW.ProcessSystem = function()
{
    this._process = [];
}

WW.ProcessSystem.prototype = {

    constructor: WW.ProcessSystem,

    getAll: function () {
        return this._process;
    },

    removeAll: function () {
        this._process = [];
    },

    add: function ( process ) {
        this._process.push( process );
    },

    update: function () {

        TWEEN.update();
    }
}


WW.Process = function ( parameters) {

    this._name = parameters.name;
    this._scene = parameters.scene;
    this._render = parameters.render;
    this._effect = parameters.effect;
    this._camera = parameters.camera;
    this._processes = [];

    this._defaultId = -1;
    this._defaultMessage = "";
    this._defaultName = "";
    this._defaultParentId = -1;
    this._defaultStart = 0;
    this._defaultEnd = 0;
    this._defaultDuration = 1000;
    this._defaultRepeat = 0;
    this._defaultYoyo = false;
    this._defaultEasingFunction = TWEEN.Easing.Linear.None;

}

WW.Process.prototype = {

    constructor: WW.Process,

    handleScript: function(play) {
        this._name = play.name;
        var length = play.scripts.length;
        for(var i = 0; i<length; i++)
        {
            var parameters = this.rebuildScript(play.scripts[i]);
            var tween = this.makeTweenDispatch(parameters);
            this.addPhase({phaseId:parameters.id,
                parentId:parameters.parentId,
                tweenObject:tween});
        }
        this.makePhaseChain();
        this.startPhaseChain();
    },

    rebuildScript: function(script) {

        var at = script.actionType;
        var id = script.id == undefined ? this._defaultId : script.id;
        var message = script.message == undefined ? this._defaultMessage : script.message;
        var name = script.name == undefined ? this._defaultName : script.name;
        var parentId = script.parentId == undefined ? this._defaultParentId : script.parentId;
        var start = script.start == undefined ? this._defaultStart : script.start;
        var end = script.end == undefined ? this._defaultEnd : script.end;
        var duration = script.duration == undefined ? this._defaultDuration : script.duration;
        var repeat = script.repeat == undefined ? this._defaultRepeat : script.repeat;
        var yoyo = script.yoyo == undefined ? this._defaultYoyo : script.yoyo;
        var easingFunction = script.ef == undefined ? this._defaultEasingFunction : script.ef;

        var parameters = {actionType:at,
            id:id,
            message:message,
            name:name,
            parentId:parentId,
            start:start,
            end:end,
            duration:duration,
            repeat:repeat,
            yoyo:yoyo,
            easingFunction:easingFunction};

        return parameters;

    },

    makeTweenDispatch: function(parameters){

        switch(parameters.actionType){
            case "action":{//1
                return this.actionTween(parameters);
            }break;
            case "move":{//2
                return this.moveTween(parameters);
            }break;
            case "effect":{//3
                return this.effectTween(parameters);
            }break;
            default:{}break;
        }
    },

    effectTween: function(parameters){

        var speak = new WW.Speak(parameters);
        this._effect._effects.push(speak);
        var $this = this;

        var onUpdate1 = function () {
            var time = this.time;
            $this._render.clear();

            var speak = $this._effect.getEffectByName(this.name);

            if(speak._isAddedToScene == false &&
                time < (10000/10))
            {
                var temp = speak.makeSprite();
                $this._scene.add(temp);
                speak._isAddedToScene = true;
            }

            var billboard = $this._scene.getObjectByName(this.name);
            var mesh = $this._scene.getObjectByName($this._name);//target's name

            if (mesh && billboard) {
                var position = mesh.position;
                var y = position.y;
                billboard.position.set(position.x,position.y,position.z);//= position
                billboard.position.setY(y + 10);
                billboard.lookAt($this._camera.position);


            }
        };

        var tween1 = new TWEEN.Tween({time:0,name:parameters.name})
            .to({time:parameters.end}, parameters.duration)
            .easing(parameters.easingFunction)
            .repeat(parameters.repeat)
            .yoyo(parameters.yoyo)
            .onUpdate(onUpdate1);


        var onUpdate2 = function () {
            var time = this.time;
            //$this._render.clear();

            var speak = $this._effect.getEffectByName(this.name);
            var billboard = $this._scene.getObjectByName(this.name);
            var mesh = $this._scene.getObjectByName($this._name);

            if(time > (9 * 10000)/10 &&
                speak._isAddedToScene == true &&
                speak._isDeleteFromScene == false)
            {
                if(billboard)
                {
                    $this._scene.remove(billboard);
                }
                speak._isDeleteFromScene = true;
            }

            if (mesh && billboard) {
                var position = mesh.position;
                var y = position.y;
                billboard.position.set(position.x,position.y,position.z);//= position
                billboard.position.setY(y + 10);
            }
        };

        var tween2 = new TWEEN.Tween({time:0,name:parameters.name})
            .to({time:parameters.end}, parameters.duration)
            .easing(parameters.easingFunction)
            .repeat(parameters.repeat)
            .yoyo(parameters.yoyo)
            .onUpdate(onUpdate2);

        var chain = [];
        chain.push(tween2);
        tween1.chain(chain);

        return tween1;

    },

    actionTween: function(parameters){

        var $this = this;
        var onUpdate = function () {
            var pos = this.pos;
            $this._render.clear();//?
            var mesh = $this._scene.getObjectByName($this._name);
            if (mesh) {
                mesh.updateAnimation(pos * 1000);
            }
        };

        var tween = new TWEEN.Tween({pos: parameters.start})
            .to({pos: parameters.end}, parameters.duration)
            .easing(parameters.easingFunction)
            .repeat(parameters.repeat)
            .yoyo(parameters.yoyo)
            .onUpdate(onUpdate);

        return tween;
    },

    moveTween: function(parameters){
        var $this = this;
        var onUpdate = function () {
            $this._render.clear();//?
            var mesh = $this._scene.getObjectByName($this._name);
            if (mesh) {
                mesh.position.set(this.x,this.y,this.z);
            }
        };

        var tween = new TWEEN.Tween(parameters.start)
            .to(parameters.end, parameters.duration)
            .easing(parameters.easingFunction)
            .repeat(parameters.repeat)
            .yoyo(parameters.yoyo)
            .onUpdate(onUpdate);

        return tween;
    },

    getPhaseIndexById: function(parentId) {
        var length = this._processes.length;
        for(var i = 0; i < length; i++)
        {
            if(this._processes[i].phaseId == parentId)
            {
                return i;
            }
        }
        return -1;
    },

    getPhaseById: function(parentId) {
        var length = this._processes.length;
        for(var i = 0; i < length; i++)
        {
            if(this._processes[i].phaseId == parentId)
            {
                return this._processes[i].tweenObject;
            }
        }
        return null;
    },

    addPhase: function(phase) {
        this._processes.push(phase);
    },

    startPhaseChain: function() {
        if(this._processes.length > 0)
        {
            this._processes[0].tweenObject.start();
        }
    },

    makePhaseChain: function(){
        var chainsList = [];
        var phaseLength = this._processes.length;

        for(var i = 0; i<phaseLength; i++)
        {
            var chains = [];
            chainsList.push(chains);
        }

        for(var i = 0; i<phaseLength; i++)
        {
            var parentId = this._processes[i].parentId;
            var index = this.getPhaseIndexById(parentId);
            if(index != -1)
            {
                chainsList[index].push(this._processes[i].tweenObject);
            }
        }

        for(var i = 0; i<phaseLength; i++)
        {
            if(chainsList[i].length > 0)
            {
                this._processes[i].tweenObject.chain(chainsList[i]);
            }
        }
    }
}

////////////////////////////////////////////
//          File:src/Studio.js            //
////////////////////////////////////////////
WW.Studio = function (parameters) {

    this.showPlace = parameters.showPlace;
    this.clientWidth = this.showPlace.width();
    this.clientHeight = this.showPlace.height();

    //scene
    this.scene = new THREE.Scene();

    //camera
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);//
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = 100;
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    //render
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(new THREE.Color(0xEEEEEE, 1.0));
    this.renderer.setSize(this.clientWidth,this.clientHeight);


    this.light = new THREE.AmbientLight(0x141414);

    this.scene.add(this.light);

    this.loader = new THREE.JSONLoader();

    this.showPlace.append(this.renderer.domElement);

    this.effect = new WW.Effect(null);

};



WW.Studio.prototype = {

    constructor: WW.Studio,

    makeDefaultSkyBox: function() {
        var skyBoxGeometry = new THREE.BoxGeometry( 1000, 1000, 1000 );
        var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x99eeee, side: THREE.BackSide } );
        var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
        skyBox.name = "defaultSkyBox";
        this.scene.add(skyBox);
    },

    makeDefaultFloor: function() {
        THREE.ImageUtils.crossOrigin = '';
        var floorTexture = THREE.ImageUtils.loadTexture
        ( 'http://7xj8al.com1.z0.glb.clouddn.com/checkerboard.jpg' );
        floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.repeat.set( 10, 10 );
        var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
        var floorGeometry = new THREE.PlaneGeometry(100, 100, 10, 10);
        var floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.name = "defaultFloor";
        floor.position.y = -0.5;
        floor.rotation.x = Math.PI / 2;
        this.scene.add(floor);
    }

};