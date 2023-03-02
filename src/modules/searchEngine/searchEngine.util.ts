import { EVENT_TRACE_INDEX, INDEX_PREFIX } from "../../config";
import moment from "moment";

export function traceSearchingIndex(): string {
  return INDEX_PREFIX + "-" + EVENT_TRACE_INDEX + "*";
}

export function traceCreatingIndex(): string {
  return (
    INDEX_PREFIX +
    "-" +
    EVENT_TRACE_INDEX +
    "-" +
    moment(new Date()).format("YYYY.MM.DD")
  );
}
