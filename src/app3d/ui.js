export function renderValidationPanelContent(validationPanel, t, snapshot, getCellShortLabel) {
  if (!validationPanel) return;

  const toolLayerOk = snapshot.toolLayerCount > 0;
  const denseRatioOk = snapshot.denseRatio >= 0.7;
  const densePercent = `${(snapshot.denseRatio * 100).toFixed(0)}%`;
  const topCellsText = snapshot.topCells.length > 0
    ? snapshot.topCells.map(([key, cellStats]) => `${getCellShortLabel(key)} (${cellStats.count})`).join(" / ")
    : "-";

  validationPanel.replaceChildren();

  const title = document.createElement("div");
  title.className = "validation-title";
  title.textContent = t.validationTitle;
  validationPanel.appendChild(title);

  const toolLine = document.createElement("div");
  toolLine.className = toolLayerOk ? "validation-ok" : "validation-error";
  toolLine.textContent = `${toolLayerOk ? "✓" : "✗"} ${toolLayerOk ? t.validationToolLayerOk : t.validationToolLayerMissing} (${snapshot.toolLayerCount})`;
  validationPanel.appendChild(toolLine);

  const densityLine = document.createElement("div");
  densityLine.className = denseRatioOk ? "validation-ok" : "validation-warn";
  densityLine.textContent = `${denseRatioOk ? "✓" : "!"} ${denseRatioOk ? t.validationDensityOk : t.validationDensityWarn} (${snapshot.denseCells}/${snapshot.filledCells}, ${densePercent})`;
  validationPanel.appendChild(densityLine);

  const evalLine = document.createElement("div");
  if (snapshot.evalSummary) {
    const { admitted = 0, observing = 0, rejected = 0 } = snapshot.evalSummary;
    evalLine.textContent = `${t.validationEvalSummary}: ${t.validationAdmittedLabel} ${admitted} / ${t.validationObservingLabel} ${observing} / ${t.validationRejectedLabel} ${rejected}`;
  } else {
    evalLine.textContent = `${t.validationEvalSummary}: -`;
  }
  validationPanel.appendChild(evalLine);

  const topLine = document.createElement("div");
  topLine.textContent = `${t.validationTopCells}: ${topCellsText}`;
  validationPanel.appendChild(topLine);
}

function isAccordionTrigger(element) {
  return element instanceof HTMLElement && element.classList.contains("accordion-trigger");
}

function setAccordionExpanded(trigger, expanded) {
  if (!isAccordionTrigger(trigger)) return;
  const section = trigger.closest(".accordion-section");
  const panelId = trigger.getAttribute("aria-controls");
  const panel = panelId ? document.getElementById(panelId) : null;
  if (!(section instanceof HTMLElement) || !(panel instanceof HTMLElement)) return;

  trigger.setAttribute("aria-expanded", expanded ? "true" : "false");
  section.classList.toggle("collapsed", !expanded);
  panel.hidden = !expanded;
}

export function setAllDetailSectionsExpanded(modelContent, expanded) {
  if (!(modelContent instanceof HTMLElement)) return 0;
  const triggers = [...modelContent.querySelectorAll(".accordion-trigger")];
  triggers.forEach((trigger) => setAccordionExpanded(trigger, expanded));
  return triggers.length;
}

export function getDetailSectionSummary(modelContent) {
  if (!(modelContent instanceof HTMLElement)) {
    return { total: 0, expanded: 0, collapsed: 0 };
  }
  const triggers = [...modelContent.querySelectorAll(".accordion-trigger")].filter(isAccordionTrigger);
  const expanded = triggers.filter((trigger) => trigger.getAttribute("aria-expanded") === "true").length;
  return {
    total: triggers.length,
    expanded,
    collapsed: Math.max(0, triggers.length - expanded)
  };
}

export function renderModelDetailsContent(modelContent, payload) {
  const {
    displayName,
    overviewTitle,
    overviewRows,
    descriptionTitle,
    descriptionText,
    tagsTitle,
    tags,
    judgementTitle,
    judgementStatus,
    judgementStatusClass,
    judgementRows,
    referenceTitle,
    referenceSections,
    referenceLinks,
    detailNoneText,
    sectionEmptyText
  } = payload;

  modelContent.replaceChildren();

  const title = document.createElement("h3");
  title.className = "model-name";
  title.textContent = displayName;
  modelContent.appendChild(title);

  let accordionId = 0;
  const fallbackNone = detailNoneText || "-";
  const fallbackEmpty = sectionEmptyText || fallbackNone;

  function appendAccordionSection(titleText, options, renderContent) {
    const { expanded = true, className = "" } = options || {};
    const section = document.createElement("section");
    section.className = `explain-card accordion-section ${className}`.trim();

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "accordion-trigger";

    const triggerTitle = document.createElement("span");
    triggerTitle.className = "explain-title";
    triggerTitle.textContent = titleText || fallbackNone;
    trigger.appendChild(triggerTitle);

    const indicator = document.createElement("span");
    indicator.className = "accordion-indicator";
    indicator.textContent = "▾";
    trigger.appendChild(indicator);

    accordionId += 1;
    const panelId = `detail-accordion-panel-${accordionId}`;
    const panel = document.createElement("div");
    panel.className = "accordion-content";
    panel.id = panelId;
    trigger.setAttribute("aria-controls", panelId);

    setAccordionExpanded(trigger, Boolean(expanded));
    trigger.addEventListener("click", () => {
      const isExpanded = trigger.getAttribute("aria-expanded") === "true";
      setAccordionExpanded(trigger, !isExpanded);
      modelContent.dispatchEvent(new CustomEvent("detail-sections-change"));
    });

    renderContent(panel);
    if (!panel.childNodes.length) {
      const empty = document.createElement("div");
      empty.className = "explain-value";
      empty.textContent = fallbackEmpty;
      panel.appendChild(empty);
    }

    section.append(trigger, panel);
    modelContent.appendChild(section);
  }

  appendAccordionSection(overviewTitle, { expanded: true, className: "overview-card" }, (panel) => {
    const overviewGrid = document.createElement("div");
    overviewGrid.className = "overview-grid";
    const rows = overviewRows || [];
    if (!rows.length) {
      const empty = document.createElement("div");
      empty.className = "overview-value";
      empty.textContent = fallbackNone;
      panel.appendChild(empty);
      return;
    }
    for (const row of rows) {
      const item = document.createElement("div");
      item.className = "overview-item";

      const key = document.createElement("div");
      key.className = "explain-key";
      key.textContent = row.label;
      item.appendChild(key);

      const value = document.createElement("div");
      value.className = "overview-value";
      value.textContent = row.value || fallbackNone;
      item.appendChild(value);

      overviewGrid.appendChild(item);
    }
    panel.appendChild(overviewGrid);
  });

  appendAccordionSection(descriptionTitle, { expanded: true, className: "definition-card" }, (panel) => {
    const definitionText = document.createElement("p");
    definitionText.className = "definition-text";
    definitionText.textContent = descriptionText || fallbackEmpty;
    panel.appendChild(definitionText);
  });

  appendAccordionSection(judgementTitle, { expanded: false }, (panel) => {
    if (judgementStatus) {
      const statusRow = document.createElement("div");
      statusRow.className = "explain-status-row";

      const statusPill = document.createElement("span");
      statusPill.className = `pill status-pill ${judgementStatusClass || ""}`.trim();
      statusPill.textContent = judgementStatus;
      statusRow.appendChild(statusPill);
      panel.appendChild(statusRow);
    }

    const detailGrid = document.createElement("div");
    detailGrid.className = "explain-grid";
    const rows = judgementRows || [];
    if (!rows.length) {
      const empty = document.createElement("div");
      empty.className = "explain-value";
      empty.textContent = fallbackEmpty;
      panel.appendChild(empty);
      return;
    }

    for (const row of rows) {
      const rowEl = document.createElement("div");
      rowEl.className = "explain-row";

      const label = document.createElement("div");
      label.className = "explain-key";
      label.textContent = row.label;
      rowEl.appendChild(label);

      const value = document.createElement("div");
      value.className = "explain-value";
      value.textContent = row.value || fallbackNone;
      rowEl.appendChild(value);

      detailGrid.appendChild(rowEl);
    }
    panel.appendChild(detailGrid);
  });

  appendAccordionSection(referenceTitle, { expanded: true, className: "resource-card" }, (panel) => {
    const sections = referenceSections || [];
    if (!sections.length && (!referenceLinks || !referenceLinks.length)) {
      const empty = document.createElement("div");
      empty.className = "explain-value";
      empty.textContent = fallbackEmpty;
      panel.appendChild(empty);
      return;
    }

    for (const section of sections) {
      const sectionEl = document.createElement("div");
      sectionEl.className = "resource-section";

      const label = document.createElement("div");
      label.className = "explain-key";
      label.textContent = section.label;
      sectionEl.appendChild(label);

      if (!section.items || section.items.length === 0) {
        const empty = document.createElement("div");
        empty.className = "explain-value";
        empty.textContent = section.emptyText || fallbackEmpty;
        sectionEl.appendChild(empty);
        panel.appendChild(sectionEl);
        continue;
      }

      const list = document.createElement("ul");
      list.className = "resource-list";
      for (const item of section.items) {
        const listItem = document.createElement("li");
        if (item.url) {
          const link = document.createElement("a");
          link.className = "resource-inline-link";
          link.href = item.url;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.textContent = item.text;
          listItem.appendChild(link);
        } else {
          listItem.textContent = item.text;
        }
        list.appendChild(listItem);
      }
      sectionEl.appendChild(list);
      panel.appendChild(sectionEl);
    }

    if (referenceLinks && referenceLinks.length > 0) {
      const linksRow = document.createElement("div");
      linksRow.className = "resource-links";
      for (const linkItem of referenceLinks) {
        const link = document.createElement("a");
        link.className = "resource-link";
        link.href = linkItem.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = linkItem.label;
        linksRow.appendChild(link);
      }
      panel.appendChild(linksRow);
    }
  });

  appendAccordionSection(tagsTitle, { expanded: true, className: "tag-card" }, (panel) => {
    const tagRow = document.createElement("div");
    tagRow.className = "pill-row";
    if (!Array.isArray(tags) || tags.length === 0) {
      const empty = document.createElement("div");
      empty.className = "explain-value";
      empty.textContent = fallbackNone;
      tagRow.appendChild(empty);
      panel.appendChild(tagRow);
      return;
    }

    for (const tag of tags) {
      const pill = document.createElement("span");
      pill.className = "pill";
      pill.textContent = tag;
      tagRow.appendChild(pill);
    }
    panel.appendChild(tagRow);
  });

  const triggers = [...modelContent.querySelectorAll(".accordion-trigger")];
  triggers.forEach((trigger, index) => {
    trigger.addEventListener("keydown", (event) => {
      if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;

      let nextIndex = index;
      if (event.key === "ArrowDown") nextIndex = (index + 1) % triggers.length;
      if (event.key === "ArrowUp") nextIndex = (index - 1 + triggers.length) % triggers.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = triggers.length - 1;

      triggers[nextIndex]?.focus();
      event.preventDefault();
    });
  });
}
