import {
  RESET,
  SET_DATA_LOADED,
  SET_ERROR,
  SET_LOADING,
} from "./api.action-types";

interface ApiState<ResponseType, ErrorType> {
  data: ResponseType | null;
  error: ErrorType | null;
  loading: boolean;
  loaded: boolean;
}

interface ApiAction<ResponseType, ErrorType> {
  action: string;
  payload?: Partial<ApiState<ResponseType, ErrorType>>;
}

function ApiReducer<ResponseType, ErrorType>(
  state: ApiState<ResponseType, ErrorType>,
  action: ApiAction<ResponseType, ErrorType>
): ApiState<ResponseType, ErrorType> {
  switch (action.action) {
    case SET_LOADING:
      return {
        ...state,
        loading: action.payload?.loading ?? false,
      };
    case SET_DATA_LOADED:
      return {
        ...state,
        data: action.payload?.data ?? null,
        error: null,
        loaded: true,
        loading: false,
      };
    case SET_ERROR:
      return {
        ...state,
        error: action.payload?.error ?? null,
        loading: false,
        loaded: true,
      };
    case RESET:
      return {
        data: null,
        error: null,
        loading: false,
        loaded: false,
      };
    default:
      return state;
  }
}

export default ApiReducer;
