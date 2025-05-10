import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import AnunciosPage from '../app/anuncios/page';

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the next/image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // Add alt prop if not provided
    const imgProps = { ...props, alt: props.alt || 'Image' };
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...imgProps} />;
  },
}));

// Mock the Header and Footer components
jest.mock('../../components/Header', () => ({
  Header: () => <div data-testid="header-mock" />,
}));

jest.mock('../../components/Footer', () => ({
  Footer: () => <div data-testid="footer-mock" />,
}));

// Mock the fetch function
global.fetch = jest.fn();

describe('Search Functionality', () => {
  let mockRouter;

  beforeEach(() => {
    mockRouter = {
      push: jest.fn(),
    };
    useRouter.mockReturnValue(mockRouter);

    // Reset fetch mock
    fetch.mockReset();
  });

  test('displays all advertisements when no search term is provided', async () => {
    // Mock data for advertisements
    const mockAds = [
      {
        id: '1',
        title: 'Test Ad 1',
        description: 'Description 1',
        location: 'Location 1',
        image_url: '/test1.jpg',
        publisher: 'Publisher 1',
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Test Ad 2',
        description: 'Description 2',
        location: 'Location 2',
        image_url: '/test2.jpg',
        publisher: 'Publisher 2',
        created_at: new Date().toISOString(),
      },
    ];

    // Mock fetch to return all advertisements
    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({ advertisements: mockAds }),
    });

    render(<AnunciosPage />);

    // Wait for the advertisements to be displayed
    await waitFor(() => {
      expect(screen.getByText('Test Ad 1')).toBeInTheDocument();
      expect(screen.getByText('Test Ad 2')).toBeInTheDocument();
    });
  });

  test('filters advertisements based on search term', async () => {
    // Mock data for all advertisements
    const allAds = [
      {
        id: '1',
        title: 'Donation for Charity',
        description: 'Help us collect donations',
        location: 'Lisbon',
        image_url: '/test1.jpg',
        publisher: 'Charity Org',
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Wheelchair Needed',
        description: 'Urgent need for a wheelchair',
        location: 'Porto',
        image_url: '/test2.jpg',
        publisher: 'Hospital',
        created_at: new Date().toISOString(),
      },
    ];

    // Mock data for filtered advertisements
    const filteredAds = [
      {
        id: '1',
        title: 'Donation for Charity',
        description: 'Help us collect donations',
        location: 'Lisbon',
        image_url: '/test1.jpg',
        publisher: 'Charity Org',
        created_at: new Date().toISOString(),
      },
    ];

    // First fetch returns all advertisements
    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({ advertisements: allAds }),
    });

    const { getByPlaceholderText } = render(<AnunciosPage />);

    // Wait for the initial advertisements to be displayed
    await waitFor(() => {
      expect(screen.getByText('Donation for Charity')).toBeInTheDocument();
      expect(screen.getByText('Wheelchair Needed')).toBeInTheDocument();
    });

    // Mock fetch for the search results
    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({ advertisements: filteredAds }),
    });

    // Find the search input and type a search term
    const searchInput = getByPlaceholderText('Buscar anúncios...');
    fireEvent.change(searchInput, { target: { value: 'Charity' } });

    // Wait for the filtered advertisements to be displayed
    await waitFor(() => {
      expect(screen.getByText('Donation for Charity')).toBeInTheDocument();
      expect(screen.queryByText('Wheelchair Needed')).not.toBeInTheDocument();
    });
  });

  test('shows "no results" message when search returns empty', async () => {
    // Mock data for all advertisements
    const allAds = [
      {
        id: '1',
        title: 'Donation for Charity',
        description: 'Help us collect donations',
        location: 'Lisbon',
        image_url: '/test1.jpg',
        publisher: 'Charity Org',
        created_at: new Date().toISOString(),
      },
    ];

    // First fetch returns all advertisements
    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({ advertisements: allAds }),
    });

    const { getByPlaceholderText } = render(<AnunciosPage />);

    // Wait for the initial advertisements to be displayed
    await waitFor(() => {
      expect(screen.getByText('Donation for Charity')).toBeInTheDocument();
    });

    // Mock fetch for the search results (empty)
    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({ advertisements: [] }),
    });

    // Find the search input and type a search term that won't match anything
    const searchInput = getByPlaceholderText('Buscar anúncios...');
    fireEvent.change(searchInput, { target: { value: 'NonExistentTerm' } });

    // Wait for the "no results" message to be displayed
    await waitFor(() => {
      expect(screen.getByText('Nenhum anúncio encontrado.')).toBeInTheDocument();
      expect(screen.queryByText('Donation for Charity')).not.toBeInTheDocument();
    });
  });
});
