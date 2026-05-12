/*
    PUP ITech Feedback System Script
    - Handles section navigation and display state.
    - Validates consent and submits form data to Firestore.
    - Loads survey responses for the Results page.
*/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";


// Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyBgTr-cByidGG54_rjJGoMGZHL6_aAWEdO",
    authDomain: "itech-survey-form-database.firebaseapp.com",
    projectId: "itech-survey-form-database",
    storageBucket: "itech-survey-form-database.firebasestorage.app",
    messagingSenderId: "386902674261",
    appId: "1:386902674261:web:fad872eaf0eac211a1bddc",
    measurementId: "G-2P22516MTX"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// Section visibility helper
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    const target = document.getElementById(sectionId);
    if (target) target.classList.add('active');


    const consent = document.getElementById('consentdiv');
    if (consent) consent.style.display = (sectionId === 'consentdiv') ? 'block' : 'none';


    const floatBtn = document.getElementById('surveybtn');
    if (floatBtn) floatBtn.style.display = (sectionId === 'surveydiv' || sectionId === 'consentdiv') ? 'none' : 'block';


    if (sectionId === 'resultdiv') loadResults();
}


// Setup page event listeners after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('homeBtn')?.addEventListener('click', () => showSection('homediv'));
    document.getElementById('resultsBtn')?.addEventListener('click', () => showSection('resultdiv'));
    document.getElementById('aboutBtn')?.addEventListener('click', () => showSection('aboutdiv'));
    document.getElementById('surveybtn')?.addEventListener('click', () => showSection('consentdiv'));


    document.getElementById('proceedbtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        const consentCheckbox = document.getElementById('consentCheckbox');
        if (!consentCheckbox.checked) {
            alert("Please agree to the Privacy Consent first.");
            consentCheckbox.focus();
            return;
        }
        showSection('surveydiv');
    });
});


// Submission handler for the survey form
const submitBtn = document.getElementById('submitbtn');
submitBtn.addEventListener('click', async (e) => {
    e.preventDefault();


    const issueCheckboxes = document.querySelectorAll('input[name="issues[]"]:checked');
    const selectedIssues = Array.from(issueCheckboxes).map(cb => cb.parentElement.textContent.trim());
    const issuesOther = document.querySelector('input[name="issues_other"]').value;


    const favoriteSpot = document.querySelector('input[name="q2r1"]:checked')?.parentElement.textContent.trim() || "None";


    const preferenceCheckboxes = document.querySelectorAll('input[name="preference[]"]:checked');
    const preferences = Array.from(preferenceCheckboxes).map(cb => cb.parentElement.textContent.trim());


    const getRadioValue = (name) =>
        document.querySelector(`input[name="${name}"]:checked`)?.parentElement.textContent.trim() || "No Rating";


    const feedbackData = {
        name: document.getElementById('anon').checked ? "Anonymous" : document.getElementById('name').value,
        email: document.getElementById('email').value,
        classroomIssues: selectedIssues,
        classroomIssuesOther: issuesOther,
        favoriteSpot: favoriteSpot,
        factorsForPreference: preferences,
        improvement: Array.from(document.querySelectorAll('input[name="improvement[]"]:checked')).map(cb => cb.parentElement.textContent.trim()),
        challenges: Array.from(document.querySelectorAll('input[name="challenges[]"]:checked')).map(cb => cb.parentElement.textContent.trim()),
        crMaintenance: getRadioValue('q5r3'),
        crFixtures: getRadioValue('q6r3'),
        crPrivacy: getRadioValue('q7r3'),
        crWaterSupply: getRadioValue('q8r3'),
        instructorAbility: getRadioValue('q9r'),
        curriculumFocus: getRadioValue('q10r'),
        workEthics: getRadioValue('q11r3'),
        suggestion: document.getElementById('q12c1').value,
        submittedAt: new Date()
    };


    try {
        await addDoc(collection(db, "responses"), feedbackData);
        alert("Full feedback submitted successfully!");
        showSection('resultdiv');
    } catch (error) {
        console.error("Submission Error: ", error);
    }
});


// Load results from Firestore and render cards
async function loadResults() {
    const tableBody = document.getElementById('tableBody');
    if (!tableBody) return;


    try {
        const querySnapshot = await getDocs(collection(db, "responses"));
        tableBody.innerHTML = "";


        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const getVal = (val) => (!val ? "No answer" : Array.isArray(val) ? val.join(", ") : val);


            const responseCard = `
                <div class="response-profile" style="background: rgba(255,255,255,0.1); border: 1px solid #fff; padding: 20px; margin-bottom: 20px; border-radius: 8px; color: white; text-align: left;">
                  <h3 style="color: #ffcc00; margin: 0;">Name: ${data.name || "Anonymous"}</h3>
                  <p style="margin: 5px 0 15px 0;"><strong>Email:</strong> ${data.email || "N/A"}</p>
                  <hr style="border: 0.5px solid rgba(255,255,255,0.3);">
                  <div style="font-size: 0.9em; line-height: 1.6;">
                    <p><strong>1. Environment:</strong> ${getVal(data.classroomIssues)}</p>
                    <p><strong>2. Hangout:</strong> ${getVal(data.favoriteSpot)}</p>
                    <p><strong>3. Lab Improvement:</strong> ${getVal(data.improvement)}</p>
                    <p><strong>4. Lab Challenges:</strong> ${getVal(data.challenges)}</p>
                    <p><strong>5. CR Cleanliness:</strong> ${getVal(data.crMaintenance)}</p>
                    <p><strong>6. CR Fixtures:</strong> ${getVal(data.crFixtures)}</p>
                    <p><strong>7. CR Privacy:</strong> ${getVal(data.crPrivacy)}</p>
                    <p><strong>8. Water/Tabo:</strong> ${getVal(data.crWaterSupply)}</p>
                    <p><strong>9. Instructor Ability:</strong> ${getVal(data.instructorAbility)}</p>
                    <p><strong>10. Curriculum Focus:</strong> ${getVal(data.curriculumFocus)}</p>
                    <p><strong>11. Work Ethics:</strong> ${getVal(data.workEthics)}</p>
                    <p><strong>12. Changes/Suggestions:</strong> ${getVal(data.suggestion)}</p>
                  </div>
                  <p style="font-size: 0.7em; opacity: 0.6; margin-top: 15px;">Submitted: ${data.submittedAt ? data.submittedAt.toDate().toLocaleString() : "N/A"}</p>
                </div>
            `;
            tableBody.innerHTML += `<tr><td>${responseCard}</td></tr>`;
        });
    } catch (error) {
        console.error("Error loading results:", error);
    }
}


window.showSection = showSection;





