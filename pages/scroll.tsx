import { NextPage } from "next"
import { useEffect, useRef } from "react"
import * as THREE from "three"
import * as dat from "lil-gui"

const Home : NextPage = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const scrollRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gui = new dat.GUI({ width : 300 })
    gui.show(true)

    const scene = new THREE.Scene()
    const textureLoader = new THREE.TextureLoader()
    scene.background = textureLoader.load("./images/background.jpg")

    const sizes = {
      width : innerWidth,
      height : innerHeight
    }
    const camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      0.001,
      1000
    )
    const renderer = new THREE.WebGLRenderer({
      canvas : canvas
    })
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(window.devicePixelRatio)

    // ボックスジオメトリー
    const boxGeometry = new THREE.BoxGeometry(5, 5, 5, 10)
    const boxMaterial = new THREE.MeshStandardMaterial({
      roughness : 0,
      metalness : 0,
      color : "#28061a"
    })
    const box = new THREE.Mesh(boxGeometry, boxMaterial)
    box.position.set(0, 0.5, -15)
    box.rotation.set(1, 1, 0)

    const torusGeometry = new THREE.TorusGeometry(8, 2, 16, 100)
    const torusMaterial = new THREE.MeshStandardMaterial({
      roughness : 0,
      metalness : 0,
      color : "#2a37c6"
    })
    const torus = new THREE.Mesh(torusGeometry, torusMaterial)
    torus.position.set(0, 1, 10)

    scene.add(box, torus)
    gui.addColor(boxMaterial, "color")

    // 線形補間
    function lerp(x, y, a) {
      return (1 - a) * x + a * y
    }

    function scalePercent(start, end) {
      return (scrollRef.current - start) / (end - start)
    }

    // スクロールアニメーション
    const animationScripts = []
    animationScripts.push({
      start : 0,
      end : 40,
      function() {
        camera.lookAt(box.position)
        camera.position.set(0, 1, 10)
        box.position.z = lerp(-15, 2, scalePercent(0, 40))
        torus.position.z = lerp(10, -20, scalePercent(0, 40))
      }
    })

    animationScripts.push({
      start : 40,
      end : 60,
      function() {
        camera.lookAt(box.position)
        camera.position.set(0, 1, 10)
        box.rotation.z = lerp(1, Math.PI, scalePercent(40, 60))
      }
    })

    animationScripts.push({
      start : 60,
      end : 80,
      function() {
        camera.lookAt(box.position)
        camera.position.x = lerp(0, -25, scalePercent(60, 80))
        camera.position.y = lerp(1, 25, scalePercent(60, 80))
        camera.position.z = lerp(10, 25, scalePercent(60, 80))
      }
    })

    animationScripts.push({
      start : 80,
      end : 100,
      function() {
        camera.lookAt(box.position)
        box.rotation.x += 0.02
        box.rotation.y += 0.02
      }
    })

    // アニメーション開始
    function playScrollAnimation() {
      animationScripts.forEach((animation) => {
        if (
          scrollRef.current >= animation.start &&
          scrollRef.current <= animation.end
        ) {
          animation.function()
        }
      })
    }


    const handleScroll = () => {
      scrollRef.current = (document.documentElement.scrollTop /
          (document.documentElement.scrollHeight -
            document.documentElement.clientHeight)) *
        100
    }
    document.addEventListener("scroll", handleScroll)

    // アニメーション
    const render = () => {
      window.requestAnimationFrame(render)
      playScrollAnimation()
      renderer.render(scene, camera)
    }
    render()

    // ライト
    const ambientLight = new THREE.AmbientLight(0xffffff, 1)
    scene.add(ambientLight)
    const pointLight = new THREE.PointLight(0xffffff, 2000)
    pointLight.position.set(1, 1, 1)
    scene.add(pointLight)
    const pointLight2 = new THREE.PointLight(0xffffff, 2000)
    pointLight2.position.set(-10, -10, -10)
    scene.add(pointLight2)
    const pointLight3 = new THREE.PointLight(0xffffff, 25000)
    pointLight3.position.set(0, 10, 10)
    scene.add(pointLight3)

    // ブラウザのリサイズ操作
    const handleResize = () => {
      sizes.width = window.innerWidth
      sizes.height = window.innerHeight

      camera.aspect = sizes.width / sizes.height
      camera.updateProjectionMatrix()

      renderer.setSize(sizes.width, sizes.height)
      renderer.setPixelRatio(window.devicePixelRatio)
    }
    window.addEventListener("resize", handleResize)

    return () => {
      document.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <>
      <div> {/* スクロール可能なコンテンツを追加 */}
        <canvas ref={canvasRef}></canvas>
        <main>
          <h1>PortFolio</h1>
          <section>
            <h2>The best skills to master.</h2>
          </section>
          <section>
            <h2>My Project</h2>
            <p>This is a work I made.</p>
          </section>
          <section>
            <h2>My Skills</h2>
            <p>HTML/CSS/JavaScript</p>
          </section>
          <section>
            <h2>Engineer</h2>
            <p>Curiosity to continue learning.</p>
          </section>
          <section>
            <h2>Contact</h2>
            <p>We look forward to hearing from you!!</p>
          </section>
        </main>
      </div>
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@100;300;500;700&display=swap");

        * {
          margin: 0;
          padding: 0;
          font-family: "Roboto Slab", serif;
        }

        body {
          color: white;
          overflow-x: hidden;
        }

        canvas {
          position: fixed;
          top: 0;
          left: 0;
        }

        main {
          position: absolute;
          width: 100vw;
          height: 200vh;
          z-index: 100;
          justify-content: center;
          text-align: center;
          font-size: 4rem;
          margin-top: 70px;
        }

        h1, h2 {
          color: white;
          font-size: larger;
        }
        
        section {
          color: white;
          min-height: 100vh;
          padding: 20px;
          font-size: 3.5rem;
        }
      `}</style>
    </>
  )
}

export default Home