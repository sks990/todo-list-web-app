[code]/**
 * Simple State Management using Observer Pattern
 */
export class TodoStore {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.listeners = [];
    }

    subscribe(listener) {
        this.listeners.push(listener);
    }

    notify() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
        this.listeners.forEach(listener => listener(this.todos));
    }

    addTodo(text) {
        const newTodo = {
            id: crypto.randomUUID(),
            text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        this.todos.push(newTodo);
        this.notify();
    }

    toggleTodo(id) {
        this.todos = this.todos.map(t => 
            t.id === id ? { ...t, completed: !t.completed } : t
        );
        this.notify();
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.notify();
    }
}

export const todoStore = new TodoStore();