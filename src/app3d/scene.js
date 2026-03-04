import * as THREE from "three";

export function createCellOffsets(total) {
  const step = total >= 10 ? 4.2 : total >= 6 ? 3.8 : 3.4;
  const coords = [0, step, -step];
  const points = [];
  for (const x of coords) {
    for (const y of coords) {
      for (const z of coords) {
        points.push(new THREE.Vector3(x, y, z));
      }
    }
  }
  points.sort((a, b) => a.lengthSq() - b.lengthSq() || a.x - b.x || a.y - b.y || a.z - b.z);
  return points;
}

export function computeGridBands(centers, step) {
  const sorted = [...centers].sort((a, b) => a - b);
  const bounds = [sorted[0] - step / 2];
  for (let i = 0; i < sorted.length - 1; i++) {
    bounds.push((sorted[i] + sorted[i + 1]) / 2);
  }
  bounds.push(sorted[sorted.length - 1] + step / 2);
  return {
    bounds,
    min: bounds[0],
    max: bounds[bounds.length - 1]
  };
}

export function makeLine(start, end, material) {
  const geometry = new THREE.BufferGeometry().setFromPoints([start.clone(), end.clone()]);
  return new THREE.Line(geometry, material);
}

export function makePolyline(points, material) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points.map((p) => p.clone()));
  return new THREE.Line(geometry, material);
}

export function clearGroup(group) {
  while (group.children.length > 0) {
    const child = group.children[group.children.length - 1];
    group.remove(child);
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach((material) => {
          if (material.map) material.map.dispose();
          material.dispose();
        });
      } else {
        if (child.material.map) child.material.map.dispose();
        child.material.dispose();
      }
    }
  }
}

export function createTextSprite(text, options = {}) {
  const {
    fontSize = 34,
    lineHeight = 36,
    paddingX = 18,
    paddingY = 10,
    background = "rgba(6, 12, 25, 0.72)",
    border = "rgba(143, 181, 255, 0.52)",
    textColor = "rgba(233, 241, 255, 0.96)",
    radius = 10,
    scaleFactor = 0.02
  } = options;

  const lines = text.split("\n");
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const font = `600 ${fontSize}px "Barlow Condensed","Noto Sans SC",sans-serif`;
  context.font = font;

  const maxWidth = Math.max(...lines.map((line) => context.measureText(line).width));
  const width = Math.ceil(maxWidth + paddingX * 2);
  const height = lines.length * lineHeight + paddingY * 2;
  canvas.width = width;
  canvas.height = height;

  context.font = font;
  context.fillStyle = background;
  context.strokeStyle = border;
  context.lineWidth = 2;
  roundRect(context, 1, 1, width - 2, height - 2, radius);
  context.fill();
  context.stroke();

  context.fillStyle = textColor;
  context.textAlign = "center";
  context.textBaseline = "middle";
  lines.forEach((line, index) => {
    context.fillText(line, width / 2, paddingY + lineHeight / 2 + index * lineHeight);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    depthTest: false
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(width * scaleFactor, height * scaleFactor, 1);
  return sprite;
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}
