import * as THREE from "three";

function projectBoxToScreenRect(box, camera, renderer, margin) {
  const corners = [
    new THREE.Vector3(box.min.x, box.min.y, box.min.z),
    new THREE.Vector3(box.max.x, box.min.y, box.min.z),
    new THREE.Vector3(box.min.x, box.max.y, box.min.z),
    new THREE.Vector3(box.max.x, box.max.y, box.min.z),
    new THREE.Vector3(box.min.x, box.min.y, box.max.z),
    new THREE.Vector3(box.max.x, box.min.y, box.max.z),
    new THREE.Vector3(box.min.x, box.max.y, box.max.z),
    new THREE.Vector3(box.max.x, box.max.y, box.max.z)
  ];

  const canvas = renderer.domElement;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const projected = new THREE.Vector3();

  for (const corner of corners) {
    projected.copy(corner).project(camera);
    const px = (projected.x * 0.5 + 0.5) * canvas.width;
    const py = (1 - (projected.y * 0.5 + 0.5)) * canvas.height;
    minX = Math.min(minX, px);
    minY = Math.min(minY, py);
    maxX = Math.max(maxX, px);
    maxY = Math.max(maxY, py);
  }

  if (!Number.isFinite(minX) || !Number.isFinite(maxX)) {
    return { x: 0, y: 0, width: canvas.width, height: canvas.height };
  }

  let x = Math.max(0, Math.floor(minX) - margin);
  let y = Math.max(0, Math.floor(minY) - margin);
  let width = Math.ceil(maxX - minX) + margin * 2;
  let height = Math.ceil(maxY - minY) + margin * 2;

  if (x + width > canvas.width) width = canvas.width - x;
  if (y + height > canvas.height) height = canvas.height - y;
  width = Math.max(1, Math.min(width, canvas.width));
  height = Math.max(1, Math.min(height, canvas.height));
  x = Math.min(x, canvas.width - width);
  y = Math.min(y, canvas.height - height);

  return { x, y, width, height };
}

function getCognitiveSpaceBoundsInPixels({
  renderer,
  camera,
  computeGridBands,
  scale,
  toWorldY,
  toWorldZ,
  tight,
  exportCropMargin
}) {
  const xBand = computeGridBands([-1, 0, 1].map((x) => x * scale.x), scale.x);
  const yBand = computeGridBands([1, 2, 3, 4].map((y) => toWorldY(y)), scale.y);
  const zBand = computeGridBands([1, 2, 3, 4].map((z) => toWorldZ(z)), scale.z);
  const padding = tight ? 2 : 14;
  const box = new THREE.Box3(
    new THREE.Vector3(xBand.min - padding, yBand.min - padding, zBand.min - padding),
    new THREE.Vector3(xBand.max + padding, yBand.max + padding, zBand.max + padding)
  );
  return projectBoxToScreenRect(box, camera, renderer, tight ? exportCropMargin : 24);
}

function scaleAxisLabelSprites(axisGroup, scale) {
  axisGroup.traverse((obj) => {
    if (obj.isSprite && obj.material?.map) {
      obj.scale.multiplyScalar(scale);
    }
  });
}

function waitForTwoFrames() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
  });
}

export function createExportService({
  renderer,
  camera,
  scene,
  axisGroup,
  computeGridBands,
  scale,
  toWorldY,
  toWorldZ,
  visualConfig
}) {
  async function getExportDataUrl(options = {}) {
    const mode = options.mode ?? "full";
    const overlayEl = document.getElementById("overlay");
    const dockEl = document.querySelector(".view-dock");
    const tooltipEl = document.getElementById("tooltip");

    const origOverlay = overlayEl?.style.visibility;
    const origDock = dockEl?.style.visibility;
    const origTooltip = tooltipEl?.style.visibility;
    const origFog = scene.fog;
    const origBackground = scene.background;
    const origClearColor = renderer.getClearColor(new THREE.Color());
    const origClearAlpha = renderer.getClearAlpha();
    const origPixelRatio = renderer.getPixelRatio();

    overlayEl && (overlayEl.style.visibility = "hidden");
    dockEl && (dockEl.style.visibility = "hidden");
    tooltipEl && (tooltipEl.style.visibility = "hidden");
    scene.fog = null;
    scene.background = new THREE.Color(0x0a1220);
    renderer.setClearColor(0x0a1220, 1);
    scaleAxisLabelSprites(axisGroup, visualConfig.exportAxisLabelScale);
    renderer.setPixelRatio(Math.max(origPixelRatio, visualConfig.exportPixelRatio ?? 2));

    try {
      await waitForTwoFrames();
      const canvas = renderer.domElement;
      let rect;

      if (options.targetBox) {
        rect = projectBoxToScreenRect(options.targetBox, camera, renderer, visualConfig.exportCropMargin);
      } else if (mode === "viewport") {
        rect = { x: 0, y: 0, width: canvas.width, height: canvas.height };
      } else {
        rect = getCognitiveSpaceBoundsInPixels({
          renderer,
          camera,
          computeGridBands,
          scale,
          toWorldY,
          toWorldZ,
          tight: true,
          exportCropMargin: visualConfig.exportCropMargin
        });
      }

      const cropCanvas = document.createElement("canvas");
      cropCanvas.width = rect.width;
      cropCanvas.height = rect.height;
      const ctx = cropCanvas.getContext("2d");
      ctx.drawImage(
        canvas,
        rect.x, rect.y, rect.width, rect.height,
        0, 0, rect.width, rect.height
      );
      return cropCanvas.toDataURL("image/png");
    } finally {
      renderer.setPixelRatio(origPixelRatio);
      scaleAxisLabelSprites(axisGroup, 1 / visualConfig.exportAxisLabelScale);
      overlayEl && (overlayEl.style.visibility = origOverlay || "");
      dockEl && (dockEl.style.visibility = origDock || "");
      tooltipEl && (tooltipEl.style.visibility = origTooltip || "");
      scene.fog = origFog;
      scene.background = origBackground;
      renderer.setClearColor(origClearColor, origClearAlpha);
    }
  }

  /**
   * @param {string} [fileName]
   * @param {{ mode?: 'full' | 'viewport' }} [options]
   */
  function exportCanvasImage(fileName, options = {}) {
    getExportDataUrl(options).then((dataUrl) => {
      const anchor = document.createElement("a");
      anchor.href = dataUrl;
      anchor.download = fileName || `modelspace-${new Date().toISOString().slice(0, 10)}.png`;
      anchor.click();
    });
  }

  async function getExportPosterDataUrl(options = {}) {
    const title = options.title ?? "MODEL SPACE";
    const subtitle = options.subtitle ?? "Cognitive Space Visualization";
    const imgDataUrl = await getExportDataUrl({ mode: "viewport", targetBox: options.targetBox });

    const width = 1200;
    const height = 630;
    const padding = 40;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    // 1. Background (Deep Dark Gradient)
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#050a14");
    gradient.addColorStop(1, "#020408");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Tech Grid (Faint)
    ctx.strokeStyle = "rgba(40, 60, 100, 0.08)";
    ctx.lineWidth = 1;
    const gridSize = 40;
    ctx.beginPath();
    for (let x = 0; x <= width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(0, width); // Fix: lineTo(width, y)
    }
    // Fix loop for Y
    ctx.stroke();
    // Redo Grid properly
    ctx.beginPath();
    for (let x = 0; x <= width; x += gridSize) {
        ctx.moveTo(x, 0); ctx.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += gridSize) {
        ctx.moveTo(0, y); ctx.lineTo(width, y);
    }
    ctx.stroke();

    // 3. Header
    ctx.shadowColor = "rgba(0, 240, 255, 0.5)";
    ctx.shadowBlur = 12;
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 52px 'Barlow Condensed', 'Noto Sans SC', sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(title.toUpperCase(), padding + 20, padding + 10);

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#8aaacc";
    ctx.font = "22px 'Barlow', 'Noto Sans SC', sans-serif";
    ctx.fillText(subtitle, padding + 24, padding + 72);

    // 4. Image
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = imgDataUrl;
    });

    const contentY = padding + 100;
    const contentH = height - contentY - padding - 30;
    const contentW = width - padding * 2;

    const scale = Math.min(contentW / img.width, contentH / img.height);
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const drawX = (width - drawW) / 2;
    const drawY = contentY + (contentH - drawH) / 2;

    // Image Frame
    ctx.strokeStyle = "rgba(0, 240, 255, 0.2)";
    ctx.lineWidth = 1;
    ctx.strokeRect(drawX - 4, drawY - 4, drawW + 8, drawH + 8);

    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    // 5. Decorative Brackets (Cyber Style)
    ctx.strokeStyle = "#00f0ff";
    ctx.lineWidth = 3;
    const bSize = 24;
    ctx.beginPath();
    // TL
    ctx.moveTo(padding, padding + bSize); ctx.lineTo(padding, padding); ctx.lineTo(padding + bSize, padding);
    // TR
    ctx.moveTo(width - padding - bSize, padding); ctx.lineTo(width - padding, padding); ctx.lineTo(width - padding, padding + bSize);
    // BL
    ctx.moveTo(padding, height - padding - bSize); ctx.lineTo(padding, height - padding); ctx.lineTo(padding + bSize, height - padding);
    // BR
    ctx.moveTo(width - padding - bSize, height - padding); ctx.lineTo(width - padding, height - padding); ctx.lineTo(width - padding, height - padding - bSize);
    ctx.stroke();

    // 6. Footer
    ctx.fillStyle = "rgba(80, 120, 180, 0.5)";
    ctx.font = "14px monospace";
    ctx.textAlign = "right";
    const dateStr = new Date().toISOString().slice(0, 10);
    ctx.fillText(`ID: ${dateStr} // MODEL_SPACE_RENDER`, width - padding - 10, height - padding - 10);

    return canvas.toDataURL("image/png");
  }

  /**
   * Export poster and trigger download.
   * @param {{ title?: string, subtitle?: string }} [options]
   */
  function exportPosterImage(options = {}) {
    getExportPosterDataUrl(options).then((dataUrl) => {
      const anchor = document.createElement("a");
      anchor.href = dataUrl;
      anchor.download = `modelspace-share-${new Date().toISOString().slice(0, 10)}.png`;
      anchor.click();
    });
  }

  return { getExportDataUrl, exportCanvasImage, getExportPosterDataUrl, exportPosterImage };
}
