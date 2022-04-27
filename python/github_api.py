"""깃허브 저장소 데이터 업데이트

- python 3.8.10

Copyright (c) 2022 soma0sd.
All Rights Reserved.
<https://soma0sd.tistory.com/>
"""

import collections
import inspect
import json
from pathlib import Path
from typing import Any, Dict, List, Tuple, Union, OrderedDict

import requests


QUERY_PATH = Path(__file__).parent / "github_api.graphql"
TOKEN_PATH = Path(__file__).parent.parent / ".token"
OUTPUT_USER_PATH = Path(__file__).parent.parent / "_data" / "github_user.json"
OUTPUT_REPO_PATH = Path(__file__).parent.parent / "_data" / "github_repo.json"
OUTPUT_LANG_PATH = Path(__file__).parent.parent / "_data" / "github_lang.json"

API_URL = "https://api.github.com/graphql"
SESSION = requests.Session()

# 쿼리
with open(QUERY_PATH) as f:
    query = f.read()

# 엑세스 토큰
if not TOKEN_PATH.exists():
    msg = inspect.cleandoc(
        """
    https://github.com/settings/tokens

    엑세스 토큰을 생성하여 `.token`에 저장한 뒤
    스크립트를 다시 실행하세요.
    """
    )
    raise Exception(msg)

with open(TOKEN_PATH) as f:
    token = f.read().strip(" \n")

# Graph QL 응답
header = {"Authorization": f"token {token}"}
response: requests.Response = SESSION.post(
    url=API_URL, json={"query": query}, headers=header
)
if response.status_code != 200:
    raise Exception(f"[STATUS: {response.status_code}] {response.text}")

# 유저 데이터 및 저장소 데이터 생성
user_data: Dict[str, Any] = json.loads(response.text)["data"]["viewer"]
repo_data: List[Dict[str, Any]] = user_data["repositories"]["nodes"]
del user_data["repositories"]
SESSION.close()
with open(OUTPUT_USER_PATH, "w") as f:
    f.write(json.dumps(user_data, ensure_ascii=False, indent=2))
with open(OUTPUT_REPO_PATH, "w") as f:
    f.write(json.dumps(repo_data, ensure_ascii=False, indent=2))

# 언어 데이터 생성
lang_data: OrderedDict[str, Dict[str, Union[int, str]]] = collections.OrderedDict()
for node in repo_data:
    for lang in node["languages"]["edges"]:
        size = int(lang["size"])
        name = str(lang["node"]["name"])
        color = str(lang["node"]["color"])
        if name in lang_data.keys():
            lang_data[name]["size"] += size
        else:
            lang_data[name] = {"size": size, "color": color}
lang_list: List[Tuple[str, int]] = [(k, lang_data[k]["size"]) for k in lang_data]
for item in sorted(lang_list, key=lambda x: int(x[1]), reverse=True):
    lang_data.move_to_end(item[0])
with open(OUTPUT_LANG_PATH, "w") as f:
    json.dump(lang_data, f, ensure_ascii=False, indent=2)
