// src/apis/document.ts
import { fetchWrapper } from "./fetchWrapper";

// 1) 上传 PDF
export async function uploadPdf(
  applicationId: string,
  pdfBase64: string
) {
  return fetchWrapper(
    `/applications/${applicationId}/upload`,
    {
      method: "POST",
      body: JSON.stringify({ pdfBase64 }),
    }
  );
}

// 2) 发送签字邀请
export async function requestSignature(
  applicationId: string,
  sellerEmail: string
) {
  return fetchWrapper(
    `/applications/${applicationId}/request-signature`,
    {
      method: "POST",
      body: JSON.stringify({ sellerEmail }),
    }
  );
}

// 3) 获取预览 URL
// export async function getPdfUrl(applicationId: string) {
//   return fetchWrapper(
//     `/applications/${applicationId}/pdf-url`,
//     { method: "GET" }
//   );
// }
export async function getPdfUrl(applicationId: string): Promise<{ data: { pdfUrl: string } }> {
  return fetchWrapper(
    `/applications/${applicationId}/pdf-url`,
    { method: "GET" }
  );
}

export async function submitSignedPdf(applicationId: string, signatures: { key: string, dataUrl: string }[]) {
  return fetchWrapper(
    `/applications/${applicationId}/sign`,
    {
      method: 'POST',
      body: JSON.stringify({ signatures })
    }
  );
}
