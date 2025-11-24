# HQMX 메인 페이지 (Sitemap) 프로젝트

**최종 업데이트**: 2025-11-25
**작성자**: Gemini Agent

## 1. 프로젝트 개요 (Project Overview)

이 프로젝트는 HQMX 서비스의 **메인 랜딩 페이지** 역할을 합니다. 사용자가 `hqmx.net`에 처음 접속했을 때 보게 되는 화면이며, 모든 하위 서비스(Downloader, Converter, Generator, Calculator)로 안내하는 **비주얼 사이트맵(Visual Sitemap)** 기능을 핵심으로 합니다.

- **Git Repository**: `https://github.com/hqmx/main.git`
- **주요 기술**: Vanilla HTML, CSS, JavaScript (정적 페이지)
- **핵심 파일**: `frontend/index.html`

## 2. 주요 기능 (Key Features)

- **통합 랜딩 페이지**: HQMX 브랜드의 첫인상을 결정하는 메인 게이트웨이입니다.
- **서비스 네비게이션**: 각 하위 서비스로 연결되는 링크를 직관적인 UI로 제공합니다.
- **다국어 및 테마 지원**: `locales.js`와 `style.css`를 통해 다국어와 다크/라이트 모드를 지원합니다.

## 3. 배포 준비 및 절차 (Deployment Plan)

이 프로젝트는 정적 파일로 구성되어 있으므로, 웹 서버의 지정된 위치에 파일을 복사하는 것만으로 배포가 완료됩니다.

1.  **서버 접속**:
    ```bash
    ssh -i "hqmx-ec2.pem" <user>@<ec2_ip_address>
    ```

2.  **배포 디렉토리 생성** (필요시):
    Nginx 설정에 따라 메인 페이지를 서빙할 디렉토리를 준비합니다. (예: `/var/www/html/main`)
    ```bash
    sudo mkdir -p /var/www/html/main
    ```

3.  **파일 전송 (로컬 -> 서버)**:
    `scp`를 사용하여 `frontend` 디렉토리의 모든 콘텐츠를 서버로 복사합니다. 불필요한 파일(`node_modules`, `.git` 등)은 제외합니다.
    ```bash
    # 'frontend/' 뒤의 슬래시가 중요합니다. 디렉토리 내용물만 복사합니다.
    scp -i "hqmx-ec2.pem" -r frontend/* <user>@<ec2_ip_address>:/var/www/html/main/
    ```

4.  **Nginx 설정 확인**:
    서버의 Nginx 설정 파일에서 `location /` 블록이 `/var/www/html/main` 디렉토리를 가리키도록 설정되었는지 확인합니다.

    ```nginx
    server {
        listen 80;
        server_name hqmx.net;

        location / {
            root /var/www/html/main;
            index index.html;
        }

        # ... 기타 서비스 라우팅 설정 ...
    }
    ```

5.  **Nginx 재시작**:
    설정 변경 후 Nginx를 재시작하여 적용합니다.
    ```bash
    sudo systemctl reload nginx
    ```

이제 배포 준비가 완료되었습니다.