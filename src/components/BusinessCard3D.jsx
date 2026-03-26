import React, { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'

const LOGO_URL = 'https://images.squarespace-cdn.com/content/v1/613a5c22540e534e72bda9a1/7fd6ea37-8f94-4626-ac71-1fe5e214471e/peak-aquatic-primary-logo-black.png'
const FONT_URL = 'https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,700;1,400;1,500&display=swap'

function makeCardCanvas(side, logoImg, W = 1080, H = 640) {
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')

  // ── Crisp white background ───────────────────────────────────
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, H)

  // Very subtle paper grain (keeps it from looking flat/digital)
  for (let i = 0; i < 8000; i++) {
    ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.008})`
    ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1)
  }

  // ── Deboss on white: dark shadow above, white catch below ────
  function deboss(text, x, y, font, align = 'left', depth = 1.1) {
    ctx.save()
    ctx.font = font
    ctx.textAlign = align
    ctx.fillStyle = `rgba(0,0,0,${depth * 0.22})`
    ctx.fillText(text, x, y - depth * 0.7)
    ctx.fillStyle = `rgba(255,255,255,${depth * 0.5})`
    ctx.fillText(text, x, y + depth)
    ctx.fillStyle = '#111111'
    ctx.fillText(text, x, y)
    ctx.restore()
  }

  // Logo — crop bottom text, keep symbol only (top 62% of image)
  const drawLogo = (cx, cy, maxW, maxH, alpha = 1.0) => {
    if (!logoImg) return
    const cropFrac = 0.62   // show only top 62% — symbol, hide "PEAK AQUATIC" text
    const sw = logoImg.naturalWidth
    const sh = logoImg.naturalHeight * cropFrac
    const ratio = sw / sh
    let w = maxW, h = maxW / ratio
    if (h > maxH) { h = maxH; w = maxH * ratio }
    ctx.save()
    ctx.globalCompositeOperation = 'multiply'
    ctx.globalAlpha = alpha
    ctx.drawImage(logoImg, 0, 0, sw, sh, cx - w / 2, cy - h / 2, w, h)
    ctx.restore()
  }

  const G = '"EB Garamond", "Garamond", "Times New Roman", serif'
  const pad = 64

  if (side === 'front') {
    const topY = 118  // baseline for top row

    // ── Top-left: phone ──────────────────────────────────────
    deboss('201 359 5688', pad, topY, `400 22px ${G}`, 'left', 0.9)

    // ── Top-right: logo symbol + company name on same line ───
    const compFont = `500 28px ${G}`
    ctx.font = compFont
    const compW = ctx.measureText('PEAK AQUATIC SPORTS').width

    // Measure logo symbol width given fixed height
    const symH = 40
    const symRatio = logoImg ? (logoImg.naturalWidth / (logoImg.naturalHeight * 0.62)) : 1
    const symW = symH * symRatio
    const symGap = 14

    // Right-align the [symbol + gap + text] block
    const textX = W - pad          // text right edge
    const symCX  = textX - compW - symGap - symW / 2
    const symCY  = topY - symH / 2 + 4

    drawLogo(symCX, symCY, symW, symH)
    deboss('PEAK AQUATIC SPORTS', textX, topY, compFont, 'right')
    deboss('Elite Aquatic Coaching', textX, topY + 26,
      `italic 400 19px ${G}`, 'right', 0.8)

    // ── Center: mixed-weight name ────────────────────────────
    const nameY  = H / 2 + 26
    const fFirst = `400 54px ${G}`
    const fLast  = `700 54px ${G}`
    ctx.font = fFirst; const w1 = ctx.measureText('PHILIP  ').width
    ctx.font = fLast;  const w2 = ctx.measureText('KANG').width
    const nameStartX = W / 2 - (w1 + w2) / 2
    deboss('PHILIP  ', nameStartX,       nameY, fFirst, 'left', 1.2)
    deboss('KANG',     nameStartX + w1,  nameY, fLast,  'left', 1.8)

    // Title
    deboss('Head Coach  ·  Founder', W / 2, nameY + 46,
      `400 22px ${G}`, 'center', 0.9)

    // ── Bottom: address line ─────────────────────────────────
    deboss('150 TRIANGLE PLAZA, RAMSEY NJ 07446  ·  peakaquaticsports@gmail.com  ·  @philkangg',
      W / 2, H - pad + 8, `400 14px ${G}`, 'center', 0.7)

  } else {
    // Logo — top center, large, aspect-correct
    drawLogo(W / 2, pad + 48, 160, 180)

    // Hairline below logo
    ctx.save()
    ctx.strokeStyle = 'rgba(0,0,0,0.14)'
    ctx.lineWidth = 0.8
    ctx.beginPath()
    ctx.moveTo(W * 0.28, pad + 112); ctx.lineTo(W * 0.72, pad + 112)
    ctx.stroke()
    ctx.restore()

    // Contact details stacked
    const items = [
      { label: 'PHONE',     value: '201  ·  359  ·  5688' },
      { label: 'EMAIL',     value: 'peakaquaticsports@gmail.com' },
      { label: 'INSTAGRAM', value: '@philkangg' },
      { label: 'LOCATION',  value: 'Ramsey, NJ  07446' },
      { label: 'WEBSITE',   value: 'peakaquaticsports.com' },
    ]

    const rowH = 52
    let cy = H / 2 - (items.length * rowH) / 2 + 30

    items.forEach(({ label, value }) => {
      deboss(label, W / 2, cy, `400 11px ${G}`, 'center', 0.7)
      deboss(value, W / 2, cy + 26, `400 21px ${G}`, 'center', 1.0)
      cy += rowH
    })
  }

  return canvas
}

export default function BusinessCard3D() {
  const mountRef = useRef(null)
  const stateRef = useRef({})
  const [hint, setHint] = useState('HOVER TO TILT  ·  CLICK TO FLIP')

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    let destroyed = false
    const cleanups = []

    // Inject EB Garamond if not already loaded
    if (!document.querySelector('#eb-garamond')) {
      const link = document.createElement('link')
      link.id = 'eb-garamond'
      link.rel = 'stylesheet'
      link.href = FONT_URL
      document.head.appendChild(link)
    }

    const setupScene = (logoImg) => {
      if (destroyed) return

      const W = el.clientWidth || 520
      const H = 320

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(W, H)
      renderer.setClearColor(0x000000, 0)
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.0
      el.appendChild(renderer.domElement)

      const scene  = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 100)
      camera.position.set(0, 0, 4.4)

      // Lighting for white coated card — dramatic but clean
      scene.add(new THREE.AmbientLight(0xffffff, 0.8))
      const key = new THREE.DirectionalLight(0xffffff, 1.8)
      key.position.set(3, 5, 4)
      scene.add(key)
      const fill = new THREE.DirectionalLight(0xe8f4ff, 0.4)
      fill.position.set(-4, -1, 3)
      scene.add(fill)
      const spot = new THREE.PointLight(0xffffff, 1.0, 12)
      spot.position.set(0, 1.5, 3.5)
      scene.add(spot)

      // Satin-coated white card material
      const cardMat = (tex) => new THREE.MeshPhysicalMaterial({
        map: tex,
        roughness: 0.55,
        metalness: 0.0,
        clearcoat: 0.35,
        clearcoatRoughness: 0.35,
      })
      const edgeMat = new THREE.MeshStandardMaterial({
        color: 0xfafafa,
        roughness: 0.7,
        metalness: 0,
      })

      const frontTex = new THREE.CanvasTexture(makeCardCanvas('front', logoImg))
      const backTex  = new THREE.CanvasTexture(makeCardCanvas('back',  logoImg))

      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(3.37, 2.0, 0.045),
        [edgeMat, edgeMat, edgeMat, edgeMat, cardMat(frontTex), cardMat(backTex)]
      )
      scene.add(mesh)

      const s = stateRef.current
      s.tiltX = s.tiltY = s.targetTiltX = s.targetTiltY = s.flipAngle = s.targetFlip = 0
      s.flipped = false

      const onMouseMove = (e) => {
        const r  = el.getBoundingClientRect()
        const nx = ((e.clientX - r.left) / r.width  - 0.5) * 2
        const ny = ((e.clientY - r.top)  / r.height - 0.5) * 2
        s.targetTiltY =  nx * 0.42; s.targetTiltX = -ny * 0.30
        spot.position.set(nx * 3, -ny * 2, 3.5)
      }
      const onMouseLeave = () => { s.targetTiltX = 0; s.targetTiltY = 0 }
      const onFlip = () => {
        s.flipped = !s.flipped
        s.targetFlip = s.flipped ? Math.PI : 0
        setHint(s.flipped ? 'TAP TO FLIP BACK' : 'HOVER TO TILT  ·  CLICK TO FLIP')
      }
      const onTouchMove = (e) => {
        e.preventDefault()
        const touch = e.touches[0]
        const r  = el.getBoundingClientRect()
        const nx = ((touch.clientX - r.left) / r.width  - 0.5) * 2
        const ny = ((touch.clientY - r.top)  / r.height - 0.5) * 2
        s.targetTiltY =  nx * 0.35; s.targetTiltX = -ny * 0.22
        spot.position.set(nx * 3, -ny * 2, 3.5)
      }
      const onTouchEnd = () => { s.targetTiltX = 0; s.targetTiltY = 0 }

      el.addEventListener('mousemove',  onMouseMove)
      el.addEventListener('mouseleave', onMouseLeave)
      el.addEventListener('touchmove',  onTouchMove, { passive: false })
      el.addEventListener('touchend',   onTouchEnd)
      renderer.domElement.addEventListener('click',      onFlip)
      renderer.domElement.addEventListener('touchstart', onFlip, { passive: true })

      let rafId
      const animate = () => {
        rafId = requestAnimationFrame(animate)
        s.tiltX    += (s.targetTiltX - s.tiltX)     * 0.07
        s.tiltY    += (s.targetTiltY - s.tiltY)     * 0.07
        s.flipAngle += (s.targetFlip - s.flipAngle) * 0.09
        mesh.rotation.x = s.tiltX
        mesh.rotation.y = s.tiltY + s.flipAngle
        renderer.render(scene, camera)
      }
      animate()

      const onResize = () => {
        const w = el.clientWidth || 520
        camera.aspect = w / H
        camera.updateProjectionMatrix()
        renderer.setSize(w, H)
      }
      window.addEventListener('resize', onResize)

      cleanups.push(() => {
        cancelAnimationFrame(rafId)
        el.removeEventListener('mousemove',  onMouseMove)
        el.removeEventListener('mouseleave', onMouseLeave)
        el.removeEventListener('touchmove',  onTouchMove)
        el.removeEventListener('touchend',   onTouchEnd)
        renderer.domElement.removeEventListener('click',      onFlip)
        renderer.domElement.removeEventListener('touchstart', onFlip)
        window.removeEventListener('resize', onResize)
        renderer.dispose()
        if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
      })
    }

    // Load font first, then logo, then render
    Promise.all([
      document.fonts.load(`italic 400 60px "EB Garamond"`).catch(() => {}),
      document.fonts.load(`700 60px "EB Garamond"`).catch(() => {}),
      new Promise(resolve => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload  = () => resolve(img)
        img.onerror = () => resolve(null)
        img.src = LOGO_URL
      }),
    ]).then(([,, logoImg]) => setupScene(logoImg))

    return () => {
      destroyed = true
      cleanups.forEach(fn => fn())
    }
  }, [])

  return (
    <div style={{ width: '100%', maxWidth: 520, margin: '0 auto' }}>
      <div ref={mountRef} style={{ width: '100%', height: 320, cursor: 'pointer' }} />
      <p style={{
        textAlign: 'center',
        fontFamily: '"EB Garamond", Georgia, serif',
        fontSize: '0.65rem',
        color: 'rgba(255,255,255,0.15)',
        letterSpacing: '0.18em',
        marginTop: '0.75rem',
        textTransform: 'uppercase',
        userSelect: 'none',
      }}>
        {hint}
      </p>
    </div>
  )
}
