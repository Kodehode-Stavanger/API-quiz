async function getQuizData() {
  try {
    const result = await fetch("https://opentdb.com/api.php?amount=10");
    const data = await result.json();

    // Decode HTML entities in the JSON data
    for (let i = 0; i < data.results.length; i++) {
      data.results[i].question = decodeHtml(data.results[i].question);
      data.results[i].correct_answer = decodeHtml(
        data.results[i].correct_answer
      );
      data.results[i].incorrect_answers = data.results[i].incorrect_answers.map(
        (e) => decodeHtml(e)
      );
    }

    generateQuiz(data);
  } catch (error) {
    console.log(error.message);
  }
}

function decodeHtml(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

const quizContainer = document.querySelector("#quiz-container");
getQuizData();

function generateQuiz(data) {
  const form = document.createElement("form"); // Create form element
  data.results.forEach((e, index) => {
    const questionElem = document.createElement("div");
    questionElem.classList.add("question");
    questionElem.id = `question-${index}`;
    const questionTxt = document.createElement("p");
    questionTxt.textContent = e.question;
    const optionArray = fisherYatesShuffle([
      ...e.incorrect_answers,
      e.correct_answer,
    ]);

    // Generate options
    const optionsForm = document.createElement("div"); // Wrap options in a div
    optionArray.forEach((e) => {
      const optionElem = document.createElement("input");
      optionElem.type = "radio";
      optionElem.value = e;
      optionElem.name = "option" + index; // Unique name for each question
      optionElem.required = true; // Make option required
      const labelElem = document.createElement("label");
      labelElem.textContent = e;
      optionsForm.append(optionElem, labelElem);
    });
    // Appending
    questionElem.append(questionTxt, optionsForm);
    form.append(questionElem);
  });

  // Create and append the submit button
  const submitBtn = document.createElement("button");
  submitBtn.textContent = "Submit";
  form.append(submitBtn);
  quizContainer.append(form);

  // Add form submission event listener
  form.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent default form submission
    handleSubmit(data);
  });
}

function handleSubmit(data) {
  // Gather user's selected answers
  const selectedAnswers = [];
  const optionElements = document.querySelectorAll(
    "input[type='radio']:checked"
  );
  optionElements.forEach((element) => {
    selectedAnswers.push(element.value);
  });

  // Compare selected answers with correct answers to calculate score
  let score = 0;
  data.results.forEach((question, index) => {
    const questionElem = document.querySelector(`#question-${index}`);
    if (selectedAnswers[index] === question.correct_answer) {
      score++;
      questionElem.classList.add("correct-answer");
    } else {
      questionElem.classList.add("wrong-answer");
    }
  });

  // Display score to the user
  const scoreModal = document.createElement("dialog");
  scoreModal.classList.add("dialog-overlay");
  const modalContent = document.createElement("div");
  modalContent.classList.add("dialog-content");
  const scoreHeader = document.createElement("h3");
  scoreHeader.textContent = "Your score is:";
  const scoreText = document.createElement("p");
  scoreText.textContent = `${score}/10 correct answers`;
  const restartQuizButton = document.createElement("button");
  restartQuizButton.textContent = "Start new quiz";
  restartQuizButton.addEventListener("click", () => {
    location.reload();
  });
  modalContent.append(scoreHeader, scoreText, restartQuizButton);
  scoreModal.append(modalContent);
  document.body.append(scoreModal);
  scoreModal.showModal();
}

function fisherYatesShuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
