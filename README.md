# soma0sd.github.io

현재 Jekyll 로컬 테스트 환경을 윈도우즈 로컬에서 구성하다간 키보드를 작살낼지도 모릅니다. 이 페이지는 WSL을 활용하여 테스트 환경을 구성합니다.

## WSL 설치(Windows 10/11)

시작 버튼에 마우스 오른쪽 버튼을 눌러 **Windows 터미널(관리자)** 실행:

```ps1
wsl --install
```

- 설치가 끝나면 시스템을 재시작합니다.
- UNIX 유저명과 비밀번호를 설정합니다.
- 기본 설치는 현재 우분투(Ubuntu 20.04).

> 리눅스 하위 시스템은 윈도우즈 스토어를 통해 칼리, 데비안 등으로 변경할 수 있습니다.

## 개발 환경 구성

WSL 원격 연결을 통해 Ubuntu Bash를 실행:

```bash
# 패키지 목록 업데이트
sudo apt-get update
sudo apt-get install ruby-full build-essential zlib1g-dev python3

# Ruby Gems 위치 재지정
echo '# Install Ruby Gems to ~/gems' >> ~/.bashrc
echo 'export GEM_HOME="$HOME/gems"' >> ~/.bashrc
echo 'export PATH="$HOME/gems/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# 번들러 설치
gem install bundler

# Gemfile로부터 Gems 인스톨
bundle install
```

TypeScript 컴파일러 설치:

```bash
sudo apt install npm
npm install --save-dev typescript
```

## 로컬 테스트 시작

Ubuntu Bash:

```bash
bundle exec jekyll serve
```

## 종속성 업데이트

```bash
bundle update
```
