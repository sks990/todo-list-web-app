import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../App'; // 메인 앱 컴포넌트
import { singleTask } from '../../mocks/testData';

describe('통합 시나리오 테스트: 태스크 생명주기', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('태스크 생성부터 삭제까지의 전체 흐름이 정상 동작해야 한다', async () => {
    render(<App />);

    // 1. 신규 태스크 생성
    const addBtn = screen.getByRole('button', { name: /태스크 추가/i });
    fireEvent.click(addBtn);
    
    const titleInput = screen.getByPlaceholderText(/태스크 제목/i);
    fireEvent.change(titleInput, { target: { value: singleTask.title } });
    fireEvent.click(screen.getByRole('button', { name: /저장/i }));

    expect(screen.getByText(singleTask.title)).toBeInTheDocument();

    // 2. 칸반 이동 (Drag and Drop 시뮬레이션 - 간단히 상태 변경 버튼으로 대체 가능)
    // 실제 DnD는 라이브러리에 따라 fireEvent.dragStart 등을 사용
    const kanbanTab = screen.getByRole('tab', { name: /칸반/i });
    fireEvent.click(kanbanTab);
    expect(screen.getByText(singleTask.title)).toBeInTheDocument();

    // 3. 간트 차트 확인
    const ganttTab = screen.getByRole('tab', { name: /간트/i });
    fireEvent.click(ganttTab);
    expect(screen.getByTestId(`gantt-item-${singleTask.id}`)).toBeInTheDocument();

    // 4. 데이터 영속성 확인 (새로고침 시뮬레이션)
    render(<App />); 
    expect(screen.getByText(singleTask.title)).toBeInTheDocument();

    // 5. 삭제
    const deleteBtn = screen.getByTestId(`delete-btn-${singleTask.id}`);
    fireEvent.click(deleteBtn);
    
    await waitFor(() => {
      expect(screen.queryByText(singleTask.title)).not.toBeInTheDocument();
    });
  });
});