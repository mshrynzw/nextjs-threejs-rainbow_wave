import { NextPage } from "next"
import { useEffect, useRef } from "react"
import * as THREE from "three"
import * as dat from "lil-gui"

const Smoke : NextPage = () => {
  const canvasRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const canvas = document.getElementById("canvas") as HTMLElement
    if (!canvas) return
    canvasRef.current = canvas

    const gui = new dat.GUI({ width : 300 })
    gui.show(true)

    const scene = new THREE.Scene()

    const sizes = {
      width : innerWidth,
      height : innerHeight
    }

    const camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      1,
      1000
    )
    camera.position.z = 1000
    scene.add(camera)

    const renderer = new THREE.WebGLRenderer({
      canvas : canvas
    })
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(window.devicePixelRatio)

    const geometry = new THREE.BoxGeometry(200, 200, 200)
    const material = new THREE.MeshLambertMaterial({ color : 0xaa6666, wireframe : false })
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    const textGeo = new THREE.PlaneGeometry(300, 300)
    const textureLoader = new THREE.TextureLoader()
    const textTexture = textureLoader.load("/images/smoke.png")
    const textMaterial = new THREE.MeshLambertMaterial({
      color : 0x00ffff,
      opacity : 1,
      map : textTexture,
      transparent : true,
      blending : THREE.AdditiveBlending
    })
    const text = new THREE.Mesh(textGeo, textMaterial)
    text.position.z = 800
    scene.add(text)

    const smokeTexture = textureLoader.load("/images/Smoke-Element.png")
    const smokeMaterial = new THREE.MeshLambertMaterial({
      color : 0x00dddd,
      map : smokeTexture,
      transparent : true
    })
    const smokeGeo = new THREE.PlaneGeometry(300, 300)
    const smokeParticles = []
    for (let i = 0; i < 150; i++) {
      let particle = new THREE.Mesh(smokeGeo, smokeMaterial)
      particle.position.set(Math.random() * 500 - 250, Math.random() * 500 - 250, Math.random() * 1000 - 100)
      particle.rotation.z = Math.random() * 360
      scene.add(particle)
      smokeParticles.push(particle)
    }

    const light = new THREE.DirectionalLight(0xffffff, 0.5)
    light.position.set(-1, 0, 1)
    scene.add(light)

    const clock = new THREE.Clock()
    const evolveSmoke = () => {
      const elapsedTime = clock.getElapsedTime()
      let sp = smokeParticles.length
      while (sp--) {
        smokeParticles[sp].rotation.z += (elapsedTime * 0.2)
      }
    }

    let cubeSineDriver = 0
    const animate = () => {
      mesh.rotation.x += 0.005
      mesh.rotation.y += 0.01
      cubeSineDriver += .01
      mesh.position.z = 100 + (Math.sin(cubeSineDriver) * 500)
      renderer.render(scene, camera)
    }

    const render = () => {
      evolveSmoke()
      animate()
      window.requestAnimationFrame(render)
      renderer.render(scene, camera)
    }
    render()

    window.addEventListener("resize", () => {
      sizes.width = window.innerWidth
      sizes.height = window.innerHeight

      camera.aspect = sizes.width / sizes.height
      camera.updateProjectionMatrix()

      renderer.setSize(sizes.width, sizes.height)
      renderer.setPixelRatio(window.devicePixelRatio)
    })
  }, [])

  return (
    <>
      <canvas id="canvas"></canvas>
    </>
  )
}

export default Smoke