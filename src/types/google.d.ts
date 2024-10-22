interface Window {
  google: {
    accounts: {
      id: {
        initialize: (input: { client_id: string, callback: (response: any) => void }) => void;
        prompt: () => void;
      }
    }
  }
}
