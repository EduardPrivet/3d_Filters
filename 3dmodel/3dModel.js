let renderer;
var objRequest ={};
/** @namespace */
var THREEx	= THREEx || {}
/**
 * Update renderer and camera when the window is resized
 * 
 * @param {Object} renderer the renderer to update
 * @param {Object} Camera the camera to update
 * @param {Function} dimension callback for renderer size
*/
THREEx.WindowResize	= function(renderer, camera, dimension){
	dimension 	= dimension || function(){ return { width: window.innerWidth*0.65, height: window.innerHeight*0.9 } }
	var callback	= function(){
		// fetch target renderer size
		var rendererSize = dimension();
		// notify the renderer of the size change
		renderer.setSize( rendererSize.width, rendererSize.height )
		// update the camera
		camera.aspect	= rendererSize.width / rendererSize.height
		camera.updateProjectionMatrix()
	}
	// bind the resize event
	window.addEventListener('resize', callback, false)
	// return .stop() the function to stop watching window resize
	return {
		trigger	: function(){
			callback()
		},
		/**
		 * Stop watching window resize
		*/
		destroy	: function(){
			window.removeEventListener('resize', callback)
		}
	}
}

let bar;
var animationEnd = true;
$(document).ready(function(){
  //  console.log(new ProgressBar())
    $('.open-model').each((i,e)=>{
        let mtl = e.dataset.mtl;
        let obj = e.dataset.obj;

        if (!mtl || !obj) {
            $(e).hide();
        }
    })

    $('.open-model').click(function(e){
        e.preventDefault();


        let close = document.createElement('div');
        close.className = 'fancybox-button';
        let modal_holder = document.createElement('div');
        modal_holder.className = 'modal_holder';
        modal_holder.style = 'position:fixed; left:0; top:0; right:0; bottom:0;  z-index:7; background-color:rgba(30,30,30,0.87);';



        close.onclick = function(){
            $('.modal_holder').remove();
        }
        close.style = 'cursor: pointer; position:fixed; right: 0; top:0; z-index:9; width: 44px; height: 44px; background: rgba(30,30,30,.6); cursor: pointer; padding:10px;';
        close.innerHTML = '<svg viewBox="0 0 40 40"><path d="M10,10 L30,30 M30,10 L10,30"></path></svg>';
        document.onkeydown = function(evt) {
            evt = evt || window.event;
            if (evt.keyCode == 27) {
                $('.modal_holder').remove();
            }
        };

        modal_holder.appendChild(close);
        $('body').append(modal_holder);
        let mtl = this.dataset.mtl;
        let obj = this.dataset.obj;

        let modal = document.createElement('div');
        modal.className = 'modal-popup loading';
        modal.style = 'width: 65%; height: 90%; position:fixed; left:0; top:0; right:0; bottom:0; margin: auto; z-index:8; background-color:#fff;';
        modal.innerHTML = `
        <div id="pb" class="progressbar"></div>
        <div id="3dScene" style="width: 100%; height: 100%;"></div>`;
        
        modal_holder.appendChild(modal);


        let container = document.getElementById('3dScene'); //Searching for div-container in html-doc
        renderer = new THREE.WebGLRenderer( {antialias: true}); //enable antialiasing

        renderer.setSize( window.innerWidth*0.65, window.innerHeight*0.9 );
        container.append( renderer.domElement);


        var scene = new THREE.Scene();
        scene.background = new THREE.Color( 0xffffff );
        var camera = new THREE.PerspectiveCamera( 20, $(container).width()/ $(container).height(), 1, 10000 );



        //enable control by mouse
        var controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.07;
        controls.enableZoom = true;
        controls.rotateSpeed = 0.1;
        controls.autoRotate=true;
        controls.autoRotateSpeed=0.1;
        controls.smoothZoom = true;
        controls.zoomDampingFactor = 0.8;
        controls.smoothZoomSpeed = 1.0;

        modal_holder.onmouseup = function mouseUp() {
            controls.autoRotate=false;
            setTimeout(function() {
                controls.autoRotate=true;
            }, 5000);
        };


        var backLight = new THREE.PointLight(0xffffff, 0.8);

        var fillLight = new THREE.AmbientLight(0xffffff, 0.0);
        //fillLight.position.set(100, 0, 100);
        scene.add(fillLight);

        var light = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.3 );
        scene.add( light );
        //Initing meshes loading manager
        const manager = new THREE.LoadingManager();

        //loader for mtl's
        const mtlLoader = new THREE.MTLLoader();


        //loader for obj's
        //const objLoader =  new THREE.OBJLoader();
        const objLoader =  new THREE.OBJLoader(manager);

        //need for mtl
        let materials;

        bar = new ProgressBar.Line('#pb', {
            strokeWidth: 4,
            easing: 'easeInOut',
            duration: 150,
            color: 'rgb(14, 103, 255)',
            trailColor: '#ddd',
            trailWidth: 1,
            svgStyle: {width: '100%', height: '100%'},
            text: {
                style: {
                },
                autoStyleContainer: false
              },
            step: (state, bar) => {
              bar.setText(Math.round(bar.value() * 100) + ' %');
            }
          });

        function onProgress( xhr ) {
            if ( xhr.lengthComputable ) {
                var percentComplete = xhr.loaded / xhr.total ;
                //console.log( 'model ' +  percentComplete*100  + '% downloaded' );
                
                if (animationEnd) {
                    animationEnd = false;
                    bar.animate(percentComplete,{duration:150, easing: 'easeInOut'},function (){
                        animationEnd= true;
                        
                    });
                
                }

                $('#pb').show()
        
        
                if(percentComplete >= 0.93)
                {
                    bar.animate(0.93,{duration:10, easing: 'easeInOut'},function (){
                        animationEnd= true;  
                    });
                
                    // process completed
                }
                if(percentComplete >= 1)
                {
                    bar.animate(1,{duration:10, easing: 'easeInOut'},function (){
                        animationEnd= true;
                        $('#pb').hide() 
                    });
                }
            }
        
        }
        



        mtlLoader.load(mtl, function (resp_materials) {

            materials = resp_materials;
            //materials.preload();

            objLoader.setMaterials(materials);
            objLoader.setPath();
            objRequest = objLoader.load(obj, function (object) {
                console.log (object)

                object.scale.x=10000;
                object.scale.y=10000;
                object.scale.z=10000;
                boundingBox = new THREE.Box3().setFromObject(object)
                objectSize = boundingBox.getSize() // Returns Vector3
                objectMaxSize = Math.max(objectSize.x, objectSize.y);
                object.position.y=-objectSize.y*0.5;
                object.position.x=0;
                camera.position.y = Math.trunc(objectSize.y);
                camera.lookAt(object);
                camera.position.z = 3.2*objectMaxSize + 0.5*objectSize.z;
                object.position.z = 0;

                
                backLight.target= object;
                scene.add(backLight);
                scene.add(object);
                $(modal).removeClass("loading");

                
    
            }, onProgress)

        });

        var animate = function () {
            requestAnimationFrame( animate );
            controls.update();
            backLight.position.copy( camera.position );
            renderer.render(scene, camera);
        };
        
        animate();

        
        new THREEx.WindowResize(renderer, camera)

      
    });
});