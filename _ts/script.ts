function localTimeConvert(elem: Element) {
    let datetime = new Date(elem.getAttribute("datetime")!);
    elem.innerHTML = datetime.toLocaleDateString(undefined);
}

function numberDelimiterFormat(elem: Element) {
    const regex = /\B(?=(\d{3})+(?!\d))/g;
    let num = elem.getAttribute("number-delimiter");
    elem.innerHTML = num!.toString().replace(regex, ",");
}

document.querySelectorAll("time.local-time")
    .forEach((elem) => localTimeConvert(elem));
document.querySelectorAll("[number-delimiter]")
    .forEach((elem) => numberDelimiterFormat(elem));