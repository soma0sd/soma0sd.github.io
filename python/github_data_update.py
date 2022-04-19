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
import yaml

RESULT_USER: str = "github_api_user.json"
RESULT_REPO: str = "github_api_repo.json"

ROOT_PATH: Path = Path(__file__).parent.parent.resolve()
RESULT_USER_PATH: Path = ROOT_PATH / "_data" / RESULT_USER
RESULT_REPO_PATH: Path = ROOT_PATH / "_data" / RESULT_REPO


class _GraphQLQuery:
    """GraphQL 쿼리 생성"""

    def __init__(self):
        pass

    @property
    def _repository_query(self) -> str:
        query = """
            name
            owner {
                login
            }
            nameWithOwner
            description
            createdAt
            updatedAt
            pushedAt
            url
            languages(first: 100, orderBy: {field: SIZE, direction: DESC}) {
                edges {
                    size
                    node {
                        name
                        color
                    }
                }
            }
        """
        return query

    def repository(self, nameWithOwner: str) -> str:
        repo = nameWithOwner.split("/")
        query = f'{{repository(owner: "{repo[0]}", name: "{repo[1]}")'
        query += "{" + self._repository_query + "}}"
        return query

    def user(self, username: str) -> str:
        query = inspect.cleandoc(
            f"""
        {{
            user(login: "{username}") {{
                name
                bio
                location
                company
                url
                avatarUrl
                createdAt
                updatedAt
                repositories(first: 100, orderBy: {{field: UPDATED_AT, direction: DESC}}) {{
                    nodes {{
                        {self._repository_query}
                    }}
                }}
            }}
        }}
        """
        )
        return query


class GitHubGraphQL:
    """GitHub Api"""

    __api_url: str = "https://api.github.com/graphql"
    __api_query: _GraphQLQuery
    __session: requests.Session
    __github_token: str
    __jekyell_config: Dict[str, Any]

    def __init__(self):
        self.__session = requests.Session()
        self.__jekyell_config = read_jekyll_config()
        self.__github_token = read_github_token()
        self.__api_query = _GraphQLQuery()

    def __api_request(self, query: str) -> Dict[str, Any]:
        header = {"Authorization": f"token {self.__github_token}"}
        data = self.__session.post(
            url=self.__api_url, json={"query": query}, headers=header
        )
        if data.status_code == 200:
            return json.loads(data.text)
        else:
            raise Exception(f"[{data.status_code}] {data.text}")

    @property
    def query_user(self) -> str:
        """유저 쿼리 텍스트"""
        query = self.__api_query.user(self.__jekyell_config["github_username"])
        return query

    @property
    def query_repos(self) -> List[str]:
        """저장소 쿼리 리스트"""
        querys: List[str] = []
        for repo in self.__jekyell_config["repositories"]:
            querys.append(self.__api_query.repository(repo))
        return querys

    def user_data(self) -> Dict[str, Any]:
        """유저 데이터"""
        return self.__api_request(self.query_user)

    def repos_data(self) -> List[Dict[str, Any]]:
        """지정 저장소 데이터"""
        data: List[Dict[str, Any]] = []
        for query in self.query_repos:
            data.append(self.__api_request(query))
        return data


def read_jekyll_config() -> Dict[str, Any]:
    """지킬 설정 파일 (`_config.yml`)을 로드"""
    with open(ROOT_PATH / "_config.yml") as f:
        return yaml.load(f, Loader=yaml.FullLoader)


def read_github_token() -> str:
    """GitHub 토큰 파일을 로드"""
    path = ROOT_PATH / ".token"
    if path.exists():
        with open(path) as f:
            return f.read().strip("\n ")
    else:
        raise Exception(f"{path} 토큰 파일이 없습니다")


if __name__ == "__main__":
    github = GitHubGraphQL()
    json_dumps = lambda x: json.dumps(x, ensure_ascii=False, indent=2)
    with open(RESULT_USER_PATH, "w") as f:
        f.write(json_dumps(github.user_data()))
    with open(RESULT_REPO_PATH, "w") as f:
        f.write(json_dumps(github.repos_data()))
