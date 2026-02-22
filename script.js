// Estado de la aplicación
let datos = null;
let respuestasUsuario = {};
let visibleQuestions = [];
let userAnswers = [];
let currentMode = 'general';
let currentState = {
    score: 0,
    consecutiveIncorrect: 0,
    correct: 0,
    incorrect: 0
};

// Referencias DOM
const startScreen = document.getElementById('start-screen');
const examContainer = document.getElementById('exam-container');
const resultsScreen = document.getElementById('results-screen');
const questionsContainer = document.getElementById('questions-container');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const submitExamBtn = document.getElementById('submit-exam-btn');
const exitBtn = document.getElementById('exit-btn');
const reviewExamBtn = document.getElementById('review-exam-btn');
const backToMenuBtn = document.getElementById('back-to-menu-btn');
const settingsBtn = document.getElementById('settings-btn');
const settingsDropdown = document.getElementById('settings-dropdown');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const sepiaModeToggle = document.getElementById('sepia-mode-toggle');
const sepiaSlider = document.getElementById('sepia-slider');
const sepiaControls = document.getElementById('sepia-controls');
const scrollTopBtn = document.getElementById('scroll-top-btn');
const currentModeEl = document.getElementById('current-mode');
const currentQuestionEl = document.getElementById('current-question');
const scoreEl = document.getElementById('score');
const correctCountEl = document.getElementById('correct-count');
const incorrectCountEl = document.getElementById('incorrect-count');

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    setupEventListeners();
    cargarDatos();
});

// Cargar datos del JSON
async function cargarDatos() {
    try {
        const response = await fetch('datos.json');
        if (!response.ok) throw new Error('No se pudo cargar el archivo JSON');
        datos = await response.json();
        console.log('✅ Datos cargados:', datos.version);
    } catch (error) {
        console.error('❌ Error:', error);
        alert('Error cargando los datos. Por favor, recarga la página.');
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Botones de modo
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mode = e.currentTarget.dataset.mode;
            startMode(mode);
        });
    });

    // Navegación
    prevBtn.addEventListener('click', () => navigateQuestion(-1));
    nextBtn.addEventListener('click', () => navigateQuestion(1));
    exitBtn.addEventListener('click', () => {
        if (confirm('¿Seguro que quieres salir? Perderás el progreso actual.')) {
            showStartScreen();
        }
    });
    submitExamBtn.addEventListener('click', finishCurrentExam);
    reviewExamBtn.addEventListener('click', reviewExam);
    backToMenuBtn.addEventListener('click', showStartScreen);

    // Settings
    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsDropdown.classList.toggle('active');
    });

    window.addEventListener('click', (e) => {
        if (!settingsDropdown.contains(e.target) && e.target !== settingsBtn) {
            settingsDropdown.classList.remove('active');
        }
    });

    // Scroll to top
    window.addEventListener('scroll', toggleScrollTopBtn);
    scrollTopBtn.addEventListener('click', scrollToTop);

    // Dark mode
    darkModeToggle.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        document.body.classList.toggle('dark-mode', isChecked);
        if (isChecked && sepiaModeToggle.checked) {
            sepiaModeToggle.checked = false;
            document.body.classList.remove('sepia-mode');
            sepiaControls.classList.add('hidden');
        }
        saveSettings();
    });

    // Sepia mode
    sepiaModeToggle.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        document.body.classList.toggle('sepia-mode', isChecked);
        sepiaControls.classList.toggle('hidden', !isChecked);
        if (isChecked && darkModeToggle.checked) {
            darkModeToggle.checked = false;
            document.body.classList.remove('dark-mode');
        }
        saveSettings();
    });

    sepiaSlider.addEventListener('input', (e) => {
        const val = e.target.value / 100;
        document.body.style.setProperty('--sepia-amount', val);
        saveSettings();
    });
}

// Funciones de configuración
function loadSettings() {
    const saved = localStorage.getItem('exam_settings');
    if (!saved) return;

    try {
        const settings = JSON.parse(saved);
        if (settings.darkMode) {
            darkModeToggle.checked = true;
            document.body.classList.add('dark-mode');
        }
        if (settings.sepiaMode) {
            sepiaModeToggle.checked = true;
            document.body.classList.add('sepia-mode');
            sepiaControls.classList.remove('hidden');
        }
        if (settings.sepiaIntensity) {
            sepiaSlider.value = settings.sepiaIntensity;
            document.body.style.setProperty('--sepia-amount', settings.sepiaIntensity / 100);
        }
    } catch (e) {
        console.error('Error loading settings', e);
    }
}

function saveSettings() {
    const settings = {
        darkMode: darkModeToggle.checked,
        sepiaMode: sepiaModeToggle.checked,
        sepiaIntensity: sepiaSlider.value
    };
    localStorage.setItem('exam_settings', JSON.stringify(settings));
}

// Funciones de navegación entre pantallas
function showStartScreen() {
    scrollToTop();
    hideAllSections();
    startScreen.classList.add('active');
    resetStats();
    currentModeEl.textContent = 'Inicio';
}

function hideAllSections() {
    document.querySelectorAll('.exam-section').forEach(el => el.classList.remove('active'));
}

function resetStats() {
    currentState = { score: 0, consecutiveIncorrect: 0, correct: 0, incorrect: 0 };
    updateStatsDisplay();
    currentQuestionEl.textContent = '0/0';
}

function updateStatsDisplay() {
    scoreEl.textContent = currentState.score.toFixed(2);
    correctCountEl.textContent = currentState.correct;
    incorrectCountEl.textContent = currentState.incorrect;
}

// Iniciar modo de examen
function startMode(mode) {
    if (!datos) {
        alert('Cargando datos... espera un momento');
        return;
    }

    scrollToTop();
    currentMode = mode;
    hideAllSections();
    examContainer.classList.add('active');

    // Configurar según el modo
    let preguntas = [];
    switch(mode) {
        case 'general':
            currentModeEl.textContent = 'General';
            preguntas = getQuestionsByCategory('all', 45);
            break;
        case 'experto':
            currentModeEl.textContent = 'Experto';
            preguntas = getQuestionsByDifficulty('avanzado', 20);
            break;
        default:
            currentModeEl.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
            preguntas = getQuestionsByCategory(mode, 15);
    }

    if (preguntas.length === 0) {
        alert('No hay preguntas suficientes para este modo aún');
        showStartScreen();
        return;
    }

    visibleQuestions = preguntas;
    userAnswers = new Array(visibleQuestions.length).fill(null);
    currentState = { score: 0, consecutiveIncorrect: 0, correct: 0, incorrect: 0 };
    renderQuestions();
    updateStatsDisplay();
}

// FUNCIÓN CORREGIDA - Ahora mantiene la referencia de la respuesta correcta
function getQuestionsByCategory(category, limit) {
    let pool = category === 'all' 
        ? datos.preguntas 
        : datos.preguntas.filter(q => q.categoria === category);
    
    // Primero seleccionamos las preguntas al azar
    let selected = shuffleArray(pool).slice(0, limit);
    
    // Luego para cada pregunta, mezclamos las opciones pero guardamos cuál es la correcta
    return selected.map(q => {
        // Clonamos la pregunta para no modificar el original
        let clonedQ = JSON.parse(JSON.stringify(q));
        
        // Guardamos el texto de la respuesta correcta original
        let correctText = clonedQ.opciones[clonedQ.respuesta_correcta];
        
        // Mezclamos las opciones
        let shuffledOptions = shuffleArray([...clonedQ.opciones]);
        
        // Buscamos el nuevo índice de la respuesta correcta
        let newCorrectIndex = shuffledOptions.indexOf(correctText);
        
        return {
            ...clonedQ,
            options: shuffledOptions,
            respuesta_correcta: newCorrectIndex // Actualizamos con el nuevo índice
        };
    });
}

// FUNCIÓN CORREGIDA - Igual para dificultad
function getQuestionsByDifficulty(difficulty, limit) {
    let pool = datos.preguntas.filter(q => q.nivel_dificultad === difficulty);
    let selected = shuffleArray(pool).slice(0, limit);
    
    return selected.map(q => {
        let clonedQ = JSON.parse(JSON.stringify(q));
        let correctText = clonedQ.opciones[clonedQ.respuesta_correcta];
        let shuffledOptions = shuffleArray([...clonedQ.opciones]);
        let newCorrectIndex = shuffledOptions.indexOf(correctText);
        
        return {
            ...clonedQ,
            options: shuffledOptions,
            respuesta_correcta: newCorrectIndex
        };
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Renderizar preguntas
function renderQuestions() {
    questionsContainer.innerHTML = '';
    visibleQuestions.forEach((q, index) => {
        const qEl = document.createElement('div');
        qEl.className = 'question-card fade-in';
        if (index !== 0) qEl.style.display = 'none';
        qEl.dataset.index = index;

        qEl.innerHTML = `
            <div class="question-header">
                <span class="question-number">#${index + 1}</span>
                <span class="question-text">${q.pregunta}</span>
            </div>
            <div class="options" role="radiogroup">
                ${q.options.map((opt, i) => `
                    <div class="option" data-idx="${i}" tabindex="0" role="button">
                        ${opt}
                    </div>
                `).join('')}
            </div>
            <div class="feedback" id="feedback-${index}"></div>
            <div class="hint-container">
                <button class="btn-hint" id="hint-btn-${index}">💡 Ver pista</button>
                <div class="hint-content hidden" id="hint-content-${index}">
                    ${q.tips ? '• ' + q.tips.join('<br>• ') : 'Sin pista disponible'}
                </div>
            </div>
        `;

        // Event listeners
        const hintBtn = qEl.querySelector(`#hint-btn-${index}`);
        const hintContent = qEl.querySelector(`#hint-content-${index}`);
        hintBtn.addEventListener('click', () => {
            hintContent.classList.toggle('hidden');
            hintBtn.textContent = hintContent.classList.contains('hidden') ? '💡 Ver pista' : '🙈 Ocultar pista';
        });

        qEl.querySelectorAll('.option').forEach((opt, i) => {
            opt.addEventListener('click', () => selectOption(index, i));
            opt.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectOption(index, i);
                }
            });
        });

        questionsContainer.appendChild(qEl);
    });
    updateNavigation(0);
    updateQuestionCounter();
    
    // DEBUG: Mostrar en consola las respuestas correctas para verificar
    console.log('📝 Preguntas cargadas con índices correctos:');
    visibleQuestions.forEach((q, i) => {
        console.log(`Pregunta ${i+1}: "${q.pregunta.substring(0, 30)}..." -> Correcta: "${q.options[q.respuesta_correcta]}" (índice ${q.respuesta_correcta})`);
    });
}

function selectOption(qIndex, optIndex) {
    if (userAnswers[qIndex] !== null) return;

    userAnswers[qIndex] = optIndex;
    const currentQ = visibleQuestions[qIndex];
    const isCorrect = (optIndex === currentQ.respuesta_correcta);

    const card = questionsContainer.children[qIndex];
    const opts = card.querySelectorAll('.option');
    const selectedOpt = opts[optIndex];
    const feedbackEl = card.querySelector('.feedback');

    // Marcar opciones
    selectedOpt.classList.add('selected');
    
    if (isCorrect) {
        selectedOpt.classList.add('correct');
        feedbackEl.innerHTML = `<strong>✅ ¡Correcto!</strong><br>${currentQ.explicacion}`;
        feedbackEl.className = 'feedback show correct';
        
        currentState.correct++;
        currentState.score += 0.33;
        currentState.consecutiveIncorrect = 0;
    } else {
        selectedOpt.classList.add('incorrect');
        opts[currentQ.respuesta_correcta].classList.add('correct');
        feedbackEl.innerHTML = `<strong>❌ Incorrecto</strong><br>${currentQ.explicacion}`;
        feedbackEl.className = 'feedback show incorrect';
        
        currentState.incorrect++;
        currentState.consecutiveIncorrect++;

        // Penalización por 3 incorrectas consecutivas
        if (currentState.consecutiveIncorrect >= 3) {
            currentState.score = Math.max(0, currentState.score - 0.33);
            currentState.consecutiveIncorrect = 0;
        }

        // Mostrar pista automáticamente
        const hintContent = card.querySelector('.hint-content');
        const hintBtn = card.querySelector('.btn-hint');
        hintContent.classList.remove('hidden');
        hintBtn.textContent = '🙈 Ocultar pista';
    }

    // Deshabilitar más interacciones
    opts.forEach(opt => {
        opt.style.pointerEvents = 'none';
        opt.style.cursor = 'default';
    });

    updateStatsDisplay();
    updateQuestionCounter();
}

function navigateQuestion(direction) {
    const currentCard = Array.from(questionsContainer.children).find(c => c.style.display !== 'none');
    const currIdx = parseInt(currentCard.dataset.index);
    const nextIdx = currIdx + direction;

    if (nextIdx >= 0 && nextIdx < visibleQuestions.length) {
        currentCard.style.display = 'none';
        questionsContainer.children[nextIdx].style.display = 'block';
        updateNavigation(nextIdx);
        updateQuestionCounter();
    }
}

function updateNavigation(index) {
    prevBtn.style.display = index === 0 ? 'none' : 'block';
    
    if (index === visibleQuestions.length - 1) {
        nextBtn.style.display = 'none';
        submitExamBtn.style.display = 'block';
    } else {
        nextBtn.style.display = 'block';
        submitExamBtn.style.display = 'none';
    }
}

function updateQuestionCounter() {
    const currentCard = Array.from(questionsContainer.children).find(c => c.style.display !== 'none');
    if (currentCard) {
        const currIdx = parseInt(currentCard.dataset.index);
        currentQuestionEl.textContent = `${currIdx + 1}/${visibleQuestions.length}`;
    }
}

function finishCurrentExam() {
    const correct = currentState.correct;
    const incorrect = currentState.incorrect;
    const percentage = Math.round((correct / visibleQuestions.length) * 100);

    showResults(correct, incorrect, currentState.score, percentage);
}

function showResults(correct, incorrect, score, percentage) {
    scrollToTop();
    hideAllSections();
    resultsScreen.classList.add('active');

    document.getElementById('exam-mode-name').textContent = currentModeEl.textContent;
    
    const circle = document.getElementById('score-circle');
    circle.textContent = `${percentage}%`;
    circle.className = 'score-circle';
    
    if (percentage >= 80) circle.classList.add('score-excellent');
    else if (percentage >= 50) circle.classList.add('score-good');
    else circle.classList.add('score-poor');

    document.getElementById('final-score').textContent = score.toFixed(2);
    
    let message = '';
    if (percentage >= 80) message = '¡Excelente! Tienes un gran conocimiento en seguridad.';
    else if (percentage >= 60) message = 'Bien, pero aún hay áreas que reforzar.';
    else message = 'Sigue practicando, la seguridad es importante.';
    document.getElementById('result-message').textContent = message;

    const resultsList = document.getElementById('results-list');
    resultsList.innerHTML = '';
    
    visibleQuestions.forEach((q, i) => {
        const item = document.createElement('div');
        item.className = 'result-item';
        const isCorrect = userAnswers[i] === q.respuesta_correcta;
        item.style.borderLeft = isCorrect ? '5px solid #4cc9f0' : '5px solid #f72585';

        item.innerHTML = `
            <div><strong>${i + 1}. ${q.pregunta}</strong></div>
            <div style="color: ${isCorrect ? '#4cc9f0' : '#f72585'}; margin: 5px 0;">
                Tu respuesta: ${q.options[userAnswers[i]] || 'Sin responder'} 
                ${isCorrect ? '✅' : '❌'}
            </div>
            ${!isCorrect ? `<div style="font-size: 0.9em; color: #666;">Tip: ${q.tips ? q.tips[0] : 'Estudia más sobre este tema'}</div>` : ''}
        `;
        resultsList.appendChild(item);
    });
}

function reviewExam() {
    scrollToTop();
    hideAllSections();
    examContainer.classList.add('active');

    Array.from(questionsContainer.children).forEach((card, i) => {
        card.style.display = i === 0 ? 'block' : 'none';
        
        const feedback = card.querySelector('.feedback');
        const isCorrect = userAnswers[i] === visibleQuestions[i].respuesta_correcta;
        feedback.className = `feedback show ${isCorrect ? 'correct' : 'incorrect'}`;
        feedback.innerHTML = isCorrect ? '✅ ¡Correcto!' : `❌ Incorrecto. ${visibleQuestions[i].explicacion}`;

        const opts = card.querySelectorAll('.option');
        opts.forEach((opt, idx) => {
            opt.classList.remove('selected', 'correct', 'incorrect');
            if (idx === visibleQuestions[i].respuesta_correcta) opt.classList.add('correct');
            if (idx === userAnswers[i] && !isCorrect) opt.classList.add('incorrect');
        });
    });

    updateNavigation(0);
    submitExamBtn.style.display = 'block';
    submitExamBtn.textContent = 'Volver a Resultados';
    submitExamBtn.onclick = () => {
        hideAllSections();
        resultsScreen.classList.add('active');
        submitExamBtn.onclick = finishCurrentExam;
    };
}

// Utilidades
function toggleScrollTopBtn() {
    if (window.scrollY > 300) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Funciones para admin (consola)
window.admin = {
    verDatos: () => console.log('📊 Datos:', datos),
    verPreguntasActuales: () => {
        console.log('📝 Preguntas visibles:');
        visibleQuestions.forEach((q, i) => {
            console.log(`${i+1}. "${q.pregunta.substring(0, 50)}..."`);
            console.log(`   Correcta: "${q.options[q.respuesta_correcta]}" (índice ${q.respuesta_correcta})`);
        });
    },
    resetearProgreso: () => {
        if (confirm('¿Resetear progreso?')) {
            localStorage.removeItem('exam_settings');
            location.reload();
        }
    }
};