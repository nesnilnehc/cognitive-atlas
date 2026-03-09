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
  toWorldX,
  toWorldY,
  toWorldZ,
  tight,
  exportCropMargin
}) {
  const xBand = computeGridBands([1, 2, 3, 4, 5].map((x) => toWorldX(x)), scale.x);
  const yBand = computeGridBands([1, 2, 3, 4, 5].map((y) => toWorldY(y)), scale.y);
  const zBand = computeGridBands([1, 2, 3, 4, 5].map((z) => toWorldZ(z)), scale.z);
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
  toWorldX,
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
          toWorldX,
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
      anchor.download = fileName || `cognitive-atlas-${new Date().toISOString().slice(0, 10)}.png`;
      anchor.click();
    });
  }

  async function getExportPosterDataUrl(options = {}) {
    const title = options.title ?? "COGNITIVE ATLAS";
    const subtitle = options.subtitle ?? "Typed cognitive knowledge graph";
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
    ctx.fillText(`ID: ${dateStr} // COGNITIVE_ATLAS_RENDER`, width - padding - 10, height - padding - 10);

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
      anchor.download = `cognitive-atlas-share-${new Date().toISOString().slice(0, 10)}.png`;
      anchor.click();
    });
  }

  /** 模型名 → 插图路径（相对项目根，用于竖卡） */
  const ILLUSTRATION_PATHS = {
    MECE: "docs/assets/illustrations/mece.png"
  };

  /** 模型名 → 竖卡补充信息：参考来源、应用场景示例 */
  const DOUYIN_CARD_EXTRA = {
    MECE: {
      source: "Barbara Minto《金字塔原理》；McKinsey 结构化思维",
      examples: "市场细分、问题拆解、报告结构、会议议题分类"
    }
  };

  function loadImage(path) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${path}`));
      img.src = new URL(path, window.location.href).href;
    });
  }

  /**
   * 抖音竖卡：9:16 单模型卡
   * 设计原则：第一次输出核心价值，引导指向更多价值
   * 信息层级：名称 → [插图] → 概念 → 应用场景 → [分隔] → 获取更多
   */
  async function getDouyinCardDataUrl(model) {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
    const illustrationPath = ILLUSTRATION_PATHS[model.name];
    let illustrationImg = null;
    if (illustrationPath) {
      try {
        illustrationImg = await loadImage(illustrationPath);
      } catch {
        // 插图加载失败时继续渲染，不显示插图
      }
    }

    const width = 1080;
    const height = 1920;
    const padding = 56;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#0d1520");
    gradient.addColorStop(0.5, "#0a0f18");
    gradient.addColorStop(1, "#05080c");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const maxW = width - padding * 2;
    const defText = (model.descriptionEn || model.knowledgeObject?.summary || model.aliasZh || model.name) || "—";
    const whenText = (model.knowledgeObject?.whenToUse || model.purpose || "").trim();
    const showWhen = whenText && whenText !== defText;
    const categoryLabels = { Expression: "表达", Structure: "结构", Diagnosis: "诊断", Strategy: "战略", Meta: "元认知" };
    const scopeText = showWhen ? whenText : (model.category && categoryLabels[model.category]) ? `适用：${categoryLabels[model.category]}领域` : null;
    const showScope = !!scopeText;

    const defFont = "36px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', 'PingFang SC', sans-serif";

    ctx.font = "bold 52px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', 'PingFang SC', sans-serif";
    const nameH = measureWrappedHeight(ctx, model.name, maxW, 62);
    ctx.font = "30px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', 'PingFang SC', sans-serif";
    const aliasH = measureWrappedHeight(ctx, model.aliasZh || "", maxW, 40);
    ctx.font = defFont;
    const defH = measureWrappedHeight(ctx, defText, maxW, 44);
    ctx.font = "30px -apple-system, BlinkMacSystemFont, sans-serif";
    const scopeH = showScope ? 36 + measureWrappedHeight(ctx, scopeText, maxW, 38) + 28 : 0;
    const extra = DOUYIN_CARD_EXTRA[model.name];
    const sourceText = extra?.source || null;
    const examplesText = extra?.examples || null;
    ctx.font = "24px -apple-system, BlinkMacSystemFont, sans-serif";
    const sourceH = sourceText ? 30 + measureWrappedHeight(ctx, sourceText, maxW, 30) + 16 : 0;
    const examplesH = examplesText ? 30 + measureWrappedHeight(ctx, examplesText, maxW, 30) + 16 : 0;
    const extraH = sourceH + examplesH;
    const ctaH = 80;
    const illustrationH = illustrationImg ? 240 + 24 : 0; // 插图高 240px + 下方间距
    const contentH = 72 + nameH + 24 + aliasH + 48 + illustrationH + 36 + defH + 24 + scopeH + extraH + 40 + ctaH;
    const blockTop = Math.max(padding, (height - contentH) / 2);

    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 52px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', 'PingFang SC', sans-serif";
    wrapText(ctx, model.name, width / 2, blockTop + 72, maxW, 62);

    ctx.fillStyle = "rgba(170, 186, 204, 0.95)";
    ctx.font = "30px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', 'PingFang SC', sans-serif";
    wrapText(ctx, model.aliasZh || "", width / 2, blockTop + 72 + nameH + 24, maxW, 40);

    if (illustrationImg) {
      const illH = 240;
      const illW = Math.min(maxW, illustrationImg.width * (illH / illustrationImg.height));
      const illX = (width - illW) / 2;
      const illY = blockTop + 72 + nameH + 24 + aliasH + 48;
      ctx.drawImage(illustrationImg, illX, illY, illW, illH);
    }

    let y = blockTop + 72 + nameH + 24 + aliasH + 48 + illustrationH;
    ctx.fillStyle = "rgba(170, 186, 204, 0.85)";
    ctx.font = "26px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif";
    ctx.fillText("概念", width / 2, y);
    y += 36;
    ctx.fillStyle = "rgba(232, 238, 244, 0.95)";
    ctx.font = defFont;
    wrapTextByWords(ctx, defText, width / 2, y, maxW, 44);
    y += defH + 24;

    if (showScope) {
      ctx.fillStyle = "rgba(170, 186, 204, 0.85)";
      ctx.font = "26px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif";
      ctx.fillText(showWhen ? "应用场景" : "适用领域", width / 2, y);
      y += 36;
      ctx.fillStyle = "rgba(200, 210, 230, 0.9)";
      ctx.font = "30px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', 'PingFang SC', sans-serif";
      wrapTextByWords(ctx, scopeText, width / 2, y, maxW, 38);
      y += measureWrappedHeight(ctx, scopeText, maxW, 38) + 28;
    }

    if (sourceText || examplesText) {
      if (sourceText) {
        ctx.fillStyle = "rgba(150, 165, 190, 0.75)";
        ctx.font = "24px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif";
        ctx.fillText("参考", width / 2, y);
        y += 30;
        ctx.fillStyle = "rgba(170, 186, 204, 0.85)";
        wrapTextByWords(ctx, sourceText, width / 2, y, maxW, 30);
        y += measureWrappedHeight(ctx, sourceText, maxW, 30) + 16;
      }
      if (examplesText) {
        ctx.fillStyle = "rgba(150, 165, 190, 0.75)";
        ctx.font = "24px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif";
        ctx.fillText("示例", width / 2, y);
        y += 30;
        ctx.fillStyle = "rgba(170, 186, 204, 0.85)";
        wrapTextByWords(ctx, examplesText, width / 2, y, maxW, 30);
        y += measureWrappedHeight(ctx, examplesText, maxW, 30) + 16;
      }
      y += 8;
    }

    y += 24;
    ctx.strokeStyle = "rgba(0, 240, 255, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding + 80, y);
    ctx.lineTo(width - padding - 80, y);
    ctx.stroke();
    y += 40;

    ctx.fillStyle = "rgba(0, 240, 255, 0.7)";
    ctx.font = "26px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif";
    ctx.fillText("获取更多价值", width / 2, y);
    y += 40;
    ctx.fillStyle = "#00f0ff";
    ctx.font = "bold 30px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif";
    ctx.fillText("关联模型 · 学习路径 · 练习 → 评论置顶", width / 2, y);

    // 品牌水印（短期：文字标识；长期可替换为 Logo 图）
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "rgba(100, 130, 160, 0.55)";
    ctx.font = "20px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillText("Cognitive Atlas", width - padding, height - padding);
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    return canvas.toDataURL("image/png");
  }

  function exportDouyinCard(model, fileName) {
    getDouyinCardDataUrl(model).then((dataUrl) => {
    const anchor = document.createElement("a");
    anchor.href = dataUrl;
    anchor.download = fileName || `cognitive-atlas-douyin-${model.name}-${new Date().toISOString().slice(0, 10)}.png`;
    anchor.click();
    });
  }

  return {
    getExportDataUrl,
    exportCanvasImage,
    getExportPosterDataUrl,
    exportPosterImage,
    getDouyinCardDataUrl,
    exportDouyinCard
  };
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapTextByWords(ctx, text, centerX, y, maxWidth, lineHeight) {
  const s = String(text || "").trim();
  const tokens = s.includes(" ") ? s.split(/\s+/) : s.split("");
  const lines = [];
  let line = "";
  for (const token of tokens) {
    const sep = line ? (s.includes(" ") ? " " : "") : "";
    const test = line + sep + token;
    const m = ctx.measureText(test);
    if (m.width > maxWidth && line) {
      lines.push(line);
      line = token;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], centerX, y + i * lineHeight);
  }
}

function wrapText(ctx, text, centerX, y, maxWidth, lineHeight) {
  const chars = String(text || "").split("");
  const lines = [];
  let line = "";
  for (const ch of chars) {
    const test = line + ch;
    const m = ctx.measureText(test);
    if (m.width > maxWidth && line) {
      lines.push(line);
      line = ch;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], centerX, y + i * lineHeight);
  }
}

function measureWrappedHeight(ctx, text, maxWidth, lineHeight) {
  const words = String(text || "").split("");
  let line = "";
  let lines = 0;
  for (const ch of words) {
    const test = line + ch;
    const m = ctx.measureText(test);
    if (m.width > maxWidth && line) {
      lines++;
      line = ch;
    } else {
      line = test;
    }
  }
  if (line) lines++;
  return lines * lineHeight;
}
