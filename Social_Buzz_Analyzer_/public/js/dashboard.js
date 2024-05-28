document.addEventListener('DOMContentLoaded', function() {
    const dashboardForm = document.getElementById('dashboardForm');
    const widgetTypeSelect = document.getElementById('widgetType');
    const cryptoTickersSelect = document.getElementById('cryptoTickers');
    const layoutXInput = document.getElementById('layoutX');
    const layoutYInput = document.getElementById('layoutY');
    const layoutWInput = document.getElementById('layoutW');
    const layoutHInput = document.getElementById('layoutH');
    const dashboardContainer = document.getElementById('dashboardWidgets');

    // Function to post new widget configuration
    async function createWidget(widgetData) {
        try {
            const response = await fetch('/api/dashboard/widgets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(widgetData),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        } catch (error) {
            console.error('Error creating widget:', error);
            console.error('Error stack:', error.stack);
        }
    }

    // Function to get all widgets for the user
    async function fetchWidgets() {
        try {
            const response = await fetch('/api/dashboard/widgets');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const widgets = await response.json();
            renderWidgets(widgets);
        } catch (error) {
            console.error('Error fetching widgets:', error);
            console.error('Error stack:', error.stack);
        }
    }

    // Function to render widgets on the dashboard
    function renderWidgets(widgets) {
        dashboardContainer.innerHTML = ''; // Clear existing widgets
        widgets.forEach(widget => {
            const widgetElement = document.createElement('div');
            widgetElement.className = 'widget';
            widgetElement.id = `widget-${widget._id}`; // Assign an ID to each widget for the drag-and-drop functionality
            widgetElement.innerHTML = `<div><strong>Type:</strong> ${widget.widgetType}</div>
                                       <div><strong>Tickers:</strong> ${widget.cryptoTickers.join(', ')}</div>
                                       <button class="btn btn-danger delete-widget" data-widget-id="${widget._id}">Delete</button>`; // Added delete button
            dashboardContainer.appendChild(widgetElement);
        });
        attachDeleteEventListeners();
        initializeDragAndDrop();
    }

    // Attach event listeners to delete buttons
    function attachDeleteEventListeners() {
        document.querySelectorAll('.delete-widget').forEach(button => {
            button.addEventListener('click', async function() {
                const widgetId = this.getAttribute('data-widget-id');
                try {
                    const response = await fetch(`/api/dashboard/widgets/${widgetId}`, {
                        method: 'DELETE',
                    });
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    fetchWidgets(); // Refresh the dashboard widgets
                } catch (error) {
                    console.error('Error deleting widget:', error);
                    console.error('Error stack:', error.stack);
                }
            });
        });
    }

    // Submit event listener for the form
    dashboardForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const widgetData = {
            widgetType: widgetTypeSelect.value,
            cryptoTickers: [cryptoTickersSelect.value], // Simplified for this example
            layout: {
                x: layoutXInput.value,
                y: layoutYInput.value,
                w: layoutWInput.value,
                h: layoutHInput.value,
            },
        };
        const createdWidget = await createWidget(widgetData);
        if (createdWidget) {
            console.log('Widget created:', createdWidget);
            fetchWidgets(); // Refresh the dashboard widgets
        } else {
            console.error('Failed to create widget.');
        }
    });

    // Initial fetch of user's widgets
    fetchWidgets();

    // Initialize drag-and-drop functionality
    function initializeDragAndDrop() {
        new Sortable(dashboardContainer, {
            animation: 150,
            onEnd: async function(event) {
                const widgetId = event.item.id.replace('widget-', '');
                // Calculate new layout positions based on the actual positions of the widgets after drag-and-drop
                const newLayout = {
                    x: event.newDraggableIndex,
                    y: 0, // Assuming a single row layout for simplification
                    w: parseInt(document.getElementById(event.item.id).style.width),
                    h: parseInt(document.getElementById(event.item.id).style.height)
                };
                try {
                    const response = await fetch(`/api/dashboard/widgets/${widgetId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ layout: newLayout }),
                    });
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    console.log('Widget layout updated successfully.');
                } catch (error) {
                    console.error('Error updating widget layout:', error);
                    console.error('Error stack:', error.stack);
                }
            }
        });
    }
});