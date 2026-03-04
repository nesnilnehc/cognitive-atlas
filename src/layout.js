(function () {
  const CATEGORY_STYLE = {
    Expression: {
      tags: ["表达", "沟通", "叙事"],
      tagsEn: ["Expression", "Communication", "Narrative"],
      slots: [
        { xBucket: -1, y: 1, z: 1 },
        { xBucket: 0, y: 1, z: 1 },
        { xBucket: 1, y: 1, z: 1 },
        { xBucket: 0, y: 1, z: 2 },
        { xBucket: 1, y: 1, z: 2 }
      ]
    },
    Structure: {
      tags: ["结构化", "拆解", "框架"],
      tagsEn: ["Structure", "Decomposition", "Framework"],
      slots: [
        { xBucket: -1, y: 2, z: 1 },
        { xBucket: 1, y: 2, z: 2 }
      ]
    },
    Diagnosis: {
      tags: ["诊断", "根因", "风险"],
      tagsEn: ["Diagnosis", "Root Cause", "Risk"],
      slots: [
        { xBucket: -1, y: 3, z: 1 },
        { xBucket: 0, y: 3, z: 1 },
        { xBucket: 0, y: 3, z: 2 }
      ]
    },
    Strategy: {
      tags: ["战略", "决策", "执行"],
      tagsEn: ["Strategy", "Decision", "Execution"],
      slots: [
        { xBucket: 0, y: 3, z: 2 }, { xBucket: 1, y: 3, z: 2 },
        { xBucket: 0, y: 3, z: 3 }, { xBucket: 1, y: 3, z: 3 },
        { xBucket: -1, y: 3, z: 2 }, { xBucket: -1, y: 3, z: 3 },
        { xBucket: 0, y: 4, z: 3 }, { xBucket: 1, y: 4, z: 3 }
      ]
    },
    Meta: {
      tags: ["元认知", "原则", "系统"],
      tagsEn: ["Meta-Cognition", "Principle", "Systems"],
      slots: [
        { xBucket: -1, y: 4, z: 3 }, { xBucket: 0, y: 4, z: 3 }, { xBucket: 1, y: 4, z: 3 },
        { xBucket: -1, y: 4, z: 4 }, { xBucket: 0, y: 4, z: 4 }, { xBucket: 1, y: 4, z: 4 },
        { xBucket: 0, y: 3, z: 4 }, { xBucket: 1, y: 3, z: 4 }
      ]
    }
  };

  const FALLBACK_STYLE = CATEGORY_STYLE.Structure;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function compactEnglishAnnotation(text) {
    const trimmed = (text || "").replace(/\.$/, "").trim();
    if (!trimmed) return "";
    return trimmed.length > 50 ? `${trimmed.slice(0, 47)}...` : trimmed;
  }

  function xFromBucket(bucket, stackIndex) {
    const base = bucket === -1 ? -0.76 : bucket === 1 ? 0.76 : 0;
    const pattern = [-0.16, -0.06, 0.06, 0.16, -0.22, 0.22, 0];
    const ring = Math.floor(stackIndex / pattern.length);
    const offset = pattern[stackIndex % pattern.length] * 0.58;
    const drift = ring * 0.03 * (bucket === 0 ? 1 : bucket);
    const jitter = Math.sin((stackIndex + 1) * 2.13) * 0.02;
    return Number(clamp(base + offset + drift + jitter, -0.98, 0.98).toFixed(2));
  }

  function buildModelData(rows) {
    const categoryIndex = {};
    const slotStack = {};

    return rows.map((row) => {
      const [name, aliasZh, descriptionEn, category, yOverride, zOverride] = row;
      const evaluation = window.MODEL_EVALUATION_BY_NAME?.[name]?.evaluation || null;
      const style = CATEGORY_STYLE[category] || FALLBACK_STYLE;
      const idx = categoryIndex[category] || 0;
      categoryIndex[category] = idx + 1;

      const baseSlot = style.slots[idx % style.slots.length];
      const y = Number.isFinite(yOverride) ? yOverride : baseSlot.y;
      const z = Number.isFinite(zOverride) ? zOverride : baseSlot.z;

      const slotKey = `${baseSlot.xBucket}|${y}|${z}`;
      const stackIndex = slotStack[slotKey] || 0;
      slotStack[slotKey] = stackIndex + 1;

      return {
        name,
        aliasZh,
        aliasEn: compactEnglishAnnotation(descriptionEn),
        x: xFromBucket(baseSlot.xBucket, stackIndex),
        y,
        z,
        category,
        description: aliasZh,
        descriptionEn,
        evaluation,
        tags: style.tags,
        tagsEn: style.tagsEn
      };
    });
  }

  window.ModelLayout = {
    buildModelData
  };
})();
