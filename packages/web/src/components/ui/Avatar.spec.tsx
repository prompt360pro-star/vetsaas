import React from 'react';
import { render, screen } from '@testing-library/react';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('renders image with correct src and alt', () => {
    const src = 'https://example.com/avatar.jpg';
    const alt = 'Test User';
    render(<Avatar src={src} name={alt} size="md" />);
    const img = screen.getByRole('img');

    // Check alt text
    expect(img).toHaveAttribute('alt', alt);

    // Check if next/image generated src correctly (it changes src to optimized URL)
    // We can check if the original src is present in the optimized URL or if width/height are set
    expect(img.getAttribute('src')).toContain(encodeURIComponent(src));

    // Check width and height (md = 40)
    expect(img).toHaveAttribute('width', '40');
    expect(img).toHaveAttribute('height', '40');
  });

  it('renders initials when src is missing', () => {
    const name = 'Test User';
    render(<Avatar name={name} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('TU')).toBeInTheDocument();
  });
});
