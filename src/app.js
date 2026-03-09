import * as THREE from "three";
import { AXIS_TEXT_BY_LANG, UI_TEXT } from "./app3d/i18n.js";
import {
  clearGroup,
  computeGridBands,
  createCellOffsets,
  createSceneContext,
  createRenderLoop,
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
  createFilterSelectionState,
  createViewUiState,
  createCameraViewDirections
} from "./app3d/state.js";
import {
  getDetailSectionSummary,
  persistDetailSections,
  renderCellFocusContent,
  renderModelDetailsContent,
  setAllDetailSectionsExpanded,
  renderValidationPanelContent
} from "./app3d/ui.js";
import {
  resolvePanelElements,
  setToolbarHidden as setToolbarHiddenPanel,
  setInfoHidden as setInfoHiddenPanel
} from "./app3d/panels.js";
import { bindAppInteractionEvents } from "./app3d/interaction.js";
import { createExportService } from "./app3d/export.js";
import { parseUrlStateFromQuery, createUrlStateController } from "./app3d/url-state.js";
import { createDetailOrchestrator } from "./app3d/details.js";
import {
  buildModelData,
  createAdmittedModelData,
  createRelationIndex,
  CATEGORY_COLOR_MAP as categoryColorMap,
  CATEGORY_ORDER,
  TYPICAL_MODEL_PRIORITY
} from "./domain/model-data.js";

const relationIndexByName = createRelationIndex(window.COGNITIVE_ATLAS_RELATIONS || []);
const sourceLibrary = window.COGNITIVE_ATLAS_OBJECTS || window.MODEL_LIBRARY_ROWS;

window.ModelLayout = {
  buildModelData(source = sourceLibrary) {
    return buildModelData(source, window.MODEL_EVALUATION_BY_NAME, { relationIndexByName });
  }
};

const allModelData = buildModelData(
  sourceLibrary,
  window.MODEL_EVALUATION_BY_NAME,
  { relationIndexByName }
);

const modelData = createAdmittedModelData(
  sourceLibrary,
  window.MODEL_EVALUATION_BY_NAME,
  { relationIndexByName }
);

const SCALE = { x: 11, y: 11, z: 11 };
const SEMANTIC_ORIGIN = { x: 3, y: 3, z: 3 };
const NEIGHBOR_COUNT = 2;
const MAX_LINKS_PER_NODE = 2;

const VISUAL_CONFIG = {
  nodeRadius: 1.28,
  tubeRadius: 0.1,
  axisEndpointRadius: 0.5,
  axisOriginRadius: 0.42,
  axisTubeEmissiveIntensity: 0.68,
  axisEndpointEmissiveIntensity: 0.72,
  exportCropMargin: 10,
  exportAxisLabelScale: 1.25,
  exportPixelRatio: 3,
  overviewCompactLabelLimit: 14,
  overviewCompactLabelMaxDistance: 140
};

const panels = resolvePanelElements(document);
const {
  modelMultiSearchInput,
  modelMultiSummary,
  modelMultiList,
  modelMultiSelectVisibleBtn,
  modelMultiSelectAllBtn,
  modelMultiClearBtn,
  modelMultiExpandGroupsBtn,
  modelMultiCollapseGroupsBtn,
  cellMultiSearchInput,
  cellMultiSummary,
  cellMultiList,
  cellMultiSelectVisibleBtn,
  cellMultiSelectAllBtn,
  cellMultiClearBtn,
  controlsPanel,
  infoPanel,
  linkToggle,
  pyramidToggle,
  neighborToggle,
  exportModeSelect,
  exportModeLabel,
  exportModeFullOption,
  exportModeViewportOption,
  toolbarToggleBtn,
  detailToggleBtn,
  shareCopyBtn,
  exportImageBtn,
  exportPosterBtn,
  exportDouyinCardBtn,
  fullscreenToggleBtn,
  scopeStatus,
  dockAdvancedSummary,
  toolbarMoreSummary,
  detailAdvancedSummary,
  dockExpandBtn,
  viewDock,
  overviewModeBtn,
  viewResetBtn,
  viewPromoBtn,
  viewXAxisBtn,
  viewYAxisBtn,
  viewZAxisBtn,
  tooltip,
  modelContent,
  appTitle,
  appSubtitle,
  aboutCardSummary,
  aboutWhat,
  aboutAxesIntro,
  aboutAxisXShort,
  aboutAxisYShort,
  aboutAxisZShort,
  aboutWho,
  modelMultiLabel,
  cellFilterLabel,
  linkToggleText,
  gridToggleText,
  neighborToggleText,
  visualSwitchTitle,
  legendText,
  validationPanel,
  modelPanelTitle,
  detailCoordToggleBtn,
  detailExpandAllBtn,
  detailCollapseAllBtn,
  languageFinderText,
  tabModelsBtn,
  tabCellsBtn,
  tabVisualBtn,
  toolbarTabButtons,
  toolbarTabPanels,
  quickLangButtons
} = panels;

const filterSelectionState = createFilterSelectionState(modelData);
const viewUiState = createViewUiState({ defaultLanguage: "zh", three: THREE });
const CAMERA_VIEW_DIRECTIONS = createCameraViewDirections(THREE);
const initialUrlState = parseUrlStateFromQuery(window.location.search);

const overlayEl = document.getElementById("overlay");
const { scene, renderer, camera, controls, groups } = createSceneContext(THREE, {
  container: document.body,
  insertBefore: overlayEl || undefined,
  width: window.innerWidth,
  height: window.innerHeight
});
const { axisGroup, nodesGroup, linksGroup, pyramidGroup, neighborLineGroup, cellBadgeGroup } = groups;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const lastPointerClient = { x: 0, y: 0 };
const lastCameraPosition = new THREE.Vector3(Number.NaN, Number.NaN, Number.NaN);
const nodeMeshes = [];
const modelMeshByName = new Map();
let visibleNodeMeshes = [];
let queuedPointerEvent = null;
let pointerFrameQueued = false;
const { getExportDataUrl, exportCanvasImage, exportPosterImage, exportDouyinCard } = createExportService({
  renderer,
  camera,
  scene,
  axisGroup,
  computeGridBands,
  scale: SCALE,
  toWorldX,
  toWorldY,
  toWorldZ,
  visualConfig: VISUAL_CONFIG
});
const urlStateController = createUrlStateController({
  windowRef: window,
  cameraViewDirections: CAMERA_VIEW_DIRECTIONS,
  modelData,
  modelMeshByName,
  filterSelectionState,
  viewUiState,
  linkToggle,
  pyramidToggle,
  neighborToggle,
  modelMultiSearchInput,
  cellMultiSearchInput,
  setToolbarHidden,
  setInfoHidden,
  setActiveToolbarTab,
  applyUILanguage,
  rebuildCellFilterOptions,
  applyFilters,
  focusCameraOnView,
  sortCellKey
});
const detailOrchestrator = createDetailOrchestrator({
  windowRef: window,
  modelContent,
  modelData,
  nodeMeshes,
  filterSelectionState,
  viewUiState,
  uiTextByLang: UI_TEXT,
  axisTextByLang: AXIS_TEXT_BY_LANG,
  renderModelDetailsContent,
  renderCellFocusContent,
  getVisibleModelsByCellKey,
  chooseTypicalModel,
  getModelLabel,
  getCellShortLabel,
  getXBucketValue,
  toAxisSingleLine,
  buildModelReferencePayload,
  updateDetailBulkActionButtons
});
const renderModelDetails = () => {
  detailOrchestrator.renderModelDetails();
};

buildNodes();

const isMobile = window.matchMedia("(max-width: 768px)").matches;
const isEmbedMode = new URLSearchParams(window.location.search).has("embed");
const isSimpleMode = new URLSearchParams(window.location.search).has("simple") || isMobile;
if (isEmbedMode) {
  document.body.classList.add("embed-mode");
}
if (isSimpleMode) {
  document.body.classList.add("simple-mode");
  viewUiState.toolbarHidden = true;
  viewUiState.infoHidden = true;
  setToolbarHidden(true);
  setInfoHidden(true);
}

applyUILanguage();
urlStateController.applyUrlState(initialUrlState);

if (initialUrlState.landingModel && modelMeshByName.has(initialUrlState.landingModel)) {
  const mesh = modelMeshByName.get(initialUrlState.landingModel);
  selectNode(mesh);
  urlStateController.syncUrlState();
}

rebuildLinks();

bindAppInteractionEvents({
  elements: {
    linkToggle,
    pyramidToggle,
    neighborToggle,
    modelMultiSearchInput,
    modelMultiSelectVisibleBtn,
    modelMultiSelectAllBtn,
    modelMultiClearBtn,
    modelMultiExpandGroupsBtn,
    modelMultiCollapseGroupsBtn,
    cellMultiSearchInput,
    cellMultiSelectVisibleBtn,
    cellMultiSelectAllBtn,
    cellMultiClearBtn,
    quickLangButtons,
    toolbarTabButtons,
    toolbarToggleBtn,
    detailToggleBtn,
    detailCoordToggleBtn,
    detailExpandAllBtn,
    detailCollapseAllBtn,
  shareCopyBtn,
  exportImageBtn,
  exportPosterBtn,
  exportDouyinCardBtn,
  fullscreenToggleBtn,
    dockExpandBtn,
    overviewModeBtn,
    viewResetBtn,
    viewPromoBtn,
    viewXAxisBtn,
    viewYAxisBtn,
    viewZAxisBtn,
    modelContent
  },
  callbacks: {
    onLinkToggleChange: () => {
      rebuildLinks();
      urlStateController.syncUrlState();
    },
    onPyramidToggleChange: () => {
      pyramidGroup.visible = pyramidToggle.checked;
      urlStateController.syncUrlState();
    },
    onNeighborToggleChange: () => {
      refreshNeighborHighlights();
      refreshNodeStyles();
      urlStateController.syncUrlState();
    },
    onModelSearchInput: (event) => {
      filterSelectionState.keyword = event.target.value.trim().toLowerCase();
      applyFilters();
    },
    onModelSelectVisible: () => {
      const candidates = getKeywordMatchedModels();
      candidates.forEach((model) => filterSelectionState.selectedModelNames.add(model.name));
      refreshModelMultiChecks();
      applyFilters();
    },
    onModelExpandGroups: () => {
      CATEGORY_ORDER.forEach((category) => {
        filterSelectionState.collapsedModelCategories.set(category, false);
      });
      rebuildModelMultiList();
    },
    onModelCollapseGroups: () => {
      CATEGORY_ORDER.forEach((category) => {
        filterSelectionState.collapsedModelCategories.set(category, true);
      });
      rebuildModelMultiList();
    },
    onModelSelectAll: () => {
      filterSelectionState.selectedModelNames.clear();
      modelData.forEach((model) => filterSelectionState.selectedModelNames.add(model.name));
      refreshModelMultiChecks();
      applyFilters();
    },
    onModelClear: () => {
      filterSelectionState.keyword = "";
      filterSelectionState.selectedModelNames.clear();
      modelData.forEach((m) => filterSelectionState.selectedModelNames.add(m.name));
      if (modelMultiSearchInput) modelMultiSearchInput.value = "";
      applyFilters();
    },
    onCellSearchInput: (event) => {
      filterSelectionState.cellKeyword = event.target.value.trim().toLowerCase();
      rebuildCellFilterOptions();
      applyFilters();
    },
    onCellSelectVisible: () => {
      getKeywordMatchedCellEntries().forEach((entry) => filterSelectionState.selectedCellKeys.add(entry.key));
      rebuildCellFilterOptions();
      applyFilters();
    },
    onCellSelectAll: () => {
      filterSelectionState.selectedCellKeys.clear();
      filterSelectionState.allCellKeys.forEach((key) => filterSelectionState.selectedCellKeys.add(key));
      rebuildCellFilterOptions();
      applyFilters();
    },
    onCellClear: () => {
      filterSelectionState.selectedCellKeys.clear();
      rebuildCellFilterOptions();
      applyFilters();
    },
    onLanguageSelect: (nextLang) => {
      if (!nextLang || nextLang === viewUiState.uiLanguage) return;
      viewUiState.uiLanguage = nextLang;
      applyUILanguage();
    },
    onToolbarTabSelect: (nextTab) => {
      if (!nextTab) return;
      setActiveToolbarTab(nextTab);
    },
    onToolbarToggle: () => {
      setToolbarHidden(!viewUiState.toolbarHidden);
      urlStateController.syncUrlState();
    },
    onDetailToggle: () => {
      setInfoHidden(!viewUiState.infoHidden);
      urlStateController.syncUrlState();
    },
    onDetailCoordToggle: () => {
      viewUiState.detailTechnicalViewEnabled = !viewUiState.detailTechnicalViewEnabled;
      updateDetailCoordToggleButton();
      renderModelDetails();
    },
    onDetailExpandAll: () => {
      const count = setAllDetailSectionsExpanded(modelContent, true);
      if (count > 0) updateDetailBulkActionButtons();
    },
    onDetailCollapseAll: () => {
      const count = setAllDetailSectionsExpanded(modelContent, false);
      if (count > 0) updateDetailBulkActionButtons();
    },
    onShareCopy: async () => {
      const url = urlStateController.buildShareUrl(true);
      try {
        await navigator.clipboard.writeText(url);
        const rect = shareCopyBtn?.getBoundingClientRect();
        const x = rect ? rect.left + rect.width / 2 : lastPointerClient.x;
        const y = rect ? rect.top - 8 : lastPointerClient.y;
        showTooltip(x, y, getUIText("copyShareSuccessText"));
        setTimeout(() => hideTooltip(), 1500);
      } catch {
        const rect = shareCopyBtn?.getBoundingClientRect();
        const x = rect ? rect.left + rect.width / 2 : lastPointerClient.x;
        const y = rect ? rect.top - 8 : lastPointerClient.y;
        showTooltip(x, y, "Copy failed");
        setTimeout(() => hideTooltip(), 1500);
      }
    },
    onExportImage: () => {
      const mode = exportModeSelect?.value === "viewport" ? "viewport" : "full";
      const targetBox = getFocusedBox();
      exportCanvasImage(buildExportFileName(), { mode, targetBox });
    },
    onExportPoster: () => {
      const t = UI_TEXT[viewUiState.uiLanguage];
      const targetBox = getFocusedBox();
      exportPosterImage({ title: t.appTitle, subtitle: t.appSubtitle, targetBox });
    },
    onExportDouyinCard: () => {
      const mesh = viewUiState.selectedMesh;
      if (!mesh?.userData?.model) return;
      exportDouyinCard(mesh.userData.model);
    },
    onFullscreenToggle: () => {
      toggleFullscreen();
    },
    onDockExpand: () => {
      viewDock?.classList.toggle("dock-expanded");
    },
    onOverviewMode: () => {
      enterOverviewMode({ resetCamera: true });
      urlStateController.syncUrlState();
    },
    onViewReset: () => {
      enterOverviewMode({ resetCamera: true });
      urlStateController.syncUrlState();
    },
    onViewPromo: () => {
      focusCameraOnView("promo");
    },
    onViewXAxis: () => {
      focusCameraOnView("x");
    },
    onViewYAxis: () => {
      focusCameraOnView("y");
    },
    onViewZAxis: () => {
      focusCameraOnView("z");
    },
    onFullscreenChange: updateFullscreenButton,
    onDetailSectionsChange: () => {
      persistDetailSections(modelContent);
      updateDetailBulkActionButtons();
    },
    onModelContentClick: (event) => {
      if (!(event.target instanceof Element)) return;
      const actionButton = event.target.closest("[data-model-name]");
      if (!(actionButton instanceof HTMLElement)) return;
      const modelName = actionButton.dataset.modelName;
      if (!modelName) return;
      focusModelByName(modelName);
    },
    onWindowPointerMove: queuePointerMove,
    onWindowClick: onSceneClick,
    onWindowResize: onResize
  }
});

if (typeof window !== "undefined") {
  window.__getPromoExportDataUrl = getExportDataUrl;
  window.__focusModelByName = focusModelByName;
}

createRenderLoop({
  renderer,
  scene,
  camera,
  controls,
  onFrame: refreshNodeStylesIfCameraMoved
})();

function getUIText(key) {
  return UI_TEXT[viewUiState.uiLanguage][key];
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
  const availableTabs = [...toolbarTabButtons]
    .map((button) => button.dataset.toolbarTab)
    .filter(Boolean);
  const fallbackTab = availableTabs[0] || "models";
  const nextTab = availableTabs.includes(tabName) ? tabName : fallbackTab;
  viewUiState.activeToolbarTab = nextTab;
  toolbarTabButtons.forEach((button) => {
    const isActive = button.dataset.toolbarTab === nextTab;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", isActive ? "true" : "false");
  });
  toolbarTabPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.toolbarPanel === nextTab);
  });
  urlStateController.syncUrlState();
}

function updateScopeStatus() {
  if (!scopeStatus) return;
  const t = UI_TEXT[viewUiState.uiLanguage];
  let value = t.scopeStatusOverview;

  if (viewUiState.selectedMesh?.userData?.model) {
    value = `${t.scopeStatusModel}: ${viewUiState.selectedMesh.userData.model.name}`;
  } else {
    const activeCellKey = viewUiState.focusedCell
      || (filterSelectionState.selectedCellKeys.size === 1 ? [...filterSelectionState.selectedCellKeys][0] : null);
    if (activeCellKey) {
      value = `${t.scopeStatusCell}: ${getCellShortLabel(activeCellKey)}`;
    }
  }

  scopeStatus.textContent = `${t.scopeStatusLabel}: ${value}`;
}

function isOverviewMode() {
  return viewUiState.visibilityMode === "overview"
    && isAllCellsSelected()
    && filterSelectionState.selectedModelNames.size === modelData.length
    && filterSelectionState.keyword.length === 0
    && filterSelectionState.cellKeyword.length === 0;
}

function updateViewControlsState() {
  if (exportDouyinCardBtn) {
    exportDouyinCardBtn.disabled = !viewUiState.selectedMesh?.userData?.model;
  }
  const overviewActive = isOverviewMode();
  if (overviewModeBtn) {
    overviewModeBtn.classList.toggle("active", overviewActive);
    overviewModeBtn.classList.toggle("focus-exit-hint", !overviewActive);
    overviewModeBtn.setAttribute("aria-pressed", overviewActive ? "true" : "false");
  }

  const cameraButtonByKey = {
    default: viewResetBtn,
    promo: viewPromoBtn,
    x: viewXAxisBtn,
    y: viewYAxisBtn,
    z: viewZAxisBtn
  };
  Object.entries(cameraButtonByKey).forEach(([key, button]) => {
    if (!button) return;
    const isActive = viewUiState.activeCameraView === key;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function focusCameraOnView(viewKey, options = {}) {
  const { keepSelection = false } = options;
  const nextView = CAMERA_VIEW_DIRECTIONS[viewKey] ? viewKey : "default";
  viewUiState.activeCameraView = nextView;
  const direction = CAMERA_VIEW_DIRECTIONS[nextView];
  controls.target.copy(viewUiState.baseCameraCenter);
  camera.position.copy(viewUiState.baseCameraCenter).addScaledVector(direction, viewUiState.baseCameraDistance);
  controls.update();
  if (!keepSelection) {
    viewUiState.hoveredMesh = null;
    hideTooltip();
  }
  refreshNodeStyles();
  updateViewControlsState();
  urlStateController.syncUrlState();
}

function enterOverviewMode(options = {}) {
  const { resetCamera = false } = options;

  filterSelectionState.keyword = "";
  filterSelectionState.cellKeyword = "";
  if (modelMultiSearchInput) modelMultiSearchInput.value = "";
  if (cellMultiSearchInput) cellMultiSearchInput.value = "";
  filterSelectionState.selectedModelNames.clear();
  modelData.forEach((model) => filterSelectionState.selectedModelNames.add(model.name));
  filterSelectionState.selectedCellKeys.clear();
  filterSelectionState.allCellKeys.forEach((key) => filterSelectionState.selectedCellKeys.add(key));
  selectNode(null);
  rebuildModelMultiList();
  rebuildCellFilterOptions();
  applyFilters();
  updateScopeStatus();

  if (resetCamera) focusCameraOnView("default");
}

function enterCellFocus(cellKey) {
  viewUiState.visibilityMode = "focus";
  viewUiState.focusedCell = cellKey;
  viewUiState.selectedMesh = null;
  rebuildLinks();
  refreshNeighborHighlights();
  refreshNodeStyles();
  renderModelDetails();
  updateScopeStatus();
}

function toWorldX(xLevel) {
  const centeredLevel = xLevel - SEMANTIC_ORIGIN.x;
  return centeredLevel * SCALE.x;
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
  return viewUiState.uiLanguage === "en" ? (model.aliasEn ?? model.aliasZh ?? "") : (model.aliasZh ?? model.aliasEn ?? "");
}

function getModelLabel(model) {
  const annotation = getModelAnnotation(model);
  return annotation ? `${model.name} (${annotation})` : model.name;
}

function createNodeLabelSprite(model) {
  const annotation = getModelAnnotation(model);
  const labelText = annotation ? `${model.name}\n${annotation}` : model.name;
  return createTextSprite(labelText, {
    fontSize: 22,
    lineHeight: 26,
    paddingX: 12,
    paddingY: 8,
    background: "rgba(8, 15, 30, 0.68)",
    border: "rgba(143, 183, 255, 0.45)",
    textColor: "rgba(233, 243, 255, 0.95)",
    scaleFactor: 0.026,
    radius: 8
  });
}

function createCompactNodeLabelSprite(model) {
  return createTextSprite(shortenModelName(model.name, 15), {
    fontSize: 17,
    lineHeight: 21,
    paddingX: 9,
    paddingY: 6,
    background: "rgba(8, 15, 30, 0.58)",
    border: "rgba(143, 183, 255, 0.38)",
    textColor: "rgba(235, 244, 255, 0.93)",
    scaleFactor: 0.02,
    radius: 7
  });
}

function buildNodes() {
  const geometry = new THREE.SphereGeometry(VISUAL_CONFIG.nodeRadius, 28, 28);
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
      roughness: 0.32,
      metalness: 0.22,
      emissive: new THREE.Color(baseColor).multiplyScalar(0.15),
      emissiveIntensity: 0.28
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

    nodesGroup.add(mesh);
    nodeMeshes.push(mesh);
    modelMeshByName.set(item.name, mesh);
  }
}

function getXBucketValue(x) {
  return String(Number(x));
}

function getCellCenter(cellKey) {
  const [xKey, yKey, zKey] = cellKey.split("|");
  return new THREE.Vector3(toWorldX(Number(xKey)), toWorldY(Number(yKey)), toWorldZ(Number(zKey)));
}

function getModelMultiSummaryText() {
  const t = UI_TEXT[viewUiState.uiLanguage];
  if (filterSelectionState.selectedModelNames.size === modelData.length) return t.modelMultiSummaryAll;
  if (filterSelectionState.selectedModelNames.size === 0) return t.modelMultiSummaryNone;
  const count = filterSelectionState.selectedModelNames.size;
  const unit = count === 1 && t.cellCountUnitSingular ? t.cellCountUnitSingular : t.cellCountUnit;
  if (viewUiState.uiLanguage === "zh") return `${t.modelMultiSummarySelected}：${count} ${unit}`;
  return `${t.modelMultiSummarySelected}: ${count} ${unit}`;
}

function getKeywordMatchedModels() {
  if (!filterSelectionState.keyword) return [...modelData];
  return modelData.filter((model) => getModelSearchText(model).includes(filterSelectionState.keyword));
}

function rebuildModelMultiList() {
  if (!modelMultiList) return;
  modelMultiList.innerHTML = "";
  const t = UI_TEXT[viewUiState.uiLanguage];
  const matched = getKeywordMatchedModels();
  if (!matched.length) {
    const empty = document.createElement("div");
    empty.className = "model-multi-empty";
    empty.textContent = t.modelMultiNoResult;
    modelMultiList.appendChild(empty);
  }

  const grouped = new Map();
  CATEGORY_ORDER.forEach((category) => grouped.set(category, []));
  matched.forEach((model) => {
    if (!grouped.has(model.category)) grouped.set(model.category, []);
    grouped.get(model.category).push(model);
  });

  const extraCategories = [...grouped.keys()]
    .filter((category) => !CATEGORY_ORDER.includes(category))
    .sort((a, b) => a.localeCompare(b));
  const categoriesToRender = [
    ...CATEGORY_ORDER.filter((category) => grouped.get(category)?.length > 0),
    ...extraCategories.filter((category) => grouped.get(category)?.length > 0)
  ];
  const forceExpand = Boolean(filterSelectionState.keyword);

  for (const category of categoriesToRender) {
    const categoryModels = grouped.get(category) || [];
    if (!filterSelectionState.collapsedModelCategories.has(category)) {
      filterSelectionState.collapsedModelCategories.set(category, true);
    }
    const collapsed = forceExpand ? false : filterSelectionState.collapsedModelCategories.get(category) !== false;
    const selectedCount = categoryModels
      .filter((model) => filterSelectionState.selectedModelNames.has(model.name))
      .length;

    const groupSection = document.createElement("section");
    groupSection.className = `model-group ${collapsed ? "collapsed" : ""}`.trim();

    const groupToggle = document.createElement("button");
    groupToggle.type = "button";
    groupToggle.className = "model-group-toggle";
    groupToggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
    groupToggle.title = collapsed ? t.modelMultiGroupExpandTitle : t.modelMultiGroupCollapseTitle;
    groupToggle.addEventListener("click", () => {
      const nextCollapsed = !filterSelectionState.collapsedModelCategories.get(category);
      filterSelectionState.collapsedModelCategories.set(category, nextCollapsed);
      rebuildModelMultiList();
    });

    const groupTitle = document.createElement("span");
    groupTitle.className = "model-group-title";
    groupTitle.textContent = t.categoryLabels[category] ?? category;

    const groupSummary = document.createElement("span");
    groupSummary.className = "model-group-summary";
    groupSummary.textContent = `${t.modelMultiGroupSelected} ${selectedCount}/${categoryModels.length}`;

    groupToggle.append(groupTitle, groupSummary);
    groupSection.appendChild(groupToggle);

    const groupContent = document.createElement("div");
    groupContent.className = "model-group-content";
    categoryModels.forEach((model) => {
      const tag = document.createElement("button");
      tag.type = "button";
      tag.className = `filter-tag ${filterSelectionState.selectedModelNames.has(model.name) ? "active" : ""}`;
      tag.textContent = model.name;
      tag.title = getModelLabel(model);
      tag.setAttribute("aria-pressed", filterSelectionState.selectedModelNames.has(model.name) ? "true" : "false");
      tag.addEventListener("click", () => {
        if (filterSelectionState.selectedModelNames.has(model.name)) {
          filterSelectionState.selectedModelNames.delete(model.name);
        } else {
          filterSelectionState.selectedModelNames.add(model.name);
        }
        rebuildModelMultiList();
        applyFilters();
      });
      groupContent.appendChild(tag);
    });
    groupSection.appendChild(groupContent);
    modelMultiList.appendChild(groupSection);
  }
  if (modelMultiSummary) modelMultiSummary.textContent = getModelMultiSummaryText();
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
  const axisText = AXIS_TEXT_BY_LANG[viewUiState.uiLanguage];
  const xText = toAxisSingleLine(axisText.x[xKey]);
  const yText = toAxisSingleLine(axisText.y[yKey]);
  const zText = toAxisSingleLine(axisText.z[zKey]);
  const typicalModel = chooseTypicalModel(stats.models);
  const typicalName = typicalModel ? typicalModel.name : "-";
  const t = UI_TEXT[viewUiState.uiLanguage];

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
  const toolLayerCount = modelData.filter((model) => model.objectType === "Tool").length;
  const admittedUniverse = allModelData.filter((model) => model?.evaluation?.stageA !== "不纳入");
  const unclassifiedCount = admittedUniverse
    .filter((model) => model?.atlasV2?.classificationStatus !== "classified")
    .length;
  const filledCells = stats.size;
  const denseCells = [...stats.values()].filter((cellStats) => cellStats.count >= 2).length;
  const denseRatio = filledCells > 0 ? denseCells / filledCells : 0;
  const topCells = [...stats.entries()]
    .sort((a, b) => b[1].count - a[1].count || sortCellKey(a[0], b[0]))
    .slice(0, 3);

  return {
    toolLayerCount,
    admittedCount: admittedUniverse.length,
    unclassifiedCount,
    filledCells,
    denseCells,
    denseRatio,
    topCells,
    evalSummary: window.MODEL_EVALUATION_SUMMARY || null
  };
}

function renderValidationPanel() {
  if (!validationPanel) return;
  const t = UI_TEXT[viewUiState.uiLanguage];
  const snapshot = buildValidationSnapshot();
  renderValidationPanelContent(validationPanel, t, snapshot, getCellShortLabel);
}

function getCellShortLabel(cellKey) {
  const [xKey, yKey, zKey] = cellKey.split("|");
  const axisText = AXIS_TEXT_BY_LANG[viewUiState.uiLanguage];
  return `${toAxisSingleLine(axisText.x[xKey])} · ${toAxisSingleLine(axisText.y[yKey])} · ${toAxisSingleLine(axisText.z[zKey])}`;
}

function isAllCellsSelected() {
  return filterSelectionState.allCellKeys.length > 0
    && filterSelectionState.selectedCellKeys.size === filterSelectionState.allCellKeys.length;
}

function getCellMultiSummaryText() {
  const t = UI_TEXT[viewUiState.uiLanguage];
  if (isAllCellsSelected()) return t.cellMultiSummaryAll;
  if (filterSelectionState.selectedCellKeys.size === 0) return t.cellMultiSummaryNone;
  return `${t.cellMultiSummarySelected}: ${filterSelectionState.selectedCellKeys.size}`;
}

function getKeywordMatchedCellEntries() {
  if (!filterSelectionState.cellKeyword) return [...filterSelectionState.cellEntries];
  return filterSelectionState.cellEntries
    .filter((entry) => entry.label.toLowerCase().includes(filterSelectionState.cellKeyword));
}

function rebuildCellFilterOptions() {
  const t = UI_TEXT[viewUiState.uiLanguage];
  const stats = getCellStats(false);
  filterSelectionState.cellEntries = [...stats.entries()]
    .sort((a, b) => sortCellKey(a[0], b[0]))
    .map(([key, cellStats]) => ({
      key,
      stats: cellStats,
      label: makeCellLabel(key, cellStats)
    }));

  filterSelectionState.allCellKeys.length = 0;
  filterSelectionState.allCellKeys.push(...filterSelectionState.cellEntries.map((entry) => entry.key));

  if (!cellMultiList) {
    if (filterSelectionState.selectedCellKeys.size === 0 && filterSelectionState.allCellKeys.length > 0) {
      filterSelectionState.selectedCellKeys.clear();
      filterSelectionState.allCellKeys.forEach((key) => filterSelectionState.selectedCellKeys.add(key));
    }
    filterSelectionState.initializedCellSelection = true;
    return;
  }

  if (!filterSelectionState.initializedCellSelection) {
    filterSelectionState.selectedCellKeys.clear();
    filterSelectionState.allCellKeys.forEach((key) => filterSelectionState.selectedCellKeys.add(key));
    filterSelectionState.initializedCellSelection = true;
  } else {
    const validKeys = new Set(filterSelectionState.allCellKeys);
    [...filterSelectionState.selectedCellKeys].forEach((key) => {
      if (!validKeys.has(key)) filterSelectionState.selectedCellKeys.delete(key);
    });
  }

  cellMultiList.innerHTML = "";
  const matchedEntries = getKeywordMatchedCellEntries();
  if (!matchedEntries.length) {
    const empty = document.createElement("div");
    empty.className = "model-multi-empty";
    empty.textContent = t.cellMultiNoResult;
    cellMultiList.appendChild(empty);
  } else {
    for (const entry of matchedEntries) {
      const tag = document.createElement("button");
      tag.type = "button";
      tag.className = `filter-tag ${filterSelectionState.selectedCellKeys.has(entry.key) ? "active" : ""}`;
      tag.textContent = getCellShortLabel(entry.key);
      tag.title = entry.label;
      tag.setAttribute("aria-pressed", filterSelectionState.selectedCellKeys.has(entry.key) ? "true" : "false");
      tag.addEventListener("click", () => {
        if (filterSelectionState.selectedCellKeys.has(entry.key)) {
          filterSelectionState.selectedCellKeys.delete(entry.key);
        } else {
          filterSelectionState.selectedCellKeys.add(entry.key);
        }
        rebuildCellFilterOptions();
        applyFilters();
      });
      cellMultiList.appendChild(tag);
    }
  }
  if (cellMultiSummary) cellMultiSummary.textContent = getCellMultiSummaryText();
}

function rebuildCellBadges() {
  clearGroup(cellBadgeGroup);
  if (viewUiState.visibilityMode !== "overview") return;

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
  const t = UI_TEXT[viewUiState.uiLanguage];
  const htmlLang = viewUiState.uiLanguage === "en" ? "en" : "zh-CN";
  document.documentElement.lang = htmlLang;
  document.title = t.pageTitle;
  languageFinderText.textContent = "Language / 语言";
  quickLangButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.uiLang === viewUiState.uiLanguage);
  });

  appTitle.textContent = t.appTitle;
  appSubtitle.textContent = t.appSubtitle;
  if (aboutCardSummary) aboutCardSummary.textContent = t.aboutCardSummary;
  if (aboutWhat) aboutWhat.textContent = t.aboutWhat;
  if (aboutAxesIntro) aboutAxesIntro.textContent = t.aboutAxesIntro;
  if (aboutAxisXShort) aboutAxisXShort.textContent = t.aboutAxisXShort;
  if (aboutAxisYShort) aboutAxisYShort.textContent = t.aboutAxisYShort;
  if (aboutAxisZShort) aboutAxisZShort.textContent = t.aboutAxisZShort;
  if (aboutWho) aboutWho.textContent = t.aboutWho;
  if (tabModelsBtn) tabModelsBtn.textContent = t.toolbarTabModels;
  if (tabCellsBtn) tabCellsBtn.textContent = t.toolbarTabCells;
  if (tabVisualBtn) tabVisualBtn.textContent = t.toolbarTabVisual;
  if (modelMultiLabel) modelMultiLabel.textContent = t.modelMultiLabel;
  if (modelMultiSearchInput) modelMultiSearchInput.placeholder = t.modelMultiSearchPlaceholder;
  if (modelMultiSelectVisibleBtn) modelMultiSelectVisibleBtn.textContent = t.modelMultiSelectVisible;
  if (modelMultiSelectAllBtn) modelMultiSelectAllBtn.textContent = t.modelMultiSelectAll;
  if (modelMultiClearBtn) modelMultiClearBtn.textContent = t.modelMultiClear;
  if (modelMultiExpandGroupsBtn) modelMultiExpandGroupsBtn.textContent = t.modelMultiExpandGroups;
  if (modelMultiCollapseGroupsBtn) modelMultiCollapseGroupsBtn.textContent = t.modelMultiCollapseGroups;
  if (cellFilterLabel) cellFilterLabel.textContent = t.cellFilterLabel;
  if (cellMultiSearchInput) cellMultiSearchInput.placeholder = t.cellMultiSearchPlaceholder;
  if (cellMultiSelectVisibleBtn) cellMultiSelectVisibleBtn.textContent = t.cellMultiSelectVisible;
  if (cellMultiSelectAllBtn) cellMultiSelectAllBtn.textContent = t.cellMultiSelectAll;
  if (cellMultiClearBtn) cellMultiClearBtn.textContent = t.cellMultiClear;
  linkToggleText.textContent = t.linkToggleText;
  gridToggleText.textContent = t.gridToggleText;
  neighborToggleText.textContent = t.neighborToggleText;
  if (overviewModeBtn) overviewModeBtn.textContent = t.overviewModeText;
  if (viewResetBtn) viewResetBtn.textContent = t.viewResetText;
  if (viewPromoBtn) viewPromoBtn.textContent = t.viewPromoText;
  if (viewXAxisBtn) viewXAxisBtn.textContent = t.viewXAxisText;
  if (viewYAxisBtn) viewYAxisBtn.textContent = t.viewYAxisText;
  if (viewZAxisBtn) viewZAxisBtn.textContent = t.viewZAxisText;
  if (visualSwitchTitle) visualSwitchTitle.textContent = t.visualSwitchTitle;
  legendText.textContent = window.matchMedia("(max-width: 768px)").matches
    ? (t.legendTextMobile ?? t.legendText)
    : t.legendText;
  modelPanelTitle.textContent = t.modelPanelTitle;
  if (dockAdvancedSummary) dockAdvancedSummary.textContent = t.dockAdvancedSummary;
  if (toolbarMoreSummary) toolbarMoreSummary.textContent = t.toolbarAdvancedSummary;
  if (detailAdvancedSummary) detailAdvancedSummary.textContent = t.detailAdvancedSummary;
  updateDetailCoordToggleButton();
  if (detailExpandAllBtn) detailExpandAllBtn.textContent = t.detailExpandAllText;
  if (detailCollapseAllBtn) detailCollapseAllBtn.textContent = t.detailCollapseAllText;
  toolbarToggleBtn.textContent = viewUiState.toolbarHidden ? t.showToolbarText : t.hideToolbarText;
  detailToggleBtn.textContent = viewUiState.infoHidden ? t.showDetailsText : t.hideDetailsText;
  if (shareCopyBtn) shareCopyBtn.textContent = t.shareCopyText;
  if (exportImageBtn) exportImageBtn.textContent = t.exportImageText;
  if (exportPosterBtn) exportPosterBtn.textContent = t.exportPosterText;
  if (exportDouyinCardBtn) exportDouyinCardBtn.textContent = t.exportDouyinCardText;
  if (exportModeLabel) exportModeLabel.textContent = t.exportModeLabel;
  if (exportModeFullOption) exportModeFullOption.textContent = t.exportModeFull;
  if (exportModeViewportOption) exportModeViewportOption.textContent = t.exportModeViewport;
  setActiveToolbarTab(viewUiState.activeToolbarTab);
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
  updateScopeStatus();
  if (viewUiState.hoveredMesh) {
    showTooltip(lastPointerClient.x, lastPointerClient.y, getModelLabel(viewUiState.hoveredMesh.userData.model));
  }
  urlStateController.syncUrlState();
}

function updateDetailCoordToggleButton() {
  if (!detailCoordToggleBtn) return;
  const t = UI_TEXT[viewUiState.uiLanguage];
  detailCoordToggleBtn.textContent = viewUiState.detailTechnicalViewEnabled
    ? t.detailHideTechnicalCoordsText
    : t.detailShowTechnicalCoordsText;
  detailCoordToggleBtn.setAttribute("aria-pressed", viewUiState.detailTechnicalViewEnabled ? "true" : "false");
}

function updateDetailBulkActionButtons() {
  if (!detailExpandAllBtn || !detailCollapseAllBtn) return;
  const summary = getDetailSectionSummary(modelContent);
  const noSections = summary.total === 0;
  detailExpandAllBtn.disabled = noSections || summary.collapsed === 0;
  detailCollapseAllBtn.disabled = noSections || summary.expanded === 0;
}

function buildAxisTube(path, color) {
  const curve = new THREE.LineCurve3(path[0], path[1]);
  const tubeGeo = new THREE.TubeGeometry(curve, 8, VISUAL_CONFIG.tubeRadius, 6, false);
  const mat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: VISUAL_CONFIG.axisTubeEmissiveIntensity,
    roughness: 0.25,
    metalness: 0.22
  });
  return new THREE.Mesh(tubeGeo, mat);
}

function buildAxisEndpoint(position, color) {
  const geo = new THREE.SphereGeometry(VISUAL_CONFIG.axisEndpointRadius, 12, 12);
  const mat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: VISUAL_CONFIG.axisEndpointEmissiveIntensity,
    roughness: 0.2,
    metalness: 0.25
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(position);
  return mesh;
}

function buildAxis() {
  clearGroup(axisGroup);
  const axisText = AXIS_TEXT_BY_LANG[viewUiState.uiLanguage];

  const axisColorX = 0xff8fa0;
  const axisColorY = 0x6eefd8;
  const axisColorZ = 0x7eb4ff;
  const tickMaterial = new THREE.LineBasicMaterial({ color: 0xa0b0dc });
  const xValues = [1, 2, 3, 4, 5].map((x) => toWorldX(x));
  const yValues = [1, 2, 3, 4, 5].map((y) => toWorldY(y));
  const zValues = [1, 2, 3, 4, 5].map((z) => toWorldZ(z));
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);
  const zMin = Math.min(...zValues);
  const zMax = Math.max(...zValues);

  axisGroup.add(
    buildAxisTube(
      [new THREE.Vector3(xMin - 6, 0, 0), new THREE.Vector3(xMax + 6, 0, 0)],
      axisColorX
    ),
    buildAxisTube(
      [new THREE.Vector3(0, yMin - 6, 0), new THREE.Vector3(0, yMax + 10, 0)],
      axisColorY
    ),
    buildAxisTube(
      [new THREE.Vector3(0, 0, zMin - 6), new THREE.Vector3(0, 0, zMax + 10)],
      axisColorZ
    )
  );

  axisGroup.add(
    buildAxisEndpoint(new THREE.Vector3(xMax + 6, 0, 0), axisColorX),
    buildAxisEndpoint(new THREE.Vector3(0, yMax + 10, 0), axisColorY),
    buildAxisEndpoint(new THREE.Vector3(0, 0, zMax + 10), axisColorZ)
  );

  const origin = new THREE.Mesh(
    new THREE.SphereGeometry(VISUAL_CONFIG.axisOriginRadius, 14, 14),
    new THREE.MeshStandardMaterial({
      color: 0xedf4ff,
      emissive: 0x94b4eb,
      emissiveIntensity: 0.55,
      roughness: 0.25,
      metalness: 0.15
    })
  );
  axisGroup.add(origin);

  const axisLabelOpts = { background: "rgba(12, 20, 40, 0.88)", border: "rgba(160, 200, 255, 0.72)", textColor: "rgba(245, 250, 255, 0.98)" };
  for (const x of [1, 2, 3, 4, 5]) {
    const p = new THREE.Vector3(toWorldX(x), 0, 0);
    axisGroup.add(
      makeLine(new THREE.Vector3(p.x, -0.7, 0), new THREE.Vector3(p.x, 0.7, 0), tickMaterial)
    );
    const label = createTextSprite(axisText.x[String(x)], axisLabelOpts);
    label.position.set(p.x, 2.1, 0);
    axisGroup.add(label);
  }

  for (const y of [1, 2, 3, 4, 5]) {
    const p = new THREE.Vector3(0, toWorldY(y), 0);
    axisGroup.add(
      makeLine(new THREE.Vector3(-0.7, p.y, 0), new THREE.Vector3(0.7, p.y, 0), tickMaterial)
    );
    const label = createTextSprite(axisText.y[String(y)], axisLabelOpts);
    label.position.set(-5.2, p.y, 0);
    axisGroup.add(label);
  }

  for (const z of [1, 2, 3, 4, 5]) {
    const p = new THREE.Vector3(0, 0, toWorldZ(z));
    axisGroup.add(
      makeLine(new THREE.Vector3(-0.7, 0, p.z), new THREE.Vector3(0.7, 0, p.z), tickMaterial)
    );
    const label = createTextSprite(axisText.z[String(z)], axisLabelOpts);
    label.position.set(0, 2.1, p.z);
    axisGroup.add(label);
  }

  const xTitle = createTextSprite(getUIText("axisXTitle"), axisLabelOpts);
  xTitle.position.set(xMax + 9, 1.2, 0);
  axisGroup.add(xTitle);

  const yTitle = createTextSprite(getUIText("axisYTitle"), axisLabelOpts);
  yTitle.position.set(0.2, yMax + 11, 0);
  axisGroup.add(yTitle);

  const zTitle = createTextSprite(getUIText("axisZTitle"), axisLabelOpts);
  zTitle.position.set(0, 1.2, zMax + 11);
  axisGroup.add(zTitle);

  const originTag = createTextSprite(getUIText("originTag"), {
    fontSize: 20,
    lineHeight: 24,
    paddingX: 12,
    paddingY: 7,
    scaleFactor: 0.015,
    background: "rgba(12, 20, 40, 0.88)",
    border: "rgba(160, 200, 255, 0.72)",
    textColor: "rgba(245, 250, 255, 0.98)"
  });
  originTag.position.set(0, -2.8, 0);
  axisGroup.add(originTag);
}

function buildSpaceGrid() {
  clearGroup(pyramidGroup);

  const xBand = computeGridBands([1, 2, 3, 4, 5].map((x) => toWorldX(x)), SCALE.x);
  const yBand = computeGridBands([1, 2, 3, 4, 5].map((y) => toWorldY(y)), SCALE.y);
  const zBand = computeGridBands([1, 2, 3, 4, 5].map((z) => toWorldZ(z)), SCALE.z);

  const xMin = xBand.min;
  const xMax = xBand.max;
  const yMin = yBand.min;
  const yMax = yBand.max;
  const zMin = zBand.min;
  const zMax = zBand.max;

  const outerMaterial = new THREE.LineBasicMaterial({
    color: 0xa8ccff,
    transparent: true,
    opacity: 0.78
  });
  const innerMaterial = new THREE.LineBasicMaterial({
    color: 0x6a8fd8,
    transparent: true,
    opacity: 0.32
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
    color: 0x6a90d8,
    transparent: true,
    opacity: 0.06,
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

function applyFilters() {
  visibleNodeMeshes = [];
  for (const mesh of nodeMeshes) {
    const { model, searchText } = mesh.userData;
    const nameMatched = searchText.includes(filterSelectionState.keyword);
    const multiMatched = filterSelectionState.selectedModelNames.has(model.name);
    const cellMatched = filterSelectionState.selectedCellKeys.has(mesh.userData.cellKey);
    mesh.userData.searchMatched = nameMatched && multiMatched;
    mesh.visible = mesh.userData.searchMatched && cellMatched;
    if (mesh.visible) visibleNodeMeshes.push(mesh);
  }

  if (viewUiState.selectedMesh && !viewUiState.selectedMesh.visible) {
    selectNode(null);
  }

  if (viewUiState.hoveredMesh && !viewUiState.hoveredMesh.visible) {
    viewUiState.hoveredMesh = null;
    hideTooltip();
  }

  rebuildLinks();
  rebuildCellBadges();
  refreshNeighborHighlights();
  refreshNodeStyles();
  renderModelDetails();
  updateViewControlsState();
  updateScopeStatus();
  urlStateController.syncUrlState();
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
      opacity: 0.42
    });

    const edgeSet = new Set();
    for (let i = 0; i < meshes.length; i++) {
      const source = meshes[i];
      if (viewUiState.visibilityMode === "focus" && viewUiState.focusedCell && source.userData.cellKey !== viewUiState.focusedCell) continue;
      const nearest = [];
      for (let j = 0; j < meshes.length; j++) {
        if (i === j) continue;
        const target = meshes[j];
        if (viewUiState.visibilityMode === "focus" && viewUiState.focusedCell && target.userData.cellKey !== viewUiState.focusedCell) continue;
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
  viewUiState.neighborMeshes = [];

  if (!neighborToggle.checked || !viewUiState.selectedMesh || !viewUiState.selectedMesh.visible) return;

  const candidates = visibleNodeMeshes
    .filter((mesh) => mesh !== viewUiState.selectedMesh && mesh.visible)
    .map((mesh) => ({
      mesh,
      distance: mesh.position.distanceTo(viewUiState.selectedMesh.position)
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, NEIGHBOR_COUNT);

  viewUiState.neighborMeshes = candidates.map((item) => item.mesh);

  const lineMaterial = new THREE.LineDashedMaterial({
    color: 0x8ef4e0,
    linewidth: 1,
    dashSize: 1.3,
    gapSize: 0.9,
    transparent: true,
    opacity: 0.95
  });

  for (const candidate of candidates) {
    const line = makeLine(viewUiState.selectedMesh.position, candidate.mesh.position, lineMaterial);
    line.computeLineDistances();
    neighborLineGroup.add(line);
  }
}

function refreshNodeStyles() {
  const overviewMode = viewUiState.visibilityMode === "overview";
  const focusMode = viewUiState.visibilityMode === "focus";
  const focusedCell = viewUiState.focusedCell;

  const compactLabelCandidates = new Set();
  if (overviewMode) {
    const maxDist = VISUAL_CONFIG.overviewCompactLabelMaxDistance;
    const maxDistanceSq = maxDist * maxDist;
    const closest = visibleNodeMeshes
      .map((mesh) => ({
        mesh,
        distanceSq: camera.position.distanceToSquared(mesh.position)
      }))
      .filter((item) => item.distanceSq <= maxDistanceSq)
      .sort((a, b) => a.distanceSq - b.distanceSq)
      .slice(0, VISUAL_CONFIG.overviewCompactLabelLimit);
    closest.forEach((item) => compactLabelCandidates.add(item.mesh));
  }

  for (const mesh of nodeMeshes) {
    const material = mesh.material;
    const isHovered = mesh === viewUiState.hoveredMesh;
    const isSelected = mesh === viewUiState.selectedMesh;
    const isNeighbor = viewUiState.neighborMeshes.includes(mesh);
    const isVisible = mesh.visible;

    const inFocusedCell = focusMode && mesh.userData.cellKey === focusedCell;
    const showDetailLabel = isVisible && (inFocusedCell || isHovered || isSelected || isNeighbor);
    const showCompactLabel = isVisible && !showDetailLabel && overviewMode && compactLabelCandidates.has(mesh);

    const baseScale = overviewMode ? 0.88 : 1;
    mesh.scale.setScalar(isSelected ? 1.35 : isHovered ? 1.2 : isNeighbor ? 1.12 : baseScale);
    if (mesh.userData.labelSprite) {
      mesh.userData.labelSprite.visible = showDetailLabel;
    }
    if (mesh.userData.compactLabelSprite) {
      mesh.userData.compactLabelSprite.visible = showCompactLabel;
    }

    const hasFocus = isSelected || isHovered || isNeighbor;
    const hasActiveFocus = !!viewUiState.selectedMesh || !!viewUiState.hoveredMesh;

    material.emissive.copy(mesh.userData.baseEmissive);
    material.transparent = true;

    let opacity = 1;
    let emissiveIntensity = 0.28;

    if (focusMode) {
      if (inFocusedCell) {
        opacity = hasFocus ? 1 : 0.95;
        emissiveIntensity = hasFocus ? 0.42 : 0.32;
      } else {
        opacity = hasFocus ? 0.42 : 0.1;
        emissiveIntensity = hasFocus ? 0.12 : 0.05;
      }
    } else {
      // Overview mode
      const dimNonFocus = hasActiveFocus && !hasFocus;
      opacity = 0.85;
      emissiveIntensity = 0.2;

      if (dimNonFocus) {
        opacity = 0.42;
        emissiveIntensity = 0.08;
      } else if (isHovered) {
        opacity = 0.98;
        emissiveIntensity = 0.42;
      } else if (isSelected) {
        material.emissive.setHex(0xeef6ff);
        emissiveIntensity = 0.58;
        opacity = 1;
      }
    }

    if (isNeighbor && isVisible) {
      material.emissive.setHex(0x7ee8cd);
      emissiveIntensity = 0.45;
      opacity = Math.max(opacity, 0.95);
    }

    material.opacity = opacity;
    material.emissiveIntensity = emissiveIntensity;
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
    if (viewUiState.hoveredMesh) {
      viewUiState.hoveredMesh = null;
      refreshNodeStyles();
    }
    hideTooltip();
    return;
  }

  updatePointer(event);
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(visibleNodeMeshes, true);
  const nextHovered = pickModelMesh(intersects);

  if (viewUiState.hoveredMesh !== nextHovered) {
    viewUiState.hoveredMesh = nextHovered;
    refreshNodeStyles();
  }

  if (viewUiState.hoveredMesh) {
    renderer.domElement.style.cursor = "pointer";
    showTooltip(event.clientX, event.clientY, getModelLabel(viewUiState.hoveredMesh.userData.model));
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
    if (isSimpleMode) {
      showTooltip(event.clientX, event.clientY, getModelLabel(modelMesh.userData.model));
    }
  } else {
    if (isOverviewMode()) {
      const badgeIntersects = raycaster.intersectObjects(cellBadgeGroup.children, true);
      const cellBadge = pickCellBadge(badgeIntersects);
      if (cellBadge) {
        enterCellFocus(cellBadge.userData.cellKey);
        urlStateController.syncUrlState();
        return;
      }
    }
    if (isSimpleMode) hideTooltip();
    selectNode(null);
  }
}

function selectNode(mesh) {
  viewUiState.selectedMesh = mesh;
  if (mesh) {
    viewUiState.visibilityMode = "focus";
    viewUiState.focusedCell = mesh.userData.cellKey;
    if (viewUiState.infoHidden && !isSimpleMode) setInfoHidden(false);
  } else {
    viewUiState.visibilityMode = "overview";
    viewUiState.focusedCell = null;
  }
  rebuildLinks();
  refreshNeighborHighlights();
  refreshNodeStyles();
  renderModelDetails();
  updateScopeStatus();
  updateViewControlsState();
}

function focusModelByName(modelName) {
  const mesh = modelMeshByName.get(modelName);
  if (!mesh) return;

  filterSelectionState.keyword = "";
  filterSelectionState.cellKeyword = "";
  if (modelMultiSearchInput) modelMultiSearchInput.value = "";
  if (cellMultiSearchInput) cellMultiSearchInput.value = "";
  filterSelectionState.selectedModelNames.add(modelName);
  filterSelectionState.selectedCellKeys.add(mesh.userData.cellKey);

  rebuildModelMultiList();
  rebuildCellFilterOptions();
  applyFilters();
  selectNode(mesh);
}

function buildExportFileName() {
  const date = new Date().toISOString().slice(0, 10);
  if (filterSelectionState.selectedCellKeys.size === 1
    && filterSelectionState.allCellKeys.length > 1) {
    const [cellKey] = [...filterSelectionState.selectedCellKeys];
    return `cognitive-atlas-cell-${cellKey.replace(/\|/g, "-")}-${date}.png`;
  }

  const selectedModels = modelData
    .filter((model) => filterSelectionState.selectedModelNames.has(model.name));
  if (selectedModels.length > 0 && selectedModels.length < modelData.length) {
    const categorySet = new Set(selectedModels.map((model) => model.category));
    if (categorySet.size === 1) {
      const [category] = [...categorySet];
      return `cognitive-atlas-category-${String(category).toLowerCase()}-${date}.png`;
    }
  }

  return `cognitive-atlas-${date}.png`;
}

function getVisibleModelsByCellKey(cellKey) {
  return nodeMeshes
    .filter((mesh) => mesh.visible && mesh.userData.cellKey === cellKey)
    .map((mesh) => mesh.userData.model);
}

function fitCameraToCognitiveSpace() {
  const xBand = computeGridBands([1, 2, 3, 4, 5].map((x) => toWorldX(x)), SCALE.x);
  const yBand = computeGridBands([1, 2, 3, 4, 5].map((y) => toWorldY(y)), SCALE.y);
  const zBand = computeGridBands([1, 2, 3, 4, 5].map((z) => toWorldZ(z)), SCALE.z);
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

  viewUiState.baseCameraCenter.copy(center);
  viewUiState.baseCameraDistance = distance;
  controls.minDistance = Math.max(28, distance * 0.45);
  controls.maxDistance = distance * 3.8;
  camera.near = 0.1;
  camera.far = Math.max(1000, distance * 10);
  camera.updateProjectionMatrix();
  focusCameraOnView(viewUiState.activeCameraView, { keepSelection: true });
}

function getFocusedBox() {
  if (viewUiState.visibilityMode !== "focus") return null;

  const box = new THREE.Box3();
  let hasPoints = false;

  if (viewUiState.focusedCell) {
    for (const mesh of nodeMeshes) {
      if (mesh.userData.cellKey === viewUiState.focusedCell && mesh.visible) {
        box.expandByObject(mesh);
        hasPoints = true;
      }
    }
  }

  if (viewUiState.selectedMesh) {
    box.expandByObject(viewUiState.selectedMesh);
    hasPoints = true;
  }

  if (!hasPoints) return null;
  return box;
}

function updatePointer(event) {
  const t = event.touches?.length ? event.touches[0] : event.changedTouches?.length ? event.changedTouches[0] : event;
  const clientX = t.clientX ?? event.clientX;
  const clientY = t.clientY ?? event.clientY;
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
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
  setToolbarHiddenPanel(panels, viewUiState, hidden, getUIText);
}

function setInfoHidden(hidden) {
  setInfoHiddenPanel(panels, viewUiState, hidden, getUIText);
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
