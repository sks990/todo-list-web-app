import { todoStore } from './store/todoStore.js';

class App {
    constructor() {
        this.formContainer = document.getElementById('todo-form-container');
        this.listContainer = document.getElementById('todo-list-container');
        this.init();
    }

    init() {
        this.renderForm();
        todoStore.subscribe(() => this.renderList());
        this.renderList(); // Initial render
    }

    renderForm() {
        const form = document.createElement('form');
        form.innerHTML = `
            <div class="input-group">
                <input type="text" id="todo-input" placeholder="新しいタスクを入力..." required>
                <button type="submit">追加</button>
            </div>
        `;
        form.onsubmit = (e) => {
            e.preventDefault();
            const input = form.querySelector('#todo-input');
            if (input.value.trim()) {
                todoStore.addTodo(input.value.trim());
                input.value = '';
            }
        };
        this.formContainer.appendChild(form);
    }

    renderList() {
        const todos = todoStore.todos;
        this.listContainer.innerHTML = '';
        
        const ul = document.createElement('ul');
        ul.className = 'todo-list';

        todos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'is-completed' : ''}`;
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = todo.completed;
            checkbox.onchange = () => todoStore.toggleTodo(todo.id);

            const span = document.createElement('span');
            span.textContent = todo.text;

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '削除';
            deleteBtn.onclick = () => todoStore.deleteTodo(todo.id);

            li.append(checkbox, span, deleteBtn);
            ul.appendChild(li);
        });

        this.listContainer.appendChild(ul);
    }
}

// アプリケーションの起動
new App();