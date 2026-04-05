"use client";
import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import "./ImageCropper.css";

function getCroppedImg(imageSrc, pixelCrop) {
  return new Promise((resolve) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
      canvas.toBlob((blob) => {
        resolve({ blob, url: URL.createObjectURL(blob) });
      }, "image/jpeg", 0.92);
    };
  });
}

export default function ImageCropper({ imageSrc, onDone, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_, pixels) => { setCroppedAreaPixels(pixels); }, []);

  async function handleConfirm() {
    const result = await getCroppedImg(imageSrc, croppedAreaPixels);
    onDone(result);
  }

  return (
    <div className="cropper-overlay">
      <div className="cropper-modal">
        <div className="cropper-header">
          <span className="cropper-title">Uredi sliku</span>
          <button className="cropper-close" onClick={onCancel}>✕</button>
        </div>
        <div className="cropper-canvas">
          <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={4/3} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} showGrid />
        </div>
        <div className="cropper-footer">
          <div className="cropper-zoom">
            <span className="cropper-zoom-label">Zum</span>
            <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="cropper-slider" />
            <span className="cropper-zoom-val">{zoom.toFixed(1)}×</span>
          </div>
          <div className="cropper-actions">
            <button className="cropper-btn-cancel" onClick={onCancel}>Odustani</button>
            <button className="cropper-btn-confirm" onClick={handleConfirm}>Primijeni</button>
          </div>
        </div>
      </div>
    </div>
  );
}
