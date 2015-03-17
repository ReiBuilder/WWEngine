/**
 * Created by abyss http://www.abyssss.com
 *
 * Controls is using to create controls if it's necessary.
 * now, Rei only provides OrbitControls as default.
 *
 * generally, the camera used in Rei's world is controled by input words,
 * users can't and should not control camera themselves.
 *
 */

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
