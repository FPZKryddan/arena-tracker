import { v4 as uuid } from "uuid";
import useContextIfDefined from "./useContextIfDefined";
import { ApiStatusMessagesContext } from "../contexts/ApiStatusMessagesContext";

function useFetchStatusTracker() {
  const {statusMessages, setStatusMessages} = useContextIfDefined(ApiStatusMessagesContext);

  const addStatusMessage = (message: string, totalTasks: number): string => {
    const id = uuid();
    setStatusMessages((prev) => [
      ...prev,
      {
        id,
        status: "NOT_STARTED",
        message,
        tasksCompleted: 0,
        totalTasks,
      },
    ]);
    return id;
  };

  const updateStatusMessage = (id: string, progress: number = 1): void => {
    setStatusMessages((prev) =>
      prev.map((statusMessage) => {
        if (statusMessage.id === id) {
          const newCompleted = statusMessage.tasksCompleted + progress;
          const isComplete =
            statusMessage.totalTasks !== -1 &&
            newCompleted >= statusMessage.totalTasks;

          return {
            ...statusMessage,
            status: isComplete ? "COMPLETED" : "IN_PROGRESS",
            tasksCompleted: newCompleted,
          };
        }
        return statusMessage;
      })
    );
  };

  const completeStatusMessage = (id: string): void => {
    setStatusMessages((prev) =>
      prev.map((statusMessage) =>
        statusMessage.id === id
          ? { ...statusMessage, status: "COMPLETED" }
          : statusMessage
      )
    );
  };

  const resetStatusMessages = (): void => {
    setStatusMessages([]);
  };

  const failStatusMessage = (id: string): void => {
    setStatusMessages((prev) =>
      prev.map((statusMessage) => {
        if (statusMessage.id === id) {
          return {
            ...statusMessage,
            status: "FAILED" as const,
          };
        }
        return statusMessage;
      })
    );
  };

  return {
    statusMessages,
    addStatusMessage,
    updateStatusMessage,
    completeStatusMessage,
    resetStatusMessages,
    failStatusMessage
  };
}

export default useFetchStatusTracker;
