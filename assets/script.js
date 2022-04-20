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
const langDeviconDict = {
    'sass': 'devicon-sass-original',
    'scss': 'devicon-sass-original',
    'html': 'devicon-html5-plain',
    'css': 'devicon-css3-plain',
    'javascript': 'devicon-javascript-plain',
    'typescript': 'devicon-typescript-plain',
    'ruby': 'devicon-ruby-plain',
    'python': 'devicon-python-plain',
    'jupyter notebook': 'devicon-jupyter-plain',
    'c': 'devicon-c-plain',
    'c++': 'devicon-cplusplus-plain',
    'c#': 'devicon-csharp-plain',
    'cuda': 'devicon-cplusplus-plain',
    'cmake': 'devicon-cmake-plain',
    'shell': 'devicon-bash-plain',
    'dockerfile': 'devicon-docker-plain'
};
function setupDevicons(elem) {
    let langName = elem.getAttribute("devicon").toLowerCase();
    if (langDeviconDict.hasOwnProperty(langName)) {
        elem.classList.add(langDeviconDict[langName]);
    }
    else {
        elem.innerHTML = `<svg fill="${elem.style.color}" aria-hidden="true" height="16" width="16" viewbox="0 0 16 16" version="1.1"><path d="M8 4a4 4 0 100 8 4 4 0 000-8z" fill-rule="evenodd"></path></svg>`;
    }
}
document.querySelectorAll("time.local-time")
    .forEach((elem) => localTimeConvert(elem));
document.querySelectorAll("[number-delimiter]")
    .forEach((elem) => numberDelimiterFormat(elem));
document.querySelectorAll("i[devicon]")
    .forEach((elem) => setupDevicons(elem));
//# sourceMappingURL=script.js.map