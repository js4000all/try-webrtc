(() => {
  const pcConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

  // Elements
  const roleRadios = Array.from(document.querySelectorAll('input[name="role"]'));
  const roleHelp = document.getElementById('role-help');
  const statusRole = document.getElementById('status-role');
  const statusConn = document.getElementById('status-conn');
  const statusDc = document.getElementById('status-dc');
  const offererPanel = document.getElementById('offerer-panel');
  const answererPanel = document.getElementById('answerer-panel');

  const btnCreateOffer = document.getElementById('btn-create-offer');
  const localSdpOfferer = document.getElementById('local-sdp-offerer');
  const remoteSdpOfferer = document.getElementById('remote-sdp-offerer');
  const btnApplyAnswer = document.getElementById('btn-apply-answer');

  const remoteSdpAnswerer = document.getElementById('remote-sdp-answerer');
  const btnApplyOfferGenerateAnswer = document.getElementById('btn-apply-offer-generate-answer');
  const localSdpAnswerer = document.getElementById('local-sdp-answerer');

  const chatLog = document.getElementById('chat-log');
  const chatText = document.getElementById('chat-text');
  const btnSend = document.getElementById('btn-send');
  const btnReset = document.getElementById('btn-reset');

  // State
  let pc = null;
  let dc = null;
  let role = 'offerer';

  // Utils
  const enc = (obj) => btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
  const dec = (b64) => JSON.parse(decodeURIComponent(escape(atob(b64.trim()))));

  const waitIceComplete = (pc) => {
    if (!pc) return Promise.resolve();
    if (pc.iceGatheringState === 'complete') return Promise.resolve();
    return new Promise((resolve) => {
      const check = () => {
        if (pc.iceGatheringState === 'complete') {
          pc.removeEventListener('icegatheringstatechange', check);
          resolve();
        }
      };
      pc.addEventListener('icegatheringstatechange', check);
    });
  };

  const setRole = (next) => {
    role = next;
    statusRole.textContent = role;
    offererPanel.style.display = role === 'offerer' ? 'block' : 'none';
    answererPanel.style.display = role === 'answerer' ? 'block' : 'none';
    roleHelp.textContent = role === 'offerer'
      ? 'あなたが接続を開始します（SDPを相手へ送る）'
      : '相手のオファーSDPを受け取り、アンサーを返します';
  };

  const updateStatus = () => {
    const conn = pc?.connectionState ?? '-';
    const dcs = dc?.readyState ?? '-';
    statusConn.textContent = conn;
    statusDc.textContent = dcs;
    const enabled = dc && dc.readyState === 'open';
    chatText.disabled = !enabled;
    btnSend.disabled = !enabled;
  };

  const cleanup = () => {
    try { if (dc) dc.close(); } catch {}
    try { if (pc) pc.close(); } catch {}
    dc = null;
    pc = null;
    localSdpOfferer.value = '';
    localSdpAnswerer.value = '';
    remoteSdpOfferer.value = '';
    remoteSdpAnswerer.value = '';
    chatLog.innerHTML = '';
    chatText.value = '';
    updateStatus();
  };

  const appendMessage = (who, text) => {
    const line = document.createElement('div');
    line.className = `msg ${who}`;
    line.textContent = `[${who}] ${text}`;
    chatLog.appendChild(line);
    chatLog.scrollTop = chatLog.scrollHeight;
  };

  const bindPcEvents = () => {
    if (!pc) return;
    pc.addEventListener('connectionstatechange', updateStatus);
    pc.addEventListener('iceconnectionstatechange', updateStatus);
  };

  const setupDc = (channel) => {
    dc = channel;
    dc.addEventListener('open', updateStatus);
    dc.addEventListener('close', updateStatus);
    dc.addEventListener('message', (ev) => appendMessage('peer', ev.data));
    updateStatus();
  };

  // Copy buttons
  document.querySelectorAll('button[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-copy');
      const el = document.getElementById(id);
      el.select();
      try {
        await navigator.clipboard.writeText(el.value);
        btn.textContent = 'コピーしました';
        setTimeout(() => (btn.textContent = 'コピー'), 1200);
      } catch {
        document.execCommand('copy');
      }
    });
  });

  // Role change
  roleRadios.forEach((r) =>
    r.addEventListener('change', (e) => setRole(e.target.value))
  );
  setRole('offerer');
  updateStatus();

  // Offerer: Create offer
  btnCreateOffer.addEventListener('click', async () => {
    cleanup();
    pc = new RTCPeerConnection(pcConfig);
    bindPcEvents();
    setupDc(pc.createDataChannel('chat', { ordered: true }));
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await waitIceComplete(pc);
    localSdpOfferer.value = enc(pc.localDescription);
    updateStatus();
  });

  // Offerer: Apply remote answer
  btnApplyAnswer.addEventListener('click', async () => {
    if (!pc) {
      alert('先にオファーを生成してください');
      return;
    }
    try {
      const ans = dec(remoteSdpOfferer.value);
      await pc.setRemoteDescription(ans);
      updateStatus();
    } catch (e) {
      alert('アンサーSDPの形式が不正です');
      console.error(e);
    }
  });

  // Answerer: Apply offer and generate answer
  btnApplyOfferGenerateAnswer.addEventListener('click', async () => {
    cleanup();
    const raw = remoteSdpAnswerer.value;
    if (!raw.trim()) {
      alert('オファーSDPを貼り付けてください');
      return;
    }
    try {
      const offer = dec(raw);
      pc = new RTCPeerConnection(pcConfig);
      bindPcEvents();
      pc.addEventListener('datachannel', (ev) => setupDc(ev.channel));
      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await waitIceComplete(pc);
      localSdpAnswerer.value = enc(pc.localDescription);
      updateStatus();
    } catch (e) {
      alert('オファーSDPの形式が不正です');
      console.error(e);
    }
  });

  // Chat send
  const send = () => {
    const msg = chatText.value.trim();
    if (!msg || !dc || dc.readyState !== 'open') return;
    dc.send(msg);
    appendMessage('you', msg);
    chatText.value = '';
  };
  btnSend.addEventListener('click', send);
  chatText.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') send();
  });

  // Reset
  btnReset.addEventListener('click', cleanup);
})();

