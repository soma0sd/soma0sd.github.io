"use strict";
function localTimeConvert(elem) {
    let datetime = new Date(elem.getAttribute("datetime"));
    elem.innerHTML = datetime.toLocaleDateString(undefined);
}
function numberDelimiterFormat(elem) {
    const regex = /\B(?=(\d{3})+(?!\d))/g;
    let num = elem.getAttribute("number-delimiter");
    elem.innerHTML = num.toString().replace(regex, ",");
}
document.querySelectorAll("time.local-time")
    .forEach((elem) => localTimeConvert(elem));
document.querySelectorAll("[number-delimiter]")
    .forEach((elem) => numberDelimiterFormat(elem));
//# sourceMappingURL=script.js.map