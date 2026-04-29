# GitHub 레포지토리 푸시 가이드

이 문서는 로컬 Git 레포지토리를 GitHub에 푸시하는 방법을 설명합니다.

## 📋 사전 준비사항

1. **GitHub 계정**: https://github.com에서 계정 생성
2. **Git 설치**: 로컬 머신에 Git 설치
3. **SSH 키 또는 Personal Access Token**: GitHub 인증 설정

## 🚀 GitHub에 푸시하는 단계

### 1단계: GitHub에서 새 레포지토리 생성

1. GitHub에 로그인합니다
2. 오른쪽 상단의 `+` 아이콘을 클릭하고 `New repository` 선택
3. 레포지토리 이름: `beaver-company-website`
4. 설명: `Beaver Company Website and Marketing Automation System`
5. 공개/비공개 선택 (권장: 공개)
6. `Create repository` 클릭

### 2단계: 원격 레포지토리 추가

```bash
cd /home/ubuntu/beaver-company-website

# 원격 레포지토리 추가 (HTTPS 방식)
git remote add origin https://github.com/[YOUR_USERNAME]/beaver-company-website.git

# 또는 SSH 방식 (권장)
git remote add origin git@github.com:[YOUR_USERNAME]/beaver-company-website.git

# 원격 레포지토리 확인
git remote -v
```

### 3단계: 브랜치 이름 변경 (선택사항)

GitHub의 기본 브랜치를 `main`으로 사용하는 것이 권장됩니다:

```bash
# 로컬 브랜치 이름 변경
git branch -M main

# 원격 레포지토리로 푸시
git push -u origin main
```

또는 `master` 브랜치로 그대로 진행:

```bash
git push -u origin master
```

### 4단계: 코드 푸시

```bash
# 모든 커밋을 원격 레포지토리로 푸시
git push -u origin master

# 이후 푸시는 간단히
git push
```

## 🔐 인증 방식 선택

### HTTPS 방식 (간단함)
```bash
git remote add origin https://github.com/[YOUR_USERNAME]/beaver-company-website.git
git push -u origin master
# GitHub 사용자명과 Personal Access Token 입력
```

### SSH 방식 (권장)
1. SSH 키 생성:
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

2. GitHub 계정에 공개 키 추가:
   - https://github.com/settings/keys
   - `New SSH key` 클릭
   - 공개 키 내용 붙여넣기

3. 원격 레포지토리 추가:
```bash
git remote add origin git@github.com:[YOUR_USERNAME]/beaver-company-website.git
git push -u origin master
```

## 📊 레포지토리 구조 확인

푸시 후 GitHub에서 다음과 같은 구조를 확인할 수 있습니다:

```
beaver-company-website/
├── .git/
├── .gitignore
├── README.md
├── README_MAIN.md
├── src/
│   └── index.html (웹사이트 소스코드)
├── public/
├── docs/
│   ├── beaver_company_analysis.md
│   └── GITHUB_SETUP.md
└── marketing-automation/
    ├── README.md (마케팅 시스템 매뉴얼)
    ├── content-planning/
    ├── blog-templates/
    ├── sns-strategy/
    ├── competitor-analysis/
    ├── performance-reports/
    └── automation-workflows/
```

## 🔄 이후 작업 흐름

### 새로운 콘텐츠 추가

```bash
# 1. 파일 수정 또는 생성
# 2. 변경사항 스테이징
git add .

# 3. 커밋
git commit -m "Add: 새로운 기능 설명"

# 4. 푸시
git push
```

### 브랜치 생성 및 관리

```bash
# 새 브랜치 생성
git checkout -b feature/새-기능

# 작업 후 커밋
git add .
git commit -m "Add: 새 기능 구현"

# 푸시
git push -u origin feature/새-기능

# GitHub에서 Pull Request 생성
```

## 🐛 문제 해결

### "fatal: remote origin already exists"
```bash
# 기존 원격 제거
git remote remove origin

# 새로 추가
git remote add origin https://github.com/[YOUR_USERNAME]/beaver-company-website.git
```

### "Permission denied (publickey)"
- SSH 키가 제대로 설정되지 않음
- GitHub 계정 설정에서 SSH 키 확인
- HTTPS 방식으로 변경 고려

### "fatal: 'origin' does not appear to be a 'git' repository"
```bash
# 원격 레포지토리 확인
git remote -v

# 없으면 추가
git remote add origin https://github.com/[YOUR_USERNAME]/beaver-company-website.git
```

## 📚 추가 자료

- [GitHub 공식 가이드](https://docs.github.com/en/get-started)
- [Git 기본 명령어](https://git-scm.com/book/en/v2/Git-Basics-Getting-a-Git-Repository)
- [GitHub 협업 가이드](https://docs.github.com/en/github/collaborating-with-pull-requests)

## ✅ 체크리스트

- [ ] GitHub 계정 생성
- [ ] 새 레포지토리 생성
- [ ] 로컬에서 원격 레포지토리 추가
- [ ] SSH 또는 HTTPS 인증 설정
- [ ] 코드 푸시 완료
- [ ] GitHub에서 레포지토리 확인
- [ ] README 파일 확인
- [ ] 마케팅 자동화 문서 확인

---

**작성일**: 2025년 6월 11일  
**마지막 업데이트**: 2025년 6월 11일
