// Aesthetic Polling App JavaScript - Fixed Version

class PollingApp {
    constructor() {
        // Application state
        this.currentScreen = 'homeScreen';
        this.currentPoll = null;        
        this.polls = new Map();
        this.userVotes = new Map();
        
        // Initialize with demo data
        this.initializeDemoData();
        
        // Wait for DOM to be ready, then bind events
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    initialize() {
        this.bindEvents();
        this.updateUI();
        console.log('Polling app initialized successfully');
    }

    // Initialize demo poll data
    initializeDemoData() {
        const demoPoll = {
            id: 'DEMO123',
            question: "What's your favorite programming language?",
            options: ['JavaScript', 'Python', 'Java', 'Go'],
            votes: [25, 30, 15, 10],
            allowMultiple: false,
            totalVotes: 80,
            created: new Date()
        };
        
        this.polls.set('DEMO123', demoPoll);
    }

    // Bind all event listeners
    bindEvents() {
        // Home screen buttons
        this.bindEvent('createPollBtn', 'click', () => this.showCreateScreen());
        this.bindEvent('joinPollBtn', 'click', () => this.showJoinScreen());
        this.bindEvent('demoPollBtn', 'click', () => this.joinDemoPoll());

        // Navigation buttons
        this.bindEvent('backFromCreate', 'click', () => this.showHomeScreen());
        this.bindEvent('backFromJoin', 'click', () => this.showHomeScreen());
        this.bindEvent('backFromVoting', 'click', () => this.showHomeScreen());
        this.bindEvent('backToHome', 'click', () => this.showHomeScreen());

        // Form submissions
        this.bindEvent('createForm', 'submit', (e) => this.handleCreatePoll(e));
        this.bindEvent('joinForm', 'submit', (e) => this.handleJoinPoll(e));
        this.bindEvent('votingForm', 'submit', (e) => this.handleVote(e));

        // Other buttons
        this.bindEvent('addOption', 'click', () => this.addOption());
        this.bindEvent('viewMyPoll', 'click', () => this.viewCreatedPoll());
        this.bindEvent('createAnother', 'click', () => this.showCreateScreen());
        this.bindEvent('copyPollId', 'click', () => this.copyPollId());
        this.bindEvent('voteAgain', 'click', () => this.showVotingScreen());
        this.bindEvent('newPoll', 'click', () => this.showCreateScreen());
        this.bindEvent('shareResults', 'click', () => this.shareResults());

        // Handle option removal delegation
        const optionsContainer = document.getElementById('optionsContainer');
        if (optionsContainer) {
            optionsContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('btn--remove')) {
                    this.removeOption(e.target);
                }
            });
        }
    }

    // Helper method to safely bind events
    bindEvent(elementId, event, handler) {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener(event, handler);
        } else {
            console.warn(`Element with ID '${elementId}' not found`);
        }
    }

    // Screen navigation methods
    showScreen(screenId) {
        console.log(`Switching to screen: ${screenId}`);
        
        // Hide all screens
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.classList.remove('screen--active');
        });
        
        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('screen--active');
            this.currentScreen = screenId;
            console.log(`Successfully switched to screen: ${screenId}`);
        } else {
            console.error(`Screen '${screenId}' not found`);
        }
    }

    showHomeScreen() {
        this.showScreen('homeScreen');
        this.currentPoll = null;
    }

    showCreateScreen() {
        this.showScreen('createScreen');
        this.resetCreateForm();
    }

    showJoinScreen() {
        this.showScreen('joinScreen');
        this.resetJoinForm();
    }

    showSuccessScreen(pollId) {
        const pollIdElement = document.getElementById('generatedPollId');
        if (pollIdElement) {
            pollIdElement.textContent = pollId;
        }
        this.showScreen('successScreen');
    }

    showVotingScreen() {
        if (this.currentPoll) {
            this.setupVotingInterface();
            this.showScreen('votingScreen');
        } else {
            console.error('No current poll set for voting screen');
            this.showNotification('Error loading poll', 'error');
        }
    }

    showResultsScreen() {
        if (this.currentPoll) {
            this.setupResultsInterface();
            this.showScreen('resultsScreen');
        } else {
            console.error('No current poll set for results screen');
            this.showNotification('Error loading results', 'error');
        }
    }

    // Join demo poll
    joinDemoPoll() {
        console.log('Joining demo poll');
        const demoPoll = this.polls.get('DEMO123');
        if (demoPoll) {
            this.currentPoll = demoPoll;
            this.showVotingScreen();
            this.showNotification('Joined demo poll!', 'success');
        } else {
            console.error('Demo poll not found');
            this.showNotification('Demo poll not available', 'error');
        }
    }

    // Create poll functionality
    handleCreatePoll(e) {
        e.preventDefault();
        console.log('Creating new poll');
        
        // Get form values
        const questionInput = document.getElementById('pollQuestion');
        const allowMultipleInput = document.getElementById('allowMultiple');
        
        if (!questionInput || !allowMultipleInput) {
            console.error('Form elements not found');
            this.showNotification('Form error', 'error');
            return;
        }
        
        const question = questionInput.value.trim();
        const allowMultiple = allowMultipleInput.checked;
        
        // Get options
        const optionInputs = document.querySelectorAll('#optionsContainer .form-control');
        const options = Array.from(optionInputs)
            .map(input => input.value.trim())
            .filter(option => option.length > 0);

        // Validation
        if (!question) {
            this.showNotification('Please enter a poll question', 'error');
            return;
        }

        if (options.length < 2) {
            this.showNotification('Please provide at least 2 options', 'error');
            return;
        }

        // Create poll
        const pollId = this.generatePollId();
        const poll = {
            id: pollId,
            question: question,
            options: options,
            votes: new Array(options.length).fill(0),
            allowMultiple: allowMultiple,
            totalVotes: 0,
            created: new Date()
        };

        // Save poll
        this.polls.set(pollId, poll);
        this.currentPoll = poll;

        // Show success screen
        this.showSuccessScreen(pollId);
        this.showNotification('Poll created successfully!', 'success');
    }

    // Join poll functionality
    handleJoinPoll(e) {
        e.preventDefault();
        console.log('Joining poll');
        
        const pollIdInput = document.getElementById('pollId');
        if (!pollIdInput) {
            console.error('Poll ID input not found');
            return;
        }
        
        const pollId = pollIdInput.value.trim().toUpperCase();
        
        if (!pollId) {
            this.showNotification('Please enter a poll ID', 'error');
            return;
        }

        const poll = this.polls.get(pollId);
        if (!poll) {
            this.showNotification('Poll not found. Please check the poll ID.', 'error');
            return;
        }

        this.currentPoll = poll;
        this.showVotingScreen();
        this.showNotification('Joined poll successfully!', 'success');
    }

    // Setup voting interface
    setupVotingInterface() {
        if (!this.currentPoll) {
            console.error('No current poll to setup voting interface');
            return;
        }

        console.log('Setting up voting interface for poll:', this.currentPoll.id);

        const questionEl = document.getElementById('votingQuestion');
        const pollIdEl = document.getElementById('currentPollId');
        const optionsEl = document.getElementById('votingOptions');

        if (questionEl) {
            questionEl.textContent = this.currentPoll.question;
        }
        
        if (pollIdEl) {
            pollIdEl.textContent = this.currentPoll.id;
        }

        if (optionsEl) {
            optionsEl.innerHTML = '';
            
            this.currentPoll.options.forEach((option, index) => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'voting-option';
                
                const inputType = this.currentPoll.allowMultiple ? 'checkbox' : 'radio';
                const inputId = `option${index}`;
                
                optionDiv.innerHTML = `
                    <input type="${inputType}" 
                           id="${inputId}" 
                           name="pollOption" 
                           value="${index}">
                    <label class="voting-option__label" for="${inputId}">${option}</label>
                `;
                
                // Add click handler for the entire option div
                optionDiv.addEventListener('click', (e) => {
                    if (e.target.tagName !== 'INPUT') {
                        const input = optionDiv.querySelector('input');
                        if (input) {
                            if (inputType === 'radio') {
                                input.checked = true;
                            } else {
                                input.checked = !input.checked;
                            }
                        }
                    }
                    this.updateVotingOptionStyles();
                });
                
                optionsEl.appendChild(optionDiv);
            });
        }
    }

    // Update voting option visual styles based on selection
    updateVotingOptionStyles() {
        const options = document.querySelectorAll('.voting-option');
        options.forEach(option => {
            const input = option.querySelector('input');
            if (input && input.checked) {
                option.classList.add('voting-option--selected');
            } else {
                option.classList.remove('voting-option--selected');
            }
        });
    }

    // Handle voting
    handleVote(e) {
        e.preventDefault();
        console.log('Submitting vote');
        
        if (!this.currentPoll) {
            console.error('No current poll for voting');
            return;
        }

        let selectedOptions = [];

        if (this.currentPoll.allowMultiple) {
            // Get all checked options for multiple selection
            const checkboxes = document.querySelectorAll('input[name="pollOption"]:checked');
            selectedOptions = Array.from(checkboxes).map(cb => parseInt(cb.value));
        } else {
            // Get single selected option
            const radioButton = document.querySelector('input[name="pollOption"]:checked');
            if (radioButton) {
                selectedOptions = [parseInt(radioButton.value)];
            }
        }

        if (selectedOptions.length === 0) {
            this.showNotification('Please select at least one option', 'error');
            return;
        }

        // Record vote
        selectedOptions.forEach(optionIndex => {
            if (optionIndex >= 0 && optionIndex < this.currentPoll.votes.length) {
                this.currentPoll.votes[optionIndex]++;
                this.currentPoll.totalVotes++;
            }
        });

        // Save user vote to prevent duplicate voting
        this.userVotes.set(this.currentPoll.id, selectedOptions);

        // Show results
        this.showResultsScreen();
        this.showNotification('Vote submitted successfully!', 'success');
    }

    // Setup results interface
    setupResultsInterface() {
        if (!this.currentPoll) {
            console.error('No current poll to setup results interface');
            return;
        }

        console.log('Setting up results interface for poll:', this.currentPoll.id);

        const questionEl = document.getElementById('resultsQuestion');
        const pollIdEl = document.getElementById('resultsPollId');
        const totalVotesEl = document.getElementById('totalVotes');
        const chartEl = document.getElementById('resultsChart');

        if (questionEl) {
            questionEl.textContent = this.currentPoll.question;
        }
        
        if (pollIdEl) {
            pollIdEl.textContent = this.currentPoll.id;
        }
        
        if (totalVotesEl) {
            const total = this.currentPoll.totalVotes;
            totalVotesEl.textContent = `${total} vote${total === 1 ? '' : 's'}`;
        }

        if (chartEl) {
            chartEl.innerHTML = '';
            
            this.currentPoll.options.forEach((option, index) => {
                const votes = this.currentPoll.votes[index];
                const percentage = this.currentPoll.totalVotes > 0 
                    ? Math.round((votes / this.currentPoll.totalVotes) * 100) 
                    : 0;

                const resultDiv = document.createElement('div');
                resultDiv.className = 'result-item';
                resultDiv.innerHTML = `
                    <div class="result-item__label">${option}</div>
                    <div class="result-item__bar">
                        <div class="result-item__fill" style="width: ${percentage}%"></div>
                    </div>
                    <div class="result-item__percentage">${percentage}%</div>
                    <div class="result-item__votes">${votes} vote${votes === 1 ? '' : 's'}</div>
                `;
                chartEl.appendChild(resultDiv);
            });
        }
    }

    // View created poll (from success screen)
    viewCreatedPoll() {
        if (this.currentPoll) {
            this.showResultsScreen();
        } else {
            console.error('No current poll to view');
            this.showNotification('Error loading poll', 'error');
        }
    }

    // Utility methods
    generatePollId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    copyPollId() {
        const pollIdElement = document.getElementById('generatedPollId');
        if (!pollIdElement) {
            this.showNotification('Poll ID not found', 'error');
            return;
        }
        
        const pollId = pollIdElement.textContent;
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(pollId).then(() => {
                this.showNotification('Poll ID copied to clipboard!', 'success');
            }).catch(() => {
                this.fallbackCopy(pollId);
            });
        } else {
            this.fallbackCopy(pollId);
        }
    }

    fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                this.showNotification('Poll ID copied to clipboard!', 'success');
            } else {
                this.showNotification('Failed to copy poll ID', 'error');
            }
        } catch (err) {
            this.showNotification('Failed to copy poll ID', 'error');
        }
        
        document.body.removeChild(textArea);
    }

    shareResults() {
        if (!this.currentPoll) return;
        
        const shareText = `Check out the results of this poll: "${this.currentPoll.question}" - Poll ID: ${this.currentPoll.id}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Poll Results',
                text: shareText,
                url: window.location.href
            }).catch(() => {
                this.fallbackShare(shareText);
            });
        } else {
            this.fallbackShare(shareText);
        }
    }

    fallbackShare(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                this.showNotification('Share text copied to clipboard!', 'success');
            });
        } else {
            this.showNotification('Share functionality not available', 'error');
        }
    }

    // Form management
    resetCreateForm() {
        const form = document.getElementById('createForm');
        if (form) {
            form.reset();
            
            // Reset options to default 2
            const container = document.getElementById('optionsContainer');
            if (container) {
                container.innerHTML = `
                    <div class="option-input">
                        <input type="text" class="form-control" placeholder="Option 1" required maxlength="100">
                        <button type="button" class="btn btn--remove" disabled>×</button>
                    </div>
                    <div class="option-input">
                        <input type="text" class="form-control" placeholder="Option 2" required maxlength="100">
                        <button type="button" class="btn btn--remove" disabled>×</button>
                    </div>
                `;
                this.updateRemoveButtons();
            }
        }
    }

    resetJoinForm() {
        const form = document.getElementById('joinForm');
        if (form) {
            form.reset();
        }
    }

    addOption() {
        const container = document.getElementById('optionsContainer');
        if (!container) return;

        const currentOptions = container.children.length;
        if (currentOptions >= 6) {
            this.showNotification('Maximum 6 options allowed', 'error');
            return;
        }

        const optionDiv = document.createElement('div');
        optionDiv.className = 'option-input';
        optionDiv.innerHTML = `
            <input type="text" class="form-control" placeholder="Option ${currentOptions + 1}" required maxlength="100">
            <button type="button" class="btn btn--remove">×</button>
        `;
        
        container.appendChild(optionDiv);
        this.updateRemoveButtons();
        
        // Focus on new input
        const newInput = optionDiv.querySelector('.form-control');
        if (newInput) {
            newInput.focus();
        }
    }

    removeOption(button) {
        const container = document.getElementById('optionsContainer');
        if (!container) return;

        if (container.children.length <= 2) {
            this.showNotification('Minimum 2 options required', 'error');
            return;
        }

        const optionDiv = button.closest('.option-input');
        if (optionDiv) {
            optionDiv.remove();
            this.updateOptionPlaceholders();
            this.updateRemoveButtons();
        }
    }

    updateRemoveButtons() {
        const container = document.getElementById('optionsContainer');
        if (!container) return;

        const removeButtons = container.querySelectorAll('.btn--remove');
        const canRemove = container.children.length > 2;

        removeButtons.forEach(button => {
            button.disabled = !canRemove;
        });
    }

    updateOptionPlaceholders() {
        const container = document.getElementById('optionsContainer');
        if (!container) return;

        const inputs = container.querySelectorAll('.form-control');
        inputs.forEach((input, index) => {
            input.placeholder = `Option ${index + 1}`;
        });
    }

    // Notification system
    showNotification(message, type = 'info') {
        console.log(`Notification: ${message} (${type})`);
        
        const container = document.getElementById('notifications');
        if (!container) {
            console.warn('Notifications container not found');
            return;
        }

        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.textContent = message;

        container.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    
    updateUI() {
        
        console.log('UI updated');
    }

    
    getPoll(pollId) {
        return this.polls.get(pollId);
    }

    getAllPolls() {
        return Array.from(this.polls.values());
    }

    getCurrentPoll() {
        return this.currentPoll;
    }

    hasUserVoted(pollId) {
        return this.userVotes.has(pollId);
    }
}


let pollingApp = null;

function initializeApp() {
    console.log('Initializing Aesthetic Polling App...');
    
    try {
        pollingApp = new PollingApp();
        window.pollingApp = pollingApp;
        console.log('App initialized successfully!');
    } catch (error) {
        console.error('Failed to initialize app:', error);
    }
}


initializeApp();

