# soma0sd.github.io

GitHub 프로필, 언어 사용량 통계, 공개 저장소 목록을 한 화면에 보여 주는 Jekyll 정적 사이트입니다.
`master` 브랜치 루트가 GitHub Pages 로 그대로 배포됩니다.

## 구성

| 영역 | 원본 | 산출물 |
|---|---|---|
| 레이아웃 | `_layouts/default.html`(공통 뼈대) · `_layouts/home.html`(첫 화면) | - |
| 아이콘 | `_includes/icons.html` (투톤 SVG 스프라이트) | - |
| 스타일 | `_sass/style.scss` | `assets/style.css` (Jekyll 이 변환) |
| 스크립트 | `_ts/*.ts` | `assets/*.js` (`tsc` 가 변환, 저장소에 커밋) |
| 데이터 | GitHub GraphQL API | `_data/github/*.json` |

외부 CDN 의존성은 없습니다. 폰트는 각 운영체제의 기본 글꼴을 쓰고, 아이콘은 문서 안에 넣은 SVG
스프라이트를 씁니다. 화면 테마는 라이트/다크를 모두 지원하며 기본값은 운영체제 설정을 따릅니다.

## 프로필 표시 값

이름·자기소개·위치 등 대부분은 GitHub 계정에서 자동으로 가져옵니다. GitHub 계정에 없는 항목은
`_config.yml` 의 `profile` 에서 채웁니다. 값이 비어 있으면 해당 줄을 렌더하지 않습니다.

```yaml
profile:
  name_ko: "진승완"      # GitHub 에는 한국어 이름 필드가 없어 여기서 지정합니다.
  bio: ""              # 아래 표 참고.
  company: "하늘소프트"   # 비우면 GitHub 계정의 company 값을 씁니다.
  position: "차장"       # 회사 이름 뒤에 붙습니다.
  company_url: ""       # http/https 로 시작할 때만 회사 이름에 링크를 겁니다.
```

`name_ko` 를 채우면 한국어 이름이 큰 제목이 되고 GitHub 의 영문 이름이 그 아래 보조 표기로 들어갑니다.
비우면 기존처럼 영문 이름만 표시합니다.

한 줄 소개(`bio`)는 세 가지 상태를 구분합니다.

| `_config.yml` | 결과 |
|---|---|
| `bio` 키 없음 | GitHub 계정의 bio 를 표시 |
| `bio: ""` | 소개 줄을 표시하지 않음 |
| `bio: "문구"` | 그 문구를 표시 |

소속 줄은 `company` 와 `position` 중 하나만 있어도 표시되고, 둘 다 비면 줄 자체가 사라집니다.

## 스크립트 빌드

`assets/*.js` 를 직접 고치지 마세요. 원본은 `_ts/*.ts` 이고, 다음 명령의 출력이 `assets/` 로 들어갑니다.

```bash
npm install
npm run build
```

작업 중에는 `npm run watch` 로 자동 변환합니다.

## 데이터 갱신

저장소 루트에 GitHub 개인 액세스 토큰을 담은 `.token` 파일을 두거나, 환경변수 `GITHUB_TOKEN` 에
넣은 뒤 실행합니다. `.token` 은 `.gitignore` 에 등재돼 있으니 커밋하지 마세요.

```bash
python python/get_github_api.py
```

`_data/github/user.json` · `repo.json` · `lang_stat.json` 이 갱신됩니다. 공개·본인 소유 저장소만
조회하므로 비공개 저장소 정보는 내려받지 않습니다.

## 로컬 미리보기 (WSL)

윈도우즈에서 직접 Jekyll 환경을 구성하는 것보다 WSL 을 쓰는 편이 수월합니다.

### WSL 설치 (Windows 10/11)

시작 버튼을 오른쪽 클릭해 **Windows 터미널(관리자)** 를 실행합니다.

```ps1
wsl --install
```

설치가 끝나면 재시작한 뒤 UNIX 사용자 이름과 비밀번호를 설정합니다.

### 개발 환경 구성

WSL 원격 연결로 Ubuntu Bash 를 실행합니다.

```bash
sudo apt-get update
sudo apt-get install ruby-full build-essential zlib1g-dev python3

# Ruby Gems 위치 재지정
echo 'export GEM_HOME="$HOME/gems"' >> ~/.bashrc
echo 'export PATH="$HOME/gems/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

gem install bundler
bundle install
```

### 실행

```bash
JEKYLL_GITHUB_TOKEN=$(cat .token) bundle exec jekyll serve
```

`jekyll-github-metadata` 플러그인이 프로필 영역(`site.github.*`)을 빌드 시점에 가져오므로
`JEKYLL_GITHUB_TOKEN` 이 없으면 프로필이 비어 보입니다.

### 종속성 업데이트

```bash
bundle update
```
