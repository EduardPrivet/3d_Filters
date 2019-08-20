const d = document;

let container = document.getElementById('3dScene'); //Searching for div-container in html-doc
var renderer = new THREE.WebGLRenderer( {antialias: true}); //enable antialiasing


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

//Initing meshes loading manager
const manager = new THREE.LoadingManager();

//loader for mtl's
const mtlLoader = new THREE.MTLLoader();
mtlLoader.setTexturePath();
mtlLoader.setPath();

var LoadingBar = false;

const objLoader =  new THREE.OBJLoader(manager);

//need for mtl
let materials;

//hiding 'Loading...' before start of loading
document.querySelector('.preload').style.display = 'none';

manager.onProgress = function (url,itemsLoaded,itemsTotal) {

    console.log(url,itemsLoaded,itemsTotal);


};

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

        var Percentage = current/max;
        console.log(Percentage);

        $('#pb').show();
        bar.animate(Percentage,{duration:100});



        if(Percentage >= 1)
        {
           console.log('completed');
           $('#pb').hide();
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
        beforeSend:function(e){
            bar.animate(0,{duration:0});
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
        beforeSend:function(e){
            bar.animate(0,{duration:0});
        },
        success: function (r) {
            document.querySelector('.preload').style.display = 'flex';
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

let bar;


$(d).ready(function(){
    console.log('index ready');

    let bb = container.getBoundingClientRect();

    renderer.setSize( bb.width, bb.height );
    container.append( renderer.domElement);

    bar = new ProgressBar.Line('#pb', {
        strokeWidth: 4,
        easing: 'easeInOut',
        duration: 1400,
        color: 'rgb(184,9,50)',
        trailColor: '#eee',
        trailWidth: 1,
        svgStyle: {width: '100%', height: '100%'},
        text: {
          style: {
            // // Text color.
            // // Default: same as stroke color (options.color)
            // color: '#999',
            // position: 'absolute',
            // right: '0',
            // top: '30px',
            // padding: 0,
            // margin: 0,
            // transform: null
          },
          autoStyleContainer: false
        },
        from: {color: '#FFEA82'},
        to: {color: '#ED6A5A'},
        step: (state, bar) => {
          bar.setText(Math.round(bar.value() * 100) + ' %');
        }
      });
      
     // bar.animate(1.0);  // Number from 0.0 to 1.0
});