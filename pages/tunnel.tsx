import { NextPage } from "next"
import { useEffect, useRef } from "react"
import * as THREE from "three"
import * as dat from "lil-gui"
import { Vector3 } from "three"
import { createNoise2D } from "simplex-noise" // Ensure this is the default import
import Perlin from "perlin.js"

const Tunnel : NextPage = () => {
  const canvasRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const canvas = document.getElementById("canvas") as HTMLElement
    if (!canvas) return
    canvasRef.current = canvas

    const gui = new dat.GUI({ width : 300 })
    gui.show(true)

    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x000000, 30, 150)
    const sizes = {
      width : innerWidth,
      height : innerHeight
    }
    const camera = new THREE.PerspectiveCamera(
      45,
      sizes.width / sizes.height,
      0.1,
      150
    )
    camera.position.y = 1
    // camera.position.z = -5
    const renderer = new THREE.WebGLRenderer({
      canvas : canvas
    })
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(window.devicePixelRatio)

    // TODO: Edit
    let geometry, material
    // ボックスジオメトリー
    geometry = new THREE.BoxGeometry(1, 1, 1)
    material = new THREE.MeshLambertMaterial({
      color : "#2497f0"
    })
    const box = new THREE.Mesh(geometry, material)
    box.position.z = -5
    box.rotation.set(10, 10, 10)
    scene.add(box)
    gui.addColor(material, "color")

    let pointsArray = [
      [68.5, 185.5],
      [1, 262.5],
      [270.9, 281.9],
      [345.5, 212.8],
      [178, 155.7],
      [240.3, 72.3],
      [153.4, 0.6],
      [52.6, 53.3],
      [68.5, 185.5]
    ]

    let points : Vector3[] = []
    for (let i = 0; i < pointsArray.length; i++) {
      const x = pointsArray[i][0]
      const y = Math.random() * 100
      const z = pointsArray[i][1]
      points.push(new THREE.Vector3(x, y, z))
    }
    const path = new THREE.CatmullRomCurve3(points)
    path.closed = true

    const tubeDetail = 1000
    const circlesDetail = 8
    const radius = 8
    const frames = path.computeFrenetFrames(tubeDetail, true)

    geometry = new THREE.BufferGeometry()

    const color = new THREE.Color(0x000000)

    // Initialize noise
    // const noise = createNoise2D() // This should work if the import is correct
    // noise.seed(Math.random());

    for (let i = 0; i < tubeDetail; i++) {
      // Get the normal values for each circle
      const normal = frames.normals[i]
      // Get the binormal values
      const binormal = frames.binormals[i]

      // Calculate the index of the circle (from 0 to 1)
      const index = i / tubeDetail
      // Get the coordinates of the point in the center of the circle
      const p = path.getPointAt(index)

      // Loop for the amount of particles we want along each circle
      const circle = new THREE.BufferGeometry()
      for (let j = 0; j < circlesDetail; j++) {
        // Clone the position of the point in the center
        const position = p.clone()
        // Calculate the angle for each particle along the circle (from 0 to Pi*2)
        let angle = (j / circlesDetail) * Math.PI * 2
        angle += Perlin.perlin2(index * 10, 0)
        // Calculate the sine of the angle
        const sin = Math.sin(angle)
        // Calculate the cosine from the angle
        const cos = -Math.cos(angle)

        // Calculate the normal of each point based on its angle
        const normalPoint = new THREE.Vector3(0, 0, 0)
        normalPoint.x = (cos * normal.x + sin * binormal.x)
        normalPoint.y = (cos * normal.y + sin * binormal.y)
        normalPoint.z = (cos * normal.z + sin * binormal.z)
        // Multiple the normal by the radius
        normalPoint.multiplyScalar(radius)

        // We add the normal values for each point
        position.add(normalPoint)
        // Update to use BufferAttribute instead of vertices
        circle.setAttribute("position", new THREE.Float32BufferAttribute(position.toArray(), 3))
      }
      // Remove the line that pushes the first vertex again
      // circle.vertices.push(circle.vertices[0]);
      material = new THREE.LineBasicMaterial({
        color : new THREE.Color("hsl(" + (Perlin.perlin2(index * 10, 0) * 60 + 300) + ",50%,50%)")
      })

      const line = new THREE.Line(circle, material)
      scene.add(line)
    }

    // TODO: Edit
    // ライト
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
    scene.add(ambientLight)
    const pointLight = new THREE.PointLight(0xffffff, 0.2)
    pointLight.position.set(1, 2, 3)
    scene.add(pointLight)

    // アニメーション
    const clock = new THREE.Clock()
    let percentage = 0
    const render = () => {
      const elapsedTime = clock.getElapsedTime()
      box.rotation.x = elapsedTime
      box.rotation.y = elapsedTime

      const p1 = path.getPointAt(percentage % 1)
      const p2 = path.getPointAt((percentage + 0.01) % 1)
      camera.position.set(p1.x, p1.y, p1.z)
      camera.lookAt(p2)

      window.requestAnimationFrame(render)
      renderer.render(scene, camera)
    }
    render()

    // ブラウザのリサイズ操作
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

export default Tunnel