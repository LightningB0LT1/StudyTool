const $ = selector => document.querySelector(selector);
let vocabulary, questions = [], current = 0, set = 1, mastered = 0;
const show = id => ['loading', 'study', 'quiz', 'done', 'error'].forEach(x => $(`#${x}`).classList.toggle('hidden', x !== id));
const escapeHtml = text => String(text).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
function normalized(text) { return String(text).trim().toLocaleLowerCase(); }
async function loadVocabulary() {
  try {
    const response = await fetch('./data/vocabulary.json', { cache: 'no-store' });
    if (!response.ok) throw new Error();
    vocabulary = await response.json();
    if (!Array.isArray(vocabulary.words) || !vocabulary.words.length || !Number.isInteger(vocabulary.setLength)) throw new Error();
    $('#setInfo').textContent = `${vocabulary.setLength} questions per set · ${vocabulary.words.length} words in the library`;
    show('study');
  } catch { show('error'); }
}
function startSet() {
  const pool = [...vocabulary.words];
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  questions = pool.slice(0, vocabulary.setLength);
  while (questions.length < vocabulary.setLength) questions.push(vocabulary.words[Math.floor(Math.random() * vocabulary.words.length)]);
  current = 0; mastered = 0; show('quiz'); drawQuestion();
}
function drawQuestion() {
  const question = questions[current];
  $('#progress').textContent = `SET ${set} · ${mastered} OF ${vocabulary.setLength} MASTERED`;
  $('#bar').style.width = `${(mastered / vocabulary.setLength) * 100}%`;
  $('#word').textContent = question.word; $('#answer').value = ''; $('#answer').disabled = false;
  $('#answerForm').classList.remove('hidden'); $('#feedback').classList.add('hidden'); $('#next').classList.add('hidden'); $('#answer').focus();
}
$('#answerForm').addEventListener('submit', event => {
  event.preventDefault(); const question = questions[current];
  const accepted = [question.definition, ...(question.acceptedAnswers || [])].map(normalized);
  const correct = accepted.includes(normalized($('#answer').value));
  if (correct) mastered++; else questions.push(question);
  $('#answer').disabled = true; $('#answerForm').classList.add('hidden');
  const feedback = $('#feedback'); feedback.className = `feedback ${correct ? '' : 'wrong'}`;
  feedback.innerHTML = correct ? '<strong>Correct!</strong> Nice work.' : `<strong>Not quite.</strong> The correct answer is: ${escapeHtml(question.definition)}<br><small>You will see this word again before the set is complete.</small>`;
  $('#next').textContent = correct && mastered === vocabulary.setLength ? 'Finish set' : 'Next word'; $('#next').classList.remove('hidden');
});
$('#next').onclick = () => { current++; if (current === questions.length) { set++; show('done'); } else drawQuestion(); };
$('#start').onclick = startSet; $('#again').onclick = startSet; loadVocabulary();
