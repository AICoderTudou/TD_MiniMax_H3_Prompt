import { app } from "../../scripts/app.js";

const NODE_CLASS = "TD_MiniMax_H3_Prompt";
const MAX_MEDIA = 15;
const MEDIA_PREFIX = "media_";
const ZERO_WIDTH = "\u200B";

function addStyle() {
    if (document.getElementById("td-h3-prompt-style")) return;
    const style = document.createElement("style");
    style.id = "td-h3-prompt-style";
    style.textContent = [
        ".td-h3-editor-wrap{position:relative;box-sizing:border-box;width:100%;height:190px;min-height:190px;max-height:190px;flex:0 0 190px;border:1px solid rgba(98,213,255,.2);border-radius:10px;overflow:hidden;background:#171717;box-shadow:inset 0 1px 0 rgba(255,255,255,.03)}",
        ".td-h3-editor{box-sizing:border-box;width:100%;height:190px;min-height:190px;max-height:190px;padding:12px 12px 33px;overflow-y:auto;overflow-x:hidden;border:0;outline:0;background:transparent;color:#eee;white-space:pre-wrap;overflow-wrap:anywhere;font:13px/1.7 Consolas,'Microsoft YaHei',monospace;caret-color:#65e7dd}",
        ".td-h3-editor:empty::before{content:attr(data-placeholder);color:#686868;pointer-events:none}.td-h3-editor:focus{box-shadow:inset 0 0 0 1px rgba(75,223,211,.27)}",
        ".td-h3-editor-tip{position:absolute;left:11px;right:11px;bottom:7px;display:flex;justify-content:space-between;pointer-events:none;color:#666f78;font:10px/1.2 system-ui,sans-serif}",
        ".td-h3-editor-tip b{color:#23d8c1;font-weight:800}",
        ".td-h3-mention{display:inline-flex;align-items:center;gap:4px;max-width:190px;margin:0 2px;padding:1px 6px 1px 3px;border:1px solid rgba(31,219,190,.22);border-radius:5px;background:rgba(16,164,138,.13);color:#18dfbd;vertical-align:1px;white-space:nowrap;cursor:default;user-select:all;font:600 12px/20px Consolas,'Microsoft YaHei',monospace}",
        ".td-h3-mention-icon{display:inline-grid;place-items:center;width:18px;height:18px;flex:0 0 18px;border-radius:4px;background:linear-gradient(135deg,#7568ff,#42c9e8);color:#fff;font:800 9px/1 system-ui,sans-serif}",
        ".td-h3-mention.is-video .td-h3-mention-icon{background:linear-gradient(135deg,#2869db,#23bde5)}.td-h3-mention.is-audio .td-h3-mention-icon{background:linear-gradient(135deg,#04a98d,#3edec7)}",
        ".td-h3-mention-label{min-width:0;overflow:hidden;text-overflow:ellipsis}",
        ".td-h3-chip-remove{display:inline-grid;place-items:center;width:14px;height:14px;margin-left:1px;padding:0;border:0;border-radius:50%;background:transparent;color:currentColor;opacity:0;cursor:pointer;font:700 12px/1 system-ui,sans-serif}.td-h3-mention:hover .td-h3-chip-remove,.td-h3-dialogue:hover .td-h3-chip-remove,.td-h3-chip-remove:focus{opacity:.72}.td-h3-chip-remove:hover{opacity:1;background:rgba(255,255,255,.1)}",
        ".td-h3-dialogue{display:inline-flex;align-items:center;gap:3px;margin:0 2px;padding:1px 3px 1px 7px;border:1px solid rgba(25,214,174,.18);border-radius:5px;outline:0;background:rgba(18,145,118,.16);color:#8df5dd;vertical-align:1px;font:500 12px/22px Consolas,'Microsoft YaHei',monospace}",
        ".td-h3-dialogue:focus-within{border-color:rgba(45,239,198,.38);background:rgba(20,164,132,.23)}.td-h3-dialogue-text{min-width:10px;outline:0;white-space:pre-wrap}.td-h3-dialogue-text:empty::before{content:'输入台词';color:rgba(141,245,221,.42);pointer-events:none}",
        ".td-h3-menu{position:fixed;z-index:10120;width:270px;max-height:320px;overflow:auto;padding:6px;border:1px solid rgba(60,218,199,.22);border-radius:11px;background:rgba(24,24,24,.98);box-shadow:0 18px 55px rgba(0,0,0,.58);backdrop-filter:blur(12px);color:#eee;font-family:system-ui,'Microsoft YaHei',sans-serif}",
        ".td-h3-menu-title{padding:7px 9px 8px;color:#858b91;font-size:11px}.td-h3-menu-empty{padding:12px 10px;color:#777;font-size:12px;line-height:1.5}",
        ".td-h3-menu-item{display:grid;grid-template-columns:36px minmax(0,1fr);gap:9px;align-items:center;padding:7px 8px;border-radius:8px;cursor:pointer}.td-h3-menu-item:hover{background:rgba(38,204,177,.11)}",
        ".td-h3-menu-icon{display:grid;place-items:center;width:34px;height:34px;border-radius:8px;background:linear-gradient(135deg,#6d62ff,#32cbe3);color:#fff;font-size:10px;font-weight:800}",
        ".td-h3-menu-main{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#dfe7e7;font-size:12px;font-weight:650}.td-h3-menu-sub{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:2px;color:#75807f;font-size:10px}",
    ].join("");
    document.head.appendChild(style);
}

function mediaIndex(name) {
    const match = String(name || "").match(/^media_(\d+)$/);
    return match ? Number(match[1]) : 0;
}

function findInput(node, name) {
    return (node.inputs || []).find((input) => input.name === name);
}

function currentMode(node) {
    const value = String((node.widgets || []).find((widget) => widget.name === "task_type")?.value || "");
    return value.match(/Ref2VA|FL2VA|I2VA|L2VA|T2VA/)?.[0] || "T2VA";
}

function ensureMediaInput(node, index, type = "*", label = "素材 " + index) {
    const name = MEDIA_PREFIX + index;
    let input = findInput(node, name);
    if (!input) {
        node.addInput(name, type);
        input = findInput(node, name);
    }
    if (input) {
        input.type = type;
        input.label = label;
        input.localized_name = label;
    }
    return input;
}

function inputConnected(input) {
    return input?.link != null || (Array.isArray(input?.links) && input.links.length > 0);
}

function syncMediaInputs(node) {
    const mode = currentMode(node);
    const fixed = {
        T2VA: [],
        I2VA: [{ type: "IMAGE", label: "首帧图片" }],
        FL2VA: [{ type: "IMAGE", label: "首帧图片" }, { type: "IMAGE", label: "尾帧图片" }],
        L2VA: [{ type: "IMAGE", label: "尾帧图片" }],
    }[mode];

    if (fixed) {
        for (let index = 1; index <= fixed.length; index++) {
            ensureMediaInput(node, index, fixed[index - 1].type, fixed[index - 1].label);
        }
        for (let position = (node.inputs || []).length - 1; position >= 0; position--) {
            const index = mediaIndex(node.inputs[position].name);
            if (index > fixed.length) node.removeInput(position);
        }
    } else {
        const mediaInputs = (node.inputs || []).filter((input) => mediaIndex(input.name) > 0);
        let highestConnected = 0;
        for (const input of mediaInputs) {
            if (inputConnected(input)) highestConnected = Math.max(highestConnected, mediaIndex(input.name));
        }
        const wanted = Math.min(MAX_MEDIA, Math.max(1, highestConnected + 1));
        for (let index = 1; index <= wanted; index++) {
            ensureMediaInput(node, index, "*", "参考素材 " + index);
        }
        for (let position = (node.inputs || []).length - 1; position >= 0; position--) {
            const input = node.inputs[position];
            const index = mediaIndex(input.name);
            if (index > wanted && !inputConnected(input)) node.removeInput(position);
        }
    }
    node.setSize([Math.max(node.size?.[0] || 0, 430), 335]);
    refreshMentionChips(node);
    node.graph?.setDirtyCanvas(true, true);
}

function sourceForInput(node, input) {
    const linkId = input?.link ?? (Array.isArray(input?.links) ? input.links[0] : null);
    const link = linkId != null ? node.graph?.links?.[linkId] : null;
    if (!link) return null;
    const source = node.graph?.getNodeById?.(link.origin_id);
    const output = source?.outputs?.[link.origin_slot];
    return { source, output };
}

function inferKind(source, output) {
    const haystack = [
        output?.type,
        output?.name,
        source?.comfyClass,
        source?.type,
        source?.title,
    ].filter(Boolean).join(" ").toLowerCase();
    if (haystack.includes("audio") || haystack.includes("声音") || haystack.includes("音频")) return "audio";
    if (haystack.includes("video") || haystack.includes("视频")) return "video";
    return "image";
}

function sourceName(source, fallback) {
    const preferred = (source?.widgets || []).find((widget) => {
        const name = String(widget?.name || "").toLowerCase();
        return ["image", "video", "audio", "filename", "file"].some((part) => name.includes(part));
    });
    const value = typeof preferred?.value === "string" ? preferred.value.trim() : "";
    return value || source?.title || fallback;
}

function sourcePreview(source) {
    const candidates = [source?.imgs?.[0], source?.image, source?.preview];
    for (const candidate of candidates) {
        if (typeof candidate?.src === "string" && candidate.src) return candidate.src;
    }
    return "";
}

function connectedResources(node) {
    const mode = currentMode(node);
    const counters = { image: 0, video: 0, audio: 0 };
    const resources = [];
    const inputs = (node.inputs || [])
        .filter((input) => mediaIndex(input.name) > 0 && inputConnected(input))
        .sort((left, right) => mediaIndex(left.name) - mediaIndex(right.name));
    for (const input of inputs) {
        const details = sourceForInput(node, input);
        const kind = inferKind(details?.source, details?.output);
        counters[kind] += 1;
        const number = counters[kind];
        const h3Type = kind === "image" ? "Picture" : kind === "video" ? "Video" : "Audio";
        const chinese = kind === "image" ? "图片" : kind === "video" ? "视频" : "音频";
        let h3Number = number;
        let mention = "@" + chinese + number;
        if (mode === "I2VA") {
            h3Number = 1;
            mention = "@首帧图片";
        }
        if (mode === "FL2VA") {
            h3Number = mediaIndex(input.name);
            mention = h3Number === 1 ? "@首帧图片" : "@尾帧图片";
        }
        if (mode === "L2VA") {
            h3Number = 1;
            mention = "@尾帧图片";
        }
        resources.push({
            token: "<" + h3Type + " " + h3Number + ">",
            mention,
            detail: sourceName(details?.source, "素材 " + mediaIndex(input.name)),
            preview: sourcePreview(details?.source),
            kind,
            icon: kind === "image" ? "图" : kind === "video" ? "视" : "音",
        });
    }
    return resources;
}

function fallbackMention(token) {
    const match = String(token || "").match(/^<(Picture|Video|Audio) (\d+)>$/);
    if (!match) return "@" + token;
    const label = match[1] === "Picture" ? "图片" : match[1] === "Video" ? "视频" : "音频";
    return "@" + label + match[2];
}

function kindFromToken(token) {
    if (String(token).startsWith("<Video")) return "video";
    if (String(token).startsWith("<Audio")) return "audio";
    return "image";
}

function makeMentionChip(resource) {
    const chip = document.createElement("span");
    chip.className = "td-h3-mention is-" + resource.kind;
    chip.contentEditable = "false";
    chip.dataset.token = resource.token;
    chip.title = resource.detail || resource.token;
    const icon = document.createElement("span");
    icon.className = "td-h3-mention-icon";
    if (resource.preview) {
        icon.style.backgroundImage = "url(\"" + resource.preview.replaceAll('"', '%22') + "\")";
        icon.style.backgroundSize = "cover";
        icon.style.backgroundPosition = "center";
    } else {
        icon.textContent = resource.icon;
    }
    const label = document.createElement("span");
    label.className = "td-h3-mention-label";
    label.textContent = resource.mention;
    const remove = document.createElement("button");
    remove.className = "td-h3-chip-remove";
    remove.type = "button";
    remove.tabIndex = -1;
    remove.textContent = "×";
    remove.title = "删除引用";
    remove.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        event.stopPropagation();
        removeStructuredChip(chip);
    });
    chip.append(icon, label, remove);
    return chip;
}

function makeDialogueChip(language, text) {
    const chip = document.createElement("span");
    chip.className = "td-h3-dialogue";
    chip.contentEditable = "false";
    chip.dataset.language = language || "Language";
    chip.title = "[" + chip.dataset.language + "]";
    const editable = document.createElement("span");
    editable.className = "td-h3-dialogue-text";
    editable.contentEditable = "true";
    editable.spellcheck = false;
    editable.textContent = text || "";
    const remove = document.createElement("button");
    remove.className = "td-h3-chip-remove";
    remove.type = "button";
    remove.tabIndex = -1;
    remove.textContent = "×";
    remove.title = "删除台词块";
    remove.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        event.stopPropagation();
        removeStructuredChip(chip);
    });
    editable.addEventListener("keydown", (event) => handleDialogueKeydown(event, chip, editable));
    editable.addEventListener("input", () => {
        if (!String(editable.textContent || "").replaceAll(ZERO_WIDTH, "")) removeStructuredChip(chip);
    });
    editable.addEventListener("blur", () => {
        setTimeout(() => {
            if (chip.isConnected && !String(editable.textContent || "").replaceAll(ZERO_WIDTH, "").trim()) {
                removeStructuredChip(chip);
            }
        }, 0);
    });
    editable.addEventListener("paste", (event) => {
        event.preventDefault();
        const value = event.clipboardData?.getData("text/plain") || "";
        document.execCommand("insertText", false, value);
    });
    chip.append(editable, remove);
    return chip;
}

function chipEditor(chip) {
    return chip.closest(".td-h3-editor");
}

function caretTextNode(chip, direction, prefix = "") {
    const editor = chipEditor(chip);
    if (!editor) return;
    let text = direction === "before" ? chip.previousSibling : chip.nextSibling;
    if (text?.nodeType !== Node.TEXT_NODE) {
        text = document.createTextNode("");
        if (direction === "before") chip.before(text);
        else chip.after(text);
    }
    if (direction === "before") text.nodeValue = String(text.nodeValue || "") + prefix;
    else text.nodeValue = prefix + String(text.nodeValue || "");
    if (!text.nodeValue) text.nodeValue = ZERO_WIDTH;
    const offset = direction === "before"
        ? text.nodeValue.length
        : prefix.length + (text.nodeValue.startsWith(prefix + ZERO_WIDTH) ? 1 : 0);
    const range = document.createRange();
    range.setStart(text, Math.min(offset, text.nodeValue.length));
    range.collapse(true);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    editor.dispatchEvent(new Event("input", { bubbles: true }));
    editor.focus();
}

function removeStructuredChip(chip) {
    const editor = chipEditor(chip);
    if (!editor || !chip.isConnected) return;
    let landing = chip.nextSibling;
    if (landing?.nodeType !== Node.TEXT_NODE) {
        landing = document.createTextNode(ZERO_WIDTH);
        chip.after(landing);
    }
    chip.remove();
    const range = document.createRange();
    range.setStart(landing, String(landing.nodeValue || "").startsWith(ZERO_WIDTH) ? 1 : 0);
    range.collapse(true);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    editor.dispatchEvent(new Event("input", { bubbles: true }));
    editor.focus();
}

function isStructuredChip(node) {
    return node?.nodeType === Node.ELEMENT_NODE
        && (node.classList.contains("td-h3-dialogue") || node.classList.contains("td-h3-mention"));
}

function topLevelEditorChild(editor, node) {
    let current = node;
    while (current && current.parentNode !== editor) current = current.parentNode;
    return current?.parentNode === editor ? current : null;
}

function adjacentStructuredChip(editor, direction) {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return null;
    const range = selection.getRangeAt(0);
    if (!range.collapsed || !editor.contains(range.startContainer)) return null;

    const container = range.startContainer;
    const offset = range.startOffset;
    let candidate = null;
    if (container === editor) {
        candidate = editor.childNodes[offset + (direction === "before" ? -1 : 0)] || null;
    } else {
        const child = topLevelEditorChild(editor, container);
        if (!child) return null;
        if (child.nodeType === Node.TEXT_NODE) {
            const value = String(child.nodeValue || "");
            const between = direction === "before" ? value.slice(0, offset) : value.slice(offset);
            if (between.replaceAll(ZERO_WIDTH, "").length) return null;
            candidate = direction === "before" ? child.previousSibling : child.nextSibling;
        } else {
            return null;
        }
    }
    while (candidate?.nodeType === Node.TEXT_NODE
        && !String(candidate.nodeValue || "").replaceAll(ZERO_WIDTH, "")) {
        candidate = direction === "before" ? candidate.previousSibling : candidate.nextSibling;
    }
    return isStructuredChip(candidate) ? candidate : null;
}

function deleteSelectedStructuredContent(editor) {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return false;
    const range = selection.getRangeAt(0);
    if (range.collapsed || !editor.contains(range.commonAncestorContainer)) return false;
    const chips = [...editor.querySelectorAll(".td-h3-dialogue, .td-h3-mention")]
        .filter((chip) => range.intersectsNode(chip));
    if (!chips.length) return false;

    range.deleteContents();
    for (const chip of chips) {
        if (chip.isConnected) chip.remove();
    }
    const landing = document.createTextNode(ZERO_WIDTH);
    range.insertNode(landing);
    range.setStart(landing, 1);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    editor.normalize();
    editor.dispatchEvent(new Event("input", { bubbles: true }));
    editor.focus();
    return true;
}

function handleEditorStructuredDelete(event, editor) {
    if (event.defaultPrevented || event.isComposing || !["Backspace", "Delete"].includes(event.key)) return;
    if (event.target.closest?.(".td-h3-dialogue-text")) return;
    if (deleteSelectedStructuredContent(editor)) {
        event.preventDefault();
        return;
    }
    const direction = event.key === "Backspace" ? "before" : "after";
    const chip = adjacentStructuredChip(editor, direction);
    if (!chip) return;
    event.preventDefault();
    removeStructuredChip(chip);
}

function caretOffsetWithin(element) {
    const selection = window.getSelection();
    if (!selection?.rangeCount || !element.contains(selection.anchorNode)) return null;
    const range = selection.getRangeAt(0);
    if (!range.collapsed) return null;
    const before = document.createRange();
    before.selectNodeContents(element);
    before.setEnd(range.startContainer, range.startOffset);
    return before.toString().length;
}

function handleDialogueKeydown(event, chip, editable) {
    const offset = caretOffsetWithin(editable);
    const length = String(editable.textContent || "").length;
    if (event.key === "Enter") {
        event.preventDefault();
        caretTextNode(chip, "after", "\n");
        return;
    }
    if (event.key === "Escape" || event.key === "Tab") {
        event.preventDefault();
        caretTextNode(chip, event.shiftKey ? "before" : "after");
        return;
    }
    if (event.key === "ArrowRight" && offset === length) {
        event.preventDefault();
        caretTextNode(chip, "after");
        return;
    }
    if (event.key === "ArrowLeft" && offset === 0) {
        event.preventDefault();
        caretTextNode(chip, "before");
        return;
    }
    if ((event.key === "Backspace" || event.key === "Delete") && length === 0) {
        event.preventDefault();
        removeStructuredChip(chip);
    }
}

function serializeEditor(editor) {
    let output = "";
    function walk(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            output += String(node.nodeValue || "").replaceAll(ZERO_WIDTH, "");
            return;
        }
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        if (node.classList.contains("td-h3-mention")) {
            output += node.dataset.token || "";
            return;
        }
        if (node.classList.contains("td-h3-dialogue")) {
            const language = node.dataset.language || "Language";
            const dialogue = String(node.querySelector(".td-h3-dialogue-text")?.textContent || "").replaceAll(ZERO_WIDTH, "").trim();
            output += "<d>[" + language + "] " + dialogue + "</d>";
            return;
        }
        if (node.tagName === "BR") {
            output += "\n";
            return;
        }
        const isBlock = node !== editor && ["DIV", "P"].includes(node.tagName);
        if (isBlock && output && !output.endsWith("\n")) output += "\n";
        for (const child of node.childNodes) walk(child);
        if (isBlock && !output.endsWith("\n")) output += "\n";
    }
    walk(editor);
    return output.replace(/\n{3,}/g, "\n\n").trim();
}

function renderSerialized(editor, value, node) {
    editor.replaceChildren();
    const resources = connectedResources(node);
    const source = String(value || "");
    const pattern = /<(Picture|Video|Audio) \d+>|<d>\[([^\]]+)\]\s*([\s\S]*?)<\/d>/g;
    let cursor = 0;
    let match;
    while ((match = pattern.exec(source))) {
        if (match.index > cursor) editor.appendChild(document.createTextNode(source.slice(cursor, match.index)));
        if (match[0].startsWith("<d>")) {
            editor.appendChild(makeDialogueChip(match[2], match[3]));
        } else {
            const resource = resources.find((item) => item.token === match[0]) || {
                token: match[0],
                mention: fallbackMention(match[0]),
                detail: match[0],
                kind: kindFromToken(match[0]),
                icon: kindFromToken(match[0]) === "image" ? "图" : kindFromToken(match[0]) === "video" ? "视" : "音",
            };
            editor.appendChild(makeMentionChip(resource));
        }
        editor.appendChild(document.createTextNode(ZERO_WIDTH));
        cursor = pattern.lastIndex;
    }
    if (cursor < source.length) editor.appendChild(document.createTextNode(source.slice(cursor)));
}

function refreshMentionChips(node) {
    const editor = node.__tdH3Editor;
    if (!editor) return;
    const resources = connectedResources(node);
    for (const chip of editor.querySelectorAll(".td-h3-mention")) {
        const token = chip.dataset.token || "";
        const resource = resources.find((item) => item.token === token);
        const label = chip.querySelector(".td-h3-mention-label");
        if (label) label.textContent = resource?.mention || fallbackMention(token);
        chip.title = resource?.detail || token;
    }
}

let activeMenu = null;

function closeMenu() {
    activeMenu?.remove();
    activeMenu = null;
}

function triggerRange(editor, marker) {
    const selection = window.getSelection();
    if (!selection?.rangeCount || !editor.contains(selection.anchorNode)) return null;
    const node = selection.anchorNode;
    const offset = selection.anchorOffset;
    if (node?.nodeType !== Node.TEXT_NODE || offset < 1 || node.nodeValue?.[offset - 1] !== marker) return null;
    const range = document.createRange();
    range.setStart(node, offset - 1);
    range.setEnd(node, offset);
    return range;
}

function placeCaretAfter(node) {
    const spacer = document.createTextNode(ZERO_WIDTH);
    node.after(spacer);
    const range = document.createRange();
    range.setStart(spacer, 1);
    range.collapse(true);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

function insertMention(editor, range, resource) {
    range.deleteContents();
    const chip = makeMentionChip(resource);
    range.insertNode(chip);
    placeCaretAfter(chip);
    editor.dispatchEvent(new Event("input", { bubbles: true }));
    editor.focus();
}

function insertDialogue(editor, range, language) {
    range.deleteContents();
    const chip = makeDialogueChip(language, "");
    range.insertNode(chip);
    chip.after(document.createTextNode(ZERO_WIDTH));
    const editable = chip.querySelector(".td-h3-dialogue-text");
    const selection = window.getSelection();
    const content = document.createRange();
    content.selectNodeContents(editable);
    content.collapse(true);
    selection.removeAllRanges();
    selection.addRange(content);
    editor.dispatchEvent(new Event("input", { bubbles: true }));
    editable.focus();
}

function menuItem(iconText, titleText, detailText, action) {
    const item = document.createElement("div");
    item.className = "td-h3-menu-item";
    const icon = document.createElement("span");
    icon.className = "td-h3-menu-icon";
    icon.textContent = iconText;
    const text = document.createElement("div");
    const main = document.createElement("div");
    main.className = "td-h3-menu-main";
    main.textContent = titleText;
    const sub = document.createElement("div");
    sub.className = "td-h3-menu-sub";
    sub.textContent = detailText;
    text.append(main, sub);
    item.append(icon, text);
    item.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        action();
        closeMenu();
    });
    return item;
}

function positionMenu(menu, editor) {
    const rect = editor.getBoundingClientRect();
    menu.style.left = Math.max(8, Math.min(window.innerWidth - 278, rect.left + 9)) + "px";
    const below = rect.bottom + 5;
    menu.style.top = (below + 320 < window.innerHeight ? below : Math.max(8, rect.top - 325)) + "px";
}

function openResourceMenu(node, editor, range) {
    closeMenu();
    const menu = document.createElement("div");
    menu.className = "td-h3-menu";
    const title = document.createElement("div");
    title.className = "td-h3-menu-title";
    title.textContent = "引用已连接素材";
    menu.appendChild(title);
    const resources = connectedResources(node);
    if (!resources.length) {
        const empty = document.createElement("div");
        empty.className = "td-h3-menu-empty";
        empty.textContent = currentMode(node) === "T2VA" ? "文生视频不需要参考素材。" : "请先连接任务所需的图片、视频或音频。";
        menu.appendChild(empty);
    } else {
        for (const resource of resources) {
            menu.appendChild(menuItem(resource.icon, resource.mention, resource.detail, () => {
                insertMention(editor, range, resource);
            }));
        }
    }
    document.body.appendChild(menu);
    positionMenu(menu, editor);
    activeMenu = menu;
}

function openDialogueMenu(editor, range) {
    closeMenu();
    const menu = document.createElement("div");
    menu.className = "td-h3-menu";
    const title = document.createElement("div");
    title.className = "td-h3-menu-title";
    title.textContent = "插入 H3 台词块";
    menu.appendChild(title);
    const options = [
        ["中", "中文台词", "Chinese"],
        ["EN", "英文台词", "English"],
        ["日", "日文台词", "Japanese"],
        ["韩", "韩文台词", "Korean"],
        ["语", "其他语言", "Language"],
    ];
    for (const option of options) {
        menu.appendChild(menuItem(option[0], option[1], "<d>[" + option[2] + "] ...</d>", () => {
            insertDialogue(editor, range, option[2]);
        }));
    }
    document.body.appendChild(menu);
    positionMenu(menu, editor);
    activeMenu = menu;
}

function installEditor(node) {
    if (node.__tdH3EditorInstalled) return;
    const promptWidget = (node.widgets || []).find((widget) => widget.name === "user_request");
    if (!promptWidget) return;
    node.__tdH3EditorInstalled = true;

    const wrap = document.createElement("div");
    wrap.className = "td-h3-editor-wrap";
    const editor = document.createElement("div");
    editor.className = "td-h3-editor";
    editor.contentEditable = "true";
    editor.spellcheck = false;
    editor.dataset.placeholder = "描述你想生成的视频；输入 @ 引用素材，输入 # 插入台词…";
    renderSerialized(editor, promptWidget.value, node);

    const tip = document.createElement("div");
    tip.className = "td-h3-editor-tip";
    const left = document.createElement("span");
    left.innerHTML = "<b>@</b> 素材引用";
    const right = document.createElement("span");
    right.innerHTML = "<b>#</b> 台词块";
    tip.append(left, right);
    wrap.append(editor, tip);

    editor.addEventListener("input", () => {
        promptWidget.value = serializeEditor(editor);
        promptWidget.callback?.(promptWidget.value);
        const resourceTrigger = triggerRange(editor, "@");
        const dialogueTrigger = triggerRange(editor, "#");
        if (resourceTrigger) openResourceMenu(node, editor, resourceTrigger);
        else if (dialogueTrigger) openDialogueMenu(editor, dialogueTrigger);
        else closeMenu();
    });
    editor.addEventListener("keydown", (event) => {
        handleEditorStructuredDelete(event, editor);
        if (event.key === "Escape") closeMenu();
    });
    editor.addEventListener("blur", () => setTimeout(closeMenu, 160));

    promptWidget.type = "hidden";
    promptWidget.hidden = true;
    promptWidget.label = "";
    promptWidget.options = { ...(promptWidget.options || {}), hidden: true };
    promptWidget.computeSize = () => [0, -4];
    if (typeof node.addDOMWidget === "function") {
        const widget = node.addDOMWidget("td_h3_prompt_editor", "td_h3_prompt_editor", wrap, {
            serialize: false,
            getValue: () => serializeEditor(editor),
            setValue: (value) => {
                promptWidget.value = String(value || "");
                renderSerialized(editor, promptWidget.value, node);
            },
        });
        wrap.style.height = "190px";
        wrap.style.minHeight = "190px";
        wrap.style.maxHeight = "190px";
        widget.computeSize = (width) => [width, 200];
    } else {
        promptWidget.type = "customtext";
        promptWidget.element = wrap;
        promptWidget.inputEl = editor;
    }
    node.__tdH3Editor = editor;
}

function installModeHandler(node) {
    if (node.__tdH3ModeHandlerInstalled) return;
    const widget = (node.widgets || []).find((item) => item.name === "task_type");
    if (!widget) return;
    node.__tdH3ModeHandlerInstalled = true;
    const original = widget.callback;
    widget.callback = function tdH3ModeChanged() {
        const result = original?.apply(this, arguments);
        setTimeout(() => syncMediaInputs(node), 0);
        return result;
    };
}

function localizeNode(node) {
    addStyle();
    node.title = "TD MiniMax H3 提示词";
    node.color = "#253152";
    node.bgcolor = "#111827";
    const labels = {
        task_type: "任务类型",
        duration: "视频时长（秒）",
        user_request: "用户需求",
        api_key: "API Key",
    };
    for (const widget of node.widgets || []) {
        if (labels[widget.name]) widget.label = labels[widget.name];
    }
    installModeHandler(node);
    installEditor(node);
    syncMediaInputs(node);
    if (node.__tdH3Editor) {
        const promptWidget = (node.widgets || []).find((widget) => widget.name === "user_request");
        const stored = String(promptWidget?.value || "");
        if (serializeEditor(node.__tdH3Editor) !== stored) renderSerialized(node.__tdH3Editor, stored, node);
    }
}

document.addEventListener("pointerdown", (event) => {
    if (activeMenu && !activeMenu.contains(event.target)) closeMenu();
}, true);

app.registerExtension({
    name: "TD.MiniMaxH3Prompt",
    beforeRegisterNodeDef(nodeType, nodeData) {
        if (nodeData?.name !== NODE_CLASS) return;
        const originalCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function tdH3Created() {
            const result = originalCreated?.apply(this, arguments);
            localizeNode(this);
            return result;
        };
        const originalConfigure = nodeType.prototype.onConfigure;
        nodeType.prototype.onConfigure = function tdH3Configure(info) {
            const result = originalConfigure?.apply(this, arguments);
            setTimeout(() => localizeNode(this), 0);
            return result;
        };
        const originalConnections = nodeType.prototype.onConnectionsChange;
        nodeType.prototype.onConnectionsChange = function tdH3Connections() {
            const result = originalConnections?.apply(this, arguments);
            setTimeout(() => syncMediaInputs(this), 0);
            return result;
        };
    },
});
