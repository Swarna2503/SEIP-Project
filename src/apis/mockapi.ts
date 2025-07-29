// src/services/mockApi.ts
const API_DELAY = 800; // Simulate network delay

export const mockSendEmail = (emailData: any): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Mock API: Sending email to", emailData.to);
      resolve({ success: true });
    }, API_DELAY);
  });
};

export const mockPrepareSellerSignature = (
  signatureData: any
): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Mock API: Preparing seller signature for", signatureData.sellerEmail);
      
      // Generate a mock signing token
      const signatureToken = `sign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Generate mock signing link
      const signingLink = `${window.location.origin}/seller-sign/${signatureToken}`;
      
      resolve({
        success: true,
        signingLink,
        signatureId: signatureToken
      });
    }, API_DELAY);
  });
};