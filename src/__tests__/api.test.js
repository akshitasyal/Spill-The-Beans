import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReviewService } from '../services/ReviewService';

describe('ReviewService Offline & API Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should fallback to localStorage when API fails', async () => {
    // Mock global fetch returning a failure status
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });
    vi.stubGlobal('fetch', fetchMock);

    // Seed mock reviews in localStorage
    const mockData = [{ id: 'rev-1', rating: 5, title: 'Best Coffee Ever!', body: 'Loved it!' }];
    localStorage.setItem('stb_admin_reviews', JSON.stringify(mockData));

    const result = await ReviewService.getReviews();

    expect(fetchMock).toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.data).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'rev-1', title: 'Best Coffee Ever!' }),
    ]));
  });

  it('should use live API data when available', async () => {
    const apiReviews = [{ id: 'rev-2', rating: 4, title: 'Great Taste', body: 'Very aromatic' }];
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: apiReviews }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await ReviewService.getReviews();

    expect(fetchMock).toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.data).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'rev-2', title: 'Great Taste', rating: 4 }),
    ]));
  });
});
