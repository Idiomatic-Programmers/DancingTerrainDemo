import './style.css'
import * as THREE from 'three'
import gsap from "gsap";
import plainVertexShader from './shaders/visualiserPlane/vertex.glsl'
import plainFragmentShader from './shaders/visualiserPlane/fragment.glsl'

const webGLCanvas = document.getElementById('webgl')

import playButton from '../static/play-button.svg'
import pauseButton from '../static/pause.svg'

const scene = new THREE.Scene()
scene.background = new THREE.Color("#e5e8ff")
scene.fog = new THREE.Fog(new THREE.Color("#e5e8ff"), 5, 8)

// The canvas will take up the entire window.
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 15)
camera.position.z = 3
camera.position.y = 2
scene.add(camera)

const ambientLight = new THREE.AmbientLight("#ffffff", 0.5)
scene.add(ambientLight)

const renderer = new THREE.WebGLRenderer({
    canvas: webGLCanvas,
    antialias: true
})
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(sizes.width, sizes.height)

// const controls = new OrbitControls(camera, renderer.domElement)

/*
 * Load Audio
 */
const audioListener = new THREE.AudioListener();
camera.add(audioListener)

const audioBuffer = new THREE.Audio(audioListener);
scene.add(audioBuffer)

const audioLoader = new THREE.AudioLoader();
audioLoader.load('audio3.mp3', (tempAudioBuffer) => {
    audioBuffer.setBuffer(tempAudioBuffer)
    document.getElementById('audioPlayButton').style.display = "block"

    gsap.to('.loading', {
        opacity: 0, duration: 1
    }).then(() => {
        document.querySelector('.loading').style.display = "none"
        gsap.to("#audioPlayButton", {
            opacity: 1, duration: 2, ease: "power4.out"
        })
    })


}, (xhr)=>{
    console.log((xhr.loaded / xhr.total * 100) + "% loaded")
    document.getElementById('progress').style.width = (xhr.loaded / xhr.total * 100) + "%"
}, (error)=>{
    console.error(error)
})

let averageFrequency = 0;

document.getElementById('audioPlayButton').addEventListener('click', (e)=>{
        gsap.to(camera.rotation, {
            duration: 1, x: -35 * Math.PI / 180, ease: "power4.out"
        })
        gsap.to("#audioPlayButton", {
            opacity: 0, duration: 0.5, ease: "power4.out"
        }).then(() => {
            document.getElementById('audioPlayButton').style.display = "none"
        })

        gsap.to('.controllers', {
            top: 0, duration: 1, ease: "power4.out"
        })

        audioBuffer.play()
})

audioBuffer.onEnded = () => {
    audioBuffer.stop()
    gsap.to(camera.rotation, {
        duration: 1, x: 0, ease: "power4.out"
    })

    document.getElementById('audioPlayButton').style.display = "block"
    gsap.to("#audioPlayButton", {
        opacity: 1, duration: 0.5, ease: "power4.out"
    })
    gsap.to('.controllers', {
        top: -100, duration: 1, ease: "power4.out"
    })
}

const playPauseButton = document.getElementById('playPauseButton')
playPauseButton.addEventListener('click', ()=>{
    if (audioBuffer.isPlaying) {
        audioBuffer.pause();
        playPauseButton.src = playButton;
        gsap.to(sphereShaderMaterial.uniforms.uFrequency, {
            duration: 0.5, value: 0
        })
    } else {
        audioBuffer.play();
        playPauseButton.src = pauseButton;
        gsap.to(sphereShaderMaterial.uniforms.uFrequency, {
            duration: 0.5, value: averageFrequency
        })
    }
})

/*
 * Load Test Particle Plane
 */
const sphereGeometry = new THREE.PlaneBufferGeometry(20, 10, 350, 350)

const sphereShaderMaterial = new THREE.ShaderMaterial({
    vertexShader: plainVertexShader,
    fragmentShader: plainFragmentShader,
    uniforms: {
        'uTime': {
          value: 0
        },
        'uFrequency': {
            value: 1.618
        },
        'uColor1': {
            value: new THREE.Color("#e30e45")
        },
        'uColor2': {
            value: new THREE.Color("#ff3c6c")
        },
        fogColor:    { type: "c", value: new THREE.Color("#e5e8ff") },
        fogNear:     { type: "f", value: scene.fog.near },
        fogFar:      { type: "f", value: scene.fog.far }
    },
    fog: true
});


const sphere = new THREE.Mesh(sphereGeometry, sphereShaderMaterial)

sphere.rotation.x = - 90 * Math.PI / 180
sphere.position.y = - 2
scene.add(sphere)

/*
 * Get Audio Data
 */
const analyser1 = new THREE.AudioAnalyser(audioBuffer, 128)

const clock = new THREE.Clock()

const animate = () => {
    requestAnimationFrame(animate)

    sphereShaderMaterial.uniforms.uTime.value = clock.getElapsedTime()
    if (audioBuffer.isPlaying){
        averageFrequency = analyser1.getAverageFrequency()

        gsap.to(sphereShaderMaterial.uniforms.uFrequency, {
            duration: 0.5, value: averageFrequency
        })
    }
    renderer.render(scene, camera)
}

animate()