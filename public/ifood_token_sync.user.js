// ==UserScript==
// @name         iFood Token Sync & Auto Refresh - Ilda Lanches
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Captura token do iFood e atualiza a página automaticamente às 19:01 (Horário de Brasília)
// @author       Central Ilda Lanches
// @match        https://gestordepedidos.ifood.com.br/*
// @match        https://portal.ifood.com.br/*
// @match        https://*.ifood.com.br/*
// @updateURL    http://2.24.93.166/ifood_token_sync.user.js
// @downloadURL  http://2.24.93.166/ifood_token_sync.user.js
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      2.24.93.166
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';

  var VPS_URL = 'http://2.24.93.166/api/store/ifood/sync-token';
  var STORAGE_KEY_LAST_1901_RELOAD = 'ilda_ifood_last_1901_reload';
  var lastToken = null;
  var lastSentAt = 0;
  var badgeElem = null;
  var isReloading = false;

  // Helper para obter a data/hora exata no Fuso Horário de Brasília (UTC-3)
  function getBrasiliaDate() {
    var now = new Date();
    try {
      var spString = now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" });
      return new Date(spString);
    } catch (e) {
      // Fallback em caso de navegador sem suporte a timeZone
      var utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      return new Date(utc - (3 * 3600000));
    }
  }

  function getTodayKey(d) {
    var year = d.getFullYear();
    var month = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  function createBadge() {
    if (document.getElementById('ilda-token-badge')) return;
    badgeElem = document.createElement('div');
    badgeElem.id = 'ilda-token-badge';
    
    var bDate = getBrasiliaDate();
    var todayKey = getTodayKey(bDate);
    var jaRecarregouHoje = localStorage.getItem(STORAGE_KEY_LAST_1901_RELOAD) === todayKey;
    var infoAgendamento = jaRecarregouHoje ? '✅ 19:01 OK' : '⏰ 19:01';

    badgeElem.innerHTML = '🟢 <b>Central Ilda:</b> Conectando... | ' + infoAgendamento;
    badgeElem.style.position = 'fixed';
    badgeElem.style.bottom = '16px';
    badgeElem.style.right = '16px';
    badgeElem.style.zIndex = '999999';
    badgeElem.style.padding = '8px 14px';
    badgeElem.style.background = '#18181b';
    badgeElem.style.color = '#22c55e';
    badgeElem.style.borderRadius = '20px';
    badgeElem.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    badgeElem.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    badgeElem.style.fontSize = '12px';
    badgeElem.style.cursor = 'pointer';
    badgeElem.style.userSelect = 'none';
    badgeElem.style.transition = 'all 0.3s ease';
    badgeElem.title = 'Central Ilda: Sincronização de Token & Auto-refresh às 19:01. Clique para sincronizar agora.';
    badgeElem.onclick = function () {
      badgeElem.innerHTML = '🔄 <b>Central Ilda:</b> Sincronizando...';
      scanStorageForToken();
    };
    document.body.appendChild(badgeElem);
  }

  function updateBadge(success, msg) {
    if (!badgeElem && document.body) createBadge();
    if (!badgeElem) return;

    var bDate = getBrasiliaDate();
    var todayKey = getTodayKey(bDate);
    var jaRecarregouHoje = localStorage.getItem(STORAGE_KEY_LAST_1901_RELOAD) === todayKey;
    var infoAgendamento = jaRecarregouHoje ? '✅ 19:01 OK' : '⏰ Auto 19:01';

    if (success) {
      badgeElem.style.color = '#22c55e';
      badgeElem.innerHTML = '🟢 <b>Central Ilda:</b> Conectado (' + (msg || 'OK') + ') | ' + infoAgendamento;
    } else {
      badgeElem.style.color = '#eab308';
      badgeElem.innerHTML = '🟡 <b>Central Ilda:</b> Aguardando token... | ' + infoAgendamento;
    }
  }

  // =========================================================
  // ROTINA DE ATUALIZAÇÃO AUTOMÁTICA ÀS 19:01 (HORÁRIO DE BRASÍLIA)
  // =========================================================
  function checkAutoRefresh1901() {
    // Apenas a janela principal deve disparar o reload (evita iframes internos)
    if (window.top !== window.self) return;
    if (isReloading) return;

    var bDate = getBrasiliaDate();
    var hours = bDate.getHours();
    var minutes = bDate.getMinutes();
    var seconds = bDate.getSeconds();
    var todayKey = getTodayKey(bDate);

    var lastReloadDate = localStorage.getItem(STORAGE_KEY_LAST_1901_RELOAD);

    // Contagem regressiva nos últimos 60 segundos antes das 19:01 (ou seja, 19:00:xx)
    if (hours === 19 && minutes === 0 && lastReloadDate !== todayKey) {
      var segRestantes = 60 - seconds;
      if (badgeElem) {
        badgeElem.style.background = '#854d0e';
        badgeElem.style.color = '#fef08a';
        badgeElem.innerHTML = '⏳ <b>iFood:</b> Atualizando em ' + segRestantes + 's (19:01)...';
      }
    }

    // DISPARO EXATO ÀS 19:01
    if (hours === 19 && minutes === 1) {
      if (lastReloadDate !== todayKey) {
        isReloading = true;
        console.log('[ILDA IFOOD] Horário 19:01:00 atingido! Recarregando página do iFood...');
        localStorage.setItem(STORAGE_KEY_LAST_1901_RELOAD, todayKey);
        
        if (badgeElem) {
          badgeElem.style.background = '#dc2626';
          badgeElem.style.color = '#ffffff';
          badgeElem.innerHTML = '🔄 <b>Central Ilda:</b> 19:01 atingido! Atualizando página do iFood...';
        }

        setTimeout(function () {
          var doReload = globalScope.__ildaReloadFn || function () { window.location.reload(); };
          doReload();
        }, 1000);
      }
    }
  }

  // Método global para testes e validações manuais ou automatizadas
  var globalScope = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
  globalScope.__testIldaReload1901 = function (forcar) {
    console.log('[ILDA IFOOD TEST] Disparando simulação de atualização das 19:01...');
    if (badgeElem) {
      badgeElem.style.background = '#dc2626';
      badgeElem.style.color = '#ffffff';
      badgeElem.innerHTML = '🔄 <b>Central Ilda (TESTE):</b> Simulando atualização das 19:01...';
    }
    if (forcar) {
      setTimeout(function () {
        window.location.reload();
      }, 1000);
    }
    return {
      status: 'sucesso',
      fusoBrasilia: getBrasiliaDate().toLocaleTimeString('pt-BR'),
      hoje: getTodayKey(getBrasiliaDate()),
      jaRecarregouHoje: localStorage.getItem(STORAGE_KEY_LAST_1901_RELOAD) === getTodayKey(getBrasiliaDate())
    };
  };

  // =========================================================
  // SINCRONIZAÇÃO DE TOKEN DO IFOOD COM A VPS
  // =========================================================
  function sendToken(token, source) {
    if (!token) return;
    var now = Date.now();
    if (token === lastToken && now - lastSentAt < 60000) {
      updateBadge(true, 'Ativo');
      return;
    }
    lastToken = token;
    lastSentAt = now;
    console.log('[ILDA SYNC] Enviando token para VPS (origem: ' + (source || 'req') + ')...');

    GM_xmlhttpRequest({
      method: 'POST',
      url: VPS_URL,
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ token: token }),
      onload: function (r) {
        console.log('[ILDA SYNC] Token sincronizado com sucesso! HTTP', r.status);
        updateBadge(true, new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
      },
      onerror: function (err) {
        console.warn('[ILDA SYNC] Erro ao conectar com a VPS:', err);
        updateBadge(false, 'Falha de rede');
      }
    });
  }

  function extractBearer(val) {
    if (!val) return null;
    var m = String(val).match(/bearer\s+([a-zA-Z0-9_\-\.]+)/i);
    return m ? m[1] : null;
  }

  function scanStorageForToken() {
    try {
      var found = null;
      var storages = [window.localStorage, window.sessionStorage];
      for (var s = 0; s < storages.length; s++) {
        var store = storages[s];
        if (!store) continue;
        for (var i = 0; i < store.length; i++) {
          var k = store.key(i);
          var v = store.getItem(k);
          if (v && v.indexOf('eyJ') !== -1 && v.length > 80) {
            var m = v.match(/eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}/);
            if (m) {
              found = m[0];
              break;
            }
          }
        }
        if (found) break;
      }
      if (found) {
        sendToken(found, 'storage');
      }
    } catch (e) {
      console.warn('[ILDA SYNC] Erro ao varrer storage:', e);
    }
  }

  // Intercepta fetch
  var pw = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
  var origFetch = pw.fetch;
  pw.fetch = function () {
    var opts = arguments[1];
    if (opts && opts.headers) {
      var auth = null;
      if (opts.headers && typeof opts.headers.get === 'function') {
        auth = opts.headers.get('authorization') || opts.headers.get('Authorization');
      } else if (typeof opts.headers === 'object') {
        auth = opts.headers['authorization'] || opts.headers['Authorization'];
      }
      var tok = extractBearer(auth);
      if (tok) sendToken(tok, 'fetch');
    }
    return origFetch.apply(this, arguments);
  };

  // Intercepta XMLHttpRequest
  var OrigXHR = pw.XMLHttpRequest;
  pw.XMLHttpRequest = function () {
    var xhr = new OrigXHR();
    var origSet = xhr.setRequestHeader.bind(xhr);
    xhr.setRequestHeader = function (name, value) {
      if (String(name).toLowerCase() === 'authorization') {
        var tok = extractBearer(value);
        if (tok) sendToken(tok, 'xhr');
      }
      return origSet(name, value);
    };
    return xhr;
  };

  // Inicialização
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    createBadge();
    scanStorageForToken();
    checkAutoRefresh1901();
  }

  window.addEventListener('DOMContentLoaded', function () {
    createBadge();
    scanStorageForToken();
    checkAutoRefresh1901();
  });

  window.addEventListener('load', function () {
    createBadge();
    scanStorageForToken();
    setTimeout(scanStorageForToken, 2000);
  });

  // Monitoramento contínuo a cada 1 segundo para precisão absoluta no horário
  setInterval(checkAutoRefresh1901, 1000);

  console.log('[ILDA SYNC & AUTO REFRESH] v1.5 ativo! Sincronização e atualização agendada para 19:01.');
})();
