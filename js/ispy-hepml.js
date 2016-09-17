var hepml = hepml || {};
hepml.version = '0.0.1';

hepml.event_index = 0;
hepml.events = [];

hepml.init = function() {

  var w = window.innerWidth;
  var h = window.innerHeight;

  hepml.scene = new THREE.Scene();
  hepml.stats = new Stats();
  document.getElementById('display').appendChild(hepml.stats.domElement);

  hepml.camera = new THREE.PerspectiveCamera(75, w/h, 0.1, 1000);
  hepml.camera.position.x = 4;
  hepml.camera.position.y = 4;
  hepml.camera.position.z = 4;

  hepml.renderer = new THREE.WebGLRenderer({antialias:true});
  hepml.renderer.setSize(w, h);
  hepml.renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);

  document.getElementById('display').appendChild(hepml.renderer.domElement);

  hepml.controls = new THREE.TrackballControls(hepml.camera, hepml.renderer.domElement);
  hepml.controls.rotateSpeed = 3.0;
  hepml.controls.zoomSpeed = 0.5;

  var ambientLight = new THREE.AmbientLight(0x404040);
  ambientLight.name = 'Ambient';
  hepml.scene.add(ambientLight);

  var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.name = 'Directional';
  directionalLight.position.set(0, 0.5, 1);
  hepml.scene.add(directionalLight);

  var axes = new THREE.AxisHelper(2);
  axes.name = 'Axes';
  hepml.scene.add(axes);

  var dobj = new THREE.Object3D();
  dobj.name = 'Detector';
  dobj.visible = true;

  var eobj = new THREE.Object3D();
  eobj.name = 'Event';
  eobj.visible = true;

  hepml.scene.add(dobj);
  hepml.scene.add(eobj);

  console.log(hepml.scene);

};

hepml.render = function() {

  requestAnimationFrame(hepml.render);
  hepml.renderer.render(hepml.scene, hepml.camera);

  hepml.controls.update();
  hepml.stats.update();

};

hepml.resetControls = function() {

  hepml.controls.reset();

};

hepml.setYX = function() {

  var length = hepml.camera.position.length();

  hepml.camera.position.x = 0;
  hepml.camera.position.y = 0;
  hepml.camera.position.z = length;
  hepml.camera.up = new THREE.Vector3(0,1,0);

  hepml.camera.lookAt(new THREE.Vector3(0,0,0));

};

hepml.setXZ = function() {

  var length = hepml.camera.position.length();

  hepml.camera.position.x = 0;
  hepml.camera.position.y = length;
  hepml.camera.position.z = 0;
  hepml.camera.up = new THREE.Vector3(1,0,0);

  hepml.camera.lookAt(new THREE.Vector3(0,0,0));

};

hepml.setYZ = function() {

  var length = hepml.camera.position.length();

  hepml.camera.position.x = -length;
  hepml.camera.position.y = 0;
  hepml.camera.position.z = 0;
  hepml.camera.up = new THREE.Vector3(0,1,0);

  hepml.camera.lookAt(new THREE.Vector3(0,0,0));

};

hepml.makeDetector = function(style) {

  var nx = 24;
  var ny = 24;
  var nz = 25;

  var cx = 0.10;
  var cy = 0.10;
  var cz = 0.10;

  var material;
  var geometry;

  if ( style.wireframe === true) {

    material = new THREE.LineBasicMaterial({
                        color: 0xaaaaaa,
                        linewidth: 0.1,
                        depthWrite: true,
                        transparent:true,
                        opacity: 0.1});

    geometry = new THREE.Geometry();

    var f1 = new THREE.Vector3(-cx*0.5,-cy*0.5, cz*0.5);
    var f2 = new THREE.Vector3(-cx*0.5, cy*0.5, cz*0.5);
    var f3 = new THREE.Vector3( cx*0.5, cy*0.5, cz*0.5);
    var f4 = new THREE.Vector3( cx*0.5,-cy*0.5, cz*0.5);

    var b1 = new THREE.Vector3(-cx*0.5,-cy*0.5,-cz*0.5);
    var b2 = new THREE.Vector3(-cx*0.5, cy*0.5,-cz*0.5);
    var b3 = new THREE.Vector3( cx*0.5, cy*0.5,-cz*0.5);
    var b4 = new THREE.Vector3( cx*0.5,-cy*0.5,-cz*0.5);

    geometry.vertices.push(f1,f2);
    geometry.vertices.push(f2,f3);
    geometry.vertices.push(f3,f4);
    geometry.vertices.push(f4,f1);

    geometry.vertices.push(b1,b2);
    geometry.vertices.push(b2,b3);
    geometry.vertices.push(b3,b4);
    geometry.vertices.push(b4,b1);

    geometry.vertices.push(b1,f1);
    geometry.vertices.push(b3,f3);
    geometry.vertices.push(b2,f2);
    geometry.vertices.push(b4,f4);
  } else {

    material = new THREE.MeshBasicMaterial({
                        color: 0xd3d3d3,
                        transparent:true,
                        opacity: 0.1});

    geometry = new THREE.BoxGeometry(cx,cy,cz);
  }

  for ( var i = 0; i < nx; i++ ) {
    for ( var j = 0; j < ny; j++ ) {
      for ( var k = 0; k < nz; k++ ) {

        var box;
        if ( style.wireframe === true ) {
          box = new THREE.LineSegments(geometry, material);
        } else {
          box = new THREE.Mesh(geometry, material);
        }

        box.position.x = (i + 0.5)*cx - nx*cx*0.5;
        box.position.y = (j + 0.5)*cy - ny*cy*0.5;
        box.position.z = (k + 0.5)*cz;

        hepml.scene.getObjectByName('Detector').add(box);

      }
    }
  }
};

hepml.loadData = function() {

  hepml.loaded_file = document.getElementById('local-file').files;

  var reader = new FileReader();
  hepml.file_name = hepml.loaded_file[0].name;

  reader.onload = function(e) {
    hepml.events = JSON.parse(e.target.result);
    hepml.enableNextPrev();
    hepml.addEvent();
  };

  reader.onerror = function(e) {
    alert(e);
  };

  reader.readAsText(hepml.loaded_file[0]);

};

hepml.addEvent = function() {

  hepml.scene.getObjectByName('Event').children.length = 0;
  var data = hepml.events[hepml.event_index];

  var ievent = +hepml.event_index + 1; // JavaScript!

  $("#event-loaded").html(hepml.file_name + ": [" + ievent + " of " + hepml.events.length + "]");

  var nx = 24;
  var ny = 24;
  var nz = 25;

  var cx = 0.10;
  var cy = 0.10;
  var cz = 0.10;

  var material = new THREE.MeshBasicMaterial({color: 0xff0000, transparent:true, opacity:1});

  var maxe = 0;

  for ( var e in data.ecal ) {
    var energy = data.ecal[e][3];
    if ( energy > maxe ) {
      maxe = energy;
    }
  }

  var colors = chroma.scale('Spectral').domain([1,0]);

  for ( var e in data.ecal ) {

    var hit = data.ecal[e];

    var i = Math.abs(data.ecal[e][0] - 24);
    var j = Math.abs(data.ecal[e][1] - 24);
    var k = Math.abs(data.ecal[e][2] - 25);

    var energy = data.ecal[e][3];
    var s = energy / maxe;

    if ( s < 0.1 ) {
      continue;
    }

    var o = 1.0;

    var x = (i + 0.5)*cx - nx*cx*0.5;
    var y = (j + 0.5)*cy - ny*cy*0.5;
    var z = (k + 0.5)*cz;

    var c = colors(s);
    var color = new THREE.Color(c._rgb[0]/255, c._rgb[1]/255, c._rgb[2]/255);
    var box = new THREE.Mesh(new THREE.BoxGeometry(s*cx,s*cy,s*cz), new THREE.MeshBasicMaterial({color:color, transparent:true, opacity:o}));

    box.position.x = x;
    box.position.y = y;
    box.position.z = z;

    hepml.scene.getObjectByName('Event').add(box);
  }

};

hepml.enableNextPrev = function() {

  $("#prev-event-button").removeClass("disabled");
  $("#next-event-button").removeClass("disabled");

};

hepml.nextEvent = function() {

  if ( hepml.events && hepml.events.length-1 > hepml.event_index ) {
    hepml.event_index++;
    hepml.addEvent();
  }

};

hepml.prevEvent = function() {

  if ( hepml.events && hepml.event_index > 0) {
    hepml.event_index--;
    hepml.addEvent();
  }

};
