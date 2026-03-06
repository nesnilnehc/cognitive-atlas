export function createDetailOrchestrator(options) {
  const {
    windowRef = typeof window === "undefined" ? null : window,
    modelContent,
    modelData,
    nodeMeshes,
    filterSelectionState,
    viewUiState,
    uiTextByLang,
    axisTextByLang,
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
  } = options;

  function toRelatedItems(models, limit = 8) {
    return models.slice(0, limit).map((candidate) => ({
      name: candidate.name,
      label: candidate.name,
      title: getModelLabel(candidate)
    }));
  }

  function buildRelatedModelGroups(model, selectedCellKey, t) {
    const sameCellModels = modelData.filter((candidate) =>
      candidate.name !== model.name
      && `${getXBucketValue(candidate.x)}|${candidate.y}|${candidate.z}` === selectedCellKey);

    const sameCellNames = new Set(sameCellModels.map((candidate) => candidate.name));

    const sameCategoryModels = modelData
      .filter((candidate) => candidate.category === model.category
        && candidate.name !== model.name
        && !sameCellNames.has(candidate.name));

    const nearestModels = viewUiState.neighborMeshes.map((mesh) => mesh.userData.model);

    return [
      { label: t.relatedSameCell, items: toRelatedItems(sameCellModels) },
      { label: t.relatedSameCategory, items: toRelatedItems(sameCategoryModels) },
      { label: t.relatedNearest, items: toRelatedItems(nearestModels, 4) }
    ].filter((group) => group.items.length > 0);
  }

  function renderModelDetails() {
    const t = uiTextByLang[viewUiState.uiLanguage];
    const axisText = axisTextByLang[viewUiState.uiLanguage];

    if (!viewUiState.selectedMesh) {
      const activeCellKey = viewUiState.focusedCell || (filterSelectionState.selectedCellKeys.size === 1 ? [...filterSelectionState.selectedCellKeys][0] : null);
      if (activeCellKey) {
        const activeCellModels = getVisibleModelsByCellKey(activeCellKey);
        if (activeCellModels.length > 0) {
          const typicalModel = chooseTypicalModel(activeCellModels);
          const orderedModels = typicalModel
            ? [
                typicalModel,
                ...activeCellModels
                  .filter((model) => model.name !== typicalModel.name)
                  .sort((a, b) => a.name.localeCompare(b.name))
              ]
            : [...activeCellModels].sort((a, b) => a.name.localeCompare(b.name));

          renderCellFocusContent(modelContent, {
            title: t.cellFocusTitle,
            summaryLine: `${t.detailCell}: ${getCellShortLabel(activeCellKey)}`,
            guideTitle: t.cellFocusGuideTitle,
            guideRows: [
              { label: t.detailCell, value: getCellShortLabel(activeCellKey) },
              { label: t.cellFocusCountLabel, value: `${activeCellModels.length} ${t.cellCountUnit}` },
              { label: t.cellFocusTypicalLabel, value: typicalModel ? getModelLabel(typicalModel) : t.detailNone }
            ],
            pathTitle: t.cellFocusPathTitle,
            pathModels: orderedModels.map((model) => ({
              name: model.name,
              label: model.name,
              title: getModelLabel(model)
            })),
            hintText: t.cellFocusHint,
            detailNoneText: t.detailNone
          });
          updateDetailBulkActionButtons();
          return;
        }
      }
      modelContent.textContent = t.modelPanelEmpty;
      updateDetailBulkActionButtons();
      return;
    }

    const model = viewUiState.selectedMesh.userData.model;
    const xKey = getXBucketValue(model.x);
    const spaceCell = getCellShortLabel(viewUiState.selectedMesh.userData.cellKey);
    const displayName = getModelLabel(model);
    const categoryText = t.categoryLabels[model.category] ?? model.category;
    const neighborText = viewUiState.neighborMeshes.map((m) => getModelLabel(m.userData.model)).join(" / ") || t.detailNone;
    const xAxisText = toAxisSingleLine(axisText.x[xKey]);
    const yAxisText = toAxisSingleLine(axisText.y[String(model.y)]);
    const zAxisText = toAxisSingleLine(axisText.z[String(model.z)]);
    const descriptionText = viewUiState.uiLanguage === "en" ? (model.descriptionEn ?? model.description) : model.description;
    const tags = viewUiState.uiLanguage === "en" ? (model.tagsEn ?? model.tags) : model.tags;
    const evaluation = model.evaluation || null;
    const referencePayload = buildModelReferencePayload(model, t);
    const evidencePackKey = evaluation?.evidencePack || "-";
    const evidenceSources = windowRef?.MODEL_EVIDENCE_PACKS?.[evidencePackKey] || "-";
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

    const rawOverviewRows = [
      { label: t.detailCategory, value: categoryText },
      { label: t.detailCell, value: spaceCell },
      { label: t.detailNeighbor, value: neighborText },
      { label: t.detailX, value: xAxisText },
      { label: t.detailY, value: yAxisText },
      { label: t.detailZ, value: zAxisText }
    ];
    if (viewUiState.detailTechnicalViewEnabled) {
      rawOverviewRows.push({
        label: t.detailCoord,
        value: `(${model.x}, ${model.y}, ${model.z})`
      });
    }
    const overviewRows = rawOverviewRows.filter((row) => {
      const value = String(row.value ?? "").trim();
      return value && value !== "-" && value !== t.detailNone;
    });

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

    if (viewUiState.detailTechnicalViewEnabled) {
      appendJudgementRow(t.judgementEvidencePack, evidencePackKey);
      appendJudgementRow(t.judgementEvidenceSources, evidenceSources);
      appendJudgementRow(t.judgementStandardVersion, evaluation?.standardVersion || "-");
      appendJudgementRow(t.judgementEvaluatedAt, evaluation?.evaluatedAt || "-");
    }

    const summaryLine = descriptionText && String(descriptionText).trim() ? descriptionText.trim() : null;
    const relatedGroups = buildRelatedModelGroups(model, viewUiState.selectedMesh.userData.cellKey, t);

    renderModelDetailsContent(modelContent, {
      displayName,
      summaryLine,
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
      referenceLinks: referencePayload.links,
      relatedTitle: t.detailRelatedTitle,
      relatedGroups,
      relatedHint: t.relatedJumpHint
    });
    updateDetailBulkActionButtons();
  }

  return { renderModelDetails };
}
