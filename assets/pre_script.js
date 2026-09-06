"use strict";
/**
 * 첫 페인트 전에 실행되는 스크립트(`<head>` 에서 동기 로드).
 *
 * 저장된 테마 선택을 `<html data-theme>` 에 즉시 반영해서, 다크를 고른 사용자가
 * 흰 화면을 한 번 봤다가 어두워지는 깜빡임을 겪지 않게 한다. 기본값은 "system"
 * 이며, 이때는 속성을 붙이지 않고 CSS 의 `prefers-color-scheme` 에 맡긴다.
 */
const THEME_STORAGE_KEY = "soma0sd:theme";
function isThemeMode(value) {
    return value === "system" || value === "light" || value === "dark";
}
function readStoredTheme() {
    try {
        const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
        if (isThemeMode(stored)) {
            return stored;
        }
    }
    catch (err) {
        // 시크릿 모드나 저장소가 차단된 환경. 시스템 설정을 그대로 쓴다.
    }
    return "system";
}
function applyTheme(mode) {
    const root = document.documentElement;
    if (mode === "system") {
        root.removeAttribute("data-theme");
    }
    else {
        root.setAttribute("data-theme", mode);
    }
}
applyTheme(readStoredTheme());
//# sourceMappingURL=pre_script.js.map