let container = document.getElementById('3dScene');  //Searching for div-container in html-doc
var renderer = new THREE.WebGLRenderer( {antialias: true}); //enable antialiasing
renderer.setSize( window.innerWidth*0.75, window.innerHeight*0.98 ); //
container.append( renderer.domElement);


var scene = new THREE.Scene();
scene.background = new THREE.Color( 0xdddddd );
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth*0.75/window.innerHeight*0.98, 1, 2000 );
camera.position.z = 200;

//enable control by mouse
var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;

//creating Lights
var frontLight = new THREE.DirectionalLight(0xffffff, 0.35);
keyLight.position.set(-100, 0, -100);
scene.add(frontLight);

var leftLight = new THREE.DirectionalLight(0xffffff, 0.35);
moonLight.position.set(-100, 0, 100);
scene.add(leftLight);

var rightLight = new THREE.DirectionalLight(0xffffff, 0.35);
fillLight.position.set(100, 0, -100);
scene.add(rightLight);

var backLight = new THREE.DirectionalLight(0xffffff, 0.35);
backLight.position.set(100, 0, 100);
scene.add(backLight);

var fillLight = new THREE.AmbientLight(0xffffff, 0.6);
backLight.position.set(100, 0, 100);
scene.add(fillLight);


//Loading manager for checking progress steps
const manager = new THREE.LoadingManager();

//loader for mtl's
const mtlLoader = new THREE.MTLLoader();


var LoadingBar = false;

//loader for obj's
const objLoader =  new THREE.OBJLoader(manager);

//need for mtl
let materials;

//hiding 'Loading...' before start of loading
document.querySelector('.preload').style.display = 'none';


//hiding 'Loading...' after finish of loading
manager.onLoad = function () {

  document.querySelector('.preload').style.display = 'none';
};

//rendering scene & enable control
var animate = function () {
	requestAnimationFrame( animate );
	controls.update();
	renderer.render(scene, camera);
};

animate();

//track uploading progress
function progress(e){

    if(e.lengthComputable){
        var max = e.total;
        var current = e.loaded;

        var Percentage = (current * 100)/max;
        console.log(Percentage);


        if(Percentage >= 100)
        {
           console.log('completed');
            // process completed
        }
    }
 }


function upload_mtl(file) {
    var formData = new FormData();

    formData.append("file", file, "name");
    formData.append("upload_file", true);

    $.ajax({
        type: "POST",
        url: "/load_mtl",
        xhr: function () {
            var myXhr = $.ajaxSettings.xhr();
            if(myXhr.upload){
                myXhr.upload.addEventListener('progress',progress, false);
            }
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
            if(myXhr.upload){
                myXhr.upload.addEventListener('progress',progress, false);
            }
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
