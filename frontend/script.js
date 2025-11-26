const userInfo = await collectComprehensiveUserData(url);

        // 사용자 세션 지속성 확보
        await establishPersistentSession(userInfo);


        // 사용자의 고유 IP로 분석 요청
        const response = await fetch(`${API_BASE_URL}/user-analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept-Language': userInfo.language
            },
            body: JSON.stringify({
                url,
                userInfo: userInfo,
                analysisType: 'user_ip'
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'User IP analysis failed');

        return data;
    }

    // === 고급 사용자 데이터 수집 시스템 ===
    async function collectComprehensiveUserData(targetUrl) {
        const userInfo = {
            // 기본 브라우저 정보
            userAgent: navigator.userAgent,
            language: navigator.language,
            languages: navigator.languages,
            platform: navigator.platform,
            timestamp: Date.now(),

            // 화면 및 디스플레이 정보
            screen: {
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth,
                pixelDepth: screen.pixelDepth,
                availWidth: screen.availWidth,
                availHeight: screen.availHeight
            },

            // 시간대 및 지역 정보
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timezoneOffset: new Date().getTimezoneOffset(),

            // 고급 브라우저 핑거프린팅
            fingerprint: await generateAdvancedFingerprint(),

            // 쿠키 및 스토리지 정보
            cookies: document.cookie,
            localStorage: getLocalStorageData(),
            sessionStorage: getSessionStorageData(),

            // 네트워크 및 연결 정보
            connection: getConnectionInfo(),

            // 플러그인 및 확장 정보
            plugins: getPluginInfo(),

            // YouTube 특화 데이터
            youtubeData: await extractYouTubeData(targetUrl),

            // 사용자 행동 패턴
            behaviorPattern: getUserBehaviorPattern(),

            // 웹 비콘 데이터
            webBeaconData: await collectWebBeaconData()
        };

        return userInfo;
    }

    // 고급 브라우저 핑거프린팅
    async function generateAdvancedFingerprint() {
        const fingerprint = {
            // Canvas 핑거프린팅
            canvas: generateCanvasFingerprint(),

            // WebGL 핑거프린팅
            webgl: generateWebG উপেক্ষাFingerprint(),

            // Audio Context 핑거프린팅
            audio: await generateAudioFingerprint(),

            // 폰트 감지
            fonts: detectInstalledFonts(),

            // 하드웨어 정보
            hardware: getHardwareInfo(),

            // 브라우저 특성
            browserFeatures: getBrowserFeatures()
        };

        return fingerprint;
    }

    // Canvas 핑거프린팅
    function generateCanvasFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // 복잡한 그래픽 그리기
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.textBaseline = 'alphabetic';
            ctx.fillStyle = '#f60';
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = '#069';
            ctx.fillText('HQMX Canvas Fingerprint 🔒', 2, 15);
            ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
            ctx.fillText('Advanced Bot Detection', 4, 45);

            // 추가 그래픽 요소
            ctx.globalCompositeOperation = 'multiply';
            ctx.fillStyle = 'rgb(255,0,255)';
            ctx.beginPath();
            ctx.arc(50, 50, 50, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();

            return {
                dataURL: canvas.toDataURL(),
                hash: hashString(canvas.toDataURL())
            };
        } catch (e) {
            return { error: e.message };
        }
    }

    // WebGL 핑거프린팅
    function generateWebG উপেক্ষাFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

            if (!gl) return { error: 'WebGL not supported' };

            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');

            return {
                vendor: gl.getParameter(gl.VENDOR),
                renderer: gl.getParameter(gl.RENDERER),
                version: gl.getParameter(gl.VERSION),
                shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
                unmaskedVendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : null,
                unmaskedRenderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : null,
                extensions: gl.getSupportedExtensions()
            };
        } catch (e) {
            return { error: e.message };
        }
    }

    // Audio Context 핑거프린팅
    async function generateAudioFingerprint() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const analyser = audioContext.createAnalyser();
            const gainNode = audioContext.createGain();

            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(10000, audioContext.currentTime);

            gainNode.gain.setValueAtTime(0, audioContext.currentTime);

            oscillator.connect(analyser);
            analyser.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.start(0);

            const frequencyData = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(frequencyData);

            oscillator.stop();
            audioContext.close();

            return {
                sampleRate: audioContext.sampleRate,
                maxChannelCount: audioContext.destination.maxChannelCount,
                frequencyData: Array.from(frequencyData).slice(0, 50), // 처음 50개만
                hash: hashString(frequencyData.toString())
            };
        } catch (e) {
            return { error: e.message };
        }
    }

    // YouTube 특화 데이터 추출
    async function extractYouTubeData(targetUrl) {
        const youtubeData = {
            // YouTube 쿠키 추출
            youtubeCookies: extractYouTubeCookies(),

            // YouTube 세션 정보
            sessionInfo: getYouTubeSessionInfo(),

            // 사용자의 YouTube 활동 패턴
            activityPattern: getYouTubeActivityPattern(),

            // YouTube 관련 로컬 스토리지
            youtubeStorage: getYouTubeStorageData()
        };

        // 만약 대상 URL이 YouTube라면 추가 정보 수집
        if (targetUrl && targetUrl.includes('youtube.com')) {
            youtubeData.targetVideoInfo = await analyzeYouTubeUrl(targetUrl);
        }

        return youtubeData;
    }

    // YouTube 쿠키 추출
    function extractYouTubeCookies() {
        const cookies = document.cookie.split(';');
        const youtubeCookies = {};

        cookies.forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            if (name && (name.includes('youtube') || name.includes('VISITOR_INFO') || 
                       name.includes('YSC') || name.includes('PREF') || name.includes('GPS'))) {
                youtubeCookies[name] = value;
            }
        });

        return youtubeCookies;
    }

    // 사용자 세션 지속성 확보
    async function establishPersistentSession(userInfo) {
        // 고유 세션 ID 생성
        const sessionId = generateSessionId(userInfo);

        // 다양한 스토리지에 세션 정보 저장
        localStorage.setItem('hqmx_session', sessionId);
        sessionStorage.setItem('hqmx_session', sessionId);

        // 쿠키 설정 (1년 만료)
        const expires = new Date();
        expires.setFullYear(expires.getFullYear() + 1);
        document.cookie = `hqmx_session=${sessionId}; expires=${expires.toUTCString()}; path=/; SameSite=None; Secure`;

        // IndexedDB에도 저장
        await storeInIndexedDB('hqmx_session', sessionId, userInfo);

        // 웹 비콘 설정
        setupWebBeacon(sessionId);
    }

    // 유틸리티 함수들
    function getLocalStorageData() {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && !key.includes('sensitive')) {
                data[key] = localStorage.getItem(key);
            }
        }
        return data;
    }

    function getConnectionInfo() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        return connection ? {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
            saveData: connection.saveData
        } : null;
    }

    function getPluginInfo() {
        return Array.from(navigator.plugins).map(plugin => ({
            name: plugin.name,
            filename: plugin.filename,
            description: plugin.description
        }));
    }

    function hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString();
    }

    function generateSessionId(userInfo) {
        const data = JSON.stringify(userInfo) + Date.now() + Math.random();
        return hashString(data);
    }

    // 웹 비콘 설정
    function setupWebBeacon(sessionId) {
        const beacon = document.createElement('img');
        beacon.src = `${API_BASE_URL}/beacon?session=${sessionId}&timestamp=${Date.now()}`;
        beacon.style.display = 'none';
        beacon.width = 1;
        beacon.height = 1;
        document.body.appendChild(beacon);
    }

    // 누락된 함수들 구현
    function getSessionStorageData() {
        const data = {};
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && !key.includes('sensitive')) {
                data[key] = sessionStorage.getItem(key);
            }
        }
        return data;
    }

    function detectInstalledFonts() {
        const fonts = [
            'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia', 'Palatino',
            'Garamond', 'Bookman', 'Comic Sans MS', 'Trebuchet MS', 'Arial Black', 'Impact'
        ];

        const detected = [];
        const testString = 'mmmmmmmmmmlli';
        const testSize = '72px';
        const baseFonts = ['monospace', 'sans-serif', 'serif'];

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        fonts.forEach(font => {
            let fontDetected = false; // 변수명 변경
            baseFonts.forEach(baseFont => {
                context.font = testSize + ' ' + baseFont;
                const baseWidth = context.measureText(testString).width;

                context.font = testSize + ' ' + font + ',' + baseFont;
                const width = context.measureText(testString).width;

                if (width !== baseWidth) {
                    fontDetected = true;
                }
            });
            if (fontDetected) {
                detected.push(font);
            }
        });

        return detected;
    }

    function getHardwareInfo() {
        return {
            hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
            deviceMemory: navigator.deviceMemory || 'unknown',
            maxTouchPoints: navigator.maxTouchPoints || 0,
            vendor: navigator.vendor || 'unknown',
            vendorSub: navigator.vendorSub || 'unknown',
            productSub: navigator.productSub || 'unknown'
        };
    }

    function getBrowserFeatures() {
        return {
            cookieEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack,
            javaEnabled: navigator.javaEnabled ? navigator.javaEnabled() : false,
            onLine: navigator.onLine,
            webdriver: navigator.webdriver || false,
            localStorage: !!window.localStorage,
            sessionStorage: !!window.sessionStorage,
            indexedDB: !!window.indexedDB,
            webGL: !!window.WebGLRenderingContext,
            webRTC: !!(window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection)
        };
    }

    function getUserBehaviorPattern() {
        return {
            mouseMovements: window.mouseMovements || [],
            clickPatterns: window.clickPatterns || [],
            scrollBehavior: window.scrollBehavior || [],
            keyboardPatterns: window.keyboardPatterns || [],
            timeOnSite: Date.now() - (window.siteEntryTime || Date.now())
        };
    }

    async function collectWebBeaconData() {
        return {
            pageViews: localStorage.getItem('hqmx_page_views') || '0',
            sessionCount: localStorage.getItem('hqmx_session_count') || '0',
            lastVisit: localStorage.getItem('hqmx_last_visit') || 'never',
            referrer: document.referrer || 'direct'
        };
    }

    function getYouTubeSessionInfo() {
        return {
            hasYouTubeSession: document.cookie.includes('YSC') || document.cookie.includes('VISITOR_INFO'),
            youtubeLanguage: localStorage.getItem('yt-player-language') || 'unknown',
            youtubeQuality: localStorage.getItem('yt-player-quality') || 'unknown'
        };
    }

    function getYouTubeActivityPattern() {
        return {
            watchHistory: localStorage.getItem('yt-remote-session-app') ? 'present' : 'absent',
            searchHistory: localStorage.getItem('yt-remote-session-name') ? 'present' : 'absent',
            preferences: localStorage.getItem('yt-player-headers-readable') ? 'present' : 'absent'
        };
    }

    function getYouTubeStorageData() {
        const youtubeKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('yt-') || key.includes('youtube'))) {
                youtubeKeys.push(key);
            }
        }
        return youtubeKeys;
    }

    async function analyzeYouTubeUrl(url) {
        const videoId = extractVideoId(url);
        return {
            videoId: videoId,
            timestamp: Date.now(),
            referrer: document.referrer,
            userAgent: navigator.userAgent
        };
    }

    function extractVideoId(url) {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/; 
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    async function storeInIndexedDB(key, value, metadata) {
        try {
            const request = indexedDB.open('HQMX_DB', 1);

            request.onupgradeneeded = function(event) {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('sessions')) {
                    db.createObjectStore('sessions', { keyPath: 'id' });
                }
            };

            request.onsuccess = function(event) {
                const db = event.target.result;
                const transaction = db.transaction(['sessions'], 'readwrite');
                const store = transaction.objectStore('sessions');

                store.put({
                    id: key,
                    value: value,
                    metadata: metadata,
                    timestamp: Date.now()
                });
            };
        } catch (e) {
            console.warn('IndexedDB storage failed:', e);
        }
    }

    // --- UTILITY: Client Side Analysis ---
    async function performClientSideAnalysis(url) {

        // 클라이언트 브라우저에서 직접 분석 수행
        const clientInfo = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            timestamp: Date.now(),
            screen: {
                width: screen.width,
                height: screen.height
            },
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            cookies: document.cookie
        };


        // 클라이언트 브라우저에서 직접 분석을 시도
        try {
            // 1. 클라이언트 브라우저에서 직접 분석 시도
            const clientAnalysisResult = await performDirectClientAnalysis(url, clientInfo);
            return clientAnalysisResult;
        } catch (clientError) {
            console.log('Client-side analysis failed, falling back to server:', clientError);

            // 2. 실패 시 서버에 클라이언트 정보와 함께 요청
            const response = await fetch(`${API_BASE_URL}/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Language': clientInfo.language
                },
                body: JSON.stringify({
                    url,
                    useClientIP: true,
                    clientInfo: clientInfo
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Analysis failed');

            return data;
        }
    }

    // 클라이언트 브라우저에서 직접 분석 수행
    async function performDirectClientAnalysis(url, clientInfo) {

        // 클라이언트 브라우저에서 직접 분석을 시도
        // 이는 실제로는 클라이언트의 IP와 브라우저 환경을 사용
        const analysisData = {
            url,
            clientInfo,
            analysisType: 'direct_client',
            timestamp: Date.now()
        };

        // 클라이언트 브라우저에서 직접 분석을 수행하는 프록시 엔드포인트 호출
        const response = await fetch(`${API_BASE_URL}/client-analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept-Language': clientInfo.language
            },
            body: JSON.stringify(analysisData)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Client analysis failed');

        return data;
    }

    // --- UTILITY FUNCTIONS ---
    function showError(message) {
        // Prepend "Refresh browser and try again." to all error messages
        const refreshMessage = i18next.t('refreshAndTryAgain');
        const fullMessage = refreshMessage + '\n\n' + message;
        alert(fullMessage);
    }
    const formatDuration = (s) => {
        // Round to nearest second (remove sub-second precision)
        const totalSeconds = Math.round(s);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };
    const formatViews = (n) => n > 1_000_000 ? `${(n/1_000_000).toFixed(1)}M` : n > 1000 ? `${(n/1000).toFixed(1)}K` : n.toString();
    function formatBytes(bytes, decimals = 2) {
        if (!+bytes) return '0 Bytes'
        const k = 1024
        const dm = decimals < 0 ? 0 : decimals
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
    }
    const getQualityLabel = (h) => {
        if (h >= 3840) return `4K UHD (${h}p)`;
        if (h >= 2160) return `4K UHD (${h}p)`;
        if (h >= 1440) return `2K QHD (${h}p)`;
        if (h >= 1080) return `Full HD (${h}p)`;
        if (h >= 720) return `HD (${h}p)`;
        return `${h}p`;
    };

    // --- UTILITY: Dynamic Link Updater ---
    function updateDynamicLinks() {
        const currentLang = localStorage.getItem('language') || 'en';
        const baseUrl = HQMX_FRONTEND_BASE_URL;

        // 1. 메인 서비스 링크 (Converter, Downloader, Generator, Calculator)
        document.querySelectorAll('.sitemap-bottom .logo-link').forEach(link => {
            let originalPath = link.getAttribute('href');
            if (originalPath.startsWith('/')) {
                // Special handling for download which needs /download/ path structure
                if (originalPath === '/download') {
                    link.href = `${baseUrl}/${currentLang}${originalPath}/`;
                } else {
                    link.href = `${baseUrl}/${currentLang}${originalPath}`;
                }
            } else {
                console.warn(`Unexpected link path for sitemap-bottom logo-link: ${originalPath}`);
            }
        });

        // 2. 플랫폼 아이콘 링크 (Downloader 관련)
        document.querySelectorAll('.platform-icons-nav .platform-icon-link').forEach(link => {
            let originalPath = link.getAttribute('href'); // e.g., '/youtube', '/instagram'
            if (originalPath.startsWith('/')) {
                link.href = `${baseUrl}/${currentLang}/download${originalPath}`;
            } else {
                console.warn(`Unexpected link path for platform-icon-link: ${originalPath}`);
            }
        });

        // 3. 변환 배지 링크 (Converter 관련)
        document.querySelectorAll('.supported-conversions .conversion-badge').forEach(link => {
            let originalPath = link.getAttribute('href'); // e.g., '/convert/jpg-to-pdf'
            if (originalPath.startsWith('/convert/')) { // Ensure it's a converter path
                link.href = `${baseUrl}/${currentLang}${originalPath}`;
            } else {
                console.warn(`Unexpected link path for conversion-badge: ${originalPath}`);
            }
        });

        // 4. 상단 내비게이션 및 모바일 메뉴 링크 (Home, TOS, Privacy, API)
        document.querySelectorAll('.nav-menu .nav-link, .mobile-menu-links .mobile-menu-link').forEach(link => {
            let originalPath = link.getAttribute('href');
            // Home 링크는 항상 기본 URL
            if (originalPath === '/') {
                link.href = `${baseUrl}/`;
            } else if (originalPath.startsWith('/')) {
                link.href = `${baseUrl}/${currentLang}${originalPath}`;
            } else {
                console.warn(`Unexpected link path for nav-link or mobile-menu-link: ${originalPath}`);
            }
        });
    }

    // 스크롤 시 헤더 blur 효과
    const topNav = document.querySelector('.top-nav');

    function handleScroll() {
        if (window.scrollY > 0) {
            topNav.classList.add('scrolled');
        } else {
            topNav.classList.remove('scrolled');
        }
    }

    // 초기 상태 확인
    handleScroll();

    // 스크롤 이벤트 리스너 추가
    window.addEventListener('scroll', handleScroll, { passive: true });

    // --- CONVERTER EXPAND FUNCTIONALITY ---
    const converterExpandBtn = document.getElementById('converterExpandBtn');
    const converterLogoLink = document.querySelector('.sitemap-left .logo-link');
    const categoryIconsNav = document.querySelector('.category-icons-nav');
    const categoryIconBtns = document.querySelectorAll('.category-icon-btn');
    const supportedConversions = document.querySelector('.supported-conversions');

    // Function to toggle category icons
    function toggleCategoryIcons() {
        if (categoryIconsNav) {
            // Close DOWNLOADER panel if it's open (mutual exclusion)
            const platformNav = document.querySelector('.platform-icons-nav');
            const dlExpandBtn = document.getElementById('downloaderExpandBtn');
            const platformBtns = document.querySelectorAll('.platform-icon-btn');

            if (platformNav && platformNav.classList.contains('show')) {
                platformNav.classList.remove('show');
                if (dlExpandBtn) {
                    dlExpandBtn.classList.remove('expanded');
                }
                platformBtns.forEach(btn => btn.classList.remove('active'));
            }

            categoryIconsNav.classList.toggle('show');
            if (converterExpandBtn) {
                converterExpandBtn.classList.toggle('expanded');
            }

            // If hiding, also hide all categories
            if (!categoryIconsNav.classList.contains('show')) {
                const allCategories = document.querySelectorAll('.conversion-category');
                allCategories.forEach(cat => {
                    cat.classList.remove('active');
                    cat.classList.remove('show-badges');
                });
                categoryIconBtns.forEach(btn => btn.classList.remove('active'));

                // Hide supported conversions when category icons are hidden
                if (supportedConversions) {
                    supportedConversions.style.display = 'none';
                }
            } else {
                // Show supported conversions when category icons are shown
                if (supportedConversions) {
                    supportedConversions.style.display = 'block';
                }
            }
        }
    }

    // Converter + button click
    if (converterExpandBtn) {
        converterExpandBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleCategoryIcons();
        });
    }

    // Converter logo click - Removed (now just a link to hqmx.net)

    // 카테고리 아이콘 버튼 클릭 시 배지 표시
    categoryIconBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;

            // Show category icons if not shown
            if (!categoryIconsNav.classList.contains('show')) {
                categoryIconsNav.classList.add('show');
                if (converterExpandBtn) {
                    converterExpandBtn.classList.add('expanded');
                }
            }

            // 모든 카테고리 아이콘 버튼에서 active 제거
            categoryIconBtns.forEach(b => b.classList.remove('active'));
            // 클릭한 버튼에 active 추가
            btn.classList.add('active');

            // 모든 카테고리에서 active와 show-badges 제거
            const allCategories = document.querySelectorAll('.conversion-category');
            allCategories.forEach(cat => {
                cat.classList.remove('active');
                cat.classList.remove('show-badges');
            });

            // 클릭한 카테고리를 active로 설정하고 배지 표시
            const targetCategory = document.querySelector(`.conversion-category[data-category="${category}"]`);
            if (targetCategory) {
                targetCategory.classList.add('active');
                targetCategory.classList.add('show-badges');

                // Show supported conversions section
                if (supportedConversions) {
                    supportedConversions.style.display = 'block';
                }
            }
        });
    });

    // --- DOWNLOADER EXPAND FUNCTIONALITY ---
    const downloaderExpandBtn = document.getElementById('downloaderExpandBtn');
    const downloaderLogoLink = document.querySelector('.sitemap-right .logo-link');
    const platformIconsNav = document.querySelector('.platform-icons-nav');
    const platformIconBtns = document.querySelectorAll('.platform-icon-btn');

    // Function to toggle platform icons
    function togglePlatformIcons() {
        if (platformIconsNav) {
            // Close CONVERTER panel if it's open (mutual exclusion)
            const categoryNav = document.querySelector('.category-icons-nav');
            const convExpandBtn = document.getElementById('converterExpandBtn');
            const categoryBtns = document.querySelectorAll('.category-icon-btn');
            const supportedConv = document.querySelector('.supported-conversions');

            if (categoryNav && categoryNav.classList.contains('show')) {
                categoryNav.classList.remove('show');
                if (convExpandBtn) {
                    convExpandBtn.classList.remove('expanded');
                }
                categoryBtns.forEach(btn => btn.classList.remove('active'));

                // Also hide conversion categories and supported conversions
                const allCategories = document.querySelectorAll('.conversion-category');
                allCategories.forEach(cat => {
                    cat.classList.remove('active');
                    cat.classList.remove('show-badges');
                });
                if (supportedConv) {
                    supportedConv.style.display = 'none';
                }
            }

            platformIconsNav.classList.toggle('show');
            if (downloaderExpandBtn) {
                downloaderExpandBtn.classList.toggle('expanded');
            }

            // If hiding, remove active states
            if (!platformIconsNav.classList.contains('show')) {
                platformIconBtns.forEach(btn => btn.classList.remove('active'));
            }
        }
    }

    // Downloader + button click
    if (downloaderExpandBtn) {
        downloaderExpandBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            togglePlatformIcons();
        });
    }

    // Downloader logo click - Removed (now just a link to downloader.hqmx.net)

    // Platform icon button click handlers
    platformIconBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Ignore clicks on disabled buttons
            if (btn.disabled || btn.classList.contains('disabled')) {
                return;
            }

            const platform = btn.dataset.platform;

            // Show platform icons if not shown
            if (!platformIconsNav.classList.contains('show')) {
                platformIconsNav.classList.add('show');
                if (downloaderExpandBtn) {
                    downloaderExpandBtn.classList.add('expanded');
                }
            }

            // Toggle active state
            platformIconBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Navigate to platform-specific downloader page
            // For now, just log - you can implement navigation later
            console.log(`${platform} downloader selected`);
            // window.location.href = `https://hqmx.net/downloader/${platform}`;
        });
    });
});
// Initialize sitemap functionality
// Use a function that works whether DOM is ready or not
function initSitemap() {
    // --- CONVERTER EXPAND FUNCTIONALITY ---
    const converterExpandBtn = document.getElementById('converterExpandBtn');
    const converterLogoLink = document.querySelector('.sitemap-left .logo-link');
    const categoryIconsNav = document.querySelector('.category-icons-nav');
    const categoryIconBtns = document.querySelectorAll('.category-icon-btn');
    const supportedConversions = document.querySelector('.supported-conversions');

    // Function to toggle category icons
    function toggleCategoryIcons() {
        if (categoryIconsNav) {
            // Close DOWNLOADER panel if it's open (mutual exclusion)
            const platformNav = document.querySelector('.platform-icons-nav');
            const dlExpandBtn = document.getElementById('downloaderExpandBtn');
            const platformBtns = document.querySelectorAll('.platform-icon-btn');

            if (platformNav && platformNav.classList.contains('show')) {
                platformNav.classList.remove('show');
                if (dlExpandBtn) {
                    dlExpandBtn.classList.remove('expanded');
                }
                platformBtns.forEach(btn => btn.classList.remove('active'));
            }

            categoryIconsNav.classList.toggle('show');
            if (converterExpandBtn) {
                converterExpandBtn.classList.toggle('expanded');
            }

            // If hiding, also hide all categories
            if (!categoryIconsNav.classList.contains('show')) {
                const allCategories = document.querySelectorAll('.conversion-category');
                allCategories.forEach(cat => {
                    cat.classList.remove('active');
                    cat.classList.remove('show-badges');
                });
                categoryIconBtns.forEach(btn => btn.classList.remove('active'));

                // Hide supported conversions when category icons are hidden
                if (supportedConversions) {
                    supportedConversions.style.display = 'none';
                }
            } else {
                // Show supported conversions when category icons are shown
                if (supportedConversions) {
                    supportedConversions.style.display = 'block';
                }

                // Show default category (cross-category) when expanding
                const defaultCategory = document.querySelector('.conversion-category[data-category="cross-category"]');
                const defaultCategoryBtn = document.querySelector('.category-icon-btn[data-category="cross-category"]');
                if (defaultCategory && !defaultCategory.classList.contains('active')) {
                    defaultCategory.classList.add('active');
                }
                if (defaultCategoryBtn && !defaultCategoryBtn.classList.contains('active')) {
                    defaultCategoryBtn.classList.add('active');
                }
            }
        }
    }

    // Converter + button click
    if (converterExpandBtn) {
        converterExpandBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleCategoryIcons();
        });
    }

    // Converter logo click - Removed (now just a link to hqmx.net)

    // 카테고리 아이콘 버튼 클릭 시 배지 표시
    categoryIconBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;

            // Show category icons if not shown
            if (!categoryIconsNav.classList.contains('show')) {
                categoryIconsNav.classList.add('show');
                if (converterExpandBtn) {
                    converterExpandBtn.classList.add('expanded');
                }
            }

            // 모든 카테고리 아이콘 버튼에서 active 제거
            categoryIconBtns.forEach(b => b.classList.remove('active'));
            // 클릭한 버튼에 active 추가
            btn.classList.add('active');

            // 모든 카테고리에서 active와 show-badges 제거
            const allCategories = document.querySelectorAll('.conversion-category');
            allCategories.forEach(cat => {
                cat.classList.remove('active');
                cat.classList.remove('show-badges');
            });

            // 클릭한 카테고리를 active로 설정하고 배지 표시
            const targetCategory = document.querySelector(`.conversion-category[data-category="${category}"]`);
            if (targetCategory) {
                targetCategory.classList.add('active');
                targetCategory.classList.add('show-badges');

                // Show supported conversions section
                if (supportedConversions) {
                    supportedConversions.style.display = 'block';
                }
            }
        });
    });

    // --- DOWNLOADER EXPAND FUNCTIONALITY ---
    const downloaderExpandBtn = document.getElementById('downloaderExpandBtn');
    const downloaderLogoLink = document.querySelector('.sitemap-right .logo-link');
    const platformIconsNav = document.querySelector('.platform-icons-nav');
    const platformIconBtns = document.querySelectorAll('.platform-icon-btn');

    // Function to toggle platform icons
    function togglePlatformIcons() {
        if (platformIconsNav) {
            // Close CONVERTER panel if it's open (mutual exclusion)
            const categoryNav = document.querySelector('.category-icons-nav');
            const convExpandBtn = document.getElementById('converterExpandBtn');
            const categoryBtns = document.querySelectorAll('.category-icon-btn');
            const supportedConv = document.querySelector('.supported-conversions');

            if (categoryNav && categoryNav.classList.contains('show')) {
                categoryNav.classList.remove('show');
                if (convExpandBtn) {
                    convExpandBtn.classList.remove('expanded');
                }
                categoryBtns.forEach(btn => btn.classList.remove('active'));

                // Also hide conversion categories and supported conversions
                const allCategories = document.querySelectorAll('.conversion-category');
                allCategories.forEach(cat => {
                    cat.classList.remove('active');
                    cat.classList.remove('show-badges');
                });
                if (supportedConv) {
                    supportedConv.style.display = 'none';
                }
            }

            platformIconsNav.classList.toggle('show');
            if (downloaderExpandBtn) {
                downloaderExpandBtn.classList.toggle('expanded');
            }

            // If hiding, remove active states
            if (!platformIconsNav.classList.contains('show')) {
                platformIconBtns.forEach(btn => btn.classList.remove('active'));
            }
        }
    }

    // Downloader + button click
    if (downloaderExpandBtn) {
        downloaderExpandBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            togglePlatformIcons();
        });
    }

    // Downloader logo click - Removed (now just a link to downloader.hqmx.net)

    // Platform icon button click handlers
    platformIconBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Ignore clicks on disabled buttons
            if (btn.disabled || btn.classList.contains('disabled')) {
                return;
            }

            const platform = btn.dataset.platform;

            // Show platform icons if not shown
            if (!platformIconsNav.classList.contains('show')) {
                platformIconsNav.classList.add('show');
                if (downloaderExpandBtn) {
                    downloaderExpandBtn.classList.add('expanded');
                }
            }

            // Toggle active state
            platformIconBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Navigate to platform-specific downloader page
            // For now, just log - you can implement navigation later
            console.log(`${platform} downloader selected`);
            // window.location.href = `https://hqmx.net/downloader/${platform}`;
        });
    });
}

// Execute initialization immediately if DOM is already ready, otherwise wait
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSitemap);
} else {
    // DOM is already ready, execute immediately
    initSitemap();
}