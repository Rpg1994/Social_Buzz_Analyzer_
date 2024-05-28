document.addEventListener('DOMContentLoaded', function() {
    const generateButton = document.getElementById('generateApiKey');
    const activateButton = document.getElementById('activateApiKey');
    const deactivateButton = document.getElementById('deactivateApiKey');
    const apiKeyDisplay = document.getElementById('apiKeyDisplay');

    const updateApiKeyDisplay = (apiKey) => {
        apiKeyDisplay.textContent = `Current API Key: ${apiKey ? apiKey : 'No API Key generated'}`;
    };

    generateButton.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/developer/key', { method: 'POST' });
            if (!response.ok) throw new Error('Failed to generate API key');
            const { apiKey } = await response.json();
            updateApiKeyDisplay(apiKey);
            activateButton.disabled = false;
            deactivateButton.disabled = false;
            console.log('API key generated successfully.');
        } catch (error) {
            console.error('Error generating API key:', error.message, error.stack);
        }
    });

    activateButton.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/developer/key/activate', { method: 'PUT' });
            if (!response.ok) throw new Error('Failed to activate API key');
            console.log('API key activated successfully');
        } catch (error) {
            console.error('Error activating API key:', error.message, error.stack);
        }
    });

    deactivateButton.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/developer/key/deactivate', { method: 'PUT' });
            if (!response.ok) throw new Error('Failed to deactivate API key');
            console.log('API key deactivated successfully');
        } catch (error) {
            console.error('Error deactivating API key:', error.message, error.stack);
        }
    });

    // Initially fetch the current API key if it exists
    (async () => {
        try {
            const response = await fetch('/api/developer/key/current');
            if (!response.ok) throw new Error('Failed to fetch current API key');
            const { apiKey } = await response.json();
            updateApiKeyDisplay(apiKey);
            activateButton.disabled = !apiKey;
            deactivateButton.disabled = !apiKey;
            console.log('Current API key fetched successfully.');
        } catch (error) {
            console.error('Error fetching current API key:', error.message, error.stack);
        }
    })();
});