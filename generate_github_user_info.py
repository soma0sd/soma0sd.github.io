"""
create Github user informations file from Github API v3

Repositories info
    * name
    * full_name (for github pages)
    * html_url
    * pages_url
    * language
    * languages
    * description
    * created_at
    * updated_at
"""
import requests
import dateutil.parser
import json

user_name: str = "soma0sd"
user_token: str = ""
# Personal access token
# https://github.com/settings/tokens
url_github_api: str = "https://api.github.com"
json_path: str = "_data/github_repodata.json"

gh_session = requests.Session()

def get_json(sub_url: str):
    global user_name, url_github_api, gh_session
    url: str =  "{0}/users/{1}/{2}".format(
        url_github_api, user_name, sub_url)
    if "https://" in sub_url: url = sub_url
    return json.loads(gh_session.get(url).text)

def date_format(iso_str: str):
    rawdate = dateutil.parser.parse(iso_str)
    return rawdate.strftime("%Y/%m/%d")

if __name__ == "__main__":
    gh_session.auth = (user_name, user_token)

    data: list = []
    github_repos: list = get_json("repos?sort=updated&direction=desc")
    for repo in github_repos:
        print("Generating repo:", repo["full_name"])
        _langs = get_json(repo["languages_url"])
        _langs = [[k, _langs[k]] for k in _langs.keys()]
        _langs = sorted(_langs, key=lambda x: x[1], reverse=True)
        _fn = repo["full_name"].split("/")
        _pages_url = "https://{0}.github.io/{1}".format(_fn[0], _fn[1])
        _data = {
            "name": repo["name"],
            "full_name": repo["full_name"],
            "html_url": repo["html_url"],
            "language": repo["language"],
            "description": repo["description"],
            "languages": _langs,
            "pages_url": _pages_url if repo["has_pages"] == True else "",
            "created_at": date_format(repo["created_at"]),
            "updated_at": date_format(repo["updated_at"])
        }
        data.append(_data)
    with open(json_path, "w", encoding="utf8") as f:
        json.dump(data, f, indent=4, sort_keys=True, ensure_ascii=False)

