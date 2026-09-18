import axios from "axios";

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export const getApiError = (
  error: unknown
): ApiError => {
  if (axios.isAxiosError(error)) {
    return {
      message:
        error.response?.data?.message ||
        "Something went wrong",

      statusCode: error.response?.status,

      errors: error.response?.data?.errors,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: "Something went wrong",
  };
};