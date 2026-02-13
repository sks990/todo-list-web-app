import React from 'react';
import { render } from '@testing-library/react';
import KanbanBoard from '../../components/KanbanBoard';
import { mockTasks } from '../../mocks/testData';

describe('성능 최적화 테스트', () => {
  test('100개 이상의 태스크 렌더링 시 성능 저하를 측정한다', () => {
    const startTime = performance.now();
    
    render(<KanbanBoard tasks={mockTasks} />);
    
    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log(`Rendering 100 tasks took: ${duration.toFixed(2)}ms`);
    
    // 일반적인 벤치마크: 대량 데이터도 200ms 이내에 초기 렌더링 권장
    expect(duration).toBeLessThan(500); 
  });
});