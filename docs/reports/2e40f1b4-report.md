# 作業報告書: プロジェクト技術スタックの定義と基本構造の設計

## メタデータ
- **タスクID**: 2e40f1b4-9c6b-4b65-99e5-789bf3905bca
- **タイプ**: spike
- **優先度**: critical
- **担当エージェント**: Tech Lead
- **完了時間**: 2026-01-14T01:47:45.991Z

## タスク説明
HTML/CSS/JavaScriptのみを使用したシマンティックなTODOリストの基本アーキテクチャを決定し、ディレクトリ構成とコーディング規約を策定する。

## 作業内容
Tech Leadとして、プロジェクトの技術スタック定義および基本構造の設計を完了しました。
本タスクでは、シンプルかつ堅牢で、長期的な保守に堪えるアーキテクチャを採用しています。フレームワーク（ReactやVue等）を使用せず、Vanilla JavaScriptのポテンシャルを最大限に活用した「コンポーネント指向のVanillaアーキテクチャ」を構成しました。

以下に設計ドキュメントと初期実装コードを生成します。

```filepath:docs/architecture/technical-spec.md
# 技術仕様書: プロジェクト・アーキテクチャ

## 1. 技術スタック
- **Language**: HTML5, CSS3, JavaScript (ES6+)
- **Architecture**: Functional Component Pattern (Vanilla JS)
- **State Management**: Reactive State Pattern (Observer Pattern)
- **Style**: CSS Variables & BEM Method

## 2. ディレクトリ構造
```text
project-root/
├── index.html          # エントリポイント
├── assets/             # 静的ファイル（画像、アイコン等）
├── css/
│   ├── base.css        # リセット、変数、グローバル設定
│   ├── layout.css      # レイアウト定義
│   └── components/     # コンポーネント別スタイル
└── js/
    ├── app.js          # アプリケーション初期化
    ├── store/          # 状態管理論理
    ├── components/     # UIコンポーネント（非依存）
    └── utils/          # 汎用関数
```

## 3. コーディング指示と規約
- **Semantic HTML**: `<div>`を避け、`<header>`, `<main>`, `<section>`, `<article>`, `<ul>`を適切に使用する。
- **DOM操作の最小化**: Direct DOM API（createElement）を使用して、インジェクション攻撃を防ぐ。
- **CSS設計**: カスタムプロパティ（--primary-color等）を活用し、ダークモードやテーマ変更に対応可能にする。
```

---

```filepath:css/base.css
:root {
    --primary-color: #2563eb;
    --text-color: #1f2937;
    --bg-color: #f9fafb;
    --border-color: #e5e7eb;
    --danger-color: #dc2626;
    --font-family: 'Inter', system-ui, sans-serif;
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: var(--font-family);
    color: var(--text-color);
    background-color: var(--bg-color);
    line-height: 1.5;
}

.container {
    max-width: 600px;
    margin: 2rem auto;
    padding: 0 1rem;
}
```

---

```filepath:index.html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Semantic Todo App</title>
    <link rel="stylesheet" href="css/base.css">
    <link rel="stylesheet" href="css/components/todo-list.css">
</head>
<body>
    <div id="app" class="container">
        <header>
            <h1>My Todo List</h1>
        </header>
        
        <main>
            <section id="todo-form-container">
                <!-- JSでレンダリング -->
            </section>
            
            <section id="todo-list-container" aria-live="polite">
                <!-- JSでレンダリング -->
            </section>
        </main>
    </div>

    <script type="module" src="js/app.js"></script>
</body>
</html>
```

---

```filepath:js/store/todoStore.js
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
```

---

```filepath:js/app.js
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
```

---

### プロジェクト要件および設計要領のまとめ

1.  **作成したファイル一覧:**
    *   `docs/architecture/technical-spec.md`: アーキテクチャ構成案。
    *   `css/base.css`: 全体レイアウト、CSS変数定義。
    *   `index.html`: セマンティックなHTML構造。
    *   `js/store/todoStore.js`: Observerパターンを用いた状態管理クラス。
    *   `js/app.js`: エントリポイント兼、軽量なコンポーネント管理ロジック。

2.  **主要な実装の決定事項:**
    *   **フレームワーク不使用**: パフォーマンスとセキュリティを重視し、Vanilla JSのModulesを採用。
    *   **Observerパターン**: 表示とロジックを分離するため、`todoStore`での状態管理を一元化。
    *   **Security**: `innerHTML`による動的な値の描画を避け、`textContent`および`createElement`を使用し、XSSを防止。
    *   **Accessibility**: `aria-live`やセマンティックタグを用いたアクセシビリティへの配慮。

3.  **テストに関する推奨事項:**
    *   **Unit Test**: `todoStore.js` のロジックに対して、Jestを用いた単体テストを推奨。
    *   **E2E Test**: Playwrightを使用し、ブラウザ上で正常にCRUD操作が行えるかを検証することを推奨。

4.  **次のステップ:**
    *   コンポーネントごとの詳細なCSSの実装（`todo-list.css`）。
    *   オフラインサポートのためのService Worker導入の検討。
    *   ドラッグアンドドロップによる並べ替え機能の実装。

PMへ報告：技術スタックの策定と基本アーキテクチャの構築が完了しました。開発者は直ちに実装フェーズに移行可能です。

## 次のステップ
- [ ] PMレビュー待ち
- [ ] コードレビュー実施
- [ ] テスト検証
- [ ] デプロイ承認

---
*この報告書はAIエージェントによって自動生成されました。*
