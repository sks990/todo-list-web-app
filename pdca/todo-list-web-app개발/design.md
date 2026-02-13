# 🎨 Design: 기술 설계서

> Version 5 | 2026-02-13T17:25:50.097164+00:00

# 기술 설계 문서 (Technical Design Document): 인터렉티브 통합 할 일 관리 시스템

본 문서는 단일 HTML 파일로 구성된 화려하고 직관적인 UI/UX 기반의 할 일 관리(Todo), 칸반 보드(Kanban), 간트 차트(Gantt) 시스템에 대한 기술 설계를 다룹니다.

---

## 1. 아키텍처 개요 (Architecture Overview)

이 프로젝트는 **Single File Application (SFA)** 구조를 채택합니다. 별도의 서버나 외부 라이브러리 의존성 없이 단일 HTML 파일 내에서 모든 로직이 실행됩니다.

*   **Frontend Stack**: HTML5, CSS3 (Modern Flexbox/Grid, Animations), Pure JavaScript (ES6+).
*   **Storage Layer**: 브라우저 내장 **LocalStorage API**를 사용하여 영속성을 보장합니다.
*   **Design Pattern**: **MVC (Model-View-Controller)** 패턴을 간소화하여 적용합니다.
    *   **Model**: 데이터의 상태(State)와 LocalStorage CRUD 로직 관리.
    *   **View**: DOM 조작 및 CSS 애니메이션 처리 (칸반, 간트 렌더링).
    *   **Controller**: 사용자 이벤트(드래그 앤 드롭, 클릭 등) 처리 및 데이터-뷰 동기화.

---

## 2. 컴포넌트 설계 (Component Design)

계획서에 명시된 기능들을 구현하기 위해 다음과 같은 핵심 컴포넌트를 설계합니다.

*   **Task Engine**: 모든 할 일 데이터의 생성, 수정, 삭제를 담당하는 핵심 엔진.
*   **Interactive Kanban Board**: 
    *   상태별(To-Do, In Progress, Done) 컬럼 구성.
    *   HTML5 Drag and Drop API를 활용한 카드 이동 기능.
*   **Dynamic Gantt Chart**:
    *   시간 흐름에 따른 업무 일정을 시각화.
    *   CSS Grid를 활용한 타임라인 렌더링.
*   **UI Perspective Engine**: 사용자가 Todo 리스트, 칸반, 간트 차트 간의 뷰를 즉시 전환할 수 있는 레이아웃 스위처.

---

## 3. 데이터베이스 스키마 (Database Schema)

`LocalStorage`를 데이터베이스로 사용하며, `webapp_tasks`라는 키값으로 JSON 배열 형태의 데이터를 저장합니다.

| 필드명 | 데이터 타입 | 설명 |
| :--- | :--- | :--- |
| `id` | String | 고유 식별자 (UUID 또는 Timestamp 기반) |
| `title` | String | 할 일 제목 |
| `status` | String | 'todo' \| 'doing' \| 'done' (칸반 상태) |
| `startDate` | String | 시작 날짜 (간트 차트용, YYYY-MM-DD) |
| `endDate` | String | 종료 날짜 (간트 차트용, YYYY-MM-DD) |
| `priority` | String | 'low' \| 'medium' \| 'high' (시각적 강조용) |
| `createdAt` | Number | 생성 일시 (정렬용) |

---

## 4. API 엔드포인트 (Internal Logic)

서버가 없는 구조이므로, 자바스크립트 내부의 싱글톤 객체 또는 클래스 메서드로 API를 대체합니다.

*   **`TaskService.save(task)`**: 새로운 할 일을 저장하거나 기존 항목 수정.
*   **`TaskService.getAll()`**: 모든 할 일 목록 로드.
*   **`TaskService.updateStatus(id, newStatus)`**: 칸반 드래그 앤 드롭 시 상태 업데이트.
*   **`TaskService.delete(id)`**: 특정 할 일 삭제.
*   **`StorageService.sync()`**: 현재 상태를 `LocalStorage`에 직렬화하여 저장.

---

## 5. UI/UX 사양 (UI/UX Specifications)

일반 사용자를 위해 복잡함을 배제하고 '화려하고 직관적인' 경험을 제공합니다.

*   **Visual Style**: 
    *   **Glassmorphism**: 투명도와 블러 효과를 준 카드 디자인.
    *   **Color Palette**: 상태별(Blue, Orange, Green) 파스텔톤 컬러 시스템.
*   **Interactions**:
    *   **Micro-interactions**: 버튼 호버 시 스케일 변화, 체크박스 완료 시 스트라이크스루 애니메이션.
    *   **Transition Effects**: 뷰 전환(칸반 <-> 간트) 시 부드러운 페이드 및 슬라이드 효과.
    *   **Drag & Drop**: 칸반 카드 이동 시 고스트 이미지와 드롭 존 하이라이트 제공.
*   **Responsive**: 모바일 환경에서도 확인 가능한 유연한 그리드 레이아웃.

---

## 6. 보안 고려사항 (Security Considerations)

*   **XSS 방지**: 사용자로부터 입력받은 텍스트는 `textContent`를 사용하여 DOM에 주입함으로써 악성 스크립트 실행을 방지합니다.
*   **Data Sanitization**: LocalStorage에서 데이터를 불러올 때 JSON 파싱 예외 처리를 수행하여 오염된 데이터로 인한 스크립트 중단을 방지합니다.

---

## 7. 테스트 전략 (Testing Strategy)

성공 기준(Success Criteria)인 '정상 동작'과 '데이터 영속성'을 검증합니다.

*   **데이터 유지 테스트**: 
    1. 할 일을 추가하고 브라우저를 새로고침한다.
    2. 할 일이 그대로 남아있는지 확인한다. (LocalStorage 연동 확인)
*   **기능 무결성 테스트**:
    1. 칸반 보드에서 카드를 'Done'으로 옮겼을 때 간트 차트의 진행 상태가 반영되는지 확인.
    2. 할 일을 삭제했을 때 모든 뷰(리스트, 칸반, 간트)에서 즉시 사라지는지 확인.
*   **UI/UX 검증**: 
    1. 다양한 브라우저(Chrome, Safari, Edge)에서 애니메이션의 끊김 없는 동작 확인.
    2. 드래그 앤 드롭 UI가 직관적으로 동작하는지 확인.

---

**이 기술 설계는 단 하나의 파일 내에서 위 모든 명세를 구현하며, 일반 사용자가 가입 없이 즉시 사용할 수 있는 고성능 할 일 관리 도구를 지향합니다.**