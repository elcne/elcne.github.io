let isEmbedded;
try {
	isEmbedded = self !== top;
} catch (e) {
	isEmbedded = true;
}

let ignore, cancel;
if (isEmbedded) {
	if (document.head.innerHTML.includes('https://cdn.jsdelivr.net/npm/zombie-player')) {
		parent.postMessage('el-cine hide', '*');
	}
} else {
	find();
	//todo SPA routing
	addEventListener('message', e => {
		if (e.data === 'el-cine hide') {
			ignore = true;
			if (cancel) cancel();
		}
	});
}

function find() {
	//todo keyword
	let m;
	[
		/«(.+)»/,
		/(.*)\s\(.*\).*КиноПоиск/,
		/(.*) — смотреть онлайн — КиноПоиск/,
	].some(re => m = document.title.match(re));
	const title = m && m[1];
	if (!title) return;
	fetch('https://api.multikland.net/autochange/info/link?trailer=1&title=' + title.toLowerCase())
		.then(r => r.json())
		.then(r => {
			if (ignore) return;
			const url = new URL(r.url);
			url.searchParams.set('sharing', 'false');
			url.searchParams.set('theme', 'simple');
			const button = createElementWithStyle('button', buttonStyle);
			button.innerHTML = `Смотреть трейлер <b>${title}</b>`;
			// button.innerHTML = `Смотреть трейлер <b>${title}</b> <svg xmlns="http://www.w3.org/2000/svg" width="14" height="12" style="display:inline-block;vertical-align:middle;margin-left:5px;" fill="currentColor" viewBox="0 0 20 12"><path d="M2.4 12L10 4.6l7.6 7.4L20 9.7 10 0 0 9.7z"/></svg>`;
			const dropdown = createElementWithStyle('div', dropdownStyle);
			const dropdownItem = createElementWithStyle('div', dropdownItemStyle);
			dropdownItem.innerHTML = 'trailer 1';
			dropdown.appendChild(dropdownItem);
			const toggleButton = () => {
				if (scrollY > 300) {
					button.style.display = '';
				} else {
					button.style.display = 'none';
				}
			};
			let buildPromise;
			const buildFrame = () => getText(url.href).then(content => {
				const template = document.getElementById('el-cine-top-widget');
				template.querySelector('h1').innerText = `Смотреть трейлер "${title}"`;
				template.querySelector('iframe').contentDocument.write(content);
				template.style.display = 'block';

				let lastScrollHandle = 0;
				addEventListener('scroll', () => {
					//todo remove
					const now = Date.now();
					if (now < lastScrollHandle + 100) return;
					lastScrollHandle = now;
					toggleButton();
					setTimeout(toggleButton, 100);
				}, { passive: true });
			});
			button.onmouseenter = () => button.style.boxShadow = '0px 10px 12px 0px rgba(212, 46, 84, 0.3)';
			button.onmouseleave = () => button.style.boxShadow = '';
			button.onclick = () => {
				cancel = null;
				(buildPromise = buildPromise || buildFrame()).then(() => {
					scrollTo({ top: 0, behavior: 'smooth' });
					setTimeout(toggleButton, 100);
				});
			};
			document.body.appendChild(button);
			// document.body.appendChild(dropdown);
			cancel = () => {
				document.body.removeChild(button);
				cancel = null;
			};
		})
		.catch(e => e);
}

const getText = url => fetch(url).then(r => r.text());

const createElementWithStyle = (tagName, style) => {
	const el = document.createElement(tagName);
	Object.assign(el.style, style);
	return el;
};

const buttonStyle = {
	'pointer-events': 'all',
	'touch-action': 'auto',
	display: 'inline-block',
	position: 'fixed',
	top: 'auto',
	right: '5vw',
	bottom: '100px',
	left: 'auto',
	opacity: '1',
	color: '#ffffff',
	cursor: 'pointer',
	visibility: 'visible',
	font: 'inherit',
	'font-size': '14px',
	'text-align': 'left',
	margin: '0',
	padding: '10px 30px',
	'vertical-align': 'baseline',
	'border-radius': '20px',
	border: '2px solid  #fff',
	background: '#d42e54',
	'box-shadow': '0px 5px 10px 0px rgba(212, 46, 84, 0.15)',
	'user-select': 'none',
	'z-index': '2147483647',
};

const dropdownStyle = {
	position: 'fixed',
	right: '5vw',
	bottom: '145px',
	background: '#fff',
	'font-size': '14px',
	margin: '0 ',
	'border-radius': '10px',
	'box-shadow': '0px 5px 10px 0px rgba(212, 46, 84, 0.15)',
	'z-index': '2147483646',
};

const dropdownItemStyle = {
	display: 'block',
	width: '100%',
	color: '#000000',
	padding: '10px 20px',
	cursor: 'pointer',
	'box-sizing': 'border-box'
};

const dropdownItemStyleHover = {
	color: '#ffffff',
	'background-color': '#d42e54'
};
