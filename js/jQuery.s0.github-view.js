// setting: token
var token = {
    token: '41b0689a3e79ea91bfc42d5e9691b4a41f2035f0'
};

var github = {};
github.api = new GitHub(token);
github.user = github.api.getUser();
github.data = {};

var _github_data_init = $.when(
    _getUserProfileData(github.user),
    _getReposData(github.user)
);
(function($) {
    jQuery.fn.githubProfile = function() {
        let $this = $(this);
        _github_data_init.then(function() {
            $this.html(_tpl_userProfile(github.data.user));
        });
    };
    jQuery.fn.githubRepos = function() {
        let $this = $(this);
        _github_data_init.then(function() {
            let $wrap = $('<ul class="github-repo-list-wrap">');
            $wrap.appendTo($this);
            $.each(github.data.repos, function(index, val) {
                __get_repo_langs(index).then(function() {
                    $(_tpl_repoListItem(index, val)).appendTo($wrap);
                });
            });
        });
    };
})(jQuery);



function _getUserProfileData(user) {
    user.getProfile(function(error, result, request) {
        return new Promise(function(resolve, reject) {
            if (error) {
                console.log(error);
            }
            github.data.user = result;
            resolve();
        });
    });
}

function _getReposData(user) {
    return new Promise(function(resolve, reject) {
        user.listRepos(function(error, result, request) {
            if (error) {
                console.log(error);
            }
            github.data.repos = result;
            resolve();
        });
    });
}

function _tpl_userProfile(data) {
    // @param data <= github.data.user (Object)
    let t = ``;
    t += `<div class="github-user-profile-box">\n`;
    t += `<div class="github-user-name-card">\n`;
    t += `<img class="github-user-avatar" src="${data.avatar_url}">\n`;
    t += `<h1 class="github-user-login">${data.login}</h1>\n`;
    if (data.name) {
        t += `<h2 class="github-user-name">${data.name}</h2>\n`;
    }
    t += `</div>\n`; // close namecard
    if (data.location) {
        t += `<span class="github-user-location">\n`;
        t += `<i class="fas fa-map-marked-alt"></i>${data.location}`;
        t += `</span>\n`;
    }
    if (data.bio) {
        t += `<p class="github-user-bio">${data.bio}</p>`;
    }
    t += `<div class="github-user-contact-box">\n`;
    t += `<a class="github-user-html-url" href="${data.html_url}"><i class="fab fa-github-alt"></i></a>\n`;
    if (data.blog) {
        t += `<a class="github-user-blog" href="#${data.blog}"><i class="fas fa-home"></i></a>\n`;
    }
    t += `</div>\n`; // close contact
    t += `</div>\n`; // close profile
    return t;
}

function _tpl_repoListItem(index, data) {
    // data is single repo data
    let t = ``;
    let isPage = false;
    t += `<li class="github-repo-list-item">`;

    t += `<div class="github-repo-title-box">`;
    t += `<h1 class="github-repo-name">`;
    t += `${data.name.replace('.github.io', '')}`;
    if (data.name.match('.github.io')) {
        t += `<span class="github-repo-is-page">pages</span>`;
        isPage = true;
    }
    t += `</h1>`;
    let cDate = new Date(data.created_at);
    let uDate = new Date(data.updated_at);
    t += `<div class="github-repo-date-box">`;
    t += `<span class="repo-updated"><i class="fas fa-sync"></i>${uDate.getDate()}/${uDate.getMonth()}/${uDate.getFullYear()}</span>`;
    t += `<span class="repo-created"><i class="fas fa-marker"></i>${cDate.getDate()}/${cDate.getMonth()}/${cDate.getFullYear()}</span>`;
    t += `</div>`; // close date box
    t += `</div>`; // close title box

    t += `<div class="github-repo-body-box" data="${index}">`;
    t += `<p>${data.description}</p>`;
    t += __tpl_languages_progress(data.languages);
    t += `<div class="github-repo-contact-box">`;
    if(data.homepage){
        t += `<a class="repo-home" href="${data.homepage}"><i class="fas fa-home"></i><label>home</label></a>`;
    }
    if(isPage){
        t += `<a class="repo-page" href="https://${data.name}"><i class="fas fa-file-invoice"></i><label>Pages</label></a>`;
    }else if(data.has_pages) {
        t += `<a class="repo-page" href="https://${data.owner.login}.github.io/${data.name}"><i class="fas fa-file-invoice"></i><label>Pages</label></a>`;
    }
    if(data.has_wiki) {
        t += `<a class"repo-wiki" href="${data.html_url}/wiki"><i class="fab fa-wikipedia-w"></i><label>Wiki<label></a>`;
    }
    t += `<a class"repo-wiki" href="${data.html_url}"><i class="fas fa-code"></i><label>Code<label></a>`;
    t += `</div>`; // close contact box
    t += `</div>`; // close body box
    t += `</li>`; // close list item
    return t;
}

function __tpl_languages_progress(langs) {
    var t = ``;
    let codeCount = 0;
    $.each(langs, function(key, val) {
        codeCount += val;
    });
    $.each(langs, function(key, val) {
        let ratio = (val * 100 / codeCount).toFixed(0) + '%';
        t += `<div class="language-progress">`;
        t += `<img class="language-img" src="img/${key.replace(' ', '')}.png" onError="this.src='img/unknown.png'">`;
        t += `<div class="language-progress-bar ${key}" style="width: ${ratio}">`;
        t += `<label class="language-name">${key}</label>`;
        t += `</div>`;
        t += `<label class="language-ratio">${ratio}</label>`;
        t += `</div>`;
    });
    return t;
}

function __get_repo_langs(index) {
    return new Promise(function(resolve, reject) {
        let repo = github.api.getRepo(github.data.repos[index].owner.login, github.data.repos[index].name);
        repo._request('GET', `/repos/${repo.__fullname}/languages`, null, function(error, result, request) {
            github.data.repos[index].languages = result;
            resolve(true);
        });
    });
}

function image(src, cfg) {
    var img, prop, target;
    cfg = cfg || (isType(src, 'o') ? src : {});

    img = $(src);
    if (img) {
        src = cfg.src || img.src;
    } else {
        img = document.createElement('img');
        src = src || cfg.src;
    }

    if (!src) {
        return null;
    }

    prop = isType(img.naturalWidth, 'u') ? 'width' : 'naturalWidth';
    img.alt = cfg.alt || img.alt;

    // Add the image and insert if requested (must be on DOM to load or
    // pull from cache)
    img.src = src;

    target = $(cfg.target);
    if (target) {
        target.insertBefore(img, $(cfg.insertBefore) || null);
    }

    // Loaded?
    if (img.complete) {
        if (img[prop]) {
            if (isType(cfg.success, 'f')) {
                cfg.success.call(img);
            }
        } else {
            if (isType(cfg.failure, 'f')) {
                cfg.failure.call(img);
            }
        }
    } else {
        if (isType(cfg.success, 'f')) {
            img.onload = cfg.success;
        }
        if (isType(cfg.failure, 'f')) {
            img.onerror = cfg.failure;
        }
    }

    return img;
}