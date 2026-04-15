document.addEventListener('DOMContentLoaded', () => {

    // --- PERFECT GALAXY BACKGROUND ANIMATION ---
    const canvas = document.getElementById('galaxyCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        let stars = [];
        const numStars = 4000;
        const arms = 4;

        // Initialize elegant monochromatic spiral galaxy
        for (let i = 0; i < numStars; i++) {
            const d = Math.random();
            const radius = Math.pow(d, 2) * (Math.max(width, height) * 0.7);

            const branchAngle = (i % arms) * ((Math.PI * 2) / arms);
            const spinAngle = radius * 0.0025;

            const randomSpread = (Math.random() + Math.random() + Math.random() - 1.5);
            const spreadAngle = randomSpread * (0.2 + radius * 0.0005);

            const finalAngle = branchAngle + spinAngle + spreadAngle;

            // Elegant monochromatic / subtle blue palette
            const colorMode = Math.random();
            let color = '#ffffff';
            if (colorMode > 0.8) color = '#e0f0ff'; // subtle faint blue
            else if (colorMode > 0.6) color = '#dbeafe'; // fainter blue

            stars.push({
                r: radius,
                angle: finalAngle,
                size: Math.random() * 1.5 + 0.2,
                color: color,
                speed: 0.0002 + Math.random() * 0.0002, // Rotation speed
                twinkleSpeed: 0.02 + Math.random() * 0.05,
                twinkleOffset: Math.random() * Math.PI * 2
            });
        }

        let coreStars = [];
        for (let i = 0; i < 1500; i++) {
            const radius = Math.random() * (Math.min(width, height) * 0.12);
            const angle = Math.random() * Math.PI * 2;
            coreStars.push({
                r: radius,
                angle: angle,
                size: Math.random() * 2 + 0.5,
                color: Math.random() > 0.5 ? '#ffffff' : '#f8fafc',
                speed: 0.0005 + Math.random() * 0.001
            });
        }

        let mouseX = width / 2;
        let mouseY = height / 2;
        let cx = width / 2;
        let cy = height / 2;
        let time = 0;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function drawSpace() {
            ctx.fillStyle = '#020205';
            ctx.fillRect(0, 0, width, height);

            // Shift the galaxy center slightly based on cursor for parallax
            let targetCx = width / 2 + (width / 2 - mouseX) * 0.1;
            let targetCy = height / 2 + (height / 2 - mouseY) * 0.1;

            cx += (targetCx - cx) * 0.05;
            cy += (targetCy - cy) * 0.05;

            // Cursor distance controls global tilt
            // 0.4 flat, goes up to 0.6 as mouse moves vertically
            let rawTilt = 0.3 + (mouseY / height) * 0.3;
            if (rawTilt < 0.1) rawTilt = 0.1;

            time += 1;

            ctx.globalCompositeOperation = 'lighter';

            let visibleNodes = [];

            // Draw spiral arms
            for (let i = 0; i < numStars; i++) {
                let s = stars[i];
                let currentAngle = s.angle - time * s.speed;
                let x = cx + Math.cos(currentAngle) * s.r;
                let y = cy + Math.sin(currentAngle) * s.r * rawTilt;

                // Base opacity fades out near edges
                let distRatio = s.r / (Math.max(width, height) * 0.6);
                let opacity = 1.0 - distRatio;
                if (opacity < 0) opacity = 0;

                let twinkle = Math.sin(time * s.twinkleSpeed + s.twinkleOffset) * 0.3 + 0.7;

                ctx.fillStyle = s.color;
                ctx.globalAlpha = opacity * twinkle;
                ctx.beginPath();
                ctx.arc(x, y, s.size, 0, Math.PI * 2);
                ctx.fill();

                // Collect interactive nodes (only if near cursor to keep it clean)
                let dxMouse = x - mouseX;
                let dyMouse = y - mouseY;
                let distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
                if (distMouse < 200 && visibleNodes.length < 150) {
                    visibleNodes.push({ x: x, y: y, opacity: opacity });
                }
            }

            // Draw dense core
            for (let i = 0; i < coreStars.length; i++) {
                let s = coreStars[i];
                let currentAngle = s.angle - time * s.speed;
                let x = cx + Math.cos(currentAngle) * s.r;
                let y = cy + Math.sin(currentAngle) * s.r * rawTilt;

                let maxCoreDist = Math.min(width, height) * 0.12;
                let opacity = 1.0 - (s.r / maxCoreDist);
                if (opacity < 0) opacity = 0;

                ctx.fillStyle = s.color;
                ctx.globalAlpha = opacity * 0.6;
                ctx.beginPath();
                ctx.arc(x, y, s.size * 1.5, 0, Math.PI * 2);
                ctx.fill();
            }

            // Draw Interactive Cursor Connections
            ctx.lineWidth = 0.8;
            for (let i = 0; i < visibleNodes.length; i++) {
                let n1 = visibleNodes[i];

                let dxMouse = n1.x - mouseX;
                let dyMouse = n1.y - mouseY;
                let distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

                if (distMouse < 180) {
                    ctx.strokeStyle = `rgba(255, 255, 255, ${n1.opacity * (1 - distMouse / 180) * 0.4})`;
                    ctx.beginPath();
                    ctx.moveTo(n1.x, n1.y);
                    ctx.lineTo(mouseX, mouseY);
                    ctx.stroke();
                }

                for (let j = i + 1; j < visibleNodes.length; j++) {
                    let n2 = visibleNodes[j];
                    let dx = n1.x - n2.x;
                    let dy = n1.y - n2.y;
                    let dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 80) {
                        let lineOpacity = Math.min(n1.opacity, n2.opacity) * (1 - dist / 80) * 0.2;
                        ctx.strokeStyle = `rgba(224, 240, 255, ${lineOpacity})`;
                        ctx.beginPath();
                        ctx.moveTo(n1.x, n1.y);
                        ctx.lineTo(n2.x, n2.y);
                        ctx.stroke();
                    }
                }
            }

            // Core center glow
            let gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(width, height) * 0.2);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
            gradient.addColorStop(0.5, 'rgba(224, 240, 255, 0.05)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.globalAlpha = 1.0;
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(cx, cy, width, 0, Math.PI * 2);
            ctx.fill();

            ctx.globalCompositeOperation = 'source-over';
            requestAnimationFrame(drawSpace);
        }

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            mouseX = width / 2;
            mouseY = height / 2;
        });

        drawSpace();
    }

    // Main Navigation
    const navBtns = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.page');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            pages.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(btn.dataset.page).classList.add('active');
            resetGenerator();
        });
    });

    // Sub Tabs Navigation
    const subTabBtns = document.querySelectorAll('.sub-tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    function resetGenerator() {
        const kwInput = document.getElementById('keyword-input');
        const genResult = document.getElementById('generator-result');
        if (kwInput) kwInput.value = '';
        if (genResult) genResult.classList.add('hidden');
    }

    subTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            subTabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
            resetGenerator();
        });
    });

    // Hashing functions
    async function sha1Hash(text) {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hashBuffer = await crypto.subtle.digest('SHA-1', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex.toUpperCase();
    }

    async function sha256Hash(text) {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex.toLowerCase();
    }

    // Matrix/Cyberpunk Hash decoding animation
    async function animateHashCalculation(elementId, finalHash, durationMs = 1200) {
        const el = document.getElementById(elementId);
        const chars = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
        const length = finalHash.length;

        return new Promise(resolve => {
            let start = null;
            function step(timestamp) {
                if (!start) start = timestamp;
                const progress = timestamp - start;
                const percentDone = Math.min(progress / durationMs, 1);
                const lockedCount = Math.floor(percentDone * length);

                let currentStr = '';
                for (let i = 0; i < length; i++) {
                    if (i < lockedCount) {
                        currentStr += finalHash[i];
                    } else {
                        currentStr += chars[Math.floor(Math.random() * chars.length)];
                    }
                }
                el.innerText = currentStr;

                if (progress < durationMs) {
                    window.requestAnimationFrame(step);
                } else {
                    el.innerText = finalHash;
                    resolve();
                }
            }
            window.requestAnimationFrame(step);
        });
    }

    // Checking Passwords
    const checkPasswordBtn = document.getElementById('check-password-btn');
    const passwordInput = document.getElementById('password-input');
    const passwordResult = document.getElementById('password-result');
    const passwordVis = document.getElementById('password-hash-vis');
    const pwdNetworkExplainer = document.getElementById('pwd-network-explainer');

    const pwdStrengthContainer = document.getElementById('pwd-strength-container');
    const pwdStrengthBar = document.getElementById('pwd-strength-bar');
    const pwdStrengthLabel = document.getElementById('pwd-strength-label');

    passwordInput.addEventListener('input', () => {
        const val = passwordInput.value;
        if (!val) {
            pwdStrengthContainer.classList.add('hidden');
            return;
        }
        pwdStrengthContainer.classList.remove('hidden');
        let score = 0;
        if (val.length > 5) score += 20;
        if (val.length > 10) score += 20;
        if (/[A-Z]/.test(val)) score += 20;
        if (/[0-9]/.test(val)) score += 20;
        if (/[^A-Za-z0-9]/.test(val)) score += 20;

        pwdStrengthBar.style.width = score + '%';
        if (score <= 40) {
            pwdStrengthBar.style.backgroundColor = 'var(--primary)';
            pwdStrengthLabel.innerText = 'STRENGTH: WEAK';
        } else if (score <= 80) {
            pwdStrengthBar.style.backgroundColor = '#fde047';
            pwdStrengthLabel.innerText = 'STRENGTH: MEDIUM';
        } else {
            pwdStrengthBar.style.backgroundColor = 'var(--matrix)';
            pwdStrengthLabel.innerText = 'STRENGTH: STRONG';
        }
    });

    passwordInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            checkPasswordBtn.click();
        }
    });

    checkPasswordBtn.addEventListener('click', async () => {
        const password = passwordInput.value;
        if (!password) {
            passwordResult.classList.add('hidden');
            passwordVis.classList.add('hidden');
            pwdNetworkExplainer.classList.add('hidden');
            alert("please enter password");
            return;
        }

        checkPasswordBtn.querySelector('.btn-text').innerText = 'CHECKING...';
        checkPasswordBtn.disabled = true;

        passwordResult.classList.add('hidden');
        passwordVis.classList.remove('hidden');
        pwdNetworkExplainer.classList.add('hidden');
        document.getElementById('pwd-hash-output').innerText = '';

        try {
            const hash = await sha1Hash(password);
            const prefix = hash.substring(0, 5);
            const suffix = hash.substring(5);

            await animateHashCalculation('pwd-hash-output', hash, 1200);

            document.getElementById('pwd-prefix').innerText = prefix;
            pwdNetworkExplainer.classList.remove('hidden');

            await new Promise(r => setTimeout(r, 600));

            const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
            if (!res.ok) throw new Error('API Error');
            const data = await res.text();

            const lines = data.split('\n');
            let isCompromised = false;
            for (let line of lines) {
                if (!line.trim()) continue;
                const [lineSuffix] = line.split(':');
                if (lineSuffix === suffix) {
                    isCompromised = true;
                    break;
                }
            }

            displayResult(passwordResult, isCompromised, 'PASSWORD');

        } catch (error) {
            console.error('Password check failed:', error);
            alert("Error: Cannot connect to the breach database. Please check your internet connection.");
        } finally {
            checkPasswordBtn.querySelector('.btn-text').innerText = 'CHECK NOW';
            checkPasswordBtn.disabled = false;
        }
    });

    // Checking Emails
    const checkEmailBtn = document.getElementById('check-email-btn');
    const emailInput = document.getElementById('email-input');
    const emailResult = document.getElementById('email-result');
    const emailVis = document.getElementById('email-hash-vis');
    const emailNetworkExplainer = document.getElementById('email-network-explainer');

    emailInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            checkEmailBtn.click();
        }
    });

    checkEmailBtn.addEventListener('click', async () => {
        const email = emailInput.value.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            emailResult.classList.add('hidden');
            emailVis.classList.add('hidden');
            emailNetworkExplainer.classList.add('hidden');
            alert("Please enter a properly formatted email address (e.g. user@example.com).");
            return;
        }

        checkEmailBtn.querySelector('.btn-text').innerText = 'CHECKING...';
        checkEmailBtn.disabled = true;

        emailResult.classList.add('hidden');
        emailVis.classList.remove('hidden');
        emailNetworkExplainer.classList.add('hidden');
        document.getElementById('email-hash-output').innerText = '';

        try {
            // We use SHA-256 for a beautiful UI animation, but the external XposedOrNot API requires the plain email securely over HTTPS.
            const hash = await sha256Hash(email);

            await animateHashCalculation('email-hash-output', hash, 1500);

            emailNetworkExplainer.classList.remove('hidden');
            await new Promise(r => setTimeout(r, 600));

            // Connect to the REAL XposedOrNot open global breach API
            const res = await fetch(`https://api.xposedornot.com/v1/check-email/${encodeURIComponent(email)}`);

            let isCompromised = false;
            let breachSources = [];

            // XposedOrNot returns 404 meaning "Safe", and 200 meaning "Breached"
            if (res.status === 200) {
                isCompromised = true;
                const data = await res.json();
                if (data && data.breaches && data.breaches[0]) {
                    breachSources = data.breaches[0];
                }
            } else if (res.status === 404) {
                isCompromised = false;
            } else {
                throw new Error('API Error');
            }

            displayResult(emailResult, isCompromised, 'EMAIL', breachSources);

        } catch (error) {
            console.error('Email check failed:', error);
            alert("Error: Something went wrong checking the safety.");
        } finally {
            checkEmailBtn.querySelector('.btn-text').innerText = 'CHECK NOW';
            checkEmailBtn.disabled = false;
        }
    });

    function displayResult(container, isCompromised, type, breachSources = null) {
        container.classList.remove('hidden', 'danger', 'success');
        container.innerHTML = '';

        const heading = document.createElement('h3');
        if (isCompromised) {
            container.classList.add('danger');
            heading.innerText = `[ALERT] ${type} FOUND IN A DATA LEAK!`;

            const sourcesDiv = document.createElement('div');
            if (breachSources && breachSources.length > 0) {
                const limitSources = breachSources.slice(0, 15);
                const extra = breachSources.length > 15 ? ` and ${breachSources.length - 15} more...` : '';
                sourcesDiv.innerHTML = `
                    <div class="breach-sources" style="margin-top: 1rem; padding: 1rem; background: rgba(255,0,60,0.1); border: 1px dashed var(--primary);">
                        <h4 style="color: #fff; margin-bottom: 0.5rem; font-family: 'Orbitron', sans-serif;">>> LEAK SOURCES:</h4>
                        <p style="color: var(--text-main); font-size: 0.95rem; line-height: 1.5;">${limitSources.join(', ')}${extra}</p>
                    </div>
                `;
            } else if (type === 'PASSWORD') {
                sourcesDiv.innerHTML = `
                    <div class="breach-sources" style="margin-top: 1rem; padding: 1rem; background: rgba(255,0,60,0.1); border: 1px dashed var(--primary);">
                        <h4 style="color: #fff; margin-bottom: 0.5rem; font-family: 'Orbitron', sans-serif;">>> LEAK SOURCES:</h4>
                        <p style="color: var(--text-dim); font-size: 0.9rem; line-height: 1.5;">Due to our Zero-Knowledge <strong>k-anonymity protocol</strong>, we only send a hash fragment. Specific breach sources are kept totally private and unknown to our system, but we confirmed a mathematical match in global breach records.</p>
                    </div>
                `;
            }

            const recs = document.createElement('div');
            recs.className = 'recommendations';
            recs.innerHTML = `
                <h4>>> WHAT TO DO NEXT</h4>
                <ul>
                    <li>Change your password right away!</li>
                    <li>Turn on Two-Factor Authentication (where you get a text message code to log in).</li>
                    <li>Use a Password Manager app to make strong passwords.</li>
                </ul>
            `;
            container.appendChild(heading);
            container.appendChild(sourcesDiv);
            container.appendChild(recs);
        } else {
            container.classList.add('success');
            heading.innerText = `[OK] YOU ARE SAFE. NO LEAKS FOUND.`;

            const recs = document.createElement('div');
            recs.className = 'recommendations success';
            recs.innerHTML = `
                <h4>>> STATUS REPORT</h4>
                <ul>
                    <li>Your info was not found in any known leaks.</li>
                    <li>Keep using strong, different passwords for each app.</li>
                </ul>
            `;
            container.appendChild(heading);
            container.appendChild(recs);
        }
    }
    // --- PASSWORD GENERATOR ---
    const generateBtn = document.getElementById('generate-btn');
    const keywordInput = document.getElementById('keyword-input');
    const generatorResult = document.getElementById('generator-result');
    const generatedOutput = document.getElementById('generated-output');
    const copyBtn = document.getElementById('copy-btn');

    keywordInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            generateBtn.click();
        }
    });

    generateBtn.addEventListener('click', () => {
        const keywords = keywordInput.value.trim().split(' ').filter(k => k);
        if (keywords.length === 0) {
            alert('Please enter at least one keyword.');
            return;
        }

        // Simple Leetspeak & padding
        const leet = { 'a': '@', 'e': '3', 'i': '1', 'o': '0', 's': '$', 'l': '!' };
        let base = keywords.join('-');
        let scrambled = base.split('').map(c => leet[c.toLowerCase()] || c).join('');

        // Random suffix
        const symbols = '!@#$%^&*';
        const num = Math.floor(Math.random() * 999);
        const sym = symbols[Math.floor(Math.random() * symbols.length)];

        // Capitalize first letter if it is alphabetical
        if (/[a-zA-Z]/.test(scrambled[0])) {
            scrambled = scrambled.charAt(0).toUpperCase() + scrambled.slice(1);
        }

        const finalPass = scrambled + sym + num + sym;
        generatedOutput.innerText = finalPass;
        generatorResult.classList.remove('hidden');
    });

    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(generatedOutput.innerText);
        const originalText = copyBtn.innerText;
        copyBtn.innerText = 'COPIED!';

        // Refresh after every use
        setTimeout(() => {
            copyBtn.innerText = originalText;
            generatorResult.classList.add('hidden');
            keywordInput.value = '';
        }, 2500);
    });

    // --- CYBER AI CHATBOT ---
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const chatBox = document.getElementById('chat-box');

    async function sendChatMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        // Add user message
        const userDiv = document.createElement('div');
        userDiv.className = 'chat-message user-message';
        userDiv.innerHTML = `<span class="chat-sender">USER:</span> ${text}`;
        chatBox.appendChild(userDiv);

        chatInput.value = '';
        chatBox.scrollTop = chatBox.scrollHeight;

        // Add AI thinking message
        const aiDiv = document.createElement('div');
        aiDiv.className = 'chat-message ai-message';
        aiDiv.innerHTML = `<span class="chat-sender">SYS_AI:</span> <span class="blinking">Analyzing...</span>`;
        chatBox.appendChild(aiDiv);
        chatBox.scrollTop = chatBox.scrollHeight;

        try {
            const res = await fetch('/api/cyber_chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });

            if (res.ok) {
                const data = await res.json();
                aiDiv.innerHTML = `<span class="chat-sender">SYS_AI:</span> ${data.response}`;
            } else {
                aiDiv.innerHTML = `<span class="chat-sender">SYS_AI:</span> Error connecting to Neural Net.`;
            }
        } catch (e) {
            aiDiv.innerHTML = `<span class="chat-sender">SYS_AI:</span> Connection Interrupted. Local network error.`;
        }
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    chatSendBtn.addEventListener('click', sendChatMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });
});
