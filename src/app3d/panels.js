/**
 * ui/panels — 筛选、详情、校验、view dock 面板层
 *
 * 职责：面板 DOM 解析、工具栏/详情面板可见性控制。
 * Traceability: Phase3 架构演进
 */

/**
 * 解析并返回所有面板相关 DOM 元素引用
 * @param {Document} doc
 * @returns {Object} 面板元素集合
 */
export function resolvePanelElements(doc) {
  return {
    modelMultiSearchInput: doc.getElementById("modelMultiSearchInput"),
    modelMultiSummary: doc.getElementById("modelMultiSummary"),
    modelMultiList: doc.getElementById("modelMultiList"),
    modelMultiSelectVisibleBtn: doc.getElementById("modelMultiSelectVisibleBtn"),
    modelMultiSelectAllBtn: doc.getElementById("modelMultiSelectAllBtn"),
    modelMultiClearBtn: doc.getElementById("modelMultiClearBtn"),
    modelMultiExpandGroupsBtn: doc.getElementById("modelMultiExpandGroupsBtn"),
    modelMultiCollapseGroupsBtn: doc.getElementById("modelMultiCollapseGroupsBtn"),
    cellMultiSearchInput: doc.getElementById("cellMultiSearchInput"),
    cellMultiSummary: doc.getElementById("cellMultiSummary"),
    cellMultiList: doc.getElementById("cellMultiList"),
    cellMultiSelectVisibleBtn: doc.getElementById("cellMultiSelectVisibleBtn"),
    cellMultiSelectAllBtn: doc.getElementById("cellMultiSelectAllBtn"),
    cellMultiClearBtn: doc.getElementById("cellMultiClearBtn"),
    controlsPanel: doc.querySelector(".controls"),
    infoPanel: doc.querySelector(".info"),
    linkToggle: doc.getElementById("linkToggle"),
    pyramidToggle: doc.getElementById("pyramidToggle"),
    neighborToggle: doc.getElementById("neighborToggle"),
    exportModeSelect: doc.getElementById("exportModeSelect"),
    exportModeLabel: doc.getElementById("exportModeLabel"),
    exportModeFullOption: doc.getElementById("exportModeFull"),
    exportModeViewportOption: doc.getElementById("exportModeViewport"),
    toolbarToggleBtn: doc.getElementById("toolbarToggleBtn"),
    detailToggleBtn: doc.getElementById("detailToggleBtn"),
    shareCopyBtn: doc.getElementById("shareCopyBtn"),
    exportImageBtn: doc.getElementById("exportImageBtn"),
    exportPosterBtn: doc.getElementById("exportPosterBtn"),
    exportDouyinCardBtn: doc.getElementById("exportDouyinCardBtn"),
    fullscreenToggleBtn: doc.getElementById("fullscreenToggleBtn"),
    scopeStatus: doc.getElementById("scopeStatus"),
    dockAdvancedSummary: doc.getElementById("dockAdvancedSummary"),
    toolbarMoreSummary: doc.getElementById("toolbarMoreSummary"),
    detailAdvancedSummary: doc.getElementById("detailAdvancedSummary"),
    dockExpandBtn: doc.getElementById("dockExpandBtn"),
    viewDock: doc.querySelector(".view-dock"),
    overviewModeBtn: doc.getElementById("overviewModeBtn"),
    viewResetBtn: doc.getElementById("viewResetBtn"),
    viewPromoBtn: doc.getElementById("viewPromoBtn"),
    viewXAxisBtn: doc.getElementById("viewXAxisBtn"),
    viewYAxisBtn: doc.getElementById("viewYAxisBtn"),
    viewZAxisBtn: doc.getElementById("viewZAxisBtn"),
    tooltip: doc.getElementById("tooltip"),
    modelContent: doc.getElementById("modelContent"),
    appTitle: doc.getElementById("appTitle"),
    appSubtitle: doc.getElementById("appSubtitle"),
    aboutCardSummary: doc.getElementById("aboutCardSummary"),
    aboutWhat: doc.getElementById("aboutWhat"),
    aboutAxesIntro: doc.getElementById("aboutAxesIntro"),
    aboutAxisXShort: doc.getElementById("aboutAxisXShort"),
    aboutAxisYShort: doc.getElementById("aboutAxisYShort"),
    aboutAxisZShort: doc.getElementById("aboutAxisZShort"),
    aboutWho: doc.getElementById("aboutWho"),
    modelMultiLabel: doc.getElementById("modelMultiLabel"),
    cellFilterLabel: doc.getElementById("cellFilterLabel"),
    linkToggleText: doc.getElementById("linkToggleText"),
    gridToggleText: doc.getElementById("gridToggleText"),
    neighborToggleText: doc.getElementById("neighborToggleText"),
    visualSwitchTitle: doc.getElementById("visualSwitchTitle"),
    legendText: doc.getElementById("legendText"),
    validationPanel: doc.getElementById("validationPanel"),
    modelPanelTitle: doc.getElementById("modelPanelTitle"),
    detailCoordToggleBtn: doc.getElementById("detailCoordToggleBtn"),
    detailExpandAllBtn: doc.getElementById("detailExpandAllBtn"),
    detailCollapseAllBtn: doc.getElementById("detailCollapseAllBtn"),
    languageFinderText: doc.getElementById("languageFinderText"),
    tabModelsBtn: doc.getElementById("tabModelsBtn"),
    tabCellsBtn: doc.getElementById("tabCellsBtn"),
    tabVisualBtn: doc.getElementById("tabVisualBtn"),
    toolbarTabButtons: doc.querySelectorAll("[data-toolbar-tab]"),
    toolbarTabPanels: doc.querySelectorAll("[data-toolbar-panel]"),
    quickLangButtons: doc.querySelectorAll("[data-ui-lang]")
  };
}

/**
 * 设置工具栏显隐
 */
export function setToolbarHidden(elements, viewUiState, hidden, getUIText) {
  viewUiState.toolbarHidden = hidden;
  document.body.classList.toggle("toolbar-hidden", hidden);
  elements.controlsPanel?.setAttribute("aria-hidden", hidden ? "true" : "false");
  elements.toolbarToggleBtn.textContent = hidden ? getUIText("showToolbarText") : getUIText("hideToolbarText");
}

/**
 * 设置详情面板显隐
 */
export function setInfoHidden(elements, viewUiState, hidden, getUIText) {
  viewUiState.infoHidden = hidden;
  document.body.classList.toggle("info-hidden", hidden);
  elements.infoPanel?.setAttribute("aria-hidden", hidden ? "true" : "false");
  elements.detailToggleBtn.textContent = hidden ? getUIText("showDetailsText") : getUIText("hideDetailsText");
}
