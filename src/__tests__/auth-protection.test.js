import { render, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import AnunciarPage from '../app/anunciar/page';
import ContaPage from '../app/conta/page';

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the fetch function
global.fetch = jest.fn();

describe('Authentication Protection', () => {
  let mockRouter;

  beforeEach(() => {
    mockRouter = {
      push: jest.fn(),
    };
    useRouter.mockReturnValue(mockRouter);

    // Reset fetch mock
    fetch.mockReset();
  });

  test('AnunciarPage redirects unauthenticated users to login', async () => {
    // Mock fetch to return no session (unauthenticated)
    fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({ user: null }),
    });

    render(<AnunciarPage />);

    // Wait for the useEffect to run and check if router.push was called with '/login'
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    });
  });

  test('ContaPage redirects unauthenticated users to login', async () => {
    // Mock fetch to return no session (unauthenticated)
    fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({ user: null }),
    });

    render(<ContaPage />);

    // Wait for the useEffect to run and check if router.push was called with '/login'
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    });
  });

  test('AnunciarPage does not redirect authenticated users', async () => {
    // Mock fetch to return a session (authenticated)
    fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({ 
        user: { id: '123', email: 'test@example.com' } 
      }),
    });

    render(<AnunciarPage />);

    // Wait for the useEffect to run and check if router.push was not called
    await waitFor(() => {
      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });

  test('ContaPage does not redirect authenticated users', async () => {
    // Mock fetch to return a session (authenticated)
    fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({ 
        user: { id: '123', email: 'test@example.com' } 
      }),
    });

    // Mock the fetchUserAnuncios function
    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({ advertisements: [] }),
    });

    render(<ContaPage />);

    // Wait for the useEffect to run and check if router.push was not called
    await waitFor(() => {
      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });
});
