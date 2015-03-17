/**
 * Created by abyss http://www.abyssss.com
 */
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
            var mesh = $this._scene.getObjectByName($this._name);

            if (mesh && billboard) {
                var position = mesh.position;
                var y = position.y;
                billboard.position.set(position.x,position.y,position.z);
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
                billboard.position.set(position.x,position.y,position.z);
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


