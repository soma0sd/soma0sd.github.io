"""깃허브 저장소 데이터 업데이트

- python 3.8.10

Copyright (c) 2022 soma0sd.
All Rights Reserved.
<https://soma0sd.tistory.com/>
"""

import inspect
import json
import os
from pathlib import Path
from typing import Any, Dict, List

import requests


QUERY_PATH = Path(__file__).parent / "github_api.graphql"
TOKEN_PATH = Path(__file__).parent.parent / ".token"


OUTPUT_RAW_PATH = Path(__file__).parent.parent / "_data" / "github_raw.json"
OUTPUT_DATA_DIR = Path(__file__).parent.parent / "_data" / "github"


API_URL = "https://api.github.com/graphql"
REQUEST_TIMEOUT = 30

# 조회 대상 계정. 환경변수 `GITHUB_LOGIN` 으로 덮어쓸 수 있다.
DEFAULT_LOGIN = "soma0sd"


def get_query() -> str:
    """쿼리 파일 `github_api.graphql`을 읽어들여 반환"""
    with open(QUERY_PATH, encoding="utf-8") as f:
        query = f.read()
    return query


def get_token() -> str:
    """토큰 읽기.

    환경변수 `GITHUB_TOKEN` 이 있으면 그 값을, 없으면 `.token` 파일을 쓴다.
    CI 나 임시 셸에서 토큰을 디스크에 남기지 않고 쓸 수 있게 하기 위한 것이다.

    공개 데이터만 조회하므로 GitHub Actions 가 자동 발급하는 `GITHUB_TOKEN` 으로도 동작한다.
    """
    env_token = os.environ.get("GITHUB_TOKEN", "").strip()
    if env_token:
        return env_token
    if not TOKEN_PATH.exists():
        msg = inspect.cleandoc(
            """
        https://github.com/settings/tokens

        액세스 토큰을 생성하여 `.token`에 저장하거나 환경변수 `GITHUB_TOKEN`에
        넣은 뒤 스크립트를 다시 실행하세요.

        `.token`은 .gitignore에 등재되어 있습니다. 토큰 값을 커밋하거나
        문서·커밋 메시지에 남기지 마세요.
        """
        )
        raise Exception(msg)
    else:
        with open(TOKEN_PATH, encoding="utf-8") as f:
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


def get_login() -> str:
    """조회 대상 계정 이름."""
    return os.environ.get("GITHUB_LOGIN", "").strip() or DEFAULT_LOGIN


def main():
    session = requests.Session()
    payload = {"query": get_query(), "variables": {"login": get_login()}}
    token = get_token()

    # Graph QL 응답을 `_data/github_raw.json`에 저장
    header = {"Authorization": f"bearer {token}"}
    response: requests.Response = session.post(
        url=API_URL, json=payload, headers=header, timeout=REQUEST_TIMEOUT
    )
    if response.status_code != 200:
        raise Exception(f"[STATUS: {response.status_code}] {response.text}")
    raw_data = json.loads(response.text)
    if "errors" in raw_data:
        errors = json.dumps(raw_data["errors"], ensure_ascii=False)
        raise Exception(f"[GraphQL] {errors}")
    with open(OUTPUT_RAW_PATH, "w", encoding="utf-8") as f:
        f.write(json.dumps(raw_data, ensure_ascii=False, indent=2))
    session.close()

    # 사용자 데이터
    user_data = convert_user(raw_data["data"]["user"])
    with open(OUTPUT_DATA_DIR / "user.json", "w", encoding="utf-8") as f:
        f.write(json.dumps(user_data, ensure_ascii=False, indent=2))

    # 저장소 데이터
    repo_data = convert_repos(raw_data["data"]["user"]["repositories"])
    with open(OUTPUT_DATA_DIR / "repo.json", "w", encoding="utf-8") as f:
        f.write(json.dumps(repo_data, ensure_ascii=False, indent=2))

    lang_stat_data = convert_lang_stat(repo_data)
    with open(OUTPUT_DATA_DIR / "lang_stat.json", "w", encoding="utf-8") as f:
        f.write(json.dumps(lang_stat_data, ensure_ascii=False, indent=2))
    return


if __name__ == "__main__":
    main()
