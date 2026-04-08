document.addEventListener('DOMContentLoaded', () => {
    // --- Views ---
    const vLogin = document.getElementById('view-login');
    const vLoading = document.getElementById('view-loading');
    const vSectors = document.getElementById('view-sectors');
    const vGroupChat = document.getElementById('view-group-chat');
    const vPrivateChat = document.getElementById('view-private-chat');
    const vBanned = document.getElementById('view-banned');
    const vStealth = document.getElementById('view-stealth');

    const views = [vLogin, vLoading, vSectors, vGroupChat, vPrivateChat, vBanned, vStealth];
    
    // Smooth Transition Controller
    function switchView(targetView) {
        const currentView = views.find(v => !v.classList.contains('hidden')) || null;
        if (currentView === targetView) return;
        
        if (currentView) {
            currentView.classList.add('hidden');
            setTimeout(() => {
                targetView.classList.remove('hidden');
            }, 500); // Wait for the fade out to finish for perfect crossfade
        } else {
            targetView.classList.remove('hidden');
        }
    }

    // --- Stealth Mode Logic ---
    let escapeCount = 0;
    let escapeTimer = null;
    let viewBeforeStealth = null;
    const stealthInput = document.getElementById('stealth-input');
    const cmdLog = document.getElementById('cmd-log');

    function toggleStealthMode() {
        const isStealth = document.body.classList.contains('stealth-mode-active');
        if (!isStealth) {
            document.body.classList.add('stealth-mode-active');
            viewBeforeStealth = views.find(v => !v.classList.contains('hidden')) || vLogin;
            
            // Instant Switch
            viewBeforeStealth.classList.add('hidden');
            vStealth.classList.remove('hidden');
            if(stealthInput) {
                stealthInput.value = '';
                stealthInput.focus();
            }
        } else {
            document.body.classList.remove('stealth-mode-active');
            vStealth.classList.add('hidden');
            if (viewBeforeStealth) viewBeforeStealth.classList.remove('hidden');
        }
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            escapeCount++;
            clearTimeout(escapeTimer);
            escapeTimer = setTimeout(() => { escapeCount = 0; }, 800);
            if (escapeCount >= 3) {
                escapeCount = 0;
                toggleStealthMode();
            }
        }
    });

    document.querySelectorAll('.panic-btn').forEach(btn => {
        btn.addEventListener('click', toggleStealthMode);
    });

    if (vStealth) vStealth.addEventListener('click', () => stealthInput && stealthInput.focus());

    if (stealthInput) {
        stealthInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const val = stealthInput.value.trim();
                if (val.toLowerCase() === 'restore') {
                    toggleStealthMode();
                } else if (val !== '') {
                    cmdLog.innerHTML += `C:\\Users\\Public&gt; ${val}<br>'${val}' is not recognized as an internal or external command,<br>operable program or batch file.<br><br>`;
                    stealthInput.value = '';
                    vStealth.scrollTop = vStealth.scrollHeight;
                } else {
                    cmdLog.innerHTML += `C:\\Users\\Public&gt;<br>`;
                }
            }
        });
    }

    // --- State ---
    let currentUserAlias = "";
    let currentSectorContext = null;
    let privateChatTarget = null;
    let countdownInterval = null;

    // --- DOM Elements ---
    const hexStream = document.getElementById('hexStream');
    
    // Auth
    const aliasInput = document.getElementById('login-alias-input');
    const generateBtn = document.getElementById('generate-alias-btn');
    const initBtn = document.getElementById('login-enter-btn');
    const currentAliasDisplay = document.getElementById('current-alias-display');

    // Sectors
    const sectorsGrid = document.getElementById('sectors-grid');
    const btnCreateServer = document.getElementById('btn-create-server');
    const btnJoinServer = document.getElementById('btn-join-server');
    const joinServerInput = document.getElementById('join-server-input');

    // Group Chat
    const backBtn = document.getElementById('btn-back-sectors');
    const groupFeed = document.getElementById('group-feed');
    const groupChatInput = document.getElementById('group-chat-input');
    const groupSendBtn = document.getElementById('group-send-btn');
    const sectorTitle = document.getElementById('current-sector-title');
    const groupAttachBtn = document.getElementById('group-attach-btn');
    
    // Telemetry & Filters
    const trendingTagsList = document.getElementById('trending-tags-list');
    const topSectorsList = document.getElementById('top-sectors-list');
    const filterBanner = document.getElementById('filter-banner');
    const filterTagDisplay = document.getElementById('filter-tag-display');
    const btnClearFilter = document.getElementById('btn-clear-filter');
    const hashtagAutocomplete = document.getElementById('hashtag-autocomplete');
    const autocompleteList = document.getElementById('autocomplete-list');
    const MOCK_HASHTAGS = ['#cybersec', '#midterms', '#campus_void', '#zeroday', '#proxy'];
    let currentHashtagFilter = null;

    // Popover
    const popoverOverlay = document.getElementById('user-popover-overlay');
    const popoverAliasText = document.getElementById('popover-target-alias');
    const initiateLinkBtn = document.getElementById('initiate-link-btn');
    const closePopoverBtn = document.getElementById('close-popover-btn');

    // Private Chat
    const privateFeed = document.getElementById('private-feed');
    const privateChatInput = document.getElementById('private-chat-input');
    const privateSendBtn = document.getElementById('private-send-btn');
    const btnSeverLink = document.getElementById('btn-sever-link');
    const privateTitle = document.getElementById('private-chat-title');
    const countdownClock = document.getElementById('countdown-clock');
    const privateAttachBtn = document.getElementById('private-attach-btn');

    // Voice DOM
    const initiateVoiceBtn = document.getElementById('initiate-voice-btn');
    const btnFreqLink = document.getElementById('btn-freq-link');
    
    const incomingCallModal = document.getElementById('incoming-call-modal');
    const incomingCallerId = document.getElementById('incoming-caller-id');
    const btnAcceptCall = document.getElementById('btn-accept-call');
    const btnRejectCall = document.getElementById('btn-reject-call');
    
    // Sync UI
    const syncDisplay = document.getElementById('sync-score-display');
    const syncFill = document.getElementById('sync-fill');
    const perkVideo = document.getElementById('perk-video');
    const perkMedia = document.getElementById('perk-media');
    let syncScore = 0;
    let syncInterval = null;
    const embeddedVoiceTimer = document.getElementById('embedded-voice-timer');
    const hubMuteBtn = document.getElementById('hub-mute-btn');
    const hubEndBtn = document.getElementById('hub-end-btn');
    const canvas = document.getElementById('embedded-visualizer');
    const canvasCtx = canvas ? canvas.getContext('2d') : null;

    // --- Auto-Moderation Ban Protocol ---
    const RESTRICTED_TERMS = ['hack', 'bypass', 'override', 'root', 'bot', 'spam', 'illegal'];
    
    function checkModeration(text, feedAppendFn) {
        const lower = text.toLowerCase();
        const isViolating = RESTRICTED_TERMS.some(term => lower.includes(term));
        
        if (isViolating) {
            let strikes = parseInt(localStorage.getItem('blackout_strikes') || '0', 10);
            strikes++;
            localStorage.setItem('blackout_strikes', strikes);
            
            if (strikes >= 3) {
                localStorage.setItem('blackout_banned', 'true');
                triggerHardwareBan();
            } else {
                feedAppendFn(`>> [SYS.WARN] RESTRICTED SYNTAX LOGGED. STRIKE [${strikes}/3].`, "SYSTEM");
            }
            return false; // Block message
        }
        return true; // Allow message
    }

    function triggerHardwareBan() {
        document.body.style.filter = "invert(1) contrast(200%)";
        setTimeout(() => {
            document.body.style.filter = "none";
            switchView(vBanned);
        }, 500);
    }
    
    // --- Initialization & Ticker ---
    if (hexStream) {
        setInterval(() => {
            const hexChars = '0123456789ABCDEF';
            let stream = '0x';
            for(let i=0; i<80; i++) stream += hexChars[Math.floor(Math.random() * 16)];
            stream += ' // SYS.CORE.ACTIVE';
            hexStream.textContent = stream;
        }, 3000);
    }
    
    // Check local ban
    if (localStorage.getItem('blackout_banned') === 'true') {
        switchView(vBanned);
    } else {
        aliasInput.focus();
    }

    // --- Auth Logic ---
    generateBtn.addEventListener('click', () => {
        const randomAlias = SCIFI_NAMES[Math.floor(Math.random() * SCIFI_NAMES.length)] + "_" + Math.floor(Math.random() * 999);
        aliasInput.value = randomAlias;
        aliasInput.focus();
    });

    initBtn.addEventListener('click', triggerLogin);
    aliasInput.addEventListener('keydown', (e) => { if(e.key === 'Enter') triggerLogin(); });

    function triggerLogin() {
        const val = aliasInput.value.trim();
        if(val.length > 0) {
            currentUserAlias = val;
            currentAliasDisplay.textContent = currentUserAlias;
            
            // Transition to loading
            switchView(vLoading);
            
            // Simulate processing time
            setTimeout(() => {
                renderSectors();
                switchView(vSectors);
            }, 3000);
        }
    }

    // --- Sectors Logic ---
    function renderSectors() {
        sectorsGrid.innerHTML = '';
        MOCK_SECTORS.forEach(sector => {
            const card = document.createElement('div');
            card.className = 'sector-card';
            card.innerHTML = `
                <div class="sector-title">${sector.name}</div>
                <div class="sector-nodes">
                    <div class="node-dot blink-fast"></div> 
                    ${sector.nodes} NODES INTEGRATED
                </div>
            `;
            card.addEventListener('click', () => { currentHashtagFilter = null; openSector(sector); });
            sectorsGrid.appendChild(card);
        });

        // Telemetry Sidebar Loading
        if(topSectorsList) {
            topSectorsList.innerHTML = '';
            const top = [...MOCK_SECTORS].sort((a,b) => b.nodes - a.nodes).slice(0, 3);
            top.forEach((s, idx) => {
                const li = document.createElement('li');
                li.style.color = "var(--tech-cyan)";
                li.className = "title-mono";
                li.style.fontSize = "0.9rem";
                li.innerHTML = `<span class="text-muted">${idx+1}.</span> ${s.name} <span class="text-muted">[${s.nodes} Nodes]</span>`;
                topSectorsList.appendChild(li);
            });
        }
        
        if(trendingTagsList && trendingTagsList.children.length === 0) {
            MOCK_HASHTAGS.forEach((tag) => {
                const li = document.createElement('li');
                li.style.cursor = 'pointer';
                li.className = "hover-glow-cyan title-mono";
                li.style.fontSize = "0.9rem";
                const width = Math.floor(Math.random() * 60) + 10;
                li.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span class="text-cyan">${tag}</span>
                        <div style="width: 60px; height: 3px; background: rgba(0,243,255,0.2);"><div style="width: ${width}%; height: 100%; background: var(--tech-cyan);"></div></div>
                    </div>
                `;
                li.addEventListener('click', () => {
                    currentHashtagFilter = tag;
                    openSector(MOCK_SECTORS.find(s => s.id === 'sector_cybersec') || MOCK_SECTORS[0]); 
                });
                trendingTagsList.appendChild(li);
            });
        }
    }

    // --- Custom Server Protocols ---
    if (btnCreateServer) {
        btnCreateServer.addEventListener('click', () => {
            const hexChars = '0123456789ABCDEF';
            let newId = '0x';
            for (let i=0; i<4; i++) newId += hexChars[Math.floor(Math.random() * 16)];
            
            const newSector = {
                id: "sector_" + newId.toLowerCase(),
                name: `PRIVATE NODE [ ${newId} ]`,
                nodes: 1
            };
            
            MOCK_SECTORS.unshift(newSector);
            renderSectors();
            openSector(newSector);
            
            setTimeout(() => {
                appendGroupMessage(`>> PRIVATE NODE ESTABLISHED. SHARE ID [ ${newId} ] FOR OTHERS TO JOIN.`, 'SYS.CORE');
            }, 500);
        });
    }

    if (btnJoinServer) {
        btnJoinServer.addEventListener('click', () => {
            const rawId = joinServerInput.value.trim().toUpperCase();
            if (!rawId) return;
            
            let target = MOCK_SECTORS.find(s => s.name.includes(rawId) || s.id === "sector_" + rawId.toLowerCase());
            
            if (!target) {
                target = {
                    id: "sector_" + rawId.toLowerCase(),
                    name: `PRIVATE NODE [ ${rawId} ]`,
                    nodes: Math.floor(Math.random() * 5) + 1
                };
                MOCK_SECTORS.unshift(target);
                renderSectors();
            }
            
            joinServerInput.value = '';
            openSector(target);
            
            setTimeout(() => {
                appendGroupMessage(`>> PROXY LINK ESTABLISHED TO SECURE NODE [ ${rawId} ].`, 'SYS.CORE');
            }, 500);
        });
    }

    if(joinServerInput) {
        joinServerInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') btnJoinServer.click();
        });
    }

    function openSector(sector) {
        currentSectorContext = sector;
        sectorTitle.textContent = `[ ${sector.name.toUpperCase()} ]`;
        groupFeed.innerHTML = '';
        
        // Filter Banner State Logic
        if(currentHashtagFilter) {
            if(filterBanner) filterBanner.classList.remove('hidden');
            if(filterTagDisplay) filterTagDisplay.textContent = currentHashtagFilter;
        } else {
            if(filterBanner) filterBanner.classList.add('hidden');
        }

        // Load mock messages
        if (MOCK_MESSAGES[sector.id]) {
            let msgs = MOCK_MESSAGES[sector.id];
            if(currentHashtagFilter) {
                msgs = msgs.filter(m => m.text.toLowerCase().includes(currentHashtagFilter.toLowerCase()));
            }
            msgs.forEach(msg => appendGroupMessage(msg.text, msg.author, msg.time));
        }

        switchView(vGroupChat);
        setTimeout(() => groupChatInput.focus(), 600);
    }

    backBtn.addEventListener('click', () => {
        currentSectorContext = null;
        switchView(vSectors);
    });

    // --- Group Chat Messaging ---
    groupSendBtn.addEventListener('click', sendGroupMsg);
    groupChatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendGroupMsg(); });

        if (btnClearFilter) {
            btnClearFilter.addEventListener('click', () => {
                currentHashtagFilter = null;
                openSector(currentSectorContext);
            });
        }

        if (groupFeed) {
            groupFeed.addEventListener('click', (e) => {
                if(e.target.classList.contains('hashtag-click')) {
                    currentHashtagFilter = e.target.textContent;
                    openSector(currentSectorContext);
                }
            });
        }

        if (groupChatInput) {
            groupChatInput.addEventListener('input', () => {
                const val = groupChatInput.value;
                const words = val.split(' ');
                const currentWord = words[words.length - 1];
                
                if (currentWord.startsWith('#') && currentWord.length >= 1) {
                    const query = currentWord.toLowerCase();
                    const matches = MOCK_HASHTAGS.filter(t => t.startsWith(query));
                    
                    if (matches.length > 0) {
                        hashtagAutocomplete.classList.remove('hidden');
                        autocompleteList.innerHTML = '';
                        matches.forEach(m => {
                            const li = document.createElement('li');
                            li.textContent = m;
                            li.style.padding = '0.5rem';
                            li.style.cursor = 'pointer';
                            li.style.borderBottom = '1px solid rgba(0,243,255,0.1)';
                            li.className = 'hover-glow-cyan text-cyan title-mono';
                            li.addEventListener('click', () => {
                                words[words.length - 1] = m;
                                groupChatInput.value = words.join(' ') + ' ';
                                hashtagAutocomplete.classList.add('hidden');
                                groupChatInput.focus();
                            });
                            autocompleteList.appendChild(li);
                        });
                    } else {
                        hashtagAutocomplete.classList.add('hidden');
                    }
                } else {
                    hashtagAutocomplete.classList.add('hidden');
                }
            });
        }

        function sendGroupMsg() {
            const text = groupChatInput.value.trim();
            if (text) {
                groupChatInput.value = '';
                hashtagAutocomplete.classList.add('hidden');
                
                if (!checkModeration(text, (msg, auth) => {
                    const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                    appendGroupMessage(msg, auth, timeStr);
                })) {
                    return;
                }

                const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                appendGroupMessage(text, currentUserAlias, timeStr);
                
                if(!MOCK_MESSAGES[currentSectorContext.id]) MOCK_MESSAGES[currentSectorContext.id] = [];
                MOCK_MESSAGES[currentSectorContext.id].push({ author: currentUserAlias, text, time: timeStr });
            }
        }

    function formatMessageText(text) {
        return text.split(' ').map(word => {
            if (word.startsWith('#') && word.length > 1) {
                return `<span class="hashtag-click text-cyan hover-glow-cyan" style="cursor:pointer; font-weight:bold; text-shadow: 0 0 5px var(--tech-cyan);">${word}</span>`;
            }
            return word;
        }).join(' ');
    }

    function appendGroupMessage(text, author, time) {
        const msgEl = document.createElement('div');
        msgEl.className = 'message';
        // Add a click listener to the author name to open popover
        msgEl.innerHTML = `
            <div class="message-header">
                <span class="msg-author" data-author="${author}">${author}</span>
                <span class="msg-time">${time}</span>
            </div>
            <div class="msg-text">${formatMessageText(text)}</div>
        `;
        
        // Setup popover trigger if it isn't system
        const authorSpan = msgEl.querySelector('.msg-author');
        if (author !== 'SYSTEM') {
            authorSpan.addEventListener('click', (e) => {
                e.stopPropagation(); 
                if (author !== currentUserAlias) { 
                    openPopover(author);
                }
            });
        }

        groupFeed.appendChild(msgEl);
        groupFeed.scrollTop = groupFeed.scrollHeight;
    }

    // --- Popover Logic ---
    function openPopover(targetAlias) {
        privateChatTarget = targetAlias;
        popoverAliasText.textContent = targetAlias;
        popoverOverlay.classList.remove('hidden');
    }

    closePopoverBtn.addEventListener('click', () => {
        popoverOverlay.classList.add('hidden');
        privateChatTarget = null;
    });

    initiateLinkBtn.addEventListener('click', () => {
        popoverOverlay.classList.add('hidden');
        setTimeout(() => {
            openPrivateChat(privateChatTarget);
        }, 300); // slight delay allowing modal fade
    });

    // --- Private Chat Logic ---
    function openPrivateChat(targetAlias) {
        privateTitle.textContent = `TARGET: ${targetAlias.toUpperCase()}`;
        privateFeed.innerHTML = '';
        
        appendPrivateMessage(">> SECURE 1-ON-1 TUNNEL ESTABLISHED. LOGS ARE VOLATILE.", "SYSTEM");

        syncScore = 0;
        updateSyncUI();
        clearInterval(syncInterval);
        syncInterval = setInterval(() => {
            if(syncScore < 100) {
                syncScore += 1;
                updateSyncUI();
            }
        }, 1000);

        startVolatileTimer();
        switchView(vPrivateChat);
        setTimeout(() => privateChatInput.focus(), 600);
    }

    function updateSyncUI() {
        if(!syncDisplay) return;
        syncDisplay.textContent = syncScore;
        if(syncFill) syncFill.style.width = `${syncScore}%`;
        
        // 30% ATTACH
        if (syncScore >= 30) {
            if(privateAttachBtn) privateAttachBtn.classList.remove('perk-locked');
        } else {
            if(privateAttachBtn) privateAttachBtn.classList.add('perk-locked');
        }
        
        // 60% VOICE LINK
        if (syncScore >= 60) {
            if(btnFreqLink) btnFreqLink.classList.remove('perk-locked');
        } else {
            if(btnFreqLink) btnFreqLink.classList.add('perk-locked');
        }
        
        // 100% ADVANCED MEDIA
        if (syncScore >= 100) {
            if(perkVideo) { perkVideo.classList.remove('perk-locked'); perkVideo.textContent = "🔓 VIDEO_LINK"; }
            if(perkMedia) { perkMedia.classList.remove('perk-locked'); perkMedia.textContent = "🔓 SYNC_WATCH"; }
        } else {
            if(perkVideo) { perkVideo.classList.add('perk-locked'); perkVideo.textContent = "🔒 VIDEO_LINK"; }
            if(perkMedia) { perkMedia.classList.add('perk-locked'); perkMedia.textContent = "🔒 SYNC_WATCH"; }
        }
    }

    function startVolatileTimer() {
        clearInterval(countdownInterval);
        let secondsLeft = 24 * 60 * 60; // 24 hours fake countdown
        
        countdownClock.textContent = formatTime(secondsLeft);
        countdownInterval = setInterval(() => {
            secondsLeft--;
            countdownClock.textContent = formatTime(secondsLeft);
            if (secondsLeft <= 0) severLink();
        }, 1000); 
    }

    function formatTime(s) {
        let h = Math.floor(s / 3600);
        let m = Math.floor((s % 3600) / 60);
        let sec = s % 60;
        return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
    }

    btnSeverLink.addEventListener('click', severLink);

    function severLink() {
        clearInterval(countdownInterval);
        clearInterval(syncInterval);
        privateFeed.innerHTML = '';
        privateChatTarget = null;
        
        // Soft Flash Before Disconnect
        vPrivateChat.style.filter = 'brightness(2) contrast(150%)';
        setTimeout(() => {
            vPrivateChat.style.filter = '';
            switchView(vGroupChat); // return to group
        }, 300);
    }

    privateSendBtn.addEventListener('click', sendPrivateMsg);
    privateChatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendPrivateMsg(); });

    function sendPrivateMsg() {
        const text = privateChatInput.value.trim();
        if (text && privateChatTarget) {
            privateChatInput.value = '';

            if (!checkModeration(text, (msg, auth) => appendPrivateMessage(msg, auth))) {
                return;
            }

            appendPrivateMessage(text, currentUserAlias);
            
            if(syncScore < 100) {
                syncScore = Math.min(100, syncScore + 10);
                updateSyncUI();
            }
            
            // Mock reply
            setTimeout(() => {
                appendPrivateMessage(">> ENCRYPTED REPLY RECEIVED.", privateChatTarget);
                if(syncScore < 100) {
                    syncScore = Math.min(100, syncScore + 5);
                    updateSyncUI();
                }
            }, 1000);
        }
    }

    function appendPrivateMessage(text, author) {
        const msgEl = document.createElement('div');
        msgEl.className = 'message';
        const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        msgEl.innerHTML = `
            <div class="message-header">
                <span class="msg-author">${author}</span>
                <span class="msg-time">${timeStr}</span>
            </div>
            <div class="msg-text">${text}</div>
        `;
        privateFeed.appendChild(msgEl);
        privateFeed.scrollTop = privateFeed.scrollHeight;
    }
    // --- Payload System ---
    const MOCK_INTEL = [
        "SERVER_IP: 192.168.0.44\nOVERRIDE_KEY: 0x8F9E",
        "DECRYPTED LOG:\n>> User 'Admin' disconnected\n>> Unauthorized Proxy DETECTED",
        "ROUTE MAPPING:\n[Node_A] -> [Node_F] -> [BLOCKED]",
        "     .--------.\n    / .------. \\\n   / /      \\ \\ \\\n   | |  O  O | | |\n   | |  \\__/ | | |\n   \\ \\------/ / /\n    \\--------/"
    ];

    const globalUploadInput = document.getElementById('global-upload-input');
    let activeFeedForUpload = null;

    if (groupAttachBtn) groupAttachBtn.addEventListener('click', () => { activeFeedForUpload = groupFeed; globalUploadInput.click(); });
    if (privateAttachBtn) privateAttachBtn.addEventListener('click', () => { activeFeedForUpload = privateFeed; globalUploadInput.click(); });

    globalUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && activeFeedForUpload) {
            sendPayload(activeFeedForUpload, file);
        }
        globalUploadInput.value = ''; // Reset input
    });

    function sendPayload(feedObj, file) {
        const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        const msgEl = document.createElement('div');
        msgEl.className = 'message';
        msgEl.innerHTML = `
            <div class="message-header">
                <span class="msg-author">${currentUserAlias}</span>
                <span class="msg-time">${timeStr}</span>
            </div>
            <div class="payload-box">
                <div class="payload-label">🔒 ${file.name.toUpperCase()}</div>
                <div class="decrypt-bar-container">
                    <div class="decrypt-bar-fill"></div>
                </div>
                <div class="payload-intel"></div>
            </div>
        `;
        
        const payloadBox = msgEl.querySelector('.payload-box');
        const label = payloadBox.querySelector('.payload-label');
        const barCont = payloadBox.querySelector('.decrypt-bar-container');
        const barFill = payloadBox.querySelector('.decrypt-bar-fill');
        const intelCont = payloadBox.querySelector('.payload-intel');
        
        payloadBox.addEventListener('click', function decryptClick() {
            payloadBox.removeEventListener('click', decryptClick);
            payloadBox.classList.add('decrypting');
            label.textContent = "DECRYPTING...";
            barCont.style.display = 'block';
            
            setTimeout(() => { barFill.style.width = '100%'; }, 50);
            
            setTimeout(() => {
                payloadBox.classList.remove('decrypting');
                payloadBox.style.cursor = 'default';
                barCont.style.display = 'none';
                label.textContent = "🔓 UNLOCKED: " + file.name.toUpperCase();
                intelCont.style.display = 'block';
                
                // READ AND RENDER FILE DATA
                const reader = new FileReader();
                reader.onload = (ev) => {
                    if (file.type.startsWith('image/')) {
                        intelCont.innerHTML = `<img src="${ev.target.result}" style="max-width:100%; border-radius:4px; margin-top:5px; border:1px solid var(--glass-border);">`;
                    } else if (file.type.startsWith('text/') || file.type === '') {
                        let text = ev.target.result || `>> BINARY DATA ALIAS\nSIZE: ${file.size} bytes`;
                        intelCont.textContent = text.substring(0, 1000) + (text.length > 1000 ? '\n...[TRUNCATED]' : '');
                    } else {
                        intelCont.innerHTML = `&gt;&gt; BINARY DATA ALIAS<br>SIZE: ${file.size} bytes<br>SYSTEM TYPE: ${file.type || 'UNKNOWN'}`;
                    }
                    feedObj.scrollTop = feedObj.scrollHeight;
                };

                if (file.type.startsWith('image/')) {
                    reader.readAsDataURL(file);
                } else if (file.type.startsWith('text/') || file.type === '') {
                    reader.readAsText(file);
                } else {
                    reader.onload({target: {}});
                }
            }, 3000);
        });

        feedObj.appendChild(msgEl);
        feedObj.scrollTop = feedObj.scrollHeight;
    }
    // --- Voice Comms System ---
    let audioContext;
    let analyser;
    let microphone;
    let visualizerId;
    let callTimerInterval;
    let callSeconds = 0;
    let isMuted = false;
    let activeStream = null;

    if (initiateVoiceBtn) initiateVoiceBtn.addEventListener('click', () => triggerIncomingCall(privateChatTarget || popoverAliasText.textContent));
    if (btnFreqLink) btnFreqLink.addEventListener('click', () => triggerIncomingCall(privateChatTarget || 'UNKNOWN TARGET'));

    function triggerIncomingCall(targetAlias) {
        if(popoverOverlay) popoverOverlay.classList.add('hidden');
        if(incomingCallerId) incomingCallerId.textContent = targetAlias;
        if(incomingCallModal) incomingCallModal.classList.remove('hidden');
    }

    if(btnRejectCall) {
        btnRejectCall.addEventListener('click', () => {
            if(incomingCallModal) incomingCallModal.classList.add('hidden');
        });
    }

    if(btnAcceptCall) {
        btnAcceptCall.addEventListener('click', () => {
            if(incomingCallModal) incomingCallModal.classList.add('hidden');
            startVoiceCall();
        });
    }

    async function startVoiceCall() {
        if(activeVoiceHub) activeVoiceHub.classList.remove('hidden');
        if(embeddedVoiceTimer) embeddedVoiceTimer.textContent = "00:00";
        callSeconds = 0;
        isMuted = false;
        
        if(hubMuteBtn) {
            hubMuteBtn.textContent = "[ MUTE MIC ]";
            hubMuteBtn.classList.remove('text-crimson');
            hubMuteBtn.style.borderColor = 'var(--glass-border)';
        }
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            activeStream = stream;
            
            clearInterval(callTimerInterval);
            callTimerInterval = setInterval(() => {
                callSeconds++;
                let m = Math.floor(callSeconds / 60).toString().padStart(2, '0');
                let s = (callSeconds % 60).toString().padStart(2, '0');
                if(embeddedVoiceTimer) embeddedVoiceTimer.textContent = `${m}:${s}`;
            }, 1000);

            if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
            if (audioContext.state === 'suspended') audioContext.resume();
            
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            microphone = audioContext.createMediaStreamSource(stream);
            microphone.connect(analyser);
            
            drawVisualizer();

        } catch (err) {
            if(embeddedVoiceTimer) embeddedVoiceTimer.textContent = "ERR: MIC ACCESS DENIED";
        }
    }

    function drawVisualizer() {
        if (!analyser || !canvasCtx) return;
        visualizerId = requestAnimationFrame(drawVisualizer);
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);
        
        canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
        
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;
        
        for(let i = 0; i < bufferLength; i++) {
            const barHeight = isMuted ? 5 : (dataArray[i] / 2) + 5;
            canvasCtx.fillStyle = `rgb(0, ${Math.min(255, barHeight + 50)}, ${Math.min(255, barHeight + 200)})`;
            canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
        }
    }

    if (hubMuteBtn) {
        hubMuteBtn.addEventListener('click', () => {
            if (!activeStream) return;
            isMuted = !isMuted;
            activeStream.getAudioTracks().forEach(track => {
                track.enabled = !isMuted;
            });
            if (isMuted) {
                hubMuteBtn.textContent = "[ UNMUTE MIC ]";
                hubMuteBtn.classList.add('text-crimson');
                hubMuteBtn.style.borderColor = 'var(--tech-crimson)';
            } else {
                hubMuteBtn.textContent = "[ MUTE MIC ]";
                hubMuteBtn.classList.remove('text-crimson');
                hubMuteBtn.style.borderColor = 'var(--glass-border)';
            }
        });
    }

    if (hubEndBtn) {
        hubEndBtn.addEventListener('click', () => {
            clearInterval(callTimerInterval);
            cancelAnimationFrame(visualizerId);
            if (activeStream) {
                activeStream.getTracks().forEach(t => t.stop());
                activeStream = null;
            }
            if (microphone) microphone.disconnect();
            
            if(activeVoiceHub) activeVoiceHub.classList.add('hidden');
        });
    }

    // --- Anti-Screenshot Protocol ---
    const screenshotBlocker = document.getElementById('screenshot-blocker');
    
    function triggerScreenshotAlert() {
        if(screenshotBlocker) {
            screenshotBlocker.classList.remove('hidden');
            setTimeout(() => screenshotBlocker.classList.add('hidden'), 2000);
        }
        
        const msgEl = document.createElement('div');
        msgEl.className = 'message';
        const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        msgEl.innerHTML = `
            <div class="message-header">
                <span class="msg-author text-crimson blink-fast">SYS.AUDIT</span>
                <span class="msg-time">${timeStr}</span>
            </div>
            <div class="msg-text text-crimson" style="border: 1px dashed var(--tech-crimson); padding: 10px; margin-top:5px; background: rgba(255,0,0,0.05); font-weight: bold;">
                &gt;&gt; SECURITY ALERT: OS-LEVEL SCREEN CAPTURE INITIATED BY [${currentUserAlias}].<br>
                &gt;&gt; PROTOCOL VIOLATION LOGGED.
            </div>
        `;
        
        if (!vPrivateChat.classList.contains('hidden') && privateFeed) {
            privateFeed.appendChild(msgEl.cloneNode(true));
            privateFeed.scrollTop = privateFeed.scrollHeight;
        } else if (!vGroupChat.classList.contains('hidden') && groupFeed) {
            groupFeed.appendChild(msgEl.cloneNode(true));
            groupFeed.scrollTop = groupFeed.scrollHeight;
        }
    }

    document.addEventListener('keyup', (e) => {
        if (e.key === 'PrintScreen') {
            triggerScreenshotAlert();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (
            (e.metaKey && e.shiftKey) || 
            (e.ctrlKey && e.key === 'p') || 
            e.key === 'PrintScreen'
        ) {
            triggerScreenshotAlert();
        }
    });
});
