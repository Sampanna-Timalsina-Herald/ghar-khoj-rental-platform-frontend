import React, { useRef, useState, useEffect } from 'react'
import { Eraser, Check } from 'lucide-react'

const SignaturePad = ({ onSignatureChange, disabled = false, existingSignature = null }) => {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    
    // Set canvas size
    canvas.width = 600
    canvas.height = 200
    
    // Set white background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Set drawing style
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Load existing signature if provided
    if (existingSignature) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        setHasSignature(true)
      }
      img.src = existingSignature
    }
  }, [existingSignature])

  const startDrawing = (e) => {
    if (disabled) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top
    
    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
  }

  const draw = (e) => {
    if (!isDrawing || disabled) return
    
    e.preventDefault() // Prevent scrolling on touch devices
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top
    
    ctx.lineTo(x, y)
    ctx.stroke()
    setHasSignature(true)
  }

  const stopDrawing = () => {
    if (!isDrawing) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.closePath()
    setIsDrawing(false)
    
    // Export signature with background removed
    if (hasSignature) {
      const signatureData = getSignatureWithoutBackground()
      onSignatureChange(signatureData)
    }
  }

  const clearSignature = () => {
    if (disabled) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    // Clear and reset to white background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    setHasSignature(false)
    onSignatureChange(null)
  }

  const getSignatureWithoutBackground = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    
    // Remove white background (make transparent)
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      
      // If pixel is white or very light (background)
      if (r > 240 && g > 240 && b > 240) {
        data[i + 3] = 0 // Set alpha to 0 (transparent)
      }
    }
    
    // Create temporary canvas for transparent version
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = canvas.width
    tempCanvas.height = canvas.height
    const tempCtx = tempCanvas.getContext('2d')
    
    // Put processed image data
    tempCtx.putImageData(imageData, 0, 0)
    
    // Return as base64 PNG with transparency
    return tempCanvas.toDataURL('image/png')
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className={`border-2 border-dashed border-gray-300 rounded-lg w-full ${
            disabled ? 'cursor-not-allowed opacity-60' : 'cursor-crosshair'
          }`}
          style={{ 
            touchAction: 'none',
            maxWidth: '600px',
            height: '200px'
          }}
        />
        
        {!hasSignature && !disabled && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-gray-400 text-sm">Draw your signature here</p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={clearSignature}
          disabled={disabled || !hasSignature}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Eraser size={16} />
          Clear
        </button>
        
        {hasSignature && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Check size={16} />
            <span>Signature ready</span>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500">
        {disabled 
          ? 'Signature already submitted and locked'
          : 'Draw your signature using mouse or touch. White background will be automatically removed.'}
      </p>
    </div>
  )
}

export default SignaturePad
