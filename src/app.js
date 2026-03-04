import * as THREE from "three";
import { OrbitControls } from "../vendor/three/examples/jsm/controls/OrbitControls.js";
import { AXIS_TEXT_BY_LANG, UI_TEXT } from "./app3d/i18n.js";
import {
  clearGroup,
  computeGridBands,
  createCellOffsets,
  createTextSprite,
  makeLine,
  makePolyline
} from "./app3d/scene.js";
import {
  getModelSearchText,
  shortenModelName,
  sortCellKey,
  toAxisSingleLine
} from "./app3d/filters.js";
import {
  getDetailSectionSummary,
  renderModelDetailsContent,
  setAllDetailSectionsExpanded,
  renderValidationPanelContent
} from "./app3d/ui.js";
const modelData = window.ModelLayout
  .buildModelData(window.MODEL_LIBRARY_ROWS)
  .filter((model) => model?.evaluation?.stageA !== "不纳入");

const categoryColorMap = {
  Expression: 0x79d4ff,
  Structure: 0xffc677,
  Diagnosis: 0xff8f98,
  Strategy: 0x84f4b4,
  Meta: 0xd2a0ff
};

const TYPICAL_MODEL_PRIORITY = {
  Expression: ["SCQA", "PREP", "STAR", "AIDA", "Elevator Pitch"],
  Structure: ["MECE", "Issue Tree", "5W1H", "Decision Tree"],
  Diagnosis: ["5 Whys", "Fishbone Diagram", "FMEA", "Red Teaming"],
  Strategy: ["OKR", "SWOT", "RICE", "OODA Loop", "Porter's Five Forces"],
  Meta: ["First Principles", "Systems Thinking", "Meta-Cognition", "Double Loop Learning"]
};

const SCALE = { x: 22, y: 12, z: 12 };
const SEMANTIC_ORIGIN = { x: 0, y: 4, z: 4 };
const NEIGHBOR_COUNT = 2;
const MAX_LINKS_PER_NODE = 2;

const modelMultiSearchInput = document.getElementById("modelMultiSearchInput");
const modelMultiSummary = document.getElementById("modelMultiSummary");
const modelMultiList = document.getElementById("modelMultiList");
const modelMultiSelectVisibleBtn = document.getElementById("modelMultiSelectVisibleBtn");
const modelMultiSelectAllBtn = document.getElementById("modelMultiSelectAllBtn");
const modelMultiClearBtn = document.getElementById("modelMultiClearBtn");
const cellMultiSearchInput = document.getElementById("cellMultiSearchInput");
const cellMultiSummary = document.getElementById("cellMultiSummary");
const cellMultiList = document.getElementById("cellMultiList");
const cellMultiSelectVisibleBtn = document.getElementById("cellMultiSelectVisibleBtn");
const cellMultiSelectAllBtn = document.getElementById("cellMultiSelectAllBtn");
const cellMultiClearBtn = document.getElementById("cellMultiClearBtn");
const controlsPanel = document.querySelector(".controls");
const infoPanel = document.querySelector(".info");
const linkToggle = document.getElementById("linkToggle");
const pyramidToggle = document.getElementById("pyramidToggle");
const neighborToggle = document.getElementById("neighborToggle");
const toolbarToggleBtn = document.getElementById("toolbarToggleBtn");
const detailToggleBtn = document.getElementById("detailToggleBtn");
const fullscreenToggleBtn = document.getElementById("fullscreenToggleBtn");
const overviewModeBtn = document.getElementById("overviewModeBtn");
const viewResetBtn = document.getElementById("viewResetBtn");
const viewXAxisBtn = document.getElementById("viewXAxisBtn");
const viewYAxisBtn = document.getElementById("viewYAxisBtn");
const viewZAxisBtn = document.getElementById("viewZAxisBtn");
const tooltip = document.getElementById("tooltip");
const modelContent = document.getElementById("modelContent");
const appTitle = document.getElementById("appTitle");
const appSubtitle = document.getElementById("appSubtitle");
const modelMultiLabel = document.getElementById("modelMultiLabel");
const cellFilterLabel = document.getElementById("cellFilterLabel");
const linkToggleText = document.getElementById("linkToggleText");
const gridToggleText = document.getElementById("gridToggleText");
const neighborToggleText = document.getElementById("neighborToggleText");
const visualSwitchTitle = document.getElementById("visualSwitchTitle");
const legendText = document.getElementById("legendText");
const validationPanel = document.getElementById("validationPanel");
const modelPanelTitle = document.getElementById("modelPanelTitle");
const detailCoordToggleBtn = document.getElementById("detailCoordToggleBtn");
const detailExpandAllBtn = document.getElementById("detailExpandAllBtn");
const detailCollapseAllBtn = document.getElementById("detailCollapseAllBtn");
const languageFinderText = document.getElementById("languageFinderText");
const tabModelsBtn = document.getElementById("tabModelsBtn");
const tabCellsBtn = document.getElementById("tabCellsBtn");
const tabVisualBtn = document.getElementById("tabVisualBtn");
const toolbarTabButtons = document.querySelectorAll("[data-toolbar-tab]");
const toolbarTabPanels = document.querySelectorAll("[data-toolbar-panel]");
const quickLangButtons = document.querySelectorAll("[data-ui-lang]");

let keyword = "";
let cellKeyword = "";
let hoveredMesh = null;
let selectedMesh = null;
let neighborMeshes = [];
const selectedModelNames = new Set(modelData.map((model) => model.name));
const selectedCellKeys = new Set();
const allCellKeys = [];
let cellEntries = [];
let initializedCellSelection = false;
let uiLanguage = "zh";
let toolbarHidden = false;
let infoHidden = false;
let detailTechnicalViewEnabled = false;
let activeToolbarTab = "models";
const defaultViewDirection = new THREE.Vector3(1.22, 0.96, 1.18).normalize();
const CAMERA_VIEW_DIRECTIONS = {
  default: defaultViewDirection.clone(),
  x: new THREE.Vector3(1, 0.08, 0.04).normalize(),
  y: new THREE.Vector3(0.06, 1, 0.06).normalize(),
  z: new THREE.Vector3(0.04, 0.08, 1).normalize()
};
const OVERVIEW_COMPACT_LABEL_LIMIT = 18;
const OVERVIEW_COMPACT_LABEL_MAX_DISTANCE = 150;
let activeCameraView = "default";
let baseCameraCenter = new THREE.Vector3(0, 0, 0);
let baseCameraDistance = 128;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x04070f);
scene.fog = new THREE.Fog(0x04070f, 80, 205);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(98, 90, 98);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.maxDistance = 320;
controls.minDistance = 24;
controls.target.set(0, 18, 18);
controls.enablePan = true;
controls.update();

scene.add(new THREE.AmbientLight(0xbecfff, 0.62));

const keyLight = new THREE.DirectionalLight(0x9ec6ff, 0.9);
keyLight.position.set(34, 65, 42);
scene.add(keyLight);

const fillLight = new THREE.PointLight(0x65dbcc, 0.72, 180, 2.1);
fillLight.position.set(-38, 24, 54);
scene.add(fillLight);

const axisGroup = new THREE.Group();
const nodesGroup = new THREE.Group();
const linksGroup = new THREE.Group();
const pyramidGroup = new THREE.Group();
const neighborLineGroup = new THREE.Group();
const cellBadgeGroup = new THREE.Group();
scene.add(axisGroup, nodesGroup, linksGroup, pyramidGroup, neighborLineGroup, cellBadgeGroup);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const lastPointerClient = { x: 0, y: 0 };
const lastCameraPosition = new THREE.Vector3(Number.NaN, Number.NaN, Number.NaN);
const nodeMeshes = [];
let visibleNodeMeshes = [];
let queuedPointerEvent = null;
let pointerFrameQueued = false;

buildStarField();
buildNodes();
applyUILanguage();
rebuildLinks();

linkToggle.addEventListener("change", () => rebuildLinks());
pyramidToggle.addEventListener("change", () => {
  pyramidGroup.visible = pyramidToggle.checked;
});
neighborToggle.addEventListener("change", () => {
  refreshNeighborHighlights();
  refreshNodeStyles();
});

modelMultiSearchInput.addEventListener("input", (event) => {
  keyword = event.target.value.trim().toLowerCase();
  rebuildModelMultiList();
  applyFilters();
});

modelMultiSelectVisibleBtn.addEventListener("click", () => {
  const candidates = getKeywordMatchedModels();
  candidates.forEach((model) => selectedModelNames.add(model.name));
  refreshModelMultiChecks();
  applyFilters();
});

modelMultiSelectAllBtn.addEventListener("click", () => {
  selectedModelNames.clear();
  modelData.forEach((model) => selectedModelNames.add(model.name));
  refreshModelMultiChecks();
  applyFilters();
});

modelMultiClearBtn.addEventListener("click", () => {
  selectedModelNames.clear();
  refreshModelMultiChecks();
  applyFilters();
});

cellMultiSearchInput.addEventListener("input", (event) => {
  cellKeyword = event.target.value.trim().toLowerCase();
  rebuildCellFilterOptions();
  applyFilters();
});

cellMultiSelectVisibleBtn.addEventListener("click", () => {
  getKeywordMatchedCellEntries().forEach((entry) => selectedCellKeys.add(entry.key));
  rebuildCellFilterOptions();
  applyFilters();
});

cellMultiSelectAllBtn.addEventListener("click", () => {
  selectedCellKeys.clear();
  allCellKeys.forEach((key) => selectedCellKeys.add(key));
  rebuildCellFilterOptions();
  applyFilters();
});

cellMultiClearBtn.addEventListener("click", () => {
  selectedCellKeys.clear();
  rebuildCellFilterOptions();
  applyFilters();
});

quickLangButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const nextLang = button.dataset.uiLang;
    if (!nextLang || nextLang === uiLanguage) return;
    uiLanguage = nextLang;
    applyUILanguage();
  });
});
toolbarTabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const nextTab = button.dataset.toolbarTab;
    if (!nextTab) return;
    setActiveToolbarTab(nextTab);
  });
  button.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const buttons = [...toolbarTabButtons];
    const index = buttons.indexOf(button);
    if (index < 0) return;
    const nextIndex = event.key === "ArrowRight"
      ? (index + 1) % buttons.length
      : (index - 1 + buttons.length) % buttons.length;
    const nextButton = buttons[nextIndex];
    const nextTab = nextButton?.dataset?.toolbarTab;
    if (!nextTab) return;
    setActiveToolbarTab(nextTab);
    nextButton.focus();
    event.preventDefault();
  });
});
toolbarToggleBtn.addEventListener("click", () => {
  setToolbarHidden(!toolbarHidden);
});
detailToggleBtn.addEventListener("click", () => {
  setInfoHidden(!infoHidden);
});
detailCoordToggleBtn?.addEventListener("click", () => {
  detailTechnicalViewEnabled = !detailTechnicalViewEnabled;
  updateDetailCoordToggleButton();
  renderModelDetails();
});
detailExpandAllBtn?.addEventListener("click", () => {
  const count = setAllDetailSectionsExpanded(modelContent, true);
  if (count > 0) updateDetailBulkActionButtons();
});
detailCollapseAllBtn?.addEventListener("click", () => {
  const count = setAllDetailSectionsExpanded(modelContent, false);
  if (count > 0) updateDetailBulkActionButtons();
});
fullscreenToggleBtn.addEventListener("click", () => {
  toggleFullscreen();
});
overviewModeBtn?.addEventListener("click", () => {
  enterOverviewMode({ resetCamera: true });
});
viewResetBtn?.addEventListener("click", () => {
  focusCameraOnView("default");
});
viewXAxisBtn?.addEventListener("click", () => {
  focusCameraOnView("x");
});
viewYAxisBtn?.addEventListener("click", () => {
  focusCameraOnView("y");
});
viewZAxisBtn?.addEventListener("click", () => {
  focusCameraOnView("z");
});
document.addEventListener("fullscreenchange", updateFullscreenButton);
modelContent.addEventListener("detail-sections-change", () => {
  updateDetailBulkActionButtons();
});

window.addEventListener("pointermove", queuePointerMove);
window.addEventListener("click", onSceneClick);
window.addEventListener("resize", onResize);

animate();

function getUIText(key) {
  return UI_TEXT[uiLanguage][key];
}

function buildSearchUrl(base, query) {
  return `${base}${encodeURIComponent(query || "")}`;
}

function normalizeReferenceItems(items, itemFormatter) {
  if (!Array.isArray(items) || items.length === 0) return [];
  return items
    .map((item) => {
      if (!item) return null;
      if (typeof item === "string") {
        return { text: item };
      }
      const text = itemFormatter(item);
      if (!text) return null;
      return {
        text,
        url: typeof item.url === "string" ? item.url : ""
      };
    })
    .filter(Boolean);
}

function buildModelReferencePayload(model, t) {
  const resources = window.MODEL_REFERENCE_RESOURCES?.[model.name] || {};
  const zhQuery = `${model.name} ${model.aliasZh || ""}`.trim();
  const enQuery = model.name;

  const authorItems = normalizeReferenceItems(resources.authors, (item) => item.name || "");
  const wikipediaItems = normalizeReferenceItems(resources.wikipedia, (item) => item.title || item.name || "");
  const bookItems = normalizeReferenceItems(resources.books, (item) => {
    if (item.author) return `${item.title} — ${item.author}`;
    return item.title || "";
  });
  const paperItems = normalizeReferenceItems(resources.papers, (item) => {
    if (item.author) return `${item.title} — ${item.author}`;
    return item.title || "";
  });

  return {
    title: t.referencesTitle,
    sections: [
      { label: t.referencesAuthors, items: authorItems, emptyText: t.referencesNone },
      { label: t.referencesWikipedia, items: wikipediaItems, emptyText: t.referencesNone },
      { label: t.referencesBooks, items: bookItems, emptyText: t.referencesNone },
      { label: t.referencesPapers, items: paperItems, emptyText: t.referencesNone }
    ],
    links: [
      { label: t.referencesAutoZhWiki, url: buildSearchUrl("https://zh.wikipedia.org/w/index.php?search=", zhQuery) },
      { label: t.referencesAutoEnWiki, url: buildSearchUrl("https://en.wikipedia.org/w/index.php?search=", enQuery) },
      { label: t.referencesAutoBookSearch, url: buildSearchUrl("https://books.google.com/books?q=", `${model.name} ${model.aliasZh || ""}`.trim()) }
    ]
  };
}

function queuePointerMove(event) {
  queuedPointerEvent = {
    clientX: event.clientX,
    clientY: event.clientY,
    target: event.target
  };
  if (pointerFrameQueued) return;
  pointerFrameQueued = true;
  requestAnimationFrame(() => {
    pointerFrameQueued = false;
    if (!queuedPointerEvent) return;
    onPointerMove(queuedPointerEvent);
    queuedPointerEvent = null;
  });
}

function setActiveToolbarTab(tabName) {
  const availableTabs = new Set(["models", "cells", "visual"]);
  const nextTab = availableTabs.has(tabName) ? tabName : "models";
  activeToolbarTab = nextTab;
  toolbarTabButtons.forEach((button) => {
    const isActive = button.dataset.toolbarTab === nextTab;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", isActive ? "true" : "false");
  });
  toolbarTabPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.toolbarPanel === nextTab);
  });
}

function isOverviewMode() {
  return isAllCellsSelected()
    && selectedModelNames.size === modelData.length
    && keyword.length === 0
    && cellKeyword.length === 0;
}

function updateViewControlsState() {
  const overviewActive = isOverviewMode();
  if (overviewModeBtn) {
    overviewModeBtn.classList.toggle("active", overviewActive);
    overviewModeBtn.setAttribute("aria-pressed", overviewActive ? "true" : "false");
  }

  const cameraButtonByKey = {
    default: viewResetBtn,
    x: viewXAxisBtn,
    y: viewYAxisBtn,
    z: viewZAxisBtn
  };
  Object.entries(cameraButtonByKey).forEach(([key, button]) => {
    if (!button) return;
    const isActive = activeCameraView === key;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function focusCameraOnView(viewKey, options = {}) {
  const { keepSelection = false } = options;
  const nextView = CAMERA_VIEW_DIRECTIONS[viewKey] ? viewKey : "default";
  activeCameraView = nextView;
  const direction = CAMERA_VIEW_DIRECTIONS[nextView];
  controls.target.copy(baseCameraCenter);
  camera.position.copy(baseCameraCenter).addScaledVector(direction, baseCameraDistance);
  controls.update();
  if (!keepSelection) {
    hoveredMesh = null;
    hideTooltip();
  }
  refreshNodeStyles();
  updateViewControlsState();
}

function enterOverviewMode(options = {}) {
  const { resetCamera = false } = options;

  keyword = "";
  cellKeyword = "";
  modelMultiSearchInput.value = "";
  cellMultiSearchInput.value = "";
  selectedModelNames.clear();
  modelData.forEach((model) => selectedModelNames.add(model.name));
  selectedCellKeys.clear();
  allCellKeys.forEach((key) => selectedCellKeys.add(key));
  selectNode(null);
  rebuildModelMultiList();
  rebuildCellFilterOptions();
  applyFilters();

  if (resetCamera) focusCameraOnView("default");
}

function toWorldY(yLevel) {
  const centeredLevel = yLevel - SEMANTIC_ORIGIN.y;
  return -centeredLevel * SCALE.y;
}

function toWorldZ(zLevel) {
  const centeredLevel = zLevel - SEMANTIC_ORIGIN.z;
  return -centeredLevel * SCALE.z;
}

function getModelAnnotation(model) {
  return uiLanguage === "en" ? (model.aliasEn ?? model.aliasZh ?? "") : (model.aliasZh ?? model.aliasEn ?? "");
}

function getModelLabel(model) {
  const annotation = getModelAnnotation(model);
  return annotation ? `${model.name} (${annotation})` : model.name;
}

function createNodeLabelSprite(model) {
  const annotation = getModelAnnotation(model);
  const labelText = annotation ? `${model.name}\n${annotation}` : model.name;
  return createTextSprite(labelText, {
    fontSize: 20,
    lineHeight: 24,
    paddingX: 12,
    paddingY: 8,
    background: "rgba(8, 15, 30, 0.68)",
    border: "rgba(143, 183, 255, 0.45)",
    textColor: "rgba(233, 243, 255, 0.95)",
    scaleFactor: 0.014,
    radius: 8
  });
}

function createCompactNodeLabelSprite(model) {
  return createTextSprite(shortenModelName(model.name, 15), {
    fontSize: 16,
    lineHeight: 20,
    paddingX: 9,
    paddingY: 6,
    background: "rgba(8, 15, 30, 0.58)",
    border: "rgba(143, 183, 255, 0.38)",
    textColor: "rgba(235, 244, 255, 0.93)",
    scaleFactor: 0.0112,
    radius: 7
  });
}

function buildNodes() {
  const geometry = new THREE.SphereGeometry(1.55, 32, 32);
  const cellTotals = new Map();
  const cellPlacementIndex = new Map();
  const cellOffsets = new Map();

  for (const item of modelData) {
    const cellKey = `${getXBucketValue(item.x)}|${item.y}|${item.z}`;
    cellTotals.set(cellKey, (cellTotals.get(cellKey) ?? 0) + 1);
  }

  cellTotals.forEach((total, key) => {
    cellOffsets.set(key, createCellOffsets(total));
  });

  for (const item of modelData) {
    const baseColor = categoryColorMap[item.category] ?? 0xa5b9e7;
    const material = new THREE.MeshStandardMaterial({
      color: baseColor,
      roughness: 0.27,
      metalness: 0.18,
      emissive: new THREE.Color(baseColor).multiplyScalar(0.15),
      emissiveIntensity: 0.22
    });
    const mesh = new THREE.Mesh(geometry, material);
    const cellKey = `${getXBucketValue(item.x)}|${item.y}|${item.z}`;
    const nodeIndexInCell = cellPlacementIndex.get(cellKey) ?? 0;
    cellPlacementIndex.set(cellKey, nodeIndexInCell + 1);
    const offsets = cellOffsets.get(cellKey) ?? [new THREE.Vector3(0, 0, 0)];
    const localOffset = offsets[nodeIndexInCell % offsets.length].clone();
    if (nodeIndexInCell >= offsets.length) {
      const ring = Math.floor(nodeIndexInCell / offsets.length);
      localOffset.multiplyScalar(1 + ring * 0.14);
    }
    mesh.position.copy(getCellCenter(cellKey)).add(localOffset);
    mesh.userData = {
      model: item,
      cellKey,
      nodeIndexInCell,
      searchMatched: true,
      searchText: getModelSearchText(item),
      baseEmissive: material.emissive.clone()
    };

    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(2.12, 24, 24),
      new THREE.MeshBasicMaterial({
        color: baseColor,
        transparent: true,
        opacity: 0.13,
        side: THREE.BackSide
      })
    );
    halo.userData.isHalo = true;
    mesh.add(halo);

    const detailLabel = createNodeLabelSprite(item);
    detailLabel.position.set(0, 3.45, 0);
    detailLabel.visible = false;
    mesh.userData.labelSprite = detailLabel;
    mesh.add(detailLabel);

    const compactLabel = createCompactNodeLabelSprite(item);
    compactLabel.position.set(0, 2.96, 0);
    compactLabel.visible = false;
    mesh.userData.compactLabelSprite = compactLabel;
    mesh.add(compactLabel);

    mesh.userData.haloMaterial = halo.material;

    nodesGroup.add(mesh);
    nodeMeshes.push(mesh);
  }
}

function getXBucketValue(x) {
  if (x <= -0.33) return "-1";
  if (x >= 0.33) return "1";
  return "0";
}

function getCellCenter(cellKey) {
  const [xKey, yKey, zKey] = cellKey.split("|");
  const xCenter = xKey === "-1" ? -0.75 : xKey === "1" ? 0.75 : 0;
  return new THREE.Vector3(xCenter * SCALE.x, toWorldY(Number(yKey)), toWorldZ(Number(zKey)));
}

function getModelMultiSummaryText() {
  const t = UI_TEXT[uiLanguage];
  if (selectedModelNames.size === modelData.length) return t.modelMultiSummaryAll;
  if (selectedModelNames.size === 0) return t.modelMultiSummaryNone;
  const count = selectedModelNames.size;
  if (uiLanguage === "zh") return `${t.modelMultiSummarySelected}：${count} 个模型`;
  return `${t.modelMultiSummarySelected}: ${count} ${count === 1 ? "model" : "models"}`;
}

function getKeywordMatchedModels() {
  if (!keyword) return [...modelData];
  return modelData.filter((model) => getModelSearchText(model).includes(keyword));
}

function rebuildModelMultiList() {
  modelMultiList.innerHTML = "";
  const matched = getKeywordMatchedModels();
  if (!matched.length) {
    const empty = document.createElement("div");
    empty.className = "model-multi-empty";
    empty.textContent = UI_TEXT[uiLanguage].modelMultiNoResult;
    modelMultiList.appendChild(empty);
  }

  for (let index = 0; index < matched.length; index++) {
    const model = matched[index];
    const tag = document.createElement("button");
    tag.type = "button";
    tag.className = `filter-tag ${selectedModelNames.has(model.name) ? "active" : ""}`;
    tag.textContent = model.name;
    tag.title = getModelLabel(model);
    tag.setAttribute("aria-pressed", selectedModelNames.has(model.name) ? "true" : "false");
    tag.addEventListener("click", () => {
      if (selectedModelNames.has(model.name)) {
        selectedModelNames.delete(model.name);
      } else {
        selectedModelNames.add(model.name);
      }
      rebuildModelMultiList();
      applyFilters();
    });
    modelMultiList.appendChild(tag);
  }
  modelMultiSummary.textContent = getModelMultiSummaryText();
}

function refreshModelMultiChecks() {
  rebuildModelMultiList();
}

function chooseTypicalModel(models) {
  if (!models.length) return null;
  const category = models[0].category;
  const priorities = TYPICAL_MODEL_PRIORITY[category] ?? [];
  for (const candidate of priorities) {
    const matched = models.find((model) => model.name === candidate);
    if (matched) return matched;
  }
  return [...models].sort((a, b) => a.name.length - b.name.length || a.name.localeCompare(b.name))[0];
}

function makeCellLabel(cellKey, stats, compact = false) {
  const [xKey, yKey, zKey] = cellKey.split("|");
  const axisText = AXIS_TEXT_BY_LANG[uiLanguage];
  const xText = toAxisSingleLine(axisText.x[xKey]);
  const yText = toAxisSingleLine(axisText.y[yKey]);
  const zText = toAxisSingleLine(axisText.z[zKey]);
  const typicalModel = chooseTypicalModel(stats.models);
  const typicalName = typicalModel ? typicalModel.name : "-";
  const t = UI_TEXT[uiLanguage];

  if (compact) {
    if (stats.count <= 1) return shortenModelName(typicalName, 12);
    return `${shortenModelName(typicalName, 12)} +${stats.count - 1}`;
  }

  return `${xText} · ${yText} · ${zText} ｜ ${t.cellTypicalLabel}: ${typicalName} ｜ ${stats.count} ${t.cellCountUnit}`;
}

function mixChannel(a, b, ratio) {
  return Math.round(a + (b - a) * ratio);
}

function toRgba(rgb, alpha) {
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha.toFixed(3)})`;
}

function getCellBadgeVisualStyle(count, maxCount) {
  const ratio = maxCount > 1 ? Math.min(1, Math.max(0, (count - 1) / (maxCount - 1))) : 0;
  const bgRgb = [
    mixChannel(11, 35, ratio),
    mixChannel(26, 76, ratio),
    mixChannel(54, 124, ratio)
  ];
  const borderRgb = [
    mixChannel(159, 109, ratio),
    mixChannel(198, 242, ratio),
    mixChannel(255, 176, ratio)
  ];
  const textRgb = [
    mixChannel(234, 244, ratio),
    mixChannel(244, 255, ratio),
    mixChannel(255, 229, ratio)
  ];

  return {
    background: toRgba(bgRgb, 0.74 + ratio * 0.18),
    border: toRgba(borderRgb, 0.72 + ratio * 0.18),
    textColor: toRgba(textRgb, 0.98),
    scaleFactor: 0.0112 + ratio * 0.0016
  };
}

function getCellStats(searchMatchedOnly = false) {
  const stats = new Map();
  for (const mesh of nodeMeshes) {
    if (searchMatchedOnly && !mesh.userData.searchMatched) continue;
    const key = mesh.userData.cellKey;
    if (!stats.has(key)) stats.set(key, { count: 0, models: [] });
    const bucket = stats.get(key);
    bucket.count += 1;
    bucket.models.push(mesh.userData.model);
  }
  return stats;
}

function buildValidationSnapshot() {
  const stats = getCellStats(false);
  const toolLayerCount = modelData.filter((model) => Number(model.z) === 1).length;
  const filledCells = stats.size;
  const denseCells = [...stats.values()].filter((cellStats) => cellStats.count >= 2).length;
  const denseRatio = filledCells > 0 ? denseCells / filledCells : 0;
  const topCells = [...stats.entries()]
    .sort((a, b) => b[1].count - a[1].count || sortCellKey(a[0], b[0]))
    .slice(0, 3);

  return {
    toolLayerCount,
    filledCells,
    denseCells,
    denseRatio,
    topCells,
    evalSummary: window.MODEL_EVALUATION_SUMMARY || null
  };
}

function renderValidationPanel() {
  if (!validationPanel) return;
  const t = UI_TEXT[uiLanguage];
  const snapshot = buildValidationSnapshot();
  renderValidationPanelContent(validationPanel, t, snapshot, getCellShortLabel);
}

function getCellShortLabel(cellKey) {
  const [xKey, yKey, zKey] = cellKey.split("|");
  const axisText = AXIS_TEXT_BY_LANG[uiLanguage];
  return `${toAxisSingleLine(axisText.x[xKey])} · ${toAxisSingleLine(axisText.y[yKey])} · ${toAxisSingleLine(axisText.z[zKey])}`;
}

function isAllCellsSelected() {
  return allCellKeys.length > 0 && selectedCellKeys.size === allCellKeys.length;
}

function getCellMultiSummaryText() {
  const t = UI_TEXT[uiLanguage];
  if (isAllCellsSelected()) return t.cellMultiSummaryAll;
  if (selectedCellKeys.size === 0) return t.cellMultiSummaryNone;
  return `${t.cellMultiSummarySelected}: ${selectedCellKeys.size}`;
}

function getKeywordMatchedCellEntries() {
  if (!cellKeyword) return [...cellEntries];
  return cellEntries.filter((entry) => entry.label.toLowerCase().includes(cellKeyword));
}

function rebuildCellFilterOptions() {
  const t = UI_TEXT[uiLanguage];
  const stats = getCellStats(false);
  cellEntries = [...stats.entries()]
    .sort((a, b) => sortCellKey(a[0], b[0]))
    .map(([key, cellStats]) => ({
      key,
      stats: cellStats,
      label: makeCellLabel(key, cellStats)
    }));

  allCellKeys.length = 0;
  allCellKeys.push(...cellEntries.map((entry) => entry.key));

  if (!initializedCellSelection) {
    selectedCellKeys.clear();
    allCellKeys.forEach((key) => selectedCellKeys.add(key));
    initializedCellSelection = true;
  } else {
    const validKeys = new Set(allCellKeys);
    [...selectedCellKeys].forEach((key) => {
      if (!validKeys.has(key)) selectedCellKeys.delete(key);
    });
  }

  cellMultiList.innerHTML = "";
  const matchedEntries = getKeywordMatchedCellEntries();
  if (!matchedEntries.length) {
    const empty = document.createElement("div");
    empty.className = "model-multi-empty";
    empty.textContent = t.cellMultiNoResult;
    cellMultiList.appendChild(empty);
  }

  for (let index = 0; index < matchedEntries.length; index++) {
    const entry = matchedEntries[index];
    const tag = document.createElement("button");
    tag.type = "button";
    tag.className = `filter-tag ${selectedCellKeys.has(entry.key) ? "active" : ""}`;
    tag.textContent = getCellShortLabel(entry.key);
    tag.title = `${entry.label}`;
    tag.setAttribute("aria-pressed", selectedCellKeys.has(entry.key) ? "true" : "false");
    tag.addEventListener("click", () => {
      if (selectedCellKeys.has(entry.key)) {
        selectedCellKeys.delete(entry.key);
      } else {
        selectedCellKeys.add(entry.key);
      }
      rebuildCellFilterOptions();
      applyFilters();
    });
    cellMultiList.appendChild(tag);
  }

  cellMultiSummary.textContent = getCellMultiSummaryText();
}

function rebuildCellBadges() {
  clearGroup(cellBadgeGroup);
  if (!isOverviewMode()) return;

  const stats = getCellStats(true);
  let maxCount = 1;
  stats.forEach((cellStats) => {
    if (cellStats.count > maxCount) maxCount = cellStats.count;
  });
  stats.forEach((cellStats, cellKey) => {
    const center = getCellCenter(cellKey);
    const text = makeCellLabel(cellKey, cellStats, true);
    const visualStyle = getCellBadgeVisualStyle(cellStats.count, maxCount);
    const badge = createTextSprite(text, {
      fontSize: 18,
      lineHeight: 22,
      paddingX: 10,
      paddingY: 6,
      background: visualStyle.background,
      border: visualStyle.border,
      textColor: visualStyle.textColor,
      scaleFactor: visualStyle.scaleFactor,
      radius: 7
    });
    badge.position.copy(center).add(new THREE.Vector3(0, 1.8 + (cellStats.count / maxCount) * 0.6, 0));
    badge.userData = { cellKey, stats: cellStats, isCellBadge: true };
    cellBadgeGroup.add(badge);
  });
}

function applyUILanguage() {
  const t = UI_TEXT[uiLanguage];
  const htmlLang = uiLanguage === "en" ? "en" : "zh-CN";
  document.documentElement.lang = htmlLang;
  document.title = t.pageTitle;
  languageFinderText.textContent = "Language / 语言";
  quickLangButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.uiLang === uiLanguage);
  });

  appTitle.textContent = t.appTitle;
  appSubtitle.textContent = t.appSubtitle;
  tabModelsBtn.textContent = t.toolbarTabModels;
  tabCellsBtn.textContent = t.toolbarTabCells;
  tabVisualBtn.textContent = t.toolbarTabVisual;
  modelMultiLabel.textContent = t.modelMultiLabel;
  modelMultiSearchInput.placeholder = t.modelMultiSearchPlaceholder;
  modelMultiSelectVisibleBtn.textContent = t.modelMultiSelectVisible;
  modelMultiSelectAllBtn.textContent = t.modelMultiSelectAll;
  modelMultiClearBtn.textContent = t.modelMultiClear;
  cellFilterLabel.textContent = t.cellFilterLabel;
  cellMultiSearchInput.placeholder = t.cellMultiSearchPlaceholder;
  cellMultiSelectVisibleBtn.textContent = t.cellMultiSelectVisible;
  cellMultiSelectAllBtn.textContent = t.cellMultiSelectAll;
  cellMultiClearBtn.textContent = t.cellMultiClear;
  linkToggleText.textContent = t.linkToggleText;
  gridToggleText.textContent = t.gridToggleText;
  neighborToggleText.textContent = t.neighborToggleText;
  if (overviewModeBtn) overviewModeBtn.textContent = t.overviewModeText;
  if (viewResetBtn) viewResetBtn.textContent = t.viewResetText;
  if (viewXAxisBtn) viewXAxisBtn.textContent = t.viewXAxisText;
  if (viewYAxisBtn) viewYAxisBtn.textContent = t.viewYAxisText;
  if (viewZAxisBtn) viewZAxisBtn.textContent = t.viewZAxisText;
  visualSwitchTitle.textContent = t.visualSwitchTitle;
  legendText.textContent = t.legendText;
  modelPanelTitle.textContent = t.modelPanelTitle;
  updateDetailCoordToggleButton();
  if (detailExpandAllBtn) detailExpandAllBtn.textContent = t.detailExpandAllText;
  if (detailCollapseAllBtn) detailCollapseAllBtn.textContent = t.detailCollapseAllText;
  toolbarToggleBtn.textContent = toolbarHidden ? t.showToolbarText : t.hideToolbarText;
  detailToggleBtn.textContent = infoHidden ? t.showDetailsText : t.hideDetailsText;
  setActiveToolbarTab(activeToolbarTab);
  updateFullscreenButton();
  rebuildModelMultiList();
  rebuildCellFilterOptions();
  renderValidationPanel();

  updateNodeLabels();
  buildAxis();
  buildSpaceGrid();
  fitCameraToCognitiveSpace();
  applyFilters();
  renderModelDetails();
  updateViewControlsState();
  if (hoveredMesh) {
    showTooltip(lastPointerClient.x, lastPointerClient.y, getModelLabel(hoveredMesh.userData.model));
  }
}

function updateDetailCoordToggleButton() {
  if (!detailCoordToggleBtn) return;
  const t = UI_TEXT[uiLanguage];
  detailCoordToggleBtn.textContent = detailTechnicalViewEnabled
    ? t.detailHideTechnicalCoordsText
    : t.detailShowTechnicalCoordsText;
  detailCoordToggleBtn.setAttribute("aria-pressed", detailTechnicalViewEnabled ? "true" : "false");
}

function updateDetailBulkActionButtons() {
  if (!detailExpandAllBtn || !detailCollapseAllBtn) return;
  const summary = getDetailSectionSummary(modelContent);
  const noSections = summary.total === 0;
  detailExpandAllBtn.disabled = noSections || summary.collapsed === 0;
  detailCollapseAllBtn.disabled = noSections || summary.expanded === 0;
}

function buildAxis() {
  clearGroup(axisGroup);
  const axisText = AXIS_TEXT_BY_LANG[uiLanguage];

  const axisMaterialX = new THREE.LineBasicMaterial({ color: 0xff7f94 });
  const axisMaterialY = new THREE.LineBasicMaterial({ color: 0x8ce7d2 });
  const axisMaterialZ = new THREE.LineBasicMaterial({ color: 0x77a6ff });
  const tickMaterial = new THREE.LineBasicMaterial({ color: 0x8896bb });
  const xValues = [-1, 0, 1].map((x) => x * SCALE.x);
  const yValues = [1, 2, 3, 4].map((y) => toWorldY(y));
  const zValues = [1, 2, 3, 4].map((z) => toWorldZ(z));
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);
  const zMin = Math.min(...zValues);
  const zMax = Math.max(...zValues);

  axisGroup.add(
    makeLine(new THREE.Vector3(xMin - 6, 0, 0), new THREE.Vector3(xMax + 6, 0, 0), axisMaterialX),
    makeLine(new THREE.Vector3(0, yMin - 6, 0), new THREE.Vector3(0, yMax + 10, 0), axisMaterialY),
    makeLine(new THREE.Vector3(0, 0, zMin - 6), new THREE.Vector3(0, 0, zMax + 10), axisMaterialZ)
  );

  const origin = new THREE.Mesh(
    new THREE.SphereGeometry(0.68, 18, 18),
    new THREE.MeshBasicMaterial({ color: 0xebf2ff })
  );
  axisGroup.add(origin);

  for (const x of [-1, 0, 1]) {
    const p = new THREE.Vector3(x * SCALE.x, 0, 0);
    axisGroup.add(
      makeLine(new THREE.Vector3(p.x, -0.7, 0), new THREE.Vector3(p.x, 0.7, 0), tickMaterial)
    );
    const label = createTextSprite(axisText.x[String(x)]);
    label.position.set(p.x, 2.1, 0);
    axisGroup.add(label);
  }

  for (const y of [1, 2, 3, 4]) {
    const p = new THREE.Vector3(0, toWorldY(y), 0);
    axisGroup.add(
      makeLine(new THREE.Vector3(-0.7, p.y, 0), new THREE.Vector3(0.7, p.y, 0), tickMaterial)
    );
    const label = createTextSprite(axisText.y[String(y)]);
    label.position.set(-5.2, p.y, 0);
    axisGroup.add(label);
  }

  for (const z of [1, 2, 3, 4]) {
    const p = new THREE.Vector3(0, 0, toWorldZ(z));
    axisGroup.add(
      makeLine(new THREE.Vector3(-0.7, 0, p.z), new THREE.Vector3(0.7, 0, p.z), tickMaterial)
    );
    const label = createTextSprite(axisText.z[String(z)]);
    label.position.set(0, 2.1, p.z);
    axisGroup.add(label);
  }

  const xTitle = createTextSprite(getUIText("axisXTitle"));
  xTitle.position.set(xMax + 9, 1.2, 0);
  axisGroup.add(xTitle);

  const yTitle = createTextSprite(getUIText("axisYTitle"));
  yTitle.position.set(0.2, yMax + 11, 0);
  axisGroup.add(yTitle);

  const zTitle = createTextSprite(getUIText("axisZTitle"));
  zTitle.position.set(0, 1.2, zMax + 11);
  axisGroup.add(zTitle);

  const originTag = createTextSprite(getUIText("originTag"), {
    fontSize: 20,
    lineHeight: 24,
    paddingX: 12,
    paddingY: 7,
    scaleFactor: 0.015
  });
  originTag.position.set(0, -2.8, 0);
  axisGroup.add(originTag);
}

function buildSpaceGrid() {
  clearGroup(pyramidGroup);

  const xBand = computeGridBands([-1, 0, 1].map((x) => x * SCALE.x), SCALE.x);
  const yBand = computeGridBands([1, 2, 3, 4].map((y) => toWorldY(y)), SCALE.y);
  const zBand = computeGridBands([1, 2, 3, 4].map((z) => toWorldZ(z)), SCALE.z);

  const xMin = xBand.min;
  const xMax = xBand.max;
  const yMin = yBand.min;
  const yMax = yBand.max;
  const zMin = zBand.min;
  const zMax = zBand.max;

  const outerMaterial = new THREE.LineBasicMaterial({
    color: 0x80a2ef,
    transparent: true,
    opacity: 0.46
  });
  const innerMaterial = new THREE.LineBasicMaterial({
    color: 0x6f8bd8,
    transparent: true,
    opacity: 0.2
  });

  const p000 = new THREE.Vector3(xMin, yMin, zMin);
  const p001 = new THREE.Vector3(xMin, yMin, zMax);
  const p010 = new THREE.Vector3(xMin, yMax, zMin);
  const p011 = new THREE.Vector3(xMin, yMax, zMax);
  const p100 = new THREE.Vector3(xMax, yMin, zMin);
  const p101 = new THREE.Vector3(xMax, yMin, zMax);
  const p110 = new THREE.Vector3(xMax, yMax, zMin);
  const p111 = new THREE.Vector3(xMax, yMax, zMax);

  const outerEdges = [
    [p000, p100], [p100, p101], [p101, p001], [p001, p000],
    [p010, p110], [p110, p111], [p111, p011], [p011, p010],
    [p000, p010], [p100, p110], [p101, p111], [p001, p011]
  ];
  outerEdges.forEach(([a, b]) => pyramidGroup.add(makeLine(a, b, outerMaterial)));

  xBand.bounds.slice(1, -1).forEach((x) => {
    pyramidGroup.add(makePolyline([
      new THREE.Vector3(x, yMin, zMin),
      new THREE.Vector3(x, yMax, zMin),
      new THREE.Vector3(x, yMax, zMax),
      new THREE.Vector3(x, yMin, zMax),
      new THREE.Vector3(x, yMin, zMin)
    ], innerMaterial));
  });
  yBand.bounds.slice(1, -1).forEach((y) => {
    pyramidGroup.add(makePolyline([
      new THREE.Vector3(xMin, y, zMin),
      new THREE.Vector3(xMax, y, zMin),
      new THREE.Vector3(xMax, y, zMax),
      new THREE.Vector3(xMin, y, zMax),
      new THREE.Vector3(xMin, y, zMin)
    ], innerMaterial));
  });
  zBand.bounds.slice(1, -1).forEach((z) => {
    pyramidGroup.add(makePolyline([
      new THREE.Vector3(xMin, yMin, z),
      new THREE.Vector3(xMax, yMin, z),
      new THREE.Vector3(xMax, yMax, z),
      new THREE.Vector3(xMin, yMax, z),
      new THREE.Vector3(xMin, yMin, z)
    ], innerMaterial));
  });

  const xCells = xBand.bounds.slice(0, -1).map((bound, i) => (bound + xBand.bounds[i + 1]) / 2);
  const yCells = yBand.bounds.slice(0, -1).map((bound, i) => (bound + yBand.bounds[i + 1]) / 2);
  const zCells = zBand.bounds.slice(0, -1).map((bound, i) => (bound + zBand.bounds[i + 1]) / 2);
  const totalCells = xCells.length * yCells.length * zCells.length;

  const cellGeometry = new THREE.BoxGeometry(SCALE.x * 0.94, SCALE.y * 0.9, SCALE.z * 0.9);
  const cellMaterial = new THREE.MeshBasicMaterial({
    color: 0x4f75bb,
    transparent: true,
    opacity: 0.032,
    depthWrite: false
  });
  const cellMesh = new THREE.InstancedMesh(cellGeometry, cellMaterial, totalCells);
  const matrix = new THREE.Matrix4();
  let index = 0;
  for (const x of xCells) {
    for (const y of yCells) {
      for (const z of zCells) {
        matrix.makeTranslation(x, y, z);
        cellMesh.setMatrixAt(index, matrix);
        index += 1;
      }
    }
  }
  pyramidGroup.add(cellMesh);

  const gridLabel = createTextSprite(getUIText("gridLabel"), {
    fontSize: 18,
    lineHeight: 22,
    paddingX: 10,
    paddingY: 6,
    scaleFactor: 0.014
  });
  gridLabel.position.set(xMin + 4, yMax + 4.6, zMin - 3);
  pyramidGroup.add(gridLabel);

  pyramidGroup.visible = pyramidToggle.checked;
}

function buildStarField() {
  const starGeo = new THREE.BufferGeometry();
  const points = [];
  for (let i = 0; i < 480; i++) {
    points.push(
      THREE.MathUtils.randFloatSpread(330),
      THREE.MathUtils.randFloat(6, 180),
      THREE.MathUtils.randFloatSpread(330)
    );
  }
  starGeo.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));

  const starMat = new THREE.PointsMaterial({
    color: 0x8ba6df,
    size: 0.7,
    transparent: true,
    opacity: 0.65,
    sizeAttenuation: true
  });

  scene.add(new THREE.Points(starGeo, starMat));
}

function applyFilters() {
  visibleNodeMeshes = [];
  for (const mesh of nodeMeshes) {
    const { model, searchText } = mesh.userData;
    const nameMatched = searchText.includes(keyword);
    const multiMatched = selectedModelNames.has(model.name);
    const cellMatched = selectedCellKeys.has(mesh.userData.cellKey);
    mesh.userData.searchMatched = nameMatched && multiMatched;
    mesh.visible = mesh.userData.searchMatched && cellMatched;
    if (mesh.visible) visibleNodeMeshes.push(mesh);
  }

  if (selectedMesh && !selectedMesh.visible) {
    selectNode(null);
  }

  if (hoveredMesh && !hoveredMesh.visible) {
    hoveredMesh = null;
    hideTooltip();
  }

  rebuildLinks();
  rebuildCellBadges();
  refreshNeighborHighlights();
  refreshNodeStyles();
  updateViewControlsState();
}

function rebuildLinks() {
  clearGroup(linksGroup);
  if (!linkToggle.checked) return;

  const grouped = new Map();
  visibleNodeMeshes.forEach((mesh) => {
    const category = mesh.userData.model.category;
    if (!grouped.has(category)) grouped.set(category, []);
    grouped.get(category).push(mesh);
  });

  grouped.forEach((meshes, category) => {
    if (meshes.length < 2) return;
    const material = new THREE.LineBasicMaterial({
      color: categoryColorMap[category] ?? 0x9eb0d1,
      transparent: true,
      opacity: 0.24
    });

    const edgeSet = new Set();
    for (let i = 0; i < meshes.length; i++) {
      const source = meshes[i];
      const nearest = [];
      for (let j = 0; j < meshes.length; j++) {
        if (i === j) continue;
        const target = meshes[j];
        nearest.push({ mesh: target, d2: source.position.distanceToSquared(target.position) });
      }
      nearest.sort((a, b) => a.d2 - b.d2);
      for (const item of nearest.slice(0, MAX_LINKS_PER_NODE)) {
        const target = item.mesh;
        const aName = source.userData.model.name;
        const bName = target.userData.model.name;
        const edgeKey = aName < bName ? `${aName}::${bName}` : `${bName}::${aName}`;
        if (edgeSet.has(edgeKey)) continue;
        edgeSet.add(edgeKey);
        linksGroup.add(makeLine(source.position, target.position, material));
      }
    }
  });
}

function refreshNeighborHighlights() {
  clearGroup(neighborLineGroup);
  neighborMeshes = [];

  if (!neighborToggle.checked || !selectedMesh || !selectedMesh.visible) return;

  const candidates = visibleNodeMeshes
    .filter((mesh) => mesh !== selectedMesh && mesh.visible)
    .map((mesh) => ({
      mesh,
      distance: mesh.position.distanceTo(selectedMesh.position)
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, NEIGHBOR_COUNT);

  neighborMeshes = candidates.map((item) => item.mesh);

  const lineMaterial = new THREE.LineDashedMaterial({
    color: 0x7ee8cd,
    linewidth: 1,
    dashSize: 1.3,
    gapSize: 0.9,
    transparent: true,
    opacity: 0.8
  });

  for (const candidate of candidates) {
    const line = makeLine(selectedMesh.position, candidate.mesh.position, lineMaterial);
    line.computeLineDistances();
    neighborLineGroup.add(line);
  }
}

function refreshNodeStyles() {
  const overviewMode = isOverviewMode();
  const detailMode = !overviewMode;
  const compactLabelCandidates = new Set();
  if (overviewMode) {
    const maxDistanceSq = OVERVIEW_COMPACT_LABEL_MAX_DISTANCE * OVERVIEW_COMPACT_LABEL_MAX_DISTANCE;
    const closest = visibleNodeMeshes
      .map((mesh) => ({
        mesh,
        distanceSq: camera.position.distanceToSquared(mesh.position)
      }))
      .filter((item) => item.distanceSq <= maxDistanceSq)
      .sort((a, b) => a.distanceSq - b.distanceSq)
      .slice(0, OVERVIEW_COMPACT_LABEL_LIMIT);
    closest.forEach((item) => compactLabelCandidates.add(item.mesh));
  }

  for (const mesh of nodeMeshes) {
    const material = mesh.material;
    const isHovered = mesh === hoveredMesh;
    const isSelected = mesh === selectedMesh;
    const isNeighbor = neighborMeshes.includes(mesh);
    const isVisible = mesh.visible;
    const showDetailLabel = isVisible && (detailMode || isHovered || isSelected || isNeighbor);
    const showCompactLabel = isVisible && !showDetailLabel && compactLabelCandidates.has(mesh);

    const baseScale = overviewMode ? 0.88 : 1;
    mesh.scale.setScalar(isSelected ? 1.35 : isHovered ? 1.2 : isNeighbor ? 1.12 : baseScale);
    if (mesh.userData.labelSprite) {
      mesh.userData.labelSprite.visible = showDetailLabel;
    }
    if (mesh.userData.compactLabelSprite) {
      mesh.userData.compactLabelSprite.visible = showCompactLabel;
    }

    material.emissive.copy(mesh.userData.baseEmissive);
    material.transparent = true;
    material.opacity = overviewMode ? 0.76 : 1;
    material.emissiveIntensity = overviewMode ? 0.14 : 0.22;

    if (mesh.userData.haloMaterial) {
      mesh.userData.haloMaterial.opacity = overviewMode ? 0.09 : 0.13;
    }

    if (isHovered) {
      material.opacity = 0.93;
    }

    if (isNeighbor) {
      material.emissive.setHex(0x7ee8cd);
      material.emissiveIntensity = 0.38;
      material.opacity = 0.9;
      if (mesh.userData.haloMaterial) mesh.userData.haloMaterial.opacity = 0.15;
    }

    if (isSelected) {
      material.emissive.setHex(0xeef6ff);
      material.emissiveIntensity = 0.52;
      material.opacity = 1;
      if (mesh.userData.haloMaterial) mesh.userData.haloMaterial.opacity = 0.2;
    }
  }
}

function disposeSprite(sprite) {
  if (!sprite || !sprite.material) return;
  if (sprite.material.map) sprite.material.map.dispose();
  sprite.material.dispose();
}

function updateNodeLabels() {
  for (const mesh of nodeMeshes) {
    if (mesh.userData.labelSprite) {
      mesh.remove(mesh.userData.labelSprite);
      disposeSprite(mesh.userData.labelSprite);
    }
    if (mesh.userData.compactLabelSprite) {
      mesh.remove(mesh.userData.compactLabelSprite);
      disposeSprite(mesh.userData.compactLabelSprite);
    }

    const detailLabel = createNodeLabelSprite(mesh.userData.model);
    detailLabel.position.set(0, 3.45, 0);
    detailLabel.visible = false;
    mesh.userData.labelSprite = detailLabel;
    mesh.add(detailLabel);

    const compactLabel = createCompactNodeLabelSprite(mesh.userData.model);
    compactLabel.position.set(0, 2.96, 0);
    compactLabel.visible = false;
    mesh.userData.compactLabelSprite = compactLabel;
    mesh.add(compactLabel);
  }
}

function onPointerMove(event) {
  lastPointerClient.x = event.clientX;
  lastPointerClient.y = event.clientY;

  if (event.target instanceof Element && event.target.closest(".panel, .view-dock")) {
    if (hoveredMesh) {
      hoveredMesh = null;
      refreshNodeStyles();
    }
    hideTooltip();
    return;
  }

  updatePointer(event);
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(visibleNodeMeshes, true);
  const nextHovered = pickModelMesh(intersects);

  if (hoveredMesh !== nextHovered) {
    hoveredMesh = nextHovered;
    refreshNodeStyles();
  }

  if (hoveredMesh) {
    renderer.domElement.style.cursor = "pointer";
    showTooltip(event.clientX, event.clientY, getModelLabel(hoveredMesh.userData.model));
  } else {
    let hoveredCellBadge = null;
    if (isOverviewMode()) {
      const badgeIntersects = raycaster.intersectObjects(cellBadgeGroup.children, true);
      hoveredCellBadge = pickCellBadge(badgeIntersects);
    }
    if (hoveredCellBadge) {
      renderer.domElement.style.cursor = "pointer";
      showTooltip(
        event.clientX,
        event.clientY,
        makeCellLabel(hoveredCellBadge.userData.cellKey, hoveredCellBadge.userData.stats)
      );
    } else {
      renderer.domElement.style.cursor = "grab";
      hideTooltip();
    }
  }
}

function onSceneClick(event) {
  if (event.target instanceof Element && event.target.closest(".panel, .view-dock")) return;

  updatePointer(event);
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(visibleNodeMeshes, true);
  const modelMesh = pickModelMesh(intersects);
  if (modelMesh) {
    selectNode(modelMesh);
  } else {
    if (isOverviewMode()) {
      const badgeIntersects = raycaster.intersectObjects(cellBadgeGroup.children, true);
      const cellBadge = pickCellBadge(badgeIntersects);
      if (cellBadge) {
        selectedCellKeys.clear();
        selectedCellKeys.add(cellBadge.userData.cellKey);
        cellKeyword = "";
        cellMultiSearchInput.value = "";
        rebuildCellFilterOptions();
        selectNode(null);
        applyFilters();
        return;
      }
    }
    selectNode(null);
  }
}

function selectNode(mesh) {
  selectedMesh = mesh;
  if (mesh && infoHidden) setInfoHidden(false);
  refreshNeighborHighlights();
  refreshNodeStyles();
  renderModelDetails();
}

function renderModelDetails() {
  const t = UI_TEXT[uiLanguage];
  const axisText = AXIS_TEXT_BY_LANG[uiLanguage];

  if (!selectedMesh) {
    modelContent.textContent = t.modelPanelEmpty;
    updateDetailBulkActionButtons();
    return;
  }

  const model = selectedMesh.userData.model;
  const xKey = getXBucketValue(model.x);
  const spaceCell = getCellShortLabel(selectedMesh.userData.cellKey);
  const displayName = getModelLabel(model);
  const categoryText = t.categoryLabels[model.category] ?? model.category;
  const neighborText = neighborMeshes.map((m) => getModelLabel(m.userData.model)).join(" / ") || t.detailNone;
  const xAxisText = toAxisSingleLine(axisText.x[xKey]);
  const yAxisText = toAxisSingleLine(axisText.y[String(model.y)]);
  const zAxisText = toAxisSingleLine(axisText.z[String(model.z)]);
  const descriptionText = uiLanguage === "en" ? (model.descriptionEn ?? model.description) : model.description;
  const tags = uiLanguage === "en" ? (model.tagsEn ?? model.tags) : model.tags;
  const evaluation = model.evaluation || null;
  const referencePayload = buildModelReferencePayload(model, t);
  const evidencePackKey = evaluation?.evidencePack || "-";
  const evidenceSources = window.MODEL_EVIDENCE_PACKS?.[evidencePackKey] || "-";
  const stageA = evaluation?.stageA || "";
  const stageAText = stageA === "纳入"
    ? t.stageAAdmitted
    : stageA === "观察池"
      ? t.stageAObserving
      : stageA === "不纳入"
        ? t.stageARejected
        : stageA || "-";
  const stageAClass = stageA === "纳入"
    ? "status-admitted"
    : stageA === "观察池"
      ? "status-observing"
      : stageA === "不纳入"
        ? "status-rejected"
        : "";

  const overviewRows = [
    { label: t.detailCategory, value: categoryText },
    { label: t.detailCell, value: spaceCell },
    { label: t.detailNeighbor, value: neighborText },
    { label: t.detailX, value: xAxisText },
    { label: t.detailY, value: yAxisText },
    { label: t.detailZ, value: zAxisText }
  ];
  if (detailTechnicalViewEnabled) {
    overviewRows.push({
      label: t.detailCoord,
      value: `(${model.x}, ${model.y}, ${model.z})`
    });
  }

  const judgementRows = [];
  const appendJudgementRow = (label, value, allowDash = false) => {
    const text = String(value ?? "").trim();
    if (!allowDash && (!text || text === "-")) return;
    judgementRows.push({ label, value: text || "-" });
  };
  appendJudgementRow(t.judgementAxisX, `${xAxisText} · ${t.axisRationaleX[xKey]}`, true);
  appendJudgementRow(t.judgementAxisY, `${yAxisText} · ${t.axisRationaleY[String(model.y)]}`, true);
  appendJudgementRow(t.judgementAxisZ, `${zAxisText} · ${t.axisRationaleZ[String(model.z)]}`, true);
  appendJudgementRow(t.judgementGates, evaluation?.gates || "-");
  appendJudgementRow(t.judgementReason, evaluation?.reason || "-");

  if (detailTechnicalViewEnabled) {
    appendJudgementRow(t.judgementEvidencePack, evidencePackKey);
    appendJudgementRow(t.judgementEvidenceSources, evidenceSources);
    appendJudgementRow(t.judgementStandardVersion, evaluation?.standardVersion || "-");
    appendJudgementRow(t.judgementEvaluatedAt, evaluation?.evaluatedAt || "-");
  }

  renderModelDetailsContent(modelContent, {
    displayName,
    overviewTitle: t.detailOverviewTitle,
    overviewRows,
    descriptionTitle: t.detailDefinitionTitle,
    descriptionText,
    tagsTitle: t.detailTagsTitle,
    tags,
    detailNoneText: t.detailNone,
    sectionEmptyText: t.referencesNone,
    judgementTitle: t.judgementCardTitle,
    judgementStatus: `${t.judgementStatus}: ${stageAText}`,
    judgementStatusClass: stageAClass,
    judgementRows,
    referenceTitle: referencePayload.title,
    referenceSections: referencePayload.sections,
    referenceLinks: referencePayload.links
  });
  updateDetailBulkActionButtons();
}

function fitCameraToCognitiveSpace() {
  const xBand = computeGridBands([-1, 0, 1].map((x) => x * SCALE.x), SCALE.x);
  const yBand = computeGridBands([1, 2, 3, 4].map((y) => toWorldY(y)), SCALE.y);
  const zBand = computeGridBands([1, 2, 3, 4].map((z) => toWorldZ(z)), SCALE.z);
  const padding = 12;
  const bounds = new THREE.Box3(
    new THREE.Vector3(xBand.min - padding, yBand.min - padding, zBand.min - padding),
    new THREE.Vector3(xBand.max + padding, yBand.max + padding, zBand.max + padding)
  );

  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const fov = THREE.MathUtils.degToRad(camera.fov);
  const distanceForHeight = size.y / (2 * Math.tan(fov / 2));
  const distanceForWidth = size.x / (2 * Math.tan(fov / 2) * camera.aspect);
  const distance = Math.max(distanceForHeight, distanceForWidth) + size.z * 0.58;

  baseCameraCenter.copy(center);
  baseCameraDistance = distance;
  controls.minDistance = Math.max(28, distance * 0.45);
  controls.maxDistance = distance * 3.8;
  camera.near = 0.1;
  camera.far = Math.max(1000, distance * 10);
  camera.updateProjectionMatrix();
  focusCameraOnView(activeCameraView, { keepSelection: true });
}

function updatePointer(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function showTooltip(x, y, text) {
  tooltip.textContent = text;
  tooltip.style.transform = `translate3d(${x + 14}px, ${y + 12}px, 0)`;
}

function pickModelMesh(intersections) {
  for (const item of intersections) {
    let node = item.object;
    while (node && (!node.userData || !node.userData.model)) {
      node = node.parent;
    }
    if (node && node.userData && node.userData.model) return node;
  }
  return null;
}

function pickCellBadge(intersections) {
  for (const item of intersections) {
    let node = item.object;
    while (node && (!node.userData || !node.userData.isCellBadge)) {
      node = node.parent;
    }
    if (node && node.userData && node.userData.isCellBadge) return node;
  }
  return null;
}

function hideTooltip() {
  tooltip.style.transform = "translate3d(-9999px, -9999px, 0)";
}

function setToolbarHidden(hidden) {
  toolbarHidden = hidden;
  document.body.classList.toggle("toolbar-hidden", hidden);
  controlsPanel?.setAttribute("aria-hidden", hidden ? "true" : "false");
  toolbarToggleBtn.textContent = hidden ? getUIText("showToolbarText") : getUIText("hideToolbarText");
}

function setInfoHidden(hidden) {
  infoHidden = hidden;
  document.body.classList.toggle("info-hidden", hidden);
  infoPanel?.setAttribute("aria-hidden", hidden ? "true" : "false");
  detailToggleBtn.textContent = hidden ? getUIText("showDetailsText") : getUIText("hideDetailsText");
}

function updateFullscreenButton() {
  const fullscreenActive = Boolean(document.fullscreenElement);
  fullscreenToggleBtn.textContent = fullscreenActive
    ? getUIText("exitFullscreenText")
    : getUIText("enterFullscreenText");
}

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen();
    }
  } catch (error) {
    console.error("Fullscreen toggle failed:", error);
  } finally {
    updateFullscreenButton();
  }
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  fitCameraToCognitiveSpace();
}

function refreshNodeStylesIfCameraMoved() {
  const movedDistance = camera.position.distanceTo(lastCameraPosition);
  if (movedDistance < 0.03) return;
  lastCameraPosition.copy(camera.position);
  refreshNodeStyles();
}

function animate() {
  requestAnimationFrame(animate);

  controls.update();
  refreshNodeStylesIfCameraMoved();
  renderer.render(scene, camera);
}
