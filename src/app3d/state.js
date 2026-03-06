/**
 * core/state — 筛选、选中、视角、语言
 *
 * 职责：筛选选择状态、视图 UI 状态、相机视角预设。
 * Traceability: M1 模块边界、Phase3 core/state 补全
 */

export function createFilterSelectionState(modelData) {
  return {
    keyword: "",
    cellKeyword: "",
    selectedModelNames: new Set(modelData.map((model) => model.name)),
    collapsedModelCategories: new Map(),
    selectedCellKeys: new Set(),
    allCellKeys: [],
    cellEntries: [],
    initializedCellSelection: false
  };
}

/**
 * 创建视图 UI 状态
 * @param {Object} options
 * @param {string} [options.defaultLanguage='zh']
 * @param {Object} [options.three] - THREE 库，传入时初始化 baseCameraCenter
 */
export function createViewUiState(options = {}) {
  const { defaultLanguage = "zh", three } = options;
  return {
    hoveredMesh: null,
    selectedMesh: null,
    neighborMeshes: [],
    uiLanguage: defaultLanguage,
    toolbarHidden: false,
    infoHidden: false,
    detailTechnicalViewEnabled: false,
    activeToolbarTab: "models",
    activeCameraView: "default",
    baseCameraCenter: three ? new three.Vector3(0, 0, 0) : null,
    baseCameraDistance: 128,
    visibilityMode: "overview", // 'overview' | 'focus'
    focusedCell: null // { x, y, z } or null
  };
}

/**
 * 创建相机视角方向预设（default、promo、x、y、z）
 * @param {Object} THREE - Three.js 库
 * @returns {Object} 视角 key -> Vector3 方向
 */
export function createCameraViewDirections(THREE) {
  const defaultDir = new THREE.Vector3(1.22, 0.96, 1.18).normalize();
  const promoDir = new THREE.Vector3(1.15, 1.02, 1.12).normalize();
  return {
    default: defaultDir.clone(),
    promo: promoDir.clone(),
    x: new THREE.Vector3(1, 0.08, 0.04).normalize(),
    y: new THREE.Vector3(0.06, 1, 0.06).normalize(),
    z: new THREE.Vector3(0.04, 0.08, 1).normalize()
  };
}
