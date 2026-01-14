import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import TaskApp from '../components/TaskApp';
import { expect, it, describe } from 'vitest';

expect.extend(toHaveNoViolations);

describe('自動アクセシビリティ検証', () => {
  it('WCAG 2.1基準に違反するアクセシビリティエラーがないこと', async () => {
    const { container } = render(<TaskApp />);
    const results = await axe(container);
    
    expect(results).toHaveNoViolations();
  });
});