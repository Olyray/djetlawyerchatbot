import { generateMetadata } from '../page';
import { API_BASE_URL, APP_URL } from '../../../utils/config';
import { Metadata } from 'next';

// Mock fetch
global.fetch = jest.fn();

// Mock the SharedChatClient component
jest.mock('../SharedChatClient', () => ({
  SharedChatClient: () => null,
}));

describe('SharedChatPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock fetch to return valid chat data
    (global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({
        title: 'Test Chat Title',
      }),
    });
  });
  
  describe('generateMetadata', () => {
    test('should generate metadata with chat title from API', async () => {
      // Define search params with chat ID
      const params = {};
      const searchParams = { id: 'test-chat-id' };
      const parent = { title: 'Default Title' } as any;
      
      // Call generateMetadata
      const metadata = await generateMetadata({ params, searchParams }, parent);
      
      // Verify fetch was called with correct URL
      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/v1/chat/shared/test-chat-id`);
      
      // Verify metadata was generated correctly
      expect(metadata.title).toBe('Test Chat Title - dJetLawyer Chatbot');
      expect(metadata.description).toBe('View a shared conversation with dJet Lawyer, your AI legal assistant');
      
      // Cast to avoid TypeScript errors with array access
      const openGraphImages = metadata.openGraph?.images as Array<{ url: string }>;
      const twitterImages = metadata.twitter?.images as string[];
      
      // Verify OpenGraph metadata
      expect(metadata.openGraph?.title).toBe('Test Chat Title - dJetLawyer Chatbot');
      expect(metadata.openGraph?.url).toBe(`${APP_URL}/shared-chat?id=test-chat-id`);
      expect(openGraphImages?.[0]?.url).toBe('/dJetLawyer_logo.png');
      
      // Verify Twitter metadata
      expect(metadata.twitter?.title).toBe('Test Chat Title - dJetLawyer Chatbot');
      expect(twitterImages?.[0]).toBe('/dJetLawyer_logo.png');
    });
    
    test('should handle missing search params', async () => {
      // Define search params without chat ID
      const params = {};
      const searchParams = {};
      const parent = { title: 'Default Title' } as any;
      
      // Call generateMetadata
      const metadata = await generateMetadata({ params, searchParams }, parent);
      
      // Verify fetch was called with empty chat ID
      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/v1/chat/shared/`);
      
      // Verify metadata still contains default values even with missing ID
      expect(metadata.title).toContain('dJetLawyer Chatbot');
    });
    
    test('should handle API error gracefully', async () => {
      // Mock fetch to throw an error
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
      
      // Define search params with chat ID
      const params = {};
      const searchParams = { id: 'error-chat-id' };
      const parent = { title: 'Default Title' } as any;
      
      // Expect the function to throw an error
      await expect(generateMetadata({ params, searchParams }, parent))
        .rejects.toThrow('API Error');
    });
  });
}); 