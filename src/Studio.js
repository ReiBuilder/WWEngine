/**
 * Created by abyss http://www.abyssss.com
 */

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
    //this.renderer.shadowMapEnabled = true;

    //light
    this.light = new THREE.AmbientLight(0x141414);
    this.scene.add(this.light);

    //js loader
    this.loader = new THREE.JSONLoader();

    //
    //this.floor = null;

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
        var floorTexture = new THREE.ImageUtils.loadTexture
            ( WW.ResourceBasePath + 'images/checkerboard.jpg' );
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
