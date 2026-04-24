// ABOUTME: This file contains comprehensive end-to-end tests for the complete HexVex game
// ABOUTME: Tests cover full game workflows, all scoring scenarios, and UI/UX requirements

/**
 * End-to-End Test Suite for HexVex
 * Tests complete game flow scenarios and all specification requirements
 */

// Test helper functions
function simulateClick(element) {
    const event = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
    });
    element.dispatchEvent(event);
}

function waitForDOMUpdate() {
    return new Promise(resolve => setTimeout(resolve, 10));
}

function resetGameForTest() {
    // Reset global game state
    if (typeof window !== 'undefined') {
        window.currentScore = 0;
        window.currentQuestion = null;
        window.hintUsed = false;
        window.guessesMade = 0;
    }
    
    // Clear DOM
    const questionArea = document.getElementById('question-area');
    const optionsArea = document.getElementById('options-area');
    const feedbackText = document.getElementById('feedback-text');
    const scoreDisplay = document.getElementById('score-display');
    const hintButton = document.getElementById('hint-button');
    const newGameButton = document.getElementById('new-game-button');
    
    if (questionArea) questionArea.innerHTML = '';
    if (optionsArea) optionsArea.innerHTML = '';
    if (feedbackText) feedbackText.innerHTML = '';
    if (scoreDisplay) scoreDisplay.textContent = 'YOUR SCORE: 0';
    if (hintButton) {
        hintButton.style.display = 'inline-block';
        hintButton.disabled = false;
        hintButton.textContent = 'Show Hint';
    }
    if (newGameButton) newGameButton.style.display = 'none';
}

/**
 * Complete Game Flow Tests
 */

// Test: Load page → first question appears → all elements visible
function testPageLoadAndFirstQuestion() {
    console.log('Testing: Page load and first question generation...');
    
    resetGameForTest();
    
    // Initialize app
    initApp();
    
    // Verify score display
    const scoreEl = document.getElementById('score-display');
    if (!scoreEl || scoreEl.textContent !== 'YOUR SCORE: 0') {
        throw new Error('Score display not initialized correctly');
    }
    
    // Verify question area has content
    const questionArea = document.getElementById('question-area');
    if (!questionArea || questionArea.children.length === 0) {
        throw new Error('Question area not populated');
    }
    
    // Verify options area has 4 options
    const optionsArea = document.getElementById('options-area');
    if (!optionsArea || optionsArea.children.length !== 4) {
        throw new Error('Options area should have exactly 4 options');
    }
    
    // Verify hint button is visible and enabled
    const hintButton = document.getElementById('hint-button');
    if (!hintButton || hintButton.style.display === 'none' || hintButton.disabled) {
        throw new Error('Hint button should be visible and enabled');
    }
    
    // Verify new game button is hidden
    const newGameButton = document.getElementById('new-game-button');
    if (!newGameButton || newGameButton.style.display !== 'none') {
        throw new Error('New game button should be hidden initially');
    }
    
    console.log('✓ Page load and first question test passed');
}

// Test: Complete question correctly → score updates → new game loads
async function testCorrectAnswerFlow() {
    console.log('Testing: Correct answer flow...');
    
    resetGameForTest();
    initApp();
    await waitForDOMUpdate();
    
    const initialScore = window.currentScore;
    
    // Find and click the correct answer
    const optionsArea = document.getElementById('options-area');
    let correctOption = null;
    
    for (let option of optionsArea.children) {
        if (option.dataset.isCorrect === 'true') {
            correctOption = option;
            break;
        }
    }
    
    if (!correctOption) {
        throw new Error('No correct option found');
    }
    
    // Click correct answer
    simulateClick(correctOption);
    await waitForDOMUpdate();
    
    // Verify score increased
    if (window.currentScore <= initialScore) {
        throw new Error('Score should have increased after correct answer');
    }
    
    // Verify feedback shows correct message with points
    const feedbackText = document.getElementById('feedback-text');
    if (!feedbackText.textContent.includes('CORRECT!') || !feedbackText.textContent.includes('+')) {
        throw new Error('Feedback should show CORRECT! with points awarded');
    }
    
    // Verify new game button appears
    const newGameButton = document.getElementById('new-game-button');
    if (newGameButton.style.display === 'none') {
        throw new Error('New game button should be visible after correct answer');
    }
    
    // Verify hint button is disabled
    const hintButton = document.getElementById('hint-button');
    if (!hintButton.disabled) {
        throw new Error('Hint button should be disabled after question completion');
    }
    
    console.log('✓ Correct answer flow test passed');
}

// Test: Complete question incorrectly → appropriate feedback → new game loads
async function testIncorrectAnswerFlow() {
    console.log('Testing: Incorrect answer flow...');
    
    resetGameForTest();
    initApp();
    await waitForDOMUpdate();
    
    // Find and click incorrect answers until question ends
    const optionsArea = document.getElementById('options-area');
    let guessCount = 0;
    
    while (guessCount < 3 && !document.getElementById('new-game-button').style.display.includes('inline')) {
        let incorrectOption = null;
        
        for (let option of optionsArea.children) {
            if (option.dataset.isCorrect === 'false') {
                incorrectOption = option;
                break;
            }
        }
        
        if (!incorrectOption) {
            break; // No more incorrect options available
        }
        
        simulateClick(incorrectOption);
        await waitForDOMUpdate();
        guessCount++;
        
        if (guessCount < 3) {
            // Verify "TRY AGAIN" feedback
            const feedbackText = document.getElementById('feedback-text');
            if (!feedbackText.innerHTML.includes('TRY AGAIN')) {
                throw new Error('Should show TRY AGAIN feedback for incorrect guess');
            }
        }
    }
    
    // After 3 incorrect guesses, should show final feedback
    if (guessCount === 3) {
        const feedbackText = document.getElementById('feedback-text');
        if (!feedbackText.textContent.includes('INCORRECT') || !feedbackText.textContent.includes('+0')) {
            throw new Error('Should show INCORRECT feedback with +0 after 3 wrong guesses');
        }
        
        // Verify new game button appears
        const newGameButton = document.getElementById('new-game-button');
        if (newGameButton.style.display === 'none') {
            throw new Error('New game button should appear after question ends');
        }
    }
    
    console.log('✓ Incorrect answer flow test passed');
}

// Test: Use hint → score adjustment → complete question
async function testHintUsageFlow() {
    console.log('Testing: Hint usage flow...');
    
    resetGameForTest();
    initApp();
    await waitForDOMUpdate();
    
    // Click hint button
    const hintButton = document.getElementById('hint-button');
    simulateClick(hintButton);
    await waitForDOMUpdate();
    
    // Verify hint button state changed
    if (!hintButton.disabled || hintButton.textContent !== 'Hint Shown') {
        throw new Error('Hint button should be disabled and show "Hint Shown"');
    }
    
    // Verify hint was applied (depends on question type)
    const questionType = window.currentQuestion.type;
    
    if (questionType === 'identify_color') {
        // Check if hex option buttons have colored hints
        const optionsArea = document.getElementById('options-area');
        let hasColoredHint = false;
        
        for (let option of optionsArea.children) {
            if (option.innerHTML.includes('span') && option.innerHTML.includes('color:')) {
                hasColoredHint = true;
                break;
            }
        }
        
        if (!hasColoredHint) {
            throw new Error('Hint should add colored spans to hex options');
        }
    } else if (questionType === 'identify_swatch') {
        // Check if main hex display has colored hints
        const questionArea = document.getElementById('question-area');
        const hexDisplay = questionArea.children[0];
        if (!hexDisplay.innerHTML.includes('span') || !hexDisplay.innerHTML.includes('color:')) {
            throw new Error('Hint should add colored spans to main hex display');
        }
    }
    
    // Now complete the question correctly
    const optionsArea = document.getElementById('options-area');
    let correctOption = null;
    
    for (let option of optionsArea.children) {
        if (option.dataset.isCorrect === 'true') {
            correctOption = option;
            break;
        }
    }
    
    simulateClick(correctOption);
    await waitForDOMUpdate();
    
    // Verify score is adjusted for hint usage (should be half of normal)
    const expectedScoreWithHint = 4; // First guess with hint = 8/2 = 4
    if (window.currentScore !== expectedScoreWithHint) {
        throw new Error(`Score with hint should be ${expectedScoreWithHint}, got ${window.currentScore}`);
    }
    
    console.log('✓ Hint usage flow test passed');
}

/**
 * All Scoring Scenarios Tests
 */

// Test all 8 scoring scenarios
async function testAllScoringScenarios() {
    console.log('Testing: All scoring scenarios...');
    
    const scenarios = [
        { guesses: 1, hint: false, expectedScore: 8, description: 'First guess correct (no hint)' },
        { guesses: 2, hint: false, expectedScore: 4, description: 'Second guess correct (no hint)' },
        { guesses: 3, hint: false, expectedScore: 2, description: 'Third guess correct (no hint)' },
        { guesses: 1, hint: true, expectedScore: 4, description: 'First guess correct (with hint)' },
        { guesses: 2, hint: true, expectedScore: 2, description: 'Second guess correct (with hint)' },
        { guesses: 3, hint: true, expectedScore: 1, description: 'Third guess correct (with hint)' },
        { guesses: 4, hint: false, expectedScore: 0, description: 'Three incorrect guesses (no hint)' },
        { guesses: 4, hint: true, expectedScore: 0, description: 'Three incorrect guesses (with hint)' }
    ];
    
    for (let scenario of scenarios) {
        console.log(`  Testing: ${scenario.description}...`);
        
        resetGameForTest();
        initApp();
        await waitForDOMUpdate();
        
        const initialScore = window.currentScore;
        
        // Use hint if required
        if (scenario.hint) {
            const hintButton = document.getElementById('hint-button');
            simulateClick(hintButton);
            await waitForDOMUpdate();
        }
        
        // Make guesses according to scenario
        const optionsArea = document.getElementById('options-area');
        let guessCount = 0;
        
        while (guessCount < scenario.guesses && !document.getElementById('new-game-button').style.display.includes('inline')) {
            let targetOption = null;
            
            if (guessCount + 1 === scenario.guesses && scenario.guesses <= 3) {
                // Final guess should be correct
                for (let option of optionsArea.children) {
                    if (option.dataset.isCorrect === 'true') {
                        targetOption = option;
                        break;
                    }
                }
            } else {
                // Make incorrect guess
                for (let option of optionsArea.children) {
                    if (option.dataset.isCorrect === 'false') {
                        targetOption = option;
                        break;
                    }
                }
            }
            
            if (!targetOption) break;
            
            simulateClick(targetOption);
            await waitForDOMUpdate();
            guessCount++;
        }
        
        // Verify score matches expected
        const actualScore = window.currentScore - initialScore;
        if (actualScore !== scenario.expectedScore) {
            throw new Error(`${scenario.description}: expected ${scenario.expectedScore}, got ${actualScore}`);
        }
        
        console.log(`  ✓ ${scenario.description} passed`);
    }
    
    console.log('✓ All scoring scenarios test passed');
}

/**
 * Color Distinctness Validation Tests
 */

// Test: Generate 100 questions, verify all color distances >= 75
function testColorDistinctnessValidation() {
    console.log('Testing: Color distinctness validation...');
    
    for (let i = 0; i < 100; i++) {
        const question = generateQuestion();
        
        // Get all colors in the question
        const colors = question.options.map(option => option.value);
        
        // Test all pairs for minimum distance
        for (let j = 0; j < colors.length; j++) {
            for (let k = j + 1; k < colors.length; k++) {
                const rgb1 = hexToRgb(colors[j]);
                const rgb2 = hexToRgb(colors[k]);
                const distance = calculateColorDistance(rgb1, rgb2);
                
                if (distance < 75) {
                    throw new Error(`Color distance ${distance} is below minimum threshold of 75 for colors ${colors[j]} and ${colors[k]} in question ${i + 1}`);
                }
            }
        }
    }
    
    console.log('✓ Color distinctness validation test passed');
}

/**
 * UI/UX Requirements Tests
 */

// Test visual design compliance
function testVisualDesignCompliance() {
    console.log('Testing: Visual design compliance...');
    
    resetGameForTest();
    initApp();
    
    // Test: White background
    const bodyStyle = window.getComputedStyle(document.body);
    const backgroundColor = bodyStyle.backgroundColor;
    if (backgroundColor !== 'rgb(255, 255, 255)' && backgroundColor !== '#ffffff' && backgroundColor !== 'white') {
        throw new Error('Body background should be white (#FFFFFF)');
    }
    
    // Test: Score displays in top-right corner
    const scoreDisplay = document.getElementById('score-display');
    const scoreStyle = window.getComputedStyle(scoreDisplay);
    if (scoreStyle.position !== 'absolute' || scoreStyle.top !== '20px' || scoreStyle.right !== '20px') {
        throw new Error('Score should be positioned absolutely in top-right corner');
    }
    
    // Test: Circular color swatches
    const questionArea = document.getElementById('question-area');
    if (questionArea.children.length > 0) {
        const swatch = questionArea.children[0];
        if (swatch.classList.contains('color-swatch')) {
            const swatchStyle = window.getComputedStyle(swatch);
            if (swatchStyle.borderRadius !== '50%') {
                throw new Error('Color swatches should be perfect circles (border-radius: 50%)');
            }
        }
    }
    
    // Test: Uppercase hex codes
    const optionsArea = document.getElementById('options-area');
    for (let option of optionsArea.children) {
        if (option.tagName === 'BUTTON') {
            const hexText = option.textContent;
            if (hexText !== hexText.toUpperCase()) {
                throw new Error('Hex codes should always be uppercase');
            }
        }
    }
    
    console.log('✓ Visual design compliance test passed');
}

/**
 * Viewport Containment Tests
 * Verify that all critical game elements remain visible without scrolling
 */

// Helper: check that an element's bottom edge is within the viewport
function assertWithinViewport(element, label) {
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    if (rect.bottom > viewportHeight) {
        throw new Error(`${label} extends below viewport (bottom: ${Math.round(rect.bottom)}px, viewport: ${viewportHeight}px)`);
    }
    if (rect.top < 0) {
        throw new Error(`${label} extends above viewport (top: ${Math.round(rect.top)}px)`);
    }
}

// Test: All critical elements fit within viewport during active gameplay
function testViewportContainmentDuringGameplay() {
    console.log('Testing: Viewport containment during gameplay...');

    resetGameForTest();
    initApp();

    const questionArea = document.getElementById('question-area');
    const optionsArea = document.getElementById('options-area');
    const feedbackArea = document.getElementById('feedback-area');
    const scoreDisplay = document.getElementById('score-display');

    assertWithinViewport(scoreDisplay, 'Score display');
    assertWithinViewport(questionArea, 'Question area');
    assertWithinViewport(optionsArea, 'Options area');
    assertWithinViewport(feedbackArea, 'Feedback area (hint button)');

    console.log('✓ Viewport containment during gameplay test passed');
}

// Test: Play Again button is within viewport after completing a question
async function testPlayAgainButtonWithinViewport() {
    console.log('Testing: Play Again button within viewport...');

    resetGameForTest();
    initApp();
    await waitForDOMUpdate();

    // Click the correct answer to end the question and reveal Play Again
    const optionsArea = document.getElementById('options-area');
    let correctOption = null;
    for (let option of optionsArea.children) {
        if (option.dataset.isCorrect === 'true') {
            correctOption = option;
            break;
        }
    }

    if (!correctOption) {
        throw new Error('No correct option found');
    }

    simulateClick(correctOption);
    await waitForDOMUpdate();

    const newGameButton = document.getElementById('new-game-button');
    if (newGameButton.style.display === 'none') {
        throw new Error('Play Again button should be visible after correct answer');
    }

    assertWithinViewport(newGameButton, 'Play Again button');

    console.log('✓ Play Again button within viewport test passed');
}

// Test: Body does not produce scrollable overflow
function testNoScrollableOverflow() {
    console.log('Testing: No scrollable overflow...');

    resetGameForTest();
    initApp();

    const bodyStyle = window.getComputedStyle(document.body);
    if (bodyStyle.overflow !== 'hidden') {
        throw new Error('Body overflow should be hidden to prevent scrolling');
    }

    if (document.body.scrollHeight > window.innerHeight + 1) {
        // Allow 1px tolerance for rounding
        throw new Error(`Body scroll height (${document.body.scrollHeight}px) exceeds viewport (${window.innerHeight}px)`);
    }

    console.log('✓ No scrollable overflow test passed');
}

// Test: Feedback area stays within viewport after 3 wrong answers (worst case for content height)
async function testViewportContainmentAfterWrongAnswers() {
    console.log('Testing: Viewport containment after wrong answers...');

    resetGameForTest();
    initApp();
    await waitForDOMUpdate();

    // Make 3 incorrect guesses
    const optionsArea = document.getElementById('options-area');
    let guessCount = 0;

    while (guessCount < 3) {
        let incorrectOption = null;
        for (let option of optionsArea.children) {
            if (option.dataset.isCorrect === 'false') {
                incorrectOption = option;
                break;
            }
        }
        if (!incorrectOption) break;

        simulateClick(incorrectOption);
        await waitForDOMUpdate();
        guessCount++;
    }

    const newGameButton = document.getElementById('new-game-button');
    if (newGameButton.style.display !== 'none') {
        assertWithinViewport(newGameButton, 'Play Again button after wrong answers');
    }

    const feedbackArea = document.getElementById('feedback-area');
    assertWithinViewport(feedbackArea, 'Feedback area after wrong answers');

    console.log('✓ Viewport containment after wrong answers test passed');
}

/**
 * Run all E2E tests
 */
function runAllE2ETests() {
    console.log('=== Running End-to-End Tests ===');

    try {
        // Complete Game Flow Tests
        testPageLoadAndFirstQuestion();
        testCorrectAnswerFlow();
        testIncorrectAnswerFlow();
        testHintUsageFlow();

        // Scoring Tests
        testAllScoringScenarios();

        // Validation Tests
        testColorDistinctnessValidation();
        testVisualDesignCompliance();

        // Viewport Containment Tests
        testViewportContainmentDuringGameplay();
        testPlayAgainButtonWithinViewport();
        testNoScrollableOverflow();
        testViewportContainmentAfterWrongAnswers();

        console.log('\n✅ All End-to-End tests passed!');
        return true;
    } catch (error) {
        console.error('\n❌ End-to-End test failed:', error.message);
        return false;
    }
}

// Export for browser usage
if (typeof window !== 'undefined') {
    window.runAllE2ETests = runAllE2ETests;
    window.e2eTests = {
        testPageLoadAndFirstQuestion,
        testCorrectAnswerFlow,
        testIncorrectAnswerFlow,
        testHintUsageFlow,
        testAllScoringScenarios,
        testColorDistinctnessValidation,
        testVisualDesignCompliance,
        testViewportContainmentDuringGameplay,
        testPlayAgainButtonWithinViewport,
        testNoScrollableOverflow,
        testViewportContainmentAfterWrongAnswers
    };
}