"""깃허브 저장소 데이터 업데이트

- python 3.8.10

Copyright (c) 2022 soma0sd.
All Rights Reserved.
<https://soma0sd.tistory.com/>
"""

import inspect
import json
from pathlib import Path
from typing import Any, Dict, List

import requests


QUERY_PATH = Path(__file__).parent / "github_api.graphql"
TOKEN_PATH = Path(__file__).parent.parent / ".token"


OUTPUT_RAW_PATH = Path(__file__).parent.parent / "_data" / "github_raw.json"
OUTPUT_DATA_DIR = Path(__file__).parent.parent / "_data" / "github"


API_URL = "https://api.github.com/graphql"


def get_query() -> str:
    """쿼리 파일 `github_api.graphql`을 읽어들여 반환"""
    with open(QUERY_PATH) as f:
        query = f.read()
    return query


def get_token() -> str:
    """토큰 파일 읽기"""
    if not TOKEN_PATH.exists():
        msg = inspect.cleandoc(
            """
        https://github.com/settings/tokens

        엑세스 토큰을 생성하여 `.token`에 저장한 뒤
        스크립트를 다시 실행하세요.
        """
        )
        raise Exception(msg)
    else:
        with open(TOKEN_PATH) as f:
            token = f.read().strip(" \n")
    return token


def convert_user(raw_data: Dict[str, Any]) -> Dict[str, Any]:
    keys = [
        "name",
        "email",
        "bio",
        "location",
        "company",
        "url",
        "websiteUrl",
        "avatarUrl",
        "createdAt",
        "updatedAt",
    ]
    data: Dict[str, Any] = {}
    for key in keys:
        if key in raw_data:
            data[key] = raw_data[key]
    data["publicRepos"] = raw_data["repositories"]["totalCount"]
    return data


def convert_repos(raw_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    data: List[Dict[str, Any]] = []
    keys = [
        "nameWithOwner",
        "description",
        "createdAt",
        "updatedAt",
        "pushedAt",
        "url",
        "homepageUrl",
        "isArchived",
        "isPrivate",
    ]
    for node in raw_data["nodes"]:
        repo: Dict[str, Any] = {}
        for key in keys:
            if key in node:
                repo[key] = node[key]
        if node["object"]:
            repo["commits"] = node["object"]["history"]["totalCount"]
            repo["commit"] = []
            for commit in node["object"]["history"]["nodes"]:
                _data: Dict[str, Any] = {}
                _data["message"] = commit["message"]
                _data["url"] = commit["url"]
                _data["date"] = commit["committedDate"]
                repo["commit"].append(_data)
        if node["languages"]:
            _data: List[Dict[str, Any]] = []
            for lang in node["languages"]["edges"]:
                _data.append(
                    {
                        "size": lang["size"],
                        "name": lang["node"]["name"],
                        "color": lang["node"]["color"],
                    }
                )
            repo["languages"] = _data
        data.append(repo)

    return data


def convert_lang_stat(repo_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    _data: Dict[str, Any] = {}
    for langs in [i["languages"] for i in repo_data]:
        for lang in langs:
            if lang["name"] in _data:
                _data[lang["name"]]["size"] += lang["size"]
            else:
                _data[lang["name"]] = {"size": lang["size"], "color": lang["color"]}
    data = {
        k: v for k, v in sorted(_data.items(), key=lambda x: x[1]["size"], reverse=True)
    }
    return data


def main():
    session = requests.Session()
    query = {"query": get_query()}
    token = get_token()

    # Graph QL 응답을 `_data/github_raw.json`에 저장
    header = {"Authorization": f"token {token}"}
    response: requests.Response = session.post(url=API_URL, json=query, headers=header)
    if response.status_code != 200:
        raise Exception(f"[STATUS: {response.status_code}] {response.text}")
    raw_data = json.loads(response.text)
    with open(OUTPUT_RAW_PATH, "w") as f:
        f.write(json.dumps(raw_data, ensure_ascii=False, indent=2))
    session.close()

    # 사용자 데이터
    user_data = convert_user(raw_data["data"]["viewer"])
    with open(OUTPUT_DATA_DIR / "user.json", "w") as f:
        f.write(json.dumps(user_data, ensure_ascii=False, indent=2))

    # 저장소 데이터
    repo_data = convert_repos(raw_data["data"]["viewer"]["repositories"])
    with open(OUTPUT_DATA_DIR / "repo.json", "w") as f:
        f.write(json.dumps(repo_data, ensure_ascii=False, indent=2))

    lang_stat_data = convert_lang_stat(repo_data)
    with open(OUTPUT_DATA_DIR / "lang_stat.json", "w") as f:
        f.write(json.dumps(lang_stat_data, ensure_ascii=False, indent=2))
    return


if __name__ == "__main__":
    main()
