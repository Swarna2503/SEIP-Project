// src/apis/form.ts
import { fetchWrapper } from "./fetchWrapper";

export interface FormState {
  [key: string]: any;
}

export interface FormResult<T = any> {
  ok: boolean;
  status: number;
  data: T;
}

/**
 * 获取指定 application 的表单数据
 * - 如果后端无数据，会返回 `{}` 或者空对象
 */
export async function getFormState(
  applicationId: string
): Promise<FormResult<FormState>> {
  return fetchWrapper(`/applications/${applicationId}/formState`, {
    method: "GET",
  });
}

/**
 * 保存（或更新）指定 application 的表单数据
 * - 如果 application 还没有 form，后端会插入一条新纪录；否则会做更新
 */
export async function saveFormState(
  applicationId: string,
  formState: FormState
): Promise<FormResult<FormState>> {
  return fetchWrapper(`/applications/${applicationId}/formState`, {
    method: "POST",
    body: JSON.stringify(formState),
  });
}
