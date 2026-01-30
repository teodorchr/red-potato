import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './Input.jsx';

describe('Input', () => {
  it('renders without label', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Input label="Email" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('shows required indicator when required', () => {
    render(<Input label="Name" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('does not show required indicator when not required', () => {
    render(<Input label="Name" />);
    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  it('displays error message', () => {
    render(<Input label="Email" error="Invalid email" />);
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('applies error class when error is present', () => {
    render(<Input error="Error" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveClass('input-error');
  });

  it('does not apply error class when no error', () => {
    render(<Input data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).not.toHaveClass('input-error');
  });

  it('applies className to container', () => {
    render(<Input className="custom-class" label="Test" />);
    const container = screen.getByText('Test').closest('div');
    expect(container).toHaveClass('custom-class');
  });

  it('passes through additional props', () => {
    render(<Input type="email" placeholder="Email" />);
    const input = screen.getByPlaceholderText('Email');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('handles change events', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} placeholder="Type here" />);

    const input = screen.getByPlaceholderText('Type here');
    fireEvent.change(input, { target: { value: 'test' } });

    expect(handleChange).toHaveBeenCalled();
  });

  it('can be controlled with value prop', () => {
    render(<Input value="test value" readOnly placeholder="Input" />);
    const input = screen.getByPlaceholderText('Input');
    expect(input).toHaveValue('test value');
  });
});
