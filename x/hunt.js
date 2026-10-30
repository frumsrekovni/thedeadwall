(function () {
	var ENDPOINT = 'https://script.google.com/macros/s/AKfycbw3QThA_WhI4gLjyUNTnmk8629ky3hZ3x_CoLY_4OmmmVvxHyjmunsRaJ9BjSS_Rvey/exec';
	var form = document.querySelector('.hunt-form');
	if (!form) return;
	var nameEl = form.querySelector('[name=name]');
	var answerEl = form.querySelector('[name=answer]');
	var status = form.querySelector('.hunt-status');
	var btn = form.querySelector('[type=submit]');
	var question = document.querySelector('.hunt-question').textContent.trim();
	var KEY = 'deadwall_hunt_name';

	try {
		var saved = localStorage.getItem(KEY);
		if (saved) nameEl.value = saved;
	} catch (e) {}

	function setStatus(msg, err) {
		status.textContent = msg;
		status.classList.toggle('err', !!err);
	}

	form.addEventListener('submit', function (e) {
		e.preventDefault();
		var name = nameEl.value.trim();
		var answer = answerEl.value.trim();
		nameEl.toggleAttribute('aria-invalid', !name);
		answerEl.toggleAttribute('aria-invalid', !answer);
		if (!name || !answer) {
			setStatus('Both your name and an answer are required.', true);
			(name ? answerEl : nameEl).focus();
			return;
		}
		btn.disabled = true;
		setStatus('Sending…');
		fetch(ENDPOINT, {
			method: 'POST',
			mode: 'no-cors',
			body: JSON.stringify({
				kind: 'answer',
				qid: form.dataset.qid,
				question: question,
				name: name.slice(0, 60),
				answer: answer.slice(0, 500),
			}),
		})
			.then(function () {
				try {
					localStorage.setItem(KEY, name);
				} catch (e) {}
				form.classList.add('sent');
				answerEl.value = '';
				setStatus('Your answer has been sealed in Doracula\u2019s ledger.');
			})
			.catch(function () {
				setStatus('Something went wrong — check your connection and try again.', true);
			})
			.finally(function () {
				btn.disabled = false;
			});
	});
})();
