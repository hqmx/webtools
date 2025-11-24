// Ad Network Functions (defined in <head>):
// - loadMonetagScript() - Called when media conversion starts (server-side download begins)
// - loadExoClickInterstitial() - Called when download completes (100% progress)

document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    let state = {
        currentTaskId: null,
        currentFormat: 'video',
        mediaInfo: null,
        eventSource: null
    };

    // --- CONFIGURATION ---
    // API 엔드포인트 설정
// 로컬 개발: http://localhost:5001/api
// 프로덕션: https://downloader.hqmx.net/api (통합 백엔드)
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '10.0.1.65'
    ? 'http://10.0.1.65:5001/api'
    : 'https://downloader.hqmx.net/api';

    // Quality preset definitions
    const VIDEO_PRESETS = [
        { label: '4K', height: 2160 },
        { label: '2K', height: 1440 },
        { label: '1080HD', height: 1080 },
        { label: '720p', height: 720 },
        { label: '480p', height: 480 },
        { label: '360p', height: 360 },
        { label: '240p', height: 240 },
        { label: '144p', height: 144 }
    ];

    const FPS_PRESETS = [60, 30, 24];

    const AUDIO_PRESETS = [
        { label: 'Lossless', value: 'lossless' },
        { label: '192kbps', value: '192' },
        { label: '128kbps', value: '128' }
    ];

    // --- DOM ELEMENT CACHE ---
    const dom = {
        themeToggleBtn: document.getElementById('themeToggleBtn'),
        urlInput: document.getElementById('urlInput'),
        analyzeBtn: document.getElementById('analyzeBtn'),
        analyzeBtnIcon: document.getElementById('analyzeBtn')?.querySelector('i'),
        analyzeBtnText: document.getElementById('analyzeBtn')?.querySelector('span'),
        previewSection: document.getElementById('previewSection'),
        previewContainer: document.getElementById('previewContainer'),
        urlSection: document.getElementById('urlSection'),
        thumbnailImg: document.getElementById('thumbnailImg'),
        mediaTitle: document.getElementById('mediaTitle'),
        mediaDuration: document.getElementById('mediaDuration'),
        formatTabs: document.querySelectorAll('.format-tab'),
        videoFormatsContainer: document.getElementById('videoFormats'),
        audioFormatsContainer: document.getElementById('audioFormats'),
        videoFormat: document.getElementById('videoFormat'),
        videoQuality: document.getElementById('videoQuality'),
        videoFps: document.getElementById('videoFps'),
        audioFormat: document.getElementById('audioFormat'),
        audioQuality: document.getElementById('audioQuality'),
        videoSizeEstimate: document.getElementById('videoSizeEstimate'),
        audioSizeEstimate: document.getElementById('audioSizeEstimate'),
        downloadBtn: document.getElementById('downloadBtn'),
        progressContainer: document.getElementById('progressSection'),
        spinner: document.querySelector('#progressSection .spinner'),
        progressStatus: document.getElementById('progressStatus'),
        progressPercentage: document.querySelector('#progressSection .progress-percentage'),
        progressBar: document.querySelector('#progressSection .progress-fill'),
    };

    // --- THEME MANAGEMENT ---
    const currentTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.body.setAttribute('data-theme', currentTheme);

    // --- BACKGROUND IMAGE LOADING ---
    // 테마 설정 후 배경 이미지 로드
    function handleThemeToggle() {
        const newTheme = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }

    // Navigation Functions
    function toggleMobileMenu() {
        const hamburgerMenu = document.getElementById('hamburgerMenu');
        const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');

        hamburgerMenu.classList.toggle('active');
        mobileMenuOverlay.classList.toggle('show');

        // 모바일 메뉴가 열릴 때 토글 버튼들 강제 표시
        if (mobileMenuOverlay.classList.contains('show')) {
            const mobileControls = document.querySelector('.mobile-menu-controls');
            const mobileControlItems = document.querySelectorAll('.mobile-control-item');
            const mobileThemeBtn = document.getElementById('mobileThemeToggleBtn');
            const mobileLangBtn = document.getElementById('mobileLanguageSelectorBtn');

            if (mobileControls) {
                mobileControls.style.display = 'block';
                mobileControls.style.visibility = 'visible';
                mobileControls.style.opacity = '1';
            }

            mobileControlItems.forEach(item => {
                item.style.display = 'flex';
                item.style.visibility = 'visible';
                item.style.opacity = '1';
            });

            if (mobileThemeBtn) {
                mobileThemeBtn.style.display = 'flex';
                mobileThemeBtn.style.visibility = 'visible';
                mobileThemeBtn.style.opacity = '1';
            }

            if (mobileLangBtn) {
                mobileLangBtn.style.display = 'flex';
                mobileLangBtn.style.visibility = 'visible';
                mobileLangBtn.style.opacity = '1';
            }
        }
    }

    function closeMobileMenu() {
        const hamburgerMenu = document.getElementById('hamburgerMenu');
        const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');

        hamburgerMenu.classList.remove('active');
        mobileMenuOverlay.classList.remove('show');
    }

    // --- EVENT LISTENERS ---
    if (dom.themeToggleBtn) {
        dom.themeToggleBtn.addEventListener('click', handleThemeToggle);
    }

    // Navigation Event Listeners
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');

    if (hamburgerMenu && mobileMenuOverlay) {
        hamburgerMenu.addEventListener('click', toggleMobileMenu);
        mobileMenuOverlay.addEventListener('click', (e) => {
            if (e.target === mobileMenuOverlay) {
                closeMobileMenu();
            }
        });

        // 모바일 메뉴 링크 클릭 시 메뉴 닫기
        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                // 기존 네비게이션 로직 사용
                document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(l => l.classList.remove('active'));
                document.querySelectorAll(`[data-section="${section}"]`).forEach(l => l.classList.add('active'));
                closeMobileMenu();
            });
        });

        // 모바일 토글 버튼 이벤트 리스너
        const mobileThemeToggleBtn = document.getElementById('mobileThemeToggleBtn');
        const mobileLanguageSelectorBtn = document.getElementById('mobileLanguageSelectorBtn');
        const mobileLanguageOptions = document.getElementById('mobileLanguageOptions');

        if (mobileThemeToggleBtn) {
            mobileThemeToggleBtn.addEventListener('click', handleThemeToggle);
        }

        if (mobileLanguageSelectorBtn && mobileLanguageOptions) {
            mobileLanguageSelectorBtn.addEventListener('click', () => {
                mobileLanguageOptions.classList.toggle('show');
            });

            mobileLanguageOptions.addEventListener('click', async (e) => {
                if (e.target.dataset.lang) {
                    e.preventDefault(); // Prevent default <a> tag behavior
                    const lang = e.target.dataset.lang;

                    // Close mobile language selector
                    mobileLanguageOptions.classList.remove('show');

                    // Update language using i18n
                    if (typeof i18n !== 'undefined' && i18n.changeLanguage) {
                        await i18n.changeLanguage(lang);
                        const currentLangElement = document.getElementById('mobileCurrentLanguage');
                        if (currentLangElement) {
                            currentLangElement.textContent = e.target.textContent;
                        }
                    }
                }
            });
        }
    }

    if (dom.analyzeBtn) {
        dom.analyzeBtn.addEventListener('click', handleAnalyzeClick);
    }
    if (dom.urlInput) {
        dom.urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleAnalyzeClick();
        });
    }
    if (dom.formatTabs) {
        dom.formatTabs.forEach(tab => {
            tab.addEventListener('click', () => handleFormatSwitch(tab.dataset.mediaType));
        });
    }
    [dom.videoFormat, dom.videoQuality, dom.audioFormat, dom.audioQuality].forEach(el => {
        if (el) el.addEventListener('change', updateSizeEstimates);
    });
    if (dom.downloadBtn) {
        dom.downloadBtn.addEventListener('click', handleDownloadClick);
    }

    // --- STATUS DISPLAY FUNCTION ---
    function showStatus(message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);
        // 상태 메시지를 UI에 표시 (선택사항)
        // dom.statusDisplay && (dom.statusDisplay.textContent = message);
    }

    // --- HANDLER: Analyze URL ---
    async function handleAnalyzeClick() {
        const url = dom.urlInput.value.trim();

        if (!url) {
            showError(t('please_enter_url'));
            return;
        }

        setAnalyzingState(true);
        resetUI();

        try {
            const clientAnalysisResult = await performUltimateAnalysis(url);
            
            state.mediaInfo = clientAnalysisResult;
            renderPreview(clientAnalysisResult);
            dom.previewSection.style.display = 'block';

            // 레이아웃 재배치: 미리보기를 상단으로, URL 입력창을 하단으로 이동
            rearrangeLayout();

        } catch (error) {
            console.error('Analysis failed:', error.message);
            showError(t('analysis_failed', { error: error.message }));
        } finally {
            setAnalyzingState(false);
        }
    }

    // --- HANDLER: Switch Format ---
    function handleFormatSwitch(type) {
        state.currentFormat = type;
        dom.formatTabs.forEach(tab => tab.classList.toggle('active', tab.dataset.mediaType === type));
        dom.videoFormatsContainer.classList.toggle('active', type === 'video');
        dom.audioFormatsContainer.classList.toggle('active', type === 'audio');
        updateSizeEstimates();
    }

    // --- HANDLER: Start Download ---
    async function handleDownloadClick() {
        if (!state.mediaInfo) {
            showError(t('please_analyze_first'));
            return;
        }

        // YouTube: Use client-side download via popunder (savefrom.net style)
        // Reason: User's browser cookies enable access to 1080p+ streaming URLs
        // Popunder extracts direct download URL using user's login state
        const url = dom.urlInput.value.trim().toLowerCase();
        const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');

        if (isYouTube) {
            console.log('YouTube: client-side download via popunder');
            downloadYouTubeClientSide();
            return;
        }

        // Facebook: Force server-side download (DASH format requires FFmpeg processing)
        // Facebook uses DASH adaptive streaming which needs initialization segment + media segment merging
        const isFacebook = url.includes('facebook.com') || url.includes('fb.com') || url.includes('fb.watch');
        if (isFacebook) {
            console.log('Facebook: server-side download');
            startServerSideDownload();
            return;
        }

        // Instagram: Force server-side download (DASH format requires FFmpeg processing)
        // Instagram uses DASH adaptive streaming like Facebook
        const isInstagram = url.includes('instagram.com') || url.includes('instagr.am');
        if (isInstagram) {
            console.log('Instagram: server-side download');
            startServerSideDownload();
            return;
        }

        // TikTok: Force server-side download (CORS policy blocks client-side)
        // TikTok CDN returns: Access-Control-Allow-Origin: https://www.tiktok.com only
        const isTikTok = url.includes('tiktok.com') || url.includes('tiktokcdn');
        if (isTikTok) {
            console.log('TikTok: server-side download');
            startServerSideDownload();
            return;
        }

        // Other platforms: Try client-side download first
        const clientDownloadUrl = getDirectDownloadUrl();
        if (clientDownloadUrl) {
            downloadDirectly(clientDownloadUrl);
            return;
        }

        // Fallback to server-side download
        startServerSideDownload();
    }

    function getDirectDownloadUrl() {
        // Get the selected format's direct URL
        const isVideo = state.currentFormat === 'video';
        const quality = isVideo ? dom.videoQuality.value : dom.audioQuality.value;
        const formats = isVideo ? state.mediaInfo.video_formats : state.mediaInfo.audio_formats;

        if (!formats || formats.length === 0) return null;

        // Find format matching quality
        let selectedFormat;
        if (quality === 'best') {
            // Try to find pre-merged format first
            selectedFormat = formats.find(f => f.url && f.vcodec && f.vcodec !== 'none' && f.acodec && f.acodec !== 'none');
            // If no pre-merged, get best video/audio
            if (!selectedFormat) {
                selectedFormat = formats.find(f => f.url);
            }
        } else {
            // Specific quality requested
            if (isVideo) {
                const targetHeight = parseInt(quality);
                selectedFormat = formats.find(f => f.url && f.height === targetHeight);
            } else {
                // Audio: Check if conversion is needed
                const requestedFormat = dom.audioFormat.value; // mp3, m4a, etc.
                const targetBitrate = quality === 'best' ? null : parseInt(quality);

                selectedFormat = formats.find(f => {
                    if (!f.url) return false;

                    // Check format compatibility
                    const sourceFormat = f.ext; // opus, m4a, webm, etc.

                    // If conversion needed (e.g., opus → mp3), use server
                    if (requestedFormat === 'mp3' && sourceFormat !== 'mp3') return false;
                    if (requestedFormat === 'm4a' && sourceFormat !== 'm4a') return false;

                    // If bitrate conversion needed, use server
                    if (targetBitrate && f.abr && Math.abs(f.abr - targetBitrate) > 10) return false;

                    return true;
                });
            }
        }

        // Check if URL is HLS/m3u8 playlist (requires server-side download)
        // SoundCloud and similar platforms use HLS streaming which needs special handling
        const url = selectedFormat?.url;
        if (url && (url.includes('/playlist') || url.includes('.m3u8') || url.includes('/hls'))) {
            return null;  // Force server-side download for HLS
        }

        return url;
    }

    async function downloadDirectly(url) {
        try {
            showStatus('⏳ Starting download...');

            // Use fetch + blob to force download (not playback)
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            // Get filename from Content-Disposition or use title
            let filename = state.mediaInfo.title || 'download';
            const contentDisposition = response.headers.get('Content-Disposition');
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1].replace(/['"]/g, '');
                }
            }

            // Add extension if needed
            const isVideo = state.currentFormat === 'video';
            const format = isVideo ? dom.videoFormat.value : dom.audioFormat.value;
            if (!filename.endsWith(`.${format}`)) {
                filename += `.${format}`;
            }

            // Stream with progress tracking for better UX
            const contentLength = response.headers.get('Content-Length');
            let blob;

            if (contentLength) {
                const total = parseInt(contentLength, 10);
                const reader = response.body.getReader();
                let loaded = 0;
                const chunks = [];

                setDownloadingState(true);  // Show progress UI

                while (true) {
                    const {done, value} = await reader.read();
                    if (done) break;

                    chunks.push(value);
                    loaded += value.length;

                    // Update progress bar
                    const percent = (loaded / total) * 100;
                    updateProgress(percent, `Downloading... ${(loaded / 1024 / 1024).toFixed(1)} MB / ${(total / 1024 / 1024).toFixed(1)} MB`);
                }

                blob = new Blob(chunks);
            } else {
                // No content-length, fall back to simple blob
                blob = await response.blob();
            }

            const blobUrl = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            // Clean up blob URL
            setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

            // Success notification with file details
            const fileSizeMB = (blob.size / 1024 / 1024).toFixed(2);
            updateProgress(100, `✅ Download complete: ${filename}`);
            showStatus(`✅ Download complete: ${filename} (${fileSizeMB} MB)`);

            // Load ExoClick interstitial ad when download completes
            loadExoClickInterstitial();

            // Keep success message visible for 3 seconds
            setTimeout(() => {
                setDownloadingState(false);
            }, 3000);
        } catch (error) {
            console.error('❌ Client-side download failed:', error);
            showStatus('⚠️ Trying alternative download method...');
            startServerSideDownload();
        }
    }

    async function startServerSideDownload() {
        const payload = {
            url: dom.urlInput.value.trim(),
            mediaType: state.currentFormat,
            formatType: state.currentFormat === 'video' ? dom.videoFormat.value : dom.audioFormat.value,
            quality: state.currentFormat === 'video' ? dom.videoQuality.value : dom.audioFormat.value,
            fps: state.currentFormat === 'video' ? (dom.videoFps ? dom.videoFps.value : 'any') : undefined,
            audio_quality: state.currentFormat === 'audio' ? dom.audioQuality.value : undefined,
            useClientIP: true,
            title: state.mediaInfo?.title // Optimization: Pass title to avoid re-fetching metadata
        };

        // BUGFIX (2025-11-02): Pass cached extracted_url from analyze phase
        // Prevents double Stealth Browser extraction (50% faster, more reliable)
        // Instagram: Full video URL (2.6MB) instead of chunk URL (107KB)
        if (state.mediaInfo && state.mediaInfo.extracted_url) {
            payload.extracted_url = state.mediaInfo.extracted_url;
            console.log('Using cached extracted_url from analyze phase');
        }
        setDownloadingState(true);
        updateProgress(0, 'Requesting download...');

        try {
            const currentLang = localStorage.getItem('language') || 'en';
            const response = await fetch(`${API_BASE_URL}/download`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Language': currentLang
                },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!response.ok || !data.task_id) throw new Error(data.error || t('failed_to_start_download'));

            state.currentTaskId = data.task_id;
            startProgressMonitor(data.task_id);

            // Load Monetag vignette ad (Zone 10017255) when media conversion starts
            loadMonetagScript();

        } catch (error) {
            console.error('Download Start Error:', error);
            showError(t('error_prefix', { error: error.message }));
            setDownloadingState(false);
        }
    }

    // --- REAL-TIME: Progress Monitoring via SSE ---
    function startProgressMonitor(taskId) {
        if (state.eventSource) state.eventSource.close();
        state.eventSource = new EventSource(`${API_BASE_URL}/stream-progress/${taskId}`);
        
        state.eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.status === 'error') {
                   throw new Error(data.message);
                }
                updateProgress(data.percentage, data.message);
                if (data.status === 'complete') {
                   handleDownloadCompletion(taskId);
                }
            } catch (error) {
                console.error("SSE Message Error:", error)
                showError(t('error_prefix', { error: error.message }));
                handleDownloadTermination();
            }
        };
        
        state.eventSource.onerror = (err) => {
            console.error('SSE connection error:', err);
            showError(t('connection_lost_retrying'));
            setTimeout(() => fetchFinalStatus(taskId), 2000);
            handleDownloadTermination();
        };
    }
    
    // --- FINALIZATION ---
    function handleDownloadCompletion(taskId) {
        // Progress already at 100% from EventSource message - no need to update again
        // This prevents duplicate Monetag ad loading
        window.location.href = `${API_BASE_URL}/get-file/${taskId}`;
        setTimeout(() => setDownloadingState(false), 3000);
        handleDownloadTermination();
    }
    
    function handleDownloadTermination() {
        if (state.eventSource) {
            state.eventSource.close();
            state.eventSource = null;
        }
        state.currentTaskId = null;
    }

    async function fetchFinalStatus(taskId) {
        try {
            const response = await fetch(`${API_BASE_URL}/check-status/${taskId}`);
            const data = await response.json();
            if (data.status === 'complete') {
                handleDownloadCompletion(taskId);
            } else {
                showError(data.message || t('could_not_complete_task'));
                setDownloadingState(false);
            }
        } catch (error) {
            showError(t('could_not_retrieve_status'));
            setDownloadingState(false);
        }
    }

    // --- UI RENDERING & STATE ---
    function setAnalyzingState(isAnalyzing) {
        dom.analyzeBtn.disabled = isAnalyzing;
        dom.analyzeBtnIcon.className = isAnalyzing ? 'fas fa-spinner fa-spin' : 'fas fa-search';
        dom.analyzeBtnText.textContent = isAnalyzing ? t('analyzing') : t('analyze');
    }

    function setDownloadingState(isDownloading) {
        dom.downloadBtn.style.display = isDownloading ? 'none' : 'block';
        dom.progressContainer.style.display = isDownloading ? 'block' : 'none';

        // Hide Adsterra complete banners during download
        const adContainer = document.getElementById('adsterra-complete-banners');
        if (adContainer) {
            adContainer.style.display = isDownloading ? 'none' : 'none';
        }
    }
    
    function resetUI() {
        dom.previewSection.style.display = 'none';
        dom.thumbnailImg.src = '';
        dom.thumbnailImg.parentElement.classList.remove('fallback-active');
        state.mediaInfo = null;
        state.currentTaskId = null;
        setDownloadingState(false);
    }

    /**
     * Get thumbnail URL - use backend proxy for Instagram to bypass CORS
     * @param {string} thumbnailUrl - Original thumbnail URL
     * @returns {string} Proxied or direct thumbnail URL
     */
    function getProxiedThumbnailUrl(thumbnailUrl) {
        if (!thumbnailUrl) return '';

        // Instagram CDN blocks CORS - use backend proxy
        // Instagram uses multiple CDN domains:
        // - cdninstagram.com (primary)
        // - fbcdn.net (Facebook CDN - also used by Instagram)
        // - instagram.com (direct)
        if (thumbnailUrl.includes('cdninstagram.com') ||
            thumbnailUrl.includes('instagram.com') ||
            thumbnailUrl.includes('fbcdn.net')) {
            const encodedUrl = encodeURIComponent(thumbnailUrl);
            return `${API_BASE_URL}/thumbnail-proxy?url=${encodedUrl}`;
        }

        // Other platforms allow direct loading
        return thumbnailUrl;
    }

    // --- LAYOUT REARRANGEMENT ---
    function rearrangeLayout() {
        // 미리보기 섹션을 previewContainer로 이동 (상단)
        if (dom.previewSection && dom.previewContainer) {
            dom.previewContainer.appendChild(dom.previewSection);
        }

        // URL 섹션의 제목 숨기기 (선택사항: 분석 후에는 제목 불필요)
        const urlSectionTitle = dom.urlSection.querySelector('h4');
        if (urlSectionTitle) {
            urlSectionTitle.style.display = 'none';
        }
    }

    function renderPreview(info) {
        const thumbContainer = dom.thumbnailImg.parentElement;
        thumbContainer.classList.remove('fallback-active');

        let attemptedProxy = false;

        // Detect aspect ratio and apply appropriate class
        dom.thumbnailImg.onload = () => {
            const img = dom.thumbnailImg;
            const aspectRatio = img.naturalWidth / img.naturalHeight;

            // Thumbnail loaded successfully - hide fallback icon
            thumbContainer.classList.remove('fallback-active');

            // Remove all aspect ratio classes
            thumbContainer.classList.remove('vertical', 'horizontal', 'square');

            // Apply appropriate class based on aspect ratio
            if (aspectRatio < 0.75) {
                // Vertical video (9:16 or taller) - Instagram Reels, TikTok
                thumbContainer.classList.add('vertical');
            } else if (aspectRatio > 1.5) {
                // Horizontal video (16:9 or wider) - YouTube, standard videos
                thumbContainer.classList.add('horizontal');
            } else {
                // Square or near-square (1:1)
                thumbContainer.classList.add('square');
            }
        };

        dom.thumbnailImg.onerror = (e) => {
            console.error('❌ Thumbnail load failed:', dom.thumbnailImg.src);
            console.error('Error event:', e);
            // If proxy failed, try original URL as fallback
            if (attemptedProxy && info.thumbnail) {
                dom.thumbnailImg.src = info.thumbnail;
                attemptedProxy = false;
            } else {
                thumbContainer.classList.add('fallback-active');
            }
        };

        if (info.thumbnail) {
            attemptedProxy = true;
            dom.thumbnailImg.src = getProxiedThumbnailUrl(info.thumbnail);
        } else {
            console.warn('⚠️ No thumbnail in response');
            thumbContainer.classList.add('fallback-active');
            dom.thumbnailImg.src = '';
        }

        dom.mediaTitle.textContent = info.title || t('mediaTitleDefault');
        
        const durationText = info.duration ? `${t('duration')}: ${formatDuration(info.duration)}` : `${t('duration')}: --:--`;
        dom.mediaDuration.innerHTML = `<i class="fas fa-clock"></i> ${durationText}`;

        populateQualityDropdowns(info);
        updateSizeEstimates();
    }
    
    function populateQualityDropdowns(info) {
        // Extract available values from formats
        const availableHeights = [...new Set(info.video_formats?.map(f => f.height).filter(h => h))];
        const availableFps = [...new Set(info.video_formats?.map(f => f.fps).filter(fps => fps))].sort((a, b) => b - a);

        // Find the maximum available height (original quality)
        let maxHeight;
        if (availableHeights.length > 0) {
            // Video platform: Use actual video height
            maxHeight = Math.max(...availableHeights);
        } else if (info.thumbnail_height && info.thumbnail_height > 0) {
            // Audio-only platform with thumbnail: Use thumbnail height
            // (for audio→video conversion, e.g., SoundCloud)
            maxHeight = info.thumbnail_height;
            console.log(`🎨 Audio-only platform detected. Using thumbnail height: ${maxHeight}px`);
        } else {
            // Fallback: Default to 1080p if no height info available
            maxHeight = 1080;
        }

        // Show all presets equal to or lower than the original quality
        // This allows FFmpeg to downscale to any lower resolution
        const availableVideoPresets = VIDEO_PRESETS.filter(preset =>
            preset.height <= maxHeight
        );

        // Filter FPS presets to show only available frame rates
        const availableFpsPresets = FPS_PRESETS.filter(fps =>
            availableFps.includes(fps)
        );

        // Populate video quality dropdown - "원본 화질" as default
        dom.videoQuality.innerHTML = '';
        dom.videoQuality.innerHTML += `<option value="best" selected>${t('originalQuality')}</option>`;
        if (availableVideoPresets.length > 0) {
            availableVideoPresets.forEach((preset) => {
                dom.videoQuality.innerHTML += `<option value="${preset.height}">${preset.label}</option>`;
            });
        }

        // Populate FPS dropdown - "원본 fps" as default (if element exists)
        if (dom.videoFps) {
            dom.videoFps.innerHTML = '';
            dom.videoFps.innerHTML += `<option value="any" selected>${t('originalFps')}</option>`;
            if (availableFpsPresets.length > 0) {
                availableFpsPresets.forEach((fps) => {
                    dom.videoFps.innerHTML += `<option value="${fps}">${fps}fps</option>`;
                });
            }
        }

        // Populate audio quality dropdown - "원본 음질" as default
        dom.audioQuality.innerHTML = '';
        dom.audioQuality.innerHTML += `<option value="best" selected>${t('originalAudioQuality')}</option>`;

        // Get maximum source audio bitrate to prevent wasteful upsampling
        const audioFormats = info.audio_formats || [];
        const maxAudioBitrate = audioFormats.length > 0
            ? Math.max(...audioFormats.map(f => f.abr || f.tbr || 0).filter(br => br > 0))
            : 320; // Default to 320 if no bitrate info


        // Filter presets based on source quality
        // Allow up to 1.5x source bitrate to account for codec efficiency
        // (Opus/AAC are more efficient than MP3)
        const maxRecommendedBitrate = Math.ceil(maxAudioBitrate * 1.5);

        AUDIO_PRESETS.forEach(preset => {
            if (preset.value !== 'lossless') { // Skip lossless since "원본 음질" serves same purpose
                const presetBitrate = parseInt(preset.value);

                // Only show presets that don't wastefully upsample
                if (presetBitrate <= maxRecommendedBitrate) {
                    dom.audioQuality.innerHTML += `<option value="${preset.value}">${preset.label}</option>`;
                } else {
                }
            }
        });

        // If no presets are suitable, show at least 128kbps as fallback
        if (dom.audioQuality.options.length === 1) {
            console.warn('⚠️ No suitable MP3 presets, adding 128kbps fallback');
            dom.audioQuality.innerHTML += `<option value="128">128kbps</option>`;
        }
    }

    function updateProgress(percentage, message) {
        dom.progressContainer.style.display = 'block';
        const clampedPercentage = Math.min(100, Math.max(0, percentage));
        dom.progressBar.style.width = clampedPercentage + '%';
        dom.progressPercentage.textContent = Math.round(clampedPercentage) + '%';

        const cleanMessage = message.replace(/\[\d+(?:;\d+)*m/g, '');
        dom.progressStatus.textContent = cleanMessage;

        dom.spinner.style.display = clampedPercentage < 100 && clampedPercentage > 0 ? 'block' : 'none';

        // Show ads when download completes
        if (clampedPercentage >= 100) {
            // Load ExoClick interstitial ad when download completes
            loadExoClickInterstitial();
        }
    }

    // --- UTILITY: Get Format Size ---
    function getFormatSize(format, duration, fallbackBitrate = 0) {
        if (!format && fallbackBitrate === 0) return 0;

        // First try to get direct size information
        const directSize = format?.filesize || format?.filesize_approx;
        if (directSize && directSize > 0) {
            return parseFloat(directSize);
        }

        // Calculate from bitrate and duration
        const bitrate = format?.tbr || format?.abr || format?.vbr || fallbackBitrate;
        if (bitrate && duration > 0) {
            return (parseFloat(bitrate) * 1000 / 8) * duration;
        }

        // Fallback estimation for formats with no size/bitrate info
        if (duration > 0) {
            let assumedBitrate = 192; // Default audio bitrate

            if (format?.vcodec && format?.vcodec !== 'none') {
                // Video format - codec-aware bitrate estimation
                const height = format?.height || 360;
                const codec = (format?.vcodec || '').toLowerCase();

                // AV1 and VP9 have better compression than H.264
                const isModernCodec = codec.includes('av01') || codec.includes('av1') ||
                                      codec.includes('vp09') || codec.includes('vp9');

                if (height >= 2160) { // 4K
                    assumedBitrate = isModernCodec ? 12000 : 20000;
                } else if (height >= 1440) { // 2K
                    assumedBitrate = isModernCodec ? 8000 : 12000;
                } else if (height >= 1080) { // 1080p
                    assumedBitrate = isModernCodec ? 3500 : 5000;
                } else if (height >= 720) { // 720p
                    assumedBitrate = isModernCodec ? 2000 : 3000;
                } else if (height >= 480) { // 480p
                    assumedBitrate = isModernCodec ? 1200 : 1800;
                } else if (height >= 360) { // 360p
                    assumedBitrate = isModernCodec ? 800 : 1200;
                } else { // 240p and below
                    assumedBitrate = isModernCodec ? 400 : 600;
                }
            } else if (format?.acodec && format?.acodec !== 'none') {
                // Audio format - estimate based on quality
                assumedBitrate = format?.abr || 192;
            }

            return (assumedBitrate * 1000 / 8) * duration;
        }

        return 0;
    }

    function updateSizeEstimates() {
        if (!state.mediaInfo) {
            console.log('No media info available');
            return;
        }

        const selectedMediaType = document.querySelector('.format-tab.active').dataset.mediaType;
        let estimatedSize = 0;
        let sizeEstimateEl;
        const duration = state.mediaInfo.duration || 0;

        // Calculate size estimate based on selected format and quality
        if (selectedMediaType === 'video') {
            sizeEstimateEl = dom.videoSizeEstimate;
            const quality = dom.videoQuality.value;
            const videoFormats = state.mediaInfo.video_formats || [];
            const allAudioFormats = [...(state.mediaInfo.audio_formats || [])].sort((a, b) => (b.abr || 0) - (a.abr || 0));
            const bestAudio = allAudioFormats.length > 0 ? allAudioFormats[0] : null;

            if (quality === 'best') {
                const bestVideo = [...videoFormats].sort((a, b) => (b.height || 0) - (a.height || 0) || (b.tbr || 0) - (a.tbr || 0))[0];
                const videoSize = getFormatSize(bestVideo, duration);
                const audioSize = getFormatSize(bestAudio, duration);
                estimatedSize = videoSize + audioSize;
            } else {
                const selectedHeight = parseInt(quality);
                // First try to find a pre-merged format (video + audio)
                const premergedFormat = videoFormats.find(f => f.height === selectedHeight && f.vcodec && f.acodec);
                if (premergedFormat) {
                    estimatedSize = getFormatSize(premergedFormat, duration);
                } else {
                    // Find best video for selected height
                    const bestVideoForHeight = videoFormats.filter(f => f.height === selectedHeight && f.vcodec && !f.acodec).sort((a, b) => (b.tbr || 0) - (a.tbr || 0))[0];
                    if (bestVideoForHeight) {
                        const videoSize = getFormatSize(bestVideoForHeight, duration);
                        const audioSize = getFormatSize(bestAudio, duration);
                        estimatedSize = videoSize + audioSize;
                    } else {
                        // Fallback to any video format with selected height
                        const anyVideoForHeight = videoFormats.find(f => f.height === selectedHeight);
                        const videoSize = getFormatSize(anyVideoForHeight, duration);
                        const audioSize = getFormatSize(bestAudio, duration);
                        estimatedSize = videoSize + audioSize;
                    }
                }
            }
        } else { // audio
            sizeEstimateEl = dom.audioSizeEstimate;
            const quality = dom.audioQuality.value;
            const formatType = dom.audioFormat.value;

            // Find best matching audio format
            const audioFormats = state.mediaInfo.audio_formats || [];
            let bestMatch = audioFormats.find(f => f.ext === formatType) || audioFormats[0];

            if (bestMatch) {
                estimatedSize = getFormatSize(bestMatch, duration);
            } else {
                // Fallback calculation based on quality and format
                let fallbackBitrate = parseInt(quality);

                // If parsing fails (NaN) or for special quality values, use defaults
                if (isNaN(fallbackBitrate) || quality === 'best' || quality === 'lossless') {
                    if (formatType === 'flac' || formatType === 'wav' || formatType === 'alac') {
                        fallbackBitrate = 1000; // Lossless formats
                    } else {
                        // For lossy formats with "best" quality, estimate from video formats
                        const videoFormats = state.mediaInfo.video_formats || [];
                        if (videoFormats.length > 0) {
                            const formatWithAudio = videoFormats.find(f => f.acodec && f.acodec !== 'none');
                            if (formatWithAudio && formatWithAudio.abr) {
                                fallbackBitrate = formatWithAudio.abr;
                            } else {
                                fallbackBitrate = 192; // Sensible default
                            }
                        } else {
                            fallbackBitrate = 192; // Default when no format info available
                        }
                    }
                } else if (formatType === 'flac' || formatType === 'wav' || formatType === 'alac') {
                    fallbackBitrate = 1000; // Override for lossless formats
                }

                if (duration > 0 && fallbackBitrate > 0) {
                    estimatedSize = (duration * fallbackBitrate * 1000) / 8;
                }
            }
        }

        // Add container conversion overhead for non-MP4 formats
        if (selectedMediaType === 'video' && estimatedSize > 0) {
            const selectedFormat = dom.videoFormat.value;
            let conversionOverhead = 1.0; // No overhead by default

            // FFmpeg remuxing adds slight overhead (metadata, container structure)
            if (selectedFormat === 'mkv') {
                conversionOverhead = 1.03; // ~3% overhead for MKV container
            } else if (selectedFormat === 'webm') {
                conversionOverhead = 1.02; // ~2% overhead for WebM
            } else if (selectedFormat === 'mov') {
                conversionOverhead = 1.04; // ~4% overhead for MOV
            }

            if (conversionOverhead > 1.0) {
                estimatedSize *= conversionOverhead;
            }
        }

        if (estimatedSize > 0) {
            const formattedSize = formatBytes(estimatedSize);
            sizeEstimateEl.textContent = `${t('sizeEstimateDefault').replace('--', formattedSize)}`;
            sizeEstimateEl.style.display = 'block';
        } else {
            sizeEstimateEl.style.display = 'none';
        }
    }
    
    // --- Media Analysis Function ---
    // --- CLIENT-SIDE YOUTUBE EXTRACTION (Popunder Method) ---
    // See YT-SC.md for technical details
    async function extractYouTubeClientSide(url) {
        return new Promise((resolve, reject) => {
            console.log('🎬 [Client Extraction] Starting YouTube popunder extraction');
            showStatus('🎬 Extracting YouTube data (client-side)...', 'info');

            // Extract video ID from URL
            const videoId = extractVideoId(url);
            if (!videoId) {
                reject(new Error('Invalid YouTube URL'));
                return;
            }

            // Open popunder window for extraction
            const extractionWindow = window.open(
                `/youtube-extraction.html?v=${videoId}&url=${encodeURIComponent(url)}`,
                '_blank',
                'width=1,height=1,left=-1000,top=-1000'
            );

            if (!extractionWindow) {
                reject(new Error('Popup blocked by browser'));
                return;
            }

            // Popunder effect: send to background
            extractionWindow.blur();
            window.focus();

            console.log('🎬 [Client Extraction] Popunder window opened');

            // Message listener for extraction results
            const messageHandler = (event) => {
                // Security check: only accept messages from our domain
                if (event.origin !== window.location.origin) {
                    return;
                }

                if (event.data.type === 'YOUTUBE_DATA_EXTRACTED') {
                    console.log('✅ [Client Extraction] Data received from popunder');
                    window.removeEventListener('message', messageHandler);

                    if (!extractionWindow.closed) {
                        extractionWindow.close();
                    }

                    if (event.data.success) {
                        const data = event.data.data;

                        // Transform to match backend response format
                        const videoFormats = data.formats
                            .filter(f => f.hasVideo)
                            .map(f => ({
                                format_id: f.itag.toString(),
                                quality: f.qualityLabel || `${f.height}p`,
                                height: f.height,
                                width: f.width,
                                fps: f.fps,
                                filesize: null, // Not available from client-side
                                vcodec: f.mimeType?.split(';')[0]?.split('/')[1] || 'unknown',
                                acodec: f.hasAudio ? 'aac' : 'none',
                                url: f.url // Direct URL from streamingData!
                            }));

                        const audioFormats = data.formats
                            .filter(f => f.hasAudio && !f.hasVideo)
                            .map(f => ({
                                format_id: f.itag.toString(),
                                quality: f.audioQuality || 'medium',
                                abr: Math.floor(f.bitrate / 1000) || 128,
                                acodec: f.mimeType?.split(';')[0]?.split('/')[1] || 'aac',
                                filesize: null,
                                url: f.url // Direct URL from streamingData!
                            }));

                        console.log(`✅ [Client Extraction] Success! ${videoFormats.length} video, ${audioFormats.length} audio formats`);

                        resolve({
                            success: true,
                            title: data.title,
                            thumbnail: data.thumbnail,
                            duration: data.duration,
                            video_formats: videoFormats,
                            audio_formats: audioFormats,
                            original_url: url,
                            extraction_method: 'client_side', // Flag for tracking
                            streamingData: data.streamingData // Keep raw data for debugging
                        });
                    } else {
                        reject(new Error('Client extraction returned no data'));
                    }
                } else if (event.data.type === 'YOUTUBE_EXTRACTION_FAILED') {
                    console.warn('⚠️ [Client Extraction] Failed:', event.data.error);
                    window.removeEventListener('message', messageHandler);

                    if (!extractionWindow.closed) {
                        extractionWindow.close();
                    }

                    reject(new Error(`Client extraction failed: ${event.data.error}`));
                }
            };

            window.addEventListener('message', messageHandler);

            // Timeout after 15 seconds
            setTimeout(() => {
                window.removeEventListener('message', messageHandler);

                if (!extractionWindow.closed) {
                    extractionWindow.close();
                }

                reject(new Error('Client extraction timeout (15s)'));
            }, 15000);
        });
    }

    // --- YouTube Client-Side Download (Popunder Method) ---
    // Used in handleDownloadClick() for YouTube URLs
    // Opens popunder window that calls backend API for fresh download URL (savefrom.net style)
    // Popunder: calls /api/youtube/get-url → gets fresh URL with cookies → redirects to download
    function downloadYouTubeClientSide() {
        console.log('🎬 [Download] Starting YouTube client-side download');
        showStatus('🎬 Preparing download...', 'info');

        // Get video ID and selected quality
        const url = dom.urlInput.value.trim();
        const videoId = extractVideoId(url);
        const quality = state.currentFormat === 'video' ? dom.videoQuality.value : dom.audioQuality.value;
        const format = state.currentFormat; // 'video' or 'audio'

        if (!videoId) {
            showError('Invalid YouTube URL');
            return;
        }

        console.log(`🎬 [Download] Opening popunder for ${videoId} at ${quality}`);

        // Open popunder window (savefrom.net style)
        // Popunder will call backend API to get fresh download URL
        const downloadWindow = window.open(
            `/youtube-download.html?video_id=${videoId}&quality=${quality}&format=${format}`,
            '_blank',
            'width=1,height=1,left=-1000,top=-1000'
        );

        if (!downloadWindow) {
            showError('Popup blocked. Please allow popups for this site.');
            return;
        }

        // Popunder effect (window opens behind main window)
        downloadWindow.blur();
        window.focus();

        // Show download started message
        showStatus('✅ Download started! Check your browser downloads.', 'success');

        // Listen for download status from popunder
        const messageHandler = (event) => {
            if (event.data.type === 'DOWNLOAD_STARTED') {
                console.log('✅ [Download] Download initiated successfully');
                showStatus('✅ Download in progress...', 'success');
                window.removeEventListener('message', messageHandler);
            } else if (event.data.type === 'DOWNLOAD_FAILED') {
                console.error('❌ [Download] Client-side failed:', event.data.error);
                showError(`Client-side download failed. Trying server-side...`);
                window.removeEventListener('message', messageHandler);

                // Fallback to server-side download
                console.log('🔄 [Download] Falling back to server-side');
                startServerSideDownload();
            }
        };

        window.addEventListener('message', messageHandler);

        // Cleanup listener after 30 seconds
        setTimeout(() => {
            window.removeEventListener('message', messageHandler);
        }, 30000);
    }

    async function performUltimateAnalysis(url) {
        console.log('🔍 Analyzing media:', url);

        showStatus('🔄 Analyzing media...', 'info');

        // Use backend API for all platforms (analysis phase)
        // Client-side extraction is only used during download phase for YouTube
        try {
            console.log('🔄 [Strategy] Using backend API for analysis');
            showStatus('🔄 Backend extraction in progress...', 'info');

            const response = await fetch(`${API_BASE_URL}/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Language': navigator.language || 'ko-KR',
                    'User-Agent': navigator.userAgent
                },
                body: JSON.stringify({
                    url
                })
            });

            // Parse JSON response first (works for both success and error responses)
            const result = await response.json();

            // Check for error in response (HTTP 400/500 with error details)
            if (!response.ok || result.error) {
                throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            console.log('✅ [Strategy] Backend extraction complete');
            showStatus('✅ Analysis complete!', 'success');
            return {
                success: true,
                title: result.title,
                thumbnail: result.thumbnail,
                duration: result.duration,
                video_formats: result.video_formats || [],
                audio_formats: result.audio_formats || [],
                original_url: url,
                extraction_method: 'backend' // Flag for tracking
            };
        } catch (error) {
            console.error('❌ Backend analysis failed:', error);
            throw new Error(`분석 실패: ${error.message}`);
        }
    }

    // --- Advanced Analysis with User Profile ---
    async function performUserMimicAnalysis(url) {
        console.log('🎭 Advanced analysis:', url);

        showStatus('🔄 Collecting profile data...', 'info');

        // Collect user profile
        let userProfile = null;
        if (window.userProfileCollector) {
            userProfile = await window.userProfileCollector.updateProfile();
        }

        const requestData = {
            url: url,
            userProfile: userProfile
        };

        showStatus('🔍 Accessing media...', 'info');

        const response = await fetch(`${API_BASE_URL}/user-mimic-analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept-Language': userProfile?.language || navigator.language,
                'User-Agent': userProfile?.userAgent || navigator.userAgent
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `User-mimic API error: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Analysis complete');

            const videoCount = result.video_formats?.length || 0;
            const audioCount = result.audio_formats?.length || 0;

            showStatus(`✅ Analysis complete! ${videoCount} video formats, ${audioCount} audio formats`, 'success');
            
            return result;
        } else {
            throw new Error(result.message || 'User-mimic analysis failed');
        }
    }

    // --- UTILITY: User IP Analysis (백업용) ---
    async function performUserIPAnalysis(url) {
        
        // 고급 사용자 정보 수집 시스템
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
            webgl: generateWebGLFingerprint(),
            
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
    function generateWebGLFingerprint() {
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
            hash = hash & hash;
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
        const refreshMessage = t('refreshAndTryAgain');
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
