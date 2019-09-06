const d = document;

let container = document.getElementById('3dScene'); //Searching for div-container in html-doc
var renderer = new THREE.WebGLRenderer( {antialias: true}); //enable antialiasing


var scene = new THREE.Scene();
scene.background = new THREE.Color( 0xffffff );
var camera = new THREE.PerspectiveCamera( 45, $(container).width()/ $(container).height(), 1, 10000 );


//enable control by mouse
var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.15;
controls.enableZoom = true;
controls.rotateSpeed = 0.3;
//creating Lights
var frontLight = new THREE.DirectionalLight(0xffffff, 0.35);
frontLight.position.set(-100, 0, -100);
scene.add(frontLight);

var leftLight = new THREE.DirectionalLight(0xffffff, 0.35);
leftLight.position.set(-100, 0, 100);
scene.add(leftLight);

var rightLight = new THREE.DirectionalLight(0xffffff, 0.35);
rightLight.position.set(100, 0, -100);
scene.add(rightLight);

var backLight = new THREE.DirectionalLight(0xffffff, 0.35);
backLight.position.set(100, 0, 100);
scene.add(backLight);

var fillLight = new THREE.AmbientLight(0xffffff, 0.6);
fillLight.position.set(100, 0, 100);
scene.add(fillLight);

//Initing meshes loading manager
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

manager.onProgress = function (url,itemsLoaded,itemsTotal) {

    console.log(url,itemsLoaded,itemsTotal);


};

//hiding 'Loading...' after finish of loading
manager.onLoad = function () {
    $('#pb').hide();
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


        bar.animate(Percentage,{duration:100});



        if(Percentage >= 1)
        {
           console.log('completed');
           document.querySelector('.preload').style.display = 'flex';

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
              //  myXhr.upload.addEventListener('progress',progress, false);
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
            $('#pb').show();
        },
        success: function (r) {

            console.log(r);
            objLoader.setMaterials(materials);
            objLoader.setPath();
            objLoader.load(r.name, function (object) {

                scene.add(object);

		        object.scale.x=10000;
		        object.scale.y=10000;
		        object.scale.z=10000;
		        boundingBox = new THREE.Box3().setFromObject(object)
                objectSize = boundingBox.getSize() // Returns Vector3
                objectMaxSize = Math.max(objectSize.x, objectSize.y);
		        object.position.y=-objectSize.y*0.5;
		        object.position.x=0;
		        camera.position.z = 1.5*objectMaxSize;
		        object.position.z = 0;
		        console.log(objectMaxSize);

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
        color: 'rgb(14, 103, 255)',
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

      bar.animate(0,{duration:0});  // Number from 0.0 to 1.0
});