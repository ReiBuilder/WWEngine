/**
 * Created by abyss http://www.abyssss.com
 */
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
        this.studioPointer.loader.load(WW.ResourceBasePath + 'models/android-animations.js',
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

