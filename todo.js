/**
 * Premium To-Do List Application
 * Modular JavaScript with localStorage persistence
 */

class TodoApp {
    constructor() {
        this.tasks = this.loadTasks();
        this.taskIdCounter = this.getNextId();
        this.currentFilter = 'all';
        this.init();
    }

    // Initialize application
    init() {
        this.clearSampleTasks();
        this.bindEvents();
        this.renderTasks();
        this.updateHighlights();
    }

    // Remove sample tasks from HTML
    clearSampleTasks() {
        document.getElementById('tasksContainer').innerHTML = '';
    }

    // Bind event listeners
    bindEvents() {
        const addBtn = document.getElementById('addTaskBtn');
        const taskInput = document.getElementById('taskInput');
        const filterBtns = document.querySelectorAll('.filter-btn');
        const tasksContainer = document.getElementById('tasksContainer');

        addBtn.addEventListener('click', () => this.addTask());
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.filterTasks(e.target.dataset.category));
        });

        tasksContainer.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                this.toggleTask(e.target.id);
            }
        });

        tasksContainer.addEventListener('click', (e) => {
            if (e.target.closest('.delete-btn')) {
                const taskId = e.target.closest('.task-item').querySelector('input').id;
                this.deleteTask(taskId);
            }
        });
    }

    // Add new task
    addTask() {
        const taskInput = document.getElementById('taskInput');
        const categorySelect = document.getElementById('categorySelect');
        const prioritySelect = document.getElementById('prioritySelect');

        const text = taskInput.value.trim();
        if (!text) return;

        const task = {
            id: `task${this.taskIdCounter++}`,
            text,
            category: categorySelect.value,
            priority: prioritySelect.value,
            completed: false,
            createdAt: Date.now()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        this.updateHighlights();

        taskInput.value = '';
        taskInput.focus();
    }

    // Toggle task completion
    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.updateTaskDisplay(taskId, task.completed);
            this.updateHighlights();
        }
    }

    // Update task display without full re-render
    updateTaskDisplay(taskId, completed) {
        const taskElement = document.getElementById(taskId).closest('.task-item');
        const taskText = taskElement.querySelector('.task-text');
        
        if (completed) {
            taskElement.classList.add('completed');
            taskText.style.textDecoration = 'line-through';
            taskText.style.opacity = '0.6';
        } else {
            taskElement.classList.remove('completed');
            taskText.style.textDecoration = 'none';
            taskText.style.opacity = '1';
        }
    }

    // Delete task with animation
    deleteTask(taskId) {
        const taskElement = document.getElementById(taskId).closest('.task-item');
        taskElement.style.animation = 'slideOut 0.3s ease';
        
        setTimeout(() => {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveTasks();
            this.renderTasks();
            this.updateHighlights();
        }, 300);
    }

    // Filter tasks by category
    filterTasks(category) {
        this.currentFilter = category;
        
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        this.applyCurrentFilter();
    }

    // Apply current filter to tasks
    applyCurrentFilter() {
        const taskItems = document.querySelectorAll('.task-item');
        
        taskItems.forEach(item => {
            const taskCategory = item.dataset.category;
            const isCompleted = item.classList.contains('completed');
            
            let show = false;
            if (this.currentFilter === 'all') {
                show = true;
            } else if (this.currentFilter === 'active') {
                show = !isCompleted;
            } else if (this.currentFilter === 'completed') {
                show = isCompleted;
            } else {
                show = taskCategory === this.currentFilter;
            }
            
            item.style.display = show ? 'flex' : 'none';
        });
    }

    // Render all tasks
    renderTasks() {
        const container = document.getElementById('tasksContainer');
        container.innerHTML = '';

        this.tasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            container.appendChild(taskElement);
        });

        this.applyCurrentFilter();
    }

    // Create task element
    createTaskElement(task) {
        const taskItem = document.createElement('div');
        taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskItem.dataset.category = task.category;
        taskItem.dataset.priority = task.priority;

        taskItem.innerHTML = `
            <div class="task-checkbox">
                <input type="checkbox" id="${task.id}" ${task.completed ? 'checked' : ''}>
                <label for="${task.id}" class="checkbox-custom"></label>
            </div>
            <div class="task-content">
                <span class="task-text" style="${task.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${task.text}</span>
                <div class="task-meta">
                    <span class="task-category ${task.category}">${task.category.charAt(0).toUpperCase() + task.category.slice(1)}</span>
                    <span class="task-priority ${task.priority}">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority</span>
                </div>
            </div>
            <button class="delete-btn">
                <i class="fas fa-trash"></i>
            </button>
        `;

        return taskItem;
    }

    // Update highlights section
    updateHighlights() {
        const allTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(t => t.completed).length;
        const highPriorityTasks = this.tasks.filter(t => t.priority === 'high' && !t.completed).length;

        const highlightNumbers = document.querySelectorAll('.highlight-number');
        if (highlightNumbers.length >= 3) {
            highlightNumbers[0].textContent = completedTasks;
            highlightNumbers[1].textContent = allTasks - completedTasks;
            highlightNumbers[2].textContent = highPriorityTasks;
        }
    }

    // Save tasks to localStorage
    saveTasks() {
        localStorage.setItem('focusFlowTasks', JSON.stringify(this.tasks));
        localStorage.setItem('focusFlowCounter', this.taskIdCounter.toString());
    }

    // Load tasks from localStorage
    loadTasks() {
        const saved = localStorage.getItem('focusFlowTasks');
        return saved ? JSON.parse(saved) : [];
    }

    // Get next available ID
    getNextId() {
        const saved = localStorage.getItem('focusFlowCounter');
        return saved ? parseInt(saved) : 1;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});

// Add slide out animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(-100%); }
    }
`;
document.head.appendChild(style);