"use strict";
/**
 * DOM 이 만들어진 뒤 실행되는 점진적 향상 스크립트(`defer` 로드).
 *
 * 이 파일이 실패해도 화면은 그대로 쓸 수 있어야 한다. 서버가 그린 값이 이미
 * 읽을 수 있는 상태이고, 여기서는 그 값을 더 보기 좋게 다듬기만 한다.
 * (커밋 목록 접기·펼치기는 네이티브 `<details>` 가 담당하므로 자바스크립트가 없다.)
 */
// -----------------------------------------------------------------------------
// UTC 시각 -> 열람자 현지 표기
//   원본 값은 `datetime` 속성에 남겨 두므로 몇 번 실행해도 결과가 같다.
// -----------------------------------------------------------------------------
function localizeTime(elem) {
    const raw = elem.getAttribute("datetime");
    if (!raw) {
        return;
    }
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) {
        return;
    }
    elem.textContent = parsed.toLocaleDateString(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
    elem.title = parsed.toLocaleString();
}
// -----------------------------------------------------------------------------
// 천 단위 구분 기호
//   원본 값은 `data-number` 속성에 있고, textContent 로만 쓴다(innerHTML 아님).
// -----------------------------------------------------------------------------
function formatNumber(elem) {
    const raw = elem.getAttribute("data-number");
    if (raw === null || raw.trim() === "") {
        return;
    }
    const value = Number(raw);
    if (!Number.isFinite(value)) {
        return;
    }
    elem.textContent = value.toLocaleString();
}
const THEME_ORDER = ["system", "light", "dark"];
const THEME_VIEW = {
    system: { icon: "#i-system", label: "시스템 설정" },
    light: { icon: "#i-sun", label: "라이트" },
    dark: { icon: "#i-moon", label: "다크" },
};
function storeTheme(mode) {
    try {
        window.localStorage.setItem(THEME_STORAGE_KEY, mode);
    }
    catch (err) {
        // 저장할 수 없으면 이번 방문에만 적용된다.
    }
}
function renderThemeButton(button, mode) {
    const view = THEME_VIEW[mode];
    const next = THEME_VIEW[THEME_ORDER[(THEME_ORDER.indexOf(mode) + 1) % THEME_ORDER.length]];
    const use = button.querySelector("use");
    if (use) {
        use.setAttribute("href", view.icon);
    }
    const label = button.querySelector(".theme-toggle__label");
    if (label) {
        label.textContent = view.label;
    }
    button.setAttribute("aria-label", `화면 테마: ${view.label}. 누르면 ${next.label}(으)로 바뀝니다.`);
}
function setupThemeToggle() {
    const button = document.getElementById("theme-toggle");
    if (!(button instanceof HTMLButtonElement)) {
        return;
    }
    let mode = readStoredTheme();
    renderThemeButton(button, mode);
    button.addEventListener("click", () => {
        mode = THEME_ORDER[(THEME_ORDER.indexOf(mode) + 1) % THEME_ORDER.length];
        applyTheme(mode);
        storeTheme(mode);
        renderThemeButton(button, mode);
    });
}
// -----------------------------------------------------------------------------
// 현재 보고 있는 구획을 상단 메뉴에 표시
// -----------------------------------------------------------------------------
function setupSectionHighlight() {
    if (!("IntersectionObserver" in window)) {
        return;
    }
    const links = Array.from(document.querySelectorAll(".site-nav__links a"));
    const watched = [];
    for (const link of links) {
        const id = link.hash.replace("#", "");
        const section = id ? document.getElementById(id) : null;
        if (section) {
            watched.push({ id: id, section: section, link: link });
        }
    }
    if (watched.length === 0) {
        return;
    }
    const visibleHeight = new Map();
    const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            visibleHeight.set(entry.target.id, entry.intersectionRect.height);
        }
        let currentId = "";
        let largest = 0;
        visibleHeight.forEach((height, id) => {
            if (height > largest) {
                largest = height;
                currentId = id;
            }
        });
        for (const item of watched) {
            if (item.id === currentId && largest > 0) {
                item.link.setAttribute("aria-current", "true");
            }
            else {
                item.link.removeAttribute("aria-current");
            }
        }
    }, { threshold: [0, 0.05, 0.25, 0.5, 0.75, 1] });
    for (const item of watched) {
        observer.observe(item.section);
    }
}
document.querySelectorAll("time[datetime]").forEach(localizeTime);
document.querySelectorAll("[data-number]").forEach(formatNumber);
setupThemeToggle();
setupSectionHighlight();
//# sourceMappingURL=post_script.js.map