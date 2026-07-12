"use client";

import { AxiosError, AxiosRequestConfig } from "axios";
import { useRouter } from "next/navigation";
import { Reducer, useEffect, useReducer, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  RESET,
  SET_DATA_LOADED,
  SET_ERROR,
  SET_LOADING,
} from "./api.action-types";
import ApiReducer from "./api.reducer";
import client from "@/lib/api/client";

interface ApiCallConfig {
  lazy?: boolean; // If true, call is triggered manually
  manual?: boolean; // If true, prevents automatic call on mount
}

// Backoff schedule (ms) for auto-retrying the initial GET fetch when the
// backend isn't reachable yet (e.g. right after `pnpm dev` starts).
const RETRY_DELAYS_MS = [500, 1000, 2000, 3000, 4000, 4000];

type RequestNonObjectValueType =
  | string
  | number
  | boolean
  | File
  | Array<string | number | File>
  | null;

type ValidationErrorMessageType = string[];

type ValidationErrorType<R> = R extends RequestNonObjectValueType
  ? ValidationErrorMessageType
  : R extends Array<object>
    ? Array<ValidationErrorType<R[number]>>
    : {
        [k in keyof R]: ValidationErrorType<R[k]>;
      };

type ValidationErrorsType<R> = {
  [key in keyof R]: R[key] extends Required<R[key]>
    ? ValidationErrorType<R[key]>
    : ValidationErrorType<R[key]> | undefined;
};

// Base return type
type BaseApiReturn<ResponseType, ErrorType> = {
  data: ResponseType | null;
  error: ErrorType | null;
  loading: boolean;
  loaded: boolean;
  refetch: (data?: any) => void;
  reset: () => void;
};

// Return type with callApi
type ApiReturnWithCallApi<ResponseType, RequestType, ErrorType> = BaseApiReturn<
  ResponseType,
  ErrorType
> & {
  callApi: (data?: RequestType) => Promise<void>;
};

// Function overloads
function useAPI<
  ResponseType,
  RequestType = {},
  ErrorType = {
    statusCode?: number;
    statusMessage?: string;
    code?: number;
    validationErrors?: ValidationErrorsType<RequestType>;
    status?: number;
    message?: string;
  },
>(
  config: AxiosRequestConfig<RequestType> & ApiCallConfig & { lazy: true },
): ApiReturnWithCallApi<ResponseType, RequestType, ErrorType>;

function useAPI<
  ResponseType,
  RequestType = {},
  ErrorType = {
    statusCode?: number;
    statusMessage?: string;
    code?: number;
    validationErrors?: ValidationErrorsType<RequestType>;
    status?: number;
    message?: string;
  },
>(
  config: AxiosRequestConfig<RequestType> &
    ApiCallConfig & {
      method: "POST" | "PUT" | "PATCH" | "DELETE";
    },
): ApiReturnWithCallApi<ResponseType, RequestType, ErrorType>;

function useAPI<
  ResponseType,
  RequestType = {},
  ErrorType = {
    statusCode?: number;
    statusMessage?: string;
    code?: number;
    validationErrors?: ValidationErrorsType<RequestType>;
    status?: number;
    message?: string;
  },
>(
  config: AxiosRequestConfig<RequestType> & ApiCallConfig,
): BaseApiReturn<ResponseType, ErrorType>;

// Implementation
function useAPI<
  ResponseType,
  RequestType = {},
  ErrorType = {
    statusCode?: number;
    statusMessage?: string;
    code?: number;
    validationErrors?: ValidationErrorsType<RequestType>;
    status?: number;
    message?: string;
  },
>({
  lazy = false,
  manual = false,
  method = "GET",
  data: requestData,
  headers: requestHeaders,
  ...rest
}: AxiosRequestConfig<RequestType> & ApiCallConfig) {
  const [state, dispatch] = useReducer<
    Reducer<
      {
        data: ResponseType | null;
        error: ErrorType | null;
        loading: boolean;
        loaded: boolean;
      },
      {
        action: string;
        payload?: Partial<{
          data: ResponseType | null;
          error: ErrorType | null;
          loading: boolean;
          loaded: boolean;
        }>;
      }
    >
  >(ApiReducer<ResponseType, ErrorType>, {
    loading: false,
    loaded: false,
    data: null,
    error: null,
  });

  const { token } = useAuth();
  const router = useRouter();

  const callApi = async (data?: RequestType) => {
    dispatch({ action: SET_LOADING, payload: { loading: true } });
    try {
      const res = await client.request({
        data: data ?? requestData,
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          ...requestHeaders,
        },
        method,
        ...rest,
      });
      dispatch({
        action: SET_DATA_LOADED,
        payload: { data: res.data as ResponseType },
      });
    } catch (err) {
      const error = err as AxiosError;

      // Handle network errors
      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        dispatch({
          action: SET_ERROR,
          payload: {
            error: {
              message:
                "Network Error: Could not connect to backend. Please ensure the backend server is running on http://localhost:3001",
              statusCode: 0,
            } as ErrorType,
          },
        });
      } else {
        dispatch({
          action: SET_ERROR,
          payload: {
            error:
              (error.response?.data as ErrorType) ||
              (error as unknown as ErrorType),
          },
        });
      }

      // Handle 401/403 errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Clear token and redirect to login
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("token");
          router.push("/login");
        }
      }
    } finally {
      dispatch({ action: SET_LOADING, payload: { loading: false } });
    }
  };

  // Refetch function for manual re-calling the API
  const refetch = (data?: RequestType) => {
    callApi(data ?? requestData);
  };

  // Automatic call if not lazy or manual
  useEffect(() => {
    if (lazy || manual || state.loading || state.loaded) {
      return;
    }
    if (method === "GET" && !state.loaded) {
      callApi(requestData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lazy, manual, state.loading, state.loaded, method]);

  const retryCountRef = useRef(0);
  useEffect(() => {
    if (state.data) retryCountRef.current = 0;
  }, [state.data]);

  // Auto-retry the initial GET fetch on a transient network error (e.g. the
  // backend is still booting up) so the page recovers on its own instead of
  // requiring a manual refresh.
  useEffect(() => {
    if (lazy || manual || method !== "GET" || !state.error) return;
    const isNetworkError =
      (state.error as { statusCode?: number })?.statusCode === 0;
    if (!isNetworkError || retryCountRef.current >= RETRY_DELAYS_MS.length) {
      return;
    }

    const delay = RETRY_DELAYS_MS[retryCountRef.current];
    retryCountRef.current += 1;
    const timer = setTimeout(() => {
      dispatch({
        action: RESET,
        payload: { data: null, error: null, loaded: false, loading: false },
      });
    }, delay);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.error, lazy, manual, method]);

  // Manual resetting of the states
  const reset = () => {
    dispatch({
      action: RESET,
      payload: {
        data: null,
        error: null,
        loaded: false,
        loading: false,
      },
    });
  };

  // Return callApi only if method is POST/PUT/PATCH/DELETE or lazy is true
  const shouldReturnCallApi =
    ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase()) || lazy;

  const baseReturn: BaseApiReturn<ResponseType, ErrorType> = {
    ...state,
    refetch,
    reset,
  };

  if (shouldReturnCallApi) {
    return {
      ...baseReturn,
      callApi,
    } as ApiReturnWithCallApi<ResponseType, RequestType, ErrorType>;
  }

  return baseReturn;
}

export default useAPI;
