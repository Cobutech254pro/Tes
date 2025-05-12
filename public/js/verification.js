document.addEventListener('DOMContentLoaded', function() {
    const codeBoxesContainer = document.querySelector('.code-input-container');
    const codeBoxes = document.querySelectorAll('.code-box');
    const resendButton = document.getElementById('resend-code-button');
    const resendCountdownElement = document.getElementById('resend-countdown');
    const attemptsLeftElement = document.getElementById('attempts-left');
    const waitMessageElement = document.getElementById('wait-message');
    const waitCountdownElement = document.getElementById('wait-countdown');

    let verificationCode = "123456"; // Replace with code from backend (for now)
    let attempts = 3;
    let resendAvailableIn = 20;
    let resendInterval;
    let waitPeriod = 24 * 60 * 60; // 24 hours in seconds
    let waitInterval;
    let canRequestCode = true;
    let verificationBlocked = false; // Flag to track if verification is blocked

    // Focus on the first input box on load
    codeBoxes[0].focus();

    // Function to update attempt count display and handle blocking
    function updateAttempts() {
        attemptsLeftElement.textContent = `Attempts left: ${attempts}`;
        if (attempts === 0 && !verificationBlocked) {
            verificationBlocked = true;
            canRequestCode = false;
            resendButton.disabled = true;
            document.getElementById('request-code-message').style.display = 'none';
            waitMessageElement.style.display = 'block';
            codeBoxesContainer.style.display = 'none'; // Hide the input boxes
            const blockedSymbol = document.createElement('div');
            blockedSymbol.textContent = '⛔';
            blockedSymbol.style.fontSize = '5em';
            blockedSymbol.color = 'red';
            codeBoxesContainer.parentNode.insertBefore(blockedSymbol, codeBoxesContainer);
            startWaitCountdown();
        }
    }

    // Function to start the resend countdown
    function startResendCountdown() {
        resendButton.disabled = true;
        resendAvailableIn = 20;
        resendCountdownElement.textContent = resendAvailableIn;
        document.getElementById('request-code-message').style.display = 'block';
        resendInterval = setInterval(() => {
            resendAvailableIn--;
            resendCountdownElement.textContent = resendAvailableIn;
            if (resendAvailableIn === 0 && canRequestCode) {
                clearInterval(resendInterval);
                resendButton.disabled = false;
                resendCountdownElement.textContent = "Ready";
            }
        }, 1000);
    }

    // Function to start the 24-hour wait countdown
    function startWaitCountdown() {
        let remainingTime = waitPeriod;
        waitCountdownElement.textContent = formatTime(remainingTime);
        waitInterval = setInterval(() => {
            remainingTime--;
            waitCountdownElement.textContent = formatTime(remainingTime);
            if (remainingTime <= 0) {
                clearInterval(waitInterval);
                attempts = 3;
                canRequestCode = true;
                verificationBlocked = false;
                updateAttempts();
                waitMessageElement.style.display = 'none';
                document.getElementById('request-code-message').style.display = 'block';
                codeBoxesContainer.style.display = 'flex'; // Show the input boxes again
                const blockedSymbol = codeBoxesContainer.parentNode.querySelector('div');
                if (blockedSymbol && blockedSymbol.textContent === '⛔') {
                    blockedSymbol.remove(); // Remove the blocked symbol
                }
                startResendCountdown();
            }
        }, 1000);
    }

    // Helper function to format time (HH:MM:SS)
    function formatTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    // Event listener for input in the code boxes
    codeBoxes.forEach((box, index) => {
        box.addEventListener('input', function() {
            const currentBox = this;
            const nextBox = codeBoxes[index + 1];

            if (currentBox.value.length === 1 && nextBox) {
                nextBox.focus();
            }

            // Check if all boxes are filled
            const enteredCode = Array.from(codeBoxes)
                .map(box => box.value)
                .join('');

            if (enteredCode.length === 6 && !verificationBlocked) {
                verifyCode(enteredCode);
            }
        });

        // Prevent non-numeric input
        box.addEventListener('keypress', function(event) {
            const charCode = (event.which) ? event.which : event.keyCode;
            if (charCode < 48 || charCode > 57) {
                event.preventDefault();
            }
        });

        // Allow backspace to move to the previous box
        box.addEventListener('keydown', function(event) {
            if (event.key === 'Backspace' && this.value.length === 0 && index > 0) {
                codeBoxes[index - 1].focus();
            }
        });
    });

    // Function to simulate code verification (replace with API call)
    function verifyCode(enteredCode) {
        if (enteredCode === verificationCode) {
            codeBoxes.forEach(box => box.classList.add('correct'));
            alert('Account verified successfully!');
            // Redirect to dashboard or another page
            // window.location.href = '/dashboard.html';
        } else {
            codeBoxes.forEach(box => box.classList.add('incorrect'));
            setTimeout(() => {
                codeBoxes.forEach(box => box.classList.remove('incorrect'));
                codeBoxes[0].focus();
                codeBoxes.forEach(box => box.value = '');
            }, 1000);
            attempts--;
            updateAttempts();
        }
    }

    // Event listener for resend code button
    resendButton.addEventListener('click', function() {
        // TODO: Implement API call to resend verification code to the backend
        console.log('Resend code requested');
        startResendCountdown();
    });

    // Start the initial resend countdown
    startResendCountdown();
});
