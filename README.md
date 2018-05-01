# soma0sd CV 페이지
view: https://soma0sd.github.io/

![모바일](./screenshot/small.png)
![데스크톱](./screenshot/large.png)

* [기본 설정](#기본-설정)
* [스타일](#스타일)

## 기본 설정
`/_config.yml`를 수정하여 기본 설정을 변경할 수 있습니다.

```yml
title: soma0sd # 페이지 타이틀
email: soma0sd@gmail.com
description: >- # 내용이 여러줄인 경우 >-로 표시합니다.
  soma0sd's CV
url: "https://soma0sd.github.io/" # 홈페이지 주소
```
`title`과 `description` 처음 보이는 헤더에 표시될 이름과 간단한 설명입니다. `title`의 경우 페이지 이름에도 적용됩니다.

`email`은 사용자가 편집하는 *section/about.md* 에서만 사용하고 있습니다. `url`옵션은 현재 사용하지 않습니다.

```yml
social:
  github: soma0sd
  facebook: soma0sd
  twitter: soma0sd
  instagram: soma0sd
  webpage: https://soma0sd.com
```
`social`옵션은 현재 깃허브(`github`), 페이스북(`facebook`), 트위터(`twitter`), 인스타그램(`instagram`), 개인홈페이지(`webpage`)를 지원하고 있습니다. 유저id를 사용합니다. 마지막 Contact 탭에서 사용합니다.
