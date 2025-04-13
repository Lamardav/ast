import { IMetricState, metricInitialState } from "./metricState";
import { metricActions } from "./metricActions";
import { reducerWithInitialState } from "typescript-fsa-reducers";

export const metricReducer = reducerWithInitialState<IMetricState>(
  metricInitialState
)
  .case(metricActions.postMetricTags.started, (state) => ({
    ...state,
    isLoading: true,
    error: undefined,
  }))
  .case(metricActions.postMetricTags.failed, (state, { error }) => ({
    ...state,
    isLoading: false,
    error: error.Message,
  }))
  .case(metricActions.postMetricTags.done, (state) => ({
    ...state,
    isLoading: false,
  }));
