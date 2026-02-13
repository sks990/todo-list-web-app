import { SecurityUtils } from '../utils/security.js';

/**
 * 작업을 렌더링하고 인터랙션을 관리하는 샘플 컴포넌트 로직
 */
export class TaskItem {
  constructor(taskData) {
    this.data = taskData;
    this.element = this.createDOM();
  }

  createDOM() {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.style.transition = 'all 0.4s ease';

    // XSS 방지를 위해 textContent 속성 활용
    const titleSpan = document.createElement('span');
    SecurityUtils.safeRenderText(titleSpan, this.data.title);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-interactive delete-btn';
    deleteBtn.textContent = '삭제';
    
    deleteBtn.onclick = () => this.removeWithAnimation();

    li.appendChild(titleSpan);
    li.appendChild(deleteBtn);
    
    return li;
  }

  /**
   * 삭제 시 Fade-out 애니메이션 적용
   */
  removeWithAnimation() {
    this.element.classList.add('fade-out');
    
    // 애니메이션 종료 후 DOM에서 실제 제거
    this.element.addEventListener('transitionend', () => {
      this.element.remove();
      this.onDeleteSuccess();
    }, { once: true });
  }

  onDeleteSuccess() {
    // LocalStorage 업데이트 등 후속 작업
    console.log(`Task ${this.data.id} removed safely.`);
  }
}