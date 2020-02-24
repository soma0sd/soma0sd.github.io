var github_API_url: string = 'https://api.github.com';
var username: string = 'soma0sd';

var info_repos: string = `<h2 class="display-text name"></h2>
<a class="repo_url"></a>
<u class="created_at"></u>
<u class="updated_at"></u>
<b class="language"></b>
<p class="description"></p>`;

requestJSON(
    `${github_API_url}/users/${username}/repos?sort=updated&direction=desc`, // 사용자 레포지터리
    (data: any) => {
        var content = document.querySelector("section#github_repos");
        data.forEach((repo: any) => {
            let template: Element = document.createElement('DIV');
            template.classList.add('item');
            template.innerHTML = info_repos;
            template.querySelectorAll('.name')?.forEach(elem => { elem.innerHTML = repo.name });
            template.querySelectorAll('.description')?.forEach(elem => { elem.innerHTML = repo.description });
            template.querySelectorAll('.created_at')?.forEach(elem => {
                elem.innerHTML = (new Date(repo.created_at)).toLocaleDateString();
            });
            template.querySelectorAll('.updated_at')?.forEach(elem => {
                elem.innerHTML = (new Date(repo.updated_at)).toLocaleDateString();
            });
            template.querySelectorAll('.language')?.forEach(elem => {
                var langTx: string = "";
                requestJSON(
                    repo.languages_url,
                    (langs: any) => { for(let key in langs ) {langTx += `<span>${key}(${langs[key]})</span>`}}
                );
                elem.innerHTML = langTx;
            });
            content?.append(template);
            // let name: string = repo.name;
            // let repo_url: string = repo.html_url;
            // let description: string = repo.description;
            // let since: Date = new Date(repo.created_at);
            // let update: Date = new Date(repo.updated_at);
            // let size: number = repo.size;
            // let lang: string = repo.language;
            // let has_page: boolean = repo.has_pages;
            // if (item.querySelector);
        }
    );
})

function requestJSON(url: string, callback: CallableFunction){
    let request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'json';
    request.onload = () => {callback(request.response);};
    request.send();
}