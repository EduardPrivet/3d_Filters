let container = document.getElementById('3dScene');
var renderer = new THREE.WebGLRenderer( {antialias: true});
renderer.setSize( window.innerWidth*0.75, window.innerHeight*0.98 );
container.append( renderer.domElement);


var scene = new THREE.Scene();
scene.background = new THREE.Color( 0xdddddd );
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth*0.75/window.innerHeight*0.98, 1, 2000 );
camera.position.z = 200;

var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;

var keyLight = new THREE.DirectionalLight(0xffffff, 0.35);
keyLight.position.set(-100, 0, -100);
scene.add(keyLight);

var moonLight = new THREE.DirectionalLight(0xffffff, 0.35);
moonLight.position.set(-100, 0, 100);
scene.add(moonLight);

var fillLight = new THREE.DirectionalLight(0xffffff, 0.35);
fillLight.position.set(100, 0, -100);
scene.add(fillLight);

var backLight = new THREE.DirectionalLight(0xffffff, 0.35);
backLight.position.set(100, 0, 100);
scene.add(backLight);


var backLight = new THREE.AmbientLight(0xffffff, 0.6);
backLight.position.set(100, 0, 100);
scene.add(backLight);


const manager = new THREE.LoadingManager();


const mtlLoader = new THREE.MTLLoader();
mtlLoader.setTexturePath();
mtlLoader.setPath();

var LoadingBar = false;

const objLoader =  new THREE.OBJLoader(manager);


let materials;

;
document.querySelector('.preload').style.display = 'none';

manager.onProgress = function () {


};

manager.onLoad = function () {

  document.querySelector('.preload').style.display = 'none';
};


var animate = function () {
	requestAnimationFrame( animate );
	controls.update();
	renderer.render(scene, camera);
};

animate();



function upload_mtl(file) {
    var formData = new FormData();

    formData.append("file", file, "name");
    formData.append("upload_file", true);

    $.ajax({
        type: "POST",
        url: "/load_mtl",
        xhr: function () {
            var myXhr = $.ajaxSettings.xhr();
            return myXhr;
        },
        success: function (r) {
            console.log(r);

            mtlLoader.load(r.name, function (resp_materials) {

                materials = resp_materials;
                materials.preload();

            });


        },
        error: function (e) {
            console.log(e);
        },
        async: true,
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        timeout: 60000
    });
}


function upload_obj(file) {
    var formData = new FormData();

    formData.append("file", file, "name");
    formData.append("upload_file", true);
    document.querySelector('.preload').style.display = 'inline';
    $.ajax({
        type: "POST",
        url: "/load_obj",
        xhr: function () {
            var myXhr = $.ajaxSettings.xhr();
            return myXhr;
        },
        success: function (r) {
            console.log(r);
            objLoader.setMaterials(materials);
            objLoader.setPath();
            objLoader.load(r.name, function (object) {

                scene.add(object);
                object.position.y -= 90;
		        object.scale.x=20000;
		        object.scale.y=20000;
		        object.scale.z=20000;

            });
        },
        error: function (e) {
            console.log(e);
        },
        async: true,
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        timeout: 6000000
    });
}



let mtl_input = document.getElementById("mtl_input");
let obj_input = document.getElementById("obj_input");


mtl_input.onchange = function(e) {
    upload_mtl(this.files[0])
}

obj_input.onchange = function(e) {
    upload_obj(this.files[0])
}
