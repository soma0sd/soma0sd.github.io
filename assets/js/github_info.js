"use strict";
var github_API_url = 'https://api.github.com';
var username = 'soma0sd';
var info_repos = "<h2 class=\"display-text name\"></h2>\n<a class=\"repo_url\"></a>\n<u class=\"created_at\"></u>\n<u class=\"updated_at\"></u>\n<b class=\"language\"></b>\n<p class=\"description\"></p>";
requestJSON(github_API_url + "/users/" + username + "/repos?sort=updated&direction=desc", // 사용자 레포지터리
function (data) {
    var content = document.querySelector("section#github_repos");
    data.forEach(function (repo) {
        var _a, _b, _c, _d, _e, _f;
        var template = document.createElement('DIV');
        template.classList.add('item');
        template.innerHTML = info_repos;
        (_a = template.querySelectorAll('.name')) === null || _a === void 0 ? void 0 : _a.forEach(function (elem) { elem.innerHTML = repo.name; });
        (_b = template.querySelectorAll('.description')) === null || _b === void 0 ? void 0 : _b.forEach(function (elem) { elem.innerHTML = repo.description; });
        (_c = template.querySelectorAll('.created_at')) === null || _c === void 0 ? void 0 : _c.forEach(function (elem) {
            elem.innerHTML = (new Date(repo.created_at)).toLocaleDateString();
        });
        (_d = template.querySelectorAll('.updated_at')) === null || _d === void 0 ? void 0 : _d.forEach(function (elem) {
            elem.innerHTML = (new Date(repo.updated_at)).toLocaleDateString();
        });
        (_e = template.querySelectorAll('.language')) === null || _e === void 0 ? void 0 : _e.forEach(function (elem) {
            var langTx = "";
            requestJSON(repo.languages_url, function (langs) { for (var key in langs) {
                langTx += "<span>" + key + "(" + langs[key] + ")</span>";
            } });
            elem.innerHTML = langTx;
        });
        (_f = content) === null || _f === void 0 ? void 0 : _f.append(template);
        // let name: string = repo.name;
        // let repo_url: string = repo.html_url;
        // let description: string = repo.description;
        // let since: Date = new Date(repo.created_at);
        // let update: Date = new Date(repo.updated_at);
        // let size: number = repo.size;
        // let lang: string = repo.language;
        // let has_page: boolean = repo.has_pages;
        // if (item.querySelector);
    });
});
function requestJSON(url, callback) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'json';
    request.onload = function () { callback(request.response); };
    request.send();
}
