document.addEventListener('DOMContentLoaded', function () {
    const createAlertForm = document.getElementById('createAlertForm');
    const updateAlertForm = document.getElementById('updateAlertForm');
    const deleteAlertButtons = document.querySelectorAll('.deleteAlertButton');

    // Handle create alert form submission
    if (createAlertForm) {
        createAlertForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = new FormData(createAlertForm);
            const data = Object.fromEntries(formData);
            fetch('/api/alerts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to create alert');
                }
                return response.json();
            })
            .then(data => {
                console.log('Alert created:', data);
                window.location.reload(); // Reload the page to update the list of alerts
            })
            .catch((error) => {
                console.error('Error creating alert:', error);
            });
        });
    }

    // Handle update alert form submission
    if (updateAlertForm) {
        updateAlertForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = new FormData(updateAlertForm);
            const alertId = formData.get('alertId'); // Assuming there's an input with name 'alertId'
            const data = Object.fromEntries(formData);
            fetch(`/api/alerts/${alertId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update alert');
                }
                return response.json();
            })
            .then(data => {
                console.log('Alert updated:', data);
                window.location.reload(); // Reload the page to update the alert's details
            })
            .catch((error) => {
                console.error('Error updating alert:', error);
            });
        });
    }

    // Handle delete alert button clicks
    deleteAlertButtons.forEach(button => {
        button.addEventListener('click', function () {
            const alertId = this.dataset.alertId; // Assuming each button has 'data-alert-id' attribute
            fetch(`/api/alerts/${alertId}`, {
                method: 'DELETE',
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete alert');
                }
                console.log('Alert deleted successfully');
                window.location.reload(); // Reload the page to remove the deleted alert
            })
            .catch((error) => {
                console.error('Error deleting alert:', error);
            });
        });
    });
});