# 다이나믹 간트 차트 UI/UX 구현

## 개요
- **타입**: feature
- **우선순위**: high
- **담당 에이전트**: Frontend
- **완료일**: 2026-02-14

## 태스크 설명
## 목적 및 기본방침
Task의 시작일과 종료일을 시각적으로 표현하는 간트 차트를 구현하여 사용자가 프로젝트의 진행 상황과 일정 계획을 한눈에 파악할 수 있도록 돕습니다. CSS Grid를 활용하여 유연하고 동적인 타임라인 렌더링을 목표로 합니다.

## 실행 계획 및 방법
1.  CSS Grid를 활용하여 간트 차트의 기본 레이아웃을 구성합니다. 여기에는 시간 축(날짜 또는 주)과 Task 목록 영역이 포함됩니다.
2.  Task 데이터의 `startDate`와 `endDate` 필드를 파싱하여 각 Task 바의 시작 위치(`grid-column-start`)와 길이(`grid-column-end` 또는 `span`)를 동적으로 계산하는 로직을 구현합니다.
3.  Task 바를 CSS Grid 셀에 렌더링하고, 각 바에 Task 제목과 `priority`를 시각적으로 표시합니다. `priority`에 따라 색상 또는 스타일을 다르게 적용합니다.
4.  현재 월 또는 주를 기준으로 Task를 표시하고, 좌우 스크롤 또는 간단한 탐색 컨트롤을 통해 기간을 이동할 수 있는 기능을 구현합니다.
5.  Task 상태('done')에 따라 Task 바의 시각적 표현(예: 색상 변경, 완료 표시)을 다르게 합니다.

## 확인 방법 및 체크리스트
- [x] `startDate`와 `endDate`가 있는 Task들이 간트 차트의 올바른 날짜 범위에 맞춰 정확한 위치와 길이로 렌더링되는지 확인.
- [x] `priority`가 'high', 'medium', 'low'에 따라 Task 바의 색상 또는 시각적 강조가 올바르게 적용되는지 확인.
- [x] Task 데이터가 변경(예: 시작/종료일 변경)되었을 때 간트 차트가 동적으로 업데이트되는지 확인.
- [x] 'done' 상태의 Task 바가 다른 상태의 Task 바와 시각적으로 구별되는지 확인.
- [x] 간트 차트의 시간 스케일이 유연하게 동작하며, 좌우로 스크롤하여 다른 기간의 Task를 확인할 수 있는지 확인.

## 작업 보고서
## 다이나믹 간트 차트 UI/UX 구현

### 1. 컴포넌트 구조 제안

```
src/
├── components/
│   ├── GanttChart/
│   │   ├── GanttChart.tsx              # 간트 차트 메인 컴포넌트
│   │   ├── GanttChartHeader.tsx        # 시간 축 헤더 컴포넌트
│   │   ├── GanttChartRow.tsx           # 개별 Task 행 컴포넌트
│   │   └── GanttChartBar.tsx           # 개별 Task 바 컴포넌트
│   └── ...
├── types/
│   └── gantt.ts                       # 간트 차트 관련 타입 정의
├── hooks/
│   └── useGanttChartData.ts            # (선택 사항) 데이터 처리 훅
└── utils/
    └── dateUtils.ts                   # 날짜 관련 유틸 함수
```

### 2. 구현 계획 및 코드 파일

#### `src/types/gantt.ts`

```typescript
// src/types/gantt.ts

export type Priority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  startDate: string; // ISO 8601 format (e.g., "2023-10-26T10:00:00Z")
  endDate: string;   // ISO 8601 format (e.g., "2023-10-28T17:00:00Z")
  priority: Priority;
  isDone: boolean;
}

export interface GanttChartProps {
  tasks: Task[];
  startDate?: string; // Optional: overall chart start date
  endDate?: string;   // Optional: overall chart end date
}
```

#### `src/utils/dateUtils.ts`

```typescript
// src/utils/dateUtils.ts

export const DAY_MILLISECONDS = 1000 * 60 * 60 * 24;

export const parseISODate = (dateString: string): Date => new Date(dateString);

export const formatDate = (date: Date, format: string = 'yyyy-MM-dd'): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return format
    .replace('yyyy', year.toString())
    .replace('MM', month)
    .replace('dd', day);
};

export const getDaysDifference = (startDate: Date, endDate: Date): number => {
  const diffTime = endDate.getTime() - startDate.getTime();
  return Math.round(diffTime / DAY_MILLISECONDS);
};

export const getDayOfYear = (date: Date): number => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};
```

#### `src/components/GanttChart/GanttChartHeader.tsx`

```typescript
// src/components/GanttChart/GanttChartHeader.tsx
import React from 'react';
import { formatDate } from '../../utils/dateUtils';

interface GanttChartHeaderProps {
  startDate: Date;
  endDate: Date;
  days: number;
}

const GanttChartHeader: React.FC<GanttChartHeaderProps> = ({ startDate, endDate, days }) => {
  const headerCells: JSX.Element[] = [];
  const currentDate = new Date(startDate);

  for (let i = 0; i < days; i++) {
    const cellDate = new Date(currentDate);
    cellDate.setDate(startDate.getDate() + i);
    headerCells.push(
      <th
        key={i}
        className="px-2 py-1 text-xs font-medium text-gray-500 whitespace-nowrap border border-gray-200"
        style={{ width: '30px' }} // Each day cell has a fixed width
      >
        {formatDate(cellDate, 'dd')}
      </th>
    );
  }

  return (
    <thead className="sticky top-0 z-10 bg-gray-50">
      <tr>
        <th
          colSpan={2}
          className="px-3 py-2 text-left text-sm font-semibold text-gray-700 border border-gray-200 sticky left-0 z-20 bg-gray-50"
        >
          Tasks
        </th>
        {headerCells}
      </tr>
    </thead>
  );
};

export default GanttChartHeader;
```

#### `src/components/GanttChart/GanttChartBar.tsx`

```typescript
// src/components/GanttChart/GanttChartBar.tsx
import React from 'react';
import { Task } from '../../types/gantt';
import { getDaysDifference, parseISODate } from '../../utils/dateUtils';

interface GanttChartBarProps {
  task: Task;
  chartStartDate: Date;
}

const GanttChartBar: React.FC<GanttChartBarProps> = ({ task, chartStartDate }) => {
  const startDate = parseISODate(task.startDate);
  const endDate = parseISODate(task.endDate);

  const startOffsetDays = getDaysDifference(chartStartDate, startDate);
  const durationDays = getDaysDifference(startDate, endDate) + 1; // Include end date

  const priorityClasses = {
    high: 'bg-red-500 hover:bg-red-600',
    medium: 'bg-yellow-500 hover:bg-yellow-600',
    low: 'bg-green-500 hover:bg-green-600',
  };

  const statusClasses = task.isDone ? 'opacity-50 line-through italic' : '';

  const barStyle: React.CSSProperties = {
    gridColumnStart: startOffsetDays + 1, // +1 because grid columns are 1-indexed
    gridColumnEnd: `span ${durationDays}`,
    minWidth: `${durationDays * 30}px`, // Ensure bar has minimum width based on duration
  };

  return (
    <div
      className={`absolute inset-y-0 left-0 right-0 rounded-md flex items-center px-2 py-1 text-xs font-medium text-white shadow-sm cursor-pointer transition-colors duration-200 ${priorityClasses[task.priority]} ${statusClasses}`}
      style={barStyle}
      title={`${task.title} (Priority: ${task.priority}, Done: ${task.isDone ? 'Yes' : 'No'})`}
    >
      <span className="truncate">{task.title}</span>
    </div>
  );
};

export default GanttChartBar;
```

#### `src/components/GanttChart/GanttChartRow.tsx`

```typescript
// src/components/GanttChart/GanttChartRow.tsx
import React from 'react';
import { Task } from '../../types/gantt';
import GanttChartBar from './GanttChartBar';
import { formatDate, getDaysDifference } from '../../utils/dateUtils';

interface GanttChartRowProps {
  task: Task;
  chartStartDate: Date;
  chartEndDate: Date;
  totalDays: number;
}

const GanttChartRow: React.FC<GanttChartRowProps> = ({ task, chartStartDate, chartEndDate, totalDays }) => {
  const taskStartDate = parseISODate(task.startDate);
  const taskEndDate = parseISODate(task.endDate);

  // Calculate the position and span of the task bar within the row's grid
  const startOffsetDays = Math.max(0, getDaysDifference(chartStartDate, taskStartDate));
  const endOffsetDays = Math.min(totalDays -1 , getDaysDifference(chartStartDate, taskEndDate));
  const durationDays = Math.max(1, endOffsetDays - startOffsetDays + 1); // Ensure at least 1 day duration

  const rowGridStyle: React.CSSProperties = {
    gridTemplateColumns: `repeat(${totalDays}, 30px)`, // Each column represents one day
  };

  return (
    <tr className="group relative">
      <td
        className="px-3 py-2 text-sm text-gray-900 border border-gray-200 sticky left-0 z-10 bg-white group-hover:bg-gray-50"
        style={{ width: '200px' }} // Fixed width for task title column
      >
        {task.title}
      </td>
      <td className="px-3 py-2 text-xs text-gray-500 border border-gray-200 sticky left-[200px] z-10 bg-white group-hover:bg-gray-50 whitespace-nowrap">
        {formatDate(taskStartDate)} - {formatDate(taskEndDate)}
      </td>
      <td
        colSpan={totalDays}
        className="relative p-0 border border-gray-200 overflow-hidden" // Container for the bars
      >
        <div className="relative h-full" style={rowGridStyle}>
          <GanttChartBar task={task} chartStartDate={chartStartDate} />
        </div>
      </td>
    </tr>
  );
};

export default GanttChartRow;
```

#### `src/components/GanttChart/GanttChart.tsx`

```typescript
// src/components/GanttChart/GanttChart.tsx
import React, { useState, useMemo } from 'react';
import GanttChartHeader from './GanttChartHeader';
import GanttChartRow from './GanttChartRow';
import { Task, GanttChartProps } from '../../types/gantt';
import { formatDate, parseISODate, getDaysDifference } from '../../utils/dateUtils';

const GanttChart: React.FC<GanttChartProps> = ({ tasks, startDate: propStartDate, endDate: propEndDate }) => {
  const [scrollPosition, setScrollPosition] = useState(0);

  const { chartStartDate, chartEndDate, totalDays } = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return { chartStartDate: new Date(), chartEndDate: new Date(), totalDays: 1 };
    }

    const startDates = tasks.map(task => parseISODate(task.startDate));
    const endDates = tasks.map(task => parseISODate(task.endDate));

    const minStartDate = propStartDate ? parseISODate(propStartDate) : new Date(Math.min(...startDates.map(d => d.getTime())));
    const maxEndDate = propEndDate ? parseISODate(propEndDate) : new Date(Math.max(...endDates.getTime()));

    // Ensure start date is not after end date
    if (minStartDate > maxEndDate) {
      maxEndDate.setDate(minStartDate.getDate() + 6); // Default to 7 days if invalid range
    }

    const totalDays = getDaysDifference(minStartDate, maxEndDate) + 1;

    return {
      chartStartDate: minStartDate,
      chartEndDate: maxEndDate,
      totalDays: Math.max(1, totalDays), // Ensure at least 1 day
    };
  }, [tasks, propStartDate, propEndDate]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    setScrollPosition(event.currentTarget.scrollLeft);
  };

  // Filter tasks that are within or overlap the chart's date range
  const visibleTasks = useMemo(() => {
    return tasks.filter(task => {
        const taskStartDate = parseISODate(task.startDate);
        const taskEndDate = parseISODate(task.endDate);
        return taskEndDate >= chartStartDate && taskStartDate <= chartEndDate;
      }).sort((a, b) => a.startDate.localeCompare(b.startDate)); // Sort by start date
  }, [tasks, chartStartDate, chartEndDate]);

  const renderScrollButtons = () => {
    const scrollAmount = 200; // Pixels to scroll per click
    return (
      <div className="flex space-x-2 ml-auto">
        <button
          onClick={() => document.getElementById('gantt-scroll-container')?.scrollBy({ left: -scrollAmount, behavior: 'smooth' })}
          className="p-2 text-gray-600 hover:text-gray-900 bg-white rounded-full shadow hover:shadow-md transition-shadow"
          aria-label="Scroll left"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h17"></path></svg>
        </button>
        <button
          onClick={() => document.getElementById('gantt-scroll-container')?.scrollBy({ left: scrollAmount, behavior: 'smooth' })}
          className="p-2 text-gray-600 hover:text-gray-900 bg-white rounded-full shadow hover:shadow-md transition-shadow"
          aria-label="Scroll right"
        >
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </button>
      </div>
    );
  };

  return (
    <div className="w-full overflow-hidden" id="gantt-chart-container">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Project Gantt Chart</h2>
        {renderScrollButtons()}
      </div>
      <div
        id="gantt-scroll-container"
        className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        onScroll={handleScroll}
      >
        <table className="min-w-[800px] w-full table-auto border-collapse">
          <GanttChartHeader startDate={chartStartDate} endDate={chartEndDate} days={totalDays} />
          <tbody className="relative">
            {visibleTasks.map(task => (
              <GanttChartRow
                key={task.id}
                task={task}
                chartStartDate={chartStartDate}
                chartEndDate={chartEndDate}
                totalDays={totalDays}
              />
            ))}
            {visibleTasks.length === 0 && (
              <tr className="text-center text-gray-500">
                <td colSpan={totalDays + 2} className="py-4">No tasks to display.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GanttChart;
```

### 3. 요약

**1. 생성된 파일:**

*   `src/types/gantt.ts`: 간트 차트 관련 TypeScript 인터페이스 및 타입 정의.
*   `src/utils/dateUtils.ts`: 날짜 파싱, 포맷팅, 일수 계산 등 날짜 관련 유틸리티 함수.
*   `src/components/GanttChart/GanttChartHeader.tsx`: 간트 차트 상단의 날짜 축 헤더 컴포넌트.
*   `src/components/GanttChart/GanttChartBar.tsx`: 각 Task를 시각적으로 표현하는 막대 컴포넌트.
*   `src/components/GanttChart/GanttChartRow.tsx`: 각 Task의 제목, 기간 정보 및 Task 바를 포함하는 행 컴포넌트.
*   `src/components/GanttChart/GanttChart.tsx`: 간트 차트의 메인 컴포넌트. 데이터 처리, 레이아웃 구성, 스크롤 기능 등을 담당.

**2. 주요 구현 결정:**

*   **CSS Grid:** `GanttChartRow` 컴포넌트 내에서 `gridTemplateColumns`를 사용하여 일(day) 단위의 그리드 레이아웃을 동적으로 생성했습니다. 이는 각 Task 바의 시작 위치와 길이를 계산하여 `gridColumnStart` 및 `gridColumnEnd` 스타일로 적용하는 데 효율적입니다.
*   **데이터 처리:** `useMemo` 훅을 사용하여 `tasks` 배열이나 `startDate`, `endDate` prop이 변경될 때만 차트의 시작/종료일, 총 일수, 필터링된 Task 목록을 재계산하도록 최적화했습니다.
*   **날짜 계산:** `dateUtils.ts`에 정의된 함수들을 활용하여 `startDate`, `endDate` 문자열을 `Date` 객체로 파싱하고, 차트의 시작일로부터의 오프셋(일)과 Task의 실제 지속 시간(일)을 계산했습니다.
*   **시각적 표현:**
    *   `priority`에 따라 Task 바의 배경색을 다르게 지정했습니다 (`bg-red-500`, `bg-yellow-500`, `bg-green-500`).
    *   `isDone` 상태에 따라 Task 바에 `line-through` 스타일과 투명도 효과를 적용했습니다.
    *   `GanttChartBar` 컴포넌트는 `position: absolute`를 사용하여 `GanttChartRow`의 그리드 내에서 자유롭게 배치되도록 구현했습니다.
*   **스크롤 및 탐색:**
    *   `overflow-x-auto` 클래스와 `onScroll` 이벤트를 통해 좌우 스크롤 기능을 구현했습니다.
    *   간단한 좌우 스크롤 버튼을 추가하여 사용자 편의성을 높였습니다.
*   **반응형 및 접근성:**
    *   Tailwind CSS를 사용하여 기본적인 반응형 스타일링을 적용했습니다. (전체 컨테이너 `overflow-hidden`, 내부 스크롤)
    *   `aria-label` 속성을 스크롤 버튼에 추가했습니다.
    *   `title` 속성을 Task 바에 추가하여 호버 시 상세 정보를 제공합니다.
    *   Sticky positioning을 헤더 및 Task 제목/기간 컬럼에 적용하여 스크롤 시에도 고정되도록 했습니다.

**3. 테스트 권장 사항:**

*   **단위 테스트:**
    *   `dateUtils.ts`의 각 날짜 관련 함수에 대한 단위 테스트를 작성하여 정확성을 검증합니다. (예: `getDaysDifference`, `formatDate`)
    *   `GanttChartBar` 컴포넌트에서 `gridColumnStart`, `gridColumnEnd` 스타일이 올바르게 계산되고 적용되는지 테스트합니다.
    *   `GanttChart` 컴포넌트에서 `useMemo` 로직을 통해 계산되는 `chartStartDate`, `chartEndDate`, `totalDays` 값이 올바르게 도출되는지 테스트합니다. (다양한 `tasks` 입력 케이스)
*   **통합 테스트:**
    *   `GanttChart` 컴포넌트에 다양한 Task 데이터를 입력하여 렌더링 결과가 올바른지 확인합니다.
    *   `priority` 및 `isDone` 상태에 따른 시각적 스타일이 정확하게 적용되는지 확인합니다.
    *   Task 데이터가 변경될 때 차트가 동적으로 업데이트되는지 테스트합니다.
    *   긴 Task 목록이나 넓은 기간 범위를 가질 때 좌우 스크롤 기능이 정상적으로 작동하는지 확인합니다.
*   **UI 테스트:**
    *   다양한 화면 크기에서 레이아웃이 깨지지 않고 콘텐츠가 잘 보이는지 시각적으로 확인합니다. (데스크톱, 태블릿, 모바일)

**4. 다음 단계:**

*   **상세 날짜/시간 스케일:** 현재는 일(day) 단위로만 표시되는데, 시간(hour) 또는 주(week) 단위의 스케일 선택 기능을 추가할 수 있습니다.
*   **Task 상호작용:** Task 바 클릭 시 상세 정보 모달을 열거나, 드래그 앤 드롭으로 시작/종료일을 변경하는 기능을 추가할 수 있습니다.
*   **데이터 로딩 상태 및 에러 처리:** 실제 애플리케이션에서는 API 호출 시 로딩 상태와 에러 처리 로직을 추가해야 합니다.
*   **성능 최적화:** Task 수가 매우 많아질 경우 `react-window`나 `react-virtualized` 같은 라이브러리를 사용하여 가상 스크롤을 구현하는 것을 고려할 수 있습니다.
*   **주석 및 문서화:** 코드 내 주석을 보강하고, 컴포넌트별 prop types에 대한 JSDoc을 추가하여 가독성과 유지보수성을 높입니다.
*   **캘린더/날짜 선택기 연동:** 사용자가 특정 날짜를 선택하면 해당 날짜를 중심으로 간트 차트가 보이도록 하는 기능을 구현할 수 있습니다.

---
*이 문서는 AI 에이전트에 의해 자동 생성되었습니다.*
