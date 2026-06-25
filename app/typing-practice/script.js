import { createApp, reactive, computed, ref } from '@vue';
import { LocalStorage } from '@localStorage';

// ---------- opencc ----------
let openccConverter = null, openccReady = false;
try {
	if (window.OpenCC && typeof window.OpenCC.Converter === 'function') {
		openccConverter = window.OpenCC.Converter({ from: 'cn', to: 'tw' });
		openccReady = true;
	}
} catch(e) {}
function toTraditional(text) {
	if (openccReady && openccConverter) { try { return openccConverter(text); } catch(e) {} }
	return text;
}

// ---------- utils ----------
function isZh(lang) { return lang === 'zh-Hant' || lang === 'zh-Hans'; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function detectDefaultLang() {
	const candidates = navigator.languages?.length ? navigator.languages : [navigator.language || ''];
	for (const raw of candidates) {
		if (!raw) continue;
		const tag = raw.toLowerCase();
		if (!tag.startsWith('zh')) continue;
		if (/-(tw|hk|mo)$/.test(tag) || tag.includes('hant')) return 'zh-Hant';
		if (/-(cn|sg)$/.test(tag) || tag.includes('hans')) return 'zh-Hans';
		return 'zh-Hans';
	}
	return 'en';
}

// ---------- offline fallback ----------
const ZH_HANT_FALLBACK = [
	"海內存知己，天涯若比鄰。無為在岐路，兒女共沾巾。",
	"人生天地之間，若白駒過隙，忽然而已。",
	"山有木兮木有枝，心悅君兮君不知。",
	"莫愁前路無知己，天下誰人不識君。",
	"落霞與孤鶩齊飛，秋水共長天一色。",
	"縱有疾風起，人生不言棄。願你我都能在風雨之中，守住一份從容。",
	"工欲善其事，必先利其器。練字如練心，貴在持之以恆。",
	"一個人能否成功，不在於起點高低，而在於是否願意每天多努力一點。",
	"不積跬步，無以至千里；不積小流，無以成江海。",
	"千里之行，始於足下。知之者不如好之者，好之者不如樂之者。",
	"學而不思則罔，思而不學則殆。溫故而知新，可以為師矣。",
	"路漫漫其修遠兮，吾將上下而求索。",
	"老驥伏櫪，志在千里；烈士暮年，壯心不已。",
	"會當凌絕頂，一覽眾山小。讀書破萬卷，下筆如有神。",
	"長風破浪會有時，直掛雲帆濟滄海。",
	"天生我材必有用，千金散盡還復來。",
	"寶劍鋒從磨礪出，梅花香自苦寒來。",
	"少壯不努力，老大徒傷悲。黑髮不知勤學早，白首方悔讀書遲。",
	"人有悲歡離合，月有陰晴圓缺，此事古難全。",
	"但願人長久，千里共嬋娟。",
];
const ZH_HANS_FALLBACK = [
	"海内存知己，天涯若比邻。无为在岐路，儿女共沾巾。",
	"人生天地之间，若白驹过隙，忽然而已。",
	"山有木兮木有枝，心悦君兮君不知。",
	"莫愁前路无知己，天下谁人不识君。",
	"落霞与孤鹜齐飛，秋水共长天一色。",
	"纵有疾风起，人生不言弃。愿你我都能在风雨之中，守住一份从容。",
	"工欲善其事，必先利其器。练字如练心，贵在持之以恒。",
	"一个人能否成功，不在于起点高低，而在于是否愿意每天多努力一点。",
	"不积跬步，无以至千里；不积小流，无以成江海。",
	"千里之行，始于足下。知之者不如好之者，好之者不如乐之者。",
	"学而不思则罔，思而不学则殆。温故而知新，可以为师矣。",
	"路漫漫其修远兮，吾将上下而求索。",
	"老骥伏枥，志在千里；烈士暮年，壮心不已。",
	"会当凌绝顶，一览众山小。读书破万卷，下笔如有神。",
	"长风破浪会有时，直挂云帆济沧海。",
	"天生我材必有用，千金散尽还复来。",
	"宝剑锋从磨砺出，梅花香自苦寒来。",
	"少壮不努力，老大徒伤悲。黑发不知勤学早，白首方悔读书迟。",
	"人有悲欢离合，月有阴晴圆缺，此事古难全。",
	"但愿人长久，千里共婵娟。",
];
const EN_FALLBACK = [
	"The quick brown fox jumps over the lazy dog while the sun slowly sets behind the hills.",
	"Practice does not make perfect. Only perfect practice makes perfect, and patience makes it possible.",
	"Typing fast is a skill built one careful keystroke at a time, not a talent you are born with.",
	"The only way to do great work is to love what you do and keep doing it every single day.",
	"Code is read far more often than it is written, so clarity should always come before cleverness.",
	"A journey of a thousand miles begins with a single step, and a single step begins with focus.",
	"Simplicity is the ultimate sophistication, and restraint is often harder than addition.",
	"Small steady habits, repeated daily, quietly outperform occasional bursts of great intensity.",
	"The secret of getting ahead is getting started. The secret of getting started is breaking tasks into small manageable steps.",
	"Success is not final, failure is not fatal: it is the courage to continue that counts.",
	"In the middle of every difficulty lies opportunity. Keep your face always toward the sunshine.",
	"It does not matter how slowly you go as long as you do not stop moving forward.",
	"The best time to plant a tree was twenty years ago. The second best time is now.",
	"You do not rise to the level of your goals; you fall to the level of your systems.",
	"Focus on the journey, not the destination. Joy is found not in finishing an activity but in doing it.",
	"Do not watch the clock; do what it does and keep going. Time waits for no one.",
	"An investment in knowledge pays the best interest. Read more, think more, write more.",
	"Discipline is the bridge between goals and accomplishment. Build it one habit at a time.",
	"The difference between ordinary and extraordinary is that little extra effort, every single day.",
	"Every expert was once a beginner. Every master was once a disaster who refused to quit.",
];
function fallbackPoolFor(lang) {
	if (lang === 'zh-Hant') return ZH_HANT_FALLBACK;
	if (lang === 'zh-Hans') return ZH_HANS_FALLBACK;
	return EN_FALLBACK;
}

// ---------- fetch ----------
const MIN_LENGTH = 220;
const FETCH_TIMEOUT_MS = 4000;
function fetchWithTimeout(url, ms) {
	const ctrl = new AbortController();
	const id = setTimeout(() => ctrl.abort(), ms);
	return fetch(url, { cache: 'no-store', signal: ctrl.signal }).finally(() => clearTimeout(id));
}
async function fetchOneZhHitokoto() {
	const res = await fetchWithTimeout('https://v1.hitokoto.cn/?c=i&c=k&c=a&encode=json', FETCH_TIMEOUT_MS);
	if (!res.ok) throw new Error('hitokoto bad response');
	const data = await res.json();
	if (!data?.hitokoto) throw new Error('hitokoto no content');
	return { text: data.hitokoto, label: 'hitokoto.cn' + (data.from ? ' · ' + data.from : '') };
}
async function fetchOneZhJinrishici() {
	const res = await fetchWithTimeout('https://v1.jinrishici.com/all.json', FETCH_TIMEOUT_MS);
	if (!res.ok) throw new Error('jinrishici bad response');
	const data = await res.json();
	if (!data?.content) throw new Error('jinrishici no content');
	return { text: data.content, label: '今日詩詞' + (data.origin?.title ? ' · ' + data.origin.title : '') };
}
async function fetchBatchEn() {
	const skip = Math.floor(Math.random() * 85);
	const res = await fetchWithTimeout(`https://dummyjson.com/quotes?limit=15&skip=${skip}`, FETCH_TIMEOUT_MS);
	if (!res.ok) throw new Error('dummyjson bad response');
	const data = await res.json();
	if (!data?.quotes?.length) throw new Error('dummyjson no content');
	return data.quotes.map(q => ({ text: q.quote, label: q.author ? 'dummyjson.com · ' + q.author : 'dummyjson.com' }));
}
async function buildPracticeText(lang, targetLength = MIN_LENGTH) {
	const joiner = isZh(lang) ? '' : ' ';
	const fallbackPool = fallbackPoolFor(lang);
	const usedFallback = new Set();
	const pieces = [], labels = [];
	let apiHitCount = 0, total = 0;

	if (!isZh(lang)) {
		try {
			const batch = await fetchBatchEn();
			for (const item of batch) {
				if (total >= targetLength) break;
				const text = item.text.trim();
				if (!text) continue;
				apiHitCount++; pieces.push(text); labels.push(item.label);
				total += text.length;
			}
		} catch(e) {}
	} else {
		const settled = await Promise.allSettled([fetchOneZhHitokoto(), fetchOneZhJinrishici()]);
		for (const r of settled) {
			const item = r.status === 'fulfilled' ? r.value : null;
			if (item?.text) {
				let text = item.text.trim();
				if (lang === 'zh-Hant') text = toTraditional(text);
				if (!text) continue;
				apiHitCount++; pieces.push(text); labels.push(item.label);
				total += Array.from(text).length;
			}
		}
	}

	while (total < targetLength) {
		let candidate;
		do { candidate = pick(fallbackPool); }
		while (usedFallback.has(candidate) && usedFallback.size < fallbackPool.length);
		usedFallback.add(candidate);
		pieces.push(candidate);
		total += isZh(lang) ? Array.from(candidate).length : candidate.length;
	}

	const convertNote = (lang === 'zh-Hant' && apiHitCount > 0) ? '（已簡轉繁）' : '';
	let sourceLabel;
	if (apiHitCount === 0) {
		sourceLabel = isZh(lang) ? '離線語句庫（API 暫時無回應）' : 'Offline sentence bank (API unreachable)';
	} else if (apiHitCount < pieces.length) {
		sourceLabel = Array.from(new Set(labels)).slice(0, 2).join(' · ') + convertNote + `（${apiHitCount}/${pieces.length} 句來自 API）`;
	} else {
		sourceLabel = Array.from(new Set(labels)).slice(0, 2).join(' · ') + convertNote;
	}
	return { text: pieces.join(joiner), source: sourceLabel };
}

// ---------- prefetch cache ----------
const _textCache = {}, _prefetchPromise = {};
function prefetch(lang) {
	if (_prefetchPromise[lang] || _textCache[lang]) return;
	_prefetchPromise[lang] = buildPracticeText(lang, MIN_LENGTH)
		.then(result => { _textCache[lang] = result; })
		.catch(() => {})
		.finally(() => { delete _prefetchPromise[lang]; });
}

// ---------- Vue App ----------
createApp({
	setup() {
		let state = reactive({
			mode:     LocalStorage.get('mode') || 'time',
			lang:     LocalStorage.get('lang') || detectDefaultLang(),
			duration: parseInt(LocalStorage.get('duration') || '60', 10),
			wordCount: 200,
			fullText: '',
			srcLabel: '載入中…',
			isLoading: false,
			started: false,
			finished: false,
			startTime: 0,
			timerId: null,
			remaining: 0,
			totalKeystrokes: 0,
			totalCorrect: 0,
			totalErrors: 0,
			lastLen: 0,
			extending: false,
			typedValue: '',
			cursorPos: 0,
			timerText: '--',
			timerUnit: '秒',
			timerWarn: false,
			reportVisible: false,
			report: { speed: 0, speedLbl: '', accuracy: '0%', time: '0s', chars: 0, errors: 0, sub: '' },
		});

		const typeInputRef = ref(null);

		let textChars = computed(() => Array.from(state.fullText));
		let spans = computed(() => {
			const target = textChars.value;
			const typed  = Array.from(state.typedValue);
			const cursor = state.cursorPos;
			const disp = c => c === ' ' ? ' ' : c;
			const displayCursor = target.length > 0 ? Math.min(cursor, target.length - 1) : -1;
			return target.map((char, i) => {
				let cls, text, correct = null;
				if (i < typed.length) {
					if (typed[i] === char) { cls = 'correct';   text = disp(char); }
					else                   { cls = 'incorrect'; text = disp(typed[i]); correct = char === ' ' ? '␣' : char; }
				} else {
					cls = 'pending'; text = disp(char);
				}
				if (i === displayCursor) cls += ' current';
				if (char === ' ') cls += ' is-space';
				return { cls, text, correct };
			});
		});

		// ---------- timer ----------
		function resetTimer() {
			if (state.mode === 'time') { state.timerText = String(state.duration); state.timerUnit = '秒'; }
			else                       { state.timerText = '00:00'; state.timerUnit = '計時中'; }
			state.timerWarn = false;
		}
		function stopTimer() {
			if (state.timerId) { clearInterval(state.timerId); state.timerId = null; }
		}
		function beginTimer() {
			state.started = true;
			state.startTime = Date.now();
			if (state.mode === 'time') {
				state.remaining = state.duration;
				state.timerId = setInterval(() => {
					state.remaining--;
					state.timerText = String(state.remaining);
					if (state.remaining <= 10) state.timerWarn = true;
					if (state.remaining <= 0)  finishPractice('timeup');
				}, 1000);
			} else {
				state.timerId = setInterval(() => {
					const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
					state.timerText = String(Math.floor(elapsed / 60)).padStart(2, '0') + ':' + String(elapsed % 60).padStart(2, '0');
				}, 1000);
			}
		}

		// ---------- load text ----------
		async function loadText(skipCache = false) {
			const lang = state.lang;
			const targetLength = state.mode === 'article' ? state.wordCount : MIN_LENGTH;

			if (!skipCache && state.mode === 'time') {
				if (_prefetchPromise[lang]) {
					state.srcLabel = isZh(lang) ? '正在載入…' : 'Loading…';
					state.isLoading = true;
					await _prefetchPromise[lang];
				}
				if (_textCache[lang]) {
					const cached = _textCache[lang];
					delete _textCache[lang];
					state.fullText = cached.text.trim();
					state.srcLabel  = cached.source;
					state.isLoading = false;
					prefetch(lang);
					return;
				}
			}

			state.srcLabel  = isZh(lang) ? '正在載入…' : 'Loading…';
			state.isLoading = true;
			const { text, source } = await buildPracticeText(lang, targetLength);
			state.fullText  = text.trim();
			state.srcLabel  = source;
			state.isLoading = false;
			prefetch(lang);
		}

		// ---------- practice control ----------
		function resetState() {
			stopTimer();
			state.started = false; state.finished = false;
			state.totalKeystrokes = 0; state.totalCorrect = 0; state.totalErrors = 0;
			state.lastLen = 0; state.typedValue = ''; state.cursorPos = 0;
			state.reportVisible = false;
			if (typeInputRef.value) typeInputRef.value.value = '';
			resetTimer();
		}
		async function startPractice(forceRefresh = false) {
			resetState();
			await loadText(forceRefresh);
			if (typeInputRef.value) typeInputRef.value.focus();
		}
		function retry() {
			resetState();
			if (typeInputRef.value) typeInputRef.value.focus();
		}
		function newText()  { startPractice(); }
		function fetchNew() { delete _textCache[state.lang]; startPractice(true); }

		// ---------- settings ----------
		function setMode(mode) {
			state.mode = mode;
			LocalStorage.set('mode', mode);
			resetTimer();
		}
		function setLang(lang) {
			state.lang = lang;
			LocalStorage.set('lang', lang);
			startPractice();
		}
		function onDurationChange() {
			LocalStorage.set('duration', state.duration);
			resetTimer();
		}

		// ---------- input ----------
		function onInput(e) {
			if (state.finished) return;
			if (!state.started) beginTimer();

			const target = textChars.value;
			let typed = Array.from(e.target.value);

			if (state.mode === 'article' && typed.length > target.length) {
				typed = typed.slice(0, target.length);
				e.target.value = typed.join('');
			}
			if (typed.length > state.lastLen) {
				for (let i = state.lastLen; i < typed.length; i++) {
					state.totalKeystrokes++;
					if (typed[i] === target[i]) state.totalCorrect++;
					else                        state.totalErrors++;
				}
			}
			state.lastLen    = typed.length;
			state.typedValue = e.target.value;
			state.cursorPos  = e.target.selectionStart;

			if (state.mode === 'time'    && target.length - typed.length < 40) extendTimeText();
			if (state.mode === 'article' && typed.length === target.length)     finishPractice('done');
		}
		function onKeyup(e) {
			if (state.finished || !state.started) return;
			state.cursorPos = e.target.selectionStart;
		}
		function onKeydown(e) {
			if (state.mode === 'article' && e.key === 'Enter') e.preventDefault();
		}
		function focusInput() {
			if (!state.finished && typeInputRef.value) typeInputRef.value.focus();
		}

		// ---------- extend ----------
		async function extendTimeText() {
			if (state.extending) return;
			state.extending = true;
			try {
				const { text } = await buildPracticeText(state.lang);
				state.fullText += (isZh(state.lang) ? '　' : ' ') + text;
			} catch(e) {}
			state.extending = false;
		}

		// ---------- finish ----------
		function finishPractice(reason) {
			if (state.finished) return;
			state.finished = true;
			stopTimer();
			const elapsedSec = state.mode === 'time'
				? state.duration
				: Math.max(1, Math.round((Date.now() - state.startTime) / 1000));
			const accuracy = state.totalKeystrokes > 0
				? Math.round((state.totalCorrect / state.totalKeystrokes) * 100) : 0;
			let speed, speedLbl;
			if (isZh(state.lang)) {
				speed = Math.round(state.totalCorrect / (elapsedSec / 60)); speedLbl = '字 / 分鐘';
			} else {
				speed = Math.round((state.totalCorrect / 5) / (elapsedSec / 60)); speedLbl = 'WPM (字/分)';
			}
			state.report = {
				speed, speedLbl,
				accuracy: accuracy + '%',
				time:     elapsedSec + 's',
				chars:    state.totalKeystrokes,
				errors:   state.totalErrors,
				sub:      reason === 'timeup' ? '時間到！這是你的成績單：' : '文章完成！這是你的成績單：',
			};
			state.reportVisible = true;
		}

		// ---------- init ----------
		resetTimer();
		prefetch(state.lang);
		startPractice();

		return {
			state, spans, textChars, typeInputRef,
			setMode, setLang, onDurationChange,
			fetchNew, retry, newText,
			onInput, onKeyup, onKeydown, focusInput,
		};
	}
}).mount('#App');
