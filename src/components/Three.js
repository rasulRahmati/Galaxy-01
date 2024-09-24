import React, {useEffect, useRef} from "react";
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js';
import * as dat from 'dat.gui';
import gsap from "gsap";
import typeFaceFont from 'three/examples/fonts/helvetiker_regular.typeface.json'

const Three = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    //  Debug
    const gui = new dat.GUI({ width: 360 });

    //  Texture
    const textureLoader = new THREE.TextureLoader();

    //  Scene
    const scene = new THREE.Scene();

    // Renderer
    const renderer = new THREE.WebGLRenderer({});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    //  Galaxy
    const parameters = {
      count: 100000,
      size: 0.01,
      radius: 5,
      branches: 3,
      spin: 1,
      randomeness: 0.2,
      randomnessPower: 3,
      insideColor: '#ff6030',
      outsideColor: '#1b3984'
    }
    let geometry = null;
    let material = null;
    let points = null;

    const generateGalaxy = () => {
      //  Destroy old galexy particles
      if(points !== null) {
        geometry.dispose();
        material.dispose();
        scene.remove(points);
      }

      geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(parameters.count * 3);
      const colors = new Float32Array(parameters.count * 3);

      const colorInside = new THREE.Color(parameters.insideColor);
      const colorOutside = new THREE.Color(parameters.outsideColor);

      for (let index = 0; index < parameters.count; index++) {
        const i3 = index * 3;

        //  Position
        const radius = Math.random() * parameters.radius;
        const spinAngle = radius * parameters.spin;
        const branchAngle = (index % parameters.branches) / parameters.branches * Math.PI *2;

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);

        positions[i3 + 0] = Math.cos(branchAngle + spinAngle) * radius + randomX;
        positions[i3 + 1] = randomY;
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

        //  Color
        const mixedColor = colorInside.clone();
        mixedColor.lerp(colorOutside, radius / parameters.radius);

        colors[i3 + 0] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;

      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
      }); 

      points = new THREE.Points(geometry, material);
      scene.add(points);
    };
    
    generateGalaxy();

    gui.add(parameters, 'count').min(100).max(1000000).step(100).onFinishChange(generateGalaxy);
    gui.add(parameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy);
    gui.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy);
    gui.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy);
    gui.add(parameters, 'spin').min(-5).max(5).step(0.001).onFinishChange(generateGalaxy);
    gui.add(parameters, 'randomeness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy);
    gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxy);
    gui.add(parameters, 'insideColor').onFinishChange(generateGalaxy);
    gui.add(parameters, 'outsideColor').onFinishChange(generateGalaxy);
    
    //  Lights

    //  Axes helper
    const axesHelper = new THREE.AxesHelper(2);
    scene.add(axesHelper);

    gui.add(axesHelper, 'visible').name('AxesHelper').setValue(false);

    //  Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
    camera.position.z = 3;
    scene.add(camera);

    // Helper

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Resize
    const handleResize = (event) => {
        //  Update camera
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        //  Update renderer
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
    window.addEventListener('resize', handleResize)

    // Clock
    const clock = new THREE.Clock();

    //  Animation
    const animate = () => {
        // const elapsedTime = clock.getElapsedTime();

        //  Update controls for damping
        controls.update();

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    };

    animate();

    return () => {
        window.removeEventListener('resize', handleResize);
        containerRef.current.removeChild(renderer.domElement);
        gui.destroy();
    };
  },[]);

  return (
    <div ref={containerRef}/>
  );
}

export default Three