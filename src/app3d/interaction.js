function bindClick(element, handler) {
  if (!element || typeof handler !== "function") return;
  element.addEventListener("click", handler);
}

function bindInput(element, handler) {
  if (!element || typeof handler !== "function") return;
  element.addEventListener("input", handler);
}

function bindChange(element, handler) {
  if (!element || typeof handler !== "function") return;
  element.addEventListener("change", handler);
}

export function bindAppInteractionEvents({
  elements,
  callbacks,
  windowObject = window,
  documentObject = document
}) {
  const {
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
  } = elements;

  const {
    onLinkToggleChange,
    onPyramidToggleChange,
    onNeighborToggleChange,
    onModelSearchInput,
    onModelSelectVisible,
    onModelSelectAll,
    onModelClear,
    onModelExpandGroups,
    onModelCollapseGroups,
    onCellSearchInput,
    onCellSelectVisible,
    onCellSelectAll,
    onCellClear,
    onLanguageSelect,
    onToolbarTabSelect,
    onToolbarToggle,
    onDetailToggle,
    onDetailCoordToggle,
    onDetailExpandAll,
    onDetailCollapseAll,
    onShareCopy,
    onExportImage,
    onExportPoster,
    onExportDouyinCard,
    onFullscreenToggle,
    onDockExpand,
    onOverviewMode,
    onViewReset,
    onViewPromo,
    onViewXAxis,
    onViewYAxis,
    onViewZAxis,
    onFullscreenChange,
    onDetailSectionsChange,
    onModelContentClick,
    onWindowPointerMove,
    onWindowClick,
    onWindowResize
  } = callbacks;

  bindChange(linkToggle, onLinkToggleChange);
  bindChange(pyramidToggle, onPyramidToggleChange);
  bindChange(neighborToggle, onNeighborToggleChange);

  bindInput(modelMultiSearchInput, onModelSearchInput);
  bindClick(modelMultiSelectVisibleBtn, onModelSelectVisible);
  bindClick(modelMultiSelectAllBtn, onModelSelectAll);
  bindClick(modelMultiClearBtn, onModelClear);
  bindClick(modelMultiExpandGroupsBtn, onModelExpandGroups);
  bindClick(modelMultiCollapseGroupsBtn, onModelCollapseGroups);

  bindInput(cellMultiSearchInput, onCellSearchInput);
  bindClick(cellMultiSelectVisibleBtn, onCellSelectVisible);
  bindClick(cellMultiSelectAllBtn, onCellSelectAll);
  bindClick(cellMultiClearBtn, onCellClear);

  quickLangButtons?.forEach((button) => {
    bindClick(button, () => {
      const nextLang = button.dataset.uiLang;
      onLanguageSelect?.(nextLang);
    });
  });

  const tabButtons = [...(toolbarTabButtons || [])];
  tabButtons.forEach((button) => {
    bindClick(button, () => {
      const nextTab = button.dataset.toolbarTab;
      onToolbarTabSelect?.(nextTab);
    });
    button.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      const index = tabButtons.indexOf(button);
      if (index < 0) return;

      const nextIndex = event.key === "ArrowRight"
        ? (index + 1) % tabButtons.length
        : (index - 1 + tabButtons.length) % tabButtons.length;
      const nextButton = tabButtons[nextIndex];
      const nextTab = nextButton?.dataset?.toolbarTab;
      if (!nextTab) return;

      onToolbarTabSelect?.(nextTab);
      nextButton.focus();
      event.preventDefault();
    });
  });

  bindClick(toolbarToggleBtn, onToolbarToggle);
  bindClick(detailToggleBtn, onDetailToggle);
  bindClick(detailCoordToggleBtn, onDetailCoordToggle);
  bindClick(detailExpandAllBtn, onDetailExpandAll);
  bindClick(detailCollapseAllBtn, onDetailCollapseAll);
  bindClick(shareCopyBtn, onShareCopy);
  bindClick(exportImageBtn, onExportImage);
  bindClick(exportPosterBtn, onExportPoster);
  bindClick(exportDouyinCardBtn, onExportDouyinCard);
  bindClick(fullscreenToggleBtn, onFullscreenToggle);
  bindClick(dockExpandBtn, onDockExpand);
  bindClick(overviewModeBtn, onOverviewMode);
  bindClick(viewResetBtn, onViewReset);
  bindClick(viewPromoBtn, onViewPromo);
  bindClick(viewXAxisBtn, onViewXAxis);
  bindClick(viewYAxisBtn, onViewYAxis);
  bindClick(viewZAxisBtn, onViewZAxis);

  if (typeof onFullscreenChange === "function") {
    documentObject.addEventListener("fullscreenchange", onFullscreenChange);
  }
  if (typeof onDetailSectionsChange === "function") {
    modelContent?.addEventListener("detail-sections-change", onDetailSectionsChange);
  }
  if (typeof onModelContentClick === "function") {
    modelContent?.addEventListener("click", onModelContentClick);
  }
  if (typeof onWindowPointerMove === "function") {
    windowObject.addEventListener("pointermove", onWindowPointerMove);
  }
  if (typeof onWindowClick === "function") {
    windowObject.addEventListener("click", onWindowClick);
  }
  if (typeof onWindowResize === "function") {
    windowObject.addEventListener("resize", onWindowResize);
  }
}
