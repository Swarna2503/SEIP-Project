// src/apis/document.ts
import { getAPIBaseURL } from "./config";
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

/**
 * 4) 通过后端 proxy 拿回 PDF 原始 bytes（ArrayBuffer）
 *    组件里就不用写 fetch(`${api}/pdf-proxy`) 了
 */
export async function fetchPdfProxy(applicationId: string): Promise<ArrayBuffer> {
  // 这里不用 fetchWrapper，因为返回的是二进制
  const baseURL = await getAPIBaseURL();
  const res = await fetch(
    `${baseURL}/api/applications/${applicationId}/pdf-proxy`,
    { credentials: "include" }
  );
  if (!res.ok) throw new Error(`Fetch PDF failed: ${res.status}`);
  return res.arrayBuffer();
}

export async function submitSignedPdf(applicationId: string, signedPdfBase64: string) {
  return fetchWrapper(
    `/applications/${applicationId}/sign`,
    {
      method: 'POST',
      body: JSON.stringify({ signedPdfBase64 })
    }
  );
}
